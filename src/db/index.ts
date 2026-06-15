import path from "node:path";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator"; // Updated import
import { Pool } from "pg";
import { relations } from "./schema/relations";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}
const globalForDb = globalThis as unknown as {
	pool: Pool | undefined;
};

// Simple Logger Helper
const logger = {
	info: (msg: string, ...args: unknown[]) => console.log(`[DB-INFO] ${msg}`, ...args),
	warn: (msg: string, ...args: unknown[]) => console.warn(`[DB-WARN] ${msg}`, ...args),
	error: (msg: string, ...args: unknown[]) => console.error(`[DB-ERROR] ${msg}`, ...args),
	debug: (msg: string, ...args: unknown[]) =>
		process.env.NODE_ENV !== "production" && console.debug(`[DB-DEBUG] ${msg}`, ...args)
};

// Use pg Pool instead of postgres.js
const pool =
	globalForDb.pool ??
	new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 20000,
		connectionTimeoutMillis: 10000
	});

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle({
	client: pool,
	// Note: relations are passed via the schema object in the new Drizzle API
	relations,
	logger: process.env.NODE_ENV === "development"
});

export function createDb() {
	return drizzle({
		client: new Pool({ connectionString: process.env.DATABASE_URL }),
		relations
	});
}

// export const db = drizzle(pool, { schema });

export async function checkIsDbReady(): Promise<boolean> {
	try {
		await db.execute(sql`SELECT 1`);
		logger.debug("Database connection check successful");
		return true;
	} catch (error) {
		logger.error("Database connection check failed", error);
		return false;
	}
}

let migrationFnCalled = false;

export async function runMigrations(): Promise<void> {
	const fnName = "runMigrations";

	if (migrationFnCalled) {
		logger.debug(`[${fnName}] Skipping migration (already called)`);
		return;
	}

	migrationFnCalled = true;

	if (process.env.IS_BUILD) {
		logger.info(`[${fnName}] Skipping migrations during build process (NODE_ENV: ${process.env.NODE_ENV})`);
		return;
	}

	// Note: Usually you WANT to run migrations in production.
	// If you strictly want to skip them, keep this, but ensure your CI/CD handles it.
	if (process.env.NODE_ENV !== "production") {
		logger.info(`[${fnName}] Running in ${process.env.NODE_ENV}, applying migrations...`);
	} else {
		logger.info(`[${fnName}] Applying migrations for production...`);
	}

	const migrationsFolder = path.join(process.cwd(), "packages/db/src/migrations");

	try {
		logger.info(`[${fnName}] Starting migration process...`);
		await migrate(db, { migrationsFolder });
		logger.info(`[${fnName}] ✅ Database migration completed successfully`);
	} catch (error) {
		logger.error(`[${fnName}] ❌ Database migration failed`, error);
		throw error;
	}
}

export type DB = typeof db;
export type DBType = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DBorTx = DB | DBType;
