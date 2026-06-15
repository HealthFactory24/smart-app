// server/patient-bill.server.ts
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { patientBill, payment } from "@/db/schema";
import { PatientBillUpdateSchema } from "@/db/zod";
import { getSession } from "@/lib/auth.functions";

// Get bills for a payment
export const getBillsByPaymentId = createServerFn({ method: "GET" })
  .validator((paymentId: string) => paymentId)
  .handler(async ({ data: paymentId }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const results = await db.query.patientBill.findMany({
      where: { billId: paymentId },
      with: {
        service: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return results;
  });

// Add bill item to a payment
export const addBillItem = createServerFn({ method: "POST" })
  .validator(
    (data: {
      billId: string;
      serviceId: string;
      serviceDate: Date;
      quantity: number;
      unitCost?: number;
      totalCost: number;
    }) => data
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin" && session.user.role !== "staff") {
      throw new Error("Forbidden");
    }

    const { billId, serviceId, serviceDate, quantity, unitCost, totalCost } = data;

    // Verify service exists
    const serviceData = await db.query.service.findFirst({
      where: { id: serviceId, isDeleted: false },
    });
    if (!serviceData) throw new Error("Service not found");

    const finalUnitCost = unitCost || serviceData.price || 0;

    const [result] = await db
      .insert(patientBill)
      .values({
        id: crypto.randomUUID(),
        billId,
        serviceId,
        serviceDate,
        quantity,
        unitCost: finalUnitCost,
        totalCost: totalCost || finalUnitCost * quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!result) throw new Error("Failed to add bill item");

    // Update payment total amount
    const totalResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(${patientBill.totalCost}), 0)` })
      .from(patientBill)
      .where(eq(patientBill.billId, billId));

    const newTotalAmount = totalResult[0]?.sum || 0;

    await db
      .update(payment)
      .set({
        totalAmount: newTotalAmount,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, billId));

    return result;
  });

// Update bill item
export const updateBillItem = createServerFn({ method: "POST" })
  .validator(
    (data: z.infer<typeof PatientBillUpdateSchema> & { id: string }) =>
      PatientBillUpdateSchema.extend({ id: z.string() }).parse(data)
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin" && session.user.role !== "staff") {
      throw new Error("Forbidden");
    }

    const { id, ...updateData } = data;

    const [result] = await db
      .update(patientBill)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(patientBill.id, id))
      .returning();

    if (!result) throw new Error("Bill item not found");

    // Update payment total amount
    const totalResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(${patientBill.totalCost}), 0)` })
      .from(patientBill)
      .where(eq(patientBill.billId, result.billId));

    const newTotalAmount = totalResult[0]?.sum || 0;

    await db
      .update(payment)
      .set({
        totalAmount: newTotalAmount,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, result.billId));

    return result;
  });

// Delete bill item
export const deleteBillItem = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    if (session.user.role !== "admin" && session.user.role !== "staff") {
      throw new Error("Forbidden");
    }

    const billItem = await db.query.patientBill.findFirst({
      where: { id: data.id },
    });

    if (!billItem) throw new Error("Bill item not found");

    const [result] = await db
      .delete(patientBill)
      .where(eq(patientBill.id, data.id))
      .returning();

    if (!result) throw new Error("Failed to delete bill item");

    // Update payment total amount
    const totalResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(${patientBill.totalCost}), 0)` })
      .from(patientBill)
      .where(eq(patientBill.billId, billItem.billId));

    const newTotalAmount = totalResult[0]?.sum || 0;

    await db
      .update(payment)
      .set({
        totalAmount: newTotalAmount,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, billItem.billId));

    return { success: true };
  });
