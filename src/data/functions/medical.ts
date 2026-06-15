// db/repo/medical.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, gte, lte, type SQL } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

import { recordGrowthWithPercentiles } from "./pediatric";

// =======================
// Schema Validators
// =======================

const medicalRecordCountSchema = z.object({
	clinicId: z.string(),
	patientId: z.string().optional(),
	doctorId: z.string().optional()
});
const vitalSignsListSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	fromDate: z.date(),
	toDate: z.date(),
	pageSize: z.number().default(50),
	page: z.number().default(1)
});
const medicalRecordListSchema = z.object({
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	clinicId: z.string(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});
const medicalRecordIdSchema = z.object({ recordId: z.string(), clinicId: z.string() });
const patientMedicalRecordsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	limit: z.number().default(50),
	offset: z.number().default(0)
});
const encounterIdSchema = z.object({ id: z.string(), clinicId: z.string() });
const patientEncountersSchema = z.object({ patientId: z.string(), clinicId: z.string() });
const trendDataSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	days: z.number().default(30)
});
const vitalSignsParamsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	limit: z.number().optional(),
	page: z.number().default(1),
	pageSize: z.number().default(50),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	encounterId: z.string().optional()
});
const vitalSignIdSchema = z.object({ id: z.string(), clinicId: z.string() });
const checkAccessSchema = z.object({ userId: z.string(), patientId: z.string() });
const paymentIdSchema = z.object({ id: z.string() });
const patientPaymentsSchema = z.object({ patientId: z.string() });
const appointmentPaymentsSchema = z.object({ appointmentId: z.string() });
const listPaymentsSchema = z.object({
	clinicId: z.string(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	status: z.string().optional(),
	limit: z.number(),
	offset: z.number()
});
const clinicRevenueSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});
const processPaymentSchema = z.object({
	paymentId: z.string(),
	amountPaid: z.number(),
	paymentMethod: z.string(),
	notes: z.string().optional()
});
const appointmentTimeSchema = z.object({ appointmentId: z.string() });
const patientBillSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string(),
	billId: z.string(),
	serviceId: z.string(),
	serviceDate: z.date(),
	quantity: z.number(),
	unitCost: z.number().optional(),
	totalCost: z.number().optional()
});
const vitalSignCreateSchema = z.object({
	id: z.string().optional(),
	clinicId: z.string().optional(),
	patientId: z.string(),
	medicalId: z.string(),
	encounterId: z.string().optional(),
	growthRecordId: z.string().optional(),
	recordedAt: z.date().optional(),
	bodyTemperature: z.number().optional(),
	systolic: z.number().optional(),
	diastolic: z.number().optional(),
	heartRate: z.number().optional(),
	weight: z.number().optional(),
	height: z.number().optional(),
	bmi: z.number().optional(),
	respiratoryRate: z.number().optional(),
	oxygenSaturation: z.number().optional(),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
	notes: z.string().optional(),
	ageDays: z.number().optional(),
	ageMonths: z.number().optional()
});
const diagnosisCreateSchema = z.object({
	id: z.string().optional(),
	patientId: z.string(),
	doctorId: z.string(),
	clinicId: z.string().optional(),
	appointmentId: z.string().optional(),
	medicalId: z.string(),
	date: z.date().optional(),
	type: z.string().optional(),
	diagnosis: z.string().optional(),
	status: z.enum(schema.statusEnum.enumValues).optional(),
	treatment: z.string().optional(),
	notes: z.string().optional(),
	symptoms: z.string(),
	prescribedMedications: z.string().optional(),
	followUpPlan: z.string().optional()
});
const medicalRecordCreateSchema = z.object({
	id: z.string().optional(),
	patientId: z.string(),
	appointmentId: z.string(),
	doctorId: z.string(),
	clinicId: z.string(),
	diagnosis: z.string().optional(),
	symptoms: z.string().optional(),
	treatmentPlan: z.string().optional(),
	labRequest: z.string().optional(),
	notes: z.string().optional(),
	attachments: z.string().optional(),
	diagnosisDate: z.date().optional(),
	status: z.enum(schema.statusEnum.enumValues).optional(),
	medications: z.string().optional(),
	followUpDate: z.date().optional()
});
const completeEncounterSchema = z.object({
	medicalRecordId: z.string(),
	diagnosisId: z.string().optional(),
	notes: z.string().optional(),
	followUpDate: z.date().optional(),
	prescribedMedications: z
		.array(
			z.object({
				drugId: z.string(),
				dosageValue: z.number(),
				dosageUnit: z.string(),
				frequency: z.enum([
					"ONCE_DAILY",
					"TWICE_DAILY",
					"THREE_TIMES_DAILY",
					"FOUR_TIMES_DAILY",
					"EVERY_OTHER_DAY",
					"WEEKLY",
					"MONTHLY",
					"AS_NEEDED"
				]),
				duration: z.string(),
				instructions: z.string().optional()
			})
		)
		.optional()
});
const addVitalSignsSchema = z.object({
	medicalRecordId: z.string(),
	vitalSigns: z.object({
		patientId: z.string(),
		recordedAt: z.date().optional(),
		bodyTemperature: z.number().optional(),
		systolic: z.number().optional(),
		diastolic: z.number().optional(),
		heartRate: z.number().optional(),
		weight: z.number().optional(),
		height: z.number().optional(),
		bmi: z.number().optional(),
		respiratoryRate: z.number().optional(),
		oxygenSaturation: z.number().optional(),
		gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
		notes: z.string().optional(),
		growthRecordId: z.string().optional(),
		ageDays: z.number().optional(),
		ageMonths: z.number().optional()
	})
});
const createCompleteEncounterSchema = z.object({
	medicalRecord: medicalRecordCreateSchema,
	diagnoses: z.array(diagnosisCreateSchema),
	vitalSigns: z.array(vitalSignCreateSchema).optional(),
	growthRecord: z
		.array(
			z.object({
				patientId: z.string(),
				clinicId: z.string(),
				gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
				ageDays: z.number().optional(),
				ageMonths: z.number().optional(),
				headCircumference: z.number().optional(),
				bmi: z.number().optional(),
				percentile: z.number().optional(),
				weightForAgeZ: z.number().optional(),
				heightForAgeZ: z.number().optional(),
				bmiForAgeZ: z.number().optional(),
				hcForAgeZ: z.number().optional(),
				weight: z.number(),
				height: z.number(),
				notes: z.string().optional(),
				date: z.date()
			})
		)
		.optional()
});

// =======================
// Medical Record Count
// =======================

export const countMedicalRecord = createServerFn({ method: "GET" })
	.validator(medicalRecordCountSchema)
	.handler(async ctx => {
		try {
			const { clinicId, patientId, doctorId } = ctx.data;
			return await db.$count(
				schema.medicalRecord,
				and(
					eq(schema.medicalRecord.clinicId, clinicId),
					patientId ? eq(schema.medicalRecord.patientId, patientId) : undefined,
					doctorId ? eq(schema.medicalRecord.doctorId, doctorId) : undefined,
					eq(schema.medicalRecord.isDeleted, false)
				)
			);
		} catch (error) {
			console.error("Error counting medical records:", error);
			throw new Error("Failed to count medical records");
		}
	});

// =======================
// Vital Signs Queries
// =======================

export const listVitalSignsByPatient = createServerFn({ method: "GET" })
	.validator(vitalSignsListSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, fromDate, toDate, pageSize, page } = ctx.data;
			const whereConditions = {
				patientId,
				clinicId,
				recordedAt: {
					lte: fromDate,
					gte: toDate
				}
			};

			if (fromDate || toDate) {
				if (fromDate) whereConditions.recordedAt.gte = fromDate;
				if (toDate) whereConditions.recordedAt.lte = toDate;
			}

			return await db.query.vitalSign.findMany({
				where: whereConditions,
				orderBy: { recordedAt: "desc" },
				limit: pageSize,
				offset: (page - 1) * pageSize
			});
		} catch (error) {
			console.error("Error listing vital signs:", error);
			throw new Error("Failed to list vital signs");
		}
	});

export const listMedicalRecord = createServerFn({ method: "GET" })
	.validator(medicalRecordListSchema)
	.handler(async ctx => {
		try {
			const { patientId, doctorId, clinicId, limit, offset } = ctx.data;
			const whereConditions = {
				clinicId,
				patientId,
				doctorId,
				isDeleted: false
			};

			if (patientId) whereConditions.patientId = patientId;
			if (doctorId) whereConditions.doctorId = doctorId;

			return await db.query.medicalRecord.findMany({
				where: whereConditions,
				with: {
					patient: true,
					doctor: true,
					appointment: true,
					prescriptions: {
						with: {
							prescribedItems: {
								with: {
									drug: true
								}
							}
						}
					}
				},
				orderBy: { createdAt: "desc" },
				limit,
				offset
			});
		} catch (error) {
			console.error("Error listing medical records:", error);
			throw new Error("Failed to list medical records");
		}
	});

export const getMedicalRecordById = createServerFn({ method: "GET" })
	.validator(medicalRecordIdSchema)
	.handler(async ctx => {
		try {
			const { recordId, clinicId } = ctx.data;
			return await db.query.medicalRecord.findFirst({
				where: {
					id: recordId,
					clinicId,
					isDeleted: false
				},
				with: {
					patient: true,
					doctor: true,
					appointment: true,
					prescriptions: {
						with: {
							prescribedItems: {
								with: {
									drug: true
								}
							}
						}
					}
				}
			});
		} catch (error) {
			console.error("Error getting medical record:", error);
			throw new Error("Failed to get medical record");
		}
	});

export const getPatientMedicalRecords = createServerFn({ method: "GET" })
	.validator(patientMedicalRecordsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, limit, offset } = ctx.data;
			return await db.query.medicalRecord.findMany({
				where: {
					patientId,
					clinicId,
					isDeleted: false
				},
				with: {
					doctor: true,
					appointment: true,
					prescriptions: {
						with: {
							prescribedItems: {
								with: {
									drug: true
								}
							}
						}
					}
				},
				orderBy: { createdAt: "desc" },
				limit,
				offset
			});
		} catch (error) {
			console.error("Error getting patient medical records:", error);
			throw new Error("Failed to get patient medical records");
		}
	});

export const getEncounterById = createServerFn({ method: "GET" })
	.validator(encounterIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			return await db.query.diagnosis.findFirst({
				where: { id, clinicId },
				with: {
					patient: true,
					doctor: true,
					appointment: true,
					prescriptions: true,
					labTest: true,
					medical: {
						with: {
							prescriptions: {
								with: {
									prescribedItems: {
										with: {
											drug: true
										}
									}
								}
							}
						}
					}
				}
			});
		} catch (error) {
			console.error("Error getting encounter:", error);
			throw new Error("Failed to get encounter");
		}
	});

export const getPatientEncounters = createServerFn({ method: "GET" })
	.validator(patientEncountersSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId } = ctx.data;
			const encounters = await db.query.diagnosis.findMany({
				where: { patientId, clinicId },
				orderBy: { createdAt: "desc" },
				with: { doctor: true, appointment: true, patient: true }
			});
			return encounters;
		} catch (error) {
			console.error("Error getting patient encounters:", error);
			throw new Error("Failed to get patient encounters");
		}
	});

export const getDiagnosesByMedicalRecordId = createServerFn({ method: "GET" })
	.validator(z.object({ medicalId: z.string() }))
	.handler(async ctx => {
		try {
			const { medicalId } = ctx.data;
			const diagnoses = await db.query.diagnosis.findMany({
				where: { medicalId },
				orderBy: { date: "desc" }
			});
			return diagnoses;
		} catch (error) {
			console.error("Error getting diagnoses by medical record:", error);
			throw new Error("Failed to get diagnoses");
		}
	});

export const getVitalSignsByMedicalRecordId = createServerFn({ method: "GET" })
	.validator(z.object({ medicalId: z.string() }))
	.handler(async ctx => {
		try {
			const { medicalId } = ctx.data;
			return await db.query.vitalSign.findMany({
				where: { medicalId },
				orderBy: { recordedAt: "desc" }
			});
		} catch (error) {
			console.error("Error getting vital signs by medical record:", error);
			throw new Error("Failed to get vital signs");
		}
	});

export const getTrendData = createServerFn({ method: "GET" })
	.validator(trendDataSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, days } = ctx.data;
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const [vitals, growth] = await Promise.all([
				db.query.vitalSign.findMany({
					where: {
						patientId,
						clinicId,
						recordedAt: { gte: startDate }
					},
					orderBy: { recordedAt: "asc" }
				}),
				db.query.growthRecord.findMany({
					where: {
						patientId,
						clinicId,
						date: { gte: startDate }
					},
					orderBy: { date: "asc" }
				})
			]);

			return { vitals, growth };
		} catch (error) {
			console.error("Error getting trend data:", error);
			throw new Error("Failed to get trend data");
		}
	});

export const getVitalSigns = createServerFn({ method: "GET" })
	.validator(vitalSignsParamsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, page = 1, pageSize = 50, limit, fromDate, toDate, encounterId } = ctx.data;
			const finalLimit = limit ?? pageSize;

			const whereConditions = {
				patientId,
				clinicId,
				recordedAt: {
					gte: fromDate,
					lte: toDate
				},
				encounterId
			};

			if (fromDate || toDate) {
				if (fromDate) whereConditions.recordedAt.gte = fromDate;
				if (toDate) whereConditions.recordedAt.lte = toDate;
			}

			if (encounterId) {
				whereConditions.encounterId = encounterId;
			}

			return await db.query.vitalSign.findMany({
				where: whereConditions,
				orderBy: { recordedAt: "desc" },
				limit: finalLimit,
				offset: (page - 1) * finalLimit
			});
		} catch (error) {
			console.error("Error getting vital signs:", error);
			throw new Error("Failed to get vital signs");
		}
	});

export const getLatestVitalSigns = createServerFn({ method: "GET" })
	.validator(z.object({ patientId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { patientId, clinicId } = ctx.data;
			return await db.query.vitalSign.findFirst({
				where: { patientId, clinicId },
				orderBy: { recordedAt: "desc" }
			});
		} catch (error) {
			console.error("Error getting latest vital signs:", error);
			throw new Error("Failed to get latest vital signs");
		}
	});

export const getVitalSignById = createServerFn({ method: "GET" })
	.validator(vitalSignIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			return await db.query.vitalSign.findFirst({
				where: { id, clinicId }
			});
		} catch (error) {
			console.error("Error getting vital sign by ID:", error);
			throw new Error("Failed to get vital sign");
		}
	});

export const checkVitalSignsAccess = createServerFn({ method: "GET" })
	.validator(checkAccessSchema)
	.handler(async ctx => {
		try {
			const { userId, patientId } = ctx.data;
			const userData = await db.query.user.findFirst({
				where: { id: userId },
				with: {
					patients: true,
					doctors: true
				}
			});

			if (!userData) {
				return false;
			}

			if (userData.role === "admin" || userData.role === "staff") {
				return true;
			}
			if (userData.role === "doctor" && userData.doctors) {
				return true;
			}
			if (userData.role === "patient" && Array.isArray(userData.patients)) {
				return userData.patients.some(p => p.id === patientId);
			}

			// Check if user is guardian
			const guardianRecord = await db.query.guardian.findFirst({
				where: {
					userId,
					patientId
				}
			});

			return !!guardianRecord;
		} catch (error) {
			console.error("Error checking vital signs access:", error);
			throw new Error("Failed to check access");
		}
	});

// =======================
// Billing & Payments
// =======================

export const createBillForAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ appointmentId: z.string() }))
	.handler(async ctx => {
		try {
			const { appointmentId } = ctx.data;
			return await db.transaction(async tx => {
				const appointment = await tx.query.appointment.findFirst({
					where: { id: appointmentId },
					with: {
						patient: true,
						doctor: true,
						service: true
					}
				});

				if (!appointment) {
					throw new Error("Appointment not found");
				}

				// Calculate total amount
				let totalAmount = appointment.appointmentPrice ?? 0;
				if (appointment.service) {
					totalAmount += appointment.service.price || 0;
				}

				// Create payment record
				const [payment] = await tx
					.insert(schema.payment)
					.values({
						id: crypto.randomUUID(),
						clinicId: appointment.clinicId,
						patientId: appointment.patientId,
						appointmentId: appointment.id,
						billDate: new Date(),
						totalAmount,
						amount: totalAmount,
						status: "PENDING",
						receiptNumber: Math.floor(Math.random() * 1_000_000)
					})
					.returning();

				return payment;
			});
		} catch (error) {
			console.error("Error creating bill for appointment:", error);
			throw new Error("Failed to create bill for appointment");
		}
	});

export const getPaymentById = createServerFn({ method: "GET" })
	.validator(paymentIdSchema)
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			return await db.query.payment.findFirst({
				where: { id },
				with: {
					patient: true,
					appointment: true
				}
			});
		} catch (error) {
			console.error("Error getting payment:", error);
			throw new Error("Failed to get payment");
		}
	});

export const getPaymentsByPatientId = createServerFn({ method: "GET" })
	.validator(patientPaymentsSchema)
	.handler(async ctx => {
		try {
			const { patientId } = ctx.data;
			return await db.query.payment.findMany({
				where: { patientId, isDeleted: false },
				orderBy: { paymentDate: "desc" }
			});
		} catch (error) {
			console.error("Error getting payments by patient:", error);
			throw new Error("Failed to get payments");
		}
	});

export const getPaymentsByAppointmentId = createServerFn({ method: "GET" })
	.validator(appointmentPaymentsSchema)
	.handler(async ctx => {
		try {
			const { appointmentId } = ctx.data;
			return await db.query.payment.findMany({
				where: { appointmentId, isDeleted: false }
			});
		} catch (error) {
			console.error("Error getting payments by appointment:", error);
			throw new Error("Failed to get payments");
		}
	});

export const listPayments = createServerFn({ method: "GET" })
	.validator(listPaymentsSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate, status, limit, offset } = ctx.data;

			const conditions: SQL[] = [eq(schema.payment.clinicId, clinicId), eq(schema.payment.isDeleted, false)];

			if (startDate) conditions.push(gte(schema.payment.paymentDate, startDate));
			if (endDate) conditions.push(lte(schema.payment.paymentDate, endDate));
			if (status) conditions.push(eq(schema.payment.status, status as schema.PaymentStatus));

			const whereConditions: Record<string, unknown> = {
				clinicId,
				isDeleted: false,
				status: status as schema.PaymentStatus | undefined
			};

			if (startDate || endDate) {
				whereConditions.paymentDate = {};
			}

			if (typeof whereConditions.paymentDate === "object" && whereConditions.paymentDate !== null) {
				if (startDate) (whereConditions.paymentDate as Record<string, unknown>).gte = startDate;
				if (endDate) (whereConditions.paymentDate as Record<string, unknown>).lte = endDate;
			}

			if (status) whereConditions.status = status;

			const [items, totalResult] = await Promise.all([
				db.query.payment.findMany({
					where: whereConditions,
					limit,
					offset,
					with: {
						patient: true,
						appointment: true
					},
					orderBy: { paymentDate: "desc" }
				}),
				db
					.select({ count: count() })
					.from(schema.payment)
					.where(and(...conditions))
			]);

			return {
				items,
				total: totalResult[0]?.count ?? 0
			};
		} catch (error) {
			console.error("Error listing payments:", error);
			throw new Error("Failed to list payments");
		}
	});

export const getClinicRevenue = createServerFn({ method: "GET" })
	.validator(clinicRevenueSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;
			const payments = await db.query.payment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				},
				with: {
					patient: true
				},
				orderBy: (payment, { desc }) => [desc(payment.createdAt)]
			});

			const totalRevenue = payments.reduce((sum, p) => sum + (p.status === "PAID" ? (p.amountPaid ?? 0) : 0), 0);
			const totalBilled = payments.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);

			const outstanding = Math.max(0, totalBilled - totalRevenue);

			const pendingClaims = payments.filter(p => p.paymentMethod === "INSURANCE" && p.status !== "PAID").length;

			const collectionRate = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 100;

			const transactions = payments.map(p => ({
				id: p.id,
				patientId: p.patientId || "",
				patientName: p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : "Unknown Patient",
				amount: p.totalAmount ?? 0,
				date: p.paymentDate || p.createdAt,
				type: p.status === "PAID" ? ("PAYMENT" as const) : ("INVOICE" as const),
				status: (p.status === "PAID"
					? "PAID"
					: p.status === "PENDING" || p.status === "PARTIAL"
						? "PENDING"
						: p.status === "UNPAID"
							? "OVERDUE"
							: "CANCELLED") as "PAID" | "PENDING" | "OVERDUE" | "CANCELLED",
				description: p.notes || undefined
			}));

			return {
				totalRevenue,
				totalBilled,
				monthlyRevenue: totalRevenue,
				revenueGrowth: 12,
				outstanding,
				pendingClaims,
				collectionRate,
				paymentCount: payments.length,
				averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0,
				payments,
				transactions
			};
		} catch (error) {
			console.error("Error getting clinic revenue:", error);
			throw new Error("Failed to get clinic revenue");
		}
	});

export const processPayment = createServerFn({ method: "POST" })
	.validator(processPaymentSchema)
	.handler(async ctx => {
		try {
			const { paymentId, amountPaid, paymentMethod, notes } = ctx.data;
			return await db.transaction(async tx => {
				const payment = await tx.query.payment.findFirst({
					where: { id: paymentId }
				});

				if (!payment) {
					throw new Error("Payment not found");
				}

				const [updatedPayment] = await tx
					.update(schema.payment)
					.set({
						amountPaid,
						paymentMethod: paymentMethod as schema.PaymentMethod,
						paymentDate: new Date(),
						paidDate: new Date(),
						status: amountPaid >= (payment.totalAmount ?? 0) ? "PAID" : "PARTIAL",
						notes,
						updatedAt: new Date()
					})
					.where(eq(schema.payment.id, paymentId))
					.returning();

				return updatedPayment;
			});
		} catch (error) {
			console.error("Error processing payment:", error);
			throw new Error("Failed to process payment");
		}
	});

export const getTimeLeftForAppointment = createServerFn({ method: "GET" })
	.validator(appointmentTimeSchema)
	.handler(async ctx => {
		try {
			const { appointmentId } = ctx.data;
			const record = await db.query.appointment.findFirst({
				with: {
					patient: true,
					doctor: true,
					clinic: true,
					service: true
				},
				where: { id: appointmentId }
			});

			if (!record?.appointmentDate) {
				return "Appointment not found or date missing";
			}

			const now = new Date();
			const appointmentTime = new Date(record.appointmentDate);

			const diffMs = appointmentTime.getTime() - now.getTime();
			if (diffMs < 0) return "Appointment has already passed";

			const diffMins = Math.floor(diffMs / (1000 * 60));
			const hours = Math.floor(diffMins / 60);
			const mins = diffMins % 60;

			if (hours > 0) {
				return `${hours} hours and ${mins} minutes remaining`;
			}
			return `${mins} minutes remaining`;
		} catch (error) {
			console.error("Error getting time left for appointment:", error);
			throw new Error("Failed to get time left");
		}
	});

// =======================
// Patient Bill CRUD
// =======================

export const createPatientBill = createServerFn({ method: "POST" })
	.validator(patientBillSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.patientBill)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating patient bill:", error);
			throw new Error("Failed to create patient bill");
		}
	});

export const updatePatientBill = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: patientBillSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.patientBill)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.patientBill.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating patient bill:", error);
			throw new Error("Failed to update patient bill");
		}
	});

export const deletePatientBill = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.patientBill).where(eq(schema.patientBill.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting patient bill:", error);
			throw new Error("Failed to delete patient bill");
		}
	});

// =======================
// Vital Sign CRUD
// =======================

export const createVitalSign = createServerFn({ method: "POST" })
	.validator(vitalSignCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.vitalSign)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating vital sign:", error);
			throw new Error("Failed to create vital sign");
		}
	});

export const updateVitalSign = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: vitalSignCreateSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.vitalSign)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.vitalSign.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating vital sign:", error);
			throw new Error("Failed to update vital sign");
		}
	});

export const deleteVitalSign = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.vitalSign).where(eq(schema.vitalSign.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting vital sign:", error);
			throw new Error("Failed to delete vital sign");
		}
	});

// =======================
// Diagnosis CRUD
// =======================

export const createDiagnosis = createServerFn({ method: "POST" })
	.validator(diagnosisCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.diagnosis)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					date: data.date ?? new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating diagnosis:", error);
			throw new Error("Failed to create diagnosis");
		}
	});

export const updateDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: diagnosisCreateSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.diagnosis)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.diagnosis.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating diagnosis:", error);
			throw new Error("Failed to update diagnosis");
		}
	});

export const deleteDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.diagnosis).where(eq(schema.diagnosis.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting diagnosis:", error);
			throw new Error("Failed to delete diagnosis");
		}
	});

export const softDeleteDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const [result] = await db
				.update(schema.diagnosis)
				.set({ deletedAt: new Date(), clinicId })
				.where(eq(schema.diagnosis.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error soft deleting diagnosis:", error);
			throw new Error("Failed to soft delete diagnosis");
		}
	});

export const restoreDiagnosis = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.diagnosis)
				.set({ deletedAt: null })
				.where(eq(schema.diagnosis.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error restoring diagnosis:", error);
			throw new Error("Failed to restore diagnosis");
		}
	});

// =======================
// Medical Record CRUD
// =======================

export const createMedicalRecord = createServerFn({ method: "POST" })
	.validator(medicalRecordCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await db.transaction(async tx => {
				const [result] = await tx
					.insert(schema.medicalRecord)
					.values({
						...data,
						id: data.id ?? crypto.randomUUID(),
						createdAt: new Date(),
						updatedAt: new Date(),
						isDeleted: false
					})
					.returning();

				if (!result) {
					throw new Error("Failed to create medical record");
				}

				return result;
			});
		} catch (error) {
			console.error("Error creating medical record:", error);
			throw new Error("Failed to create medical record");
		}
	});

export const updateMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: medicalRecordCreateSchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.medicalRecord)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.medicalRecord.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating medical record:", error);
			throw new Error("Failed to update medical record");
		}
	});

export const deleteMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.medicalRecord).where(eq(schema.medicalRecord.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting medical record:", error);
			throw new Error("Failed to delete medical record");
		}
	});

export const softDeleteMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.medicalRecord)
				.set({ deletedAt: new Date() })
				.where(eq(schema.medicalRecord.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error soft deleting medical record:", error);
			throw new Error("Failed to soft delete medical record");
		}
	});

export const restoreMedicalRecord = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.medicalRecord)
				.set({ deletedAt: null })
				.where(eq(schema.medicalRecord.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error restoring medical record:", error);
			throw new Error("Failed to restore medical record");
		}
	});

// =======================
// Complex Operations
// =======================

export const completeEncounter = createServerFn({ method: "POST" })
	.validator(completeEncounterSchema)
	.handler(async ctx => {
		try {
			const { medicalRecordId, diagnosisId, notes, followUpDate, prescribedMedications } = ctx.data;
			return await db.transaction(async tx => {
				// Update medical record
				const [medicalRecord] = await tx
					.update(schema.medicalRecord)
					.set({
						status: "COMPLETED",
						notes,
						followUpDate,
						updatedAt: new Date()
					})
					.where(eq(schema.medicalRecord.id, medicalRecordId))
					.returning();

				if (!medicalRecord) {
					throw new Error("Medical record not found");
				}

				// Create prescriptions if provided
				const prescriptions = [];
				if (prescribedMedications?.length) {
					const [prescription] = await tx
						.insert(schema.prescription)
						.values({
							id: crypto.randomUUID(),
							medicalRecordId: medicalRecord.id,
							patientId: medicalRecord.patientId,
							doctorId: medicalRecord.doctorId,
							clinicId: medicalRecord.clinicId,
							encounterId: diagnosisId || "",
							status: "active",
							issuedDate: new Date(),
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.returning();

					for (const med of prescribedMedications) {
						const [prescribedItem] = await tx
							.insert(schema.prescribedItem)
							.values({
								id: crypto.randomUUID(),
								prescriptionId: prescription?.id ?? "",
								clinicId: medicalRecord.clinicId,
								drugId: med.drugId,
								dosageValue: med.dosageValue,
								dosageUnit: med.dosageUnit,
								frequency: med.frequency,
								duration: med.duration,
								instructions: med.instructions,
								createdAt: new Date(),
								updatedAt: new Date()
							})
							.returning();
						prescriptions.push(prescribedItem);
					}
				}

				// Update appointment status
				await tx
					.update(schema.appointment)
					.set({ status: "COMPLETED" })
					.where(eq(schema.appointment.id, medicalRecord.appointmentId ??""));

				return { medicalRecord, prescriptions };
			});
		} catch (error) {
			console.error("Error completing encounter:", error);
			throw new Error("Failed to complete encounter");
		}
	});

export const addVitalSignsToMedicalRecord = createServerFn({ method: "POST" })
	.validator(addVitalSignsSchema)
	.handler(async ctx => {
		try {
			const { medicalRecordId, vitalSigns } = ctx.data;
			const [vitalSign] = await db
				.insert(schema.vitalSign)
				.values({
					...vitalSigns,
					id: crypto.randomUUID(),
					medicalId: medicalRecordId,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			if (vitalSigns.growthRecordId) {
				const growthRec = await db.query.growthRecord.findFirst({
					where: {
						id: vitalSigns.growthRecordId
					}
				});

				if (growthRec?.weight && growthRec.height) {
					const heightNum = Number(growthRec.height);
					const weightNum = Number(growthRec.weight);

					const bmi = weightNum / (heightNum / 100) ** 2;
					const bmiValue = Number.parseFloat(bmi.toFixed(1));

					await db
						.update(schema.vitalSign)
						.set({ notes: `Calculated BMI: ${bmiValue}` })
						.where(eq(schema.vitalSign.id, vitalSign?.id ?? ""));

					const mr = await db.query.medicalRecord.findFirst({
						where: {
							id: medicalRecordId
						}
					});

					if (mr) {
						await recordGrowthWithPercentiles({
							data: {
								patientId: mr.patientId,
								clinicId: mr.clinicId,
								date: new Date(),
								weight: weightNum,
								height: heightNum,
								bmi: bmiValue
							}
						});
					}
				}
			}

			return vitalSign;
		} catch (error) {
			console.error("Error adding vital signs to medical record:", error);
			throw new Error("Failed to add vital signs");
		}
	});

export const createCompleteEncounter = createServerFn({ method: "POST" })
	.validator(createCompleteEncounterSchema)
	.handler(async ctx => {
		try {
			const { medicalRecord, diagnoses, vitalSigns, growthRecord } = ctx.data;
			return await db.transaction(async tx => {
				// 1. Fetch appointment & clinic
				const appointment = await tx.query.appointment.findFirst({
					where: { id: medicalRecord.appointmentId },
					columns: { clinicId: true }
				});

				if (!appointment?.clinicId) throw new Error("Clinic not assigned");

				// 2. Complete appointment
				await tx
					.update(schema.appointment)
					.set({ status: "COMPLETED" })
					.where(eq(schema.appointment.id, medicalRecord.appointmentId));

				// 3. Insert Records
				const [record] = await tx
					.insert(schema.medicalRecord)
					.values({
						...medicalRecord,
						id: medicalRecord.id ?? crypto.randomUUID(),
						clinicId: appointment.clinicId,
						createdAt: new Date(),
						updatedAt: new Date(),
						isDeleted: false
					})
					.returning();

				const [diagnosis] = await tx
					.insert(schema.diagnosis)
					.values({
						...diagnoses[0],
						id: diagnoses[0]?.id ?? crypto.randomUUID(),
						patientId: medicalRecord.patientId,
						doctorId: medicalRecord.doctorId,
						appointmentId: medicalRecord.appointmentId,
						medicalId: record.id,
						date: new Date(),
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				// 4. Conditional Inserts
				let vitalSignsResult: typeof schema.vitalSign.$inferSelect | undefined;
				if (vitalSigns && vitalSigns.length > 0) {
					const [vitalsResult] = await tx
						.insert(schema.vitalSign)
						.values({
							...vitalSigns[0],
							id: vitalSigns[0].id ?? crypto.randomUUID(),
							medicalId: record.id,
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.returning();
					vitalSignsResult = vitalsResult;
				}

				let growthRecordResult: typeof schema.growthRecord.$inferSelect | undefined;
				if (growthRecord && growthRecord.length > 0) {
					const [growthResult] = await tx
						.insert(schema.growthRecord)
						.values({
							...growthRecord[0],
							id: crypto.randomUUID(),
							recordedAt: new Date(),
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.returning();
					growthRecordResult = growthResult;
				}

				return {
					medicalRecord: record,
					diagnosis,
					vitalSigns: vitalSignsResult,
					growthRecord: growthRecordResult
				};
			});
		} catch (error) {
			console.error("Error creating complete encounter:", error);
			throw new Error("Failed to create complete encounter");
		}
	});
