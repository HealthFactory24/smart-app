// db/repositories/system.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, eq, like, or, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

// =======================
// Zod Validators
// =======================

type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | Array<JSONValue>;

interface SerializableNotification {
	id: string;
	userId: string;
	clinicId: string;
	title: string;
	body: string;
	type: string | null;
	status: "read" | "unread";
	priority: "high" | "medium" | "low" | null;
	createdAt: Date;
	updatedAt: Date;
	actions: { label: string; href: string; payload?: Record<string, JSONValue> }[] | null;
	metadata: Record<string, JSONValue> | null;
}

const searchFilesSchema = z.object({
	userId: z.string(),
	searchTerm: z.string()
});

const advancedSearchSchema = z.object({
	clinicId: z.string().optional(),
	patientName: z.string().optional(),
	doctorName: z.string().optional(),
	dateFrom: z.date().optional(),
	dateTo: z.date().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
});

const notificationsListSchema = z.object({
	userId: z.string(),
	clinicId: z.string().optional(),
	status: z.enum(["all", "read", "unread"]).default("all"),
	type: z.string().nullable().optional(),
	search: z.string().optional(),
	limit: z.number().default(20),
	offset: z.number().default(0)
});

const markNotificationReadSchema = z.object({
	notificationId: z.string(),
	userId: z.string().optional()
});

const markAllReadSchema = z.object({
	userId: z.string(),
	clinicId: z.string().optional()
});

const deleteNotificationSchema = z.object({
	notificationId: z.string(),
	userId: z.string()
});

const clearNotificationsSchema = z.object({
	userId: z.string(),
	clinicId: z.string().optional()
});

const clinicAnalyticsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

// const checkVitalSignsAccessSchema = z.object({
// 	userId: z.string(),
// 	patientId: z.string()
// });

// const checkDoctorAccessSchema = z.object({
// 	doctorId: z.string(),
// 	userId: z.string(),
// 	clinicId: z.string().optional()
// });

const createPaymentSchema = z.object({
	id: z.string().optional(),
	patientId: z.string(),
	clinicId: z.string(),
	appointmentId: z.string().optional(),
	amount: z.number(),
	totalAmount: z.number().optional(),
	status: z.enum(["PAID", "UNPAID", "PENDING", "REFUNDED", "PARTIAL"]).default("PENDING"),
	billDate: z.date().optional(),
	paymentMethod: z.enum(["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"]).optional(),
	notes: z.string().optional(),
	discount: z.number().optional(),
	insuranceId: z.string().optional(),
	receiptNumber: z.number().optional()
});

const invoiceSchema = z.object({
	id: z.string().optional(),
	patientId: z.string(),
	clinicId: z.string(),
	appointmentId: z.string().optional(),
	items: z.array(
		z.object({
			description: z.string(),
			amount: z.number()
		})
	),
	notes: z.string().optional()
});

const processPaymentSchema = z.object({
	paymentId: z.string(),
	amountPaid: z.number(),
	paymentMethod: z.enum(["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"]),
	notes: z.string().optional()
});

const setConfigSchema = z.object({
	key: z.string(),
	value: z.string()
});

const setConfigsSchema = z.object({
	configs: z.array(
		z.object({
			key: z.string(),
			value: z.string()
		})
	)
});

const initializeConfigsSchema = z.object({
	defaults: z.array(
		z.object({
			key: z.string(),
			value: z.string()
		})
	)
});

// =======================
// Server Functions
// =======================

const searchFiles = createServerFn({ method: "POST" })
	.validator(searchFilesSchema)
	.handler(async ctx => {
		try {
			const { userId, searchTerm } = ctx.data;

			// ✅ FIX: Use object syntax for RQB v2
			const files = await db.query.file.findMany({
				where: {
					userId: userId,
					searchText: { like: `%${searchTerm}%` }
				},
				orderBy: { createdAt: "desc" }
			});

			return files;
		} catch (error) {
			console.error("Error searching files:", error);
			throw new Error("Failed to search files");
		}
	});

const advancedSearch = createServerFn({ method: "POST" })
	.validator(advancedSearchSchema)
	.handler(async ctx => {
		try {
			const { clinicId, patientName, doctorName, dateFrom, dateTo, status } = ctx.data;

			// Build where conditions
			const where: Record<string, unknown> = {
				isDeleted: false,
				deletedAt: null
			};

			if (clinicId) where.clinicId = clinicId;
			if (status) where.status = status;
			if (dateFrom && dateTo) {
				where.appointmentDate = { gte: dateFrom, lte: dateTo };
			}

			// ✅ FIX: Build with clause with conditional includes
			const withClause: Record<string, unknown> = {
				service: true,
				bills: true
			};

			if (patientName) {
				withClause.patient = {
					where: {
						OR: [{ firstName: { like: `%${patientName}%` } }, { lastName: { like: `%${patientName}%` } }]
					}
				};
			} else {
				withClause.patient = true;
			}

			if (doctorName) {
				withClause.doctor = {
					where: {
						name: { like: `%${doctorName}%` }
					}
				};
			} else {
				withClause.doctor = true;
			}

			const appointments = await db.query.appointment.findMany({
				where,
				with: withClause,
				orderBy: { appointmentDate: "desc" }
			});

			return appointments;
		} catch (error) {
			console.error("Error in advanced search:", error);
			throw new Error("Failed to perform advanced search");
		}
	});

const getUserNotifications = createServerFn({ method: "GET" })
	.validator(
		z.object({
			userId: z.string(),
			clinicId: z.string().optional(),
			limit: z.number().default(5),
			offset: z.number().default(0)
		})
	)
	.handler(async ctx => {
		try {
			const { userId, clinicId, limit, offset } = ctx.data;

			// ✅ RQB v2 object syntax
			const where: Record<string, unknown> = { userId };
			if (clinicId) where.clinicId = clinicId;

			const notifications = await db.query.notification.findMany({
				where,
				orderBy: { createdAt: "desc" },
				limit,
				offset
			});

			return notifications as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error getting user notifications:", error);
			throw new Error("Failed to get notifications");
		}
	});

const listNotifications = createServerFn({ method: "POST" })
	.validator(notificationsListSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId, status, type, search, limit, offset } = ctx.data;

			// ✅ Build where clause using RQB v2 object syntax
			const where: Record<string, unknown> = { userId };

			if (clinicId) where.clinicId = clinicId;

			if (status === "unread") where.status = "unread";
			if (status === "read") where.status = "read";
			if (type) where.type = type;

			// ✅ Handle search with OR condition
			if (search) {
				where.OR = [{ body: { like: `%${search}%` } }, { title: { like: `%${search}%` } }];
			}

			const totalResult = await db
				.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
				.from(schema.notification)
				.where(
					and(
						eq(schema.notification.userId, userId),
						clinicId ? eq(schema.notification.clinicId, clinicId) : undefined,
						status === "unread" ? eq(schema.notification.status, "unread") : undefined,
						status === "read" ? eq(schema.notification.status, "read") : undefined,
						type ? eq(schema.notification.type, type) : undefined,
						search
							? or(
									like(schema.notification.body, `%${search}%`),
									like(schema.notification.title, `%${search}%`)
								)
							: undefined
					)
				);

			const unreadResult = await db
				.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
				.from(schema.notification)
				.where(
					and(
						eq(schema.notification.userId, userId),
						clinicId ? eq(schema.notification.clinicId, clinicId) : undefined,
						eq(schema.notification.status, "unread")
					)
				);

			// ✅ Get paginated items using RQB v2
			const items = await db.query.notification.findMany({
				where,
				orderBy: { createdAt: "desc" },
				limit,
				offset
			});

			return {
				items: items as unknown as SerializableNotification[],
				total: Number(totalResult[0]?.count ?? 0),
				unreadCount: Number(unreadResult[0]?.count ?? 0)
			};
		} catch (error) {
			console.error("Error listing notifications:", error);
			throw new Error("Failed to list notifications");
		}
	});

const markNotificationsAsRead = createServerFn({ method: "POST" })
	.validator(markNotificationReadSchema)
	.handler(async ctx => {
		try {
			const { notificationId, userId } = ctx.data;

			const result = await db
				.update(schema.notification)
				.set({ status: "read", updatedAt: new Date() })
				.where(
					and(
						eq(schema.notification.id, notificationId),
						userId ? eq(schema.notification.userId, userId) : sql`TRUE`
					)
				)
				.returning();

			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error marking notification as read:", error);
			throw new Error("Failed to mark notification as read");
		}
	});

const markAllNotificationsAsRead = createServerFn({ method: "POST" })
	.validator(markAllReadSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;

			const conditions = [eq(schema.notification.userId, userId), eq(schema.notification.status, "unread")];
			if (clinicId) conditions.push(eq(schema.notification.clinicId, clinicId));

			const result = await db
				.update(schema.notification)
				.set({ status: "read", updatedAt: new Date() })
				.where(and(...conditions))
				.returning();

			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
			throw new Error("Failed to mark all notifications as read");
		}
	});

const deleteNotification = createServerFn({ method: "POST" })
	.validator(deleteNotificationSchema)
	.handler(async ctx => {
		try {
			const { notificationId, userId } = ctx.data;

			const result = await db
				.delete(schema.notification)
				.where(and(eq(schema.notification.id, notificationId), eq(schema.notification.userId, userId)))
				.returning();

			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error deleting notification:", error);
			throw new Error("Failed to delete notification");
		}
	});

const clearAllNotifications = createServerFn({ method: "POST" })
	.validator(clearNotificationsSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;

			const conditions = [eq(schema.notification.userId, userId)];
			if (clinicId) conditions.push(eq(schema.notification.clinicId, clinicId));

			const result = await db
				.delete(schema.notification)
				.where(and(...conditions))
				.returning();

			return result as unknown as SerializableNotification[];
		} catch (error) {
			console.error("Error clearing notifications:", error);
			throw new Error("Failed to clear notifications");
		}
	});

const getClinicAnalytics = createServerFn({ method: "POST" })
	.validator(clinicAnalyticsSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;

			// ✅ FIX: Use object syntax for all queries
			const appointments = await db.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					appointmentDate: { gte: startDate, lte: endDate }
				}
			});

			const payments = await db.query.payment.findMany({
				where: {
					clinicId,
					status: "PAID",
					paymentDate: { gte: startDate, lte: endDate }
				}
			});

			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: { gte: startDate, lte: endDate }
				}
			});

			const prescriptions = await db.query.prescription.findMany({
				where: {
					clinicId,
					issuedDate: { gte: startDate, lte: endDate }
				}
			});

			const appointmentStats = {
				total: appointments.length,
				completed: appointments.filter(a => a.status === "COMPLETED").length,
				cancelled: appointments.filter(a => a.status === "CANCELLED").length,
				pending: appointments.filter(a => a.status === "PENDING").length,
				noShow: appointments.filter(a => a.status === "NO_SHOW").length
			};

			const revenue = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
			const revenueByMethod = payments.reduce(
				(acc, p) => {
					const method = p.paymentMethod || "UNKNOWN";
					acc[method] = (acc[method] || 0) + (p.amount ?? 0);
					return acc;
				},
				{} as Record<string, number>
			);

			return {
				period: { startDate, endDate },
				appointments: appointmentStats,
				revenue: {
					total: revenue,
					byMethod: revenueByMethod,
					averagePerAppointment: appointmentStats.completed > 0 ? revenue / appointmentStats.completed : 0
				},
				patients: {
					total: patients.length,
					newPatients: patients.length
				},
				prescriptions: prescriptions.length
			};
		} catch (error) {
			console.error("Error getting clinic analytics:", error);
			throw new Error("Failed to get clinic analytics");
		}
	});

// const checkVitalSignsAccess = createServerFn({ method: "POST" })
// 	.validator(checkVitalSignsAccessSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { userId, patientId } = ctx.data;

// 			// ✅ FIX: Use object syntax with with clause
// 			const userData = await db.query.user.findFirst({
// 				where: { id: userId },
// 				with: {
// 					patients: true,
// 					doctors: true
// 				}
// 			});

// 			if (!userData) return false;
// 			if (userData.role === "admin" || userData.role === "staff") return true;
// 			if (userData.role === "doctor" && userData.doctors) return true;

// 			if (userData.role === "patient" && Array.isArray(userData.patients)) {
// 				return userData.patients.some(p => p.id === patientId);
// 			}

// 			const guardianRecord = await db.query.guardian.findFirst({
// 				where: {
// 					userId,
// 					patientId
// 				}
// 			});

// 			return !!guardianRecord;
// 		} catch (error) {
// 			console.error("Error checking vital signs access:", error);
// 			throw new Error("Failed to check access");
// 		}
// 	});

// const checkDoctorAccess = createServerFn({ method: "POST" })
// 	.validator(checkDoctorAccessSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { doctorId, userId, clinicId } = ctx.data;

// 			const userRecord = await db.query.user.findFirst({
// 				where: { id: userId },
// 				with: {
// 					doctors: true,
// 					clinics: true
// 				}
// 			});

// 			if (!userRecord) return false;
// 			if (userRecord.role === "admin" || userRecord.role === "superadmin") return true;
// 			if (userRecord.role === "staff") return true;

// 			if (userRecord.role === "doctor") {
// 				const doctorRecord = await db.query.doctor.findFirst({
// 					where: {
// 						userId,
// 						id: doctorId
// 					}
// 				});
// 				return !!doctorRecord;
// 			}

// 			if (clinicId) {
// 				const clinicMember = await db.query.clinicMember.findFirst({
// 					where: {
// 						userId,
// 						clinicId
// 					}
// 				});
// 				return !!clinicMember;
// 			}

// 			return false;
// 		} catch (error) {
// 			console.error("Error checking doctor access:", error);
// 			throw new Error("Failed to check access");
// 		}
// 	});

const createPayment = createServerFn({ method: "POST" })
	.validator(createPaymentSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.payment)
				.values({
					id: crypto.randomUUID(),
					...data,
					billDate: data.billDate || new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating payment:", error);
			throw new Error("Failed to create payment");
		}
	});

const recordPayment = createServerFn({ method: "POST" })
	.validator(createPaymentSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await db.transaction(async tx => {
				const [payment] = await tx
					.insert(schema.payment)
					.values({
						id: data.id || crypto.randomUUID(),
						...data,
						billDate: data.billDate || new Date(),
						totalAmount: data.totalAmount || data.amount,
						amountPaid: data.status === "PAID" ? data.amount : 0,
						paidDate: data.status === "PAID" ? new Date() : null,
						receiptNumber: data.receiptNumber || Math.floor(Math.random() * 1000000),
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();
				return payment;
			});
			return result;
		} catch (error) {
			console.error("Error recording payment:", error);
			throw new Error("Failed to record payment");
		}
	});

const createInvoice = createServerFn({ method: "POST" })
	.validator(invoiceSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, appointmentId, items, notes } = ctx.data;
			const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

			const result = await db.transaction(async tx => {
				const [payment] = await tx
					.insert(schema.payment)
					.values({
						id: crypto.randomUUID(),
						patientId,
						clinicId,
						appointmentId,
						amount: totalAmount,
						totalAmount,
						status: "PENDING",
						billDate: new Date(),
						notes,
						receiptNumber: Math.floor(Math.random() * 1000000),
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				return payment;
			});

			return result;
		} catch (error) {
			console.error("Error creating invoice:", error);
			throw new Error("Failed to create invoice");
		}
	});

const updatePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: createPaymentSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.payment)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.payment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating payment:", error);
			throw new Error("Failed to update payment");
		}
	});

const deletePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.payment).where(eq(schema.payment.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting payment:", error);
			throw new Error("Failed to delete payment");
		}
	});

const softDeletePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.payment)
				.set({ deletedAt: new Date(), isDeleted: true, updatedAt: new Date() })
				.where(eq(schema.payment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error soft deleting payment:", error);
			throw new Error("Failed to soft delete payment");
		}
	});

const restorePayment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.payment)
				.set({ deletedAt: null, isDeleted: false, updatedAt: new Date() })
				.where(eq(schema.payment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error restoring payment:", error);
			throw new Error("Failed to restore payment");
		}
	});

const generateReceipt = createServerFn({ method: "GET" })
	.validator(z.object({ paymentId: z.string() }))
	.handler(async ctx => {
		try {
			const { paymentId } = ctx.data;
			// ✅ FIX: Use object syntax for with clause
			const receipt = await db.query.payment.findFirst({
				where: { id: paymentId },
				with: {
					patient: true,
					appointment: true,
					clinic: true
				}
			});
			return receipt;
		} catch (error) {
			console.error("Error generating receipt:", error);
			throw new Error("Failed to generate receipt");
		}
	});

const processPaymentWithReceipt = createServerFn({ method: "POST" })
	.validator(processPaymentSchema)
	.handler(async ctx => {
		try {
			const { paymentId, amountPaid, paymentMethod, notes } = ctx.data;

			const result = await db.transaction(async tx => {
				// ✅ FIX: Use object syntax for with clause
				const payment = await tx.query.payment.findFirst({
					where: { id: paymentId },
					with: {
						patient: true,
						appointment: true
					}
				});

				if (!payment) {
					throw new Error("Payment not found");
				}

				const isFullyPaid = amountPaid >= (payment.totalAmount ?? 0);
				const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

				const [updatedPayment] = await tx
					.update(schema.payment)
					.set({
						amountPaid,
						paymentMethod,
						paymentDate: new Date(),
						paidDate: new Date(),
						status: isFullyPaid ? "PAID" : "PARTIAL",
						notes: notes ? `${payment.notes || ""}\n${notes}` : payment.notes,
						receiptNumber: Number.parseInt(receiptNumber.split("-").pop() || "0", 10),
						updatedAt: new Date()
					})
					.where(eq(schema.payment.id, paymentId))
					.returning();

				if (payment.patient?.userId) {
					await tx.insert(schema.notification).values({
						id: crypto.randomUUID(),
						userId: payment.patient.userId,
						clinicId: payment.clinicId ?? "",
						title: "Payment Receipt",
						body: `Payment of ${amountPaid} received. Receipt #: ${receiptNumber}`,
						type: "payment_receipt",
						priority: "medium",
						status: "unread",
						metadata: {
							receiptNumber,
							amountPaid,
							paymentMethod
						},
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}

				return updatedPayment;
			});

			return result;
		} catch (error) {
			console.error("Error processing payment with receipt:", error);
			throw new Error("Failed to process payment");
		}
	});

// =======================
// Config Store Functions
// =======================

const getAllConfigs = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const configs = await db.select().from(schema.configStore);
		return configs;
	} catch (error) {
		console.error("Error getting all configs:", error);
		throw new Error("Failed to get configs");
	}
});

const getConfig = createServerFn({ method: "GET" })
	.validator(z.object({ key: z.string() }))
	.handler(async ctx => {
		try {
			const { key } = ctx.data;
			const result = await db.select().from(schema.configStore).where(eq(schema.configStore.key, key)).limit(1);
			return result[0] || null;
		} catch (error) {
			console.error("Error getting config:", error);
			throw new Error("Failed to get config");
		}
	});

const getConfigs = createServerFn({ method: "POST" })
	.validator(z.object({ keys: z.array(z.string()) }))
	.handler(async ctx => {
		try {
			const { keys } = ctx.data;
			const results = await Promise.all(keys.map(key => getConfig({ data: { key } })));
			return results.reduce(
				(acc, result, idx) => {
					if (result) acc[keys[idx] ?? ""] = result.value;
					return acc;
				},
				{} as Record<string, string>
			);
		} catch (error) {
			console.error("Error getting multiple configs:", error);
			throw new Error("Failed to get configs");
		}
	});

const setConfig = createServerFn({ method: "POST" })
	.validator(setConfigSchema)
	.handler(async ctx => {
		try {
			const { key, value } = ctx.data;
			await db.insert(schema.configStore).values({ key, value }).onConflictDoUpdate({
				target: schema.configStore.key,
				set: { value }
			});

			return { success: true, key };
		} catch (error) {
			console.error("Error setting config:", error);
			throw new Error("Failed to set config");
		}
	});

const setConfigs = createServerFn({ method: "POST" })
	.validator(setConfigsSchema)
	.handler(async ctx => {
		try {
			const { configs } = ctx.data;
			for (const config of configs) {
				await setConfig({ data: config });
			}
			return { success: true, count: configs.length };
		} catch (error) {
			console.error("Error setting multiple configs:", error);
			throw new Error("Failed to set configs");
		}
	});

const deleteConfig = createServerFn({ method: "POST" })
	.validator(z.object({ key: z.string() }))
	.handler(async ctx => {
		try {
			const { key } = ctx.data;
			await db.delete(schema.configStore).where(eq(schema.configStore.key, key));
			return { success: true, key };
		} catch (error) {
			console.error("Error deleting config:", error);
			throw new Error("Failed to delete config");
		}
	});

const getExistingConfigKeys = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const rows = await db.select({ key: schema.configStore.key }).from(schema.configStore);
		return rows.map(row => row.key);
	} catch (error) {
		console.error("Error getting existing config keys:", error);
		throw new Error("Failed to get config keys");
	}
});

const initializeMissingConfigs = createServerFn({ method: "POST" })
	.validator(initializeConfigsSchema)
	.handler(async ctx => {
		try {
			const { defaults } = ctx.data;
			const existingKeys = await getExistingConfigKeys();
			const missing = defaults.filter(d => !existingKeys.includes(d.key));

			if (missing.length > 0) {
				await db.insert(schema.configStore).values(missing).onConflictDoNothing();
			}

			return missing;
		} catch (error) {
			console.error("Error initializing missing configs:", error);
			throw new Error("Failed to initialize configs");
		}
	});

export {
	advancedSearch,
	// checkDoctorAccess,
	// checkVitalSignsAccess,
	clearAllNotifications,
	createInvoice,
	createPayment,
	deleteConfig,
	deleteNotification,
	deletePayment,
	generateReceipt,
	getAllConfigs,
	getClinicAnalytics,
	getConfig,
	getConfigs,
	getExistingConfigKeys,
	getUserNotifications,
	initializeMissingConfigs,
	listNotifications,
	markAllNotificationsAsRead,
	markNotificationsAsRead,
	processPaymentWithReceipt,
	recordPayment,
	restorePayment,
	searchFiles,
	setConfig,
	setConfigs,
	softDeletePayment,
	updatePayment
};
