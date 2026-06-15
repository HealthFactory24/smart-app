
 import { createServerFn } from "@tanstack/react-start";
 import { and, desc, eq, sql } from "drizzle-orm";
 import { z } from "zod";
 import { getSession } from "#/lib/auth.functions";
 import { prescription, patient, doctor, type DbPrescription } from "@/db/schema";
import { generateId } from '../utils';

 export const prescriptionSchema = z.object({
 	patientId: z.string().min(1, "Patient is required"),
 	doctorId: z.string().min(1, "Doctor is required"),
 	appointmentId: z.string().optional().nullable(),
 	medications: z.array(z.object({
 		name: z.string().min(1),
 		dosage: z.string().min(1),
 		frequency: z.string().min(1),
 		duration: z.string().min(1),
 		instructions: z.string().optional(),
 	})),
 	diagnosis: z.string().optional(),
 	notes: z.string().optional(),
 	status: z.enum(["active", "completed", "on_hold", "cancelled"]).default("active"),
 	startDate: z.coerce.date().default(() => new Date()),
 	endDate: z.coerce.date().optional().nullable(),
 });

 export const getPrescriptionsByPatient = createServerFn({ method: "GET" })
 	.validator((patientId: string) => patientId)
 	.handler(async ({ data: patientId }) => {
 		const session = await getSession();
 		if (!session) throw new Error("Unauthorized");

 		const { db } = await import("@/db");

 		const results = await db
 			.select({
 				id: prescription.id,
 				medications: prescription.medicationName,
 				diagnosis: prescription.diagnosis,
 				status: prescription.status,
 				startDate: prescription.issuedDate,
 				doctorName: doctor.name,
 				patientFirstName: patient.firstName,
 				patientLastName: patient.lastName,
 			})
 			.from(prescription)
 			.innerJoin(patient, eq(prescription.patientId, patient.id))
 			.innerJoin(doctor, eq(prescription.doctorId, doctor.id))
 			.where(eq(prescription.patientId, patientId))
 			.orderBy(desc(prescription.createdAt));

 		return results;
 	});

 export const createPrescription = createServerFn({ method: "POST" })
 	.validator((data: z.infer<typeof prescriptionSchema>) => prescriptionSchema.parse(data))
 	.handler(async ({ data }): Promise<DbPrescription> => {
 		const session = await getSession();
 		if (!session) throw new Error("Unauthorized");
 		if (session.user.role === "patient") throw new Error("Forbidden");

 		const { db } = await import("@/db");

 		// Get clinicId from patient
 		const [patientRecord] = await db
 			.select({ clinicId: patient.clinicId })
 			.from(patient)
 			.where(eq(patient.id, data.patientId))
 			.limit(1);

 		if (!patientRecord) throw new Error("Patient not found");

 		const [newPrescription] = await db
 			.insert(prescription)
 			.values({
 				id: generateId(),
				...data,
			} as any)
 			.returning();

 		if (!newPrescription) throw new Error("Failed to create prescription");
 		return newPrescription;
 	});

 export const updatePrescriptionStatus = createServerFn({ method: "POST" })
 	.validator(z.object({
 		id: z.string(),
 		status: z.enum(["active", "completed", "on_hold", "cancelled"])
 	}))
 	.handler(async ({ data }) => {
 		const session = await getSession();
 		if (!session) throw new Error("Unauthorized");

 		const { db } = await import("@/db");

 		const [updated] = await db
 			.update(prescription)
 			.set({
 				status: data.status,
 				updatedAt: new Date()
 			})
 			.where(eq(prescription.id, data.id))
 			.returning();

 		return updated;
 	});

 export const getPrescriptionById = createServerFn({ method: "GET" })
 	.validator((id: string) => id)
 	.handler(async ({ data: id }) => {
 		const session = await getSession();
 		if (!session) throw new Error("Unauthorized");

 		const { db } = await import("@/db");

 		const [result] = await db
 			.select({
 				id: prescription.id,
 				medications: prescription.medicationName,
 				diagnosis: prescription.diagnosis,
 				notes: prescription.notes,
 				status: prescription.status,
 				startDate: prescription.issuedDate,
 				endDate: prescription.endDate,
 				doctor: {
 					name: doctor.name,
 					specialty: doctor.specialty,
 				},
 				patient: {
 					firstName: patient.firstName,
 					lastName: patient.lastName,
 					mrn: patient.mrn,
 				}
 			})
 			.from(prescription)
 			.innerJoin(patient, eq(prescription.patientId, patient.id))
 			.innerJoin(doctor, eq(prescription.doctorId, doctor.id))
 			.where(eq(prescription.id, id))
 			.limit(1);

 		return result ?? null;
 	});

 export const deletePrescription = createServerFn({ method: "POST" })
 	.validator(z.object({ id: z.string() }))
 	.handler(async ({ data }) => {
 		const session = await getSession();
 		if (!session || session.user.role !== "admin") throw new Error("Unauthorized");

 		const { db } = await import("@/db");
 		await db.delete(prescription).where(eq(prescription.id, data.id));

 		return { success: true };
 	});
