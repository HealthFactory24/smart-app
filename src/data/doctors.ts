import { getSession } from "#/lib/auth.functions";
import { doctor, type DbDoctor as DoctorSelect, type DoctorType } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { DoctorEnhancedCreateSchema, type DoctorCreateInput } from '../db/zod';

// Schema for creating/updating doctors
export const doctorSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email().optional().nullable(),
	specialty: z.string().min(1, "Specialty is required"),
	licenseNumber: z.string().optional().nullable(),
	phone: z.string().optional().nullable(),
	address: z.string().optional().nullable(),
	department: z.string().optional().nullable(),
	img: z.string().optional().nullable(),
	colorCode: z.string().optional().nullable(),
	availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).default("AVAILABLE"),
	type: z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]).default("FULL"),
	appointmentPrice: z.number().optional(),
	rating: z.number().min(0).max(5).optional(),
	availableFromWeekDay: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).optional(),
	availableToWeekDay: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).optional(),
	availableFromTime: z.string().optional(),
	availableToTime: z.string().optional(),
	isActive: z.boolean().default(true),
});

// Get all doctors for the current clinic
export const getAllDoctors = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");

		try {
			// Get user's clinic ID
			const userClinics = await db
				.select({ clinicId: sql`clinic_id` })
				.from(sql`users_to_clinic`)
				.where(eq(sql`user_id`, session.user.id))
				.limit(1);

			const clinicId = userClinics[0]?.clinicId;

			if (!clinicId) {
				return [];
			}

			const allDoctors = await db.query.doctor.findMany({
        where: {
          clinicId,
          isDeleted: false
        },
        orderBy:{ name: "asc", createdAt: "desc"  }
      })
			return allDoctors;
		} catch (error) {
			console.error("Error getting all doctors: ", error);
			return [];
		}
	},
);

// Get available doctors (for appointment booking)
export const getAvailableDoctors = createServerFn({ method: "GET" }).handler(
	async () => {
		const { db } = await import("@/db");

		try {
			const availableDoctors = await db
				.select()
				.from(doctor)
				.where(
					and(
						eq(doctor.isActive, true),
						eq(doctor.availabilityStatus, "AVAILABLE"),
						sql`${doctor.isDeleted} = false`
					)
				)
				.orderBy(doctor.name);

			return availableDoctors;
		} catch (error) {
			console.error("Error getting available doctors: ", error);
			return [];
		}
	},
);

// Get doctor by ID

export const getDoctorById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const { db } = await import("@/db");
    const doctorId = z.string().parse(data);

    const result = await db
      .select({
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        phone: doctor.phone,
        address: doctor.address,
        department: doctor.department,
        img: doctor.img,
        availabilityStatus: doctor.availabilityStatus,
        type: doctor.type,
        appointmentPrice: doctor.appointmentPrice,
        rating: doctor.rating,
        experience: doctor.experience,
        bio: doctor.bio,
        isActive: doctor.isActive,
      })
      .from(doctor)
      .where(eq(doctor.id, doctorId))
      .limit(1);

    return result[0] ?? null;
  });
// Create a new doctor (admin only)
export const createDoctor = createServerFn({ method: "POST" })
	.validator((data: DoctorCreateInput) =>
		DoctorEnhancedCreateSchema.parse(data),
	)
	.handler(async ({ data }): Promise<DoctorSelect> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		// Get clinic ID from user's clinic
		const userClinics = await db
			.select({ clinicId: sql`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinics[0]?.clinicId;

		if (!clinicId) {
			throw new Error("No clinic assigned to this user");
		}

		const result = await db
			.insert(doctor)
			.values({
				name: data.name,
				email: data.email ?? null,
				specialty: data.specialty,
				licenseNumber: data.licenseNumber ?? null,
				phone: data.phone ?? null,
				address: data.address ?? null,
				department: (data.department ?? null) as string | null,
				img: (data.img ?? null) as string | null,
				colorCode: (data.colorCode ?? null) as string | null,
				type: (data.type ?? "FULL") as DoctorType,
				appointmentPrice: (data.appointmentPrice ?? 0) as number,
				rating: (data.rating ?? 0) as number,
				availableFromWeekDay: (data.availableFromWeekDay ?? null) as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY" | null,
				availableToWeekDay: (data.availableToWeekDay ?? null) as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY" | null,
				availableFromTime: (data.availableFromTime ?? null) as string | null,
				availableToTime: (data.availableToTime ?? null) as string | null,
				isActive: (data.isActive ?? true) as boolean,
				clinicId,
				availabilityStatus: data.availabilityStatus ?? "AVAILABLE",
			} as any)
			.returning();

		const newDoctor = result[0];
		if (!newDoctor) {
			throw new Error("Failed to create doctor");
		}

		return newDoctor;
	});

// Update doctor information (admin only)
const updateDoctorSchema = doctorSchema.partial().extend({
	id: z.string().min(1, "Doctor ID is required"),
});

export const updateDoctor = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof updateDoctorSchema>) =>
		updateDoctorSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");
		const { id, ...values } = data;

		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		};

		if (values.name !== undefined) updateData.name = values.name;
		if (values.email !== undefined) updateData.email = values.email;
		if (values.specialty !== undefined) updateData.specialty = values.specialty;
		if (values.licenseNumber !== undefined) updateData.licenseNumber = values.licenseNumber;
		if (values.phone !== undefined) updateData.phone = values.phone;
		if (values.address !== undefined) updateData.address = values.address;
		if (values.department !== undefined) updateData.department = values.department;
		if (values.img !== undefined) updateData.img = values.img;
		if (values.colorCode !== undefined) updateData.colorCode = values.colorCode;
		if (values.availabilityStatus !== undefined) updateData.availabilityStatus = values.availabilityStatus;
		if (values.type !== undefined) updateData.type = values.type;
		if (values.appointmentPrice !== undefined) updateData.appointmentPrice = values.appointmentPrice;
		if (values.rating !== undefined) updateData.rating = values.rating;
		if (values.availableFromWeekDay !== undefined) updateData.availableFromWeekDay = values.availableFromWeekDay;
		if (values.availableToWeekDay !== undefined) updateData.availableToWeekDay = values.availableToWeekDay;
		if (values.availableFromTime !== undefined) updateData.availableFromTime = values.availableFromTime;
		if (values.availableToTime !== undefined) updateData.availableToTime = values.availableToTime;
		if (values.isActive !== undefined) updateData.isActive = values.isActive;

		const result = await db
			.update(doctor)
			.set(updateData)
			.where(eq(doctor.id, id))
			.returning();

		const updatedDoctor = result[0];
		if (!updatedDoctor) throw new Error("Doctor not found");

		return updatedDoctor;
	});

// Delete doctor (soft delete, admin only)
export const deleteDoctor = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		await db
			.update(doctor)
			.set({
				isDeleted: true,
				deletedAt: new Date(),
				isActive: false,
			})
			.where(eq(doctor.id, data.id));
	});

// Get doctors by specialty
export const getDoctorsBySpecialty = createServerFn({ method: "POST" })
	.validator((data: { specialty: string }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");

		const doctors = await db
			.select()
			.from(doctor)
			.where(
				and(
					eq(doctor.specialty, data.specialty),
					eq(doctor.isActive, true),
					sql`${doctor.isDeleted} = false`
				)
			)
			.orderBy(doctor.name);

		return doctors;
	});
