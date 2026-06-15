import { queryOptions } from "@tanstack/react-query";

import {
    getAvailableTimeSlots,
    getDoctorAvailability,
    getDoctorById,
    getDoctorByUserId,
    getDoctorPerformance,
    getDoctorWithSchedule,
    getWorkingDays,
    listDoctors
} from "../doctor";

import type { AvailabilityStatus, Status } from "@/db/schema";

export const doctorKeys = {
	all: ["doctors"] as const,
	detail: (doctorId: string, clinicId?: string) => [...doctorKeys.all, "detail", doctorId, clinicId] as const,
	byUserId: (userId: string, clinicId?: string) => [...doctorKeys.all, "userId", userId, clinicId] as const,
	list: (filters: Record<string, unknown>) => [...doctorKeys.all, "list", filters] as const,
	performance: (doctorId: string, startDate: Date, endDate: Date, clinicId?: string) =>
		[...doctorKeys.all, "performance", doctorId, startDate, endDate, clinicId] as const,
	availability: (doctorId: string, date: Date) => [...doctorKeys.all, "availability", doctorId, date] as const,
	schedule: (doctorId: string, clinicId?: string) => [...doctorKeys.all, "schedule", doctorId, clinicId] as const,
	timeSlots: (doctorId: string, date: Date, durationMinutes?: number) =>
		[...doctorKeys.all, "timeSlots", doctorId, date, durationMinutes] as const,
	workingDays: (doctorId: string) => [...doctorKeys.all, "workingDays", doctorId] as const
};

export const getDoctorByIdOptions = (doctorId: string, clinicId?: string) =>
	queryOptions({
		queryKey: doctorKeys.detail(doctorId, clinicId),
		queryFn: ({ signal }) => getDoctorById({ data: { doctorId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getDoctorByUserIdOptions = (userId: string, clinicId?: string) =>
	queryOptions({
		queryKey: doctorKeys.byUserId(userId, clinicId),
		queryFn: ({ signal }) => getDoctorByUserId({ data: { userId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const listDoctorsOptions = (filters: {
	clinicId: string;
	limit?: number;
	offset?: number;
	search?: string;
	specialty?: string;
	status?: Status;
	availabilityStatus?: AvailabilityStatus;
}) =>
	queryOptions({
		queryKey: doctorKeys.list(filters),
		queryFn: ({ signal }) => listDoctors({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getDoctorPerformanceOptions = (doctorId: string, startDate: Date, endDate: Date, clinicId?: string) =>
	queryOptions({
		queryKey: doctorKeys.performance(doctorId, startDate, endDate, clinicId),
		queryFn: ({ signal }) => getDoctorPerformance({ data: { doctorId, startDate, endDate, clinicId }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getDoctorAvailabilityOptions = (doctorId: string, date: Date) =>
	queryOptions({
		queryKey: doctorKeys.availability(doctorId, date),
		queryFn: ({ signal }) => getDoctorAvailability({ data: { doctorId, date }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getDoctorWithScheduleOptions = (doctorId: string, clinicId?: string) =>
	queryOptions({
		queryKey: doctorKeys.schedule(doctorId, clinicId),
		queryFn: ({ signal }) => getDoctorWithSchedule({ data: { doctorId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getAvailableTimeSlotsOptions = (doctorId: string, date: Date, durationMinutes = 30) =>
	queryOptions({
		queryKey: doctorKeys.timeSlots(doctorId, date, durationMinutes),
		queryFn: ({ signal }) => getAvailableTimeSlots({ data: { doctorId, date, durationMinutes }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getWorkingDaysOptions = (doctorId: string) =>
	queryOptions({
		queryKey: doctorKeys.workingDays(doctorId),
		queryFn: ({ signal }) => getWorkingDays({ data: { doctorId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});
