import { queryOptions } from "@tanstack/react-query";

import {
    getGuardiansByPatient,
    getPatientById,
    getPatientByMRN,
    getPatientByUserId,
    getPatientsByAgeRange,
    getPatientsByClinic,
    getPatientsCount,
    getPatientsCreatedBetween,
    getPatientsInDateRange,
    getPatientStats,
    getPatientUpcomingAppointments,
    getPatientWithFullHistory,
    listPatients,
    searchPatients
} from "../patient";

import type { BloodGroup, Gender, Status } from "@/db/schema";
import { getOrCreateUserQuota, getUserQuota } from "../auth";

export const patientKeys = {
	all: ["patients"] as const,
	list: (filters: Record<string, unknown>) => [...patientKeys.all, "list", filters] as const,
	detail: (id: string, clinicId: string) => [...patientKeys.all, "detail", id, clinicId] as const,
	byMRN: (mrn: string, clinicId: string) => [...patientKeys.all, "mrn", mrn, clinicId] as const,
	byUserId: (userId: string, clinicId: string) => [...patientKeys.all, "userId", userId, clinicId] as const,
	stats: (patientId: string) => [...patientKeys.all, "stats", patientId] as const,
	upcomingAppointments: (patientId: string, clinicId: string) =>
		[...patientKeys.all, "upcoming", patientId, clinicId] as const,
	fullHistory: (patientId: string, clinicId: string) => [...patientKeys.all, "history", patientId, clinicId] as const,
	byClinic: (clinicId: string) => [...patientKeys.all, "clinic", clinicId] as const,
	byAgeRange: (clinicId: string, minAgeMonths: number, maxAgeMonths: number) =>
		[...patientKeys.all, "ageRange", clinicId, minAgeMonths, maxAgeMonths] as const,
	byDateRange: (clinicId: string, startDate: Date, endDate: Date) =>
		[...patientKeys.all, "dateRange", clinicId, startDate, endDate] as const,
	search: (clinicId: string, searchTerm: string) => [...patientKeys.all, "search", clinicId, searchTerm] as const,
	guardians: (patientId: string) => [...patientKeys.all, "guardians", patientId] as const,
	userQuota: (userId: string) => ["userQuota", userId] as const
};

export const getPatientByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.detail(id, clinicId),
		queryFn: ({ signal }) => getPatientById({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientByMRNOptions = (mrn: string, clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.byMRN(mrn, clinicId),
		queryFn: ({ signal }) => getPatientByMRN({ data: { mrn, clinicId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getPatientByUserIdOptions = (userId: string, clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.byUserId(userId, clinicId),
		queryFn: ({ signal }) => getPatientByUserId({ data: { userId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientStatsOptions = (patientId: string) =>
	queryOptions({
		queryKey: patientKeys.stats(patientId),
		queryFn: ({ signal }) => getPatientStats({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getPatientUpcomingAppointmentsOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.upcomingAppointments(id, clinicId),
		queryFn: ({ signal }) => getPatientUpcomingAppointments({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getPatientWithFullHistoryOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.fullHistory(id, clinicId),
		queryFn: ({ signal }) => getPatientWithFullHistory({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientsByClinicOptions = (clinicId: string) =>
	queryOptions({
		queryKey: patientKeys.byClinic(clinicId),
		queryFn: ({ signal }) => getPatientsByClinic({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientsByAgeRangeOptions = (clinicId: string, minAgeMonths: number, maxAgeMonths: number) =>
	queryOptions({
		queryKey: patientKeys.byAgeRange(clinicId, minAgeMonths, maxAgeMonths),
		queryFn: ({ signal }) => getPatientsByAgeRange({ data: { clinicId, minAgeMonths, maxAgeMonths }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getPatientsCreatedBetweenOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: patientKeys.byDateRange(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getPatientsCreatedBetween({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getPatientsInDateRangeOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: patientKeys.byDateRange(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getPatientsInDateRange({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const searchPatientsOptions = (clinicId: string, searchTerm: string) =>
	queryOptions({
		queryKey: patientKeys.search(clinicId, searchTerm),
		queryFn: ({ signal }) => searchPatients({ data: { clinicId, searchTerm }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: searchTerm.length >= 2
	});

export const listPatientsOptions = (filters: {
	clinicId: string;
	limit?: number;
	offset?: number;
	search?: string;
	status?: Status;
	isActive?: boolean;
	gender?: Gender;
	bloodGroup?: BloodGroup;
}) =>
	queryOptions({
		queryKey: patientKeys.list(filters),
		queryFn: ({ signal }) => listPatients({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getGuardiansByPatientOptions = (patientId: string) =>
	queryOptions({
		queryKey: patientKeys.guardians(patientId),
		queryFn: ({ signal }) => getGuardiansByPatient({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getUserQuotaOptions = (userId: string) =>
	queryOptions({
		queryKey: patientKeys.userQuota(userId),
		queryFn: ({ signal }) => getUserQuota({ data: { userId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getOrCreateUserQuotaOptions = (userId: string) =>
	queryOptions({
		queryKey: patientKeys.userQuota(userId),
		queryFn: ({ signal }) => getOrCreateUserQuota({ data: { userId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// In functions/queries/patient.ts
export const getPatientsCountOptions = (params: { clinicId: string; search?: string; status?: Status }) =>
	queryOptions({
		queryKey: ["patients-count", params],
		queryFn: ({ signal }) => getPatientsCount({ data: params, signal }),
		staleTime: 1000 * 60 * 2
	});
