// db/repositories/pharmacy.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

// =======================
// Zod Validators
// =======================

const prescriptionIdSchema = z.object({
	id: z.string().min(1)
});

const prescriptionWithClinicSchema = z.object({
	id: z.string().min(1),
	clinicId: z.string().optional()
});

const patientActivePrescriptionsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string().optional(),
	includeExpired: z.boolean().optional()
});

const prescribedItemsByPrescriptionSchema = z.object({
	prescriptionId: z.string()
});

const getDrugsByIdsSchema = z.object({
	ids: z.array(z.string()),
	clinicId: z.string().optional()
});

const getDoseGuidelinesSchema = z.object({
	drugIds: z.array(z.string())
});

const dateRangeSchema = z.object({
	patientId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const clinicDateRangeSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const listDrugsSchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
	limit: z.number().default(20),
	offset: z.number().default(0)
});

const updatePrescriptionStatusSchema = z.object({
	id: z.string(),
	status: z.enum(["active", "completed", "cancelled", "expired"]),
	performedBy: z.string()
});

const checkDoctorAccessSchema = z.object({
	doctorId: z.string(),
	userId: z.string(),
	clinicId: z.string().optional()
});

const checkDrugStockSchema = z.object({
	clinicId: z.string(),
	threshold: z.number().default(10)
});

const dispenseMedicationSchema = z.object({
	prescriptionId: z.string(),
	prescribedItemId: z.string(),
	quantityDispensed: z.number(),
	dispensedBy: z.string(),
	notes: z.string().optional()
});

// =======================
// Prescription Queries
// =======================

const getPrescriptionById = createServerFn({ method: "GET" })
	.validator(prescriptionIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const prescription = await db.query.prescription.findFirst({
				where: { id },
				with: {
					patient: true,
					doctor: true,
					prescribedItems: {
						with: {
							drug: true
						}
					},
					medicalRecord: true
				}
			});
			return prescription;
		} catch (error) {
			console.error("Error getting prescription:", error);
			throw new Error("Failed to get prescription");
		}
	});

const getPatientActivePrescriptions = createServerFn({ method: "POST" })
	.validator(patientActivePrescriptionsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, includeExpired } = ctx.data;

			// Build where object dynamically
			const where = {
				clinicId,
				patientId,
				status: "active",
				endDate: {
					gt: new Date()
				}
			};

			if (clinicId) {
				where.clinicId = clinicId;
			}

			if (!includeExpired) {
				where.status = "active";
				where.endDate = {
					gt: new Date()
				};
			}

			const prescriptions = await db.query.prescription.findMany({
				where: { clinicId, patientId, status: "active", endDate: { gt: new Date() } },
				with: {
					prescribedItems: {
						with: {
							drug: true,
							dispenses: {
								orderBy: { dispensedAt: "desc" },
								limit: 10
							}
						}
					},
					doctor: {
						with: {
							user: true
						}
					}
				},
				orderBy: { issuedDate: "desc" }
			});

			return prescriptions;
		} catch (error) {
			console.error("Error getting active prescriptions:", error);
			throw new Error("Failed to get active prescriptions");
		}
	});

const getPrescriptionWithItems = createServerFn({ method: "GET" })
	.validator(prescriptionWithClinicSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;

			const where = { id, clinicId };
			if (clinicId) {
				where.clinicId = clinicId;
			}

			const prescription = await db.query.prescription.findFirst({
				where,
				with: {
					prescribedItems: {
						with: {
							drug: true
						}
					}
				}
			});
			return prescription;
		} catch (error) {
			console.error("Error getting prescription with items:", error);
			throw new Error("Failed to get prescription with items");
		}
	});

const getPrescribedItem = createServerFn({ method: "GET" })
	.validator(prescriptionIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const item = await db.query.prescribedItem.findFirst({
				where: { id },
				with: {
					prescription: true,
					dispenses: true
				}
			});
			return item;
		} catch (error) {
			console.error("Error getting prescribed item:", error);
			throw new Error("Failed to get prescribed item");
		}
	});

const getPrescribedItemsByPrescriptionId = createServerFn({ method: "GET" })
	.validator(prescribedItemsByPrescriptionSchema)
	.handler(async ctx => {
		try {
			const { prescriptionId } = ctx.data;
			const items = await db.query.prescribedItem.findMany({
				where: { prescriptionId }
			});
			return items;
		} catch (error) {
			console.error("Error getting prescribed items:", error);
			throw new Error("Failed to get prescribed items");
		}
	});

const getDrugsByIds = createServerFn({ method: "POST" })
	.validator(getDrugsByIdsSchema)
	.handler(async ctx => {
		try {
			const { ids, clinicId } = ctx.data;

			const drugs = await db.query.drug.findMany({
				where: {
					id: { in: ids },
					clinicId: clinicId
				}
			});
			return drugs;
		} catch (error) {
			console.error("Error getting drugs by IDs:", error);
			throw new Error("Failed to get drugs");
		}
	});

const getDoseGuidelines = createServerFn({ method: "POST" })
	.validator(getDoseGuidelinesSchema)
	.handler(async ctx => {
		try {
			const { drugIds } = ctx.data;
			const guidelines = await db.query.doseGuideline.findMany({
				where: { drugId: { in: drugIds } }
			});
			return guidelines;
		} catch (error) {
			console.error("Error getting dose guidelines:", error);
			throw new Error("Failed to get dose guidelines");
		}
	});

const getPrescriptionsByDateRange = createServerFn({ method: "POST" })
	.validator(dateRangeSchema)
	.handler(async ctx => {
		try {
			const { patientId, startDate, endDate } = ctx.data;
			const prescriptions = await db.query.prescription.findMany({
				where: {
					patientId,
					issuedDate: {
						gt: startDate,
						lt: endDate
					}
				},
				with: {
					prescribedItems: {
						with: {
							drug: true,
							dispenses: true
						}
					}
				}
			});
			return prescriptions;
		} catch (error) {
			console.error("Error getting prescriptions by date range:", error);
			throw new Error("Failed to get prescriptions");
		}
	});

const getPrescriptionsForAnalytics = createServerFn({ method: "POST" })
	.validator(clinicDateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const prescriptions = await db.query.prescription.findMany({
				where: {
					clinicId,
					issuedDate: {
						gt: startDate,
						lt: endDate
					}
				},
				with: {
					prescribedItems: {
						with: {
							drug: true
						}
					},
					doctor: true
				}
			});
			return prescriptions;
		} catch (error) {
			console.error("Error getting prescriptions for analytics:", error);
			throw new Error("Failed to get prescriptions for analytics");
		}
	});
const listDrugs = createServerFn({ method: "POST" })
	.validator(listDrugsSchema)
	.handler(async ctx => {
		try {
			const { search, category, limit, offset } = ctx.data;

			const whereConditions: Record<string, unknown> = {};

			if (search) {
				whereConditions.OR = [
					{ name: { like: `%${search}%` } },
					{ genericName: { like: `%${search}%` } },
					{ brandName: { like: `%${search}%` } }
				];
			}

			if (category) {
				whereConditions.contraindications = { like: `%${category}%` };
			}

			const drugsList = await db.query.drug.findMany({
				where: whereConditions,
				limit,
				offset,
				orderBy: { name: "asc" }
			});

			// Count query using same conditions
			const countResult = await db
				.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
				.from(schema.drug)
				.where(
					and(
						search
							? or(
									like(schema.drug.name, `%${search}%`),
									like(schema.drug.genericName, `%${search}%`),
									like(schema.drug.brandName, `%${search}%`)
								)
							: undefined,
						category ? like(schema.drug.contraindications, `%${category}%`) : undefined
					)
				);

			const total = Number(countResult[0]?.count ?? 0);

			return {
				drugs: drugsList,
				pagination: { limit, offset, total, hasMore: offset + limit < total }
			};
		} catch (error) {
			console.error("Error listing drugs:", error);
			throw new Error("Failed to list drugs");
		}
	});

const getPatientAllergies = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: { id: patientId },
				columns: { allergies: true }
			});
			return patient?.allergies;
		} catch (error) {
			console.error("Error getting patient allergies:", error);
			throw new Error("Failed to get patient allergies");
		}
	});

const updatePrescriptionStatus = createServerFn({ method: "POST" })
	.validator(updatePrescriptionStatusSchema)
	.handler(async ctx => {
		try {
			const { id, status, performedBy } = ctx.data;
			await db.transaction(async tx => {
				await tx
					.update(schema.prescription)
					.set({ status, updatedAt: new Date() })
					.where(eq(schema.prescription.id, id));

				await tx.insert(schema.prescriptionLog).values({
					id: crypto.randomUUID(),
					prescriptionId: id,
					action: status.toUpperCase(),
					performedBy,
					createdAt: new Date()
				});
			});
			return { success: true };
		} catch (error) {
			console.error("Error updating prescription status:", error);
			throw new Error("Failed to update prescription status");
		}
	});

const checkDoctorAccess = createServerFn({ method: "POST" })
	.validator(checkDoctorAccessSchema)
	.handler(async ctx => {
		try {
			const { doctorId, userId, clinicId } = ctx.data;
			const userRecord = await db.query.user.findFirst({
				where: { id: userId },
				with: {
					doctors: true,
					clinics: true
				}
			});

			if (!userRecord) return false;

			// Admin has full access
			if (userRecord.role === "admin") return true;

			// Staff has limited access
			if (userRecord.role === "staff") return true;

			// Doctor access
			if (userRecord.role === "doctor" ) {
				const doctorRecord = await db.query.doctor.findFirst({
					where: { userId: userId, id: doctorId }
				});
				return !!doctorRecord;
			}

			// Check clinic membership
			if (clinicId) {
				const clinicMember = await db.query.clinicMember.findFirst({
					where: { userId: userId, clinicId: clinicId }
				});
				return !!clinicMember;
			}

			return false;
		} catch (error) {
			console.error("Error checking doctor access:", error);
			throw new Error("Failed to check doctor access");
		}
	});

const checkDrugStock = createServerFn({ method: "POST" })
	.validator(checkDrugStockSchema)
	.handler(async ctx => {
		try {
			const { clinicId, threshold } = ctx.data;
			const lowStockDrugs = await db.query.drug.findMany({
				where: {
					clinicId,
					quantityInStock: { lt: threshold }
				}
			});

			for (const drug of lowStockDrugs) {
				await db.insert(schema.notification).values({
					id: crypto.randomUUID(),
					userId: "admin",
					clinicId,
					title: "Low Stock Alert",
					body: `${drug.name} is running low. Only ${drug.quantityInStock} units remaining.`,
					type: "low_stock",
					priority: "high",
					createdAt: new Date(),
					updatedAt: new Date()
				});
			}

			return lowStockDrugs;
		} catch (error) {
			console.error("Error checking drug stock:", error);
			throw new Error("Failed to check drug stock");
		}
	});

const dispenseMedication = createServerFn({ method: "POST" })
	.validator(dispenseMedicationSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const result = await db.transaction(async tx => {
				const prescribedItem = await tx.query.prescribedItem.findFirst({
					where: { id: data.prescribedItemId },
					with: { drug: true }
				});

				if (!prescribedItem) {
					throw new Error("Prescribed item not found");
				}

				if (!prescribedItem.drug || (prescribedItem.drug.quantityInStock ?? 0) < data.quantityDispensed) {
					throw new Error("Insufficient stock");
				}

				const [dispense] = await tx
					.insert(schema.medicationDispense)
					.values({
						id: crypto.randomUUID(),
						...data,
						dispensedAt: new Date(),
						createdAt: new Date()
					})
					.returning();

				await tx
					.update(schema.drug)
					.set({
						quantityInStock: (prescribedItem.drug.quantityInStock ?? 0) - data.quantityDispensed,
						updatedAt: new Date()
					})
					.where(eq(schema.drug.id, prescribedItem.drugId));

				await tx
					.update(schema.prescribedItem)
					.set({
						refillsRemaining: (prescribedItem.refillsRemaining ?? 0) - 1,
						lastRefillDate: new Date(),
						quantityDispensedTotal: (prescribedItem.quantityDispensedTotal ?? 0) + data.quantityDispensed,
						updatedAt: new Date()
					})
					.where(eq(schema.prescribedItem.id, data.prescribedItemId));

				await tx.insert(schema.prescriptionLog).values({
					id: crypto.randomUUID(),
					prescriptionId: data.prescriptionId,
					action: "DISPENSED",
					performedBy: data.dispensedBy,
					details: `Dispensed ${data.quantityDispensed} units of ${prescribedItem.drug.name}`,
					createdAt: new Date()
				});

				return dispense;
			});

			return result;
		} catch (error) {
			console.error("Error dispensing medication:", error);
			throw new Error("Failed to dispense medication");
		}
	});

// =======================
// CRUD Operations for Drugs
// =======================

const createDrug = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.drug)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating drug:", error);
			throw new Error("Failed to create drug");
		}
	});

const createManyDrugs = createServerFn({ method: "POST" })
	.validator(z.object({ drugs: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { drugs } = ctx.data;
			const values = drugs.map(drug => ({
				id: crypto.randomUUID(),
				...drug,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			const result = await db.insert(schema.drug).values(values).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple drugs:", error);
			throw new Error("Failed to create drugs");
		}
	});

const updateDrug = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.drug)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.drug.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating drug:", error);
			throw new Error("Failed to update drug");
		}
	});

const updateManyDrugs = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.drug)
				.set({ ...data, updatedAt: new Date() })
				.where(inArray(schema.drug.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple drugs:", error);
			throw new Error("Failed to update drugs");
		}
	});

const deleteDrug = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.drug).where(eq(schema.drug.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting drug:", error);
			throw new Error("Failed to delete drug");
		}
	});

// =======================
// CRUD Operations for Dose Guidelines
// =======================

const createDoseGuideline = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.doseGuideline)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating dose guideline:", error);
			throw new Error("Failed to create dose guideline");
		}
	});

const createManyDoseGuidelines = createServerFn({ method: "POST" })
	.validator(z.object({ guidelines: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { guidelines } = ctx.data;
			const values = guidelines.map(g => ({
				id: crypto.randomUUID(),
				...g,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			const result = await db.insert(schema.doseGuideline).values(values).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple dose guidelines:", error);
			throw new Error("Failed to create dose guidelines");
		}
	});

const updateDoseGuideline = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.doseGuideline)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.doseGuideline.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating dose guideline:", error);
			throw new Error("Failed to update dose guideline");
		}
	});

const updateManyDoseGuidelines = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.doseGuideline)
				.set({ ...data, updatedAt: new Date() })
				.where(inArray(schema.doseGuideline.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple dose guidelines:", error);
			throw new Error("Failed to update dose guidelines");
		}
	});

const deleteDoseGuideline = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.doseGuideline).where(eq(schema.doseGuideline.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting dose guideline:", error);
			throw new Error("Failed to delete dose guideline");
		}
	});

// =======================
// CRUD Operations for Prescriptions
// =======================

const createPrescription = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.prescription)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating prescription:", error);
			throw new Error("Failed to create prescription");
		}
	});

const createManyPrescriptions = createServerFn({ method: "POST" })
	.validator(z.object({ prescriptions: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { prescriptions } = ctx.data;
			const values = prescriptions.map(p => ({
				id: crypto.randomUUID(),
				...p,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			const result = await db.insert(schema.prescription).values(values).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple prescriptions:", error);
			throw new Error("Failed to create prescriptions");
		}
	});

const updatePrescription = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.prescription)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.prescription.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating prescription:", error);
			throw new Error("Failed to update prescription");
		}
	});

const updateManyPrescriptions = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.prescription)
				.set({ ...data, updatedAt: new Date() })
				.where(inArray(schema.prescription.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple prescriptions:", error);
			throw new Error("Failed to update prescriptions");
		}
	});

const deletePrescription = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.prescription).where(eq(schema.prescription.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting prescription:", error);
			throw new Error("Failed to delete prescription");
		}
	});

// =======================
// CRUD Operations for Prescribed Items
// =======================

const createPrescribedItem = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.prescribedItem)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating prescribed item:", error);
			throw new Error("Failed to create prescribed item");
		}
	});

const createManyPrescribedItems = createServerFn({ method: "POST" })
	.validator(z.object({ items: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { items } = ctx.data;
			const values = items.map(item => ({
				id: crypto.randomUUID(),
				...item,
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			const result = await db.insert(schema.prescribedItem).values(values).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple prescribed items:", error);
			throw new Error("Failed to create prescribed items");
		}
	});

const updatePrescribedItem = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.prescribedItem)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.prescribedItem.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating prescribed item:", error);
			throw new Error("Failed to update prescribed item");
		}
	});

const updateManyPrescribedItems = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.prescribedItem)
				.set({ ...data, updatedAt: new Date() })
				.where(inArray(schema.prescribedItem.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple prescribed items:", error);
			throw new Error("Failed to update prescribed items");
		}
	});

const deletePrescribedItem = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.prescribedItem).where(eq(schema.prescribedItem.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting prescribed item:", error);
			throw new Error("Failed to delete prescribed item");
		}
	});

// =======================
// CRUD Operations for Prescription Logs
// =======================

const createPrescriptionLog = createServerFn({ method: "POST" })
	.validator(z.any())
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.prescriptionLog)
				.values({
					id: crypto.randomUUID(),
					...data,
					createdAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating prescription log:", error);
			throw new Error("Failed to create prescription log");
		}
	});

const createManyPrescriptionLogs = createServerFn({ method: "POST" })
	.validator(z.object({ logs: z.array(z.any()) }))
	.handler(async ctx => {
		try {
			const { logs } = ctx.data;
			const values = logs.map(log => ({
				id: crypto.randomUUID(),
				...log,
				createdAt: new Date()
			}));
			const result = await db.insert(schema.prescriptionLog).values(values).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple prescription logs:", error);
			throw new Error("Failed to create prescription logs");
		}
	});

const updatePrescriptionLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.prescriptionLog)
				.set(data)
				.where(eq(schema.prescriptionLog.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating prescription log:", error);
			throw new Error("Failed to update prescription log");
		}
	});

const updateManyPrescriptionLogs = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.prescriptionLog)
				.set(data)
				.where(inArray(schema.prescriptionLog.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple prescription logs:", error);
			throw new Error("Failed to update prescription logs");
		}
	});

const deletePrescriptionLog = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.delete(schema.prescriptionLog)
				.where(eq(schema.prescriptionLog.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error deleting prescription log:", error);
			throw new Error("Failed to delete prescription log");
		}
	});

export {
	checkDoctorAccess,
	checkDrugStock,
	createDoseGuideline,
	createDrug,
	createManyDoseGuidelines,
	createManyDrugs,
	createManyPrescribedItems,
	createManyPrescriptionLogs,
	createManyPrescriptions,
	createPrescribedItem,
	createPrescription,
	createPrescriptionLog,
	deleteDoseGuideline,
	deleteDrug,
	deletePrescribedItem,
	deletePrescription,
	deletePrescriptionLog,
	dispenseMedication,
	getDoseGuidelines,
	getDrugsByIds,
	getPatientActivePrescriptions,
	getPatientAllergies,
	getPrescribedItem,
	getPrescribedItemsByPrescriptionId,
	getPrescriptionById,
	getPrescriptionsByDateRange,
	getPrescriptionsForAnalytics,
	getPrescriptionWithItems,
	listDrugs,
	updateDoseGuideline,
	updateDrug,
	updateManyDoseGuidelines,
	updateManyDrugs,
	updateManyPrescribedItems,
	updateManyPrescriptionLogs,
	updateManyPrescriptions,
	updatePrescribedItem,
	updatePrescription,
	updatePrescriptionLog,
	updatePrescriptionStatus
};
