// functions/queries/clinic.ts
import { queryOptions } from "@tanstack/react-query";

import {
  canDeleteService,
  getAvailableServices,
  getClinicById,
  getClinicByName,
  getClinicDashboard,
  getClinicServices,
  getClinicSetting,
  getClinicStatistics,
  getConfigValue,
  getDefaultClinic,
  getDoctorPerformanceReport,
  getLowUsageServices,
  getPopularServices,
  getServiceById,
  getServiceCategories,
  getServiceRevenueReport,
  getServicesByCategory,
  getServiceStatistics,
  getServiceUsageTrends,
  getUserClinics,
  listServices,
  searchServices
} from "../clinic";

// =======================
// Query Keys
// =======================

export const clinicKeys = {
	all: ["clinics"] as const,

	// Clinic detail keys
	detail: (clinicId: string) => [...clinicKeys.all, "detail", clinicId] as const,
	byName: (name: string) => [...clinicKeys.all, "byName", name] as const,
	default: () => [...clinicKeys.all, "default"] as const,

	// User clinic relations
	userClinics: (userId: string) => [...clinicKeys.all, "user", userId] as const,

	// Statistics and dashboard
	statistics: (clinicId: string) => [...clinicKeys.all, "statistics", clinicId] as const,
	dashboard: (clinicId: string) => [...clinicKeys.all, "dashboard", clinicId] as const,
	settings: (clinicId: string) => [...clinicKeys.all, "settings", clinicId] as const,

	// Service keys
	services: {
		all: (clinicId: string) => [...clinicKeys.all, "services", clinicId] as const,
		list: (params: { clinicId: string; search?: string; category?: string; page?: number; pageSize?: number }) =>
			[...clinicKeys.services.all(params.clinicId), "list", params] as const,
		available: (clinicId: string) => [...clinicKeys.services.all(clinicId), "available"] as const,
		detail: (serviceId: string, clinicId?: string) =>
			[...clinicKeys.services.all(clinicId || ""), "detail", serviceId] as const,
		byCategory: (clinicId: string, category: string) =>
			[...clinicKeys.services.all(clinicId), "category", category] as const,
		categories: (clinicId: string) => [...clinicKeys.services.all(clinicId), "categories"] as const,
		search: (clinicId: string, searchTerm: string) =>
			[...clinicKeys.services.all(clinicId), "search", searchTerm] as const,
		statistics: (clinicId: string, startDate?: Date, endDate?: Date) =>
			[...clinicKeys.services.all(clinicId), "statistics", { startDate, endDate }] as const,
		popular: (clinicId: string, limit?: number, startDate?: Date, endDate?: Date) =>
			[...clinicKeys.services.all(clinicId), "popular", { limit, startDate, endDate }] as const,
		lowUsage: (clinicId: string, threshold?: number, days?: number) =>
			[...clinicKeys.services.all(clinicId), "low-usage", { threshold, days }] as const,
		revenue: (clinicId: string, startDate: Date, endDate: Date) =>
			[...clinicKeys.services.all(clinicId), "revenue", { startDate, endDate }] as const,
		usageTrends: (clinicId: string, serviceId: string, months?: number) =>
			[...clinicKeys.services.all(clinicId), "usage-trends", serviceId, months] as const,
		canDelete: (serviceId: string) => [...clinicKeys.services.all(""), "can-delete", serviceId] as const
	},

	// Doctor performance keys
	doctorPerformance: (clinicId: string, startDate: Date, endDate: Date) =>
		[...clinicKeys.all, "doctor-performance", clinicId, startDate, endDate] as const,

	// Config keys
	config: (key: string) => [...clinicKeys.all, "config", key] as const
};

// =======================
// Clinic Query Options
// =======================

export const getClinicByIdOptions = (clinicId: string) =>
	queryOptions({
		queryKey: clinicKeys.detail(clinicId),
		queryFn: ({ signal }) => getClinicById({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		enabled: !!clinicId
	});

export const getClinicByNameOptions = (name: string) =>
	queryOptions({
		queryKey: clinicKeys.byName(name),
		queryFn: ({ signal }) => getClinicByName({ data: { name }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: !!name
	});

export const getDefaultClinicOptions = () =>
	queryOptions({
		queryKey: clinicKeys.default(),
		queryFn: ({ signal }) => getDefaultClinic({ signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getUserClinicsOptions = (userId: string) =>
	queryOptions({
		queryKey: clinicKeys.userClinics(userId),
		queryFn: ({ signal }) => getUserClinics({ data: { userId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!userId
	});

// =======================
// Statistics & Dashboard Options
// =======================

export const getClinicStatisticsOptions = (clinicId: string) =>
	queryOptions({
		queryKey: clinicKeys.statistics(clinicId),
		queryFn: ({ signal }) => getClinicStatistics({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 15, // 15 minutes
		enabled: !!clinicId
	});

export const getClinicDashboardOptions = (clinicId: string) =>
	queryOptions({
		queryKey: clinicKeys.dashboard(clinicId),
		queryFn: ({ signal }) => getClinicDashboard({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!clinicId
	});

export const getClinicSettingOptions = (clinicId: string) =>
	queryOptions({
		queryKey: clinicKeys.settings(clinicId),
		queryFn: ({ signal }) => getClinicSetting({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: !!clinicId
	});

// =======================
// Service Query Options
// =======================

export const getClinicServicesOptions = (clinicId: string, includeDeleted = false) =>
	queryOptions({
		queryKey: clinicKeys.services.all(clinicId),
		queryFn: ({ signal }) => getClinicServices({ data: { clinicId, includeDeleted }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!clinicId
	});

export const listServicesOptions = (params: {
	clinicId: string;
	search?: string;
	category?: string;
	page?: number;
	pageSize?: number;
}) =>
	queryOptions({
		queryKey: clinicKeys.services.list(params),
		queryFn: ({ signal }) => listServices({ data: params, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!params.clinicId
	});

export const getAvailableServicesOptions = (clinicId: string) =>
	queryOptions({
		queryKey: clinicKeys.services.available(clinicId),
		queryFn: ({ signal }) => getAvailableServices({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!clinicId
	});

export const getServiceByIdOptions = (serviceId: string, clinicId?: string) =>
	queryOptions({
		queryKey: clinicKeys.services.detail(serviceId, clinicId),
		queryFn: ({ signal }) => getServiceById({ data: { serviceId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!serviceId
	});

export const getServicesByCategoryOptions = (clinicId: string, category: string) =>
	queryOptions({
		queryKey: clinicKeys.services.byCategory(clinicId, category),
		queryFn: ({ signal }) => getServicesByCategory({ data: { clinicId, category }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 20, // 20 minutes
		enabled: !!clinicId && !!category
	});

export const getServiceCategoriesOptions = (clinicId: string) =>
	queryOptions({
		queryKey: clinicKeys.services.categories(clinicId),
		queryFn: ({ signal }) => getServiceCategories({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: !!clinicId
	});

export const searchServicesOptions = (clinicId: string, searchTerm: string) =>
	queryOptions({
		queryKey: clinicKeys.services.search(clinicId, searchTerm),
		queryFn: ({ signal }) => searchServices({ data: { clinicId, searchTerm }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!clinicId && searchTerm.length >= 2
	});

export const getServiceStatisticsOptions = (clinicId: string, startDate?: Date, endDate?: Date) =>
	queryOptions({
		queryKey: clinicKeys.services.statistics(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getServiceStatistics({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		enabled: !!clinicId
	});

export const getPopularServicesOptions = (clinicId: string, limit = 10, startDate?: Date, endDate?: Date) =>
	queryOptions({
		queryKey: clinicKeys.services.popular(clinicId, limit, startDate, endDate),
		queryFn: ({ signal }) => getPopularServices({ data: { clinicId, limit, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		enabled: !!clinicId
	});

export const getLowUsageServicesOptions = (clinicId: string, threshold = 5, days = 30) =>
	queryOptions({
		queryKey: clinicKeys.services.lowUsage(clinicId, threshold, days),
		queryFn: ({ signal }) => getLowUsageServices({ data: { clinicId, threshold, days }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: !!clinicId
	});

export const getServiceRevenueReportOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: clinicKeys.services.revenue(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getServiceRevenueReport({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		enabled: !!clinicId
	});

export const getServiceUsageTrendsOptions = (clinicId: string, serviceId: string, months = 6) =>
	queryOptions({
		queryKey: clinicKeys.services.usageTrends(clinicId, serviceId, months),
		queryFn: ({ signal }) => getServiceUsageTrends({ data: { clinicId, serviceId, months }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: !!clinicId && !!serviceId
	});

export const canDeleteServiceOptions = (serviceId: string) =>
	queryOptions({
		queryKey: clinicKeys.services.canDelete(serviceId),
		queryFn: ({ signal }) => canDeleteService({ data: { serviceId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		enabled: !!serviceId
	});

// =======================
// Doctor Performance Options
// =======================

export const getDoctorPerformanceReportOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: clinicKeys.doctorPerformance(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getDoctorPerformanceReport({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		enabled: !!clinicId
	});

// =======================
// Config Options
// =======================

export const getConfigValueOptions = (key: string) =>
	queryOptions({
		queryKey: clinicKeys.config(key),
		queryFn: ({ signal }) => getConfigValue({ data: { key }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: !!key
	});

// =======================
// Infinite Query Options (for paginated services)
// =======================

import { infiniteQueryOptions } from "@tanstack/react-query";

export const infiniteServicesOptions = (params: {
	clinicId: string;
	search?: string;
	category?: string;
	pageSize?: number;
}) =>
	infiniteQueryOptions({
		queryKey: clinicKeys.services.list({ ...params, page: 1 }),
		queryFn: ({ pageParam = 1, signal }) =>
			listServices({
				data: { ...params, page: pageParam, pageSize: params.pageSize || 10 },
				signal
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage <= lastPage.totalPages ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: !!params.clinicId
	});
