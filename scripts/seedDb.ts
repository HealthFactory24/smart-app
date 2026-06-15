// Prevent Nitro/vite from initializing when running as a standalone script
process.env.NITRO_PRESET = "node-server";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Load environment variables FIRST
import dotenv from "dotenv";
import type { ProductInsert } from "@/db/schema";

dotenv.config();

const sampleProducts: ProductInsert[] = [
	{
		name: "TanStack Router Pro",
		description:
			"The most powerful routing solution for React. Built with TypeScript, featuring type-safe routes, code splitting, and server-side rendering.",
		price: "99.99",
		badge: "New",
		rating: "4.8",
		reviews: 127,
		image: "/tanstack-circle-logo.png",
		inventory: "in-stock",
	},
	{
		name: "TanStack Query Enterprise",
		description:
			"Powerful data synchronization for React. Fetch, cache, and update server state with zero configuration.",
		price: "149.99",
		badge: "New",
		rating: "4.9",
		reviews: 234,
		image: "/tanstack-circle-logo.png",
		inventory: "in-stock",
	},
	{
		name: "TanStack Table Premium",
		description:
			"Headless UI for building powerful tables and datagrids. Fully customizable and framework agnostic.",
		price: "79.99",
		badge: "New",
		rating: "4.7",
		reviews: 89,
		image: "/tanstack-circle-logo.png",
		inventory: "in-stock",
	},
	{
		name: "TanStack Start Framework",
		description:
			"Full-stack React framework with file-based routing, server-side rendering, and built-in optimizations.",
		price: "199.99",
		rating: "4.6",
		reviews: 156,
		image: "/tanstack-circle-logo.png",
		inventory: "in-stock",
	},
	{
		name: "TanStack Form Builder",
		description:
			"Headless form library with validation, async submission, and field-level control. Perfect for complex forms.",
		price: "59.99",
		rating: "4.5",
		reviews: 78,
		image: "/tanstack-circle-logo.png",
		inventory: "backorder",
	},
	{
		name: "TanStack Virtual Scroller",
		description:
			"High-performance virtual scrolling for large lists. Smooth scrolling with minimal memory footprint.",
		price: "49.99",
		rating: "4.4",
		reviews: 92,
		image: "/tanstack-circle-logo.png",
		inventory: "in-stock",
	},
	{
		name: "TanStack DevTools Suite",
		description:
			"Complete developer tools for debugging TanStack applications. Time-travel debugging and performance profiling.",
		price: "129.99",
		rating: "4.7",
		reviews: 145,
		image: "/tanstack-circle-logo.png",
		inventory: "in-stock",
	},
	{
		name: "TanStack Store Manager",
		description:
			"Lightweight state management with derived state, subscriptions, and persistence. Perfect for React apps.",
		price: "39.99",
		rating: "4.3",
		reviews: 67,
		image: "/tanstack-circle-logo.png",
		inventory: "preorder",
	},
];

async function seed() {
	try {
		// Dynamically import database modules after environment variables are loaded
		const { db } = await import("@/db/index");
		const { products } = await import("@/db/schema");

		console.log("🌱 Starting database seed...");

		// Check if --reset flag is passed
		const shouldReset =
			process.argv.includes("--reset") || process.argv.includes("-r");

		if (shouldReset) {
			console.log("🗑️ Clearing existing products...");
			await db.delete(products);
			console.log("   Cleared all products");
		} else {
			// Check if products already exist
			const existingProducts = await db.select().from(products).limit(1);

			if (existingProducts.length > 0) {
				console.log("⚠️ Products already exist in the database.");
				console.log(
					"   Run with --reset flag to clear and reseed:\n   npm run db:seed -- --reset",
				);
				process.exit(0);
			}
		}

		// Insert sample data
		console.log("📦 Inserting sample products...");
		await db.insert(products).values(sampleProducts);
		console.log("✅ Products inserted successfully!");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

// Only run seed() if this file is executed directly (not imported)
// This script should only run when executed via npm run db:seed
// It should NOT run when imported by other modules (like Vite during dev)
const isRunningAsScript =
  process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('tsx')

if (isRunningAsScript) {
  seed()
}
