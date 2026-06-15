import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { cartItems, products } from "#/db/schema";

export const getCartItemsCount = createServerFn({ method: "GET" }).handler(
	async () => {
		const { db } = await import("@/db");
		const rows = await db
			.select()
			.from(cartItems)
			.innerJoin(products, eq(cartItems.productId, products.id));

		const count = rows.reduce((acc, row) => acc + row.cart_items.quantity, 0);
		const total = rows.reduce(
			(acc, row) => acc + Number(row.products.price) * row.cart_items.quantity,
			0,
		);

		return { count, total };
	},
);

export const fetchCartItems = createServerFn({ method: "GET" }).handler(
	async () => {
		const { db } = await import("@/db");
		try {
			// innerJoin returns rows shaped as: { cart_items: {...}, products: {...} }
			const rows = await db
				.select()
				.from(cartItems)
				.innerJoin(products, eq(cartItems.productId, products.id));

			// Flatten each joined row into a single object for the client
			return rows.map((row) => {
				const cartItem = row.cart_items;
				const product = row.products;

				return {
					id: cartItem.id,
					productId: product.id, // productId we use in cart to redirect to product
					name: product.name,
					price: product.price,
					quantity: cartItem.quantity,
					image: product.image,
					inventory: product.inventory,
				};
			});
		} catch (error) {
			console.error("Error fetching cart items:", error);
			return [];
		}
	},
);

export const updateCartQuantity = createServerFn({ method: "POST" })
	.inputValidator((data: { cartItemId: string; delta: 1 | -1 }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");
		const [item] = await db
			.select()
			.from(cartItems)
			.where(eq(cartItems.id, data.cartItemId))
			.limit(1);

		if (!item) return;

		const newQuantity = item.quantity + data.delta;

		if (newQuantity <= 0) {
			await db.delete(cartItems).where(eq(cartItems.id, data.cartItemId));
		} else {
			await db
				.update(cartItems)
				.set({ quantity: newQuantity, updatedAt: new Date() })
				.where(eq(cartItems.id, data.cartItemId));
		}
	});

export const clearCart = createServerFn({ method: "POST" }).handler(
	async () => {
		const { db } = await import("@/db");
		await db.delete(cartItems);
	},
);

export const removeFromCart = createServerFn({ method: "POST" })
	.inputValidator((data: { cartItemId: string }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");
		try {
			await db.delete(cartItems).where(eq(cartItems.id, data.cartItemId));
		} catch (error) {
			console.error("Error removing from cart:", error);
			throw error;
		}
	});

export const addToCart = createServerFn({ method: "POST" })
	.inputValidator((data: { productId: string }) => data)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");
		try {
			const [existing] = await db
				.select()
				.from(cartItems)
				.where(eq(cartItems.productId, data.productId))
				.limit(1);

			if (existing) {
				await db
					.update(cartItems)
					.set({ quantity: existing.quantity + 1, updatedAt: new Date() })
					.where(eq(cartItems.id, existing.id));
			} else {
				await db.insert(cartItems).values({ productId: data.productId });
			}
		} catch (error) {
			console.error("Error adding to cart:", error);
			throw error;
		}
	});
