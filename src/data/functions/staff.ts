// db/repositories/staff.repo.ts

import console from "node:console";

import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import * as schema from "@/db/schema";

// =======================
// Zod Validators
// =======================

const listStaffSchema = z.object({
	clinicId: z.string(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	role: z.enum(["admin", "doctor", "staff", "patient"]).optional(),
	status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).optional()
});

const staffIdSchema = z.object({
	id: z.string(),
	clinicId: z.string()
});

const createStaffSchema = z.object({
	id: z.string().optional(),
	email: z.string().email().optional(),
	name: z.string().min(1),
	phone: z.string().optional(),
	userId: z.string().optional(),
	clinicId: z.string(),
	address: z.string(),
	department: z.string().optional(),
	img: z.string().optional(),
	licenseNumber: z.string().optional(),
	colorCode: z.string().optional(),
	hireDate: z.date().optional(),
	salary: z.number().optional(),
	role: z.enum(["admin", "doctor", "staff", "patient"]),
	status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]).default("ACTIVE"),
	isActive: z.boolean().default(true)
});

const updateStaffSchema = createStaffSchema.partial();

const bulkStaffUpdateSchema = z.object({
	ids: z.array(z.string()),
	data: updateStaffSchema
});

// =======================
// Server Functions
// =======================

const listStaff = createServerFn({ method: "POST" })
	.validator(listStaffSchema)
	.handler(async ctx => {
		try {
			const { clinicId, page, limit, search, role, status } = ctx.data;
			const offset = (page - 1) * limit;

			const whereConditions: Record<string, unknown> = {
				clinicId,
				isActive: true
			};

			if (role) whereConditions.role = role;
			if (status) whereConditions.status = status;

			if (search) {
				whereConditions.OR = [
					{ name: { like: `%${search}%` } },
					{ email: { like: `%${search}%` } },
					{ phone: { like: `%${search}%` } },
					{ department: { like: `%${search}%` } }
				];
			}

			const [staffList, totalResult] = await Promise.all([
				db.query.staff.findMany({
					where: whereConditions,
					limit,
					offset,
					orderBy: (staff, { asc }) => asc(staff.name)
				}),
				db
					.select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
					.from(schema.staff)
					.where(
						and(
							eq(schema.staff.clinicId, clinicId),
							eq(schema.staff.isActive, true),
							role ? eq(schema.staff.role, role) : undefined,
							status ? eq(schema.staff.status, status) : undefined,
							search
								? or(
										like(schema.staff.name, `%${search}%`),
										like(schema.staff.email, `%${search}%`),
										like(schema.staff.phone, `%${search}%`),
										like(schema.staff.department, `%${search}%`)
									)
								: undefined
						)
					)
			]);

			const total = Number(totalResult[0]?.count ?? 0);

			return {
				staff: staffList,
				total,
				totalPages: Math.ceil(total / limit)
			};
		} catch (error) {
			console.error("Error listing staff:", error);
			throw new Error("Failed to list staff");
		}
	});

const getStaffById = createServerFn({ method: "GET" })
	.validator(staffIdSchema)
	.handler(async ctx => {
		try {
			const { id, clinicId } = ctx.data;
			const staff = await db.query.staff.findFirst({
				where: { id, clinicId, isActive: true }
			});
			return staff;
		} catch (error) {
			console.error("Error getting staff by ID:", error);
			throw new Error("Failed to get staff");
		}
	});

const createStaff = createServerFn({ method: "POST" })
	.validator(createStaffSchema)
	.handler(async ctx => {
		try {
			const data = ctx.data;
			const now = new Date();

			const [result] = await db
				.insert(schema.staff)
				.values({
					id: data.id || crypto.randomUUID(),
					...data,
					createdAt: now,
					updatedAt: now
				})
				.returning();

			return result;
		} catch (error) {
			console.error("Error creating staff:", error);
			throw new Error("Failed to create staff");
		}
	});

const createManyStaff = createServerFn({ method: "POST" })
	.validator(z.object({ staffList: z.array(createStaffSchema) }))
	.handler(async ctx => {
		try {
			const { staffList } = ctx.data;
			const now = new Date();

			const staffWithIds = staffList.map(staff => ({
				...staff,
				id: staff.id || crypto.randomUUID(),
				createdAt: now,
				updatedAt: now
			}));

			const result = await db.insert(schema.staff).values(staffWithIds).returning();

			return result;
		} catch (error) {
			console.error("Error creating multiple staff members:", error);
			throw new Error("Failed to create staff members");
		}
	});

const updateStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), data: updateStaffSchema }))
	.handler(async ctx => {
		try {
			const { id, data } = ctx.data;

			const [result] = await db
				.update(schema.staff)
				.set({
					...data,
					updatedAt: new Date()
				})
				.where(eq(schema.staff.id, id))
				.returning();

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error updating staff:", error);
			throw new Error("Failed to update staff");
		}
	});

const updateManyStaff = createServerFn({ method: "POST" })
	.validator(bulkStaffUpdateSchema)
	.handler(async ctx => {
		try {
			const { ids, data } = ctx.data;

			const result = await db
				.update(schema.staff)
				.set({
					...data,
					updatedAt: new Date()
				})
				.where(inArray(schema.staff.id, ids))
				.returning();

			return result;
		} catch (error) {
			console.error("Error updating multiple staff members:", error);
			throw new Error("Failed to update staff members");
		}
	});

const deleteStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;

			const [result] = await db.delete(schema.staff).where(eq(schema.staff.id, id)).returning();

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error deleting staff:", error);
			throw new Error("Failed to delete staff");
		}
	});

const softDeleteStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;

			const [result] = await db
				.update(schema.staff)
				.set({
					deletedAt: new Date(),
					isActive: false,
					updatedAt: new Date()
				})
				.where(eq(schema.staff.id, id))
				.returning();

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error soft deleting staff:", error);
			throw new Error("Failed to soft delete staff");
		}
	});

const restoreStaff = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ctx => {
		try {
			const { id } = ctx.data;

			const [result] = await db
				.update(schema.staff)
				.set({
					isActive: true,
					updatedAt: new Date()
				})
				.where(eq(schema.staff.id, id))
				.returning();

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error restoring staff:", error);
			throw new Error("Failed to restore staff");
		}
	});

// Additional utility functions

const getStaffByUserId = createServerFn({ method: "GET" })
	.validator(z.object({ userId: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { userId, clinicId } = ctx.data;
			const staff = await db.query.staff.findFirst({
				where: { userId, clinicId, isActive: true }
			});
			return staff;
		} catch (error) {
			console.error("Error getting staff by user ID:", error);
			throw new Error("Failed to get staff");
		}
	});

const getStaffByEmail = createServerFn({ method: "GET" })
	.validator(z.object({ email: z.string(), clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { email, clinicId } = ctx.data;
			const staff = await db.query.staff.findFirst({
				where: { email, clinicId, isActive: true }
			});
			return staff;
		} catch (error) {
			console.error("Error getting staff by email:", error);
			throw new Error("Failed to get staff");
		}
	});

const getActiveStaffByDepartment = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), department: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId, department } = ctx.data;
			const staff = await db.query.staff.findMany({
				where: { clinicId, department, isActive: true },
				orderBy: (staff, { asc }) => asc(staff.name)
			});
			return staff;
		} catch (error) {
			console.error("Error getting staff by department:", error);
			throw new Error("Failed to get staff");
		}
	});

const updateStaffStatus = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string(), status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]) }))
	.handler(async ctx => {
		try {
			const { id, status } = ctx.data;

			const [result] = await db
				.update(schema.staff)
				.set({
					status,
					isActive: status === "ACTIVE",
					updatedAt: new Date()
				})
				.where(eq(schema.staff.id, id))
				.returning();

			if (!result) {
				throw new Error("Staff member not found");
			}

			return result;
		} catch (error) {
			console.error("Error updating staff status:", error);
			throw new Error("Failed to update staff status");
		}
	});

const bulkUpdateStaffStatus = createServerFn({ method: "POST" })
	.validator(z.object({ ids: z.array(z.string()), status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]) }))
	.handler(async ctx => {
		try {
			const { ids, status } = ctx.data;

			const result = await db
				.update(schema.staff)
				.set({
					status,
					isActive: status === "ACTIVE",
					updatedAt: new Date()
				})
				.where(inArray(schema.staff.id, ids))
				.returning();

			return result;
		} catch (error) {
			console.error("Error bulk updating staff status:", error);
			throw new Error("Failed to bulk update staff status");
		}
	});

const searchStaff = createServerFn({ method: "POST" })
	.validator(z.object({ clinicId: z.string(), searchTerm: z.string().min(1), limit: z.number().default(20) }))
	.handler(async ctx => {
		try {
			const { clinicId, searchTerm, limit } = ctx.data;

			const staff = await db.query.staff.findMany({
				where: {
					clinicId,
					isActive: true,
					OR: [
						{ name: { like: `%${searchTerm}%` } },
						{ email: { like: `%${searchTerm}%` } },
						{ phone: { like: `%${searchTerm}%` } },
						{ department: { like: `%${searchTerm}%` } }
					]
				},
				limit
			});

			return staff;
		} catch (error) {
			console.error("Error searching staff:", error);
			throw new Error("Failed to search staff");
		}
	});

const getStaffStatistics = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			const { clinicId } = ctx.data;

			const stats = await db
				.select({
					total: sql<number>`CAST(count(*) AS INTEGER)`,
					active: sql<number>`CAST(sum(CASE WHEN ${schema.staff.isActive} THEN 1 ELSE 0 END) AS INTEGER)`,
					inactive: sql<number>`CAST(sum(CASE WHEN NOT ${schema.staff.isActive} THEN 1 ELSE 0 END) AS INTEGER)`
				})
				.from(schema.staff)
				.where(eq(schema.staff.clinicId, clinicId));

			// Get role breakdown separately
			const roleBreakdown = await db
				.select({
					role: schema.staff.role,
					count: sql<number>`CAST(count(*) AS INTEGER)`
				})
				.from(schema.staff)
				.where(eq(schema.staff.clinicId, clinicId))
				.groupBy(schema.staff.role);

			return {
				total: stats[0]?.total ?? 0,
				active: stats[0]?.active ?? 0,
				inactive: stats[0]?.inactive ?? 0,
				roleBreakdown
			};
		} catch (error) {
			console.error("Error getting staff statistics:", error);
			throw new Error("Failed to get staff statistics");
		}
	});

const getStaffWithUpcomingBirthdays = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string() }))
	.handler(async ctx => {
		try {
			// This would require a birthday field in staff table
			// Placeholder implementation
			const staff = await db.query.staff.findMany({
				where: { clinicId: ctx.data.clinicId, isActive: true },
				limit: 10
			});

			return staff;
		} catch (error) {
			console.error("Error getting staff birthdays:", error);
			throw new Error("Failed to get staff birthdays");
		}
	});

const getStaffByRole = createServerFn({ method: "GET" })
	.validator(z.object({ clinicId: z.string(), role: z.enum(["admin", "doctor", "staff", "patient"]) }))
	.handler(async ctx => {
		try {
			const { clinicId, role } = ctx.data;
			const staff = await db.query.staff.findMany({
				where: { clinicId, role, isActive: true },
				orderBy: (staff, { asc }) => asc(staff.name)
			});
			return staff;
		} catch (error) {
			console.error("Error getting staff by role:", error);
			throw new Error("Failed to get staff by role");
		}
	});

export {
	bulkUpdateStaffStatus,
	createManyStaff,
	createStaff,
	deleteStaff,
	getActiveStaffByDepartment,
	getStaffByEmail,
	getStaffById,
	getStaffByRole,
	getStaffByUserId,
	getStaffStatistics,
	getStaffWithUpcomingBirthdays,
	listStaff,
	restoreStaff,
	searchStaff,
	softDeleteStaff,
	updateManyStaff,
	updateStaff,
	updateStaffStatus
};
