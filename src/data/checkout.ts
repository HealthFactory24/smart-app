import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { cartItems, orderItems, orders, products } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const createCheckoutSession = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await getSession();
		if (!session) {
			throw new Error("You must be logged in to checkout");
		}

		const { db } = await import("@/db");
		const Stripe = (await import("stripe")).default;

		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

		// 1. Fetch cart items with product details
		const rows = await db
			.select()
			.from(cartItems)
			.innerJoin(products, eq(cartItems.productId, products.id));

		if (rows.length === 0) {
			throw new Error("Cart is empty");
		}

		// 2. Calculate total
		const total = rows.reduce(
			(acc, row) => acc + Number(row.products.price) * row.cart_items.quantity,
			0,
		);

		// 3. Create a pending order in the DB
		const [order] = await db
			.insert(orders)
			.values({
				userId: session.user.id,
				total: total.toFixed(2),
				status: "pending",
			})
			.returning();

		if (!order) {
			throw new Error("Failed to create order");
		}

		// 4. Insert order items (snapshot of product data at time of purchase)
		await db.insert(orderItems).values(
			rows.map((row) => ({
				orderId: order.id,
				productId: row.products.id,
				name: row.products.name,
				price: row.products.price,
				quantity: row.cart_items.quantity,
				image: row.products.image,
			})),
		);

		// 5. Build line_items for Stripe
		const line_items = rows.map((row) => ({
			price_data: {
				currency: "usd",
				product_data: {
					name: row.products.name,
					description: row.products.description,
					...(row.products.image.startsWith("http")
						? { images: [row.products.image] }
						: {}),
				},
				unit_amount: Math.round(Number(row.products.price) * 100),
			},
			quantity: row.cart_items.quantity,
		}));

		// 6. Create Stripe Checkout Session
		const checkoutSession = await stripe.checkout.sessions.create({
			mode: "payment",
			payment_method_types: ["card"],
			line_items,
			success_url: `${process.env.BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.BETTER_AUTH_URL}/checkout/cancel`,
			metadata: {
				orderId: order.id,
			},
		});

		// 7. Save the Stripe session ID in our order
		await db
			.update(orders)
			.set({ stripeSessionId: checkoutSession.id })
			.where(eq(orders.id, order.id));

		if (!checkoutSession.url) {
			throw new Error("Stripe did not return a checkout URL");
		}

		return { url: checkoutSession.url };
	},
);

// Called from /checkout/success to verify payment and finalize the order
export const confirmOrder = createServerFn({ method: "POST" })
	.inputValidator((data: { sessionId: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		const { db } = await import("@/db");
		const Stripe = (await import("stripe")).default;

		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

		// 1. Verify payment with Stripe
		const checkoutSession = await stripe.checkout.sessions.retrieve(
			data.sessionId,
		);

		if (checkoutSession.payment_status !== "paid") {
			throw new Error("Payment not completed");
		}

		// 2. Find the order by Stripe session ID
		const [order] = await db
			.select()
			.from(orders)
			.where(eq(orders.stripeSessionId, data.sessionId))
			.limit(1);

		if (!order) {
			throw new Error("Order not found");
		}

		// 3. Only update if still pending (avoid double-processing)
		if (order.status === "pending") {
			await db
				.update(orders)
				.set({ status: "paid" })
				.where(eq(orders.id, order.id));

			// 4. Clear the cart
			await db.delete(cartItems);

			// 5. Send confirmation email (fire-and-forget)
			const items = await db
				.select()
				.from(orderItems)
				.where(eq(orderItems.orderId, order.id));

			sendOrderConfirmationEmail(
				{
					name: "TanStack Store",
					from: "TanStack Store <onboarding@resend.dev>",
					ordersUrl: `${process.env.BETTER_AUTH_URL}/orders`,
				},
				{
					to: session.user.email,
					customerName: session.user.name,
					orderId: order.id,
					total: order.total,
					items: items.map((item) => ({
						name: item.name,
						price: item.price,
						quantity: item.quantity,
						image: item.image,
					})),
				},
			);
		}

		return { orderId: order.id, status: "paid" as const };
	});
