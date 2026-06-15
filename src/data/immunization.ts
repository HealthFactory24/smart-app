// server/immunization.server.ts
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  immunization,
  medicalRecord,
  vaccineInventory,
  type DbImmunization
} from "@/db/schema";
import { ImmunizationCreateSchema, ImmunizationUpdateSchema } from "@/db/zod";
import { getSession } from "@/lib/auth.functions";
import { generateId } from '../utils';

// Get all immunizations for a patient
export const getPatientImmunizations = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const results = await db.query.immunization.findMany({
      where: {
        patientId,
        isDeleted: false,
      },
      with: {
        administeredBy: true,
        medicalRecord: true,
      },
      orderBy: { date: "desc" },
    });

    return results;
  });

// Get upcoming immunizations based on vaccine schedule
export const getUpcomingImmunizations = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Get patient age
    const patientData = await db.query.patient.findFirst({
      where: { id: patientId, isDeleted: false },
    });

    if (!patientData) throw new Error("Patient not found");

    const ageInDays = Math.floor(
      (Date.now() - new Date(patientData.dateOfBirth).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Get all vaccine schedules
    const schedules = await db.query.vaccineSchedule.findMany({
      where: {
        isDeleted: false,
        ageInDaysMin: { lte: ageInDays },
        ageInDaysMax: { gte: ageInDays },
      },
    });

    // Get already administered vaccines
    const administered = await db.query.immunization.findMany({
      where: {
        patientId,
        isDeleted: false,
        status: "COMPLETED",
      },
    });

    const administeredVaccines = new Set(administered.map((i) => i.vaccine));

    const upcoming = schedules.filter((s) => !administeredVaccines.has(s.vaccineName));

    return upcoming;
  });

// Record a new immunization
export const recordImmunization = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof ImmunizationCreateSchema>) =>
    ImmunizationCreateSchema.parse(data)
  )
  .handler(async ({ data }): Promise<DbImmunization> => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Check if vaccine is in stock
    if (data.vaccineInventoryId) {
      const inventory = await db.query.vaccineInventory.findFirst({
        where: { id: data.vaccineInventoryId },
      });

      if (!inventory || inventory.quantity < 1) {
        throw new Error("Insufficient vaccine stock");
      }

      // Decrement inventory
      await db
        .update(vaccineInventory)
        .set({
          quantity: inventory.quantity - 1,
          updatedAt: new Date(),
        })
        .where(eq(vaccineInventory.id, data.vaccineInventoryId));
    }

    // Create medical record if not exists
    let medicalRecordId = data.recordId;
    if (!medicalRecordId) {
      const [newMedicalRecord] = await db
        .insert(medicalRecord)
        .values({
          id: generateId(),
          patientId: data.patientId,
          doctorId: data.administeredByStaffId || session.user.id,
          clinicId: data.clinicId as string,
          symptoms: "Immunization visit",
          treatmentPlan: `Administered ${data.vaccine}`,
          notes: `Immunization: ${data.vaccine}` as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      medicalRecordId = newMedicalRecord.id;
    }

    // Check if vaccine is overdue
    const patientData = await db.query.patient.findFirst({
      where: { id: data.patientId },
    });

    let isOverdue = false;
    if (patientData) {
      const ageAtVaccination = Math.floor(
        (data.date.getTime() - patientData.dateOfBirth.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const schedule = await db.query.vaccineSchedule.findFirst({
        where: { vaccineName: data.vaccine },
      });

      if (schedule?.ageInDaysMax && ageAtVaccination > schedule.ageInDaysMax) {
        isOverdue = true;
      }
    }

    const [result] = await db
      .insert(immunization)
      .values({
        ...data,
        id: crypto.randomUUID(),
        clinicId: data.clinicId as string,
        recordId: medicalRecordId as string,
        isOverDue: isOverdue,
        status: "COMPLETED",
        createdAt: new Date(),
      })
      .returning();

    if (!result) throw new Error("Failed to record immunization");

    return result;
  });

// Update immunization record
export const updateImmunization = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof ImmunizationUpdateSchema> & { id: string }) =>
    ImmunizationUpdateSchema.extend({ id: z.string() }).parse(data)
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin" && session.user.role !== "doctor") {
      throw new Error("Forbidden");
    }

    const { id, ...updateData } = data;

    const [result] = await db
      .update(immunization)
      .set({
        ...updateData,
       })
      .where(eq(immunization.id, id))
      .returning();

    if (!result) throw new Error("Immunization not found");
    return result;
  });

// Delete immunization (soft delete)
export const deleteImmunization = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin") throw new Error("Forbidden");

    const [result] = await db
      .update(immunization)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(immunization.id, data.id))
      .returning();

    if (!result) throw new Error("Immunization not found");
    return { success: true };
  });

// Get immunization schedule by age
export const getImmunizationScheduleByAge = createServerFn({ method: "GET" })
  .validator((data: { ageInDays: number }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const schedules = await db.query.vaccineSchedule.findMany({
      where: {
        isDeleted: false,
        ageInDaysMin: { lte: data.ageInDays },
        ageInDaysMax: { gte: data.ageInDays },
      },
      orderBy: { ageInDaysMin: "asc" },
    });

    return schedules;
  });

// Get immunization certificate for a patient
export const getImmunizationCertificate = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const patientData = await db.query.patient.findFirst({
      where: { id: patientId, isDeleted: false },
    });

    if (!patientData) throw new Error("Patient not found");

    const immunizations = await db.query.immunization.findMany({
      where: {
        patientId,
        isDeleted: false,
        status: "COMPLETED",
      },
      orderBy: { date: "asc" },
    });

    const isFullyImmunized = immunizations.length >= 10; // Threshold

    return {
      patientName: `${patientData.firstName} ${patientData.lastName}`,
      dateOfBirth: patientData.dateOfBirth,
      mrn: patientData.mrn,
      immunizations: immunizations.map((imm) => ({
        vaccine: imm.vaccine,
        date: imm.date,
        dose: imm.dose,
        administeredBy: imm.administeredByStaffId,
        lotNumber: imm.lotNumber,
      })),
      isFullyImmunized,
      certificateNumber: `IMM-${Date.now()}-${patientId.slice(0, 8)}`,
      generatedDate: new Date(),
    };
  });

// Get due immunizations for the clinic (admin/staff)
export const getDueImmunizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role === "patient") throw new Error("Forbidden");

    // Get user's clinic ID
    const userClinics = await db
      .select({ clinicId: sql`clinic_id` })
      .from(sql`users_to_clinic`)
      .where(eq(sql`user_id`, session.user.id))
      .limit(1);

    const clinicId = userClinics[0]?.clinicId;
    if (!clinicId) return [];

    // Find immunizations that are marked as overdue or pending in the future
    const results = await db.query.immunization.findMany({
      where: {clinicId, isDeleted: false, isOverDue: true},
      with: {
        patient: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            phone: true
          }
        }
      },
      orderBy: { date: "asc" },
      limit: 50
    });

    return results;
  }
);
