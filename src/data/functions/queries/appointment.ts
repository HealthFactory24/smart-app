import { queryOptions } from "@tanstack/react-query";

import type { Appointment, AppointmentStatus } from "@/db/zod/clinic.schema";
import {
    getAllAppointments,
    getAppointmentById,
    getAppointmentCountsByStatus,
    getAppointmentsByStatus,
    getAppointmentsInRange,
    getAppointmentsWithFilters,
    getAppointmentsWithPagination,
    getDoctorAppointmentsInRange,
    getMonthlyAppointmentData,
    getPatientAppointments,
    validateAppointment
} from "../appointment";

export const appointmentKeys = {
	all: ["appointments"] as const,
	detail: (id: string, clinicId: string) => [...appointmentKeys.all, "detail", id, clinicId] as const,
	list: (filters: Record<string, unknown>) => [...appointmentKeys.all, "list", filters] as const,
	inRange: (clinicId: string, startDate: Date, endDate: Date, doctorId?: string) =>
		[...appointmentKeys.all, "range", clinicId, startDate, endDate, doctorId] as const,
	byStatus: (clinicId: string, status: string) => [...appointmentKeys.all, "status", clinicId, status] as const,
	byClinic: (clinicId: string) => [...appointmentKeys.all, "clinic", clinicId] as const,
	monthly: (clinicId: string, year: number) => [...appointmentKeys.all, "monthly", clinicId, year] as const,
	byPatient: (patientId: string, clinicId: string, page: number, limit: number, status?: string) =>
		[...appointmentKeys.all, "patient", patientId, clinicId, page, limit, status] as const,
	byDoctor: (doctorId: string, startDate: Date, endDate: Date) =>
		[...appointmentKeys.all, "doctor", doctorId, startDate, endDate] as const,
	counts: (clinicId: string) => [...appointmentKeys.all, "counts", clinicId] as const,
	validate: (appointmentId: string) => [...appointmentKeys.all, "validate", appointmentId] as const
};

export const getAppointmentByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: appointmentKeys.detail(id, clinicId),
		queryFn: ({ signal }) => getAppointmentById({ data: { id, clinicId }, signal }) as Promise<Appointment>,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getAppointmentsInRangeOptions = (clinicId: string, startDate: Date, endDate: Date, doctorId?: string) =>
	queryOptions({
		queryKey: appointmentKeys.inRange(clinicId, startDate, endDate, doctorId),
		queryFn: ({ signal }) =>
			getAppointmentsInRange({ data: { clinicId, startDate, endDate, doctorId }, signal }) as Promise<
				Appointment[]
			>,
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getAppointmentsByStatusOptions = (clinicId: string, status: AppointmentStatus) =>
	queryOptions({
		queryKey: appointmentKeys.byStatus(clinicId, status),
		queryFn: ({ signal }) =>
			getAppointmentsByStatus({ data: { clinicId, status }, signal }) as Promise<Appointment[]>,
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getAllAppointmentsOptions = (clinicId: string) =>
	queryOptions({
		queryKey: appointmentKeys.byClinic(clinicId),
		queryFn: ({ signal }) => getAllAppointments({ data: { clinicId }, signal }) as Promise<Appointment[]>,
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getAppointmentsWithFiltersOptions = (filters: {
	clinicId: string;
	filters: {
		status?: AppointmentStatus;
		startDate?: Date;
		endDate?: Date;
		doctorId?: string;
		patientId?: string;
		type?: string;
		search?: string;
	};
	pagination: { limit: number; offset: number };
}) =>
	queryOptions({
		queryKey: appointmentKeys.list(filters),
		queryFn: ({ signal }) =>
			getAppointmentsWithFilters({ data: filters, signal }) as unknown as Promise<Appointment[]>,
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getAppointmentsWithPaginationOptions = (params: {
	clinicId: string;
	pagination: { page: number; limit: number };
	filters?: {
		status?: AppointmentStatus;
		fromDate?: Date;
		toDate?: Date;
		patientId?: string;
		doctorId?: string;
		search?: string;
	};
}) =>
	queryOptions({
		queryKey: appointmentKeys.list(params),
		queryFn: ({ signal }) =>
			getAppointmentsWithPagination({ data: params, signal }) as unknown as Promise<Appointment[]>,
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getMonthlyAppointmentDataOptions = (clinicId: string, year: number) =>
	queryOptions({
		queryKey: appointmentKeys.monthly(clinicId, year),
		queryFn: ({ signal }) => getMonthlyAppointmentData({ data: { clinicId, year }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getPatientAppointmentsOptions = (
	patientId: string,
	clinicId: string,
	page: number,
	limit: number,
	status?: AppointmentStatus
) =>
	queryOptions({
		queryKey: appointmentKeys.byPatient(patientId, clinicId, page, limit, status),
		queryFn: ({ signal }) =>
			getPatientAppointments({
				data: { patientId, clinicId, pagination: { page, limit }, status },
				signal
			}) as unknown as Promise<Appointment[]>,
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getDoctorAppointmentsInRangeOptions = (doctorId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: appointmentKeys.byDoctor(doctorId, startDate, endDate),
		queryFn: ({ signal }) =>
			getDoctorAppointmentsInRange({ data: { doctorId, startDate, endDate }, signal }) as Promise<Appointment[]>,
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getAppointmentCountsByStatusOptions = (clinicId: string) =>
	queryOptions({
		queryKey: appointmentKeys.counts(clinicId),
		queryFn: ({ signal }) => getAppointmentCountsByStatus({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const validateAppointmentOptions = (appointmentId: string) =>
	queryOptions({
		queryKey: appointmentKeys.validate(appointmentId),
		queryFn: ({ signal }) => validateAppointment({ data: { appointmentId }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5, // 5 minutes
		retry: 1
	});
