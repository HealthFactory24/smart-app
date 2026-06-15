// db/repo/labs.repo.ts
import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

// =======================
// Schema Validators
// =======================

const clinicIdSchema = z.object({ clinicId: z.string().min(1) });
const patientIdSchema = z.object({ patientId: z.string().min(1) });
const labTestIdSchema = z.object({ labTestId: z.string().min(1) });
const patientLabTestsSchema = z.object({
	patientId: z.string(),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional()
});
const updateResultsSchema = z.object({
	labTestId: z.string(),
	result: z.string(),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
});
const createLabTestSchema = z.object({
	id: z.string().optional(),
	diagnosisId: z.string().optional(),
	patientId: z.string(),
	recordId: z.string(),
	serviceId: z.string(),
	testDate: z.date(),
	result: z.string().default(""),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
	notes: z.string().optional()
});
const updateLabTestSchema = z.object({
	id: z.string(),
	data: z.object({
		diagnosisId: z.string().optional(),
		result: z.string().optional(),
		status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
		notes: z.string().optional(),
		testDate: z.date().optional()
	})
});

// =======================
// Lab Test Queries
// =======================

export const getPendingByClinicId = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;

			// First get patients in the clinic
			const patients = await db.query.patient.findMany({
				where: { clinicId, isDeleted: false },
				columns: { id: true }
			});

			const patientIds = patients.map(p => p.id);

			if (patientIds.length === 0) {
				return [];
			}

			return await db.query.labTest.findMany({
				where: {
					status: "PENDING",
					patientId: {
						arrayContains: patientIds // Use object syntax for inArray
					}
				},
				with: {
					patient: true,
					service: true
				},
				orderBy: { testDate: "asc" }
			});
		} catch (error) {
			console.error("Error getting pending lab tests by clinic:", error);
			throw new Error("Failed to get pending lab tests");
		}
	});

export const getByPatientId = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			return await db.query.labTest.findMany({
				where: { patientId },
				with: {
					service: true
				},
				orderBy: { testDate: "desc" }
			});
		} catch (error) {
			console.error("Error getting lab tests by patient:", error);
			throw new Error("Failed to get lab tests");
		}
	});

export const getPatientLabTests = createServerFn({ method: "GET" })
	.validator(patientLabTestsSchema)
	.handler(async ctx => {
		try {
			const { patientId, status } = ctx.data;

			const whereClause: Record<string, unknown> = { patientId };
			if (status) {
				whereClause.status = status;
			}

			return await db.query.labTest.findMany({
				where: whereClause,
				with: {
					service: true
				},
				orderBy: { testDate: "desc" }
			});
		} catch (error) {
			console.error("Error getting patient lab tests:", error);
			throw new Error("Failed to get patient lab tests");
		}
	});

export const getLabTestById = createServerFn({ method: "GET" })
	.validator(labTestIdSchema)
	.handler(async ctx => {
		try {
			const { labTestId } = ctx.data;
			return await db.query.labTest.findFirst({
				where: { id: labTestId },
				with: {
					patient: true,
					service: true
				}
			});
		} catch (error) {
			console.error("Error getting lab test by ID:", error);
			throw new Error("Failed to get lab test");
		}
	});

// =======================
// Lab Test Updates
// =======================

export const updateLabTestResults = createServerFn({ method: "POST" })
	.validator(updateResultsSchema)
	.handler(async ctx => {
		try {
			const { labTestId, result, status } = ctx.data;

			const [updatedLabTest] = await db
				.update(schema.labTest)
				.set({
					result,
					status,
					updatedAt: new Date()
				})
				.where(eq(schema.labTest.id, labTestId))
				.returning();

			if (!updatedLabTest) {
				throw new Error("Lab test not found");
			}

			return updatedLabTest;
		} catch (error) {
			console.error("Error updating lab test results:", error);
			throw new Error("Failed to update lab test results");
		}
	});

export const getPendingLabTests = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await db.query.labTest.findMany({
			where: {
				status: "PENDING"
			},
			with: {
				patient: true,
				service: true
			},
			orderBy: { testDate: "asc" }
		});
	} catch (error) {
		console.error("Error getting pending lab tests:", error);
		throw new Error("Failed to get pending lab tests");
	}
});

// =======================
// Lab Test Statistics
// =======================

export const getLabTestStatistics = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;

			// Get patients in the clinic
			const patients = await db.query.patient.findMany({
				where: { clinicId, isDeleted: false },
				columns: { id: true }
			});

			const patientIds = patients.map(p => p.id);

			if (patientIds.length === 0) {
				return {
					total: 0,
					pending: 0,
					inProgress: 0,
					completed: 0,
					cancelled: 0,
					byMonth: []
				};
			}

			// Get all lab tests for the clinic
			const labTests = await db.query.labTest.findMany({
				where: {
					patientId: {
						arrayContains: patientIds
					}
				}
			});

			const total = labTests.length;
			const pending = labTests.filter(lt => lt.status === "PENDING").length;
			const inProgress = labTests.filter(lt => lt.status === "IN_PROGRESS").length;
			const completed = labTests.filter(lt => lt.status === "COMPLETED").length;
			const cancelled = labTests.filter(lt => lt.status === "CANCELLED").length;

			// Group by month
			const byMonthMap = new Map();
			labTests.forEach(lt => {
				const monthKey = lt.testDate
					? new Date(lt.testDate).toLocaleString("default", { month: "long", year: "numeric" })
					: "Unknown";
				if (!byMonthMap.has(monthKey)) {
					byMonthMap.set(monthKey, { month: monthKey, count: 0 });
				}
				byMonthMap.get(monthKey).count++;
			});

			const byMonth = Array.from(byMonthMap.values());

			return {
				total,
				pending,
				inProgress,
				completed,
				cancelled,
				byMonth
			};
		} catch (error) {
			console.error("Error getting lab test statistics:", error);
			throw new Error("Failed to get lab test statistics");
		}
	});

// =======================
// Lab Test CRUD Operations
// =======================

export const createLabTest = createServerFn({ method: "POST" })
	.validator(createLabTestSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;

			const [result] = await db
				.insert(schema.labTest)
				.values({
					id: data.id ?? crypto.randomUUID(),
					diagnosisId: data.diagnosisId,
					patientId: data.patientId,
					recordId: data.recordId,
					serviceId: data.serviceId,
					testDate: data.testDate,
					result: data.result,
					status: data.status,
					notes: data.notes,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			return result;
		} catch (error) {
			console.error("Error creating lab test:", error);
			throw new Error("Failed to create lab test");
		}
	});

export const createManyLabTests = createServerFn({ method: "POST" })
	.validator(z.object({ labTests: z.array(createLabTestSchema) }))
	.handler(async ctx => {
		try {
			const { labTests } = ctx.data;

			const labTestsWithIds = labTests.map(lt => ({
				id: lt.id ?? crypto.randomUUID(),
				diagnosisId: lt.diagnosisId,
				patientId: lt.patientId,
				recordId: lt.recordId,
				serviceId: lt.serviceId,
				testDate: lt.testDate,
				result: lt.result,
				status: lt.status,
				notes: lt.notes,
				createdAt: new Date(),
				updatedAt: new Date()
			}));

			return await db.insert(schema.labTest).values(labTestsWithIds).returning();
		} catch (error) {
			console.error("Error creating multiple lab tests:", error);
			throw new Error("Failed to create lab tests");
		}
	});

export const updateLabTest = createServerFn({ method: "POST" })
	.validator(updateLabTestSchema)
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;

			const updateData = { ...data, updatedAt: new Date() };

			const [result] = await db
				.update(schema.labTest)
				.set(updateData)
				.where(eq(schema.labTest.id, id))
				.returning();

			if (!result) {
				throw new Error("Lab test not found");
			}

			return result;
		} catch (error) {
			console.error("Error updating lab test:", error);
			throw new Error("Failed to update lab test");
		}
	});

export const updateManyLabTests = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: updateLabTestSchema.shape.data }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;

			const updateData = { ...data, updatedAt: new Date() };

			return await db.update(schema.labTest).set(updateData).where(inArray(schema.labTest.id, ids)).returning();
		} catch (error) {
			console.error("Error updating multiple lab tests:", error);
			throw new Error("Failed to update lab tests");
		}
	});

export const deleteLabTest = createServerFn({ method: "POST" })
	.validator(labTestIdSchema)
	.handler(async ctx => {
		try {
			const { labTestId } = ctx.data;

			const [result] = await db.delete(schema.labTest).where(eq(schema.labTest.id, labTestId)).returning();

			if (!result) {
				throw new Error("Lab test not found");
			}

			return result;
		} catch (error) {
			console.error("Error deleting lab test:", error);
			throw new Error("Failed to delete lab test");
		}
	});

// =======================
// Bulk Operations
// =======================

export const bulkUpdateLabTestStatus = createServerFn({ method: "POST" })
	.validator(
		z.object({
			labTestIds: z.array(z.string()),
			status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
		})
	)
	.handler(async ctx => {
		try {
			const { labTestIds, status } = ctx.data;

			return await db
				.update(schema.labTest)
				.set({
					status,
					updatedAt: new Date()
				})
				.where(inArray(schema.labTest.id, labTestIds))
				.returning();
		} catch (error) {
			console.error("Error bulk updating lab test status:", error);
			throw new Error("Failed to update lab test statuses");
		}
	});

// =======================
// Lab Test Reports
// =======================

export const getLabTestReport = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			startDate: z.date(),
			endDate: z.date()
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;

			// Get patients in the clinic
			const patients = await db.query.patient.findMany({
				where: { clinicId, isDeleted: false },
				columns: { id: true }
			});

			const patientIds = patients.map(p => p.id);

			if (patientIds.length === 0) {
				return {
					totalTests: 0,
					completedTests: 0,
					pendingTests: 0,
					cancelledTests: 0,
					testsByService: [],
					averageTurnaroundTime: 0
				};
			}

			// Get lab tests within date range
			const labTests = await db.query.labTest.findMany({
				where: {
					patientId: {
						arrayContains: patientIds
					},
					testDate: {
						gte: startDate,
						lte: endDate
					}
				},

				// and(
				// 	inArray(schema.labTest.patientId, patientIds),
				// 	gte(schema.labTest.testDate, startDate),
				// 	lte(schema.labTest.testDate, endDate)
				// ),
				orderBy: { testDate: "desc" },
				with: {
					service: true
				}
			});

			const totalTests = labTests.length;
			const completedTests = labTests.filter(lt => lt.status === "COMPLETED").length;
			const pendingTests = labTests.filter(lt => lt.status === "PENDING").length;
			const cancelledTests = labTests.filter(lt => lt.status === "CANCELLED").length;

			// Group by service
			const testsByServiceMap = new Map();
			labTests.forEach(lt => {
				const serviceName = lt.service?.serviceName || "Unknown";
				if (!testsByServiceMap.has(serviceName)) {
					testsByServiceMap.set(serviceName, {
						serviceName,
						count: 0,
						completed: 0,
						pending: 0
					});
				}
				const serviceStats = testsByServiceMap.get(serviceName);
				serviceStats.count++;
				if (lt.status === "COMPLETED") serviceStats.completed++;
				if (lt.status === "PENDING") serviceStats.pending++;
			});

			const testsByService = Array.from(testsByServiceMap.values());

			// Calculate average turnaround time (simplified - would need created_at and completed_at timestamps)
			// For now, just return a placeholder
			const averageTurnaroundTime = 0;

			return {
				totalTests,
				completedTests,
				pendingTests,
				cancelledTests,
				testsByService,
				averageTurnaroundTime
			};
		} catch (error) {
			console.error("Error getting lab test report:", error);
			throw new Error("Failed to get lab test report");
		}
	});

// =======================
// Lab Test Notifications
// =======================

export const getRecentlyCompletedLabTests = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), limit: z.number().default(10) }))
	.handler(async ctx => {
		try {
			const { clinicId, limit } = ctx.data;

			const patients = await db.query.patient.findMany({
				where: { clinicId, isDeleted: false },
				columns: { id: true }
			});

			const patientIds = patients.map(p => p.id);

			if (patientIds.length === 0) {
				return [];
			}

			return await db.query.labTest.findMany({
				where: {
					patientId: {
						arrayContains: patientIds
					},
					status: "COMPLETED"
				},

				// and(inArray(schema.labTest.patientId, patientIds), eq(schema.labTest.status, "COMPLETED")),
				with: {
					patient: true,
					service: true
				},
				orderBy: { updatedAt: "desc" },
				limit
			});
		} catch (error) {
			console.error("Error getting recently completed lab tests:", error);
			throw new Error("Failed to get recently completed lab tests");
		}
	});
