import { queryOptions } from "@tanstack/react-query";

import {
  getImmunizationCoverage,
  getNewPatientsCount,
  getPatientDemographics,
  getSeasonalAppointmentData,
  getTopConditions
} from "../analytics";

export const analyticsKeys = {
	all: ["analytics"] as const,
	newPatients: (clinicId: string, startDate: Date, endDate: Date) =>
		[...analyticsKeys.all, "newPatients", clinicId, startDate, endDate] as const,
	demographics: (clinicId: string, startDate: Date, endDate: Date) =>
		[...analyticsKeys.all, "demographics", clinicId, startDate, endDate] as const,
	topConditions: (clinicId: string, startDate: Date, endDate: Date, limit: number) =>
		[...analyticsKeys.all, "topConditions", clinicId, startDate, endDate, limit] as const,
	seasonalAppointments: (clinicId: string, year: number) =>
		[...analyticsKeys.all, "seasonal", clinicId, year] as const,
	immunizationCoverage: (clinicId: string) => [...analyticsKeys.all, "immunizationCoverage", clinicId] as const
};

export const getNewPatientsCountOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: analyticsKeys.newPatients(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getNewPatientsCount({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getPatientDemographicsOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: analyticsKeys.demographics(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getPatientDemographics({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 120 // 2 hours
	});

export const getTopConditionsOptions = (clinicId: string, startDate: Date, endDate: Date, limit = 10) =>
	queryOptions({
		queryKey: analyticsKeys.topConditions(clinicId, startDate, endDate, limit),
		queryFn: ({ signal }) => getTopConditions({ data: { clinicId, startDate, endDate, limit }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

export const getSeasonalAppointmentDataOptions = (clinicId: string, year: number) =>
	queryOptions({
		queryKey: analyticsKeys.seasonalAppointments(clinicId, year),
		queryFn: ({ signal }) => getSeasonalAppointmentData({ data: { clinicId, year }, signal }),
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 120 // 2 hours
	});

export const getImmunizationCoverageOptions = (clinicId: string) =>
	queryOptions({
		queryKey: analyticsKeys.immunizationCoverage(clinicId),
		queryFn: ({ signal }) => getImmunizationCoverage({ data: { clinicId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});
