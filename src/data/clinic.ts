// lib/clinic.functions.ts
import { clinic, clinicMember, clinicSetting, user } from "@/db/schema";
import { getSession } from "@/lib/auth.functions";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const ClinicCreateSchema = z.object({
	name: z.string().min(1, "Clinic name is required"),
	email: z.string().email().optional(),
	timezone: z.string().default("UTC"),
	address: z.string().optional(),
	phone: z.string().optional(),
});

const ClinicUpdateSchema = ClinicCreateSchema.partial();

// Get current user's clinic
export const getCurrentClinic = createServerFn({ method: "GET" }).handler(async () => {
	const session = await getSession();
	if (!session) throw new Error("Unauthorized");

	const { db } = await import("@/db");

	// Get user's primary clinic from usersToClinic
	const userClinic = await db
		.select({
			clinicId: clinicMember.clinicId,
			role: clinicMember.role,
		})
		.from(clinicMember)
		.where(eq(sql`user_id`, session.user.id))
		.limit(1);

	if (!userClinic[0]?.clinicId) {
		// If no clinic assigned, check user's default clinicId
		if (session.user.clinicId) {
			const defaultClinic = await db.query.clinic.findFirst({
				where: { id: session.user.clinicId, isDeleted: false },
			});
			return defaultClinic;
		}
		return null;
	}

	const clinicData = await db.query.clinic.findFirst({
		where: { id: userClinic[0].clinicId, isDeleted: false },
	});

	return clinicData;
});

// Get clinic by ID
export const getClinicById = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const clinicId = z.string().parse(data);

		const clinicData = await db.query.clinic.findFirst({
			where: { id: clinicId, isDeleted: false },
		});

		if (!clinicData) throw new Error("Clinic not found");

		// Check if user has access to this clinic via junction table
		const userAccess = await db
			.select()
			.from(clinicMember)
			.where(and(eq(clinicMember.userId, session.user.id), eq(clinicMember.clinicId, clinicId)))
			.limit(1);

		const hasAccess = session.user.role === "admin" || userAccess.length > 0;

		if (!hasAccess) throw new Error("Forbidden");

		return clinicData;
	});

// Create a new clinic (admin only)
export const createClinic = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof ClinicCreateSchema>) => ClinicCreateSchema.parse(data))
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden - Admin only");

		const { db } = await import("@/db");
		const { name, email, timezone, address, phone } = data;

		// Check if clinic name already exists
		const existing = await db.query.clinic.findFirst({
			where: { name, isDeleted: false },
		});
		if (existing) throw new Error("Clinic with this name already exists");

		const newClinic = await db.transaction(async tx => {
			const [clinicData] = await tx
				.insert(clinic)
				.values({
					id: crypto.randomUUID(),
					name,
					email,
					timezone: timezone || "UTC",
					address,
					phone,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!clinicData) throw new Error("Failed to create clinic");

			// Add creator as clinic member with admin role
			await tx.insert(clinicMember).values({
				userId: session.user.id,
				clinicId: clinicData.id,
				role: "admin",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Create default clinic settings
			await tx.insert(clinicSetting).values({
				id: crypto.randomUUID(),
				clinicId: clinicData.id,
				openingTime: "09:00",
				closingTime: "17:00",
				workingDays: "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY",
				defaultAppointmentDuration: 30,
				requireEmergencyContact: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			return clinicData;
		});

		return newClinic;
	});

// Update clinic
export const updateClinic = createServerFn({ method: "POST" })
	.validator((data: { id: string; values: z.infer<typeof ClinicUpdateSchema> }) =>
		z.object({ id: z.string(), values: ClinicUpdateSchema }).parse(data)
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { id, values } = data;

		// Check permissions
		const isAdmin = session.user.role === "admin";
		const isClinicAdmin = await db
			.select()
			.from(clinicMember)
			.where(and(eq(clinicMember.userId, session.user.id), eq(clinicMember.clinicId, id), eq(clinicMember.role, "admin")))
			.limit(1);

		if (!isAdmin && !isClinicAdmin[0]) throw new Error("Forbidden - Admin access required");

		const [updated] = await db
			.update(clinic)
			.set({
				...values,
				updatedAt: new Date(),
			})
			.where(eq(clinic.id, id))
			.returning();

		if (!updated) throw new Error("Clinic not found");
		return updated;
	});

// Get clinic members
export const getClinicMembers = createServerFn({ method: "GET" })
	.validator((clinicId: string) => clinicId)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const clinicId = z.string().parse(data);

		const members = await db.query.clinicMember.findMany({
			where: { clinicId },
			orderBy: { createdAt: "desc" },
		});

		return members;
	});

// Add member to clinic
export const addClinicMember = createServerFn({ method: "POST" })
	.validator((data: { clinicId: string; userId: string; role: "admin" | "doctor" | "staff" | "patient" }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { clinicId, userId, role } = data;

		// Check if user has permission
		const isAdmin = session.user.role === "admin";
		const isClinicAdmin = await db
			.select()
			.from(clinicMember)
			.where(and(eq(clinicMember.userId, session.user.id), eq(clinicMember.clinicId, clinicId), eq(clinicMember.role, "admin")))
			.limit(1);

		if (!isAdmin && !isClinicAdmin[0]) throw new Error("Forbidden");

		// Check if user already exists in clinic
		const existing = await db
			.select()
			.from(clinicMember)
			.where(and(eq(clinicMember.userId, userId), eq(clinicMember.clinicId, clinicId)))
			.limit(1);

		if (existing[0]) throw new Error("User is already a member of this clinic");

		// Add member
		await db.insert(clinicMember).values({
			userId: userId,
			clinicId: clinicId,
			role,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Update user's default clinic if not set
		const userData = await db.query.user.findFirst({
			where: { id: userId },
			columns: { clinicId: true },
		});

		if (!userData?.clinicId) {
			await db
				.update(user)
				.set({ clinicId })
				.where(eq(user.id, userId));
		}

		return { success: true };
	});

// Remove member from clinic
export const removeClinicMember = createServerFn({ method: "POST" })
	.validator((data: { clinicId: string; userId: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");
		const { clinicId, userId } = data;

		const isAdmin = session.user.role === "admin";
		const isClinicAdmin = await db
			.select()
			.from(clinicMember)
			.where(and(eq(clinicMember.userId, session.user.id), eq(clinicMember.clinicId, clinicId), eq(clinicMember.role, "admin")))
			.limit(1);

		if (!isAdmin && !isClinicAdmin[0]) throw new Error("Forbidden");

		// Cannot remove self if you're the only admin
		if (userId === session.user.id) {
			const adminCount = await db
				.select({ count: sql<number>`count(*)` })
				.from(clinicMember)
				.where(and(eq(clinicMember.clinicId, clinicId), eq(clinicMember.role, "admin")));

			if (adminCount[0]?.count <= 1) {
				throw new Error("Cannot remove the only admin from the clinic");
			}
		}

		await db
			.delete(clinicMember)
			.where(and(eq(clinicMember.userId, userId), eq(clinicMember.clinicId, clinicId)));

		return { success: true };
	});
