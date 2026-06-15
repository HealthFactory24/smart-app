import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth"; // Import auth instance as type

import { ac, admin, doctor, patient, staff } from "./permissions";

const baseURL = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
	baseURL,
	plugins: [
		adminClient({
			ac,
			roles: { staff, admin, patient, doctor }
		}),
		inferAdditionalFields<typeof auth>() // Use typeof auth, not Auth
	]
});

export const { signIn, signUp, useSession, signOut } = authClient;

export type Session = typeof authClient.$Infer.Session;

export const useAuth = () => {
	const { data, isPending, error } = useSession();
	const isAuthenticated = !!data?.user;
	const user = data?.user;

	return {
		isAuthenticated,
		user,
		isPending,
		error
	};
};

export type AuthClientUser = (typeof authClient.$Infer.Session)["user"];
export type AuthClientSession = typeof authClient.$Infer.Session;
export type AuthClient = typeof authClient;
