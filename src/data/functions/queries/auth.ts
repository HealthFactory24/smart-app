import { queryOptions } from "@tanstack/react-query";

import {
  getAccountByProvider,
  getAdminCount,
  getInviteByCode,
  getSessionByToken,
  getTwoFactorByUserId,
  getUserByEmail,
  getUserById,
  getUserWithAllRelations,
  getUserWithRole,
  getVerificationByIdentifier
} from "../auth";

export const authKeys = {
	all: ["auth"] as const,
	user: (userId: string) => [...authKeys.all, "user", userId] as const,
	userByEmail: (email: string) => [...authKeys.all, "userByEmail", email] as const,
	userWithRole: (userId: string) => [...authKeys.all, "userWithRole", userId] as const,
	userWithRelations: (userId: string) => [...authKeys.all, "userWithRelations", userId] as const,
	session: (token: string) => [...authKeys.all, "session", token] as const,
	account: (providerId: string, accountId: string) => [...authKeys.all, "account", providerId, accountId] as const,
	verification: (identifier: string) => [...authKeys.all, "verification", identifier] as const,
	twoFactor: (userId: string) => [...authKeys.all, "twoFactor", userId] as const,
	invite: (code: string) => [...authKeys.all, "invite", code] as const,
	adminCount: () => [...authKeys.all, "adminCount"] as const,
	adminOnboarded: () => [...authKeys.all, "adminOnboarded"] as const
};

export const getUserByIdOptions = (userId: string) =>
	queryOptions({
		queryKey: authKeys.user(userId),
		queryFn: ({ signal }) => getUserById({ data: { userId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getUserByEmailOptions = (email: string) =>
	queryOptions({
		queryKey: authKeys.userByEmail(email),
		queryFn: ({ signal }) => getUserByEmail({ data: { email }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getUserWithRoleOptions = (userId: string) =>
	queryOptions({
		queryKey: authKeys.userWithRole(userId),
		queryFn: ({ signal }) =>
			getUserWithRole({
				data: {
					id: userId,
					name: "",
					email: "",
					emailVerified: false,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					role: "patient",
					banned: null,
					banReason: null,
					banExpires: null,
					twoFactorEnabled: null,
					apiKey: null,
					clinicId: null,
					address: null,
					phone: null
				},
				signal
			}),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getUserWithAllRelationsOptions = (userId: string) =>
	queryOptions({
		queryKey: authKeys.userWithRelations(userId),
		queryFn: ({ signal }) => getUserWithAllRelations({ data: { userId }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getSessionByTokenOptions = (token: string) =>
	queryOptions({
		queryKey: authKeys.session(token),
		queryFn: ({ signal }) => getSessionByToken({ data: { token }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getAccountByProviderOptions = (providerId: string, accountId: string) =>
	queryOptions({
		queryKey: authKeys.account(providerId, accountId),
		queryFn: ({ signal }) => getAccountByProvider({ data: { providerId, accountId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getVerificationByIdentifierOptions = (identifier: string) =>
	queryOptions({
		queryKey: authKeys.verification(identifier),
		queryFn: ({ signal }) => getVerificationByIdentifier({ data: { identifier }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getTwoFactorByUserIdOptions = (userId: string) =>
	queryOptions({
		queryKey: authKeys.twoFactor(userId),
		queryFn: ({ signal }) => getTwoFactorByUserId({ data: { userId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getInviteByCodeOptions = (code: string) =>
	queryOptions({
		queryKey: authKeys.invite(code),
		queryFn: ({ signal }) => getInviteByCode({ data: { code }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		retry: 1
	});

export const getAdminCountOptions = () =>
	queryOptions({
		queryKey: authKeys.adminCount(),
		queryFn: ({ signal }) => getAdminCount({ signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});
