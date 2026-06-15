// server/payment.server.ts
import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  appointment,
  payment,
  type DbPayment,
  type PaymentMethod,
  type PaymentStatus
} from "@/db/schema";
import { PaymentCreateSchema } from "@/db/zod";
import { getSession } from "@/lib/auth.functions";

// Get payments for a patient
export const getPatientPayments = createServerFn({ method: "GET" })
  .validator((patientId: string) => patientId)
  .handler(async ({ data: patientId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const results = await db.query.payment.findMany({
      where: {
        patientId,
        isDeleted: false,
      },
      with: {
        appointment: {
          with: {
            doctor: true,
            service: true,
          },
        },
        bills: {
          with: {
            service: true,
          },
        },
      },
      orderBy: { billDate: "desc" },
    });

    return results;
  });

// Get payment by ID
export const getPaymentById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const result = await db.query.payment.findFirst({
      where: { id, isDeleted: false },
      with: {
        patient: true,
        appointment: {
          with: {
            doctor: true,
            service: true,
          },
        },
        bills: {
          with: {
            service: true,
          },
        },
      },
    });

    if (!result) throw new Error("Payment not found");
    return result;
  });

// Create a new payment
export const createPayment = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof PaymentCreateSchema>) =>
    PaymentCreateSchema.parse(data)
  )
  .handler(async ({ data }): Promise<DbPayment> => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Verify appointment exists if provided
    if (data.appointmentId) {
      const appointmentData = await db.query.appointment.findFirst({
        where: { id: data.appointmentId, isDeleted: false },
      });
      if (!appointmentData) throw new Error("Appointment not found");
    }

    const receiptNumber = Math.floor(Math.random() * 1000000);

    const [result] = await db
      .insert(payment)
      .values({
        ...data,
        id: crypto.randomUUID(),
        receiptNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result) throw new Error("Failed to create payment");
    return result;
  });

// Update payment status
export const updatePaymentStatus = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      status: PaymentStatus;
      paymentMethod?: PaymentMethod;
      notes?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { id, status, paymentMethod, notes } = data;

    const updateData: Record<string, unknown> = {
      status,
      paymentMethod,
      notes,
      updatedAt: new Date(),
    };

    if (status === "PAID") {
      updateData.paymentDate = new Date();
      updateData.paidDate = new Date();
    }

    const [result] = await db
      .update(payment)
      .set(updateData)
      .where(eq(payment.id, id))
      .returning();

    if (!result) throw new Error("Payment not found");
    return result;
  });

// Process payment (mark as paid)
export const processPayment = createServerFn({ method: "POST" })
  .validator(
    (data: {
      paymentId: string;
      amountPaid: number;
      paymentMethod: PaymentMethod;
      notes?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { paymentId, amountPaid, paymentMethod, notes } = data;

    const existingPayment = await db.query.payment.findFirst({
      where: { id: paymentId, isDeleted: false },
    });

    if (!existingPayment) throw new Error("Payment not found");

    const isFullyPaid = amountPaid >= (existingPayment.totalAmount || 0);
    const status = isFullyPaid ? "PAID" : "PARTIAL";

    const [result] = await db
      .update(payment)
      .set({
        amountPaid,
        paymentMethod,
        status,
        paymentDate: new Date(),
        paidDate: new Date(),
        notes: notes ? `${existingPayment.notes || ""}\n${notes}` : existingPayment.notes,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, paymentId))
      .returning();

    if (!result) throw new Error("Payment not found");

    // Update appointment status if applicable
    if (result.appointmentId && isFullyPaid) {
      await db
        .update(appointment)
        .set({ status: "COMPLETED", updatedAt: new Date() })
        .where(eq(appointment.id, result.appointmentId));
    }

    return result;
  });

// Delete payment (soft delete)
export const deletePayment = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin") throw new Error("Forbidden");

    const [result] = await db
      .update(payment)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payment.id, data.id))
      .returning();

    if (!result) throw new Error("Payment not found");
    return { success: true };
  });

// Get payment summary for clinic
export const getPaymentSummary = createServerFn({ method: "GET" })
  .validator(
    (data?: { startDate?: Date; endDate?: Date }) => data || {}
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const { startDate, endDate } = data || {};

    const conditions = [eq(payment.isDeleted, false)];

    if (startDate) conditions.push(gte(payment.billDate, startDate));
    if (endDate) conditions.push(lte(payment.billDate, endDate));

    const summary = await db
      .select({
        totalPayments: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`COALESCE(SUM(${payment.totalAmount}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${payment.amountPaid}), 0)`,
        totalDiscount: sql<number>`COALESCE(SUM(${payment.discount}), 0)`,
        paidCount: sql<number>`COALESCE(SUM(CASE WHEN ${payment.status} = 'PAID' THEN 1 ELSE 0 END), 0)`,
        pendingCount: sql<number>`COALESCE(SUM(CASE WHEN ${payment.status} = 'PENDING' THEN 1 ELSE 0 END), 0)`,
        unpaidCount: sql<number>`COALESCE(SUM(CASE WHEN ${payment.status} = 'UNPAID' THEN 1 ELSE 0 END), 0)`,
        refundedCount: sql<number>`COALESCE(SUM(CASE WHEN ${payment.status} = 'REFUNDED' THEN 1 ELSE 0 END), 0)`,
        partialCount: sql<number>`COALESCE(SUM(CASE WHEN ${payment.status} = 'PARTIAL' THEN 1 ELSE 0 END), 0)`,
      })
      .from(payment)
      .where(and(...conditions));

    return summary[0] || {
      totalPayments: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalDiscount: 0,
      paidCount: 0,
      pendingCount: 0,
      unpaidCount: 0,
      refundedCount: 0,
      partialCount: 0,
    };
  });
