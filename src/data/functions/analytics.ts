// db/repo/analytics-repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, lte } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

const clinicDateRangeSchema = z.object({
	clinicId: z.string().min(1),
	startDate: z.date(),
	endDate: z.date()
});

const clinicYearSchema = z.object({
	clinicId: z.string().min(1),
	year: z.number().int().min(2000).max(2100)
});

const clinicDateRangeLimitSchema = z.object({
	clinicId: z.string().min(1),
	startDate: z.date(),
	endDate: z.date(),
	limit: z.number().int().positive().default(10)
});

const clinicIdSchema = z.object({
	clinicId: z.string().min(1)
});

// const clinicOptionalDateRangeSchema = z.object({
// 	clinicId: z.string().min(1),
// 	startDate: z.date().optional(),
// 	endDate: z.date().optional()
// });

// const getAppointmentsInRange = createServerFn({ method: "GET" })
// 	.validator(clinicDateRangeSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const appointments = await db.query.appointment.findMany({
// 				where: {
// 					clinicId: clinicId,
// 					appointmentDate: {
// 						gte: startDate,
// 						lte: endDate
// 					}
// 				},
// 				orderBy: (appointments, { asc }) => [asc(appointments.appointmentDate)]
// 			});

// 			return appointments;
// 		} catch (error) {
// 			console.error("Error getting appointments in range:", error);
// 			throw new Error("Failed to get appointments in range");
// 		}
// 	});

// const getClinicRevenue = createServerFn({ method: "GET" })
// 	.validator(clinicDateRangeSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const result = await db
// 				.select({
// 					total: sql<number>`COALESCE(SUM(${schema.appointment.appointmentPrice}), 0)`
// 				})
// 				.from(schema.appointment)
// 				.where(
// 					and(
// 						eq(schema.appointment.clinicId, clinicId),
// 						gte(schema.appointment.appointmentDate, startDate),
// 						lte(schema.appointment.appointmentDate, endDate),
// 						eq(schema.appointment.isDeleted, false)
// 					)
// 				);

// 			return { totalRevenue: result[0]?.total || 0 };
// 		} catch (error) {
// 			console.error("Error getting clinic revenue:", error);
// 			throw new Error("Failed to get clinic revenue");
// 		}
// 	});

// const getAppointmentCountsByStatus = createServerFn({ method: "GET" })
// 	.validator(clinicOptionalDateRangeSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const conditions = [eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)];

// 			if (startDate) conditions.push(gte(schema.appointment.appointmentDate, startDate));
// 			if (endDate) conditions.push(lte(schema.appointment.appointmentDate, endDate));

// 			const results = await db
// 				.select({
// 					status: schema.appointment.status,
// 					count: count()
// 				})
// 				.from(schema.appointment)
// 				.where(and(...conditions))
// 				.groupBy(schema.appointment.status);

// 			return results.reduce(
// 				(acc, curr) => {
// 					if (curr.status) acc[curr.status] = Number(curr.count);
// 					return acc;
// 				},
// 				{} as Record<string, number>
// 			);
// 		} catch (error) {
// 			console.error("Error getting appointment counts by status:", error);
// 			throw new Error("Failed to get appointment counts by status");
// 		}
// 	});

// const getMonthlyAppointmentData = createServerFn({ method: "GET" })
// 	.validator(clinicYearSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, year } = ctx.data;

// 			// SQLite uses strftime for month extraction
// 			const results = await db
// 				.select({
// 					month: sql<number>`CAST(EXTRACT(MONTH FROM ${schema.appointment.appointmentDate}) AS INTEGER)`,
// 					count: count(),
// 					totalRevenue: sql<number>`COALESCE(SUM(${schema.appointment.appointmentPrice}), 0)`
// 				})
// 				.from(schema.appointment)
// 				.where(
// 					and(
// 						eq(schema.appointment.clinicId, clinicId),
// 						eq(schema.appointment.isDeleted, false),
// 						sql`EXTRACT(YEAR FROM ${schema.appointment.appointmentDate}) = ${year}`
// 					)
// 				)
// 				.groupBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`)
// 				.orderBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`);

// 			return results;
// 		} catch (error) {
// 			console.error("Error getting monthly appointment data:", error);
// 			throw new Error("Failed to get monthly appointment data");
// 		}
// 	});

const getNewPatientsCount = createServerFn({ method: "GET" })
	.validator(clinicDateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;

			const count = await db.$count(
				schema.patient,
				and(
					eq(schema.patient.clinicId, clinicId),
					eq(schema.patient.isDeleted, false),
					gte(schema.patient.createdAt, startDate),
					lte(schema.patient.createdAt, endDate)
				)
			);

			return { newPatientsCount: count };
		} catch (error) {
			console.error("Error getting new patients count:", error);
			throw new Error("Failed to get new patients count");
		}
	});

// const getPatientsInDateRange = createServerFn({ method: "GET" })
// 	.validator(clinicDateRangeSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const patients = await db.query.patient.findMany({
// 				where: {
// 					clinicId,
// 					isDeleted: false,
// 					createdAt: { gte: startDate, lte: endDate }
// 				},
// 				columns: {
// 					id: true,
// 					createdAt: true,
// 					firstName: true,
// 					lastName: true,
// 					mrn: true
// 				},
// 				orderBy: (patients, { desc }) => [desc(patients.createdAt)]
// 			});

// 			return patients;
// 		} catch (error) {
// 			console.error("Error getting patients in date range:", error);
// 			throw new Error("Failed to get patients in date range");
// 		}
// 	});

const getPatientDemographics = createServerFn({ method: "GET" })
	.validator(clinicDateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate } = ctx.data;

			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					createdAt: { gte: startDate, lte: endDate }
				},
				columns: {
					id: true,
					gender: true,
					dateOfBirth: true,
					createdAt: true,
					bloodGroup: true,
					maritalStatus: true
				}
			});

			// Calculate demographic statistics
			const genderStats = patients.reduce(
				(acc, p) => {
					const gender = p.gender || "UNKNOWN";
					acc[gender] = (acc[gender] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>
			);

			const ageGroups = patients.reduce(
				(acc, p) => {
					const age = calculateAge(p.dateOfBirth);
					let group = "";
					if (age < 1) group = "Infant (<1 year)";
					else if (age < 5) group = "Toddler (1-4 years)";
					else if (age < 12) group = "Child (5-11 years)";
					else if (age < 18) group = "Adolescent (12-17 years)";
					else group = "Adult (18+ years)";
					acc[group] = (acc[group] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>
			);

			return {
				totalPatients: patients.length,
				genderDistribution: genderStats,
				ageGroupDistribution: ageGroups,
				patients
			};
		} catch (error) {
			console.error("Error getting patient demographics:", error);
			throw new Error("Failed to get patient demographics");
		}
	});

// Helper function to calculate age in years
function calculateAge(dateOfBirth: Date): number {
	const today = new Date();
	let age = today.getFullYear() - dateOfBirth.getFullYear();
	const monthDiff = today.getMonth() - dateOfBirth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
		age--;
	}
	return age;
}

// const getVaccineInventoryStatus = createServerFn({ method: "GET" })
// 	.validator(clinicIdSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId } = ctx.data;

// 			const inventory = await db.query.vaccineInventory.findMany({
// 				where: { clinicId },
// 				orderBy: (inventory, { asc }) => [asc(inventory.expirationDate)]
// 			});

// 			const now = new Date();
// 			const expiringSoon = inventory.filter(v => {
// 				if (!v.expirationDate) return false;
// 				const daysUntilExpiry = Math.ceil((v.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
// 				return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
// 			});

// 			const expired = inventory.filter(v => v.expirationDate && v.expirationDate < now);
// 			const lowStock = inventory.filter(v => v.quantity < 10);

// 			const inventoryByVaccine = inventory.reduce(
// 				(acc, v) => {
// 					acc[v.vaccineName] = {
// 						quantity: v.quantity,
// 						lotNumber: v.lotNumber,
// 						expirationDate: v.expirationDate
// 					};
// 					return acc;
// 				},
// 				{} as Record<
// 					string,
// 					{
// 						quantity: number;
// 						lotNumber: string | null;
// 						expirationDate: Date | null;
// 					}
// 				>
// 			);

// 			return {
// 				totalVaccines: inventory.length,
// 				totalDoses: inventory.reduce((sum, v) => sum + (v.quantity || 0), 0),
// 				expiringSoon,
// 				expired,
// 				lowStock,
// 				inventoryByVaccine
// 			};
// 		} catch (error) {
// 			console.error("Error getting vaccine inventory status:", error);
// 			throw new Error("Failed to get vaccine inventory status");
// 		}
// 	});

// const getOverdueImmunizations = createServerFn({ method: "GET" })
// 	.validator(clinicIdSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId } = ctx.data;

// 			const immunizations = await db.query.immunization.findMany({
// 				where: {
// 					clinicId,
// 					isDeleted: false,
// 					status: "OVERDUE"
// 				},
// 				with: {
// 					patient: {
// 						with: {
// 							guardians: true
// 						}
// 					}
// 				},
// 				orderBy: (immunizations, { asc }) => [asc(immunizations.date)]
// 			});

// 			return immunizations;
// 		} catch (error) {
// 			console.error("Error getting overdue immunizations:", error);
// 			throw new Error("Failed to get overdue immunizations");
// 		}
// 	});

// const getPrescriptionsForAnalytics = createServerFn({ method: "GET" })
// 	.validator(clinicDateRangeSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const prescriptions = await db.query.prescription.findMany({
// 				where: {
// 					clinicId,
// 					issuedDate: { gte: startDate, lte: endDate }
// 				},
// 				with: {
// 					prescribedItems: {
// 						with: {
// 							drug: true
// 						}
// 					},
// 					doctor: true
// 				},
// 				orderBy: (prescriptions, { desc }) => [desc(prescriptions.issuedDate)]
// 			});

// 			// Calculate prescription statistics
// 			const medicationFrequency = prescriptions
// 				.flatMap(p => p.prescribedItems)
// 				.reduce(
// 					(acc, item) => {
// 						const drugName = item.drug?.name || "Unknown";
// 						acc[drugName] = (acc[drugName] || 0) + 1;
// 						return acc;
// 					},
// 					{} as Record<string, number>
// 				);

// 			const topMedications = Object.entries(medicationFrequency)
// 				.map(([medication, count]) => ({ medication, count }))
// 				.sort((a, b) => b.count - a.count)
// 				.slice(0, 10);

// 			return {
// 				prescriptions,
// 				statistics: {
// 					totalPrescriptions: prescriptions.length,
// 					topMedications,
// 					activePrescriptions: prescriptions.filter(p => p.status === "active").length,
// 					completedPrescriptions: prescriptions.filter(p => p.status === "completed").length
// 				}
// 			};
// 		} catch (error) {
// 			console.error("Error getting prescriptions for analytics:", error);
// 			throw new Error("Failed to get prescriptions for analytics");
// 		}
// 	});

const getTopConditions = createServerFn({ method: "GET" })
	.validator(clinicDateRangeLimitSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate, limit } = ctx.data;

			const diagnoses = await db.query.diagnosis.findMany({
				where: {
					clinicId,
					date: { gte: startDate, lte: endDate },
					isDeleted: false
				},
				columns: {
					diagnosis: true
				}
			});

			// Count occurrences of each diagnosis
			const conditionCounts = new Map<string, number>();
			for (const d of diagnoses) {
				if (d.diagnosis) {
					// Split multiple diagnoses if needed
					const conditions = d.diagnosis.split(",").map(c => c.trim());
					for (const condition of conditions) {
						const count = conditionCounts.get(condition) || 0;
						conditionCounts.set(condition, count + 1);
					}
				}
			}

			const totalPatientsResult = await db.$count(
				schema.patient,
				and(
					eq(schema.patient.clinicId, clinicId),
					eq(schema.patient.isDeleted, false),
					gte(schema.patient.createdAt, startDate),
					lte(schema.patient.createdAt, endDate)
				)
			);

			const totalPatients = totalPatientsResult;

			const topConditions = Array.from(conditionCounts.entries())
				.map(([condition, count]) => ({
					condition,
					prevalence: totalPatients > 0 ? (count / totalPatients) * 100 : 0,
					affectedPatients: count
				}))
				.sort((a, b) => b.prevalence - a.prevalence)
				.slice(0, limit);

			return topConditions;
		} catch (error) {
			console.error("Error getting top conditions:", error);
			throw new Error("Failed to get top conditions");
		}
	});

const getSeasonalAppointmentData = createServerFn({ method: "GET" })
	.validator(clinicYearSchema)
	.handler(async ctx => {
		try {
			const { clinicId, year } = ctx.data;

			const seasons = [
				{ name: "Winter", months: [12, 1, 2] },
				{ name: "Spring", months: [3, 4, 5] },
				{ name: "Summer", months: [6, 7, 8] },
				{ name: "Fall", months: [9, 10, 11] }
			];

			const seasonData = [];
			for (const season of seasons) {
				const startMonth = season.months[0];
				const endMonth = season.months[season.months.length - 1];

				let startDate: Date;
				let endDate: Date;

				if (startMonth && endMonth) {
					// Handle year wrap for Winter
					if (season.name === "Winter" && startMonth === 12) {
						startDate = new Date(year - 1, startMonth - 1, 1);
						endDate = new Date(year, endMonth - 1, 31);
					} else {
						startDate = new Date(year, startMonth - 1, 1);
						endDate = new Date(year, endMonth - 1, 31);
					}

					const appointments = await db.query.appointment.findMany({
						where: {
							clinicId,
							isDeleted: false,
							appointmentDate: {
								gte: startDate,
								lte: endDate
							}
						},
						with: {
							medicalRecords: {
								with: {
									vitalSigns: true,
									diagnosis: true
								}
							}
						}
					});

					// Aggregate conditions from medical records
					const conditions: Record<string, number> = {};
					for (const apt of appointments) {
						if (apt.medicalRecords[0].diagnosis) {
							const diagList = apt.medicalRecords[0].diagnosis.split(",").map(d => d.trim());
							for (const diag of diagList) {
								conditions[diag] = (conditions[diag] || 0) + 1;
							}
						}
					}

					seasonData.push({
						season: season.name,
						totalAppointments: appointments.length,
						conditions,
						topConditions: Object.entries(conditions)
							.sort((a, b) => b[1] - a[1])
							.slice(0, 5)
							.map(([condition, count]) => ({ condition, count }))
					});
				}
			}

			return seasonData;
		} catch (error) {
			console.error("Error getting seasonal appointment data:", error);
			throw new Error("Failed to get seasonal appointment data");
		}
	});

// =======================
// Additional Analytics Functions
// =======================

// const getDoctorPerformance = createServerFn({ method: "GET" })
// 	.validator(clinicDateRangeSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const appointments = await db.query.appointment.findMany({
// 				where: {
// 					clinicId,
// 					appointmentDate: { gte: startDate, lte: endDate },
// 					isDeleted: false
// 				},
// 				with: {
// 					doctor: true
// 				}
// 			});

// 			const doctorStats = appointments.reduce(
// 				(acc, apt) => {
// 					const doctorId = apt.doctorId;
// 					if (!acc[doctorId]) {
// 						acc[doctorId] = {
// 							doctorName: apt.doctor?.name || "Unknown",
// 							totalAppointments: 0,
// 							completedAppointments: 0,
// 							cancelledAppointments: 0,
// 							totalRevenue: 0
// 						};
// 					}

// 					const stats = acc[doctorId];
// 					stats.totalAppointments++;
// 					if (apt.status === "COMPLETED") stats.completedAppointments++;
// 					if (apt.status === "CANCELLED") stats.cancelledAppointments++;
// 					if (apt.appointmentPrice) stats.totalRevenue += apt.appointmentPrice;

// 					return acc;
// 				},
// 				{} as Record<
// 					string,
// 					{
// 						doctorName: string;
// 						totalAppointments: number;
// 						completedAppointments: number;
// 						cancelledAppointments: number;
// 						totalRevenue: number;
// 					}
// 				>
// 			);

// 			return Object.values(doctorStats);
// 		} catch (error) {
// 			console.error("Error getting doctor performance:", error);
// 			throw new Error("Failed to get doctor performance");
// 		}
// 	});

const getImmunizationCoverage = createServerFn({ method: "GET" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;

			const patients = await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				columns: {
					id: true,
					dateOfBirth: true
				}
			});

			const immunizations = await db.query.immunization.findMany({
				where: {
					clinicId,
					isDeleted: false
				},
				columns: {
					patientId: true,
					vaccine: true
				}
			});

			// Calculate coverage by vaccine
			const vaccineCoverage: Record<string, { total: number; completed: number; percentage: number }> = {};

			const vaccineList = [...new Set(immunizations.map(imm => imm.vaccine))];
			for (const vaccine of vaccineList) {
				const patientsVaccinated = new Set(
					immunizations.filter(imm => imm.vaccine === vaccine).map(imm => imm.patientId)
				);
				const coverage = (patientsVaccinated.size / patients.length) * 100;
				vaccineCoverage[vaccine] = {
					total: patients.length,
					completed: patientsVaccinated.size,
					percentage: coverage
				};
			}

			return {
				totalPatients: patients.length,
				vaccineCoverage,
				fullyImmunized: patients.filter(p => {
					const patientImmunizations = immunizations.filter(imm => imm.patientId === p.id);
					return patientImmunizations.length >= 10; // Assuming 10+ vaccines for full immunization
				}).length
			};
		} catch (error) {
			console.error("Error getting immunization coverage:", error);
			throw new Error("Failed to get immunization coverage");
		}
	});

export {
	// getAppointmentCountsByStatus,
	// getAppointmentsInRange,
	// getClinicRevenue,
	// getDoctorPerformance,
	getImmunizationCoverage,
	// getMonthlyAppointmentData,
	getNewPatientsCount,
	// getOverdueImmunizations,
	getPatientDemographics,
	// getPatientsInDateRange,
	// getPrescriptionsForAnalytics,
	getSeasonalAppointmentData,
	getTopConditions
};
