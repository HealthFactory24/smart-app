import { queryOptions } from "@tanstack/react-query";

import {
	checkDoctorAccess,
	checkDrugStock,
	getDoseGuidelines,
	getDrugsByIds,
	getPatientActivePrescriptions,
	getPatientAllergies,
	getPrescribedItem,
	getPrescribedItemsByPrescriptionId,
	getPrescriptionById,
	getPrescriptionsByDateRange,
	getPrescriptionsForAnalytics,
	getPrescriptionWithItems,
	listDrugs
} from "../pharmacy";

export const pharmacyKeys = {
	all: ["pharmacy"] as const,

	// Prescription keys
	prescriptions: ["prescriptions"] as const,
	prescription: (id: string) => [...pharmacyKeys.prescriptions, id] as const,
	prescriptionWithItems: (id: string, clinicId?: string) =>
		[...pharmacyKeys.prescriptions, "withItems", id, clinicId] as const,
	patientActivePrescriptions: (patientId: string, clinicId?: string, includeExpired?: boolean) =>
		[...pharmacyKeys.prescriptions, "active", patientId, clinicId, includeExpired] as const,
	prescriptionsByDateRange: (patientId: string, startDate: Date, endDate: Date) =>
		[...pharmacyKeys.prescriptions, "dateRange", patientId, startDate, endDate] as const,
	prescriptionsForAnalytics: (clinicId: string, startDate: Date, endDate: Date) =>
		[...pharmacyKeys.prescriptions, "analytics", clinicId, startDate, endDate] as const,

	// Prescribed Item keys
	prescribedItems: ["prescribedItems"] as const,
	prescribedItem: (id: string) => [...pharmacyKeys.prescribedItems, id] as const,
	prescribedItemsByPrescription: (prescriptionId: string) =>
		[...pharmacyKeys.prescribedItems, "byPrescription", prescriptionId] as const,

	// Drug keys
	drugs: ["drugs"] as const,
	drug: (id: string) => [...pharmacyKeys.drugs, id] as const,
	drugsByIds: (ids: string[], clinicId?: string) => [...pharmacyKeys.drugs, "byIds", ids.sort(), clinicId] as const,
	drugList: (filters: { search?: string; category?: string; limit?: number; offset?: number }) =>
		[...pharmacyKeys.drugs, "list", filters] as const,
	drugStock: (clinicId: string, threshold?: number) => [...pharmacyKeys.drugs, "stock", clinicId, threshold] as const,

	// Dose Guideline keys
	doseGuidelines: ["doseGuidelines"] as const,
	doseGuidelinesByDrugs: (drugIds: string[]) => [...pharmacyKeys.doseGuidelines, "byDrugs", drugIds.sort()] as const,

	// Patient keys
	patientAllergies: (patientId: string) => ["patient", patientId, "allergies"] as const,

	// Access keys
	doctorAccess: (doctorId: string, userId: string, clinicId?: string) =>
		["access", "doctor", doctorId, userId, clinicId] as const
};

// =======================
// Prescription Query Options
// =======================

export const getPrescriptionByIdOptions = (id: string) =>
	queryOptions({
		queryKey: pharmacyKeys.prescription(id),
		queryFn: ({ signal }) => getPrescriptionById({ data: { id }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientActivePrescriptionsOptions = (patientId: string, clinicId?: string, includeExpired = false) =>
	queryOptions({
		queryKey: pharmacyKeys.patientActivePrescriptions(patientId, clinicId, includeExpired),
		queryFn: ({ signal }) =>
			getPatientActivePrescriptions({ data: { patientId, clinicId, includeExpired }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getPrescriptionWithItemsOptions = (id: string, clinicId?: string) =>
	queryOptions({
		queryKey: pharmacyKeys.prescriptionWithItems(id, clinicId),
		queryFn: ({ signal }) => getPrescriptionWithItems({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPrescriptionsByDateRangeOptions = (patientId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: pharmacyKeys.prescriptionsByDateRange(patientId, startDate, endDate),
		queryFn: ({ signal }) => getPrescriptionsByDateRange({ data: { patientId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getPrescriptionsForAnalyticsOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: pharmacyKeys.prescriptionsForAnalytics(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getPrescriptionsForAnalytics({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

// =======================
// Prescribed Item Query Options
// =======================

export const getPrescribedItemOptions = (id: string) =>
	queryOptions({
		queryKey: pharmacyKeys.prescribedItem(id),
		queryFn: ({ signal }) => getPrescribedItem({ data: { id }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPrescribedItemsByPrescriptionIdOptions = (prescriptionId: string) =>
	queryOptions({
		queryKey: pharmacyKeys.prescribedItemsByPrescription(prescriptionId),
		queryFn: ({ signal }) => getPrescribedItemsByPrescriptionId({ data: { prescriptionId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// =======================
// Drug Query Options
// =======================

export const getDrugsByIdsOptions = (ids: string[], clinicId?: string) =>
	queryOptions({
		queryKey: pharmacyKeys.drugsByIds(ids, clinicId),
		queryFn: ({ signal }) => getDrugsByIds({ data: { ids, clinicId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		enabled: ids.length > 0
	});

export const listDrugsOptions = (filters: { search?: string; category?: string; limit?: number; offset?: number }) =>
	queryOptions({
		queryKey: pharmacyKeys.drugList(filters),
		queryFn: ({ signal }) => listDrugs({ data: filters, signal }),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const searchDrugsOptions = (searchTerm: string, limit = 20) =>
	queryOptions({
		queryKey: pharmacyKeys.drugList({ search: searchTerm, limit }),
		queryFn: ({ signal }) => listDrugs({ data: { search: searchTerm, limit, offset: 0 }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5, // 5 minutes
		enabled: searchTerm.length >= 2
	});

export const checkDrugStockOptions = (clinicId: string, threshold = 10) =>
	queryOptions({
		queryKey: pharmacyKeys.drugStock(clinicId, threshold),
		queryFn: ({ signal }) => checkDrugStock({ data: { clinicId, threshold }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// =======================
// Dose Guideline Query Options
// =======================

export const getDoseGuidelinesOptions = (drugIds: string[]) =>
	queryOptions({
		queryKey: pharmacyKeys.doseGuidelinesByDrugs(drugIds),
		queryFn: ({ signal }) => getDoseGuidelines({ data: { drugIds }, signal }),
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 120, // 2 hours
		enabled: drugIds.length > 0
	});

// =======================
// Patient Query Options
// =======================

export const getPatientAllergiesOptions = (patientId: string) =>
	queryOptions({
		queryKey: pharmacyKeys.patientAllergies(patientId),
		queryFn: ({ signal }) => getPatientAllergies({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 // 1 hour
	});

// =======================
// Access Query Options
// =======================

export const checkDoctorAccessOptions = (doctorId: string, userId: string, clinicId?: string) =>
	queryOptions({
		queryKey: pharmacyKeys.doctorAccess(doctorId, userId, clinicId),
		queryFn: ({ signal }) => checkDoctorAccess({ data: { doctorId, userId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});
