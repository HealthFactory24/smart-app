import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "#/lib/auth.functions";
import { type ProductSelect, products } from "@/db/schema";
import { uploadFile } from "@/lib/storage";

export const getAllProducts = createServerFn({ method: "GET" }).handler(
	async () => {
		const { db } = await import("@/db");
		try {
			const allProducts = await db.select().from(products);
			return allProducts;
		} catch (error) {
			console.error("Error getting all products: ", error);
			return [];
		}
	},
);

export const getRecommendedProducts = createServerFn({ method: "GET" }).handler(
	async () => {
		const { db } = await import("@/db");
		try {
			const recommendedProducts = await db.select().from(products).limit(3);
			return recommendedProducts;
		} catch (error) {
			console.error("Error getting recommended products: ", error);
			return [];
		}
	},
);

const idSchema = z.string();

export const getProductById = createServerFn({ method: "GET" })
	.validator((id: string) => id)
	.handler(async ({ data }) => {
		const { db } = await import("@/db");
		const id = idSchema.parse(data);

		const product = await db
			.select()
			.from(products)
			.where(eq(products.id, id))
			.limit(1);

		return product[0] ?? null;
	});

export const productSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	price: z
		.string()
		.refine((val) => !isNaN(Number(val)), "Price must be a number"),
	badge: z.enum(["New", "Sale", "Featured", "Limited"]).nullable().optional(),
	image: z
		.string()
		.url("Image must be a valid URL")
		.max(512, "Image must be 512 chars or less"),
	inventory: z.enum(["in-stock", "backorder", "preorder"]),
});

export const createProduct = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof productSchema>) =>
		productSchema.parse(data),
	)
	.handler(async ({ data }): Promise<ProductSelect> => {
		const session = await getSession();
		if (!session) {
			throw new Error("Unauthorized");
		}

		if (session.user.role !== "admin") {
			throw new Error("Forbidden");
		}
		const { db } = await import("@/db");
		const result = await db
			.insert(products)
			.values({ ...data, badge: data.badge ?? null })
			.returning();
		const product = result[0];
		if (!product) {
			throw new Error(
				"Failed to create product: no product returned from database",
			);
		}
		return product;
	});

export const uploadProductImage = createServerFn({ method: "POST" })
	.validator((data: { fileBase64: string; fileName: string }) => data)
	.handler(async ({ data }) => {
		// Only admins
		const session = await getSession();
		if (!session || session.user.role !== "admin") {
			throw new Error("Unauthorized");
		}


		// Convert base64 → Buffer
		const base64Data = data.fileBase64.split(",")[1] ?? data.fileBase64;
		const buffer = Buffer.from(base64Data, "base64");

		// Fix content type: jpg → jpeg
		const ext = data.fileName.split(".").pop()?.toLowerCase() ?? "jpg";
		const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

		// Unique name
		const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
		const filePath = `products/${uniqueName}`;

		console.log("Uploading to MinIO Storage:", {
			filePath,
			mimeType,
			bufferSize: buffer.length,
		});

		// Upload to MinIO
		await uploadFile(filePath, buffer, mimeType);

		return { url: filePath };
	});

const updateProductSchema = productSchema.partial().extend({
	id: z.string().min(1, "Product ID is required"),
});

export const updateProduct = createServerFn({ method: "POST" })
	.validator((data: z.infer<typeof updateProductSchema>) =>
		updateProductSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");
		const { id, ...values } = data;

		const updateData: Record<string, unknown> = {};
		if (values.name !== undefined) updateData.name = values.name;
		if (values.description !== undefined)
			updateData.description = values.description;
		if (values.price !== undefined) updateData.price = values.price;
		if (values.image !== undefined) updateData.image = values.image;
		if (values.inventory !== undefined) updateData.inventory = values.inventory;
		if (values.badge !== undefined) updateData.badge = values.badge ?? null;

		const result = await db
			.update(products)
			.set(updateData)
			.where(eq(products.id, id))
			.returning();

		const product = result[0];
		if (!product) throw new Error("Product not found");
		return product;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		if (session.user.role !== "admin") throw new Error("Forbidden");

		const { db } = await import("@/db");
		await db.delete(products).where(eq(products.id, data.id));
	});
