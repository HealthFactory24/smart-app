// lib/diagnosis.functions.ts
import { diagnosis, type Status } from "@/db/schema";
import { getSession } from "@/lib/auth.functions";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const DiagnosisCreateSchema = z.object({
	patientId: z.string(),
	doctorId: z.string(),
	medicalId: z.string(),
	appointmentId: z.string().optional(),
	type: z.string().optional(),
	diagnosis: z.string().optional(),
	treatment: z.string().optional(),
	notes: z.string().optional(),
	symptoms: z.string(),
	prescribedMedications: z.string().optional(),
	followUpPlan: z.string().optional(),
});

const DiagnosisUpdateSchema = DiagnosisCreateSchema.partial();

// Get encounters for a patient
export const getPatientEncounters = createServerFn({ method: "GET" })
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

		const encounters = await db.query.diagnosis.findMany({
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
				medical: {
					columns: { id: true, createdAt: true },
				},
				prescriptions: {
					limit: 5,
					orderBy: { issuedDate: "desc" },
				},
				labTest: {
					limit: 5,
					orderBy: { testDate: "desc" },
				},
				vitalSigns: {
					limit: 1,
					orderBy: { recordedAt: "desc" },
				},
			},
			orderBy: { date: "desc" },
			limit,
			offset,
		});

		const total = await db.$count(
			diagnosis,
			and(
				eq(diagnosis.patientId, patientId),
				eq(diagnosis.clinicId, clinicId || ""),
				eq(diagnosis.isDeleted, false)
			)
		);

		return { encounters, total, limit, offset };
	});

// Get encounter by ID
export const getEncounterById = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const encounterId = z.string().parse(data);

		const encounter = await db.query.diagnosis.findFirst({
			where: { id: encounterId, isDeleted: false },
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true, dateOfBirth: true, userId: true },
				},
				doctor: {
					columns: { id: true, name: true, specialty: true },
				},
				appointment: true,
				medical: true,
				prescriptions: {
					with: {
						prescribedItems: {
							with: {
								drug: true,
							},
						},
					},
				},
				labTest: {
					with: {
						service: true,
					},
				},
				vitalSigns: true,
			},
		});

		if (!encounter) throw new Error("Encounter not found");

		// Check authorization
		const isAdmin = session.user.role === "admin";
		const isDoctor = session.user.role === "doctor";
		const isStaff = session.user.role === "staff";

		if (!isAdmin && !isDoctor && !isStaff && encounter.patient?.userId !== session.user.id) {
			throw new Error("Forbidden");
		}

		return encounter;
	});

// Create encounter (diagnosis)
export const createEncounter = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof DiagnosisCreateSchema>) => DiagnosisCreateSchema.parse(data))
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

		const [newEncounter] = await db
			.insert(diagnosis)
			.values({
				id: crypto.randomUUID(),
				clinicId: clinicId as string,
				...data,
				status: "ACTIVE" as Status,
				date: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newEncounter) throw new Error("Failed to create encounter");
		return newEncounter;
	});

// Update encounter
export const updateEncounter = createServerFn({ method: "POST" })
	.validator((data: { id: string; values: z.infer<typeof DiagnosisUpdateSchema> }) =>
		z.object({ id: z.string(), values: DiagnosisUpdateSchema }).parse(data)
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { id, values } = data;

		const [updated] = await db
			.update(diagnosis)
			.set({
				...values,
				updatedAt: new Date(),
			})
			.where(eq(diagnosis.id, id))
			.returning();

		if (!updated) throw new Error("Encounter not found");
		return updated;
	});

// Complete encounter (set status to COMPLETED)
export const completeEncounter = createServerFn({ method: "POST" })
	.validator((data: { id: string; notes?: string; followUpPlan?: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { id, notes, followUpPlan } = data;

		const [completed] = await db
			.update(diagnosis)
			.set({
				status: "COMPLETED" as Status,
				notes: notes || undefined,
				followUpPlan: followUpPlan || undefined,
				updatedAt: new Date(),
			})
			.where(eq(diagnosis.id, id))
			.returning();

		if (!completed) throw new Error("Encounter not found");
		return completed;
	});

// Delete encounter (soft delete)
export const deleteEncounter = createServerFn({ method: "POST" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden - Admin only");

		const { db } = await import("@/db");
		const encounterId = z.string().parse(data);

		const [deleted] = await db
			.update(diagnosis)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
			})
			.where(eq(diagnosis.id, encounterId))
			.returning();

		if (!deleted) throw new Error("Encounter not found");
		return { success: true };
	});

// Get encounters by date range
export const getEncountersByDateRange = createServerFn({ method: "POST" })
	.validator((data: { startDate: Date; endDate: Date; doctorId?: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { startDate, endDate, doctorId } = data;

		// Get user's clinic
		const userClinic = await db
			.select({ clinicId: sql<string>`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinic[0]?.clinicId;

		const encounters = await db.query.diagnosis.findMany({
			where: {
				clinicId: clinicId ?? "",
				isDeleted: false,
				date: { gte: startDate, lte: endDate },
				...(doctorId ? { doctorId } : {}),
			},
			with: {
				patient: {
					columns: { id: true, firstName: true, lastName: true },
				},
				doctor: {
					columns: { id: true, name: true },
				},
			},
			orderBy: { date: "desc" },
		});

		return encounters;
	});


// Add to src/data/diagnosis.ts
// Get all encounters for the clinic (admin/staff)
export const getAllEncounters = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role === "patient") throw new Error("Forbidden");

  const { db } = await import("@/db");

  // Get user's clinic
  const userClinic = await db
    .select({ clinicId: sql<string>`clinic_id` })
    .from(sql`users_to_clinic`)
    .where(eq(sql`user_id`, session.user.id))
    .limit(1);

  const clinicId = userClinic[0]?.clinicId;

  const encounters = await db.query.diagnosis.findMany({
    where: {
      clinicId: clinicId ?? "",
      isDeleted: false,
    },
    with: {
      patient: {
        columns: { id: true, firstName: true, lastName: true },
      },
      doctor: {
        columns: { id: true, name: true, specialty: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return encounters.map(encounter => ({
    id: encounter.id,
    patientId: encounter.patientId,
    patientFirstName: encounter.patient?.firstName,
    patientLastName: encounter.patient?.lastName,
    doctorId: encounter.doctorId,
    doctorName: encounter.doctor?.name,
    date: encounter.date,
    diagnosis: encounter.diagnosis,
    status: encounter.status,
    type: encounter.type,
  }));
});

export const getRecentEncounters = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role === "patient") throw new Error("Forbidden");

  const { db } = await import("@/db");

  // Get user's clinic
  const userClinic = await db
    .select({ clinicId: sql<string>`clinic_id` })
    .from(sql`users_to_clinic`)
    .where(eq(sql`user_id`, session.user.id))
    .limit(1);

  const clinicId = userClinic[0]?.clinicId;

  const encounters = await db.query.diagnosis.findMany({
    where: {
      clinicId: clinicId ?? "",
      isDeleted: false,
    },
    with: {
      patient: {
        columns: { id: true, firstName: true, lastName: true },
      },
      doctor: {
        columns: { id: true, name: true, specialty: true },
      },
    },
    orderBy: { date: "desc" },
    limit: 10,
  });

  return encounters.map(encounter => ({
    id: encounter.id,
    patientId: encounter.patientId,
    patientFirstName: encounter.patient?.firstName,
    patientLastName: encounter.patient?.lastName,
    doctorId: encounter.doctorId,
    doctorName: encounter.doctor?.name,
    date: encounter.date,
    diagnosis: encounter.diagnosis,
    status: encounter.status,
    type: encounter.type,
  }));
});
