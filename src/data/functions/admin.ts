import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

// Schema definitions
const clinicIdSchema = z.object({ clinicId: z.uuid() });
const appointmentIdsSchema = z.object({
	appointmentIds: z.array(z.string()),
	status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
	reason: z.string().optional()
});
const cancelAppointmentSchema = z.object({
	appointmentId: z.string(),
	clinicId: z.string(),
	reason: z.string().optional()
});

const rescheduleSchema = z.object({
	id: z.string(),
	newDate: z.date(),
	clinicId: z.string()
});
// const configKeySchema = z.object({ key: z.string() });
const configValueSchema = z.object({ key: z.string(), value: z.string() });
// const clinicByNameSchema = z.object({ name: z.string() });

// Placeholder for the actual Drizzle schema for appointment insertion
// This would typically be imported from a central schema definition file.
const AppointmentInsertSchema = z.object({
	id: z.uuid().optional(), // Assuming ID is generated or optional on insert
	clinicId: z.uuid(),
	patientId: z.uuid(),
	doctorId: z.uuid(),
	serviceId: z.uuid().optional(),
	appointmentDate: z.date(),
	time: z.string(),
	durationMinutes: z.number().int().positive().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
	reason: z.string().optional(),
	note: z.string().optional(),
	appointmentPrice: z.number().optional(),
	type: z.string().optional(),
	isDeleted: z.boolean().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	deletedAt: z.date().optional()
});

const updateAppointmentDataSchema = AppointmentInsertSchema.partial();

const updateAppointmentSchema = z.object({
	id: z.uuid(),
	clinicId: z.uuid(),
	data: updateAppointmentDataSchema
});

const doctorRecordSchema = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	name: z.string()
});
const staffRecordSchema = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	name: z.string()
});
const patientRecordSchema = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string(),
	clinicId: z.string(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	firstName: z.string(),
	lastName: z.string()
});

// Placeholder for the actual Drizzle schema for clinic insertion
const ClinicInsertSchema = z.object({
	id: z.uuid().optional(),
	name: z.string().min(1),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	timezone: z.string().optional(),
	isDeleted: z.boolean().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	isDefault: z.boolean().optional(),
	deletedAt: z.date().optional()
});
const createClinicSchema = ClinicInsertSchema;
const userIdSchema = z.object({ userId: z.string() });
// const monthlyDataSchema = z.object({ clinicId: z.string() });

// Server Functions

// const getAppointmentCountsByStatus = createServerFn({ method: "GET" })
// 	.validator(clinicIdSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId } = ctx.data;

// 			const result = await db
// 				.select({
// 					status: schema.appointment.status,
// 					count: sql<number>`CAST(count(*) AS INTEGER)`
// 				})
// 				.from(schema.appointment)
// 				.where(eq(schema.appointment.clinicId, clinicId))
// 				.groupBy(schema.appointment.status);

// 			return result;
// 		} catch (error) {
// 			console.error("Error getting appointment counts:", error);
// 			throw new Error("Failed to get appointment counts");
// 		}
// 	});

const setDefaultClinic = createServerFn({ method: "POST" })
	.validator(clinicIdSchema)
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;
			await db.update(schema.clinic).set({ isDefault: false }).where(eq(schema.clinic.isDefault, true));
			const [updatedClinic] = await db
				.update(schema.clinic)
				.set({ isDefault: true })
				.where(eq(schema.clinic.id, clinicId))
				.returning();
			return updatedClinic;
		} catch (error) {
			console.error("Error setting default clinic:", error);
			throw new Error("Failed to set default clinic");
		}
	});

// const getConfigValue = createServerFn({ method: "GET" })
// 	.validator(configKeySchema)
// 	.handler(async ctx => {
// 		try {
// 			const { key } = ctx.data;
// 			const result = await db.query.configStore.findFirst({
// 				where: { key }
// 			});
// 			return result?.value || null;
// 		} catch (error) {
// 			console.error("Error getting config value:", error);
// 			throw new Error("Failed to get config value");
// 		}
// 	});

const bulkUpdateAppointmentsStatus = createServerFn({ method: "POST" })
	.validator(appointmentIdsSchema)
	.handler(async ctx => {
		try {
			const { appointmentIds, status, reason } = ctx.data;
			return await db.transaction(async tx => {
				const updatedAppointments = await tx
					.update(schema.appointment)
					.set({
						status,
						reason,
						updatedAt: new Date()
					})
					.where(sql`${schema.appointment.id} IN (${appointmentIds.map(id => sql`${id}`).join(", ")})`)
					.returning();
				return updatedAppointments;
			});
		} catch (error) {
			console.error("Error bulk updating appointments:", error);
			throw new Error("Failed to bulk update appointments");
		}
	});

const cancelExistingAppointment = createServerFn({ method: "POST" })
	.validator(cancelAppointmentSchema)
	.handler(async ctx => {
		try {
			const { appointmentId, clinicId, reason } = ctx.data;
			return await db.transaction(async tx => {
				const [updatedAppointment] = await tx
					.update(schema.appointment)
					.set({
						status: "CANCELLED",
						reason,
						updatedAt: new Date()
					})
					.where(and(eq(schema.appointment.id, appointmentId), eq(schema.appointment.clinicId, clinicId)))
					.returning();
				if (!updatedAppointment) {
					throw new Error("Appointment not found or already cancelled");
				}
				return updatedAppointment;
			});
		} catch (error) {
			console.error("Error cancelling appointment:", error);
			throw new Error("Failed to cancel appointment");
		}
	});

// The original error was: Type '"PUT"' is not assignable to type 'Method | undefined'.
// Assuming 'Method' type from '@tanstack/react-start' only includes 'GET' and 'POST'
// or similar limited set. Changing to 'POST' to resolve the type error.
// Semantically, updates can often be handled by POST if PUT is not explicitly supported
// by the framework's server function abstraction.
// Also, `updateAppointmentSchema` was undefined, so it's defined above.
const updateExistingAppointment = createServerFn({ method: "POST" })
	.validator(updateAppointmentSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId, data } = ctx.data;
			return await db.transaction(async tx => {
				const [updatedAppointment] = await tx
					.update(schema.appointment)
					.set({
						...data,
						updatedAt: new Date()
					})
					.where(and(eq(schema.appointment.id, id), eq(schema.appointment.clinicId, clinicId)))
					.returning();
				if (!updatedAppointment) {
					throw new Error("Appointment not found or update failed");
				}
				return updatedAppointment;
			});
		} catch (error) {
			console.error("Error updating appointment:", error);
			throw new Error("Failed to update appointment");
		}
	});

const rescheduleExistingAppointment = createServerFn({ method: "POST" })
	.validator(rescheduleSchema)
	.handler(async ctx => {
		try {
			const { id, newDate, clinicId } = ctx.data;
			return await db.transaction(async tx => {
				const [updatedAppointment] = await tx
					.update(schema.appointment)
					.set({
						appointmentDate: newDate,
						updatedAt: new Date()
					})
					.where(and(eq(schema.appointment.id, id), eq(schema.appointment.clinicId, clinicId)))
					.returning();
				if (!updatedAppointment) {
					throw new Error("Appointment not found or reschedule failed");
				}
				return updatedAppointment;
			});
		} catch (error) {
			console.error("Error rescheduling appointment:", error);
			throw new Error("Failed to reschedule appointment");
		}
	});

// const getMonthlyAppointmentData = createServerFn({ method: "GET" })
// 	.validator(monthlyDataSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { clinicId } = ctx.data;
// 			return await db
// 				.select({
// 					month: sql<string>`to_char(${schema.appointment.appointmentDate}, 'Mon')`,
// 					appointments: sql<number>`count(*)::int`,
// 					monthOrder: sql<Date>`date_trunc('month', ${schema.appointment.appointmentDate})`
// 				})
// 				.from(schema.appointment)
// 				.where(
// 					and(
// 						eq(schema.appointment.clinicId, clinicId),
// 						sql`${schema.appointment.appointmentDate} >= date_trunc('year', CURRENT_DATE)`
// 					)
// 				)
// 				.groupBy(
// 					sql`date_trunc('month', ${schema.appointment.appointmentDate})`,
// 					sql`to_char(${schema.appointment.appointmentDate}, 'Mon')`
// 				)
// 				.orderBy(sql`date_trunc('month', ${schema.appointment.appointmentDate})`);
// 		} catch (error) {
// 			console.error("Error getting monthly appointment data:", error);
// 			throw new Error("Failed to get monthly appointment data");
// 		}
// 	});

const getUserRoleById = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await db.query.user.findFirst({
				where: { id: userId },
				columns: { role: true }
			});
		} catch (error) {
			console.error("Error getting user role:", error);
			throw new Error("Failed to get user role");
		}
	});

const getAdminOnboardedStatus = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const result = await db.query.configStore.findFirst({
			where: { key: "admin_onboarded" }
		});
		return result?.value === "true";
	} catch (error) {
		console.error("Error getting admin onboarded status:", error);
		throw new Error("Failed to get admin onboarded status");
	}
});

const setAdminOnboarded = createServerFn({ method: "POST" }).handler(async () => {
	try {
		await db
			.insert(schema.configStore)
			.values({
				key: "admin_onboarded",
				value: "true"
			})
			.onConflictDoNothing();
		return { success: true };
	} catch (error) {
		console.error("Error setting admin onboarded:", error);
		throw new Error("Failed to set admin onboarded");
	}
});

const upsertConfigStore = createServerFn({ method: "POST" })
	.validator(configValueSchema)
	.handler(async ctx => {
		try {
			const { key, value } = ctx.data;
			await db.insert(schema.configStore).values({ key, value }).onConflictDoUpdate({
				target: schema.configStore.key,
				set: { value }
			});
			return { success: true };
		} catch (error) {
			console.error("Error upserting config store:", error);
			throw new Error("Failed to upsert config store");
		}
	});

// const getDefaultClinic = createServerFn({ method: "GET" }).handler(async () => {
// 	try {
// 		return await db.query.clinic.findFirst({
// 			where: { name: "Default Clinic", isDeleted: false }
// 		});
// 	} catch (error) {
// 		console.error("Error getting default clinic:", error);
// 		throw new Error("Failed to get default clinic");
// 	}
// });

// const getClinicByName = createServerFn({ method: "GET" })
// 	.validator(clinicByNameSchema)
// 	.handler(async ctx => {
// 		try {
// 			const { name } = ctx.data;
// 			return await db.query.clinic.findFirst({
// 				where: { name, isDeleted: false }
// 			});
// 		} catch (error) {
// 			console.error("Error getting clinic by name:", error);
// 			throw new Error("Failed to get clinic by name");
// 		}
// 	});

const createClinicWithDetails = createServerFn({ method: "POST" })
	.validator(createClinicSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [newClinic] = await db
				.insert(schema.clinic)
				.values({
					id: data.id ?? crypto.randomUUID(),
					name: data.name,
					address: data.address,
					phone: data.phone,
					email: data.email,
					timezone: data.timezone || "Africa/Cairo",
					isDeleted: data.isDeleted || false,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();
			return newClinic;
		} catch (error) {
			console.error("Error creating clinic:", error);
			throw new Error("Failed to create clinic");
		}
	});

const getUserFiles = createServerFn({ method: "GET" })
	.validator(userIdSchema)
	.handler(async ctx => {
		try {
			const { userId } = ctx.data;
			return await db.query.file.findMany({
				where: { userId },
				columns: { id: true }
			});
		} catch (error) {
			console.error("Error getting user files:", error);
			throw new Error("Failed to get user files");
		}
	});

const createDoctorRecord = createServerFn({ method: "POST" })
	.validator(doctorRecordSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.doctor)
				.values({
					id: data.id,
					userId: data.userId,
					email: data.email,
					clinicId: data.clinicId,
					role: data.role,
					createdAt: new Date(),
					updatedAt: new Date(),
					name: data.name,
					specialty: "General"
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating doctor record:", error);
			throw new Error("Failed to create doctor record");
		}
	});

const createStaffRecord = createServerFn({ method: "POST" })
	.validator(staffRecordSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.staff)
				.values({
					id: data.id,
					userId: data.userId,
					email: data.email,
					clinicId: data.clinicId,
					role: data.role,
					createdAt: new Date(),
					updatedAt: new Date(),
					name: data.name,
					address: ""
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating staff record:", error);
			throw new Error("Failed to create staff record");
		}
	});

const createPatientRecord = createServerFn({ method: "POST" })
	.validator(patientRecordSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const [result] = await db
				.insert(schema.patient)
				.values({
					id: data.id,
					userId: data.userId,
					email: data.email,
					clinicId: data.clinicId,
					role: data.role,
					createdAt: new Date(),
					updatedAt: new Date(),
					firstName: data.firstName,
					lastName: data.lastName,
					dateOfBirth: new Date(0)
				})
				.returning();
			return result;
		} catch (error) {
			console.error("Error creating patient record:", error);
			throw new Error("Failed to create patient record");
		}
	});

// `updateUserSchema` was undefined, defining it here.
// It's used in `updateUserToAdmin` which takes `userId`, `clinicId`, and `name`.
const updateUserSchema = z.object({
	userId: z.uuid(),
	clinicId: z.uuid(),
	name: z.string().optional()
});
const updateUserToAdmin = createServerFn({ method: "POST" })
	.validator(updateUserSchema)
	.handler(async ctx => {
		try {
			const { userId, clinicId, name } = ctx.data;
			const [result] = await db
				.update(schema.user)
				.set({
					role: "admin",
					emailVerified: true,
					clinicId,
					...(name && { name }),
					updatedAt: new Date()
				})
				.where(eq(schema.user.id, userId))
				.returning();
			return result;
		} catch (error) {
			console.error("Error updating user to admin:", error);
			throw new Error("Failed to update user to admin");
		}
	});

export {
	bulkUpdateAppointmentsStatus,
	cancelExistingAppointment,
	createClinicWithDetails,
	createDoctorRecord,
	createPatientRecord,
	createStaffRecord,
	getAdminOnboardedStatus,
	// getAppointmentCountsByStatus,
	// getClinicByName,
	// getConfigValue,
	// getDefaultClinic,
	// getMonthlyAppointmentData,
	getUserFiles,
	getUserRoleById,
	rescheduleExistingAppointment,
	setAdminOnboarded,
	setDefaultClinic,
	updateExistingAppointment,
	updateUserToAdmin,
	upsertConfigStore
};
