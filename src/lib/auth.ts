import { APIError, betterAuth, env, generateId, isProduction } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin, customSession, openAPI, twoFactor } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { count, eq } from "drizzle-orm";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";
import { ac, admin as adminRole, doctor, patient, staff } from "./permissions";
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg" // or "mysql", "sqlite"
	}),
	appName: "Clinic",
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		minPasswordLength: 8,
		maxPasswordLength: 128
	},
	user: {
		additionalFields: {
			role: {
				type: ["doctor", "staff", "patient", "admin"],
				required: false,
				defaultValue: "doctor"
			},
			clinicId: { type: "string", required: false, input: true },
			address: { type: "string", required: false, input: true },
			phone: { type: "string", required: false, input: true }
		}
	},

	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					const [signUpSetting, inviteSetting] = await Promise.all([
						db.query.configStore.findFirst({ where: { key: "sign_up_enabled" } }),
						db.query.configStore.findFirst({ where: { key: "invite_required" } })
					]);

					const isEnabled = signUpSetting?.value !== "false";
					const isInviteRequired = inviteSetting?.value === "true";

					if (isEnabled === false) {
						throw new APIError("FORBIDDEN", {
							message: "User sign-up is disabled at the moment."
						});
					}

					if (isInviteRequired === true) {
						const invite = ctx?.body?.invite as string | undefined;
						if (!invite) {
							throw new APIError("BAD_REQUEST", {
								message: "Invite code is required for registration."
							});
						}

						const inviteRecord = await db.query.invite.findFirst({
							where: { code: invite }
						});

						if (
							!inviteRecord ||
							(inviteRecord.expiresAt && inviteRecord.expiresAt < new Date()) ||
							inviteRecord.usedBy !== null
						) {
							throw new APIError("BAD_REQUEST", {
								message: "Invite code is invalid or has expired."
							});
						}
					}

					const adminCountResult = await db
						.select({ value: count() })
						.from(schema.user)
						.where(eq(schema.user.role, "admin"));
					const adminCount = adminCountResult[0]?.value ?? 0;
					const isOnboarded = adminCount > 0;
					const role = isOnboarded ? "patient" : "admin";

					return {
						data: { ...user, role }
					};
				},

				after: async (user, ctx) => {
					try {
						const userRole = user.role as schema.UserRole;
						const clinicData = ctx?.body?.clinicData as { name?: string; address?: string } | undefined;
						const inviteCode = ctx?.body?.invite as string | undefined;

						// Find or create clinic
						let clinicId: string;
						if (clinicData?.name) {
							const [newClinic] = await db
								.insert(schema.clinic)
								.values({
									id: generateId(),
									name: clinicData.name,
									address: clinicData.address ?? ""
								})
								.returning();
							clinicId = newClinic.id;
						} else {
							const defaultClinic = await db.query.clinic.findFirst();
							if (defaultClinic) {
								clinicId = defaultClinic.id;
							} else {
								const [newClinic] = await db
									.insert(schema.clinic)
									.values({
										id: generateId(),
										name: "Default Clinic",
										address: "Default Address"
									})
									.returning();
								clinicId = newClinic.id;
							}
						}

						// Connect user to clinic
						await db.insert(schema.clinicMember).values({
							userId: user.id,
							clinicId,
							role: userRole as "admin" | "doctor" | "staff" | "patient"
						});

						// Update user with clinic ID
						await db.update(schema.user).set({ clinicId }).where(eq(schema.user.id, user.id));

						// Create role-specific records
						const roleRecordData = {
							userId: user.id,
							email: user.email,
							clinicId
						};

						if ((userRole as string) === "doctor") {
							await db.insert(schema.doctor).values({
								id: generateId(),
								...roleRecordData,
								role: "doctor",
								name: user.name || "",
								specialty: "General"
							});
						} else if ((userRole as string) === "patient") {
							const [firstName, ...lastParts] = (user.name || "").split(" ");
							await db.insert(schema.patient).values({
								id: generateId(),
								...roleRecordData,
								role: "patient",
								firstName: firstName ?? "",
								lastName: lastParts.join(" ") || "",
								dateOfBirth: new Date(0)
							});
						}

						// Mark invite as used
						if (inviteCode) {
							await db
								.update(schema.invite)
								.set({ usedBy: user.id })
								.where(eq(schema.invite.code, inviteCode));
						}

						// Set onboarding flag if first admin
						if ((userRole as string) === "admin") {
							const adminCountResult = await db
								.select({ value: count() })
								.from(schema.user)
								.where(eq(schema.user.role, "admin"));
							if ((adminCountResult[0]?.value ?? 0) === 1) {
								await db
									.insert(schema.configStore)
									.values({ key: "admin_onboarded", value: "true" })
									.onConflictDoUpdate({ target: schema.configStore.key, set: { value: "true" } });
							}
						}

						// Create user quota using settings service
						const [q, fq, iq] = await Promise.all([
							db.query.configStore.findFirst({ where: { key: `quota_${userRole}` } }),
							db.query.configStore.findFirst({ where: { key: `quota_${userRole}` } }),
							db.query.configStore.findFirst({ where: { key: `file_quota_${userRole}` } }),
							db.query.configStore.findFirst({ where: { key: `invite_quota_${userRole}` } })
						]);

						await db.insert(schema.userQuota).values({
							userId: user.id,
							quota: Number.parseInt(q?.value ?? "104857600", 10), // 100MB default
							fileCountQuota: Number.parseInt(fq?.value ?? "50", 10),
							inviteQuota: Number.parseInt(iq?.value ?? "0", 10)
						});
					} catch (error) {
						console.error(`Post-create error for ${user.email}:`, error);
					}
				}
			},

			delete: {
				before: async user => {
					try {
						await db.transaction(async tx => {
							// Delete role-specific records
							await tx.delete(schema.doctor).where(eq(schema.doctor.userId, user.id));
							await tx.delete(schema.staff).where(eq(schema.staff.userId, user.id));
							await tx.delete(schema.patient).where(eq(schema.patient.userId, user.id));

							// Delete clinic memberships
							await tx.delete(schema.clinicMember).where(eq(schema.clinicMember.userId, user.id));

							// Delete quota
							await tx.delete(schema.userQuota).where(eq(schema.userQuota.userId, user.id));
						});
					} catch (error) {
						console.error(`Pre-delete cleanup error for ${user.email}:`, error);
						// We don't necessarily want to block deletion if cleanup fails,
						// but you could throw an APIError here if it's critical.
					}
				}
			}
		}
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60
		}
	},
	experimental: {
		joins: false
	},

	hooks: {
		before: createAuthMiddleware(async ctx => {
			if (ctx.path === "/sign-up/email") {
				const signUpSetting = await db.query.configStore.findFirst({ where: { key: "sign_up_enabled" } });
				if (signUpSetting?.value === "false") {
					throw new APIError("FORBIDDEN", {
						message: "User sign-up is disabled at the moment."
					});
				}
			}
		})
	},

	plugins: [
		admin({
			ac,
			roles: {
				admin: adminRole,
				doctor,
				staff,
				patient
			}
		}),
		openAPI({
			theme: "deepSpace"
		}),
		twoFactor(),
		customSession(async ({ user, session }) => {
			const [fullUser, userQuota, clinicsList] = await Promise.all([
				db.query.user.findFirst({ where: { id: user.id } }),
				db.query.userQuota.findFirst({ where: { userId: user.id } }),
				db
					.select({
						id: schema.clinic.id,
						name: schema.clinic.name,
						email: schema.clinic.email,
						role: schema.clinicMember.role,
						createdAt: schema.clinicMember.createdAt
					})
					.from(schema.clinicMember)
					.innerJoin(schema.clinic, eq(schema.clinicMember.clinicId, schema.clinic.id))
					.where(eq(schema.clinicMember.userId, user.id))
			]);

			const primaryClinic = fullUser?.clinicId
				? await db.query.clinic.findFirst({ where: { id: fullUser.clinicId } })
				: null;

			return {
				user: {
					...user,
					role: fullUser?.role,
					clinicId: fullUser?.clinicId as string,
					phone: fullUser?.phone as string,
					address: fullUser?.address as string,
					quota: userQuota,
					primaryClinic: primaryClinic ?? undefined,
					clinics: clinicsList.map(cm => ({
						...cm,
						memberRole: cm.role,
						joinedAt: cm.createdAt,
						isPrimary: cm.id === fullUser?.clinicId
					}))
				},
				session
			};
		}),
		tanstackStartCookies()
	],
	advanced: {
		cookiePrefix: "__bauth",
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "true-client-ip"]
		},
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: isProduction ? "strict" : "none",
			secure: true
		},
		telemetry: {
			enabled: false
		},
		database: {
			generateId: () => generateId()
		}
	}
});

export type AuthSession = typeof auth.$Infer.Session;
export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
export type Role = AuthUser["role"];
export type Auth = typeof auth;
