import { queryOptions } from "@tanstack/react-query";

import type { StaffFilters } from "@/types";
import {
  getActiveStaffByDepartment,
  getStaffByEmail,
  getStaffById,
  getStaffByRole,
  getStaffByUserId,
  getStaffStatistics,
  getStaffWithUpcomingBirthdays,
  listStaff,
  searchStaff
} from "../staff";

export const staffKeys = {
	all: ["staff"] as const,

	// List/Filter keys
	list: (filters: StaffFilters) => [...staffKeys.all, "list", filters] as const,

	// Detail keys
	detail: (id: string, clinicId: string) => [...staffKeys.all, "detail", id, clinicId] as const,
	byUserId: (userId: string, clinicId: string) => [...staffKeys.all, "userId", userId, clinicId] as const,
	byEmail: (email: string, clinicId: string) => [...staffKeys.all, "email", email, clinicId] as const,
	byRole: (clinicId: string, role: string) => [...staffKeys.all, "role", clinicId, role] as const,
	byDepartment: (clinicId: string, department: string) =>
		[...staffKeys.all, "department", clinicId, department] as const,

	// Search keys
	search: (clinicId: string, searchTerm: string, limit?: number) =>
		[...staffKeys.all, "search", clinicId, searchTerm, limit] as const,

	// Statistics keys
	statistics: (clinicId: string) => [...staffKeys.all, "statistics", clinicId] as const,

	// Upcoming birthdays
	upcomingBirthdays: (clinicId: string) => [...staffKeys.all, "upcomingBirthdays", clinicId] as const
};

// =======================
// List & Filter Query Options
// =======================

export const listStaffOptions = (filters: StaffFilters) =>
	queryOptions({
		queryKey: staffKeys.list(filters),
		queryFn: ({ signal }) => listStaff({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getStaffByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: staffKeys.detail(id, clinicId),
		queryFn: ({ signal }) => getStaffById({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getStaffByUserIdOptions = (userId: string, clinicId: string) =>
	queryOptions({
		queryKey: staffKeys.byUserId(userId, clinicId),
		queryFn: ({ signal }) => getStaffByUserId({ data: { userId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getStaffByEmailOptions = (email: string, clinicId: string) =>
	queryOptions({
		queryKey: staffKeys.byEmail(email, clinicId),
		queryFn: ({ signal }) => getStaffByEmail({ data: { email, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getStaffByRoleOptions = (clinicId: string, role: "admin" | "doctor" | "staff" | "patient") =>
	queryOptions({
		queryKey: staffKeys.byRole(clinicId, role),
		queryFn: ({ signal }) => getStaffByRole({ data: { clinicId, role }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getActiveStaffByDepartmentOptions = (clinicId: string, department: string) =>
	queryOptions({
		queryKey: staffKeys.byDepartment(clinicId, department),
		queryFn: ({ signal }) => getActiveStaffByDepartment({ data: { clinicId, department }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// =======================
// Search Query Options
// =======================

export const searchStaffOptions = (clinicId: string, searchTerm: string, limit = 20) =>
	queryOptions({
		queryKey: staffKeys.search(clinicId, searchTerm, limit),
		queryFn: ({ signal }) => searchStaff({ data: { clinicId, searchTerm, limit }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: searchTerm.length >= 2
	});

// =======================
// Statistics Query Options
// =======================

export const getStaffStatisticsOptions = (clinicId: string) =>
	queryOptions({
		queryKey: staffKeys.statistics(clinicId),
		queryFn: ({ signal }) => getStaffStatistics({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getStaffWithUpcomingBirthdaysOptions = (clinicId: string) =>
	queryOptions({
		queryKey: staffKeys.upcomingBirthdays(clinicId),
		queryFn: ({ signal }) => getStaffWithUpcomingBirthdays({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 60, // 1 hour (birthdays don't change often)
		gcTime: 1000 * 60 * 120 // 2 hours
	});
