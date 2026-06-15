import { createServerFn } from "@tanstack/react-start";
import { and, between, count, eq, gte, inArray, like, lte, ne, or, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { AppointmentUpdateSchema } from "@/db/zod";

// =======================
// Schema Validators
// =======================

// type JSONValue = string | number | boolean | null | { [x: string]: JSONValue } | Array<JSONValue>;

const appointmentIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const createAppointmentSchema = z.object({
	data: z.object({
		id: z.string().optional(),
		patientId: z.string(),
		doctorId: z.string(),
		clinicId: z.string(),
		serviceId: z.string().optional(),
		appointmentDate: z.date(),
		time: z.string().optional(),
		durationMinutes: z.number().optional(),
		appointmentPrice: z.number().optional(),
		status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
		type: z.string(),
		note: z.string().optional(),
		reason: z.string().optional(),
		doctorSpecialty: z.string().optional()
	})
});

const updateAppointmentSchema = AppointmentUpdateSchema;

const bulkStatusSchema = z.object({
	appointmentIds: z.array(z.string()),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
});

const dateRangeSchema = z.object({
	clinicId: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	doctorId: z.string().optional()
});

const statusFilterSchema = z.object({
	clinicId: z.string(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
});

// const doctorAvailabilitySchema = z.object({
// 	doctorId: z.string(),
// 	date: z.date()
// });

// const timeSlotsSchema = z.object({
// 	doctorId: z.string(),
// 	date: z.date(),
// 	durationMinutes: z.number().optional()
// });

const monthlyDataSchema = z.object({
	clinicId: z.string(),
	year: z.number()
});

const appointmentsFilterSchema = z.object({
	clinicId: z.string(),
	filters: z.object({
		status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
		startDate: z.date().optional(),
		endDate: z.date().optional(),
		doctorId: z.string().optional(),
		patientId: z.string().optional(),
		type: z.string().optional(),
		search: z.string().optional()
	}),
	pagination: z.object({
		limit: z.number(),
		offset: z.number()
	})
});

const checkAvailabilitySchema = z.object({
	doctorId: z.string(),
	appointmentDate: z.date(),
	durationMinutes: z.number(),
	clinicId: z.string(),
	excludeId: z.string().optional()
});

const cancelAppointmentSchema = z.object({
	appointmentId: z.string(),
	clinicId: z.string(),
	reason: z.string()
});

const paginationSchema = z.object({
	clinicId: z.string(),
	page: z.number(),
	limit: z.number(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
	doctorId: z.string().optional(),
	patientId: z.string().optional()
});

const createWithReminderSchema = z.object({
	data: createAppointmentSchema.shape.data,
	reminderData: z
		.object({
			method: z.enum(["SMS", "EMAIL", "PUSH", "CALL"]),
			sentAt: z.date()
		})
		.optional()
});

const medicalRecordWithEncounterSchema = z.object({
	patientId: z.string(),
	doctorId: z.string(),
	clinicId: z.string(),
	appointmentId: z.string(),
	diagnosis: z.string(),
	symptoms: z.string(),
	treatmentPlan: z.string(),
	vitalSigns: z.record(z.string(), z.unknown()).optional(),
	prescriptions: z
		.array(
			z.object({
				medicationName: z.string(),
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
				duration: z.string()
			})
		)
		.optional()
});

const rescheduleSchema = z.object({
	appointmentId: z.string(),
	newDate: z.date(),
	newTime: z.string(),
	reason: z.string().optional()
});

const patientAppointmentsSchema = z.object({
	patientId: z.string(),
	clinicId: z.string(),
	pagination: z.object({
		page: z.number(),
		limit: z.number()
	}),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional()
});

const doctorAppointmentsRangeSchema = z.object({
	doctorId: z.string(),
	startDate: z.date(),
	endDate: z.date()
});

// const appointmentStatsSchema = z.object({
// 	clinicId: z.string(),
// 	startDate: z.date().optional(),
// 	endDate: z.date().optional()
// });

// const bookedSlotsSchema = z.object({
// 	doctorId: z.string(),
// 	date: z.date()
// });

const updateWithNoteSchema = z.object({
	id: z.string(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
	note: z.string().optional()
});

// =======================
// Server Functions
// =======================

const getAppointmentById = createServerFn({ method: "GET" })
	.validator(appointmentIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			return await db.query.appointment.findFirst({
				where: { id, clinicId, isDeleted: false },
				with: {
					patient: true,
					doctor: true,
					service: true,
					clinic: true
				}
			});
		} catch (error) {
			console.error("Error getting appointment by ID:", error);
			throw new Error("Failed to get appointment");
		}
	});

const createAppointment = createServerFn({ method: "POST" })
	.validator(createAppointmentSchema)
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const [result] = await db
				.insert(schema.appointment)
				.values({
					...data,
					id: data.id || crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating appointment:", error);
			throw new Error("Failed to create appointment");
		}
	});

const updateAppointment = createServerFn({ method: "POST" })
	.validator(updateAppointmentSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			const [result] = await db
				.update(schema.appointment)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.appointment.id, id ?? ""))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating appointment:", error);
			throw new Error("Failed to update appointment");
		}
	});

const softDeleteAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.appointment)
				.set({ deletedAt: new Date(), isDeleted: true })
				.where(eq(schema.appointment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error soft deleting appointment:", error);
			throw new Error("Failed to delete appointment");
		}
	});

const bulkUpdateAppointmentStatus = createServerFn({ method: "POST" })
	.validator(bulkStatusSchema)
	.handler(async ctx => {
		try {
			const { appointmentIds, status } = ctx.data;
			return await db
				.update(schema.appointment)
				.set({ status, updatedAt: new Date() })
				.where(inArray(schema.appointment.id, appointmentIds))
				.returning();
		} catch (error) {
			console.error("Error bulk updating appointment status:", error);
			throw new Error("Failed to bulk update appointment status");
		}
	});

const getAppointmentsInRange = createServerFn({ method: "GET" })
	.validator(dateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate, doctorId } = ctx.data;
			const conditions: Record<string, unknown> = {
				clinicId,
				isDeleted: false,
				appointmentDate: { gte: startDate, lte: endDate }
			};
			if (doctorId) conditions.doctorId = doctorId;

			return await db.query.appointment.findMany({
				where: conditions,
				with: {
					patient: { with: { user: true } },
					doctor: true
				},
				orderBy: { appointmentDate: "asc" }
			});
		} catch (error) {
			console.error("Error getting appointments in range:", error);
			throw new Error("Failed to get appointments in range");
		}
	});

const getAppointmentsByStatus = createServerFn({ method: "GET" })
	.validator(statusFilterSchema)
	.handler(async ctx => {
		try {
			const { clinicId, status } = ctx.data;
			return await db.query.appointment.findMany({
				where: { clinicId, status, isDeleted: false },
				with: { patient: true, doctor: true },
				orderBy: { appointmentDate: "asc" }
			});
		} catch (error) {
			console.error("Error getting appointments by status:", error);
			throw new Error("Failed to get appointments by status");
		}
	});

const getAppointmentsFallback = createServerFn({ method: "GET" })
	.validator(dateRangeSchema)
	.handler(async ctx => {
		try {
			const { clinicId, startDate, endDate, doctorId } = ctx.data;
			return await db.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					appointmentDate: { gte: startDate, lte: endDate },
					...(doctorId && { doctorId })
				},
				with: { patient: true, doctor: true },
				orderBy: { appointmentDate: "asc" }
			});
		} catch (error) {
			console.error("Error in fallback appointment fetch:", error);
			throw new Error("Failed to fetch appointments");
		}
	});

const getAppointmentCountsByStatus = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			const results = await db
				.select({
					status: schema.appointment.status,
					count: count()
				})
				.from(schema.appointment)
				.where(and(eq(schema.appointment.clinicId, clinicId), eq(schema.appointment.isDeleted, false)))
				.groupBy(schema.appointment.status);

			return results.reduce(
				(acc, curr) => {
					if (curr.status) acc[curr.status] = Number(curr.count);
					return acc;
				},
				{} as Record<string, number>
			);
		} catch (error) {
			console.error("Error getting appointment counts:", error);
			throw new Error("Failed to get appointment counts");
		}
	});

// const getDoctorAvailability = createServerFn({ method: "GET" })
// 	.validator(doctorAvailabilitySchema)
// 	.handler(async ctx => {
// 		try {
// 			const { doctorId, date } = ctx.data;
// 			const startOfDay = new Date(date);
// 			startOfDay.setHours(0, 0, 0, 0);
// 			const endOfDay = new Date(date);
// 			endOfDay.setHours(23, 59, 59, 999);

// 			const [workingDays, appointments] = await Promise.all([
// 				db.query.workingDay.findMany({
// 					where: { doctorId }
// 				}),
// 				db.query.appointment.findMany({
// 					where: {
// 						doctorId,
// 						appointmentDate: {
// 							gte: startOfDay,
// 							lte: endOfDay
// 						},
// 						isDeleted: false
// 					}
// 				})
// 			]);
// 			return { workingDays, appointments };
// 		} catch (error) {
// 			console.error("Error getting doctor availability:", error);
// 			throw new Error("Failed to get doctor availability");
// 		}
// 	});

// const getAvailableTimeSlots = createServerFn({ method: "GET" })
// 	.validator(timeSlotsSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { doctorId, date, durationMinutes = 30 } = ctx.data;
// 			const workingDay = await db.query.workingDay.findFirst({
// 				where: {
// 					doctorId: doctorId,
// 					day: date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as schema.Weekday
// 				}
// 			});

// 			if (!workingDay) {
// 				return [];
// 			}

// 			const startOfDay = new Date(date);
// 			startOfDay.setHours(0, 0, 0, 0);
// 			const endOfDay = new Date(date);
// 			endOfDay.setHours(23, 59, 59, 999);

// 			const appointments = await db.query.appointment.findMany({
// 				where: {
// 					doctorId,
// 					appointmentDate: {
// 						gte: startOfDay,
// 						lte: endOfDay
// 					},
// 					isDeleted: false,
// 					status: {
// 						notIn: ["CANCELLED", "COMPLETED"]
// 					}
// 				}
// 			});

// 			// Generate time slots
// 			const startHour = Number.parseInt(workingDay.startTime.split(":")[0] ?? "0", 10);
// 			const startMinute = Number.parseInt(workingDay.startTime.split(":")[1] ?? "0", 10);
// 			const endHour = Number.parseInt(workingDay.endTime.split(":")[0] ?? "0", 10);
// 			const endMinute = Number.parseInt(workingDay.endTime.split(":")[1] ?? "0", 10);

// 			const slots = [];
// 			const currentTime = new Date(date);
// 			currentTime.setHours(startHour, startMinute, 0, 0);
// 			const endTime = new Date(date);
// 			endTime.setHours(endHour, endMinute, 0, 0);

// 			while (currentTime < endTime) {
// 				const slotEnd = new Date(currentTime);
// slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

// 				// Check if slot is available
// 				const isBooked = appointments.some(apt => {
// 					const aptTime = new Date(apt.appointmentDate);
// 					return (
// 						aptTime.getHours() === currentTime.getHours() &&
// 						aptTime.getMinutes() === currentTime.getMinutes()
// 					);
// 				});

// 				if (!isBooked) {
// 					slots.push({
// 						startTime: currentTime.toLocaleTimeString([], {
// 							hour: "2-digit",
// 							minute: "2-digit",
// 							hour12: false
// 						}),
// 						endTime: slotEnd.toLocaleTimeString([], {
// 							hour: "2-digit",
// 							minute: "2-digit",
// 							hour12: false
// 						}),
// 						available: true
// 					});
// 				}

// 				currentTime.setMinutes(currentTime.getMinutes()  durationMinutes);
// 			}

// 			return slots;
// 		} catch (error) {
// 			console.error("Error getting available time slots:", error);
// 			throw new Error("Failed to get available time slots");
// 		}
// 	});

const getMonthlyAppointmentData = createServerFn({ method: "GET" })
	.validator(monthlyDataSchema)
	.handler(async ctx => {
		try {
			const { clinicId, year } = ctx.data;
			return await db
				.select({
					month: sql<number>`CAST(EXTRACT(MONTH FROM ${schema.appointment.appointmentDate}) AS INTEGER)`,
					count: count()
				})
				.from(schema.appointment)
				.where(
					and(
						eq(schema.appointment.clinicId, clinicId),
						eq(schema.appointment.isDeleted, false),
						sql`EXTRACT(YEAR FROM ${schema.appointment.appointmentDate}) = ${year}`
					)
				)
				.groupBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`)
				.orderBy(sql`EXTRACT(MONTH FROM ${schema.appointment.appointmentDate})`);
		} catch (error) {
			console.error("Error getting monthly appointment data:", error);
			throw new Error("Failed to get monthly appointment data");
		}
	});

const getAppointmentsWithFilters = createServerFn({ method: "POST" })
	.validator(appointmentsFilterSchema)
	.handler(async ctx => {
		try {
			const { clinicId, filters, pagination } = ctx.data;

			// Build where conditions object for RQB
			const whereConditions: Record<string, unknown> = {
				clinicId: clinicId,
				isDeleted: false
			};

			// Add simple equality filters
			if (filters.status) whereConditions.status = filters.status;
			if (filters.doctorId) whereConditions.doctorId = filters.doctorId;
			if (filters.patientId) whereConditions.patientId = filters.patientId;
			if (filters.type) whereConditions.type = filters.type;

			// Add date range filters
			if (filters.startDate && filters.endDate) {
				whereConditions.appointmentDate = {
					gte: filters.startDate,
					lte: filters.endDate
				};
			} else if (filters.startDate) {
				whereConditions.appointmentDate = { gte: filters.startDate };
			} else if (filters.endDate) {
				whereConditions.appointmentDate = { lte: filters.endDate };
			}

			// Add search filter using OR conditions
			if (filters.search) {
				whereConditions.OR = [
					{ reason: { like: `%${filters.search}%` } },
					{ type: { like: `%${filters.search}%` } }
				];
			}

			const [appointments, totalResult] = await Promise.all([
				db.query.appointment.findMany({
					where: whereConditions,
					with: {
						patient: true,
						doctor: true
					},
					limit: pagination.limit,
					offset: pagination.offset,
					orderBy: { appointmentDate: "desc" }
				}),
				db
					.select({ count: count() })
					.from(schema.appointment)
					.where(
						and(
							eq(schema.appointment.clinicId, clinicId),
							eq(schema.appointment.isDeleted, false),
							filters.status ? eq(schema.appointment.status, filters.status) : undefined,
							filters.doctorId ? eq(schema.appointment.doctorId, filters.doctorId) : undefined,
							filters.patientId ? eq(schema.appointment.patientId, filters.patientId) : undefined,
							filters.type ? eq(schema.appointment.type, filters.type) : undefined,
							filters.startDate && filters.endDate
								? between(schema.appointment.appointmentDate, filters.startDate, filters.endDate)
								: filters.startDate
									? gte(schema.appointment.appointmentDate, filters.startDate)
									: filters.endDate
										? lte(schema.appointment.appointmentDate, filters.endDate)
										: undefined,
							filters.search
								? or(
										like(schema.appointment.reason, `%${filters.search}%`),
										like(schema.appointment.type, `%${filters.search}%`)
									)
								: undefined
						)
					)
			]);

			return {
				appointments,
				total: totalResult[0]?.count ?? 0
			};
		} catch (error) {
			console.error("Error getting appointments with filters:", error);
			throw new Error("Failed to get appointments with filters");
		}
	});
const checkTimeSlotAvailability = createServerFn({ method: "POST" })
	.validator(checkAvailabilitySchema)
	.handler(async ctx => {
		try {
			const { doctorId, appointmentDate, durationMinutes, clinicId, excludeId } = ctx.data;

			const appointmentEnd = new Date(appointmentDate);
			appointmentEnd.setMinutes(appointmentEnd.getMinutes() + durationMinutes);

			const conditions = [
				eq(schema.appointment.doctorId, doctorId),
				eq(schema.appointment.clinicId, clinicId),
				eq(schema.appointment.isDeleted, false),
				lte(schema.appointment.appointmentDate, appointmentEnd),
				gte(sql`${schema.appointment.appointmentDate}`, appointmentDate)
			];

			if (excludeId) {
				conditions.push(ne(schema.appointment.id, excludeId));
			}

			const overlapping = await db
				.select()
				.from(schema.appointment)
				.where(and(...conditions))
				.limit(1);

			return overlapping.length === 0;
		} catch (error) {
			console.error("Error checking time slot availability:", error);
			throw new Error("Failed to check time slot availability");
		}
	});

const validateAppointment = createServerFn({ method: "GET" })
	.validator(z.object({ appointmentId: z.string() }))
	.handler(async ctx => {
		try {
			const { appointmentId } = ctx.data;
			return await db.query.appointment.findFirst({
				where: {
					id: appointmentId,
					isDeleted: false,
					status: { notIn: ["CANCELLED", "COMPLETED"] }
				}
			});
		} catch (error) {
			console.error("Error validating appointment:", error);
			throw new Error("Failed to validate appointment");
		}
	});

const cancelAppointment = createServerFn({ method: "POST" })
	.validator(cancelAppointmentSchema)
	.handler(async ctx => {
		try {
			const { appointmentId, clinicId, reason } = ctx.data;
			return await db.transaction(async tx => {
				const [appointment] = await tx
					.update(schema.appointment)
					.set({
						status: "CANCELLED",
						note: reason,
						updatedAt: new Date()
					})
					.where(eq(schema.appointment.id, appointmentId))
					.returning();

				// Create notification
				if (appointment) {
					await tx.insert(schema.notification).values({
						id: crypto.randomUUID(),
						userId: appointment.patientId,
						clinicId,
						title: "Appointment Cancelled",
						body: `Your appointment has been cancelled. Reason: ${reason}`,
						type: "appointment_cancelled",
						priority: "high",
						status: "unread",
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}

				return appointment;
			});
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			throw new Error("Failed to cancel appointment");
		}
	});

const getAllAppointments = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			return await db.query.appointment.findMany({
				where: { clinicId, isDeleted: false },
				with: { patient: true, doctor: true },
				orderBy: { appointmentDate: "asc" }
			});
		} catch (error) {
			console.error("Error getting all appointments:", error);
			throw new Error("Failed to get appointments");
		}
	});

const getAppointmentsFallbackPaginated = createServerFn({ method: "GET" })
	.validator(paginationSchema)
	.handler(async ctx => {
		try {
			const { clinicId, page, limit, status, doctorId, patientId } = ctx.data;

			const result = await db.query.appointment.findMany({
				where: {
					clinicId,
					isDeleted: false,
					status,
					doctorId,
					patientId
				},
				with: {
					patient: true,
					doctor: true,
					service: true
				},
				orderBy: { appointmentDate: "desc" }
			});

			const paginated = result.slice((page - 1) * limit, page * limit);

			return {
				appointments: paginated,
				total: result.length
			};
		} catch (error) {
			console.error("Error in fallback paginated appointments:", error);
			throw new Error("Failed to fetch paginated appointments");
		}
	});

const getAppointmentByIdFallback = createServerFn({ method: "GET" })
	.validator(appointmentIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			return await db.query.appointment.findFirst({
				where: {
					id,
					clinicId,
					isDeleted: false
				},
				with: { patient: true, doctor: true }
			});
		} catch (error) {
			console.error("Error in fallback appointment fetch:", error);
			throw new Error("Failed to fetch appointment");
		}
	});

const updateAppointmentStatus = createServerFn({ method: "POST" })
	.validator(
		z.object({ id: z.string(), status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]) })
	)
	.handler(async ctx => {
		try {
			const { id, status } = ctx.data;
			const [result] = await db
				.update(schema.appointment)
				.set({ status, updatedAt: new Date() })
				.where(eq(schema.appointment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating appointment status:", error);
			throw new Error("Failed to update appointment status");
		}
	});

const createManyAppointments = createServerFn({ method: "POST" })
	.validator(z.object({ data: z.array(createAppointmentSchema.shape.data) }))
	.handler(async ctx => {
		try {
			const { data } = ctx.data;
			const appointmentsWithTimestamps = data.map(item => ({
				...item,
				id: item.id || crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.appointment).values(appointmentsWithTimestamps).returning();
		} catch (error) {
			console.error("Error creating many appointments:", error);
			throw new Error("Failed to create multiple appointments");
		}
	});

const updateManyAppointments = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), data: z.record(z.string(), z.unknown()) }))
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db
				.update(schema.appointment)
				.set(updateData)
				.where(inArray(schema.appointment.id, ids))
				.returning();
		} catch (error) {
			console.error("Error updating many appointments:", error);
			throw new Error("Failed to update multiple appointments");
		}
	});

const deleteAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db.delete(schema.appointment).where(eq(schema.appointment.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting appointment:", error);
			throw new Error("Failed to delete appointment");
		}
	});

const createAppointmentWithReminder = createServerFn({ method: "POST" })
	.validator(createWithReminderSchema)
	.handler(async ctx => {
		try {
			const { data, reminderData } = ctx.data;
			return await db.transaction(async tx => {
				// Check for conflicts
				const existingAppointment = await tx.query.appointment.findFirst({
					where: {
						doctorId: data.doctorId,
						time: data.time ?? "",
						isDeleted: false,
						appointmentDate: { gte: data.appointmentDate },
						status: {
							notIn: ["CANCELLED", "COMPLETED"]
						}
					}
				});

				if (existingAppointment) {
					throw new Error("Time slot already booked");
				}

				// Create appointment
				const [appointment] = await tx
					.insert(schema.appointment)
					.values({
						...data,
						id: data.id ?? crypto.randomUUID(),
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				// Create reminder if requested
				if (reminderData && appointment) {
					await tx.insert(schema.reminder).values({
						...reminderData,
						id: crypto.randomUUID(),
						appointmentId: appointment.id,
						status: "PENDING"
					});
				}

				// Create notification for patient
				const patient = await tx.query.patient.findFirst({
					where: { id: data.patientId },
					with: { user: true }
				});

				if (patient?.userId) {
					await tx.insert(schema.notification).values({
						id: crypto.randomUUID(),
						userId: patient.userId,
						clinicId: data.clinicId,
						title: "Appointment Scheduled",
						body: `Your appointment has been scheduled for ${new Date(data.appointmentDate).toLocaleDateString()} at ${data.time}`,
						type: "appointment_scheduled",
						priority: "high",
						status: "unread",
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}

				return appointment;
			});
		} catch (error) {
			console.error("Error creating appointment with reminder:", error);
			throw new Error("Failed to create appointment with reminder");
		}
	});

const createMedicalRecordWithEncounter = createServerFn({ method: "POST" })
	.validator(medicalRecordWithEncounterSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			return await db.transaction(async tx => {
				// Create medical record
				const [medicalRecord] = await tx
					.insert(schema.medicalRecord)
					.values({
						id: crypto.randomUUID(),
						patientId: data.patientId,
						doctorId: data.doctorId,
						clinicId: data.clinicId,
						appointmentId: data.appointmentId,
						diagnosis: data.diagnosis,
						symptoms: data.symptoms,
						treatmentPlan: data.treatmentPlan,
						status: "ACTIVE",
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				// Create diagnosis record
				const [diagnosis] = await tx
					.insert(schema.diagnosis)
					.values({
						id: crypto.randomUUID(),
						patientId: data.patientId,
						doctorId: data.doctorId,
						clinicId: data.clinicId,
						appointmentId: data.appointmentId,
						medicalId: medicalRecord?.id ?? "",
						diagnosis: data.diagnosis,
						symptoms: data.symptoms,
						status: "ACTIVE",
						createdAt: new Date(),
						updatedAt: new Date()
					})
					.returning();

				// Create vital signs if provided
				if (data.vitalSigns) {
					await tx.insert(schema.vitalSign).values({
						...data.vitalSigns,
						patientId: data.patientId,
						id: crypto.randomUUID(),
						medicalId: medicalRecord?.id ?? "",
						clinicId: data.clinicId,
						recordedAt: new Date(),
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}

				// Create prescriptions if provided
				if (data.prescriptions && data.prescriptions.length > 0) {
					const [prescription] = await tx
						.insert(schema.prescription)
						.values({
							id: crypto.randomUUID(),
							medicalRecordId: medicalRecord?.id ?? "",
							patientId: data.patientId,
							doctorId: data.doctorId,
							clinicId: data.clinicId,
							encounterId: data.appointmentId,
							status: "active",
							issuedDate: new Date(),
							createdAt: new Date(),
							updatedAt: new Date()
						})
						.returning();

					for (const med of data.prescriptions) {
						// Find or create drug
						let drug = await tx.query.drug.findFirst({
							where: { name: med.medicationName }
						});

						if (!drug) {
							[drug] = await tx
								.insert(schema.drug)
								.values({
									id: crypto.randomUUID(),
									name: med.medicationName,
									createdAt: new Date(),
									updatedAt: new Date()
								})
								.returning();
						}

						await tx.insert(schema.prescribedItem).values({
							id: crypto.randomUUID(),
							prescriptionId: prescription?.id ?? "",
							clinicId: data.clinicId,
							drugId: drug?.id ?? "",
							dosageValue: med.dosageValue,
							dosageUnit: med.dosageUnit,
							frequency: med.frequency,
							duration: med.duration,
							createdAt: new Date(),
							updatedAt: new Date()
						});
					}
				}

				// Update appointment status
				await tx
					.update(schema.appointment)
					.set({ status: "COMPLETED", updatedAt: new Date() })
					.where(eq(schema.appointment.id, data.appointmentId));

				return { medicalRecord, diagnosis };
			});
		} catch (error) {
			console.error("Error creating medical record with encounter:", error);
			throw new Error("Failed to create medical record");
		}
	});

const rescheduleAppointment = createServerFn({ method: "POST" })
	.validator(rescheduleSchema)
	.handler(async ctx => {
		try {
			const { appointmentId, newDate, newTime, reason } = ctx.data;
			return await db.transaction(async tx => {
				const appointment = await tx.query.appointment.findFirst({
					where: { id: appointmentId }
				});

				if (!appointment) {
					throw new Error("Appointment not found");
				}

				// Check new time slot availability
				const conflict = await tx.query.appointment.findFirst({
					where: {
						doctorId: appointment.doctorId,
						appointmentDate: {
							lte: newDate,
							gte: new Date()
						},
						isDeleted: false,
						status: {
							notIn: ["CANCELLED", "COMPLETED"]
						}
					}
				});

				if (conflict && conflict.id !== appointmentId) {
					throw new Error("New time slot is already booked");
				}

				// Update appointment
				const [updated] = await tx
					.update(schema.appointment)
					.set({
						appointmentDate: newDate,
						time: newTime,
						note: reason ? `${appointment.note || ""}\nRescheduled: ${reason}` : appointment.note,
						updatedAt: new Date()
					})
					.where(eq(schema.appointment.id, appointmentId))
					.returning();

				// Notify patient
				const patient = await tx.query.patient.findFirst({
					where: { id: appointment.patientId },
					with: { user: true }
				});

				if (patient?.userId) {
					await tx.insert(schema.notification).values({
						id: crypto.randomUUID(),
						userId: patient.userId,
						clinicId: appointment.clinicId,
						title: "Appointment Rescheduled",
						body: `Your appointment has been rescheduled to ${newDate.toLocaleDateString()} at ${newTime}`,
						type: "appointment_rescheduled",
						priority: "high",
						status: "unread",
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}

				return updated;
			});
		} catch (error) {
			console.error("Error rescheduling appointment:", error);
			throw new Error("Failed to reschedule appointment");
		}
	});

const restoreAppointment = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;
			const [result] = await db
				.update(schema.appointment)
				.set({ deletedAt: null, isDeleted: false, updatedAt: new Date() })
				.where(eq(schema.appointment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error restoring appointment:", error);
			throw new Error("Failed to restore appointment");
		}
	});
const getAppointmentsWithPagination = createServerFn({ method: "POST" })
	.validator(
		z.object({
			clinicId: z.string(),
			pagination: z.object({ page: z.number(), limit: z.number() }),
			filters: z
				.object({
					status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
					fromDate: z.date().optional(),
					toDate: z.date().optional(),
					patientId: z.string().optional(),
					doctorId: z.string().optional(),
					search: z.string().optional()
				})
				.optional()
		})
	)
	.handler(async ctx => {
		try {
			const { clinicId, pagination, filters } = ctx.data;
			const { page, limit } = pagination;
			const offset = (page - 1) * limit;

			// Build where conditions object for RQB v2
			const whereConditions: Record<string, unknown> = {
				clinicId: clinicId,
				isDeleted: false
			};

			// Add simple equality filters
			if (filters?.status) whereConditions.status = filters.status;
			if (filters?.doctorId) whereConditions.doctorId = filters.doctorId;
			if (filters?.patientId) whereConditions.patientId = filters.patientId;

			// Add date range filters
			if (filters?.fromDate && filters?.toDate) {
				whereConditions.appointmentDate = {
					gte: filters.fromDate,
					lte: filters.toDate
				};
			} else if (filters?.fromDate) {
				whereConditions.appointmentDate = { gte: filters.fromDate };
			} else if (filters?.toDate) {
				whereConditions.appointmentDate = { lte: filters.toDate };
			}

			// Add search filter using OR
			if (filters?.search) {
				whereConditions.OR = [
					{ reason: { like: `%${filters.search}%` } },
					{ type: { like: `%${filters.search}%` } }
				];
			}

			const [appointments, totalResult] = await Promise.all([
				db.query.appointment.findMany({
					where: whereConditions,
					with: {
						patient: {
							columns: { id: true, firstName: true, lastName: true, email: true, phone: true }
						},
						doctor: {
							columns: { id: true, name: true, specialty: true, email: true }
						},
						service: {
							columns: { id: true, serviceName: true, price: true, duration: true }
						},
						clinic: {
							columns: { id: true, name: true, address: true, phone: true }
						}
					},
					limit: limit,
					offset: offset,
					orderBy: { appointmentDate: "desc" }
				}),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.appointment)
					.where(
						and(
							eq(schema.appointment.clinicId, clinicId),
							eq(schema.appointment.isDeleted, false),
							filters?.status ? eq(schema.appointment.status, filters.status) : undefined,
							filters?.doctorId ? eq(schema.appointment.doctorId, filters.doctorId) : undefined,
							filters?.patientId ? eq(schema.appointment.patientId, filters.patientId) : undefined,
							filters?.fromDate && filters?.toDate
								? between(schema.appointment.appointmentDate, filters.fromDate, filters.toDate)
								: filters?.fromDate
									? gte(schema.appointment.appointmentDate, filters.fromDate)
									: filters?.toDate
										? lte(schema.appointment.appointmentDate, filters.toDate)
										: undefined,
							filters?.search
								? or(
										like(schema.appointment.reason, `%${filters.search}%`),
										like(schema.appointment.type, `%${filters.search}%`)
									)
								: undefined
						)
					)
			]);

			const total = Number(totalResult[0]?.count ?? 0);

			return {
				appointments,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			};
		} catch (error) {
			console.error("Error getting appointments with pagination:", error);
			throw new Error("Failed to get paginated appointments");
		}
	});
const getPatientAppointments = createServerFn({ method: "GET" })
	.validator(patientAppointmentsSchema)
	.handler(async ctx => {
		try {
			const { patientId, clinicId, pagination, status } = ctx.data;
			const { page, limit } = pagination;
			const offset = (page - 1) * limit;

			const conditions = [
				eq(schema.appointment.patientId, patientId),
				eq(schema.appointment.clinicId, clinicId),
				eq(schema.appointment.isDeleted, false)
			];

			if (status) conditions.push(eq(schema.appointment.status, status));

			const [appointments, totalResult] = await Promise.all([
				db.query.appointment.findMany({
					where: {
						patientId,
						clinicId,
						isDeleted: false
					},
					with: {
						doctor: true,
						service: true,
						clinic: true
					},
					limit,
					offset,
					orderBy: { appointmentDate: "desc" }
				}),
				db
					.select({ count: count() })
					.from(schema.appointment)
					.where(and(...conditions))
			]);

			const total = totalResult[0]?.count ?? 0;

			return {
				appointments,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			};
		} catch (error) {
			console.error("Error getting patient appointments:", error);
			throw new Error("Failed to get patient appointments");
		}
	});

const getDoctorAppointmentsInRange = createServerFn({ method: "GET" })
	.validator(doctorAppointmentsRangeSchema)
	.handler(async ctx => {
		try {
			const { doctorId, startDate, endDate } = ctx.data;
			return await db.query.appointment.findMany({
				where: {
					doctorId,
					isDeleted: false,
					appointmentDate: { gte: startDate, lte: endDate }
				},
				with: { patient: true, service: true },
				orderBy: { appointmentDate: "asc" }
			});
		} catch (error) {
			console.error("Error getting doctor appointments in range:", error);
			throw new Error("Failed to get doctor appointments");
		}
	});

// const getAppointmentStats = createServerFn({ method: "GET" })
// 	.validator(appointmentStatsSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId, startDate, endDate } = ctx.data;

// 			const dateConditions =
// 				startDate && endDate
// 					? and(
// 							gte(schema.appointment.appointmentDate, startDate),
// 							lte(schema.appointment.appointmentDate, endDate)
// 						)
// 					: undefined;

// 			const whereClause = and(
// 				eq(schema.appointment.clinicId, clinicId),
// 				eq(schema.appointment.isDeleted, false),
// 				dateConditions
// 			);

// 			const [stats, byStatus, upcomingCount] = await Promise.all([
// 				db
// 					.select({
// 						total: count(),
// 						completed: sql<number>`sum(CASE WHEN ${schema.appointment.status} = 'COMPLETED' THEN 1 ELSE 0 END)`,
// 						cancelled: sql<number>`sum(CASE WHEN ${schema.appointment.status} = 'CANCELLED' THEN 1 ELSE 0 END)`,
// 						noShow: sql<number>`sum(CASE WHEN ${schema.appointment.status} = 'NO_SHOW' THEN 1 ELSE 0 END)`,
// 						totalRevenue: sql<number>`sum(${schema.appointment.appointmentPrice})`
// 					})
// 					.from(schema.appointment)
// 					.where(whereClause),
// 				db
// 					.select({
// 						status: schema.appointment.status,
// 						count: count()
// 					})
// 					.from(schema.appointment)
// 					.where(whereClause)
// 					.groupBy(schema.appointment.status),
// 				db.$count(
// 					schema.appointment,
// 					and(
// 						eq(schema.appointment.clinicId, clinicId),
// 						eq(schema.appointment.isDeleted, false),
// 						gte(schema.appointment.appointmentDate, new Date()),
// 						eq(schema.appointment.status, "CONFIRMED")
// 					)
// 				)
// 			]);

// 			const statusMap = stats[0] ?? { total: 0, completed: 0, cancelled: 0, noShow: 0, totalRevenue: 0 };

// 			return {
// 				...statusMap,
// 				upcomingCount,
// 				byStatus: byStatus.reduce(
// 					(acc, curr) => {
// 						if (curr.status) {
// 							acc[curr.status] = Number(curr.count);
// 						}
// 						return acc;
// 					},
// 					{} as Record<string, number>
// 				)
// 			};
// 		} catch (error) {
// 			console.error("Error getting appointment stats:", error);
// 			throw new Error("Failed to get appointment statistics");
// 		}
// 	});

// const getBookedSlotsForDoctor = createServerFn({ method: "GET" })
// 	.validator(bookedSlotsSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { doctorId, date } = ctx.data;
// 			const startOfDay = new Date(date);
// 			startOfDay.setHours(0, 0, 0, 0);
// 			const endOfDay = new Date(date);
// 			endOfDay.setHours(23, 59, 59, 999);

// 			const appointments = await db.query.appointment.findMany({
// 				where: {
// 					doctorId,
// 					isDeleted: false,
// 					appointmentDate: { gte: startOfDay, lte: endOfDay },
// 					status: { notIn: ["CANCELLED", "COMPLETED"] }
// 				},
// 				columns: { appointmentDate: true, durationMinutes: true }
// 			});

// 			return appointments.map(apt => ({
// 				start: apt.appointmentDate,
// 				duration: apt.durationMinutes ?? 30
// 			}));
// 		} catch (error) {
// 			console.error("Error getting booked slots:", error);
// 			throw new Error("Failed to get booked slots");
// 		}
// 	});

const updateAppointmentWithNote = createServerFn({ method: "POST" })
	.validator(updateWithNoteSchema)
	.handler(async ctx => {
		try {
			const { id, status, note } = ctx.data;
			const [result] = await db
				.update(schema.appointment)
				.set({
					status,
					note: note ? sql`${schema.appointment.note} || '\n' || ${note}` : undefined,
					updatedAt: new Date()
				})
				.where(eq(schema.appointment.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating appointment with note:", error);
			throw new Error("Failed to update appointment");
		}
	});

const completeAppointmentSchema = z.object({
	id: z.string(),
	notes: z.string().optional()
});

const completeAppointment = createServerFn({ method: "POST" })
	.validator(completeAppointmentSchema)
	.handler(async ctx => {
		try {
			const { id, notes } = ctx.data;
			return await db.transaction(async tx => {
				const [result] = await tx
					.update(schema.appointment)
					.set({
						status: "COMPLETED",
						note: notes,
						updatedAt: new Date()
					})
					.where(eq(schema.appointment.id, id))
					.returning();
				return result;
			});
		} catch (error) {
			console.error("Error completing appointment:", error);
			throw new Error("Failed to complete appointment");
		}
	});

const getAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			pagination: z.object({ page: z.number(), limit: z.number() }),
			filters: z
				.object({
					status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
					fromDate: z.date().optional(),
					toDate: z.date().optional(),
					patientId: z.string().optional(),
					doctorId: z.string().optional(),
					search: z.string().optional()
				})
				.optional()
		})
	)
	.handler(async ctx => {
		return getAppointmentsWithPagination({ data: ctx.data });
	});

const getUpcomingAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			clinicId: z.string(),
			patientId: z.string().optional(),
			doctorId: z.string().optional(),
			limit: z.number().optional()
		})
	)
	.handler(async ctx => {
		const { clinicId, patientId, doctorId, limit = 10 } = ctx.data;
		return getAppointmentsWithPagination({
			data: {
				clinicId,
				pagination: { page: 1, limit },
				filters: {
					status: "CONFIRMED",
					patientId,
					doctorId,
					fromDate: new Date()
				}
			}
		});
	});

const getTodaysAppointments = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		const { clinicId } = ctx.data;
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return getAppointmentsWithPagination({
			data: {
				clinicId,
				pagination: { page: 1, limit: 100 },
				filters: {
					fromDate: today,
					toDate: tomorrow
				}
			}
		});
	});

const getAppointmentStatistics = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		const { clinicId } = ctx.data;
		const counts = await getAppointmentCountsByStatus({ data: { clinicId } });
		const appointments = await getAllAppointments({ data: { clinicId } });

		const totalRevenue = appointments?.reduce((sum, apt) => sum + (apt.appointmentPrice ?? 0), 0) || 0;

		return {
			counts: {
				PENDING: counts?.PENDING || 0,
				CONFIRMED: counts?.CONFIRMED || 0,
				COMPLETED: counts?.COMPLETED || 0,
				CANCELLED: counts?.CANCELLED || 0,
				NO_SHOW: counts?.NO_SHOW || 0
			},
			totalAppointments: appointments?.length || 0,
			totalRevenue
		};
	});

export {
	bulkUpdateAppointmentStatus,
	cancelAppointment,
	checkTimeSlotAvailability,
	completeAppointment,
	createAppointment,
	createAppointmentWithReminder,
	createManyAppointments,
	createMedicalRecordWithEncounter,
	deleteAppointment,
	getAllAppointments,
	getAppointmentById,
	getAppointmentByIdFallback,
	getAppointmentCountsByStatus,
	getAppointmentStatistics,
	getAppointments,
	getAppointmentsByStatus,
	getAppointmentsFallback,
	getAppointmentsFallbackPaginated,
	getAppointmentsInRange,
	getAppointmentsWithFilters,
	getAppointmentsWithPagination,
	// getAvailableTimeSlots,
	// getBookedSlotsF\orDoctor,
	getDoctorAppointmentsInRange,
	// getDoctorAvailability,
	getMonthlyAppointmentData,
	getPatientAppointments,
	getTodaysAppointments,
	getUpcomingAppointments,
	rescheduleAppointment,
	restoreAppointment,
	softDeleteAppointment,
	updateAppointment,
	updateAppointmentStatus,
	updateAppointmentWithNote,
	updateManyAppointments,
	validateAppointment
};
