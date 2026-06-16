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
          patient: { columns: { id: true, firstName: true, lastName: true, dateOfBirth: true, mrn: true, userId: true } },
          doctor: { columns: { id: true, name: true, specialty: true } },
          appointment: true,
          labTests: { limit: 5, orderBy: { testDate: "desc" }, with: { service: true } }, // Limit lab tests
          encounters: { limit: 5, orderBy: { date: "desc" } }, // Limit encounters
          vitalSigns: { limit: 1, orderBy: { recordedAt: "desc" } } // Only latest vitals
        }
      });

      if (!record) throw new Error("Medical record not found");

      // Lazy load prescriptions only when needed (separate query)
      // This prevents the expensive nested join for every request
      if (session.user.role !== "patient") {
        const prescriptions = await db.query.prescription.findMany({
          where: { medicalRecordId: recordId },
          with: {
            prescribedItems: {
              limit: 10,
              with: { drug: true }
            }
          },
          orderBy: { issuedDate: "desc" },
          limit: 5
        });

        return { ...record, prescriptions };
      }

      // For patients, exclude sensitive prescription details
      const prescriptions = await db.query.prescription.findMany({
        where: { medicalRecordId: recordId },
        columns: { id: true, medicationName: true, issuedDate: true, status: true , diagnosis:true, },
        orderBy: { issuedDate: "desc" },
        limit: 5
      });

      return { ...record, prescriptions };
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
// Add to existing data/medical-records.ts

// Get all medical records for clinic (admin/staff)
export const getAllMedicalRecords = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role === "patient") throw new Error("Forbidden");

  const { db } = await import("@/db");

  // Get user's clinic ID
  const userClinics = await db
    .select({ clinicId: sql`clinic_id` })
    .from(sql`users_to_clinic`)
    .where(eq(sql`user_id`, session.user.id))
    .limit(1);

  const clinicId = userClinics[0]?.clinicId;

  const records = await db.query.medicalRecord.findMany({
    where: {
      clinicId: clinicId ?? "",
      isDeleted: false,
    },
    with: {
      patient: {
        columns: { id: true, firstName: true, lastName: true, dateOfBirth: true, mrn: true },
      },
      doctor: {
        columns: { id: true, name: true, specialty: true },
      },
      appointment: {
        columns: { id: true, appointmentDate: true, type: true },
      },
      vitalSigns: {
        limit: 1,
        orderBy: { recordedAt: "desc" },
      },
      prescriptions: {
        limit: 3,
        orderBy: { issuedDate: "desc" },
        with: {
          prescribedItems: {
            with: { drug: true },
          },
        },
      },
      labTests: {
        limit: 3,
        orderBy: { testDate: "desc" },
        with: { service: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return records;
});

// Get recent medical records for dashboard
export const getRecentMedicalRecords = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const { db } = await import("@/db");

  const userClinics = await db
    .select({ clinicId: sql`clinic_id` })
    .from(sql`users_to_clinic`)
    .where(eq(sql`user_id`, session.user.id))
    .limit(1);

  const clinicId = userClinics[0]?.clinicId;

  const records = await db.query.medicalRecord.findMany({
    where: {
      clinicId: clinicId ?? "",
      isDeleted: false,
    },
    with: {
      patient: {
        columns: { id: true, firstName: true, lastName: true },
      },
      doctor: {
        columns: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    limit: 5,
  });

  return records;
});
