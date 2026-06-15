import { getSession } from "#/lib/auth.functions";
import { service, type DbService as ServiceSelect } from "@/db/schema";
import { generateId } from "@/utils";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

export const serviceSchema = z.object({
	serviceName: z.string().min(1, "Service name is required"),
	description: z.string(),
  isAvailable: z.boolean().default(true),
  category: z.string(),
  icon: z.string(),
  color: z.string(),
	price: z.number().min(0, "Price must be a positive number"),
	duration: z.number().min(1, "Duration is required"),
});

export const getAllServices = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		try {
			// Get user's clinic ID
			const userClinics = await db
				.select({ clinicId: sql`clinic_id` })
				.from(sql`users_to_clinic`)
				.where(eq(sql`user_id`, session.user.id))
				.limit(1);

			const clinicId = userClinics[0]?.clinicId;
			if (!clinicId) return [];

			const allServices = await db.query.service.findMany({
				where: {
					clinicId: clinicId as string,
					isDeleted: false,
				},
				orderBy: (service, { asc }) => [asc(service.serviceName)],
			});
			return allServices;
		} catch (error) {
			console.error("Error getting all services: ", error);
			return [];
		}
	},
);

// Get active services for the current clinic
export const getAvailableServices = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const { db } = await import("@/db");

		try {
			const userClinics = await db
				.select({ clinicId: sql`clinic_id` })
				.from(sql`users_to_clinic`)
				.where(eq(sql`user_id`, session.user.id))
				.limit(1);

			const clinicId = userClinics[0]?.clinicId;
			if (!clinicId) return [];

			const availableServices = await db.query.service.findMany({
				where: {
					clinicId: clinicId as string,
					isDeleted: false,
					isActive: true,
				},
				orderBy: (service, { asc }) => [asc(service.serviceName)],
			});
			return availableServices;
		} catch (error) {
			console.error("Error getting available services: ", error);
			return [];
		}
	},
);

export const getServiceById = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");
		const serviceId = z.string().parse(data);

		const result = await db
			.select()
			.from(service)
			.where(and(eq(service.id, serviceId), eq(service.isDeleted, false)))
			.limit(1);

		return result[0] ?? null;
	});

export const createService = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof serviceSchema>) => serviceSchema.parse(data))
	.handler(async ({ data }): Promise<ServiceSelect> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		const userClinics = await db
			.select({ clinicId: sql`clinic_id` })
			.from(sql`users_to_clinic`)
			.where(eq(sql`user_id`, session.user.id))
			.limit(1);

		const clinicId = userClinics[0]?.clinicId;
		if (!clinicId) throw new Error("No clinic assigned");

		const result = await db
			.insert(service)
			.values({
				id: generateId(),
				clinicId: clinicId as string,
				...data,
			})
			.returning();

		if (!result[0]) throw new Error("Failed to create service");
		return result[0];
	});

const updateServiceSchema = serviceSchema.partial().extend({
	id: z.string().min(1, "Service ID is required"),
});

export const updateService = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof updateServiceSchema>) =>
		updateServiceSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");
		const { id, ...values } = data;

		const [updated] = await db
			.update(service)
			.set({
				...values,
				updatedAt: new Date(),
			})
			.where(eq(service.id, id))
			.returning();

		if (!updated) throw new Error("Service not found");
		return updated;
	});

export const deleteService = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		const [deleted] = await db
			.update(service)
			.set({
				isDeleted: true,
        color: null,
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(service.id, data.id))
			.returning();

		if (!deleted) throw new Error("Service not found");
		return { success: true };
	});
