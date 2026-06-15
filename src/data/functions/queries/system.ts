// db/repositories/system.repo.query-options.ts
import { queryOptions } from "@tanstack/react-query";

// =======================
// Query Keys
// =======================

export const systemKeys = {
	all: ["system"] as const,

	// File search keys
	files: {
		all: ["files"] as const,
		search: (userId: string, searchTerm: string) =>
			[...systemKeys.all, "files", "search", userId, searchTerm] as const,
		advancedSearch: (filters: AdvancedSearchFilters) => [...systemKeys.all, "files", "advanced", filters] as const
	},

	// Notification keys
	notifications: {
		all: ["notifications"] as const,
		list: (filters: NotificationFilters) => [...systemKeys.all, "notifications", "list", filters] as const,
		user: (userId: string, clinicId?: string, limit?: number, offset?: number) =>
			[...systemKeys.all, "notifications", "user", userId, clinicId, limit, offset] as const,
		unreadCount: (userId: string, clinicId?: string) =>
			[...systemKeys.all, "notifications", "unreadCount", userId, clinicId] as const
	},

	// Analytics keys
	analytics: {
		clinic: (clinicId: string, startDate: Date, endDate: Date) =>
			[...systemKeys.all, "analytics", "clinic", clinicId, startDate, endDate] as const
	},

	// Config keys
	configs: {
		all: ["configs"] as const,
		detail: (key: string) => [...systemKeys.all, "configs", "detail", key] as const,
		multiple: (keys: string[]) => [...systemKeys.all, "configs", "multiple", keys] as const,
		keys: ["configs", "keys"] as const
	},

	// Payment keys
	payments: {
		receipt: (paymentId: string) => [...systemKeys.all, "payments", "receipt", paymentId] as const
	}
};

// =======================
// Types
// =======================

interface AdvancedSearchFilters {
	clinicId?: string;
	patientName?: string;
	doctorName?: string;
	dateFrom?: Date;
	dateTo?: Date;
	status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

interface NotificationFilters {
	userId: string;
	clinicId?: string;
	status?: "all" | "read" | "unread";
	type?: string | null;
	search?: string;
	limit?: number;
	offset?: number;
}

// =======================
// File Search Query Options
// =======================

export const searchFilesOptions = (userId: string, searchTerm: string) =>
	queryOptions({
		queryKey: systemKeys.files.search(userId, searchTerm),
		queryFn: ({ signal }) => searchFiles({ data: { userId, searchTerm }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: searchTerm.length >= 2
	});

export const advancedSearchOptions = (filters: AdvancedSearchFilters) =>
	queryOptions({
		queryKey: systemKeys.files.advancedSearch(filters),
		queryFn: ({ signal }) => advancedSearch({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// =======================
// Notification Query Options
// =======================

export const listNotificationsOptions = (filters: NotificationFilters) =>
	queryOptions({
		queryKey: systemKeys.notifications.list(filters),
		queryFn: ({ signal }) => listNotifications({ data: filters, signal }),
		staleTime: 1000 * 30, // 30 seconds (notifications are frequent)
		gcTime: 1000 * 60 * 2 // 2 minutes
	});

export const getUserNotificationsOptions = (userId: string, clinicId?: string, limit = 5, offset = 0) =>
	queryOptions({
		queryKey: systemKeys.notifications.user(userId, clinicId, limit, offset),
		queryFn: ({ signal }) => getUserNotifications({ data: { userId, clinicId, limit, offset }, signal }),
		staleTime: 1000 * 30, // 30 seconds
		gcTime: 1000 * 60 * 2 // 2 minutes
	});

// Helper to get just unread count (can be used with listNotifications response)
export const unreadNotificationsCountOptions = (userId: string, clinicId?: string) =>
	queryOptions({
		queryKey: systemKeys.notifications.unreadCount(userId, clinicId),
		queryFn: async ({ signal }) => {
			const result = await listNotifications({
				data: {
					userId,
					clinicId,
					status: "unread",
					limit: 1,
					offset: 0
				},
				signal
			});
			return result.unreadCount;
		},
		staleTime: 1000 * 15, // 15 seconds (unread count changes frequently)
		gcTime: 1000 * 60 // 1 minute
	});

// =======================
// Analytics Query Options
// =======================

export const getClinicAnalyticsOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: systemKeys.analytics.clinic(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getClinicAnalytics({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes (analytics don't change rapidly)
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

// =======================
// Config Query Options
// =======================

export const getAllConfigsOptions = () =>
	queryOptions({
		queryKey: systemKeys.configs.all,
		queryFn: ({ signal }) => getAllConfigs({ signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes (configs change rarely)
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getConfigOptions = (key: string) =>
	queryOptions({
		queryKey: systemKeys.configs.detail(key),
		queryFn: ({ signal }) => getConfig({ data: { key }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getConfigsOptions = (keys: string[]) =>
	queryOptions({
		queryKey: systemKeys.configs.multiple(keys),
		queryFn: ({ signal }) => getConfigs({ data: { keys }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: keys.length > 0
	});

export const getExistingConfigKeysOptions = () =>
	queryOptions({
		queryKey: systemKeys.configs.keys,
		queryFn: ({ signal }) => getExistingConfigKeys({ signal }),
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 120 // 2 hours
	});

// =======================
// Payment Query Options
// =======================

export const generateReceiptOptions = (paymentId: string) =>
	queryOptions({
		queryKey: systemKeys.payments.receipt(paymentId),
		queryFn: ({ signal }) => generateReceipt({ data: { paymentId }, signal }),
		staleTime: 1000 * 60 * 60, // 1 hour (receipts are immutable once generated)
		gcTime: 1000 * 60 * 120, // 2 hours
		enabled: !!paymentId
	});

// =======================
// Infinite Query Options (for paginated notifications)
// =======================

import { infiniteQueryOptions } from "@tanstack/react-query";

import {
	advancedSearch,
	generateReceipt,
	getAllConfigs,
	getClinicAnalytics,
	getConfig,
	getConfigs,
	getExistingConfigKeys,
	getUserNotifications,
	listNotifications,
	searchFiles
} from "../system";

export const infiniteNotificationsOptions = (filters: Omit<NotificationFilters, "offset">) =>
	infiniteQueryOptions({
		queryKey: systemKeys.notifications.list({ ...filters, offset: 0 }),
		queryFn: ({ pageParam = 0, signal }) =>
			listNotifications({
				data: { ...filters, offset: pageParam },
				signal
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			const loadedItems = allPages.reduce((sum, page) => sum + page.items.length, 0);
			return loadedItems < lastPage.total ? loadedItems : undefined;
		},
		staleTime: 1000 * 30, // 30 seconds
		gcTime: 1000 * 60 * 5 // 5 minutes
	});
