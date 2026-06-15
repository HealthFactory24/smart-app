// src/data/vital-signs.ts
import { db } from "@/db";
import { vitalSign, type DbVitalSign } from "@/db/schema";
import { getSession } from "@/lib/auth.functions";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const vitalSignSchema = z.object({
  patientId: z.string(),
  medicalId: z.string(),
  encounterId: z.string(),
  recordedAt: z.date().default(() => new Date()),
  bodyTemperature: z.number().optional(),
  systolic: z.number().optional(),
  diastolic: z.number().optional(),
  heartRate: z.number().optional(),
  respiratoryRate: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  notes: z.string().optional(),
});

export type VitalSignInput = z.infer<typeof vitalSignSchema>;

// Get vital signs for a patient
export const getPatientVitalSigns = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const results = await db.query.vitalSign.findMany({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
    });

    return results;
  });

// Get vital signs for an encounter
export const getEncounterVitalSigns = createServerFn({ method: "GET" })
  .validator((encounterId: string) => encounterId)
  .handler(async ({ data: encounterId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const results = await db.query.vitalSign.findMany({
      where: { encounterId },
      orderBy: { recordedAt: "desc" },
    });

    return results;
  });

// Create vital signs
export const createVitalSign = createServerFn({ method: "POST" })
  .validator((data: VitalSignInput) => vitalSignSchema.parse(data))
  .handler(async ({ data }): Promise<DbVitalSign> => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Get clinic ID from patient
    const patientData = await db.query.patient.findFirst({
      where: { id: data.patientId, isDeleted: false },
    });

    if (!patientData) throw new Error("Patient not found");

    // Calculate age in days and months
    const ageDays = Math.floor(
      (data.recordedAt.getTime() - patientData.dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const ageMonths = Math.floor(ageDays / 30.44);

    // Calculate BMI if weight and height are provided
    let bmi: number | null = null;
    if (data.weight && data.height) {
      const heightInMeters = data.height / 100;
      bmi = Number((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const [result] = await db
      .insert(vitalSign)
      .values({
        id: crypto.randomUUID(),
        clinicId: patientData.clinicId,
        ...data,
        bmi,
        ageDays,
        ageMonths,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result) throw new Error("Failed to create vital signs");
    return result;
  });

// Update vital signs
export const updateVitalSign = createServerFn({ method: "POST" })
  .validator((data: Partial<VitalSignInput> & { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { id, ...updateData } = data;

    const [result] = await db
      .update(vitalSign)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(vitalSign.id, id))
      .returning();

    if (!result) throw new Error("Vital sign record not found");
    return result;
  });

// Delete vital signs
export const deleteVitalSign = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const [result] = await db
      .delete(vitalSign)
      .where(eq(vitalSign.id, data.id))
      .returning();

    if (!result) throw new Error("Vital sign record not found");
    return { success: true };
  });

// Get vital signs trends
export const getVitalSignsTrends = createServerFn({ method: "GET" })
  .validator((data: { patientId: string; days?: number }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { patientId, days = 90 } = data;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db.query.vitalSign.findMany({
      where: {
        patientId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: "asc" },
    });

    return results;
  });
