// server/growth-record.server.ts
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  growthRecord,
  type DbGrowthRecord,
  type Gender
} from "@/db/schema";
import { GrowthRecordCreateSchema, GrowthRecordUpdateSchema } from "@/db/zod";
import { getSession } from "@/lib/auth.functions";

// Get growth records for a patient
export const getPatientGrowthRecords = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const results = await db.query.growthRecord.findMany({
      where: {
        patientId,
      },
      orderBy: { date: "desc" },
    });

    return results;
  });

// Get growth record by ID
export const getGrowthRecordById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const result = await db.query.growthRecord.findFirst({
      where: { id },
      with: {
        patient: true,
      },
    });

    if (!result) throw new Error("Growth record not found");
    return result;
  });

// Calculate Z-score using WHO standards
function calculateZScore(
  value: number,
  mValue: number,
  sValue: number,
  lValue: number
): number {
  if (lValue === 0) {
    return Math.log(value / mValue) / sValue;
  }
  return (Math.pow(value / mValue, lValue) - 1) / (lValue * sValue);
}

// Calculate percentile from Z-score
function calculatePercentile(zScore: number): number {
  // Standard normal CDF approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp((-zScore * zScore) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const percentile = zScore > 0 ? 1 - p : p;
  return Math.round(percentile * 100);
}

// Create a new growth record with automatic Z-score calculation
export const createGrowthRecord = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof GrowthRecordCreateSchema>) =>
    GrowthRecordCreateSchema.parse(data)
  )
  .handler(async ({ data }): Promise<DbGrowthRecord> => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Get patient data
    const patientData = await db.query.patient.findFirst({
      where: { id: data.patientId, isDeleted: false },
    });

    if (!patientData) throw new Error("Patient not found");

    // Calculate age in days and months
    const ageDays = Math.floor(
      (data.date.getTime() - patientData.dateOfBirth.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const ageMonths = Math.floor(ageDays / 30.44);

    // Calculate BMI if weight and height are provided
    let bmi: number | null = null;
    if (data.weight && data.height) {
      const heightInMeters = data.height / 100;
      bmi = Number((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    // Calculate Z-scores using WHO standards
    let weightForAgeZ: number | null = null;
    let heightForAgeZ: number | null = null;
    let bmiForAgeZ: number | null = null;
    let hcForAgeZ: number | null = null;
    let percentile: number | null = null;

    // Get WHO standards for weight
    if (data.weight) {
      const weightStandard = await db.query.whoGrowthStandard.findFirst({
        where: {
          ageDays: { gte: ageDays - 30, lte: ageDays + 30 },
          gender: patientData.gender as Gender,
          measurementType: "WEIGHT",
        },
        orderBy: { ageDays: "asc" },
      });

      if (weightStandard) {
        weightForAgeZ = calculateZScore(
          data.weight,
          weightStandard.mValue,
          weightStandard.sValue,
          weightStandard.lValue
        );
      }
    }

    // Get WHO standards for height
    if (data.height) {
      const heightStandard = await db.query.whoGrowthStandard.findFirst({
        where: {
          ageDays: { gte: ageDays - 30, lte: ageDays + 30 },
          gender: patientData.gender as Gender,
          measurementType: "HEIGHT",
        },
        orderBy: { ageDays: "asc" },
      });

      if (heightStandard) {
        heightForAgeZ = calculateZScore(
          data.height,
          heightStandard.mValue,
          heightStandard.sValue,
          heightStandard.lValue
        );
      }
    }

    // Get WHO standards for BMI
    if (bmi) {
      const bmiStandard = await db.query.whoGrowthStandard.findFirst({
        where: {
          ageDays: { gte: ageDays - 30, lte: ageDays + 30 },
          gender: patientData.gender as Gender,
          measurementType: "BMI",
        },
        orderBy: { ageDays: "asc" },
      });

      if (bmiStandard) {
        bmiForAgeZ = calculateZScore(
          bmi,
          bmiStandard.mValue,
          bmiStandard.sValue,
          bmiStandard.lValue
        );
      }
    }

    // Get WHO standards for head circumference
    if (data.headCircumference) {
      const hcStandard = await db.query.whoGrowthStandard.findFirst({
        where: {
          ageDays: { gte: ageDays - 30, lte: ageDays + 30 },
          gender: patientData.gender as Gender,
          measurementType: "HEAD_CIRCUMFERENCE",
        },
        orderBy: { ageDays: "asc" },
      });

      if (hcStandard) {
        hcForAgeZ = calculateZScore(
          data.headCircumference,
          hcStandard.mValue,
          hcStandard.sValue,
          hcStandard.lValue
        );
      }
    }

    // Use the first available Z-score to calculate percentile
    const zScore = weightForAgeZ || heightForAgeZ || bmiForAgeZ || hcForAgeZ;
    if (zScore) {
      percentile = calculatePercentile(zScore);
    }

    const [result] = await db
      .insert(growthRecord)
      .values({
        ...data,
        id: crypto.randomUUID(),
        bmi,
        ageDays,
        ageMonths,
        weightForAgeZ,
        heightForAgeZ,
        bmiForAgeZ,
        hcForAgeZ,
        percentile,
        gender: patientData.gender,
        recordedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result) throw new Error("Failed to create growth record");
    return result;
  });

// Update growth record
export const updateGrowthRecord = createServerFn({ method: "POST" })
  .validator(
    (data: z.infer<typeof GrowthRecordUpdateSchema> & { id: string }) =>
      GrowthRecordUpdateSchema.extend({ id: z.string() }).parse(data)
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { id, ...updateData } = data;

    // Get existing record and patient data for recalculation
    const existing = await db.query.growthRecord.findFirst({
      where: { id },
      with: { patient: true },
    });

    if (!existing) throw new Error("Growth record not found");

    const patientData = existing.patient;
    if (!patientData) throw new Error("Patient not found");

    const weight = updateData.weight ?? existing.weight;
    const height = updateData.height ?? existing.height;
    const date = updateData.date ?? existing.date;
    // const headCircumference = updateData.headCircumference ?? existing.headCircumference;

    // Recalculate age
    const ageDays = Math.floor(
      (date.getTime() - patientData.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
    );
    const ageMonths = Math.floor(ageDays / 30.44);

    // Recalculate BMI
    let bmi: number | null = null;
    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const [result] = await db
      .update(growthRecord)
      .set({
        ...updateData,
        bmi,
        ageDays,
        ageMonths,
        updatedAt: new Date(),
      })
      .where(eq(growthRecord.id, id))
      .returning();

    if (!result) throw new Error("Growth record not found");
    return result;
  });

// Delete growth record
export const deleteGrowthRecord = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const [result] = await db
      .delete(growthRecord)
      .where(eq(growthRecord.id, data.id))
      .returning();

    if (!result) throw new Error("Growth record not found");
    return { success: true };
  });

// Get growth chart data with percentiles
export const getGrowthChartData = createServerFn({ method: "GET" })
  .validator(
    (data: {
      patientId: string;
      measurementType: "WEIGHT" | "HEIGHT" | "BMI" | "HEAD_CIRCUMFERENCE";
    }) => data
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { patientId, measurementType } = data;

    const records = await db.query.growthRecord.findMany({
      where: { patientId },
      orderBy: { date: "asc" },
    });

    // Get WHO standards for percentiles
    const patientData = await db.query.patient.findFirst({
      where: { id: patientId, isDeleted: false },
    });

    if (!patientData) throw new Error("Patient not found");

    const chartData = await Promise.all(
      records.map(async (record) => {
        let value: number | null = null;
        let zScore: number | null = null;
        let percentile: number | null = null;

        switch (measurementType) {
          case "WEIGHT":
            value = record.weight;
            zScore = record.weightForAgeZ;
            break;
          case "HEIGHT":
            value = record.height;
            zScore = record.heightForAgeZ;
            break;
          case "BMI":
            value = record.bmi;
            zScore = record.bmiForAgeZ;
            break;
          case "HEAD_CIRCUMFERENCE":
            value = record.headCircumference;
            zScore = record.hcForAgeZ;
            break;
        }

        if (zScore) {
          percentile = calculatePercentile(zScore);
        }

        return {
          date: record.date,
          value,
          zScore,
          percentile,
          ageDays: record.ageDays,
          ageMonths: record.ageMonths,
        };
      })
    );

    return chartData;
  });

// Get growth velocity (rate of change)
export const getGrowthVelocity = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const records = await db.query.growthRecord.findMany({
      where: { patientId },
      orderBy: { date: "asc" },
    });

    if (records.length < 2) {
      return { velocity: [], message: "Insufficient data for velocity calculation" };
    }

    const velocity = [];
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];
      if (!prev || !curr) continue;

      const daysDiff = Math.ceil(
        (curr.date.getTime() - prev.date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 0) continue;

      velocity.push({
        period: { from: prev.date, to: curr.date, days: daysDiff },
        weightVelocity:
          prev.weight && curr.weight
            ? Number(((curr.weight - prev.weight) / (daysDiff / 30.44)).toFixed(2))
            : null,
        heightVelocity:
          prev.height && curr.height
            ? Number(((curr.height - prev.height) / (daysDiff / 30.44)).toFixed(2))
            : null,
        headVelocity:
          prev.headCircumference && curr.headCircumference
            ? Number(
                ((curr.headCircumference - prev.headCircumference) / (daysDiff / 30.44)).toFixed(2)
              )
            : null,
      });
    }

    return { patientId, velocity };
  });

// Get growth alerts based on Z-scores
export const getGrowthAlerts = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const latestRecord = await db.query.growthRecord.findFirst({
      where: { patientId },
      orderBy: { date: "desc" },
    });

    if (!latestRecord) return [];

    const alerts = [];

    // Weight alerts
    if (latestRecord.weightForAgeZ !== null) {
      if (latestRecord.weightForAgeZ < -2) {
        alerts.push({
          type: "WEIGHT",
          severity: "HIGH",
          message: "Underweight: Weight-for-age Z-score is below -2",
        });
      } else if (latestRecord.weightForAgeZ > 2) {
        alerts.push({
          type: "WEIGHT",
          severity: "MEDIUM",
          message: "Overweight: Weight-for-age Z-score is above 2",
        });
      }
    }

    // Height alerts
    if (latestRecord.heightForAgeZ !== null) {
      if (latestRecord.heightForAgeZ < -2) {
        alerts.push({
          type: "HEIGHT",
          severity: "HIGH",
          message: "Stunting: Height-for-age Z-score is below -2",
        });
      }
    }

    // BMI alerts
    if (latestRecord.bmiForAgeZ !== null) {
      if (latestRecord.bmiForAgeZ > 3) {
        alerts.push({
          type: "BMI",
          severity: "HIGH",
          message: "Obese: BMI-for-age Z-score is above 3",
        });
      } else if (latestRecord.bmiForAgeZ > 2) {
        alerts.push({
          type: "BMI",
          severity: "MEDIUM",
          message: "Overweight: BMI-for-age Z-score is above 2",
        });
      }
    }

    return alerts;
  });

// Get growth alerts for all patients in the clinic (dashboard-wide)
export const getClinicGrowthAlerts = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role === "patient") return [];

    const { db } = await import("@/db");
    const { and, eq, sql } = await import("drizzle-orm");
    const { growthRecord } = await import("@/db/schema");

    // Get user's clinic ID
    const userClinics = await db
      .select({ clinicId: sql`clinic_id` })
      .from(sql`users_to_clinic`)
      .where(eq(sql`user_id`, session.user.id))
      .limit(1);

    const clinicId = userClinics[0]?.clinicId;
    if (!clinicId) return [];

    const latestRecords = await db.query.growthRecord.findMany({
      where: {
        clinicId: clinicId as string
      },
      with: {
        patient: {
          columns: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { date: "desc" },
      limit: 50
    });

    const alerts = [];
    for (const record of latestRecords) {
      if (!record.patient) continue;
      const patientName = `${record.patient.firstName} ${record.patient.lastName}`;

      // Weight alerts
      if (record.weightForAgeZ !== null) {
        if (record.weightForAgeZ < -2) {
          alerts.push({
            patientName,
            type: "WEIGHT",
            severity: "HIGH",
            message: "Underweight: Weight-for-age Z-score is below -2",
          });
        } else if (record.weightForAgeZ > 2) {
          alerts.push({
            patientName,
            type: "WEIGHT",
            severity: "MEDIUM",
            message: "Overweight: Weight-for-age Z-score is above 2",
          });
        }
      }

      // Height alerts
      if (record.heightForAgeZ !== null) {
        if (record.heightForAgeZ < -2) {
          alerts.push({
            patientName,
            type: "HEIGHT",
            severity: "HIGH",
            message: "Stunting: Height-for-age Z-score is below -2",
          });
        }
      }

      // BMI alerts
      if (record.bmiForAgeZ !== null) {
        if (record.bmiForAgeZ > 3) {
          alerts.push({
            patientName,
            type: "BMI",
            severity: "HIGH",
            message: "Obese: BMI-for-age Z-score is above 3",
          });
        } else if (record.bmiForAgeZ > 2) {
          alerts.push({
            patientName,
            type: "BMI",
            severity: "MEDIUM",
            message: "Overweight: BMI-for-age Z-score is above 2",
          });
        }
      }
    }

    return alerts.slice(0, 5);
  }
);
