import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { orderItems, orders } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";

// Fetch all orders for the logged-in user (newest first)
export const getOrdersByUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");

		// Get all orders for this user, newest first
		const userOrders = await db
			.select()
			.from(orders)
			.where(eq(orders.userId, session.user.id))
			.orderBy(desc(orders.createdAt));

		if (userOrders.length === 0) return [];

		// For each order, fetch its items
		const ordersWithItems = await Promise.all(
			userOrders.map(async (order) => {
				const items = await db
					.select()
					.from(orderItems)
					.where(eq(orderItems.orderId, order.id));

				return {
					id: order.id,
					status: order.status,
					total: order.total,
					createdAt: order.createdAt,
					items: items.map((item) => ({
						id: item.id,
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						image: item.image,
					})),
				};
			}),
		);

		return ordersWithItems;
	},
);

// Fetch a single order by ID (verifies ownership)
export const getOrderById = createServerFn({ method: "GET" })
	.inputValidator((data: { orderId: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");

		const [order] = await db
			.select()
			.from(orders)
			.where(eq(orders.id, data.orderId))
			.limit(1);

		if (!order) {
			throw new Error("Order not found");
		}

		// Verify the order belongs to the logged-in user
		if (order.userId !== session.user.id) {
			throw new Error("Forbidden");
		}

		const items = await db
			.select()
			.from(orderItems)
			.where(eq(orderItems.orderId, order.id));

		return {
			id: order.id,
			status: order.status,
			total: order.total,
			createdAt: order.createdAt,
			stripeSessionId: order.stripeSessionId,
			items: items.map((item) => ({
				id: item.id,
				name: item.name,
				price: item.price,
				quantity: item.quantity,
				image: item.image,
			})),
		};
	});

// Fetch ALL orders (admin only) — joins with user table to get buyer info
export const getAllOrders = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");
		const { user } = await import("@/db/schema");

		// Get all orders joined with user info, newest first
		const rows = await db
			.select({
				id: orders.id,
				status: orders.status,
				total: orders.total,
				createdAt: orders.createdAt,
				userName: user.name,
				userEmail: user.email,
			})
			.from(orders)
			.innerJoin(user, eq(orders.userId, user.id))
			.orderBy(desc(orders.createdAt));

		if (rows.length === 0) return [];

		// For each order, fetch its items
		const ordersWithItems = await Promise.all(
			rows.map(async (row) => {
				const items = await db
					.select()
					.from(orderItems)
					.where(eq(orderItems.orderId, row.id));

				return {
					id: row.id,
					user: { name: row.userName, email: row.userEmail },
					status: row.status,
					total: row.total,
					createdAt: row.createdAt,
					items: items.map((item) => ({
						id: item.id,
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						image: item.image,
					})),
				};
			}),
		);

		return ordersWithItems;
	},
);

export const updateOrderStatus = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { orderId: string; status: "pending" | "paid" | "failed" }) => data,
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");

		await db
			.update(orders)
			.set({ status: data.status })
			.where(eq(orders.id, data.orderId));
	});

export type OrderData = Awaited<ReturnType<typeof getAllOrders>>[number];
