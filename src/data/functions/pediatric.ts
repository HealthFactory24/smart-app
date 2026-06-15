// db/repositories/pediatric.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { ImmunizationCreateSchema } from "@/db/zod";
import { generateId } from '../../utils';

// =======================
// Zod Validators
// =======================

const patientClinicSchema = z.object({
	patientId: z.string(),
	clinicId: z.string()
});

const growthRecordIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const growthRecordListSchema = z.object({
	clinicId: z.string(),
	patientId: z.string().optional(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});

const addMeasurementSchema = z.object({
	patientId: z.string(),
	date: z.date(),
	weight: z.number().optional(),
	height: z.number().optional(),
	headCircumference: z.number().optional(),
	notes: z.string().optional(),
	clinicId: z.string()
});

const feedingLogFiltersSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	type: z.enum(schema.feedingTypeEnum.enumValues).optional(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});

const feedingStatsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	days: z.number().default(30)
});

const developmentalCheckSchema = z.object({
	patientId: z.string(),
	ageMonths: z.number(),
	motorSkills: z.string(),
	languageSkills: z.string(),
	socialSkills: z.string(),
	cognitiveSkills: z.string(),
	milestonesMet: z.string().optional(),
	milestonesPending: z.string().optional(),
	concerns: z.string().optional(),
	recommendations: z.string().optional()
});

const immunizationListSchema = z.object({
	limit: z.number().default(50),
	offset: z.number().default(0),
	patientId: z.string().optional(),
	clinicId: z.string().optional()
});

const recordImmunizationSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	vaccine: z.string(),
	date: z.date(),
	dose: z.string(),
	lotNumber: z.string(),
	administeredByStaffId: z.string(),
	notes: z.string().optional(),
	vaccineInventoryId: z.string().optional()
});

const bulkVaccineUpdateSchema = z.object({
	clinicId: z.string(),
	updates: z.array(
		z.object({
			vaccineName: z.string(),
			quantity: z.number(),
			lotNumber: z.string().optional(),
			expirationDate: z.date().optional()
		})
	)
});

const recurringFeedingsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	schedule: z.object({
		startDate: z.date(),
		endDate: z.date(),
		times: z.array(z.string()),
		type: z.enum(["BREAST", "FORMULA", "MIXED"]),
		duration: z.number().optional(),
		amount: z.number().optional()
	})
});

const growthWithPercentilesSchema = z.object({
	patientId: z.string(),
	date: z.date(),
	weight: z.number().optional(),
	height: z.number().optional(),
	headCircumference: z.number().optional(),
	bmi: z.number().optional(),
	notes: z.string().optional(),
	clinicId: z.string()
});

const whoStandardsSchema = z.object({
	ageDays: z.number(),
	gender: z.enum(schema.genderEnum.enumValues),
	measurementType: z.enum(schema.measurementTypeEnum.enumValues)
});

// =======================
// Server Functions
// =======================

const getPatientGrowthRecords = createServerFn({ method: "GET" })
	.validator(patientClinicSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId } = ctx.data;
			const records = await db.query.growthRecord.findMany({
				where: {
					patientId: patientId,
					clinicId: clinicId
				},
				orderBy: { date: "asc" }
			});
			return records;
		} catch (error) {
			console.error("Error getting growth records:", error);
			throw new Error("Failed to get growth records");
		}
	});

const listGrowthRecords = createServerFn({ method: "POST" })
	.validator(growthRecordListSchema)
	.handler(async ctx => {
		try {
			const { clinicId, patientId, limit, offset } = ctx.data;

			// Build where object dynamically
			const where = { clinicId: clinicId, patientId };
			if (patientId) {
				where.patientId = patientId;
			}

			const [records, totalResult] = await Promise.all([
				db.query.growthRecord.findMany({
					where,
					limit,
					offset,
					orderBy: { date: "desc" }
				}),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.growthRecord)
					.where(
						patientId
							? sql`${schema.growthRecord.clinicId} = ${clinicId} AND ${schema.growthRecord.patientId} = ${patientId}`
							: sql`${schema.growthRecord.clinicId} = ${clinicId}`
					)
			]);

			return {
				records,
				total: Number(totalResult[0]?.count ?? 0)
			};
		} catch (error) {
			console.error("Error listing growth records:", error);
			throw new Error("Failed to list growth records");
		}
	});

const getGrowthRecordById = createServerFn({ method: "GET" })
	.validator(growthRecordIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const record = await db.query.growthRecord.findFirst({
				where: {
					id: id,
					clinicId: clinicId
				},
				with: { patient: true }
			});
			return record;
		} catch (error) {
			console.error("Error getting growth record:", error);
			throw new Error("Failed to get growth record");
		}
	});

const listFeedingLogs = createServerFn({ method: "POST" })
	.validator(feedingLogFiltersSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, startDate, endDate, type, limit, offset } = ctx.data;

			// Build where object with operators
			const where = {
				patientId: patientId,
				type,
				clinicId,
				date: {
					lte: endDate,
					gte: startDate
				}
			};

			if (startDate) {
				where.date = { ...where.date, gte: startDate };
			}
			if (endDate) {
				where.date = { ...where.date, lte: endDate };
			}
			if (type) {
				where.type = type;
			}

			const logs = await db.query.feedingLog.findMany({
				where,
				orderBy: { date: "desc" },
				limit,
				offset
			});

			// For counting, use raw SQL or keep using the query builder
			const totalResult = await db
				.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
				.from(schema.feedingLog)
				.where(
					and(
						eq(schema.feedingLog.patientId, patientId),
						startDate ? gte(schema.feedingLog.date, startDate) : undefined,
						endDate ? lte(schema.feedingLog.date, endDate) : undefined,
						type ? eq(schema.feedingLog.type, type) : undefined
					)
				);

			const total = Number(totalResult[0]?.count ?? 0);

			return {
				logs,
				total,
				hasMore: offset + limit < total
			};
		} catch (error) {
			console.error("Error listing feeding logs:", error);
			throw new Error("Failed to list feeding logs");
		}
	});

const getFeedingStats = createServerFn({ method: "POST" })
	.validator(feedingStatsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, days } = ctx.data;
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const logs = await db.query.feedingLog.findMany({
				where: {
					patientId: patientId,
					clinicId,
					date: {
						gt: startDate,
						lt: endDate
					}
				},
				orderBy: { date: "asc" }
			});

			// Rest of the function remains the same...
			const byType: Record<string, number> = {};
			let totalDuration = 0;
			let totalAmount = 0;
			const feedingsByDayMap: Record<string, { count: number; totalDuration: number; totalAmount: number }> = {};

			for (const log of logs) {
				byType[log.type] = (byType[log.type] || 0) + 1;
				totalDuration += log.duration || 0;
				totalAmount += log.amount || 0;

				const dateKey = log.date.toISOString().split("T")[0] ?? "";
				if (!feedingsByDayMap[dateKey]) {
					feedingsByDayMap[dateKey] = { count: 0, totalDuration: 0, totalAmount: 0 };
				}
				feedingsByDayMap[dateKey].count++;
				feedingsByDayMap[dateKey].totalDuration += log.duration || 0;
				feedingsByDayMap[dateKey].totalAmount += log.amount || 0;
			}

			const averageDuration = logs.length > 0 ? totalDuration / logs.length : 0;

			return {
				totalFeedings: logs.length,
				byType,
				averageDuration,
				totalAmount,
				feedingsByDay: Object.entries(feedingsByDayMap)
					.map(([date, stats]) => ({
						date,
						count: stats.count,
						totalDuration: stats.totalDuration,
						totalAmount: stats.totalAmount
					}))
					.sort((a, b) => a.date.localeCompare(b.date))
			};
		} catch (error) {
			console.error("Error getting feeding stats:", error);
			throw new Error("Failed to get feeding stats");
		}
	});

const getBreastfeedingStats = createServerFn({ method: "POST" })
	.validator(feedingStatsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, days } = ctx.data;
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const logs = await db.query.feedingLog.findMany({
				where: {
					patientId: patientId,
					clinicId,
					type: "BREAST",
					date: {
						lt: startDate,
						gt: endDate
					}
				},
				orderBy: { date: "asc" }
			});

			// Rest of the function remains the same...
			const today = new Date().toISOString().split("T")[0] ?? "";
			const todayFeedings = logs.filter(log => log.date.toISOString().split("T")[0] === today);
			const todayTotal = todayFeedings.length;

			const weeklyDataMap: Record<
				string,
				{ duration: number; count: number; leftDuration: number; rightDuration: number }
			> = {};

			for (const log of logs) {
				const dateKey = log.date.toISOString().split("T")[0] ?? "";
				if (!weeklyDataMap[dateKey]) {
					weeklyDataMap[dateKey] = { duration: 0, count: 0, leftDuration: 0, rightDuration: 0 };
				}
				weeklyDataMap[dateKey].duration += log.duration || 0;
				weeklyDataMap[dateKey].count++;
				if (log.breast === "LEFT") weeklyDataMap[dateKey].leftDuration += log.duration || 0;
				if (log.breast === "RIGHT") weeklyDataMap[dateKey].rightDuration += log.duration || 0;
				if (log.breast === "BOTH") {
					weeklyDataMap[dateKey].leftDuration += (log.duration || 0) / 2;
					weeklyDataMap[dateKey].rightDuration += (log.duration || 0) / 2;
				}
			}

			const weeklyData = Object.entries(weeklyDataMap)
				.map(([date, stats]) => ({
					date,
					duration: stats.duration,
					count: stats.count,
					leftDuration: stats.leftDuration,
					rightDuration: stats.rightDuration
				}))
				.sort((a, b) => a.date.localeCompare(b.date))
				.slice(-7);

			const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
			const averageDuration = logs.length > 0 ? totalDuration / logs.length : 0;

			const last7Days = weeklyData.slice(-7);
			const weeklyAverage =
				last7Days.length > 0 ? last7Days.reduce((sum, day) => sum + day.count, 0) / last7Days.length : 0;

			const sessionsByTimeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
			let leftPreference = 0;
			let rightPreference = 0;
			let bothPreference = 0;

			for (const log of logs) {
				const hour = log.date.getHours();
				if (hour >= 6 && hour < 12) sessionsByTimeOfDay.morning++;
				else if (hour >= 12 && hour < 17) sessionsByTimeOfDay.afternoon++;
				else if (hour >= 17 && hour < 21) sessionsByTimeOfDay.evening++;
				else sessionsByTimeOfDay.night++;

				if (log.breast === "LEFT") leftPreference++;
				else if (log.breast === "RIGHT") rightPreference++;
				else if (log.breast === "BOTH") bothPreference++;
			}

			const totalFeedings = logs.length;
			const breastPreference = {
				left: totalFeedings > 0 ? (leftPreference / totalFeedings) * 100 : 0,
				right: totalFeedings > 0 ? (rightPreference / totalFeedings) * 100 : 0,
				both: totalFeedings > 0 ? (bothPreference / totalFeedings) * 100 : 0
			};

			return {
				todayTotal,
				weeklyAverage: Math.round(weeklyAverage * 10) / 10,
				totalSessions: logs.length,
				averageDuration: Math.round(averageDuration * 10) / 10,
				weeklyData,
				sessionsByTimeOfDay,
				breastPreference
			};
		} catch (error) {
			console.error("Error getting breastfeeding stats:", error);
			throw new Error("Failed to get breastfeeding stats");
		}
	});

const getFeedingsByDateRange = createServerFn({ method: "POST" })
	.validator(z.object({ patientId: z.string(), clinicId: z.string(), startDate: z.date(), endDate: z.date() }))
	.handler(async ctx => {
		try {
			const { patientId, clinicId, startDate, endDate } = ctx.data;
			const logs = await db.query.feedingLog.findMany({
				where: {
					patientId: patientId,
					clinicId,
					date: {
						gt: startDate,
						lt: endDate
					}
				},
				orderBy: { date: "asc" }
			});
			return logs;
		} catch (error) {
			console.error("Error getting feedings by date range:", error);
			throw new Error("Failed to get feedings");
		}
	});

const getLatestFeedingLog = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const log = await db.query.feedingLog.findFirst({
				where: { patientId: patientId },
				orderBy: { date: "desc" }
			});
			return log;
		} catch (error) {
			console.error("Error getting latest feeding log:", error);
			throw new Error("Failed to get latest feeding log");
		}
	});

const addMeasurementPoint = createServerFn({ method: "POST" })
	.validator(addMeasurementSchema)
	.handler(async ctx => {
		try {
			const { patientId, date, weight, height, headCircumference, notes, clinicId } = ctx.data;
			const result = await db
				.insert(schema.growthRecord)
				.values({
					id: crypto.randomUUID(),
					patientId,
					clinicId,
					date,
					weight,
					height,
					headCircumference,
					notes,
					recordedAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error adding measurement:", error);
			throw new Error("Failed to add measurement");
		}
	});

const getGrowthAnalytics = createServerFn({ method: "GET" })
	.validator(patientClinicSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId } = ctx.data;
			const records = await getPatientGrowthRecords({ data: { patientId, clinicId } });

			if (!records || records.length < 2) return { velocity: null, records: records || [] };

			const first = records[0];
			const last = records[records.length - 1];
			if (!first || !last) {
				return { velocity: null, records };
			}

			const monthsDiff = (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
			const weightVelocity =
				monthsDiff > 0 ? (Number(last.weight ?? 0) - Number(first.weight ?? 0)) / monthsDiff : 0;
			const heightVelocity =
				monthsDiff > 0 ? (Number(last.height ?? 0) - Number(first.height ?? 0)) / monthsDiff : 0;

			return {
				records,
				velocity: {
					weightKgPerMonth: weightVelocity.toFixed(2),
					heightCmPerMonth: heightVelocity.toFixed(2)
				}
			};
		} catch (error) {
			console.error("Error calculating growth analytics:", error);
			throw new Error("Failed to calculate growth analytics");
		}
	});

const getFeedingLogById = createServerFn({ method: "GET" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const log = await db.query.feedingLog.findFirst({
				where: { id }
			});
			return log;
		} catch (error) {
			console.error("Error getting feeding log:", error);
			throw new Error("Failed to get feeding log");
		}
	});

const getDevelopmentalProgress = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const [milestones, checks] = await Promise.all([
				db.query.developmentalMilestones.findMany({
					where: { patientId },
					orderBy: (m, { asc }) => asc(m.dateRecorded)
				}),
				db.query.developmentalCheck.findMany({
					where: { patientId },
					orderBy: (c, { asc }) => asc(c.checkDate)
				})
			]);

			const milestonesByAge: Record<string, typeof milestones> = {};
			for (const milestone of milestones) {
				if (!milestonesByAge[milestone.ageAchieved]) {
					milestonesByAge[milestone.ageAchieved] = [];
				}
				milestonesByAge[milestone.ageAchieved]?.push(milestone);
			}

			return {
				milestones: milestonesByAge,
				developmentalChecks: checks,
				totalMilestonesAchieved: milestones.length,
				lastCheckup: checks[checks.length - 1]
			};
		} catch (error) {
			console.error("Error getting developmental progress:", error);
			throw new Error("Failed to get developmental progress");
		}
	});

const getDevelopmentalScreenings = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const screenings = await db.query.developmentalCheck.findMany({
				where: { patientId },
				orderBy: (c, { desc }) => desc(c.checkDate)
			});
			return screenings;
		} catch (error) {
			console.error("Error getting developmental screenings:", error);
			throw new Error("Failed to get developmental screenings");
		}
	});

const createDevelopmentalCheck = createServerFn({ method: "POST" })
	.validator(developmentalCheckSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await db
				.insert(schema.developmentalCheck)
				.values({
					id: crypto.randomUUID(),
					checkDate: new Date(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating developmental check:", error);
			throw new Error("Failed to create developmental check");
		}
	});

const getAllVaccineSchedules = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const schedules = await db.query.vaccineSchedule.findMany({
			where: { isDeleted: false }
		});
		return schedules;
	} catch (error) {
		console.error("Error getting vaccine schedules:", error);
		throw new Error("Failed to get vaccine schedules");
	}
});

const listImmunizations = createServerFn({ method: "POST" })
	.validator(immunizationListSchema)
	.handler(async ctx => {
		try {
			const { limit, offset, patientId, clinicId } = ctx.data;

			const whereConditions = [eq(schema.immunization.isDeleted, false)];
			if (clinicId) whereConditions.push(eq(schema.immunization.clinicId, clinicId));
			if (patientId) whereConditions.push(eq(schema.immunization.patientId, patientId));

			const [records, totalResult] = await Promise.all([
				db.query.immunization.findMany({
					where: { isDeleted: false, clinicId, patientId },
					limit,
					offset,
					orderBy: (imm, { desc }) => desc(imm.date)
				}),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.immunization)
					.where(and(...whereConditions))
			]);

			return {
				records,
				total: Number(totalResult[0]?.count ?? 0)
			};
		} catch (error) {
			console.error("Error listing immunizations:", error);
			throw new Error("Failed to list immunizations");
		}
	});

const getPatientVaccineSchedule = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: { id: patientId },
				with: { immunizations: true }
			});

			if (!patient) {
				throw new Error("Patient not found");
			}

			const ageInDays = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));

			const dueVaccines = await db.query.vaccineSchedule.findMany({
				where: {
					isDeleted: false,
					ageInDaysMin: { lte: ageInDays },
					ageInDaysMax: { gte: ageInDays }
				}
			});

			const administeredVaccines = new Set(patient.immunizations.map(i => i.vaccine));
			const pendingVaccines = dueVaccines.filter(v => !administeredVaccines.has(v.vaccineName));

			return { pendingVaccines, administeredVaccines: patient.immunizations };
		} catch (error) {
			console.error("Error getting patient vaccine schedule:", error);
			throw new Error("Failed to get vaccine schedule");
		}
	});

const getVaccineInventoryStatus = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const inventory = await db.query.vaccineInventory.findMany({
				where: { clinicId },
				orderBy: (inv, { asc }) => asc(inv.expirationDate)
			});

			const now = new Date();
			const expiringSoon = inventory.filter(v => {
				const daysUntilExpiry = Math.ceil(
					((v.expirationDate?.getTime() ?? now.getTime()) - now.getTime()) / (1000 * 60 * 60 * 24)
				);
				return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
			});

			const expired = inventory.filter(v => v.expirationDate && v.expirationDate < now);
			const lowStock = inventory.filter(v => v.quantity < 10);

			return {
				totalVaccines: inventory.length,
				totalDoses: inventory.reduce((sum, v) => sum + (v.quantity ?? 0), 0),
				expiringSoon,
				expired,
				lowStock,
				inventoryByVaccine: inventory
			};
		} catch (error) {
			console.error("Error getting vaccine inventory:", error);
			throw new Error("Failed to get vaccine inventory");
		}
	});

const getOverdueImmunizations = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const overdue = await db.query.immunization.findMany({
				where: {
					clinicId,
					isDeleted: false,
					status: "OVERDUE"
				},
				with: {
					patient: {
						with: { guardians: true }
					}
				},
				orderBy: (imm, { asc }) => asc(imm.date)
			});
			return overdue;
		} catch (error) {
			console.error("Error getting overdue immunizations:", error);
			throw new Error("Failed to get overdue immunizations");
		}
	});

const getUpcomingImmunizations = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const allPatients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				with: { immunizations: true }
			});

			const upcomingImmunizations = [];
			for (const patient of allPatients) {
				const schedule = await getPatientVaccineSchedule({ data: { patientId: patient.id } });
				if (schedule.pendingVaccines.length > 0) {
					upcomingImmunizations.push({
						patient,
						dueVaccines: schedule.pendingVaccines
					});
				}
			}

			return upcomingImmunizations;
		} catch (error) {
			console.error("Error getting upcoming immunizations:", error);
			throw new Error("Failed to get upcoming immunizations");
		}
	});

const createImmunization = createServerFn({ method: "POST" })
	.validator(z.object({ data: ImmunizationCreateSchema }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const [result] = await db
				.insert(schema.immunization)
				.values({
					id: crypto.randomUUID(),
					recordId: crypto.randomUUID(),
					patientId: data.patientId,
					clinicId: data.clinicId,
					vaccine: data.vaccine,
					date: data.date,
					dose: data.dose,
					lotNumber: data.lotNumber,
					notes: data.notes,
					status: "COMPLETED",
					createdAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating immunization:", error);
			throw new Error("Failed to create immunization");
		}
	});

const recordImmunization = createServerFn({ method: "POST" })
	.validator(recordImmunizationSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await db.transaction(async tx => {
				if (data.vaccineInventoryId) {
					const inventory = await tx.query.vaccineInventory.findFirst({
						where: { id: data.vaccineInventoryId }
					});

					if (!inventory || inventory.quantity < 1) {
						throw new Error("Insufficient vaccine stock");
					}

					await tx
						.update(schema.vaccineInventory)
						.set({
							quantity: inventory.quantity - 1,
							updatedAt: new Date()
						})
						.where(eq(schema.vaccineInventory.id, data.vaccineInventoryId));
				}

				const [immunization] = await tx
					.insert(schema.immunization)
					.values({
						id: crypto.randomUUID(),
						recordId: crypto.randomUUID(),
						...data,
						status: "COMPLETED",
						createdAt: new Date()
					})
					.returning();

				const vaccineSchedule = await tx.query.vaccineSchedule.findFirst({
					where: { vaccineName: data.vaccine }
				});

				if (vaccineSchedule?.ageInDaysMax) {
					const patient = await tx.query.patient.findFirst({
						where: { id: data.patientId }
					});

					if (patient) {
						const ageAtVaccination = Math.floor(
							(data.date.getTime() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
						);

						if (ageAtVaccination > vaccineSchedule.ageInDaysMax) {
							await tx
								.update(schema.immunization)
								.set({ isOverDue: true })
								.where(eq(schema.immunization.id, immunization.id));
						}
					}
				}

				return immunization;
			});

			return result;
		} catch (error) {
			console.error("Error recording immunization:", error);
			throw new Error("Failed to record immunization");
		}
	});

const createFeedingLog = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			clinicId: z.string(),
			date: z.date().optional(),
			type: z.enum(schema.feedingTypeEnum.enumValues),
			duration: z.number().optional(),
			amount: z.number().optional(),
			breast: z.enum(schema.breastEnum.enumValues).optional(),
			notes: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.feedingLog)
				.values({
					id: crypto.randomUUID(),
					date: data.date || new Date(),
					...data
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating feeding log:", error);
			throw new Error("Failed to create feeding log");
		}
	});

const createManyFeedingLogs = createServerFn({ method: "POST" })
	.validator(z.object({ logs: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { logs } = ctx.data;
			const values = logs.map(log => ({
				...log,
				id: log.id || crypto.randomUUID(),
				date: log.date || new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			const result = await db.insert(schema.feedingLog).values(values).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple feeding logs:", error);
			throw new Error("Failed to create feeding logs");
		}
	});

const updateFeedingLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.feedingLog)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.feedingLog.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating feeding log:", error);
			throw new Error("Failed to update feeding log");
		}
	});

const updateManyFeedingLogs = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.feedingLog)
				.set({ ...data, updatedAt: new Date() })
				.where(inArray(schema.feedingLog.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple feeding logs:", error);
			throw new Error("Failed to update feeding logs");
		}
	});

const deleteFeedingLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.feedingLog).where(eq(schema.feedingLog.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting feeding log:", error);
			throw new Error("Failed to delete feeding log");
		}
	});

const createDevelopmentalMilestone = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			milestone: z.string(),
			ageAchieved: z.string(),
			dateRecorded: z.date(),
			notes: z.string().optional(),
			createdBy: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.developmentalMilestones)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating developmental milestone:", error);
			throw new Error("Failed to create developmental milestone");
		}
	});

const createVaccineSchedule = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.vaccineSchedule)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating vaccine schedule:", error);
			throw new Error("Failed to create vaccine schedule");
		}
	});

const bulkUpdateVaccineInventory = createServerFn({ method: "POST" })
	.validator(bulkVaccineUpdateSchema)
	.handler(async ctx => {
		try {
			const { clinicId, updates } = ctx.data;
			const results = await db.transaction(async tx => {
				const output = [];
				for (const update of updates) {
					const existing = await tx.query.vaccineInventory.findFirst({
						where: { clinicId, vaccineName: update.vaccineName }
					});

					if (existing) {
						const [updated] = await tx
							.update(schema.vaccineInventory)
							.set({
								quantity: existing.quantity + update.quantity,
								lotNumber: update.lotNumber || existing.lotNumber,
								expirationDate: update.expirationDate || existing.expirationDate,
								updatedAt: new Date()
							})
							.where(eq(schema.vaccineInventory.id, existing.id))
							.returning();
						output.push(updated);
					} else {
						const [created] = await tx
							.insert(schema.vaccineInventory)
							.values({
								id: crypto.randomUUID(),
								clinicId,
								vaccineName: update.vaccineName,
								quantity: update.quantity,
								lotNumber: update.lotNumber,
								expirationDate: update.expirationDate,
								createdAt: new Date(),
								updatedAt: new Date()
							})
							.returning();
						output.push(created);
					}
				}
				return output;
			});
			return results;
		} catch (error) {
			console.error("Error bulk updating vaccine inventory:", error);
			throw new Error("Failed to update vaccine inventory");
		}
	});

const syncFeedingLogs = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			clinicId: z.string(),
			externalLogs: z.array(
				z.object({
					timestamp: z.date(),
					type: z.string(),
					duration: z.number().optional(),
					amount: z.number().optional(),
					source: z.string()
				})
			)
		})
	)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, externalLogs } = ctx.data;
			const results = [];
			const errors = [];

			for (const externalLog of externalLogs) {
				try {
					const existingLog = await db.query.feedingLog.findFirst({
						where: {
							patientId,
							clinicId,
							date: {
								gt: new Date(externalLog.timestamp.getTime() - 5 * 60 * 1000),
								lt: new Date(externalLog.timestamp.getTime() + 5 * 60 * 1000)
							}
						}
					});

					if (!existingLog) {
						const newLog = await createFeedingLog({
							data: {
								patientId,
								date: externalLog.timestamp,
								clinicId: clinicId,
								type: externalLog.type as schema.FeedingType,
								duration: externalLog.duration,
								amount: externalLog.amount,
								notes: `Synced from ${externalLog.source}`
							}
						});
						results.push(newLog);
					} else {
						errors.push({
							timestamp: externalLog.timestamp,
							error: "Duplicate log found within 5 minute window"
						});
					}
				} catch (error) {
					errors.push({
						timestamp: externalLog.timestamp,
						error: error instanceof Error ? error.message : "Unknown error"
					});
				}
			}

			return { synced: results.length, failed: errors.length, results, errors };
		} catch (error) {
			console.error("Error syncing feeding logs:", error);
			throw new Error("Failed to sync feeding logs");
		}
	});

const recordGrowthWithPercentiles = createServerFn({ method: "POST" })
	.validator(growthWithPercentilesSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await db.transaction(async tx => {
				const patient = await tx.query.patient.findFirst({
					where: { id: data.patientId }
				});

				if (!patient) {
					throw new Error("Patient not found");
				}

				const ageDays = Math.floor(
					(data.date.getTime() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
				);
				const ageMonths = Math.floor(ageDays / 30);

				const whoStandards = await tx.query.whoGrowthStandard.findMany({
					where: {
						gender: patient.gender as schema.Gender,
						ageDays: {
							gte: ageDays - 30,
							lte: ageDays + 30
						}
					}
				});

				let weightForAgeZ: number | undefined;
				let heightForAgeZ: number | undefined;
				let bmiForAgeZ: number | undefined;

				const weightStandard = whoStandards.find(s => s.measurementType === "WEIGHT");
				if (weightStandard && data.weight) {
					weightForAgeZ = (data.weight - weightStandard.mValue) / weightStandard.sValue;
				}

				const heightStandard = whoStandards.find(s => s.measurementType === "HEIGHT");
				if (heightStandard && data.height) {
					heightForAgeZ = (data.height - heightStandard.mValue) / heightStandard.sValue;
				}

				if (data.bmi) {
					const bmiStandard = whoStandards.find(s => s.measurementType === "BMI");
					if (bmiStandard) {
						bmiForAgeZ = (data.bmi - bmiStandard.mValue) / bmiStandard.sValue;
					}
				}

				const [growthRecord] = await tx
					.insert(schema.growthRecord)
					.values({
						id: crypto.randomUUID(),
						...data,
						ageDays,
						ageMonths,
						weightForAgeZ,
						heightForAgeZ,
						bmiForAgeZ,
						recordedAt: new Date(),
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				if (weightForAgeZ && (weightForAgeZ < -2 || weightForAgeZ > 2)) {
					await tx.insert(schema.alert).values({
						id: generateId(),
						title: "Abnormal Growth Pattern",
						message: `Patient ${patient.firstName} ${patient.lastName} has abnormal weight-for-age Z-score: ${weightForAgeZ.toFixed(2)}`,
						type: "growth_alert",
						timestamp: new Date(),
						action: {
							label: "View Patient",
							href: `/patients/${patient.id}`
						}
					});
				}

				return growthRecord;
			});

			return result;
		} catch (error) {
			console.error("Error recording growth with percentiles:", error);
			throw new Error("Failed to record growth data");
		}
	});

const getWHOStandards = createServerFn({ method: "POST" })
	.validator(whoStandardsSchema)
	.handler(async ctx => {
		try {
			const { ageDays, gender, measurementType } = ctx.data;
			const standard = await db.query.whoGrowthStandard.findFirst({
				where: { ageDays, gender, measurementType }
			});
			return standard;
		} catch (error) {
			console.error("Error getting WHO standards:", error);
			throw new Error("Failed to get WHO standards");
		}
	});

const generateRecurringFeedings = createServerFn({ method: "POST" })
	.validator(recurringFeedingsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, schedule } = ctx.data;
			const feedings = [];
			const currentDate = new Date(schedule.startDate);
			const endDate = new Date(schedule.endDate);

			while (currentDate <= endDate) {
				for (const time of schedule.times) {
					const [hours, minutes] = time.split(":").map(Number);
					const feedingTime = new Date(currentDate);
					feedingTime.setHours(hours || 0, minutes || 0, 0, 0);

					feedings.push({
						id: crypto.randomUUID(),
						patientId,
						date: feedingTime,
						type: schedule.type,
						duration: schedule.duration,
						amount: schedule.amount,
						notes: "Auto-generated from recurring schedule",
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}
				currentDate.setDate(currentDate.getDate() + 1);
			}

			const existingLogs = await listFeedingLogs({
				data: {
					patientId,
					clinicId,
					startDate: schedule.startDate,
					endDate: schedule.endDate,
					limit: 1000,
					offset: 0
				}
			});

			const existingTimes = new Set(existingLogs.logs.map(log => log.date.toISOString()));
			const newFeedings = feedings.filter(feeding => !existingTimes.has(feeding.date.toISOString()));

			if (newFeedings.length > 0) {
				return await createManyFeedingLogs({ data: { logs: newFeedings } });
			}

			return [];
		} catch (error) {
			console.error("Error generating recurring feedings:", error);
			throw new Error("Failed to generate recurring feedings");
		}
	});

export {
	addMeasurementPoint,
	bulkUpdateVaccineInventory,
	createDevelopmentalCheck,
	createDevelopmentalMilestone,
	createFeedingLog,
	createImmunization,
	createManyFeedingLogs,
	createVaccineSchedule,
	deleteFeedingLog,
	generateRecurringFeedings,
	getAllVaccineSchedules,
	getBreastfeedingStats,
	getDevelopmentalProgress,
	getDevelopmentalScreenings,
	getFeedingLogById,
	getFeedingStats,
	getFeedingsByDateRange,
	getGrowthAnalytics,
	getGrowthRecordById,
	getLatestFeedingLog,
	getOverdueImmunizations,
	getPatientGrowthRecords,
	getPatientVaccineSchedule,
	getUpcomingImmunizations,
	getVaccineInventoryStatus,
	getWHOStandards,
	listFeedingLogs,
	listGrowthRecords,
	listImmunizations,
	recordGrowthWithPercentiles,
	recordImmunization,
	syncFeedingLogs,
	updateFeedingLog,
	updateManyFeedingLogs
};
