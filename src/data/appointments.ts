import { getSession } from "#/lib/auth.functions";
import { appointment, type DbAppointment as AppointmentSelect, appointmentStatusEnum, doctor, patient } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

// Schema for creating appointments
export const appointmentSchema = z.object({
	patientId: z.string().min(1, "Patient is required"),
	doctorId: z.string().min(1, "Doctor is required"),
	serviceId: z.string().optional().nullable(),
	appointmentDate: z.coerce.date(),
	time: z.string(),
	durationMinutes: z.number().default(30),
	reason: z.string().optional(),
	note: z.string().optional(),
	type: z.string().default("REGULAR"),
	appointmentPrice: z.number().optional(),
});

// Get upcoming appointments count for dashboard/stats
export const getUpcomingAppointmentsCount = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		// Get user's clinic ID
		const userClinics = await db
			.select({ clinicId: sql`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinics[0]?.clinicId;
		if (!clinicId) return 0;

		const now = new Date();
		now.setHours(0, 0, 0, 0);

		let conditions = [
			eq(appointment.clinicId, clinicId as string),
			eq(appointment.isDeleted, false),
			gte(appointment.appointmentDate, now),
			sql`${appointment.status} IN ('PENDING', 'CONFIRMED')`
		];

		// If patient, only count their own children's appointments
		if (session.user.role === "patient") {
			const myPatients = await db
				.select({ id: patient.id })
				.from(patient)
				.where(eq(patient.userId, session.user.id));

			const patientIds = myPatients.map(p => p.id);
			if (patientIds.length === 0) return 0;
			conditions.push(sql`${appointment.patientId} IN (${patientIds.join(",")})`);
		}

		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(appointment)
			.where(and(...conditions));

		return Number(result[0]?.count ?? 0);
	}
);

// Get upcoming appointments with relations for dashboard
export const getDashboardUpcomingAppointments = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		// Get user's clinic ID
		const userClinics = await db
			.select({ clinicId: sql`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinics[0]?.clinicId;
		if (!clinicId) return [];

		const now = new Date();
		now.setHours(0, 0, 0, 0);

		let conditions = [
			eq(appointment.clinicId, clinicId as string),
			eq(appointment.isDeleted, false),
			gte(appointment.appointmentDate, now),
			sql`${appointment.status} IN ('PENDING', 'CONFIRMED')`
		];

		// If patient, only show their children's appointments
		if (session.user.role === "patient") {
			const myPatients = await db
				.select({ id: patient.id })
				.from(patient)
				.where(eq(patient.userId, session.user.id));

			const patientIds = myPatients.map(p => p.id);
			if (patientIds.length === 0) return [];
			conditions.push(sql`${appointment.patientId} IN (${patientIds.join(",")})`);
		}

		const results = await db.query.appointment.findMany({
			where: {
				clinicId,
				isDeleted: false,
				status: 'CONFIRMED'
			},
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true }
				},
				doctor: {
					columns: { id: true, name: true, specialty: true }
				}
			},
			orderBy: { appointmentDate: "asc" },
			limit: 5
		});

		return results;
	}
);

// Get upcoming appointments count for header badge
export const getAppointmentsCount = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) {
			return { count: 0 };
		}

		const { db } = await import("@/db");

		// Get user's patients (if parent) or their own appointments (if admin/staff)
		let count = 0;

		if (session.user.role === "admin") {
			// For admin, count all upcoming appointments
			const result = await db
				.select({ count: sql<number>`count(*)` })
				.from(appointment)
				.where(
					and(
						sql`${appointment.isDeleted} = false`,
						sql`${appointment.appointmentDate} >= now()`,
						eq(appointment.status, "CONFIRMED")
					)
				);
			count = Number(result[0]?.count ?? 0);
		} else {
			// For parents, get appointments for their children
			const myPatients = await db
				.select({ id: patient.id })
				.from(patient)
				.where(eq(patient.userId, session.user.id));

			const patientIds = myPatients.map(p => p.id);

			if (patientIds.length > 0) {
				const result = await db
					.select({ count: sql<number>`count(*)` })
					.from(appointment)
					.where(
						and(
							sql`${appointment.isDeleted} = false`,
							sql`${appointment.appointmentDate} >= now()`,
							eq(appointment.status, "CONFIRMED"),
							sql`${appointment.patientId} IN (${patientIds.join(",")})`
						)
					);
				count = Number(result[0]?.count ?? 0);
			}
		}

		return { count };
	},
);

// Get all appointments (admin/staff only)
export const getAllAppointments = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		const allAppointments = await db
			.select({
				id: appointment.id,
				patientId: appointment.patientId,
				doctorId: appointment.doctorId,
				serviceId: appointment.serviceId,
				appointmentDate: appointment.appointmentDate,
				time: appointment.time,
				status: appointment.status,
				type: appointment.type,
				reason: appointment.reason,
				note: appointment.note,
				createdAt: appointment.createdAt,
				patientFirstName: patient.firstName,
				patientLastName: patient.lastName,
				doctorName: doctor.name,
				doctorSpecialty: doctor.specialty,
			})
			.from(appointment)
			.innerJoin(patient, eq(appointment.patientId, patient.id))
			.innerJoin(doctor, eq(appointment.doctorId, doctor.id))
			.orderBy(desc(appointment.appointmentDate));

		return allAppointments;
	},
);

// Get my appointments (for logged-in parent)
export const getMyAppointments = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		// Get all patients belonging to this user
		const myPatients = await db
			.select({ id: patient.id })
			.from(patient)
			.where(eq(patient.userId, session.user.id));

		const patientIds = myPatients.map(p => p.id);

		if (patientIds.length === 0) return [];

		const myAppointments = await db
			.select({
				id: appointment.id,
				patientId: appointment.patientId,
				doctorId: appointment.doctorId,
				serviceId: appointment.serviceId,
				appointmentDate: appointment.appointmentDate,
				time: appointment.time,
				status: appointment.status,
				type: appointment.type,
				reason: appointment.reason,
				note: appointment.note,
				createdAt: appointment.createdAt,
				patientFirstName: patient.firstName,
				patientLastName: patient.lastName,
				doctorName: doctor.name,
				doctorSpecialty: doctor.specialty,
			})
			.from(appointment)
			.innerJoin(patient, eq(appointment.patientId, patient.id))
			.innerJoin(doctor, eq(appointment.doctorId, doctor.id))
			.where(sql`${appointment.patientId} IN (${patientIds.join(",")})`)
			.orderBy(desc(appointment.appointmentDate));

		return myAppointments;
	},
);

// Get appointment by ID
export const getAppointmentById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const appointmentId = z.string().parse(data);

		const result = await db
			.select({
				id: appointment.id,
				patientId: appointment.patientId,
				doctorId: appointment.doctorId,
				serviceId: appointment.serviceId,
				appointmentDate: appointment.appointmentDate,
				time: appointment.time,
				durationMinutes: appointment.durationMinutes,
				status: appointment.status,
				type: appointment.type,
				reason: appointment.reason,
				note: appointment.note,
				appointmentPrice: appointment.appointmentPrice,
				createdAt: appointment.createdAt,
				patient: patient,
				doctor: doctor,
			})
			.from(appointment)
			.innerJoin(patient, eq(appointment.patientId, patient.id))
			.innerJoin(doctor, eq(appointment.doctorId, doctor.id))
			.where(eq(appointment.id, appointmentId))
			.limit(1);

		const foundAppointment = result[0] ?? null;

		if (!foundAppointment) return null;

		// Check authorization
		const isAdmin = session.user.role === "admin";
		const isParent = foundAppointment.patient.userId === session.user.id;

		if (!isAdmin && !isParent) {
			throw new Error("Forbidden");
		}

		return foundAppointment;
	});

// Create a new appointment
export const createAppointment = createServerFn({ method: "POST" })
	.inputValidator((data: z.infer<typeof appointmentSchema>) =>
		appointmentSchema.parse(data),
	)
	.handler(async ({ data }): Promise<AppointmentSelect> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		// Verify patient belongs to this user or user is admin
		const patientRecord = await db
			.select()
			.from(patient)
			.where(eq(patient.id, data.patientId))
			.limit(1);

		if (!patientRecord[0]) throw new Error("Patient not found");

		const isAdmin = session.user.role === "admin";
		const isParent = patientRecord[0].userId === session.user.id;

		if (!isAdmin && !isParent) {
			throw new Error("Forbidden");
		}

		// Get clinic ID from patient
		const clinicId = patientRecord[0].clinicId;

		const result = await db
			.insert(appointment)
			.values({
				id: crypto.randomUUID(),
				...data,
				clinicId,
				status: "PENDING",
				doctorSpecialty: data.serviceId ? undefined : undefined, // Will be fetched from doctor
			})
			.returning();

		const newAppointment = result[0];
		if (!newAppointment) {
			throw new Error("Failed to create appointment");
		}

		return newAppointment;
	});

// Update appointment status
export const updateAppointmentStatus = createServerFn({ method: "POST" })
	.inputValidator((data: { appointmentId: string; status: typeof appointmentStatusEnum.enumValues[number] }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		const result = await db
			.update(appointment)
			.set({
				status: data.status,
				updatedAt: new Date(),
			})
			.where(eq(appointment.id, data.appointmentId))
			.returning();

		if (!result[0]) throw new Error("Appointment not found");

		return result[0];
	});

// Cancel appointment (user or admin)
export const cancelAppointment = createServerFn({ method: "POST" })
	.inputValidator((data: { appointmentId: string; reason?: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		// Get appointment details
		const appointmentRecord = await db
			.select()
			.from(appointment)
			.where(eq(appointment.id, data.appointmentId))
			.limit(1);

		if (!appointmentRecord[0]) throw new Error("Appointment not found");

		// Get patient to check ownership
		const patientRecord = await db
			.select()
			.from(patient)
			.where(eq(patient.id, appointmentRecord[0].patientId))
			.limit(1);

		const isAdmin = session.user.role === "admin";
		const isParent = patientRecord[0]?.userId === session.user.id;

		if (!isAdmin && !isParent) {
			throw new Error("Forbidden");
		}

		const result = await db
			.update(appointment)
			.set({
				status: "CANCELLED",
				note: data.reason ? `Cancelled: ${data.reason}` : appointmentRecord[0].note,
				updatedAt: new Date(),
			})
			.where(eq(appointment.id, data.appointmentId))
			.returning();

		return result[0];
	});

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = createServerFn({ method: "POST" })
	.inputValidator((data: { doctorId: string; date: Date }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");

		// Get doctor's working hours for that day
		const dayOfWeek = data.date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

		const [workingDay] = await db
			.select({ startTime: sql<string>`start_time`, endTime: sql<string>`end_time` })
			.from(sql`working_day`)
			.where(
				and(
					eq(sql`doctor_id`, data.doctorId),
					eq(sql`day`, dayOfWeek)
				)
			)
			.limit(1);

		if (!workingDay) return [];

		// Get existing appointments for that doctor on that date
		const startOfDay = new Date(data.date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(data.date);
		endOfDay.setHours(23, 59, 59, 999);

		const existingAppointments = await db
			.select({ time: appointment.time })
			.from(appointment)
			.where(
				and(
					eq(appointment.doctorId, data.doctorId),
					gte(appointment.appointmentDate, startOfDay),
					lte(appointment.appointmentDate, endOfDay),
					sql`${appointment.status} IN ('PENDING', 'CONFIRMED')`
				)
			);

		const bookedTimes = new Set(existingAppointments.map(a => a.time));

		// Generate time slots
		const startTime = workingDay.startTime;
		const endTime = workingDay.endTime;
		const duration = 30; // minutes

		const slots = [];
		let current = new Date(`${data.date.toDateString()} ${startTime}`);
		const end = new Date(`${data.date.toDateString()} ${endTime}`);

		while (current < end) {
			const timeString = current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

			if (!bookedTimes.has(timeString)) {
				slots.push(timeString);
			}

			current.setMinutes(current.getMinutes() + duration);
		}

		return slots;
	});

// Get all appointments for a specific patient
export const getPatientAppointments = createServerFn({ method: "GET" })
	.validator((patientId: string) => patientId)
	.handler(async ({ data: patientId }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		const results = await db
			.select({
				id: appointment.id,
				appointmentDate: appointment.appointmentDate,
				time: appointment.time,
				status: appointment.status,
				type: appointment.type,
				reason: appointment.reason,
				doctorName: doctor.name,
				doctorSpecialty: doctor.specialty,
				appointmentPrice: appointment.appointmentPrice,
			})
			.from(appointment)
			.innerJoin(doctor, eq(appointment.doctorId, doctor.id))
			.where(
				and(
					eq(appointment.patientId, patientId),
					eq(appointment.isDeleted, false)
				)
			)
			.orderBy(desc(appointment.appointmentDate));

		return results;
	});
