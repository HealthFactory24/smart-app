// db/repositories/patient.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";
import type { PatientCreateInput, PatientUpdateInput } from "@/db/zod";

// =======================
// Zod Validators
// =======================

const patientIdSchema = z.object({
	id: z.string().min(1),
	clinicId: z.string().min(1)
});

const clinicIdOnlySchema = z.object({
	clinicId: z.string().min(1)
});

const listPatientsSchema = z.object({
	clinicId: z.string().min(1),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
	search: z.string().optional(),
	status: z.enum(schema.statusEnum.enumValues).optional(),
	isActive: z.boolean().optional(),
	gender: z.enum(schema.genderEnum.enumValues).optional(),
	bloodGroup: z.enum(schema.bloodGroupEnum.enumValues).optional()
});

const createPatientSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string(),
	userId: z.string(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	emergencyContactNumber: z.string().optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	dateOfBirth: z.date(),
	gender: z.enum(schema.genderEnum.enumValues).optional(),
	maritalStatus: z.enum(schema.maritalStatusEnum.enumValues).optional(),
	nutritionalStatus: z.enum(schema.nutritionalStatusEnum.enumValues).optional(),
	address: z.string().optional(),
	emergencyContactName: z.string().optional(),
	mrn: z.string().optional(),
	relation: z.string().optional(),
	guardianId: z.string().optional(),
	allergies: z.string().optional(),
	medicalConditions: z.string().optional(),
	medicalHistory: z.string().optional(),
	image: z.string().optional(),
	colorCode: z.string().optional(),
	role: z.enum(schema.roleEnum.enumValues).optional(),
	status: z.enum(schema.statusEnum.enumValues).default("ACTIVE"),
	isActive: z.boolean().default(true),
	bloodGroup: z.enum(schema.bloodGroupEnum.enumValues).optional(),
	createdById: z.string().optional(),
	updatedById: z.string().optional()
});

const updatePatientSchema = createPatientSchema.partial();

const bulkUpdateStatusSchema = z.object({
	patientIds: z.array(z.string()),
	status: z.enum(schema.statusEnum.enumValues)
});

const dateRangeSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

const ageRangeSchema = z.object({
	clinicId: z.string(),
	minAgeMonths: z.number(),
	maxAgeMonths: z.number()
});

const searchSchema = z.object({
	clinicId: z.string(),
	searchTerm: z.string().min(1)
});

const patientWithGuardianSchema = z.object({
	patientData: createPatientSchema,
	guardianData: z
		.object({
			userId: z.string(),
			relation: z.string(),
			isPrimary: z.boolean().optional(),
			phone: z.string().optional(),
			email: z.string().email().optional()
		})
		.optional()
});

// =======================
// Helper Functions (Server-side only)
// =======================

function validatePatientData(data: PatientCreateInput | PatientUpdateInput) {
	if (data.email && !data.email.includes("@")) {
		return { valid: false, error: "Invalid email address" };
	}
	if (data.phone && data.phone.length < 5) {
		return { valid: false, error: "Phone number too short" };
	}
	if (data.dateOfBirth && data.dateOfBirth > new Date()) {
		return { valid: false, error: "Date of birth cannot be in the future" };
	}
	return { valid: true };
}

// =======================
// Server Functions
// =======================

export const validatePatient = createServerFn({ method: "POST" })
	.validator(z.object({ data: z.any() }))
	.handler(async ctx => {
		return validatePatientData(ctx.data.data);
	});

export const getPatientById = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: {
					id,
					clinicId,
					isDeleted: false
				},
				with: {
					user: true,
					clinic: true
				}
			});
			return patient;
		} catch (error) {
			console.error("Error getting patient by ID:", error);
			throw new Error("Failed to get patient");
		}
	});

export const generateMRN = createServerFn({ method: "POST" })
	.validator(clinicIdOnlySchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const lastPatient = await db.query.patient.findFirst({
				where: {
					clinicId,
					isDeleted: false
				},
				orderBy: (patient, { desc }) => desc(patient.createdAt)
			});

			if (lastPatient?.mrn) {
				const match = lastPatient.mrn.match(/\d/);
				if (match) {
					const nextNumber = Number.parseInt(match[0], 10);
					return `MRN-${nextNumber.toString().padStart(6, "0")}`;
				}
			}
			return "MRN-000001";
		} catch (error) {
			console.error("Error generating MRN:", error);
			throw new Error("Failed to generate MRN");
		}
	});

export const getPatientByUserId = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: {
					userId,
					clinicId,
					isDeleted: false
				},
				with: { user: true }
			});
			return patient;
		} catch (error) {
			console.error("Error getting patient by user ID:", error);
			throw new Error("Failed to get patient");
		}
	});

export const getPatientByMRN = createServerFn({ method: "GET" })
	.validator(z.object({ mrn: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { mrn, clinicId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: {
					clinicId,
					isDeleted: false,
					mrn
				}
			});
			return patient;
		} catch (error) {
			console.error("Error getting patient by MRN:", error);
			throw new Error("Failed to get patient");
		}
	});

export const listPatients = createServerFn({ method: "POST" })
	.validator(listPatientsSchema)
	.handler(async ctx => {
		try {
			const { clinicId, limit, offset, search, status, isActive, gender, bloodGroup } = ctx.data;

			// Start with a dynamic query builder
			const baseConditions = and(eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false));

			let query = db
				.select()
				.from(schema.patient)
				.leftJoin(schema.user, eq(schema.patient.userId, schema.user.id))
				.where(baseConditions)
				.$dynamic(); // Enable dynamic mode

			// Add filters dynamically
			if (status) {
				query = query.where(eq(schema.patient.status, status));
			}

			if (isActive !== undefined) {
				query = query.where(eq(schema.patient.isActive, isActive));
			}

			if (gender) {
				query = query.where(eq(schema.patient.gender, gender));
			}

			if (bloodGroup) {
				query = query.where(eq(schema.patient.bloodGroup, bloodGroup));
			}

			// Add search with OR condition
			if (search) {
				query = query.where(
					or(
						like(schema.patient.mrn, `%${search}%`),
						like(schema.patient.firstName, `%${search}%`),
						like(schema.patient.lastName, `%${search}%`),
						like(schema.patient.email, `%${search}%`),
						like(schema.patient.phone, `%${search}%`)
					)
				);
			}

			// Add pagination and ordering
			query = query.limit(limit).offset(offset).orderBy(asc(schema.patient.lastName));

			// Execute the main query
			const results = await query;

			// Transform joined results to match expected format
			const patients = results.map(result => ({
				...result.patient,
				user: result.user
			}));

			// Build count query separately (simpler, doesn't need dynamic mode)
			const countConditions = [];
			countConditions.push(eq(schema.patient.clinicId, clinicId));
			countConditions.push(eq(schema.patient.isDeleted, false));

			if (status) countConditions.push(eq(schema.patient.status, status));
			if (isActive !== undefined) countConditions.push(eq(schema.patient.isActive, isActive));
			if (gender) countConditions.push(eq(schema.patient.gender, gender));
			if (bloodGroup) countConditions.push(eq(schema.patient.bloodGroup, bloodGroup));

			if (search) {
				countConditions.push(
					or(
						like(schema.patient.mrn, `%${search}%`),
						like(schema.patient.firstName, `%${search}%`),
						like(schema.patient.lastName, `%${search}%`),
						like(schema.patient.email, `%${search}%`),
						like(schema.patient.phone, `%${search}%`)
					)
				);
			}

			const totalResult = await db
				.select({ count: count() })
				.from(schema.patient)
				.where(and(...countConditions));

			return {
				patients,
				total: Number(totalResult[0]?.count ?? 0)
			};
		} catch (error) {
			console.error("Error listing patients:", error);
			throw new Error("Failed to list patients");
		}
	});
export const createPatient = createServerFn({ method: "POST" })
	.validator(createPatientSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const now = new Date();

			const [result] = await db
				.insert(schema.patient)
				.values({
					id: data.id || crypto.randomUUID(),
					...data,
					createdAt: now,
					updatedAt: now
				})
				.returning();

			return result;
		} catch (error) {
			console.error("Error creating patient:", error);
			throw new Error("Failed to create patient");
		}
	});

export const updatePatient = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: updatePatientSchema }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.patient)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.patient.id, id))
				.returning();

			if (!result) {
				throw new Error("Patient not found");
			}
			return result;
		} catch (error) {
			console.error("Error updating patient:", error);
			throw new Error("Failed to update patient");
		}
	});

export const softDeletePatient = createServerFn({ method: "POST" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const [result] = await db
				.update(schema.patient)
				.set({ deletedAt: new Date(), isDeleted: true })
				.where(and(eq(schema.patient.id, id), eq(schema.patient.clinicId, clinicId)))
				.returning();

			if (!result) {
				throw new Error("Patient not found");
			}
			return result;
		} catch (error) {
			console.error("Error deleting patient:", error);
			throw new Error("Failed to delete patient");
		}
	});

export const bulkUpdatePatientStatus = createServerFn({ method: "POST" })
	.validator(bulkUpdateStatusSchema)
	.handler(async ctx => {
		try {
			const { patientIds, status } = ctx.data;
			const updateData = { status, updatedAt: new Date(), isActive: false };
			if (status === "INACTIVE") {
				updateData.isActive = false;
			}

			const result = await db
				.update(schema.patient)
				.set(updateData)
				.where(inArray(schema.patient.id, patientIds))
				.returning();

			return result;
		} catch (error) {
			console.error("Error bulk updating patient status:", error);
			throw new Error("Failed to bulk update patient status");
		}
	});

export const getPatientWithFullHistory = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: { id, clinicId, isDeleted: false },

				with: {
					user: true,
					clinic: true,
					guardians: {
						with: { user: true }
					},
					appointments: {
						where: { isDeleted: false },
						with: { doctor: true, service: true },
						orderBy: (appointment, { desc }) => desc(appointment.appointmentDate)
					},
					medicalRecords: {
						with: {
							doctor: true,
							appointment: true,
							vitalSigns: true,
							prescriptions: {
								with: {
									prescribedItems: {
										with: { drug: true }
									}
								}
							}
						},
						orderBy: (record, { desc }) => desc(record.createdAt)
					},
					vitalSigns: {
						orderBy: (vs, { desc }) => desc(vs.recordedAt),
						limit: 10
					},
					growthRecords: {
						orderBy: (gr, { desc }) => desc(gr.date)
					},
					immunizations: {
						with: { administeredBy: true },
						orderBy: (imm, { desc }) => desc(imm.date)
					},
					labTests: {
						with: { service: true },
						orderBy: (lab, { desc }) => desc(lab.testDate)
					},
					prescriptions: {
						with: {
							doctor: true,
							prescribedItems: {
								with: { drug: true }
							}
						},
						orderBy: (pres, { desc }) => desc(pres.issuedDate)
					},
					payments: {
						orderBy: (payment, { desc }) => desc(payment.paymentDate)
					},
					feedingLogs: {
						orderBy: (log, { desc }) => desc(log.date)
					},
					developmentalChecks: {
						orderBy: (check, { desc }) => desc(check.checkDate)
					}
				}
			});

			return patient;
		} catch (error) {
			console.error("Error getting patient full history:", error);
			throw new Error("Failed to get patient history");
		}
	});

export const getPatientUpcomingAppointments = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const appointments = await db.query.appointment.findMany({
				where: {
					patientId: id,
					clinicId: clinicId,
					isDeleted: false,
					appointmentDate: {
						gte: new Date()
					},
					status: {
						notIn: ["CANCELLED", "COMPLETED"]
					}
				},
				with: { doctor: true, service: true, clinic: true },
				orderBy: (appointment, { asc }) => asc(appointment.appointmentDate)
			});

			return appointments;
		} catch (error) {
			console.error("Error getting upcoming appointments:", error);
			throw new Error("Failed to get upcoming appointments");
		}
	});

export const getPatientStats = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;

			// Appointment stats using SQLite
			const appointmentStats = await db
				.select({
					total: sql<number>`CAST(count(*) AS INTEGER)`,
					completed: sql<number>`CAST(sum(CASE WHEN ${schema.appointment.status} = 'COMPLETED' THEN 1 ELSE 0 END) AS INTEGER)`,
					cancelled: sql<number>`CAST(sum(CASE WHEN ${schema.appointment.status} = 'CANCELLED' THEN 1 ELSE 0 END) AS INTEGER)`,
					lastVisit: sql<Date | null>`max(CASE WHEN ${schema.appointment.status} = 'COMPLETED' THEN ${schema.appointment.appointmentDate} ELSE NULL END)`,
					nextAppointment: sql<Date | null>`min(CASE WHEN ${schema.appointment.appointmentDate} > CURRENT_TIMESTAMP AND ${schema.appointment.status} NOT IN ('CANCELLED', 'COMPLETED') THEN ${schema.appointment.appointmentDate} ELSE NULL END)`
				})
				.from(schema.appointment)
				.where(and(eq(schema.appointment.patientId, patientId), eq(schema.appointment.isDeleted, false)));

			// Payment stats
			const paymentStats = await db
				.select({
					total: sql<number>`CAST(count(*) AS INTEGER)`,
					paidAmount: sql<number>`COALESCE(CAST(sum(${schema.payment.amountPaid}) AS INTEGER), 0)`,
					totalAmount: sql<number>`COALESCE(CAST(sum(${schema.payment.totalAmount}) AS INTEGER), 0)`
				})
				.from(schema.payment)
				.where(and(eq(schema.payment.patientId, patientId), eq(schema.payment.isDeleted, false)));

			// Prescription stats
			const prescriptionStats = await db
				.select({
					total: sql<number>`CAST(count(*) AS INTEGER)`,
					active: sql<number>`CAST(sum(CASE WHEN ${schema.prescription.status} = 'active' THEN 1 ELSE 0 END) AS INTEGER)`
				})
				.from(schema.prescription)
				.where(eq(schema.prescription.patientId, patientId));

			// Immunization count
			const immunizationCount = await db
				.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
				.from(schema.immunization)
				.where(and(eq(schema.immunization.patientId, patientId), eq(schema.immunization.isDeleted, false)));

			const stats = appointmentStats[0];
			const payments = paymentStats[0];
			const prescriptions = prescriptionStats[0];
			const immunizations = immunizationCount[0];

			return {
				totalAppointments: stats?.total ?? 0,
				completedAppointments: stats?.completed ?? 0,
				cancelledAppointments: stats?.cancelled ?? 0,
				totalPayments: payments?.total ?? 0,
				paidAmount: payments?.paidAmount ?? 0,
				dueAmount: (payments?.totalAmount ?? 0) - (payments?.paidAmount ?? 0),
				totalPrescriptions: prescriptions?.total ?? 0,
				activePrescriptions: prescriptions?.active ?? 0,
				totalImmunizations: immunizations?.count ?? 0,
				lastVisit: stats?.lastVisit ?? null,
				nextAppointment: stats?.nextAppointment ?? null
			};
		} catch (error) {
			console.error("Error getting patient stats:", error);
			throw new Error("Failed to get patient stats");
		}
	});

export const getGuardiansByPatient = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			const guardians = await db.query.guardian.findMany({
				where: { patientId },
				with: { user: true }
			});
			return guardians;
		} catch (error) {
			console.error("Error getting guardians:", error);
			throw new Error("Failed to get guardians");
		}
	});

export const createGuardian = createServerFn({ method: "POST" })
	.validator(
		z.object({
			patientId: z.string(),
			userId: z.string(),
			relation: z.string(),
			isPrimary: z.boolean().optional(),
			phone: z.string().optional(),
			email: z.string().email().optional()
		})
	)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.guardian)
				.values({
					id: crypto.randomUUID(),
					...data,
					isPrimary: data.isPrimary ?? false
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating guardian:", error);
			throw new Error("Failed to create guardian");
		}
	});

export const getPatientsCreatedBetween = createServerFn({ method: "POST" })
	.validator(dateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				},

				columns: { createdAt: true, id: true, firstName: true, lastName: true }
			});
			return patients;
		} catch (error) {
			console.error("Error getting patients by date range:", error);
			throw new Error("Failed to get patients");
		}
	});

export const getPatientsByAgeRange = createServerFn({ method: "POST" })
	.validator(ageRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, minAgeMonths, maxAgeMonths } = ctx.data;
			const minDate = new Date();
			minDate.setMonth(minDate.getMonth() - maxAgeMonths);
			const maxDate = new Date();
			maxDate.setMonth(maxDate.getMonth() - minAgeMonths);

			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					dateOfBirth: {
						gte: minDate,
						lte: maxDate
					}
				},
				with: {
					user: true,
					guardians: true
				},
				orderBy: (patient, { desc }) => desc(patient.dateOfBirth)
			});
			return patients;
		} catch (error) {
			console.error("Error getting patients by age range:", error);
			throw new Error("Failed to get patients");
		}
	});

export const getPatientsWithAppointmentsThisWeek = createServerFn({ method: "GET" })
	.validator(clinicIdOnlySchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const startOfWeek = new Date();
			startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
			startOfWeek.setHours(0, 0, 0, 0);

			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(endOfWeek.getDate());

			const appointments = await db.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					status: "CONFIRMED",
					appointmentDate: {
						gte: startOfWeek,
						lte: endOfWeek
					}
				},
				with: {
					patient: {
						with: {
							guardians: true
						}
					},
					doctor: true
				},
				orderBy: (appointment, { asc }) => asc(appointment.appointmentDate)
			});
			return appointments;
		} catch (error) {
			console.error("Error getting weekly appointments:", error);
			throw new Error("Failed to get weekly appointments");
		}
	});

export const getPatientGrowthPercentiles = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const patient = await db.query.patient.findFirst({
				where: { id, clinicId, isDeleted: false },

				with: {
					growthRecords: {
						orderBy: (record, { asc }) => asc(record.date)
					}
				}
			});

			if (!patient?.growthRecords.length) {
				return null;
			}

			const whoStandards = await db.query.whoGrowthStandard.findMany({
				where: { gender: patient.gender as "MALE" | "FEMALE", measurementType: "BMI" }
			});

			// Calculate percentiles for each growth record
			const growthWithPercentiles = patient.growthRecords.map(record => {
				const standard = whoStandards.find(s => Math.abs(s.ageDays - (record.ageDays ?? 0)) <= 30);

				let percentile = null;
				if (standard && record.bmi) {
					// Simple percentile calculation (simplified)
					if (record.bmi <= standard.sd3neg) percentile = 1;
					else if (record.bmi <= standard.sd2neg) percentile = 2;
					else if (record.bmi <= standard.sd1neg) percentile = 5;
					else if (record.bmi >= standard.sd3pos) percentile = 99;
					else if (record.bmi >= standard.sd2pos) percentile = 97;
					else if (record.bmi >= standard.sd1pos) percentile = 85;
					else percentile = 50;
				}

				return { ...record, percentile };
			});

			return growthWithPercentiles;
		} catch (error) {
			console.error("Error calculating growth percentiles:", error);
			throw new Error("Failed to calculate growth percentiles");
		}
	});

export const getNeonatalAssessment = createServerFn({ method: "GET" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const assessment = await db.query.neonatalAssessment.findFirst({
				where: { patientId: id, clinicId }
			});
			return assessment;
		} catch (error) {
			console.error("Error getting neonatal assessment:", error);
			throw new Error("Failed to get neonatal assessment");
		}
	});

export const getAppointmentStats = createServerFn({ method: "GET" })
	.validator(clinicIdOnlySchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const totalAppointments = await db.$count(
				schema.appointment,
				and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false))
			);

			const detailedStats = await db
				.select({
					completed: sql<number>`CAST(sum(CASE WHEN ${schema.appointment.status} = 'COMPLETED' THEN 1 ELSE 0 END) AS INTEGER)`,
					cancelled: sql<number>`CAST(sum(CASE WHEN ${schema.appointment.status} = 'CANCELLED' THEN 1 ELSE 0 END) AS INTEGER)`
				})
				.from(schema.appointment)
				.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)));

			const stats = detailedStats[0];
			return {
				totalAppointments,
				completedAppointments: stats?.completed ?? 0,
				cancelledAppointments: stats?.cancelled ?? 0
			};
		} catch (error) {
			console.error("Error getting appointment stats:", error);
			throw new Error("Failed to get appointment stats");
		}
	});

export const getPrescriptionStats = createServerFn({ method: "GET" })
	.validator(clinicIdOnlySchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const totalPrescriptions = await db.$count(schema.prescription, eq(schema.prescription.clinicId, clinicId));

			const detailedStats = await db
				.select({
					active: sql<number>`CAST(sum(CASE WHEN ${schema.prescription.status} = 'active' THEN 1 ELSE 0 END) AS INTEGER)`,
					completed: sql<number>`CAST(sum(CASE WHEN ${schema.prescription.status} = 'completed' THEN 1 ELSE 0 END) AS INTEGER)`,
					cancelled: sql<number>`CAST(sum(CASE WHEN ${schema.prescription.status} = 'cancelled' THEN 1 ELSE 0 END) AS INTEGER)`
				})
				.from(schema.prescription)
				.where(eq(schema.prescription.clinicId, clinicId));

			const stats = detailedStats[0];
			return {
				totalPrescriptions,
				activePrescriptions: stats?.active ?? 0,
				completedPrescriptions: stats?.completed ?? 0,
				cancelledPrescriptions: stats?.cancelled ?? 0
			};
		} catch (error) {
			console.error("Error getting prescription stats:", error);
			throw new Error("Failed to get prescription stats");
		}
	});

export const getPatientsByClinic = createServerFn({ method: "GET" })
	.validator(clinicIdOnlySchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const patients = await db.query.patient.findMany({
				where: { clinicId, isDeleted: false },
				with: { user: true },
				orderBy: (patient, { asc }) => asc(patient.lastName)
			});
			return patients;
		} catch (error) {
			console.error("Error getting patients by clinic:", error);
			throw new Error("Failed to get patients");
		}
	});

export const searchPatients = createServerFn({ method: "POST" })
	.validator(searchSchema)
	.handler(async ctx => {
		try {
			const { clinicId, searchTerm } = ctx.data;
			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					or: [
						like(schema.patient.mrn, `%${searchTerm}%`),
						like(schema.patient.firstName, `%${searchTerm}%`),
						like(schema.patient.lastName, `%${searchTerm}%`),
						like(schema.patient.email, `%${searchTerm}%`),
						like(schema.patient.phone, `%${searchTerm}%`)
					]
				},

				with: { user: true },
				limit: 20
			});
			return patients;
		} catch (error) {
			console.error("Error searching patients:", error);
			throw new Error("Failed to search patients");
		}
	});

export const createManyPatients = createServerFn({ method: "POST" })
	.validator(z.object({ patients: z.array(createPatientSchema) }))
	.handler(async ctx => {
		try {
			const { patients } = ctx.data;
			const now = new Date();
			const patientsWithIds = patients.map(p => ({
				...p,
				id: p.id || crypto.randomUUID(),
				createdAt: now,
				updatedAt: now
			}));

			const result = await db.insert(schema.patient).values(patientsWithIds).returning();
			return result;
		} catch (error) {
			console.error("Error creating multiple patients:", error);
			throw new Error("Failed to create patients");
		}
	});

export const updateManyPatients = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: updatePatientSchema }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.patient)
				.set({ ...data, updatedAt: new Date() })
				.where(inArray(schema.patient.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple patients:", error);
			throw new Error("Failed to update patients");
		}
	});

export const deletePatient = createServerFn({ method: "POST" })
	.validator(patientIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const [result] = await db
				.delete(schema.patient)
				.where(and(eq(schema.patient.id, id), eq(schema.patient.clinicId, clinicId)))
				.returning();

			if (!result) {
				throw new Error("Patient not found");
			}
			return result;
		} catch (error) {
			console.error("Error deleting patient:", error);
			throw new Error("Failed to delete patient");
		}
	});

export const restorePatient = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.patient)
				.set({ deletedAt: null, isDeleted: false })
				.where(eq(schema.patient.id, id))
				.returning();

			if (!result) {
				throw new Error("Patient not found");
			}
			return result;
		} catch (error) {
			console.error("Error restoring patient:", error);
			throw new Error("Failed to restore patient");
		}
	});

export const createPatientWithGuardian = createServerFn({ method: "POST" })
	.validator(patientWithGuardianSchema)
	.handler(async ctx => {
		try {
			const { patientData, guardianData } = ctx.data;
			const now = new Date();

			const result = await db.transaction(async tx => {
				// Create patient
				const [patient] = await tx
					.insert(schema.patient)
					.values({
						id: patientData.id || crypto.randomUUID(),
						...patientData,
						createdAt: now,
						updatedAt: now
					})
					.returning();

				// Create guardian if provided
				if (guardianData && patient) {
					await tx.insert(schema.guardian).values({
						id: crypto.randomUUID(),
						patientId: patient.id,
						...guardianData,
						isPrimary: guardianData.isPrimary ?? false
					});
				}

				// Create initial growth record if age appropriate
				if (patient?.dateOfBirth) {
					const ageInDays = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));

					if (ageInDays <= 730) {
						// First 2 years
						await tx.insert(schema.growthRecord).values({
							id: crypto.randomUUID(),
							patientId: patient.id,
							clinicId: patient.clinicId,
							date: new Date(),
							ageDays: ageInDays,
							ageMonths: Math.floor(ageInDays / 30),
							gender: patient.gender as schema.Gender,
							recordedAt: new Date(),
							createdAt: now,
							updatedAt: now
						});
					}
				}

				return patient;
			});

			return result;
		} catch (error) {
			console.error("Error creating patient with guardian:", error);
			throw new Error("Failed to create patient with guardian");
		}
	});

export const updateGuardian = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: z.any() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db.update(schema.guardian).set(data).where(eq(schema.guardian.id, id)).returning();

			if (!result) {
				throw new Error("Guardian not found");
			}
			return result;
		} catch (error) {
			console.error("Error updating guardian:", error);
			throw new Error("Failed to update guardian");
		}
	});

export const updateManyGuardians = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.any() }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const result = await db
				.update(schema.guardian)
				.set(data)
				.where(inArray(schema.guardian.id, ids))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating multiple guardians:", error);
			throw new Error("Failed to update guardians");
		}
	});

export const deleteGuardian = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.guardian).where(eq(schema.guardian.id, id)).returning();

			if (!result) {
				throw new Error("Guardian not found");
			}
			return result;
		} catch (error) {
			console.error("Error deleting guardian:", error);
			throw new Error("Failed to delete guardian");
		}
	});

export const getPatientsInDateRange = createServerFn({ method: "POST" })
	.validator(dateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				},
				columns: { createdAt: true, id: true }
			});
			return patients;
		} catch (error) {
			console.error("Error getting patients in date range:", error);
			throw new Error("Failed to get patients");
		}
	});
// Add to functions/patient.ts
export const getPatientsCount = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			search: z.string().optional(),
			status: z.enum(schema.statusEnum.enumValues).optional()
		})
	)
	.handler(async ({ data }) => {
		try {
			const { clinicId, search, status } = data;

			const conditions = [eq(schema.patient.clinicId, clinicId), eq(schema.patient.isDeleted, false)];

			if (search?.trim()) {
				const searchCondition = or(
					ilike(schema.patient.mrn, `%${search}%`),
					ilike(schema.patient.firstName, `%${search}%`),
					ilike(schema.patient.lastName, `%${search}%`),
					ilike(schema.patient.email, `%${search}%`),
					ilike(schema.patient.phone, `%${search}%`)
				);

				if (searchCondition) {
					conditions.push(searchCondition);
				}
			}

			if (status && (status as string) !== "all") {
				conditions.push(eq(schema.patient.status, status));
			}

			const [{ count: total }] = await db
				.select({
					count: count()
				})
				.from(schema.patient)
				.where(and(...conditions));

			return {
				count: Number(total)
			};
		} catch (error) {
			console.error("Error counting patients:", error);
			throw new Error("Failed to count patients");
		}
	});
