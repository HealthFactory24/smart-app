import { getSession } from "#/lib/auth.functions";
import { patient, type DbPatient, type Status } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { PatientCreateSchema, PatientUpdateSchema, type PatientCreateInput } from '../db/zod';

// // Schema for creating/updating patients
// export const patientSchema = z.object({
// 	firstName: z.string().min(1, "First name is required"),
// 	lastName: z.string().min(1, "Last name is required"),
// 	dateOfBirth: z.coerce.date(),
// 	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
// 	email: z.string().email().optional().nullable(),
// 	phone: z.string().optional().nullable(),
// 	address: z.string().optional().nullable(),
// 	bloodGroup: z
// 		.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE"])
// 		.optional()
// 		.nullable(),
// 	allergies: z.string().optional().nullable(),
// 	medicalConditions: z.string().optional().nullable(),
// 	medicalHistory: z.string().optional().nullable(),
// 	emergencyContactName: z.string().optional().nullable(),
// 	emergencyContactNumber: z.string().optional().nullable(),
// 	guardianId: z.string().optional().nullable(),
// });

// Get all patients for the current clinic
export const getAllPatients = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");

		try {
			// Get user's clinic ID from clinic_member or from user's default clinic
			const userClinics = await db
				.select({ clinicId: sql`clinic_id` })
				.from(sql`users_to_clinic`)
				.where(eq(sql`user_id`, session.user.id))
				.limit(1);

			const clinicId = userClinics[0]?.clinicId;

			if (!clinicId) {
				return [];
			}

			const allPatients = await db.query.patient.findMany({
        where: {
          clinicId,
          isDeleted: false
        },
        orderBy: {createdAt: "desc"}
      })
			return allPatients;
		} catch (error) {
			console.error("Error getting all patients: ", error);
			return [];
		}
	},
);

// Get recent patients for dashboard
export const getRecentPatients = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		try {
			// Get user's clinic ID
			const userClinics = await db
				.select({ clinicId: sql`clinic_id` })
				.from(sql`users_to_clinic`)
				.where(eq(sql`user_id`, session.user.id))
				.limit(1);

			const clinicId = userClinics[0]?.clinicId;
			if (!clinicId) return [];

			// For patients, only show their own children
			const conditions = [
				eq(patient.clinicId, clinicId as string),
				eq(patient.isDeleted, false)
			];

			if (session.user.role === "patient") {
				conditions.push(eq(patient.userId, session.user.id));
			}

			return await db.query.patient.findMany({
				where: {
					clinicId,
					isDeleted: false,
					role: 'patient'
				},
				orderBy: { createdAt: "desc" },
				limit: 5,
			});
		} catch (error) {
			console.error("Error getting recent patients: ", error);
			return [];
		}
	},
);

// Get patients for the logged-in parent (my children)
export const getMyChildren = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");

		try {
			const myPatients = await db
				.select()
				.from(patient)
				.where(eq(patient.userId, session.user.id))
				.orderBy(desc(patient.createdAt));

			return myPatients;
		} catch (error) {
			console.error("Error getting my patients: ", error);
			return [];
		}
	},
);

// Get patient by ID with authorization check
export const getPatientById = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");
		const patientId = z.string().parse(data);

		const result = await db
			.select()
			.from(patient)
			.where(eq(patient.id, patientId))
			.limit(1);

		const foundPatient = result[0] ?? null;

		if (!foundPatient) return null;

		// Check authorization: admin or parent or staff can view
		const isAdmin = session.user.role === "admin";
		const isParent = foundPatient.userId === session.user.id;

		// Check if user is staff at this clinic
		const userClinic = await db
			.select()
			.from(sql`users_to_clinic`)
			.where(
				and(
					eq(sql`user_id`, session.user.id),
					eq(sql`clinic_id`, foundPatient.clinicId)
				)
			)
			.limit(1);

		const isStaff = userClinic.length > 0;

		if (!isAdmin && !isParent && !isStaff) {
			throw new Error("Forbidden");
		}

		return foundPatient;
	});

// Create a new patient (child)
export const createPatient = createServerFn({ method: "POST" })
	.validator((data: PatientCreateInput) =>
		PatientCreateSchema.parse(data),
	)
	.handler(async ({ data }): Promise<DbPatient> => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");

		// Get user's clinic ID
		const userClinics = await db
			.select({ clinicId: sql`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinics[0]?.clinicId;

		if (!clinicId) {
			throw new Error("No clinic assigned to this user");
		}

		// Generate MRN (Medical Record Number)
		const mrn = `MRN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

		const result = await db
			.insert(patient)
			.values({
				mrn,
				status: "ACTIVE" as Status,
				isActive: true,
				createdById: session.user.id,
				updatedById: session.user.id,
				...data,
			} as any)
			.returning();

		const newPatient = result[0];
		if (!newPatient) {
			throw new Error("Failed to create patient");
		}

		return newPatient;
	});

// Update patient information
const updatePatientSchema = PatientUpdateSchema.extend({
	id: z.string().min(1, "Patient ID is required"),
});

export const updatePatient = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof updatePatientSchema>) =>
		updatePatientSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { id, ...values } = data;

		// Verify patient exists and user has permission
		const existingPatient = await db
			.select()
			.from(patient)
			.where(eq(patient.id, id))
			.limit(1);

		if (!existingPatient[0]) throw new Error("Patient not found");

		const isAdmin = session.user.role === "admin";
		const isParent = existingPatient[0].userId === session.user.id;

		if (!isAdmin && !isParent) {
			throw new Error("Forbidden");
		}

		const updateData: Record<string, unknown> = {
			updatedById: session.user.id,
			updatedAt: new Date(),
		};

		if (values.firstName !== undefined) updateData.firstName = values.firstName;
		if (values.lastName !== undefined) updateData.lastName = values.lastName;
		if (values.dateOfBirth !== undefined) updateData.dateOfBirth = values.dateOfBirth;
		if (values.gender !== undefined) updateData.gender = values.gender;
		if (values.email !== undefined) updateData.email = values.email;
		if (values.phone !== undefined) updateData.phone = values.phone;
		if (values.address !== undefined) updateData.address = values.address;
		if (values.bloodGroup !== undefined) updateData.bloodGroup = values.bloodGroup;
		if (values.allergies !== undefined) updateData.allergies = values.allergies;
		if (values.medicalConditions !== undefined) updateData.medicalConditions = values.medicalConditions;
		if (values.medicalHistory !== undefined) updateData.medicalHistory = values.medicalHistory;
		if (values.emergencyContactName !== undefined) updateData.emergencyContactName = values.emergencyContactName;
		if (values.emergencyContactNumber !== undefined) updateData.emergencyContactNumber = values.emergencyContactNumber;

		const result = await db
			.update(patient)
			.set(updateData)
			.where(eq(patient.id, id))
			.returning();

		const updatedPatient = result[0];
		if (!updatedPatient) throw new Error("Patient not found after update");

		return updatedPatient;
	});

// Delete patient (soft delete)
export const deletePatient = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		await db
			.update(patient)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				isActive: false,
			})
			.where(eq(patient.id, data.id));
	});

// Search patients
export const searchPatients = createServerFn({ method: "POST" })
	.validator((data: { searchTerm: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { searchTerm } = data;

		const results = await db
			.select()
			.from(patient)
			.where(
				and(
					sql`${patient.isDeleted} = false`,
					sql`(${patient.firstName} ILIKE ${`%${searchTerm}%`} OR ${patient.lastName} ILIKE ${`%${searchTerm}%`} OR ${patient.mrn} ILIKE ${`%${searchTerm}%`})`
				)
			)
			.limit(20);

		return results;
	});
