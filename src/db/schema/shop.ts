import { integer, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth";

const badgeValues = ["New", "Sale", "Featured", "Limited"] as const;
const inventoryValues = ["in-stock", "backorder", "preorder"] as const;

export const badgeEnum = pgEnum("badge", badgeValues);
export const inventoryEnum = pgEnum("inventory", inventoryValues);

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 256 }).notNull(),
	description: text("description").notNull(),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	badge: badgeEnum("badge"),
	rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
	reviews: integer("reviews").notNull().default(0),
	image: varchar("image", { length: 512 }).notNull(),
	inventory: inventoryEnum("inventory").notNull().default("in-stock"),
	createdAt: timestamp("created_at").defaultNow().notNull()
});

export type ProductSelect = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;

// Cart items table - stores items in user's cart
export const cartItems = pgTable("cart_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id, { onDelete: "cascade" }),
	quantity: integer("quantity").notNull().default(1),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type CartItemSelect = typeof cartItems.$inferSelect & typeof products.$inferSelect;

export type CartItemInsert = typeof cartItems.$inferInsert;

// Export enum value types inferred from the enum definitions
export type BadgeValue = (typeof badgeValues)[number];
export type InventoryValue = (typeof inventoryValues)[number];

const orderStatusValues = ["pending", "paid", "failed"] as const;
export const orderStatusEnum = pgEnum("order_status", orderStatusValues);

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	stripeSessionId: text("stripe_session_id"),
	status: orderStatusEnum("status").notNull().default("pending"),
	total: numeric("total", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull()
});

export const orderItems = pgTable("order_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: uuid("product_id").references(() => products.id, {
		onDelete: "set null"
	}),
	name: varchar("name", { length: 256 }).notNull(),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	quantity: integer("quantity").notNull(),
	image: varchar("image", { length: 512 }).notNull()
});

export type OrderSelect = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
export type OrderItemSelect = typeof orderItems.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
