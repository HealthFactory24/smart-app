// db/repositories/auth.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { count, eq, inArray } from "drizzle-orm";
import { createInsertSchema } from "drizzle-orm/zod";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";
import {
	AccountCreateSchema,
	AccountUpdateSchema,
	ClinicMemberUpdateSchema,
	SessionCreateSchema,
	SessionUpdateSchema,
	UserCreateSchema,
	UserQuotaCreateSchema,
	UserQuotaUpdateSchema,
	UserSchema,
	UserUpdateSchema,
	VerificationCreateSchema
} from "@/db/zod";

const userIdSchema = z.object({ userId: z.string() });
const emailSchema = z.object({ email: z.string().email() });
const sessionTokenSchema = z.object({ token: z.string() });
const sessionIdSchema = z.object({ id: z.string() });
const accountProviderSchema = z.object({ providerId: z.string(), accountId: z.string() });
const userQuotaUserIdSchema = z.object({ userId: z.string() });
const deleteUserSchema = z.object({ id: z.string() });
const updateManyAccountsSchema = z.object({ ids: z.array(z.string()), data: z.record(z.string(), z.any()) });
const deleteAccountSchema = z.object({ id: z.string() });
const updateVerificationSchema = z.object({ id: z.string(), data: z.record(z.string(), z.any()) });
const updateManyVerificationsSchema = z.object({ ids: z.array(z.string()), data: z.record(z.string(), z.any()) });
const updateTwoFactorSchema = z.object({ id: z.string(), data: z.record(z.string(), z.any()) });
const updateManyTwoFactorsSchema = z.object({ ids: z.array(z.string()), data: z.record(z.string(), z.any()) });
const deleteTwoFactorSchema = z.object({ id: z.string() });
const createUserQuotaFromInputSchema = z.object({ data: z.record(z.string(), z.any()) });
const createManyUserQuotasSchema = z.object({ data: z.array(z.record(z.string(), z.any())) });
const updateManyUserQuotasSchema = z.object({ ids: z.array(z.string()), data: z.record(z.string(), z.any()) });
const deleteUserQuotaSchema = z.object({ id: z.string() });
const TwoFactorCreateSchema = createInsertSchema(schema.twoFactor);
const createManyTwoFactorsSchema = z.array(TwoFactorCreateSchema);
// =======================
// Schema Validators
// =======================

// =======================
// User Server Functions
// =======================

const getUserById = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await db.query.user.findFirst({
				where: { id: userId }
			});
		} catch (error) {
			console.error("Error getting user by ID:", error);
			throw new Error("Failed to get user");
		}
	});

const getUserByEmail = createServerFn({ method: "GET" })
	.validator(emailSchema)
	.handler(async ctx => {
		try {
			const { email } = ctx.data;
			return await db.query.user.findFirst({
				where: { email }
			});
		} catch (error) {
			console.error("Error getting user by email:", error);
			throw new Error("Failed to get user");
		}
	});

const getUserWithRole = createServerFn({ method: "GET" })
	.validator(UserSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await db.query.user.findFirst({
				where: { id },
				columns: { role: true, clinicId: true }
			});
		} catch (error) {
			console.error("Error getting user with role:", error);
			throw new Error("Failed to get user role");
		}
	});

const createUser = createServerFn({ method: "POST" })
	.validator(UserCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.user)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating user:", error);
			throw new Error("Failed to create user");
		}
	});

const updateUser = createServerFn({ method: "POST" })
	.validator(UserUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			if (!id) {
				throw new Error("User ID is required for update");
			}
			const [result] = await db
				.update(schema.user)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.user.id, id as string))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating user:", error);
			throw new Error("Failed to update user");
		}
	});

const updateUserClinicId = createServerFn({ method: "POST" })
	.validator(ClinicMemberUpdateSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const [result] = await db
				.update(schema.user)
				.set({ clinicId, updatedAt: new Date() })
				.where(eq(schema.user.id, userId as string))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating user clinic ID:", error);
			throw new Error("Failed to update user clinic");
		}
	});

const getAdminCount = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const result = await db.select({ count: count() }).from(schema.user).where(eq(schema.user.role, "admin"));
		return result[0]?.count ?? 0;
	} catch (error) {
		console.error("Error getting admin count:", error);
		throw new Error("Failed to get admin count");
	}
});

// =======================
// Session Server Functions
// =======================

const createSession = createServerFn({ method: "POST" })
	.validator(z.object({ data: SessionCreateSchema }))
	.handler(async ctx => {
		try {
			const [result] = await db.insert(schema.session).values(ctx.data.data).returning();
			return result;
		} catch (error) {
			console.error("Error creating session:", error);
			throw new Error("Failed to create session");
		}
	});

const getSessionByToken = createServerFn({ method: "GET" })
	.validator(sessionTokenSchema)
	.handler(async ctx => {
		try {
			const { token } = ctx.data;
			return await db.query.session.findFirst({
				where: { token }
			});
		} catch (error) {
			console.error("Error getting session by token:", error);
			throw new Error("Failed to get session");
		}
	});

const deleteSession = createServerFn({ method: "POST" })
	.validator(sessionIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.session).where(eq(schema.session.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting session:", error);
			throw new Error("Failed to delete session");
		}
	});

// =======================
// Account Server Functions
// =======================

const createAccount = createServerFn({ method: "POST" })
	.validator(z.object({ data: AccountCreateSchema }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const [result] = await db
				.insert(schema.account)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating account:", error);
			throw new Error("Failed to create account");
		}
	});

const getAccountByProvider = createServerFn({ method: "GET" })
	.validator(accountProviderSchema)
	.handler(async ctx => {
		try {
			const { providerId, accountId } = ctx.data;
			return await db.query.account.findFirst({
				where: { providerId, accountId }
			});
		} catch (error) {
			console.error("Error getting account by provider:", error);
			throw new Error("Failed to get account");
		}
	});
const verificationIdentifierSchema = z.object({ identifier: z.string() });
const verificationIdSchema = z.object({ id: z.string() });
const twoFactorUserIdSchema = z.object({ userId: z.string() });
const inviteCodeSchema = z.object({ code: z.string() });
const markInviteSchema = z.object({ code: z.string(), userId: z.string() });

// =======================
// Verification & 2FA Server Functions
// =======================

const getVerificationByIdentifier = createServerFn({ method: "GET" })
	.validator(verificationIdentifierSchema)
	.handler(async ctx => {
		try {
			const { identifier } = ctx.data;
			return await db.query.verification.findFirst({
				where: { identifier }
			});
		} catch (error) {
			console.error("Error getting verification:", error);
			throw new Error("Failed to get verification");
		}
	});

const deleteVerification = createServerFn({ method: "POST" })
	.validator(verificationIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.verification).where(eq(schema.verification.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting verification:", error);
			throw new Error("Failed to delete verification");
		}
	});

const getTwoFactorByUserId = createServerFn({ method: "GET" })
	.validator(twoFactorUserIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await db.query.twoFactor.findFirst({
				where: { userId }
			});
		} catch (error) {
			console.error("Error getting two factor:", error);
			throw new Error("Failed to get two factor");
		}
	});

// =======================
// Invite Server Functions
// =======================

const getInviteByCode = createServerFn({ method: "GET" })
	.validator(inviteCodeSchema)
	.handler(async ctx => {
		try {
			const { code } = ctx.data;
			return await db.query.invite.findFirst({
				where: { code }
			});
		} catch (error) {
			console.error("Error getting invite:", error);
			throw new Error("Failed to get invite");
		}
	});

const markInviteAsUsed = createServerFn({ method: "POST" })
	.validator(markInviteSchema)
	.handler(async ctx => {
		try {
			const { code, userId } = ctx.data;
			const [result] = await db
				.update(schema.invite)
				.set({ usedBy: userId, usedAt: new Date() })
				.where(eq(schema.invite.code, code))
				.returning();
			return result;
		} catch (error) {
			console.error("Error marking invite as used:", error);
			throw new Error("Failed to mark invite as used");
		}
	});

// =======================
// User Quota Server Functions
// =======================

const getUserQuota = createServerFn({ method: "GET" })
	.validator(userQuotaUserIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await db.query.userQuota.findFirst({
				where: { userId }
			});
		} catch (error) {
			console.error("Error getting user quota:", error);
			throw new Error("Failed to get user quota");
		}
	});

const createUserQuota = createServerFn({ method: "POST" })
	.validator(UserQuotaCreateSchema)
	.handler(async ctx => {
		try {
			const { ...data } = ctx.data;
			const [result] = await db
				.insert(schema.userQuota)
				.values({
					...data,
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating user quota:", error);
			throw new Error("Failed to create user quota");
		}
	});

const updateUserQuota = createServerFn({ method: "POST" })
	.validator(UserQuotaUpdateSchema)
	.handler(async ctx => {
		try {
			const { userId, ...data } = ctx.data;
			const [result] = await db
				.update(schema.userQuota)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.userQuota.userId, userId ?? ""))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating user quota:", error);
			throw new Error("Failed to update user quota");
		}
	});

const getOrCreateUserQuota = createServerFn({ method: "GET" })
	.validator(userQuotaUserIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			let quota = await db.query.userQuota.findFirst({
				where: { userId }
			});

			if (!quota) {
				const [newQuota] = await db
					.insert(schema.userQuota)
					.values({
						userId,
						quota: 100,
						usedQuota: 0,
						fileCount: 0,
						fileCountQuota: 1000,
						inviteCount: 0,
						inviteQuota: 10,
						updatedAt: new Date()
					})
					.returning();
				quota = newQuota;
			}

			return quota;
		} catch (error) {
			console.error("Error getting or creating user quota:", error);
			throw new Error("Failed to get or create user quota");
		}
	});

const getUserWithAllRelations = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			const user = await db.query.user.findFirst({
				where: { id: userId ?? "" },
				with: {
					folders: {
						where: { id: undefined } // Get root folders only
					},
					clinicMemberships: {
						where: {
							userId
						}
					},
					doctorProfile: true,
					staffProfile: true,
					patientProfile: {
						with: {
							appointments: {
								where: { isDeleted: false },
								orderBy: { appointmentDate: "desc" },
								limit: 5
							}
						}
					},
					notifications: {
						where: { status: "unread" },
						orderBy: { createdAt: "desc" }
					}
				}
			});

			return JSON.parse(JSON.stringify(user));
		} catch (error) {
			console.error("Error getting user with relations:", error);
			throw new Error("Failed to get user details");
		}
	});

// =======================
// Bulk Operations Server Functions
// =======================

const createManyUsers = createServerFn({ method: "POST" })
	.validator(z.object({ data: UserCreateSchema.array() }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const usersWithTimestamps = data.map(user => ({
				...user,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.user).values(usersWithTimestamps).returning();
		} catch (error) {
			console.error("Error creating many users:", error);
			throw new Error("Failed to create multiple users");
		}
	});

const updateManyUsers = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: UserUpdateSchema }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db.update(schema.user).set(updateData).where(inArray(schema.user.id, ids)).returning();
		} catch (error) {
			console.error("Error updating many users:", error);
			throw new Error("Failed to update multiple users");
		}
	});

const deleteUser = createServerFn({ method: "POST" })
	.validator(deleteUserSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.user).where(eq(schema.user.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting user:", error);
			throw new Error("Failed to delete user");
		}
	});

const createManySessions = createServerFn({ method: "POST" })
	.validator(SessionCreateSchema.array())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const sessionsWithTimestamps = data.map(session => ({
				...session,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.session).values(sessionsWithTimestamps).returning();
		} catch (error) {
			console.error("Error creating many sessions:", error);
			throw new Error("Failed to create multiple sessions");
		}
	});

const updateSession = createServerFn({ method: "POST" })
	.validator(SessionUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			const [result] = await db
				.update(schema.session)
				.set(updateData)
				.where(eq(schema.session.id, id ?? ""))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating session:", error);
			throw new Error("Failed to update session");
		}
	});

const updateManySessions = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: SessionUpdateSchema }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db.update(schema.session).set(updateData).where(inArray(schema.session.id, ids)).returning();
		} catch (error) {
			console.error("Error updating many sessions:", error);
			throw new Error("Failed to update multiple sessions");
		}
	});

const createManyAccounts = createServerFn({ method: "POST" })
	.validator(AccountCreateSchema.array())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const accountsWithTimestamps = data.map(account => ({
				...account,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.account).values(accountsWithTimestamps).returning();
		} catch (error) {
			console.error("Error creating many accounts:", error);
			throw new Error("Failed to create multiple accounts");
		}
	});

const updateAccount = createServerFn({ method: "POST" })
	.validator(AccountUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			const [result] = await db
				.update(schema.account)
				.set(updateData)
				.where(eq(schema.account.id, id ?? ""))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating account:", error);
			throw new Error("Failed to update account");
		}
	});

const updateManyAccounts = createServerFn({ method: "POST" })
	.validator(updateManyAccountsSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db.update(schema.account).set(updateData).where(inArray(schema.account.id, ids)).returning();
		} catch (error) {
			console.error("Error updating many accounts:", error);
			throw new Error("Failed to update multiple accounts");
		}
	});

const deleteAccount = createServerFn({ method: "POST" })
	.validator(deleteAccountSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.account).where(eq(schema.account.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting account:", error);
			throw new Error("Failed to delete account");
		}
	});

const createVerification = createServerFn({ method: "POST" })
	.validator(VerificationCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.verification)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating verification:", error);
			throw new Error("Failed to create verification");
		}
	});

const createManyVerifications = createServerFn({ method: "POST" })
	.validator(z.object({ data: VerificationCreateSchema.array() }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const verificationsWithTimestamps = data.map(verification => ({
				...verification,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.verification).values(verificationsWithTimestamps).returning();
		} catch (error) {
			console.error("Error creating many verifications:", error);
			throw new Error("Failed to create multiple verifications");
		}
	});

const updateVerification = createServerFn({ method: "POST" })
	.validator(updateVerificationSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			const [result] = await db
				.update(schema.verification)
				.set(updateData)
				.where(eq(schema.verification.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating verification:", error);
			throw new Error("Failed to update verification");
		}
	});

const updateManyVerifications = createServerFn({ method: "POST" })
	.validator(updateManyVerificationsSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db
				.update(schema.verification)
				.set(updateData)
				.where(inArray(schema.verification.id, ids))
				.returning();
		} catch (error) {
			console.error("Error updating many verifications:", error);
			throw new Error("Failed to update multiple verifications");
		}
	});

const createTwoFactor = createServerFn({ method: "POST" })
	.validator(TwoFactorCreateSchema)
	.handler(async ctx => {
		try {
			const { ...data } = ctx.data;
			const [result] = await db.insert(schema.twoFactor).values(data).returning();
			return result;
		} catch (error) {
			console.error("Error creating two factor:", error);
			throw new Error("Failed to create two factor");
		}
	});

const createManyTwoFactors = createServerFn({ method: "POST" })
	.validator(createManyTwoFactorsSchema)
	.handler(async ctx => {
		try {
			const { ...data } = ctx.data;
			return await db.insert(schema.twoFactor).values(data).returning();
		} catch (error) {
			console.error("Error creating many two factors:", error);
			throw new Error("Failed to create multiple two factors");
		}
	});

const updateTwoFactor = createServerFn({ method: "POST" })
	.validator(updateTwoFactorSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db.update(schema.twoFactor).set(data).where(eq(schema.twoFactor.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error updating two factor:", error);
			throw new Error("Failed to update two factor");
		}
	});

const updateManyTwoFactors = createServerFn({ method: "POST" })
	.validator(updateManyTwoFactorsSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			return await db.update(schema.twoFactor).set(data).where(inArray(schema.twoFactor.id, ids)).returning();
		} catch (error) {
			console.error("Error updating many two factors:", error);
			throw new Error("Failed to update multiple two factors");
		}
	});

const deleteTwoFactor = createServerFn({ method: "POST" })
	.validator(deleteTwoFactorSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.twoFactor).where(eq(schema.twoFactor.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting two factor:", error);
			throw new Error("Failed to delete two factor");
		}
	});

const createUserQuotaFromInput = createServerFn({ method: "POST" })
	.validator(createUserQuotaFromInputSchema)
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const [result] = await db
				.insert(schema.userQuota)
				.values({
					userId: data.userId,
					...data,
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating user quota:", error);
			throw new Error("Failed to create user quota");
		}
	});

const createManyUserQuotas = createServerFn({ method: "POST" })
	.validator(createManyUserQuotasSchema)
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const quotasWithTimestamps = data.map(quota => ({
				...quota,
				userId: quota.userId,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.userQuota).values(quotasWithTimestamps).returning();
		} catch (error) {
			console.error("Error creating many user quotas:", error);
			throw new Error("Failed to create multiple user quotas");
		}
	});

const updateManyUserQuotas = createServerFn({ method: "POST" })
	.validator(updateManyUserQuotasSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db
				.update(schema.userQuota)
				.set(updateData)
				.where(inArray(schema.userQuota.userId, ids))
				.returning();
		} catch (error) {
			console.error("Error updating many user quotas:", error);
			throw new Error("Failed to update multiple user quotas");
		}
	});

const deleteUserQuota = createServerFn({ method: "POST" })
	.validator(deleteUserQuotaSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.userQuota).where(eq(schema.userQuota.userId, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting user quota:", error);
			throw new Error("Failed to delete user quota");
		}
	});

export {
	createAccount,
	createManyAccounts,
	createManySessions,
	createManyTwoFactors,
	createManyUserQuotas,
	createManyUsers,
	createManyVerifications,
	createSession,
	createTwoFactor,
	createUser,
	createUserQuota,
	createUserQuotaFromInput,
	createVerification,
	deleteAccount,
	deleteSession,
	deleteTwoFactor,
	deleteUser,
	deleteUserQuota,
	deleteVerification,
	getAccountByProvider,
	getAdminCount,
	getInviteByCode,
	getOrCreateUserQuota,
	getSessionByToken,
	getTwoFactorByUserId,
	getUserByEmail,
	getUserById,
	getUserQuota,
	getUserWithAllRelations,
	getUserWithRole,
	getVerificationByIdentifier,
	markInviteAsUsed,
	updateAccount,
	updateManyAccounts,
	updateManySessions,
	updateManyTwoFactors,
	updateManyUserQuotas,
	updateManyUsers,
	updateManyVerifications,
	updateSession,
	updateTwoFactor,
	updateUser,
	updateUserClinicId,
	updateUserQuota,
	updateVerification
};
