// db/repo/doctor.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, count, eq, inArray, like, or } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { DoctorCreateSchema, DoctorUpdateSchema, type Status, type Weekday, WorkingDaySchema } from "@/db/zod";

// =======================
// Schema Validators
// =======================

const doctorIdSchema = z.object({
	doctorId: z.string().min(1),
	clinicId: z.string().optional()
});

const doctorUserIdSchema = z.object({
	userId: z.string().min(1),
	clinicId: z.string().optional()
});

const listDoctorsSchema = z.object({
	clinicId: z.string(),
	limit: z.number().min(1).max(100).default(10),
	offset: z.number().min(0).default(0),
	search: z.string().optional(),
	specialty: z.string().optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
		.optional(),
	availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).optional()
});

// const createDoctorSchema = z.object({
// 	id: z.string().optional(),
// 	email: z.string().email().optional(),
// 	name: z.string(),
// 	userId: z.string().optional(),
// 	clinicId: z.string().optional(),
// 	specialty: z.string(),
// 	licenseNumber: z.string().optional(),
// 	phone: z.string().optional(),
// 	address: z.string().optional(),
// 	department: z.string().optional(),
// 	img: z.string().optional(),
// 	colorCode: z.string().optional(),
// 	availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).optional(),
// 	availableFromWeekDay: z
// 		.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
// 		.optional(),
// 	availableToWeekDay: z
// 		.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
// 		.optional(),
// 	isActive: z.boolean().optional(),
// 	status: z
// 		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
// 		.optional(),
// 	availableFromTime: z.string().optional(),
// 	availableToTime: z.string().optional(),
// 	type: z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]).default("FULL"),
// 	appointmentPrice: z.number().optional(),
// 	role: z.enum(["admin", "doctor", "staff", "patient"]).optional(),
// 	rating: z.number().min(0).max(5).optional()
// });

// const updateDoctorSchema = z.object({
// 	doctorId: z.string(),
// 	data: createDoctorSchema.partial()
// });

// const workingDaySchema = z.object({
// 	id: z.string().optional(),
// 	doctorId: z.string(),
// 	day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
// 	startTime: z.string(),
// 	endTime: z.string()
// });

const workingDayIdSchema = z.object({
	id: z.string(),
	clinicId: z.string().optional()
});

const doctorPerformanceSchema = z.object({
	doctorId: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	clinicId: z.string().optional()
});

const doctorAvailabilitySchema = z.object({
	doctorId: z.string(),
	date: z.date()
});

const doctorScheduleSchema = z.object({
	doctorId: z.string(),
	clinicId: z.string().optional()
});

const timeSlotsSchema = z.object({
	doctorId: z.string(),
	date: z.date(),
	durationMinutes: z.number().default(30)
});

const updateScheduleSchema = z.object({
	doctorId: z.string(),
	workingDays: z.array(WorkingDaySchema)
});

const bulkOperationSchema = z.object({
	ids: z.array(z.string()),
	data: DoctorCreateSchema.partial()
});

const workingDayBulkSchema = z.object({
	ids: z.array(z.string()),
	data: WorkingDaySchema.partial()
});

const updateStatusSchema = z.object({
	id: z.string(),
	status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
});

// =======================
// Doctor Queries
// =======================

export const getDoctorById = createServerFn({ method: "GET" })
	.validator(doctorIdSchema)
	.handler(async ctx => {
		try {
			const { doctorId, clinicId } = ctx.data;
			const conditions = {
				id: doctorId,
				clinicId,
				isDeleted: false
			};
			if (clinicId) conditions.clinicId = clinicId;

			return await db.query.doctor.findFirst({
				where: conditions,
				with: {
					user: true,
					clinic: true,
					workingDays: true
				}
			});
		} catch (error) {
			console.error("Error getting doctor by ID:", error);
			throw new Error("Failed to get doctor");
		}
	});

export const getDoctorByUserId = createServerFn({ method: "GET" })
	.validator(doctorUserIdSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const conditions = { userId, isDeleted: false, clinicId };
			if (clinicId) conditions.clinicId = clinicId;

			return await db.query.doctor.findFirst({
				where: conditions,
				with: { user: true, clinic: true }
			});
		} catch (error) {
			console.error("Error getting doctor by user ID:", error);
			throw new Error("Failed to get doctor");
		}
	});

export const listDoctors = createServerFn({ method: "GET" })
	.validator(listDoctorsSchema)
	.handler(async ctx => {
		try {
			const { clinicId, limit, offset, search, specialty, status, availabilityStatus } = ctx.data;

			let conditions = and(eq(schema.doctor.clinicId, clinicId), eq(schema.doctor.isDeleted, false));

			if (specialty) {
				conditions = and(conditions, eq(schema.doctor.specialty, specialty));
			}
			if (status) {
				conditions = and(conditions, eq(schema.doctor.status, status));
			}
			if (availabilityStatus) {
				conditions = and(conditions, eq(schema.doctor.availabilityStatus, availabilityStatus));
			}
			if (search) {
				conditions = and(
					conditions,
					or(like(schema.doctor.name, `%${search}%`), like(schema.doctor.specialty, `%${search}%`))
				);
			}

			const [doctors, totalResult] = await Promise.all([
				db.query.doctor.findMany({
					where: {
						clinicId,
						isDeleted: false,
						...conditions
					},
					limit,
					offset,
					orderBy: { name: "asc" }
				}),
				db.select({ count: count() }).from(schema.doctor).where(conditions)
			]);

			return {
				doctors,
				total: totalResult[0]?.count ?? 0
			};
		} catch (error) {
			console.error("Error listing doctors:", error);
			throw new Error("Failed to list doctors");
		}
	});

// =======================
// Doctor CRUD Operations
// =======================

export const createDoctor = createServerFn({ method: "POST" })
	.validator(DoctorCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.doctor)
				.values({
					...data,
					id: (data.id ?? crypto.randomUUID()) as string,
					createdAt: new Date(),
					updatedAt: new Date(),
					isDeleted: false
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating doctor:", error);
			throw new Error("Failed to create doctor");
		}
	});

export const updateDoctor = createServerFn({ method: "POST" })
	.validator(DoctorUpdateSchema)
	.handler(async ctx => {
		try {
			const { id, ...data } = ctx.data;
			const [result] = await db
				.update(schema.doctor)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.doctor.id, id ?? ""))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating doctor:", error);
			throw new Error("Failed to update doctor");
		}
	});

export const updateDoctorStatus = createServerFn({ method: "POST" })
	.validator(updateStatusSchema)
	.handler(async ctx => {
		try {
			const { id, status } = ctx.data;
			const [result] = await db
				.update(schema.doctor)
				.set({ status, updatedAt: new Date() })
				.where(eq(schema.doctor.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating doctor status:", error);
			throw new Error("Failed to update doctor status");
		}
	});

export const bulkUpdateDoctorStatus = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), status: z.string() }))
	.handler(async ctx => {
		try {
			const { ids, status } = ctx.data;
			return await db
				.update(schema.doctor)
				.set({ status: status as Status, updatedAt: new Date() })
				.where(inArray(schema.doctor.id, ids))
				.returning();
		} catch (error) {
			console.error("Error bulk updating doctor status:", error);
			throw new Error("Failed to bulk update doctor status");
		}
	});

export const upsertDoctor = createServerFn({ method: "POST" })
	.validator(DoctorCreateSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.doctor)
				.values({
					...data,
					updatedAt: new Date()
				})
				.onConflictDoUpdate({
					target: schema.doctor.userId,
					set: { ...data, updatedAt: new Date() }
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error upserting doctor:", error);
			throw new Error("Failed to upsert doctor");
		}
	});

export const softDeleteDoctor = createServerFn({ method: "POST" })
	.validator(doctorIdSchema)
	.handler(async ctx => {
		try {
			const { doctorId, clinicId } = ctx.data;
			const conditions = [eq(schema.doctor.id, doctorId)];
			if (clinicId) conditions.push(eq(schema.doctor.clinicId, clinicId));

			const [result] = await db
				.update(schema.doctor)
				.set({ deletedAt: new Date(), isDeleted: true, updatedAt: new Date() })
				.where(and(...conditions))
				.returning();
			return result;
		} catch (error) {
			console.error("Error soft deleting doctor:", error);
			throw new Error("Failed to delete doctor");
		}
	});

export const deleteDoctor = createServerFn({ method: "POST" })
	.validator(doctorIdSchema)
	.handler(async ctx => {
		try {
			const { doctorId, clinicId } = ctx.data;
			const conditions = [eq(schema.doctor.id, doctorId)];
			if (clinicId) conditions.push(eq(schema.doctor.clinicId, clinicId));

			const [result] = await db
				.delete(schema.doctor)
				.where(and(...conditions))
				.returning();
			return result;
		} catch (error) {
			console.error("Error deleting doctor:", error);
			throw new Error("Failed to delete doctor");
		}
	});

export const restoreDoctor = createServerFn({ method: "POST" })
	.validator(z.object({ doctorId: z.string() }))
	.handler(async ctx => {
		try {
			const { doctorId } = ctx.data;
			const [result] = await db
				.update(schema.doctor)
				.set({ deletedAt: null, isDeleted: false, updatedAt: new Date() })
				.where(eq(schema.doctor.id, doctorId))
				.returning();
			return result;
		} catch (error) {
			console.error("Error restoring doctor:", error);
			throw new Error("Failed to restore doctor");
		}
	});

export const createManyDoctors = createServerFn({ method: "POST" })
	.validator(z.object({ doctors: z.array(DoctorCreateSchema) }))
	.handler(async ctx => {
		try {
			const { doctors } = ctx.data;
			const doctorsWithIds = doctors.map(doctor => ({
				...doctor,
				id: (doctor.id ?? crypto.randomUUID()) as string,
				createdAt: new Date(),
				updatedAt: new Date(),
				isDeleted: false
			}));
			return await db.insert(schema.doctor).values(doctorsWithIds).returning();
		} catch (error) {
			console.error("Error creating many doctors:", error);
			throw new Error("Failed to create doctors");
		}
	});

export const updateManyDoctors = createServerFn({ method: "POST" })
	.validator(bulkOperationSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db.update(schema.doctor).set(updateData).where(inArray(schema.doctor.id, ids)).returning();
		} catch (error) {
			console.error("Error updating many doctors:", error);
			throw new Error("Failed to update doctors");
		}
	});

// =======================
// Working Days Operations
// =======================

export const getWorkingDays = createServerFn({ method: "GET" })
	.validator(z.object({ doctorId: z.string() }))
	.handler(async ctx => {
		try {
			const { doctorId } = ctx.data;
			return await db.query.workingDay.findMany({
				where: { doctorId },
				orderBy: { day: "asc" }
			});
		} catch (error) {
			console.error("Error getting working days:", error);
			throw new Error("Failed to get working days");
		}
	});

export const createWorkingDay = createServerFn({ method: "POST" })
	.validator(WorkingDaySchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.workingDay)
				.values({
					...data,
					id: data.id ?? crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating working day:", error);
			throw new Error("Failed to create working day");
		}
	});

export const updateWorkingDay = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: WorkingDaySchema.partial() }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;
			const [result] = await db
				.update(schema.workingDay)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(schema.workingDay.id, id))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating working day:", error);
			throw new Error("Failed to update working day");
		}
	});

export const deleteWorkingDay = createServerFn({ method: "POST" })
	.validator(workingDayIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;

			if (clinicId) {
				// Get doctors in the clinic first
				const clinicDoctors = await db
					.select({ id: schema.doctor.id })
					.from(schema.doctor)
					.where(eq(schema.doctor.clinicId, clinicId));

				const doctorIds = clinicDoctors.map(d => d.id);

				const [result] = await db
					.delete(schema.workingDay)
					.where(and(eq(schema.workingDay.id, id), inArray(schema.workingDay.doctorId, doctorIds)))
					.returning();
				return result;
			}

			const [result] = await db.delete(schema.workingDay).where(eq(schema.workingDay.id, id)).returning();
			return result;
		} catch (error) {
			console.error("Error deleting working day:", error);
			throw new Error("Failed to delete working day");
		}
	});

export const replaceWorkingDays = createServerFn({ method: "POST" })
	.validator(z.object({ doctorId: z.string(), workingDays: z.array(WorkingDaySchema) }))
	.handler(async ctx => {
		try {
			const { doctorId, workingDays } = ctx.data;
			return await db.transaction(async tx => {
				await tx.delete(schema.workingDay).where(eq(schema.workingDay.doctorId, doctorId));
				if (workingDays.length > 0) {
					const workingDaysWithIds = workingDays.map(day => ({
						...day,
						id: day.id ?? crypto.randomUUID(),
						createdAt: new Date(),
						updatedAt: new Date()
					}));
					await tx.insert(schema.workingDay).values(workingDaysWithIds);
				}
			});
		} catch (error) {
			console.error("Error replacing working days:", error);
			throw new Error("Failed to replace working days");
		}
	});

export const createManyWorkingDays = createServerFn({ method: "POST" })
	.validator(z.object({ workingDays: z.array(WorkingDaySchema) }))
	.handler(async ctx => {
		try {
			const { workingDays } = ctx.data;
			const workingDaysWithIds = workingDays.map(day => ({
				...day,
				id: day.id ?? crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			}));
			return await db.insert(schema.workingDay).values(workingDaysWithIds).returning();
		} catch (error) {
			console.error("Error creating many working days:", error);
			throw new Error("Failed to create working days");
		}
	});

export const updateManyWorkingDays = createServerFn({ method: "POST" })
	.validator(workingDayBulkSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;
			const updateData = { ...data, updatedAt: new Date() };
			return await db
				.update(schema.workingDay)
				.set(updateData)
				.where(inArray(schema.workingDay.id, ids))
				.returning();
		} catch (error) {
			console.error("Error updating many working days:", error);
			throw new Error("Failed to update working days");
		}
	});

// =======================
// Doctor Performance
// =======================

export const getDoctorPerformance = createServerFn({ method: "GET" })
	.validator(doctorPerformanceSchema)
	.handler(async ctx => {
		try {
			const { doctorId, startDate, endDate, clinicId } = ctx.data;

			const [appointments, ratings, prescriptions] = await Promise.all([
				db.query.appointment.findMany({
					where: {
						doctorId,
						isDeleted: false,
						...(clinicId && { clinicId }),
						appointmentDate: { gte: startDate, lte: endDate }
					}
				}),
				db.query.rating.findMany({
					where: {
						staffId: doctorId,
						createdAt: { gte: startDate, lte: endDate }
					}
				}),
				db.query.prescription.findMany({
					where: {
						doctorId,
						issuedDate: { gte: startDate, lte: endDate }
					}
				})
			]);

			const completedAppointments = appointments.filter(a => a.status === "COMPLETED");
			const cancelledAppointments = appointments.filter(a => a.status === "CANCELLED");
			const averageRating =
				ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratings.length : 0;

			return {
				totalAppointments: appointments.length,
				completedAppointments: completedAppointments.length,
				cancelledAppointments: cancelledAppointments.length,
				completionRate:
					appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0,
				totalPrescriptions: prescriptions.length,
				averageRating,
				totalRevenue: completedAppointments.reduce((sum, a) => sum + (a.appointmentPrice ?? 0), 0)
			};
		} catch (error) {
			console.error("Error getting doctor performance:", error);
			throw new Error("Failed to get doctor performance");
		}
	});

// =======================
// Doctor Availability & Schedule
// =======================

export const getDoctorAvailability = createServerFn({ method: "GET" })
	.validator(doctorAvailabilitySchema)
	.handler(async ctx => {
		try {
			const { doctorId, date } = ctx.data;

			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const [workingDays, appointments] = await Promise.all([
				db.query.workingDay.findMany({
					where: { doctorId }
				}),
				db.query.appointment.findMany({
					where: {
						doctorId,
						appointmentDate: {
							gte: startOfDay,
							lte: endOfDay
						},
						isDeleted: false
					}
				})
			]);

			return { workingDays, appointments };
		} catch (error) {
			console.error("Error getting doctor availability:", error);
			throw new Error("Failed to get doctor availability");
		}
	});

export const getDoctorWithSchedule = createServerFn({ method: "GET" })
	.validator(doctorScheduleSchema)
	.handler(async ctx => {
		try {
			const { doctorId, clinicId } = ctx.data;
			const whereCondition = { id: doctorId, clinicId };
			if (clinicId) whereCondition.clinicId = clinicId;

			return await db.query.doctor.findFirst({
				where: whereCondition,
				with: {
					user: true,
					clinic: true,
					workingDays: true,
					appointments: {
						where: {
							isDeleted: false,
							appointmentDate: { gte: new Date() }
						},
						with: {
							patient: true,
							service: true
						},
						orderBy: { appointmentDate: "asc" }
					},
					medicalRecords: {
						with: {
							patient: true
						},
						orderBy: { createdAt: "desc" },
						limit: 20
					},
					prescriptions: {
						where: { status: "active" },
						with: {
							patient: true,
							prescribedItems: {
								with: {
									drug: true
								}
							}
						},
						orderBy: { issuedDate: "desc" }
					}
				}
			});
		} catch (error) {
			console.error("Error getting doctor with schedule:", error);
			throw new Error("Failed to get doctor schedule");
		}
	});

export const getAvailableTimeSlots = createServerFn({ method: "GET" })
	.validator(timeSlotsSchema)
	.handler(async ctx => {
		try {
			const { doctorId, date, durationMinutes } = ctx.data;
			const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

			const workingDay = await db.query.workingDay.findFirst({
				where: {
					doctorId: doctorId,
					day: dayOfWeek as Weekday
				}
			});

			if (!workingDay) {
				return [];
			}

			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const appointments = await db.query.appointment.findMany({
				where: {
					doctorId,
					appointmentDate: {
						gte: startOfDay,
						lte: endOfDay
					},
					isDeleted: false,
					status: {
						notIn: ["CANCELLED", "COMPLETED"]
					}
				}
			});

			// Generate time slots
			const startHour = Number.parseInt(workingDay.startTime.split(":")[0] ?? "0", 10);
			const startMinute = Number.parseInt(workingDay.startTime.split(":")[1] ?? "0", 10);
			const endHour = Number.parseInt(workingDay.endTime.split(":")[0] ?? "0", 10);
			const endMinute = Number.parseInt(workingDay.endTime.split(":")[1] ?? "0", 10);

			const slots = [];
			const currentTime = new Date(date);
			currentTime.setHours(startHour, startMinute, 0, 0);
			const endTime = new Date(date);
			endTime.setHours(endHour, endMinute, 0, 0);

			while (currentTime < endTime) {
				const slotEnd = new Date(currentTime);
				slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

				// Check if slot is available
				const isBooked = appointments.some(apt => {
					const aptTime = new Date(apt.appointmentDate);
					return (
						aptTime.getHours() === currentTime.getHours() &&
						aptTime.getMinutes() === currentTime.getMinutes()
					);
				});

				if (!isBooked) {
					slots.push({
						startTime: currentTime.toLocaleTimeString(),
						endTime: slotEnd.toLocaleTimeString(),
						available: true
					});
				}

				currentTime.setMinutes(currentTime.getMinutes() + durationMinutes);
			}

			return slots;
		} catch (error) {
			console.error("Error getting available time slots:", error);
			throw new Error("Failed to get available time slots");
		}
	});

export const updateDoctorSchedule = createServerFn({ method: "POST" })
	.validator(updateScheduleSchema)
	.handler(async ctx => {
		try {
			const { doctorId, workingDays } = ctx.data;

			await db.transaction(async tx => {
				await tx.delete(schema.workingDay).where(eq(schema.workingDay.doctorId, doctorId));

				for (const day of workingDays) {
					await tx.insert(schema.workingDay).values({
						...day,
						doctorId,
						id: day.id ?? crypto.randomUUID(),
						createdAt: new Date(),
						updatedAt: new Date()
					});
				}
			});

			return { success: true };
		} catch (error) {
			console.error("Error updating doctor schedule:", error);
			throw new Error("Failed to update doctor schedule");
		}
	});
