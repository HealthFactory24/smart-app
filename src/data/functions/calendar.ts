// db/repositories/calendar.repo.ts

import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import type { Weekday } from "@/db/schema";
import * as schema from "@/db/schema";

// =======================
// Schema Validators
// =======================

const doctorWorkingHoursSchema = z.object({
	doctorId: z.string(),
	date: z.date()
});

const checkSlotAvailabilitySchema = z.object({
	doctorId: z.string(),
	start: z.date(),
	end: z.date(),
	clinicId: z.string(),
	excludeId: z.string().optional()
});

const bookedSlotsSchema = z.object({
	doctorId: z.string(),
	date: z.date()
});

const createRemindersSchema = z.object({
	appointmentId: z.string(),
	appointmentDate: z.date(),
	reminderTimes: z.array(z.number()).optional()
});

const doctorWeeklyScheduleSchema = z.object({
	doctorId: z.string(),
	startDate: z.date()
});

// =======================
// Server Functions
// =======================

const getDoctorWorkingHours = createServerFn({ method: "GET" })
	.validator(doctorWorkingHoursSchema)
	.handler(async ctx => {
		try {
			const { doctorId, date } = ctx.data;
			const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

			const result = await db.query.workingDay.findFirst({
				where: {
					doctorId,
					day: dayOfWeek as Weekday
				}
			});

			if (!result) {
				return null;
			}

			return {
				start: result.startTime,
				end: result.endTime
			};
		} catch (error) {
			console.error("Error getting doctor working hours:", error);
			throw new Error("Failed to get doctor working hours");
		}
	});

const checkSlotAvailability = createServerFn({ method: "POST" })
	.validator(checkSlotAvailabilitySchema)
	.handler(async ctx => {
		try {
			const { doctorId, start, end, clinicId, excludeId } = ctx.data;

			const conditions = [
				eq(schema.appointment.doctorId, doctorId),
				eq(schema.appointment.clinicId, clinicId),
				eq(schema.appointment.isDeleted, false),
				sql`${schema.appointment.appointmentDate} < ${end.toISOString()}`,
				sql`${schema.appointment.appointmentDate} + (${schema.appointment.durationMinutes} || ' minutes')::interval > ${start.toISOString()}`
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
			console.error("Error checking slot availability:", error);
			throw new Error("Failed to check slot availability");
		}
	});

const getBookedSlotsForDoctor = createServerFn({ method: "GET" })
	.validator(bookedSlotsSchema)
	.handler(async ctx => {
		try {
			const { doctorId, date } = ctx.data;
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const appointments = await db.query.appointment.findMany({
				where: {
					doctorId,
					isDeleted: false,
					appointmentDate: { gte: startOfDay, lte: endOfDay },
					status: { notIn: ["CANCELLED", "COMPLETED"] }
				},
				columns: { appointmentDate: true, durationMinutes: true }
			});

			return appointments.map(apt => ({
				start: apt.appointmentDate,
				duration: apt.durationMinutes ?? 30
			}));
		} catch (error) {
			console.error("Error getting booked slots:", error);
			throw new Error("Failed to get booked slots");
		}
	});

const createAppointmentReminders = createServerFn({ method: "POST" })
	.validator(createRemindersSchema)
	.handler(async ctx => {
		try {
			const { appointmentId, appointmentDate, reminderTimes = [24, 2] } = ctx.data;
			const reminders = [];

			for (const hoursBefore of reminderTimes) {
				const reminderTime = new Date(appointmentDate);
				reminderTime.setHours(reminderTime.getHours() - hoursBefore);

				// Only create reminder if the time is in the future
				if (reminderTime > new Date()) {
					const [reminder] = await db
						.insert(schema.reminder)
						.values({
							id: crypto.randomUUID(),
							appointmentId,
							method: "EMAIL",
							status: "PENDING",
							sentAt: reminderTime
						})
						.returning();

					reminders.push(reminder);
				}
			}

			return reminders;
		} catch (error) {
			console.error("Error creating appointment reminders:", error);
			throw new Error("Failed to create appointment reminders");
		}
	});

const getDoctorWeeklySchedule = createServerFn({ method: "GET" })
	.validator(doctorWeeklyScheduleSchema)
	.handler(async ctx => {
		try {
			const { doctorId, startDate } = ctx.data;
			const endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 6);
			endDate.setHours(23, 59, 59, 999);

			const [workingDays, appointments] = await Promise.all([
				db.query.workingDay.findMany({
					where: {
						doctorId
					}
				}),
				db.query.appointment.findMany({
					where: {
						doctorId,
						isDeleted: false,
						appointmentDate: { gte: startDate, lte: endDate },
						status: { notIn: ["CANCELLED", "COMPLETED"] }
					},
					with: {
						patient: {
							columns: { id: true, firstName: true, lastName: true }
						}
					},
					orderBy: { appointmentDate: "asc" }
				})
			]);

			return { workingDays, appointments };
		} catch (error) {
			console.error("Error getting doctor weekly schedule:", error);
			throw new Error("Failed to get doctor weekly schedule");
		}
	});

// =======================
// Additional Calendar Utility Functions
// =======================

const getAvailableTimeSlotsForDay = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			date: z.date(),
			clinicId: z.string(),
			durationMinutes: z.number().optional(),
			excludeAppointmentId: z.string().optional()
		})
	)
	.handler(async ctx => {
		try {
			const { doctorId, date, clinicId, durationMinutes = 30, excludeAppointmentId } = ctx.data;

			// Get working hours
			const workingHours = await getDoctorWorkingHours({
				data: { doctorId, date }
			});

			if (!workingHours) {
				return [];
			}

			// Parse working hours
			const [startHour, startMinute] = workingHours.start.split(":").map(Number);
			const [endHour, endMinute] = workingHours.end.split(":").map(Number);

			const startTime = new Date(date);
			startTime.setHours(startHour, startMinute, 0, 0);

			const endTime = new Date(date);
			endTime.setHours(endHour, endMinute, 0, 0);

			// Get booked slots
			const bookedSlots = await getBookedSlotsForDoctor({
				data: { doctorId, date }
			});

			// Generate available slots
			const slots = [];
			const currentSlot = new Date(startTime);

			while (currentSlot < endTime) {
				const slotEnd = new Date(currentSlot);
				slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

				// Check if slot extends beyond working hours
				if (slotEnd > endTime) {
					break;
				}

				// Check for conflicts
				const isBooked = bookedSlots.some(booked => {
					const bookedStart = booked.start;
					const bookedEnd = new Date(bookedStart);
					bookedEnd.setMinutes(bookedEnd.getMinutes() + booked.duration);

					return currentSlot < bookedEnd && slotEnd > bookedStart;
				});

				// Check availability
				const isAvailable = await checkSlotAvailability({
					data: {
						doctorId,
						start: currentSlot,
						end: slotEnd,
						clinicId,
						excludeId: excludeAppointmentId
					}
				});

				if (!isBooked && isAvailable) {
					slots.push({
						start: currentSlot,
						end: slotEnd,
						startTime: currentSlot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
						endTime: slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
						available: true
					});
				}

				// Move to next slot
				currentSlot.setMinutes(currentSlot.getMinutes() + durationMinutes);
			}

			return slots;
		} catch (error) {
			console.error("Error getting available time slots for day:", error);
			throw new Error("Failed to get available time slots");
		}
	});

const bulkCreateAppointmentReminders = createServerFn({ method: "POST" })
	.validator(
		z.object({
			reminders: z.array(
				z.object({
					appointmentId: z.string(),
					appointmentDate: z.date(),
					reminderTimes: z.array(z.number()).optional()
				})
			)
		})
	)
	.handler(async ctx => {
		try {
			const { reminders } = ctx.data;
			const allReminders = [];

			for (const reminder of reminders) {
				const createdReminders = await createAppointmentReminders({
					data: {
						appointmentId: reminder.appointmentId,
						appointmentDate: reminder.appointmentDate,
						reminderTimes: reminder.reminderTimes
					}
				});
				allReminders.push(...createdReminders);
			}

			return allReminders;
		} catch (error) {
			console.error("Error bulk creating appointment reminders:", error);
			throw new Error("Failed to create appointment reminders");
		}
	});

const getDoctorScheduleForMonth = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			year: z.number(),
			month: z.number() // 0-11
		})
	)
	.handler(async ctx => {
		try {
			const { doctorId, year, month } = ctx.data;

			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);
			endDate.setHours(23, 59, 59, 999);

			const [workingDays, appointments] = await Promise.all([
				db.query.workingDay.findMany({
					where: {
						doctorId
					}
				}),
				db.query.appointment.findMany({
					where: {
						doctorId,
						isDeleted: false,
						appointmentDate: { gte: startDate, lte: endDate },
						status: { notIn: ["CANCELLED", "COMPLETED"] }
					},
					with: {
						patient: {
							columns: { id: true, firstName: true, lastName: true }
						}
					},
					orderBy: { appointmentDate: "asc" }
				})
			]);

			// Group appointments by date
			const appointmentsByDate = appointments.reduce(
				(acc, apt) => {
					const dateKey = apt.appointmentDate.toISOString().split("T")[0];
					if (!acc[dateKey]) {
						acc[dateKey] = [];
					}
					acc[dateKey].push(apt);
					return acc;
				},
				{} as Record<string, typeof appointments>
			);

			// Generate schedule for each day of the month
			const schedule = [];
			for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
				const currentDate = new Date(d);
				const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

				const workingDay = workingDays.find(wd => wd.day === dayOfWeek);
				const dateKey = currentDate.toISOString().split("T")[0];
				const dayAppointments = appointmentsByDate[dateKey] || [];

				schedule.push({
					date: currentDate,
					isWorkingDay: !!workingDay,
					workingHours: workingDay
						? {
								start: workingDay.startTime,
								end: workingDay.endTime
							}
						: null,
					appointments: dayAppointments,
					appointmentCount: dayAppointments.length
				});
			}

			return schedule;
		} catch (error) {
			console.error("Error getting doctor schedule for month:", error);
			throw new Error("Failed to get doctor schedule");
		}
	});

const getConflictingAppointments = createServerFn({ method: "GET" })
	.validator(
		z.object({
			doctorId: z.string(),
			startDate: z.date(),
			endDate: z.date(),
			clinicId: z.string()
		})
	)
	.handler(async ctx => {
		try {
			const { doctorId, startDate, endDate, clinicId } = ctx.data;

			const appointments = await db.query.appointment.findMany({
				where: {
					doctorId,
					clinicId,
					isDeleted: false,
					appointmentDate: { gte: startDate, lte: endDate },
					status: { notIn: ["CANCELLED", "COMPLETED"] }
				},
				orderBy: { appointmentDate: "asc" }
			});

			// Find overlapping appointments
			const conflicts = [];
			for (let i = 0; i < appointments.length; i++) {
				const current = appointments[i];
				const currentStart = current.appointmentDate;
				const currentEnd = new Date(currentStart);
				currentEnd.setMinutes(currentEnd.getMinutes() + (current.durationMinutes || 30));

				for (let j = i + 1; j < appointments.length; j++) {
					const next = appointments[j];
					const nextStart = next.appointmentDate;
					const nextEnd = new Date(nextStart);
					nextEnd.setMinutes(nextEnd.getMinutes() + (next.durationMinutes || 30));

					if (currentStart < nextEnd && currentEnd > nextStart) {
						conflicts.push({
							appointment1: current,
							appointment2: next,
							overlapStart: new Date(Math.max(currentStart.getTime(), nextStart.getTime())),
							overlapEnd: new Date(Math.min(currentEnd.getTime(), nextEnd.getTime()))
						});
					}
				}
			}

			return conflicts;
		} catch (error) {
			console.error("Error finding conflicting appointments:", error);
			throw new Error("Failed to find conflicting appointments");
		}
	});

export {
	bulkCreateAppointmentReminders,
	checkSlotAvailability,
	createAppointmentReminders,
	getAvailableTimeSlotsForDay,
	getBookedSlotsForDoctor,
	getConflictingAppointments,
	getDoctorScheduleForMonth,
	getDoctorWeeklySchedule,
	getDoctorWorkingHours
};
