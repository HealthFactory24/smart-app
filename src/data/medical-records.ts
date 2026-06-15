// lib/medical-record.functions.ts
import {
  medicalRecord,
  type Status
} from "@/db/schema";
import { getSession } from "@/lib/auth.functions";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { generateId } from '../utils';

const MedicalRecordCreateSchema = z.object({
	patientId: z.string(),
	appointmentId: z.string(),
	doctorId: z.string(),
	diagnosis: z.string().optional(),
	symptoms: z.string().optional(),
	treatmentPlan: z.string().optional(),
	labRequest: z.string().optional(),
	notes: z.string().optional(),
	medications: z.string().optional(),
	followUpDate: z.date().optional(),
});

const MedicalRecordUpdateSchema = MedicalRecordCreateSchema.partial();

// Get medical records for a patient
export const getPatientMedicalRecords = createServerFn({ method: "GET" })
	.validator((data: { patientId: string; limit?: number; offset?: number }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { patientId, limit = 20, offset = 0 } = data;

		// Get user's clinic
		const userClinic = await db
			.select({ clinicId: sql<string>`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinic[0]?.clinicId;

		const records = await db.query.medicalRecord.findMany({
			where: {
				patientId,
				clinicId: clinicId ?? "",
				isDeleted: false,
			},
			with: {
				doctor: {
					columns: { id: true, name: true, specialty: true },
				},
				appointment: {
					columns: { id: true, appointmentDate: true, type: true },
				},
				encounters: {
					limit: 5,
					orderBy: { date: "desc" },
				},
				vitalSigns: {
					limit: 5,
					orderBy: { recordedAt: "desc" },
				},
				prescriptions: {
					limit: 5,
					orderBy: { issuedDate: "desc" },
				},
			},
			orderBy: { createdAt: "desc" },
			limit,
			offset,
		});

		const total = await db.$count(
			medicalRecord,
			and(
				eq(medicalRecord.patientId, patientId),
				eq(medicalRecord.clinicId, clinicId ?? ""),
				eq(medicalRecord.isDeleted, false)
			)
		);

		return { records, total, limit, offset };
	});

// Get medical record by ID
export const getMedicalRecordById = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const recordId = z.string().parse(data);

		const record = await db.query.medicalRecord.findFirst({
			where: { id: recordId, isDeleted: false },
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true, dateOfBirth: true, mrn: true , userId: true},
				},
				doctor: {
					columns: { id: true, name: true, specialty: true },
				},
				appointment: true,
				encounters: {
					orderBy: { date: "desc" },
				},
				vitalSigns: {
					orderBy: { recordedAt: "desc" },
				},
				prescriptions: {
					with: {
						prescribedItems: {
							with: {
								drug: true,
							},
						},
					},
					orderBy: { issuedDate: "desc" },
				},
			},
		});

		if (!record) throw new Error("Medical record not found");

		// Check authorization
		const isAdmin = session.user.role === "admin";
		const isDoctor = session.user.role === "doctor";
		const isStaff = session.user.role === "staff";

		if (!isAdmin && !isDoctor && !isStaff && record.patient?.userId !== session.user.id) {
			throw new Error("Forbidden");
		}

		return record;
	});

// Create medical record
export const createMedicalRecord = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof MedicalRecordCreateSchema>) => MedicalRecordCreateSchema.parse(data))
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		// Get user's clinic
		const userClinic = await db
			.select({ clinicId: sql<string>`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinic[0]?.clinicId;
		if (!clinicId) throw new Error("No clinic assigned");

		const [newRecord] = await db
			.insert(medicalRecord)
			.values({
				id: generateId(),
				clinicId: clinicId as string,
				...data,
				status: "ACTIVE" as Status,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newRecord) throw new Error("Failed to create medical record");
		return newRecord;
	});

// Update medical record
export const updateMedicalRecord = createServerFn({ method: "POST" })
	.validator((data: { id: string; values: z.infer<typeof MedicalRecordUpdateSchema> }) =>
		z.object({ id: z.string(), values: MedicalRecordUpdateSchema }).parse(data)
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { id, values } = data;

		const [updated] = await db
			.update(medicalRecord)
			.set({
				...values,
				updatedAt: new Date(),
			})
			.where(eq(medicalRecord.id, id))
			.returning();

		if (!updated) throw new Error("Medical record not found");
		return updated;
	});

// Delete (soft delete) medical record
export const deleteMedicalRecord = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden - Admin only");

		const { db } = await import("@/db");
		const recordId = z.string().parse(data);

		const [deleted] = await db
			.update(medicalRecord)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
			})
			.where(eq(medicalRecord.id, recordId))
			.returning();

		if (!deleted) throw new Error("Medical record not found");
		return { success: true };
	});
