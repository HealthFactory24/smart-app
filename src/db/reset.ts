import "dotenv/config";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline";
import { Client } from "pg"; // Updated import

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error("❌ DATABASE_URL environment variable is not set");
	process.exit(1);
}

async function askConfirmation(): Promise<boolean> {
	const args = process.argv.slice(2);
	if (args.includes("--force") || args.includes("-y")) {
		return true;
	}

	const rl = readline.createInterface({ input, output });
	try {
		const answer = await new Promise<string>(resolve => {
			rl.question("\n⚠️  WARNING: This will delete ALL data in the public schema. Continue? (y/N): ", resolve);
		});
		return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
	} finally {
		rl.close();
	}
}

async function resetDatabase() {
	const confirmed = await askConfirmation();
	if (!confirmed) {
		console.log("❌ Reset cancelled.");
		return;
	}

	console.log("\n🧹 Preparing to reset PostgreSQL database...");
	const maskedUrl = DATABASE_URL?.replace(/:([^:@]+)@/, ":****@");
	console.log(`📡 Connecting to: ${maskedUrl}`);

	// Initialize the pg Client
	const client = new Client({ connectionString: DATABASE_URL });

	try {
		await client.connect();
		console.log("✅ Database connection successful\n");

		console.log("🔥 Dropping and recreating public schema...");

		// pg uses "BEGIN", "COMMIT", "ROLLBACK" for transactions
		await client.query("BEGIN");
		try {
			await client.query("DROP SCHEMA IF EXISTS public CASCADE");
			await client.query("CREATE SCHEMA public");
			await client.query("GRANT ALL ON SCHEMA public TO public");
			await client.query("COMMENT ON SCHEMA public IS 'standard public schema'");
			await client.query("COMMIT");
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		}

		console.log("✅ Schema reset successful.");
		console.log("\n✨ Database reset complete!");
		console.log("\n🚀 Next steps:");
		console.log("   1. Run migrations: bun run db:migrate");
		console.log("   2. Seed database: bun run db:seed");
		console.log("   3. Start the app: bun run dev");
	} catch (error) {
		console.error("\n❌ Reset failed:", error instanceof Error ? error.message : error);
		process.exit(1);
	} finally {
		await client.end();
	}
}

resetDatabase();
