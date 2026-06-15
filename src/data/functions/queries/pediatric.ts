// queries/pediatric.ts

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import type { FeedingType, Gender, MeasurementType } from "@/db/schema";
import {
    addMeasurementPoint,
    bulkUpdateVaccineInventory,
    createDevelopmentalCheck,
    createDevelopmentalMilestone,
    createFeedingLog,
    createManyFeedingLogs,
    createVaccineSchedule,
    deleteFeedingLog,
    generateRecurringFeedings,
    getAllVaccineSchedules,
    getBreastfeedingStats,
    getDevelopmentalProgress,
    getDevelopmentalScreenings,
    getFeedingLogById,
    getFeedingStats,
    getFeedingsByDateRange,
    getGrowthAnalytics,
    getGrowthRecordById,
    getLatestFeedingLog,
    getOverdueImmunizations,
    getPatientGrowthRecords,
    getPatientVaccineSchedule,
    getUpcomingImmunizations,
    getVaccineInventoryStatus,
    getWHOStandards,
    listFeedingLogs,
    listGrowthRecords,
    listImmunizations,
    recordGrowthWithPercentiles,
    recordImmunization,
    syncFeedingLogs,
    updateFeedingLog,
    updateManyFeedingLogs
} from "../pediatric";

// =======================
// Query Keys
// =======================

export const pediatricKeys = {
	all: ["pediatric"] as const,

	// Growth Records
	growthRecords: {
		all: ["growthRecords"] as const,
		byPatient: (patientId: string, clinicId: string) =>
			[...pediatricKeys.all, "growthRecords", "patient", patientId, clinicId] as const,
		list: (clinicId: string, patientId?: string, limit?: number, offset?: number) =>
			[...pediatricKeys.all, "growthRecords", "list", clinicId, patientId, limit, offset] as const,
		detail: (id: string, clinicId: string) =>
			[...pediatricKeys.all, "growthRecords", "detail", id, clinicId] as const,
		analytics: (patientId: string, clinicId: string) =>
			[...pediatricKeys.all, "growthRecords", "analytics", patientId, clinicId] as const
	},

	// Feeding Logs
	feedingLogs: {
		all: ["feedingLogs"] as const,
		list: (filters: {
			patientId: string;
			clinicId: string;
			startDate?: Date;
			endDate?: Date;
			type?: FeedingType;
			limit?: number;
			offset?: number;
		}) => [...pediatricKeys.all, "feedingLogs", "list", filters] as const,
		infinite: (filters: {
			patientId: string;
			clinicId: string;
			startDate?: Date;
			endDate?: Date;
			type?: FeedingType;
			limit?: number;
		}) => [...pediatricKeys.all, "feedingLogs", "infinite", filters] as const,
		detail: (id: string) => [...pediatricKeys.all, "feedingLogs", "detail", id] as const,
		stats: (patientId: string, clinicId: string, days?: number) =>
			[...pediatricKeys.all, "feedingLogs", "stats", patientId, clinicId, days] as const,
		breastfeedingStats: (patientId: string, clinicId: string, days?: number) =>
			[...pediatricKeys.all, "feedingLogs", "breastfeedingStats", patientId, clinicId, days] as const,
		byDateRange: (patientId: string, clinicId: string, startDate: Date, endDate: Date) =>
			[...pediatricKeys.all, "feedingLogs", "dateRange", patientId, clinicId, startDate, endDate] as const,
		latest: (patientId: string) => [...pediatricKeys.all, "feedingLogs", "latest", patientId] as const
	},

	// Developmental
	developmental: {
		all: ["developmental"] as const,
		progress: (patientId: string) => [...pediatricKeys.all, "developmental", "progress", patientId] as const,
		screenings: (patientId: string) => [...pediatricKeys.all, "developmental", "screenings", patientId] as const
	},

	// Immunizations
	immunizations: {
		all: ["immunizations"] as const,
		list: (clinicId?: string, patientId?: string, limit?: number, offset?: number) =>
			[...pediatricKeys.all, "immunizations", "list", clinicId, patientId, limit, offset] as const,
		patientSchedule: (patientId: string) =>
			[...pediatricKeys.all, "immunizations", "patientSchedule", patientId] as const,
		vaccineSchedules: {
			all: ["vaccineSchedules"] as const
		},
		vaccineInventory: (clinicId: string) =>
			[...pediatricKeys.all, "immunizations", "vaccineInventory", clinicId] as const,
		overdue: (clinicId: string) => [...pediatricKeys.all, "immunizations", "overdue", clinicId] as const,
		upcoming: (clinicId: string) => [...pediatricKeys.all, "immunizations", "upcoming", clinicId] as const
	},

	// WHO Standards
	whoStandards: (ageDays: number, gender: Gender, measurementType: MeasurementType) =>
		[...pediatricKeys.all, "whoStandards", ageDays, gender, measurementType] as const
};

// =======================
// Growth Records Query Options
// =======================

export const getPatientGrowthRecordsOptions = (patientId: string, clinicId: string) =>
	queryOptions({
		queryKey: pediatricKeys.growthRecords.byPatient(patientId, clinicId),
		queryFn: ({ signal }) => getPatientGrowthRecords({ data: { patientId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const listGrowthRecordsOptions = (clinicId: string, patientId?: string, limit = 50, offset = 0) =>
	queryOptions({
		queryKey: pediatricKeys.growthRecords.list(clinicId, patientId, limit, offset),
		queryFn: ({ signal }) => listGrowthRecords({ data: { clinicId, patientId, limit, offset }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getGrowthRecordByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: pediatricKeys.growthRecords.detail(id, clinicId),
		queryFn: ({ signal }) => getGrowthRecordById({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});
export const getPatientImmunizationsOptions = (patientId: string, clinicId?: string, limit = 50, offset = 0) =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.list(clinicId, patientId, limit, offset),
		queryFn: ({ signal }) => listImmunizations({ data: { clinicId, patientId, limit, offset }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getGrowthAnalyticsOptions = (patientId: string, clinicId: string) =>
	queryOptions({
		queryKey: pediatricKeys.growthRecords.analytics(patientId, clinicId),
		queryFn: ({ signal }) => getGrowthAnalytics({ data: { patientId, clinicId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

// =======================
// Feeding Logs Query Options
// =======================

export const listFeedingLogsOptions = (filters: {
	patientId: string;
	clinicId: string;
	startDate?: Date;
	endDate?: Date;
	type?: FeedingType;
	limit?: number;
	offset?: number;
}) =>
	queryOptions({
		queryKey: pediatricKeys.feedingLogs.list(filters),
		queryFn: ({ signal }) => listFeedingLogs({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const infiniteFeedingLogsOptions = (filters: {
	patientId: string;
	clinicId: string;
	startDate?: Date;
	endDate?: Date;
	type?: FeedingType;
	limit?: number;
}) =>
	infiniteQueryOptions({
		queryKey: pediatricKeys.feedingLogs.infinite(filters),
		queryFn: ({ pageParam = 0, signal }) =>
			listFeedingLogs({
				data: { ...filters, offset: pageParam, limit: filters.limit ?? 50 },
				signal
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			const loadedItems = allPages.reduce((sum, page) => sum + page.logs.length, 0);
			return loadedItems < lastPage.total ? loadedItems : undefined;
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getFeedingLogByIdOptions = (id: string) =>
	queryOptions({
		queryKey: pediatricKeys.feedingLogs.detail(id),
		queryFn: ({ signal }) => getFeedingLogById({ data: { id }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getFeedingStatsOptions = (patientId: string, clinicId: string, days = 30) =>
	queryOptions({
		queryKey: pediatricKeys.feedingLogs.stats(patientId, clinicId, days),
		queryFn: ({ signal }) => getFeedingStats({ data: { patientId, clinicId, days }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getBreastfeedingStatsOptions = (patientId: string, clinicId: string, days = 30) =>
	queryOptions({
		queryKey: pediatricKeys.feedingLogs.breastfeedingStats(patientId, clinicId, days),
		queryFn: ({ signal }) => getBreastfeedingStats({ data: { patientId, clinicId, days }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getFeedingsByDateRangeOptions = (patientId: string, clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: pediatricKeys.feedingLogs.byDateRange(patientId, clinicId, startDate, endDate),
		queryFn: ({ signal }) => getFeedingsByDateRange({ data: { patientId, clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 20 // 20 minutes
	});

export const getLatestFeedingLogOptions = (patientId: string) =>
	queryOptions({
		queryKey: pediatricKeys.feedingLogs.latest(patientId),
		queryFn: ({ signal }) => getLatestFeedingLog({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// =======================
// Developmental Query Options
// =======================

export const getDevelopmentalProgressOptions = (patientId: string) =>
	queryOptions({
		queryKey: pediatricKeys.developmental.progress(patientId),
		queryFn: ({ signal }) => getDevelopmentalProgress({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getDevelopmentalScreeningsOptions = (patientId: string) =>
	queryOptions({
		queryKey: pediatricKeys.developmental.screenings(patientId),
		queryFn: ({ signal }) => getDevelopmentalScreenings({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 20 // 20 minutes
	});

// =======================
// Immunizations Query Options
// =======================

export const listImmunizationsOptions = (clinicId?: string, patientId?: string, limit = 50, offset = 0) =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.list(clinicId, patientId, limit, offset),
		queryFn: ({ signal }) => listImmunizations({ data: { clinicId, patientId, limit, offset }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientVaccineScheduleOptions = (patientId: string) =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.patientSchedule(patientId),
		queryFn: ({ signal }) => getPatientVaccineSchedule({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getAllVaccineSchedulesOptions = () =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.vaccineSchedules.all,
		queryFn: ({ signal }) => getAllVaccineSchedules({ signal }),
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 120 // 2 hours
	});

export const getVaccineInventoryStatusOptions = (clinicId: string) =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.vaccineInventory(clinicId),
		queryFn: ({ signal }) => getVaccineInventoryStatus({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getOverdueImmunizationsOptions = (clinicId: string) =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.overdue(clinicId),
		queryFn: ({ signal }) => getOverdueImmunizations({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getUpcomingImmunizationsOptions = (clinicId: string) =>
	queryOptions({
		queryKey: pediatricKeys.immunizations.upcoming(clinicId),
		queryFn: ({ signal }) => getUpcomingImmunizations({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

// =======================
// WHO Standards Query Options
// =======================

export const getWHOStandardsOptions = (ageDays: number, gender: Gender, measurementType: MeasurementType) =>
	queryOptions({
		queryKey: pediatricKeys.whoStandards(ageDays, gender, measurementType),
		queryFn: ({ signal }) => getWHOStandards({ data: { ageDays, gender, measurementType }, signal }),
		staleTime: 1000 * 60 * 60 * 24, // 24 hours (WHO standards rarely change)
		gcTime: 1000 * 60 * 60 * 48 // 48 hours
	});

// =======================
// Mutation Options (exported separately for use in mutations)
// =======================

// These are the mutation functions that can be used with useMutation
export const pediatricMutations = {
	addMeasurementPoint,
	bulkUpdateVaccineInventory,
	createDevelopmentalCheck,
	createDevelopmentalMilestone,
	createFeedingLog,
	createManyFeedingLogs,
	createVaccineSchedule,
	deleteFeedingLog,
	generateRecurringFeedings,
	recordGrowthWithPercentiles,
	recordImmunization,
	syncFeedingLogs,
	updateFeedingLog,
	updateManyFeedingLogs
};
