// lib/clinic-context.ts

import { eq, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { getSession } from "@/lib/auth.functions";

// 1. Define or import your actual Session type here instead of node:inspector
// Assuming getSession returns something containing your user structure.
type UserSession = Awaited<ReturnType<typeof getSession>>;

export const getCurrentClinicId = cache(async (): Promise<string | null> => {
	const session = await getSession();
	if (!session) return null;

	// Cast the select output to tell TS exactly what type to expect from raw SQL
	const result = await db
		.select({ clinicId: sql<string>`clinic_id` })
		.from(sql`users_to_clinic`)
		.where(eq(sql`user_id`, session.user.id))
		.limit(1);

	const dbClinicId = result[0]?.clinicId;
	const sessionClinicId = session.user.clinicId;

	return dbClinicId || sessionClinicId || null;
});

// For batch operations requiring clinic data
export const withClinicContext = async <T>(
	fn: (clinicId: string, session: Exclude<UserSession, null>) => Promise<T>
) => {
	const session = await getSession();
	if (!session) throw new Error("Unauthorized");

	const clinicId = await getCurrentClinicId();
	if (!clinicId) throw new Error("No clinic assigned");

	return fn(clinicId, session);
};
