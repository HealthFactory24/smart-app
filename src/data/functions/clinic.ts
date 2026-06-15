// db/repo/clinic.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, eq, like, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

// =======================
// Schema Validators
// =======================

const clinicIdSchema = z.object({ clinicId: z.string().min(1) });
const clinicNameSchema = z.object({ name: z.string().min(1) });
const clinicMemberSchema = z.object({
	userId: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"])
});
const configValueSchema = z.object({ key: z.string(), value: z.string() });
const serviceListSchema = z.object({
	clinicId: z.string(),
	search: z.string().optional(),
	category: z.string().optional(),
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(10)
});
const serviceIdSchema = z.object({ serviceId: z.string() });
const serviceCategorySchema = z.object({ clinicId: z.string(), category: z.string() });
const searchTermSchema = z.object({ clinicId: z.string(), searchTerm: z.string() });
const serviceStatsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional()
});
const serviceUsageSchema = z.object({
	clinicId: z.string(),
	serviceId: z.string(),
	months: z.number().min(1).max(24).default(6)
});
const doctorPerformanceSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});
const batchPriceSchema = z.object({
	updates: z.array(z.object({ id: z.string(), price: z.number() }))
});
const ratingSchema = z.object({
	staffId: z.string().optional(),
	patientId: z.string().optional(),
	rating: z.number().min(1).max(5),
	comment: z.string().optional()
});
const ratingIdSchema = z.object({ id: z.string() });
const clinicUpdateSchema = z.object({
	id: z.string(),
	data: z.object({
		name: z.string().optional(),
		email: z.string().email().optional(),
		timezone: z.string().optional(),
		address: z.string().optional(),
		phone: z.string().optional(),
		isDefault: z.boolean().optional()
	})
});
const clinicCreateSchema = z.object({
	name: z.string(),
	email: z.string().email().optional(),
	timezone: z.string().default("UTC"),
	address: z.string().optional(),
	phone: z.string().optional(),
	isDefault: z.boolean().default(false)
});
const clinicSettingSchema = z.object({
	clinicId: z.string(),
	openingTime: z.string(),
	closingTime: z.string(),
	workingDays: z.string(),
	defaultAppointmentDuration: z.number().default(30),
	requireEmergencyContact: z.boolean().default(true)
});
const serviceCreateSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string(),
	serviceName: z.string(),
	description: z.string(),
	price: z.number(),
	category: z.string().optional(),
	duration: z.number().optional(),
	isAvailable: z.boolean().default(true),
	icon: z.string().optional(),
	color: z.string().optional()
});
const serviceUpdateSchema = z.object({
	id: z.string(),
	data: z.object({
		serviceName: z.string().optional(),
		description: z.string().optional(),
		price: z.number().optional(),
		category: z.string().optional(),
		duration: z.number().optional(),
		isAvailable: z.boolean().optional(),
		icon: z.string().optional(),
		color: z.string().optional()
	})
});
const cloneServiceSchema = z.object({
	serviceId: z.string(),
	newClinicId: z.string().optional()
});

// =======================
// Clinic Queries
// =======================

export const getClinicById = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			return await db.query.clinic.findFirst({
				where: { id: clinicId, isDeleted: false }
			});
		} catch (error) {
			console.error("Error getting clinic by ID:", error);
			throw new Error("Failed to get clinic");
		}
	});

export const getClinicByName = createServerFn({ method: "GET" })
	.validator(clinicNameSchema)
	.handler(async ctx => {
		try {
			const { name } = ctx.data;
			return await db.query.clinic.findFirst({
				where: { name, isDeleted: false }
			});
		} catch (error) {
			console.error("Error getting clinic by name:", error);
			throw new Error("Failed to get clinic");
		}
	});

export const createClinic = createServerFn({ method: "POST" })
	.validator(clinicCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.clinic)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date(),
					isDeleted: false
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating clinic:", error);
			throw new Error("Failed to create clinic");
		}
	});

export const updateClinic = createServerFn({ method: "POST" })
	.validator(clinicUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.clinic)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.clinic.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating clinic:", error);
			throw new Error("Failed to update clinic");
		}
	});

export const softDeleteClinic = createServerFn({ method: "POST" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const [result] = await db
				.update(schema.clinic)
				.set({ deletedAt: new Date(), isDeleted: true })
				.where(eq(schema.clinic.id, clinicId))
				.returning();
			return result;
		} catch (error) {
			console.error("Error deleting clinic:", error);
			throw new Error("Failed to delete clinic");
		}
	});

export const getDefaultClinic = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await db.query.clinic.findFirst({
			where: { name: "Default Clinic", isDeleted: false }
		});
	} catch (error) {
		console.error("Error getting default clinic:", error);
		throw new Error("Failed to get default clinic");
	}
});

// =======================
// Clinic Member Queries
// =======================

export const addUserToClinic = createServerFn({ method: "POST" })
	.validator(clinicMemberSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId, role } = ctx.data;
			const [result] = await db
				.insert(schema.clinicMember)
				.values({
					userId,
					clinicId,
					role,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error adding user to clinic:", error);
			throw new Error("Failed to add user to clinic");
		}
	});

export const upsertClinicMember = createServerFn({ method: "POST" })
	.validator(clinicMemberSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId, role } = ctx.data;
			const [result] = await db
				.insert(schema.clinicMember)
				.values({
					userId,
					clinicId,
					role,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.onConflictDoUpdate({
					target: schema.clinicMember.userId,
					set: {
						clinicId,
						role,
						updatedAt: new Date()
					}
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error upserting clinic member:", error);
			throw new Error("Failed to upsert clinic member");
		}
	});

export const getUserClinics = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await db
				.select({
					id: schema.clinic.id,
					name: schema.clinic.name,
					email: schema.clinic.email,
					role: schema.clinicMember.role,
					createdAt: schema.clinicMember.createdAt
				})
				.from(schema.clinicMember)
				.innerJoin(schema.clinic, eq(schema.clinicMember.clinicId, schema.clinic.id))
				.where(eq(schema.clinicMember.userId, userId));
		} catch (error) {
			console.error("Error getting user clinics:", error);
			throw new Error("Failed to get user clinics");
		}
	});

export const removeUserFromClinic = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const [result] = await db
				.delete(schema.clinicMember)
				.where(and(eq(schema.clinicMember.userId, userId), eq(schema.clinicMember.clinicId, clinicId)))
				.returning();
			return result;
		} catch (error) {
			console.error("Error removing user from clinic:", error);
			throw new Error("Failed to remove user from clinic");
		}
	});

// =======================
// Clinic Statistics
// =======================

export const getClinicStatistics = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const [doctors, patients, appointments, revenue] = await Promise.all([
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.doctor)
					.where(and(eq(schema.doctor.clinicId, clinicId), eq(schema.doctor.isDeleted, false))),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.patient)
					.where(and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.appointment)
					.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false))),
				db
					.select({ total: sql<number>`COALESCE(SUM(${schema.payment.amount}), 0)` })
					.from(schema.payment)
					.where(and(eq(schema.payment.clinicId, clinicId), eq(schema.payment.status, "PAID")))
			]);

			return {
				doctors: doctors[0]?.count ?? 0,
				patients: patients[0]?.count ?? 0,
				appointments: appointments[0]?.count ?? 0,
				revenue: revenue[0]?.total ?? 0
			};
		} catch (error) {
			console.error("Error getting clinic statistics:", error);
			throw new Error("Failed to get clinic statistics");
		}
	});

// =======================
// Clinic Settings
// =======================

export const getClinicSetting = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			return await db.query.clinicSetting.findFirst({
				where: { clinicId }
			});
		} catch (error) {
			console.error("Error getting clinic setting:", error);
			throw new Error("Failed to get clinic setting");
		}
	});

export const upsertClinicSetting = createServerFn({ method: "POST" })
	.validator(clinicSettingSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.clinicSetting)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.onConflictDoUpdate({
					target: schema.clinicSetting.clinicId,
					set: { ...data, updatedAt: new Date() }
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error upserting clinic setting:", error);
			throw new Error("Failed to upsert clinic setting");
		}
	});

// =======================
// Config Store
// =======================

export const getConfigValue = createServerFn({ method: "GET" })
	.validator(z.object({ key: z.string() }))
	.handler(async ctx => {
		try {
			const { key } = ctx.data;
			return await db.query.configStore.findFirst({
				where: { key }
			});
		} catch (error) {
			console.error("Error getting config value:", error);
			throw new Error("Failed to get config value");
		}
	});

export const setConfigValue = createServerFn({ method: "POST" })
	.validator(configValueSchema)
	.handler(async ctx => {
		try {
			const { key, value } = ctx.data;
			const [result] = await db
				.insert(schema.configStore)
				.values({ key, value })
				.onConflictDoUpdate({
					target: schema.configStore.key,
					set: { value }
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error setting config value:", error);
			throw new Error("Failed to set config value");
		}
	});

// =======================
// Clinic Dashboard
// =======================

export const getClinicDashboard = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const [clinic, stats, recentAppointments, topDoctors] = await Promise.all([
				db.query.clinic.findFirst({
					where: { id: clinicId, isDeleted: false }
				}),
				db.transaction(async tx => {
					const [doctorCount, patientCount, appointmentCount, revenue] = await Promise.all([
						tx
							.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
							.from(schema.doctor)
							.where(and(eq(schema.doctor.clinicId, clinicId), eq(schema.doctor.isDeleted, false))),
						tx
							.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
							.from(schema.patient)
							.where(and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false))),
						tx
							.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
							.from(schema.appointment)
							.where(
								and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false))
							),
						tx
							.select({ total: sql<number>`COALESCE(SUM(${schema.payment.amount}), 0)` })
							.from(schema.payment)
							.where(and(eq(schema.payment.clinicId, clinicId), eq(schema.payment.status, "PAID")))
					]);
					return {
						doctors: doctorCount[0]?.count ?? 0,
						patients: patientCount[0]?.count ?? 0,
						appointments: appointmentCount[0]?.count ?? 0,
						revenue: revenue[0]?.total ?? 0
					};
				}),
				db.query.appointment.findMany({
					where: { clinicId, isDeleted: false },
					with: {
						patient: true,
						doctor: true
					},
					orderBy: { appointmentDate: "desc" },
					limit: 10
				}),
				db.query.doctor.findMany({
					where: { clinicId, isDeleted: false },
					with: {
						appointments: {
							where: { isDeleted: false }
						}
					},
					limit: 5
				})
			]);

			return { clinic, stats, recentAppointments, topDoctors };
		} catch (error) {
			console.error("Error getting clinic dashboard:", error);
			throw new Error("Failed to get clinic dashboard");
		}
	});

// =======================
// Service Management
// =======================

export const listServices = createServerFn({ method: "GET" })
	.validator(serviceListSchema)
	.handler(async ctx => {
		try {
			const { clinicId, search, category, page, pageSize } = ctx.data;
			const offset = (page - 1) * pageSize;

			let whereConditions = and(eq(schema.service.clinicId, clinicId), eq(schema.service.isDeleted, false));

			if (category) {
				whereConditions = and(whereConditions, eq(schema.service.category, category));
			}

			if (search) {
				whereConditions = and(whereConditions, like(schema.service.serviceName, `%${search}%`));
			}

			const [services, total] = await Promise.all([
				db.query.service.findMany({
					where: {
						clinicId,
						isDeleted: false,
						...whereConditions
					},
					limit: pageSize,
					offset,
					orderBy: { createdAt: "desc" }
				}),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.service)
					.where(whereConditions)
					.then(result => result[0]?.count ?? 0)
			]);

			return {
				services,
				total,
				page,
				totalPages: Math.ceil(total / pageSize)
			};
		} catch (error) {
			console.error("Error listing services:", error);
			throw new Error("Failed to list services");
		}
	});

export const getClinicServices = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), includeDeleted: z.boolean().default(false) }))
	.handler(async ctx => {
		try {
			const { clinicId, includeDeleted } = ctx.data;
			return await db.query.service.findMany({
				where: {
					clinicId,
					...(includeDeleted ? {} : { isDeleted: false })
				},
				orderBy: { serviceName: "asc" }
			});
		} catch (error) {
			console.error("Error getting clinic services:", error);
			throw new Error("Failed to get clinic services");
		}
	});

export const getAvailableServices = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			return await db.query.service.findMany({
				where: {
					clinicId,
					isAvailable: true,
					isDeleted: false
				},
				orderBy: { serviceName: "asc" }
			});
		} catch (error) {
			console.error("Error getting available services:", error);
			throw new Error("Failed to get available services");
		}
	});

export const getServiceById = createServerFn({ method: "GET" })
	.validator(z.object({ serviceId: z.string(), clinicId: z.string().optional() }))
	.handler(async ctx => {
		try {
			const { serviceId, clinicId } = ctx.data;
			const whereClause = {
				id: serviceId,
				clinicId,
				isDeleted: false
			};
			if (clinicId) {
				whereClause.clinicId = clinicId;
			}

			return await db.query.service.findFirst({
				where: whereClause,
				with: {
					appointments: {
						where: { isDeleted: false },
						limit: 10,
						orderBy: { appointmentDate: "desc" }
					},
					labTests: {
						limit: 10,
						orderBy: { testDate: "desc" }
					}
				}
			});
		} catch (error) {
			console.error("Error getting service by ID:", error);
			throw new Error("Failed to get service");
		}
	});

export const getServicesByCategory = createServerFn({ method: "GET" })
	.validator(serviceCategorySchema)
	.handler(async ctx => {
		try {
			const { clinicId, category } = ctx.data;
			return await db.query.service.findMany({
				where: {
					clinicId,
					category,
					isDeleted: false
				},
				orderBy: { price: "asc" }
			});
		} catch (error) {
			console.error("Error getting services by category:", error);
			throw new Error("Failed to get services by category");
		}
	});

export const getServiceCategories = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const services = await db.query.service.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				columns: { category: true }
			});

			const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
			return categories;
		} catch (error) {
			console.error("Error getting service categories:", error);
			throw new Error("Failed to get service categories");
		}
	});

export const searchServices = createServerFn({ method: "GET" })
	.validator(searchTermSchema)
	.handler(async ctx => {
		try {
			const { clinicId, searchTerm } = ctx.data;
			return await db.query.service.findMany({
				where: {
					clinicId,
					isDeleted: false,
					or: [
						like(schema.service.serviceName, `%${searchTerm}%`),
						like(schema.service.description, `%${searchTerm}%`),
						like(schema.service.category, `%${searchTerm}%`)
					]
				},
				orderBy: { serviceName: "asc" }
			});
		} catch (error) {
			console.error("Error searching services:", error);
			throw new Error("Failed to search services");
		}
	});

export const getServiceStatistics = createServerFn({ method: "GET" })
	.validator(serviceStatsSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const services = await db.query.service.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				with: {
					appointments: {
						where: {
							isDeleted: false,
							...(startDate &&
								endDate && {
									appointmentDate: {
										gte: startDate,
										lte: endDate
									}
								})
						}
					},
					labTests: {
						where:
							startDate && endDate
								? {
										testDate: {
											gte: startDate,
											lte: endDate
										}
									}
								: undefined
					}
				}
			});

			return services.map(service => ({
				id: service.id,
				name: service.serviceName,
				category: service.category,
				price: service.price,
				duration: service.duration,
				isAvailable: service.isAvailable,
				appointmentCount: service.appointments.length,
				labTestCount: service.labTests.length,
				totalUsage: service.appointments.length + service.labTests.length,
				estimatedRevenue: service.appointments.length * (service.price ?? 0)
			}));
		} catch (error) {
			console.error("Error getting service statistics:", error);
			throw new Error("Failed to get service statistics");
		}
	});

export const getPopularServices = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			limit: z.number().default(10),
			startDate: z.date().optional(),
			endDate: z.date().optional()
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, limit, startDate, endDate } = ctx.data;
			const stats = await getServiceStatistics({ data: { clinicId, startDate, endDate } });
			return stats.sort((a, b) => b.totalUsage - a.totalUsage).slice(0, limit);
		} catch (error) {
			console.error("Error getting popular services:", error);
			throw new Error("Failed to get popular services");
		}
	});

export const getLowUsageServices = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), threshold: z.number().default(5), days: z.number().default(30) }))
	.handler(async ctx => {
		try {
			const { clinicId, threshold, days } = ctx.data;
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const stats = await getServiceStatistics({ data: { clinicId, startDate, endDate } });
			return stats.filter(service => service.totalUsage < threshold);
		} catch (error) {
			console.error("Error getting low usage services:", error);
			throw new Error("Failed to get low usage services");
		}
	});

export const getServiceRevenueReport = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), startDate: z.date(), endDate: z.date() }))
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const services = await db.query.service.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				with: {
					appointments: {
						where: {
							isDeleted: false,
							status: "COMPLETED",
							appointmentDate: {
								gte: startDate,
								lte: endDate
							}
						}
					}
				}
			});

			const report = {
				period: { startDate, endDate },
				totalRevenue: 0,
				services: [] as Array<{
					id: string;
					name: string;
					category: string | null;
					appointmentCount: number;
					revenue: number;
					averagePrice: number;
				}>
			};

			for (const service of services) {
				const appointmentCount = service.appointments.length;
				const revenue = appointmentCount * (service.price ?? 0);
				report.totalRevenue += revenue;
				report.services.push({
					id: service.id,
					name: service.serviceName,
					category: service.category,
					appointmentCount,
					revenue,
					averagePrice: service.price ?? 0
				});
			}

			return report;
		} catch (error) {
			console.error("Error getting service revenue report:", error);
			throw new Error("Failed to get service revenue report");
		}
	});

export const canDeleteService = createServerFn({ method: "GET" })
	.validator(serviceIdSchema)
	.handler(async ctx => {
		try {
			const { serviceId } = ctx.data;
			const service = await db.query.service.findFirst({
				where: { id: serviceId },
				with: {
					appointments: {
						where: {
							isDeleted: false,
							status: { notIn: ["CANCELLED", "COMPLETED"] }
						},
						limit: 1
					},
					labTests: {
						limit: 1
					}
				}
			});

			if (!service) {
				return { canDelete: false, reason: "Service not found" };
			}

			if (service.appointments.length > 0) {
				return { canDelete: false, reason: "Service has upcoming appointments" };
			}

			if (service.labTests.length > 0) {
				return { canDelete: false, reason: "Service has associated lab tests" };
			}

			return { canDelete: true };
		} catch (error) {
			console.error("Error checking if service can be deleted:", error);
			throw new Error("Failed to check service deletion eligibility");
		}
	});

export const getServiceUsageTrends = createServerFn({ method: "GET" })
	.validator(serviceUsageSchema)
	.handler(async ctx => {
		try {
			const { clinicId, serviceId, months } = ctx.data;
			const trends = [];
			const now = new Date();

			const service = await getServiceById({ data: { serviceId, clinicId } });

			for (let i = months - 1; i >= 0; i--) {
				const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
				const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

				const appointments = await db.query.appointment.findMany({
					where: {
						clinicId,
						serviceId,
						isDeleted: false,
						status: "COMPLETED",
						appointmentDate: {
							gte: startDate,
							lte: endDate
						}
					}
				});

				trends.push({
					month: startDate.toLocaleString("default", {
						month: "long",
						year: "numeric"
					}),
					appointmentCount: appointments.length,
					revenue: appointments.length * (service?.price ?? 0)
				});
			}

			return trends;
		} catch (error) {
			console.error("Error getting service usage trends:", error);
			throw new Error("Failed to get service usage trends");
		}
	});

// =======================
// Doctor Performance
// =======================

export const getDoctorPerformanceReport = createServerFn({ method: "GET" })
	.validator(doctorPerformanceSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const doctors = await db.query.doctor.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				with: {
					appointments: {
						where: {
							appointmentDate: {
								gte: startDate,
								lte: endDate
							},
							isDeleted: false
						}
					},
					ratings: {
						where: {
							createdAt: {
								gte: startDate,
								lte: endDate
							}
						}
					},
					prescriptions: {
						where: {
							issuedDate: {
								gte: startDate,
								lte: endDate
							}
						}
					}
				}
			});

			return doctors.map(doctor => {
				const completedAppointments = doctor.appointments.filter(a => a.status === "COMPLETED");
				const cancelledAppointments = doctor.appointments.filter(a => a.status === "CANCELLED");
				const averageRating =
					doctor.ratings.length > 0
						? doctor.ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / doctor.ratings.length
						: 0;

				return {
					id: doctor.id,
					name: doctor.name,
					specialty: doctor.specialty,
					totalAppointments: doctor.appointments.length,
					completedAppointments: completedAppointments.length,
					cancelledAppointments: cancelledAppointments.length,
					completionRate:
						doctor.appointments.length > 0
							? (completedAppointments.length / doctor.appointments.length) * 100
							: 0,
					totalPrescriptions: doctor.prescriptions.length,
					averageRating,
					revenue: completedAppointments.reduce((sum, a) => sum + (a.appointmentPrice ?? 0), 0)
				};
			});
		} catch (error) {
			console.error("Error getting doctor performance report:", error);
			throw new Error("Failed to get doctor performance report");
		}
	});

// =======================
// Service CRUD Operations
// =======================

export const createService = createServerFn({ method: "POST" })
	.validator(serviceCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.service)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date(),
					isDeleted: false
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating service:", error);
			throw new Error("Failed to create service");
		}
	});

export const updateService = createServerFn({ method: "POST" })
	.validator(serviceUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.service)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.service.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating service:", error);
			throw new Error("Failed to update service");
		}
	});

export const deleteService = createServerFn({ method: "POST" })
	.validator(serviceIdSchema)
	.handler(async ctx => {
		try {
			const { serviceId } = ctx.data;
			const [result] = await db.delete(schema.service).where(eq(schema.service.id, serviceId)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting service:", error);
			throw new Error("Failed to delete service");
		}
	});

export const softDeleteService = createServerFn({ method: "POST" })
	.validator(serviceIdSchema)
	.handler(async ctx => {
		try {
			const { serviceId } = ctx.data;
			const [result] = await db
				.update(schema.service)
				.set({ deletedAt: new Date(), isDeleted: true, updatedAt: new Date() })
				.where(eq(schema.service.id, serviceId))
				.returning();
			return result;
		} catch (error) {
			console.error("Error soft deleting service:", error);
			throw new Error("Failed to soft delete service");
		}
	});

export const restoreService = createServerFn({ method: "POST" })
	.validator(serviceIdSchema)
	.handler(async ctx => {
		try {
			const { serviceId } = ctx.data;
			const [result] = await db
				.update(schema.service)
				.set({ deletedAt: null, isDeleted: false, updatedAt: new Date() })
				.where(eq(schema.service.id, serviceId))
				.returning();
			return result;
		} catch (error) {
			console.error("Error restoring service:", error);
			throw new Error("Failed to restore service");
		}
	});

export const createServiceWithCategory = createServerFn({ method: "POST" })
	.validator(z.object({ data: serviceCreateSchema, categoryId: z.string().optional() }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			return await db.transaction(async tx => {
				// Check if service with same name exists in clinic
				const existing = await tx.query.service.findFirst({
					where: {
						clinicId: data.clinicId,
						serviceName: data.serviceName,
						isDeleted: false
					}
				});

				if (existing) {
					throw new Error("Service with this name already exists in the clinic");
				}

				// Create service
				const [service] = await tx
					.insert(schema.service)
					.values({
						...data,
						id: data.id ?? crypto.randomUUID(),
						isAvailable: data.isAvailable ?? true,
						createdAt: new Date(),
						updatedAt: new Date(),
						isDeleted: false
					})
					.returning();

				// If category is provided, you could link it to a category table here
				// This would require a service_categories table

				return service;
			});
		} catch (error) {
			console.error("Error creating service with category:", error);
			throw new Error("Failed to create service with category");
		}
	});

export const cloneService = createServerFn({ method: "POST" })
	.validator(cloneServiceSchema)
	.handler(async ctx => {
		try {
			const { serviceId, newClinicId } = ctx.data;
			return await db.transaction(async tx => {
				const originalService = await tx.query.service.findFirst({
					where: { id: serviceId, isDeleted: false }
				});

				if (!originalService) {
					throw new Error("Original service not found");
				}

				// Clone service with new ID
				const [clonedService] = await tx
					.insert(schema.service)
					.values({
						...originalService,
						id: crypto.randomUUID(),
						clinicId: newClinicId ?? originalService.clinicId,
						serviceName: `${originalService.serviceName} (Copy)`,
						createdAt: new Date(),
						updatedAt: new Date(),
						deletedAt: null,
						isDeleted: false
					})
					.returning();

				return clonedService;
			});
		} catch (error) {
			console.error("Error cloning service:", error);
			throw new Error("Failed to clone service");
		}
	});

export const batchUpdateServicePrices = createServerFn({ method: "POST" })
	.validator(batchPriceSchema)
	.handler(async ctx => {
		try {
			const { updates } = ctx.data;
			return await db.transaction(async tx => {
				const results = [];
				for (const update of updates) {
					const [updated] = await tx
						.update(schema.service)
						.set({
							price: update.price,
							updatedAt: new Date()
						})
						.where(eq(schema.service.id, update.id))
						.returning();
					results.push(updated);
				}
				return results;
			});
		} catch (error) {
			console.error("Error batch updating service prices:", error);
			throw new Error("Failed to batch update service prices");
		}
	});

// =======================
// Rating Management
// =======================

export const createRating = createServerFn({ method: "POST" })
	.validator(ratingSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.rating)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating rating:", error);
			throw new Error("Failed to create rating");
		}
	});

export const updateRating = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: ratingSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.rating)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.rating.id, Number(id)))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating rating:", error);
			throw new Error("Failed to update rating");
		}
	});

export const deleteRating = createServerFn({ method: "POST" })
	.validator(ratingIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.delete(schema.rating)
				.where(eq(schema.rating.id, Number(id)))
				.returning();
			return result;
		} catch (error) {
			console.error("Error deleting rating:", error);
			throw new Error("Failed to delete rating");
		}
	});
