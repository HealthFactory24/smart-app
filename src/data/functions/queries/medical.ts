// queries/medical.ts
import { type QueryClient, queryOptions } from "@tanstack/react-query";

import type { PaymentStatus } from "@/db/schema";
import {
    checkVitalSignsAccess,
    countMedicalRecord,
    getClinicRevenue,
    getDiagnosesByMedicalRecordId,
    getEncounterById,
    getLatestVitalSigns,
    getMedicalRecordById,
    getPatientEncounters,
    getPatientMedicalRecords,
    getPaymentById,
    getPaymentsByAppointmentId,
    getPaymentsByPatientId,
    getTimeLeftForAppointment,
    getTrendData,
    getVitalSignById,
    getVitalSigns,
    getVitalSignsByMedicalRecordId,
    listMedicalRecord,
    listPayments,
    listVitalSignsByPatient
} from "../medical";

// =======================
// Query Keys
// =======================

export const medicalKeys = {
	all: ["medical"] as const,

	// Medical Record keys
	medicalRecords: ["medicalRecords"] as const,
	medicalRecordCount: (clinicId: string, patientId?: string, doctorId?: string) =>
		[...medicalKeys.medicalRecords, "count", clinicId, patientId, doctorId] as const,
	medicalRecordList: (filters: {
		clinicId: string;
		patientId?: string;
		doctorId?: string;
		limit?: number;
		offset?: number;
	}) => [...medicalKeys.medicalRecords, "list", filters] as const,
	medicalRecordDetail: (recordId: string, clinicId: string) =>
		[...medicalKeys.medicalRecords, "detail", recordId, clinicId] as const,
	patientMedicalRecords: (patientId: string, clinicId: string, limit?: number, offset?: number) =>
		[...medicalKeys.medicalRecords, "patient", patientId, clinicId, limit, offset] as const,

	// Diagnosis/Encounter keys
	encounters: ["encounters"] as const,
	encounterDetail: (id: string, clinicId: string) => [...medicalKeys.encounters, "detail", id, clinicId] as const,
	patientEncounters: (patientId: string, clinicId: string) =>
		[...medicalKeys.encounters, "patient", patientId, clinicId] as const,
	diagnosesByMedicalRecord: (medicalId: string) => [...medicalKeys.encounters, "byMedicalRecord", medicalId] as const,

	// Vital Signs keys
	vitalSigns: ["vitalSigns"] as const,
	vitalSignsList: (filters: {
		patientId: string;
		clinicId: string;
		fromDate?: Date;
		toDate?: Date;
		page?: number;
		pageSize?: number;
		encounterId?: string;
	}) => [...medicalKeys.vitalSigns, "list", filters] as const,
	vitalSignsByPatient: (
		patientId: string,
		clinicId: string,
		fromDate: Date,
		toDate: Date,
		page?: number,
		pageSize?: number
	) => [...medicalKeys.vitalSigns, "byPatient", patientId, clinicId, fromDate, toDate, page, pageSize] as const,
	vitalSignDetail: (id: string, clinicId: string) => [...medicalKeys.vitalSigns, "detail", id, clinicId] as const,
	latestVitalSigns: (patientId: string, clinicId: string) =>
		[...medicalKeys.vitalSigns, "latest", patientId, clinicId] as const,
	vitalSignsByMedicalRecord: (medicalId: string) =>
		[...medicalKeys.vitalSigns, "byMedicalRecord", medicalId] as const,

	// Trend Data keys
	trendData: (patientId: string, clinicId: string, days: number) =>
		[...medicalKeys.all, "trendData", patientId, clinicId, days] as const,

	// Access Control keys
	vitalSignsAccess: (userId: string, patientId: string) =>
		[...medicalKeys.all, "access", "vitalSigns", userId, patientId] as const,

	// Payment keys
	payments: ["payments"] as const,
	paymentDetail: (id: string) => [...medicalKeys.payments, "detail", id] as const,
	paymentsByPatient: (patientId: string) => [...medicalKeys.payments, "byPatient", patientId] as const,
	paymentsByAppointment: (appointmentId: string) =>
		[...medicalKeys.payments, "byAppointment", appointmentId] as const,
	paymentsList: (filters: {
		clinicId: string;
		startDate?: Date;
		endDate?: Date;
		status?: PaymentStatus;
		limit: number;
		offset: number;
	}) => [...medicalKeys.payments, "list", filters] as const,
	clinicRevenue: (clinicId: string, startDate: Date, endDate: Date) =>
		[...medicalKeys.payments, "revenue", clinicId, startDate, endDate] as const,
	timeLeftForAppointment: (appointmentId: string) => [...medicalKeys.all, "timeLeft", appointmentId] as const,

	// Patient Bill keys
	patientBills: ["patientBills"] as const,

	// Complex Operations keys
	completeEncounter: (medicalRecordId: string) => [...medicalKeys.all, "completeEncounter", medicalRecordId] as const,
	createCompleteEncounter: ["createCompleteEncounter"] as const
};

// =======================
// Medical Record Query Options
// =======================

export const countMedicalRecordOptions = (clinicId: string, patientId?: string, doctorId?: string) =>
	queryOptions({
		queryKey: medicalKeys.medicalRecordCount(clinicId, patientId, doctorId),
		queryFn: ({ signal }) => countMedicalRecord({ data: { clinicId, patientId, doctorId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const listMedicalRecordOptions = (filters: {
	clinicId: string;
	patientId?: string;
	doctorId?: string;
	limit?: number;
	offset?: number;
}) =>
	queryOptions({
		queryKey: medicalKeys.medicalRecordList(filters),
		queryFn: ({ signal }) => listMedicalRecord({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getMedicalRecordByIdOptions = (recordId: string, clinicId: string) =>
	queryOptions({
		queryKey: medicalKeys.medicalRecordDetail(recordId, clinicId),
		queryFn: ({ signal }) => getMedicalRecordById({ data: { recordId, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientMedicalRecordsOptions = (patientId: string, clinicId: string, limit?: number, offset?: number) =>
	queryOptions({
		queryKey: medicalKeys.patientMedicalRecords(patientId, clinicId, limit, offset),
		queryFn: ({ signal }) => getPatientMedicalRecords({ data: { patientId, clinicId, limit, offset }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

// =======================
// Diagnosis/Encounter Query Options
// =======================

export const getEncounterByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: medicalKeys.encounterDetail(id, clinicId),
		queryFn: ({ signal }) => getEncounterById({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPatientEncountersOptions = (patientId: string, clinicId: string) =>
	queryOptions({
		queryKey: medicalKeys.patientEncounters(patientId, clinicId),
		queryFn: ({ signal }) => getPatientEncounters({ data: { patientId, clinicId }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getDiagnosesByMedicalRecordIdOptions = (medicalId: string) =>
	queryOptions({
		queryKey: medicalKeys.diagnosesByMedicalRecord(medicalId),
		queryFn: ({ signal }) => getDiagnosesByMedicalRecordId({ data: { medicalId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// =======================
// Vital Signs Query Options
// =======================

export const listVitalSignsByPatientOptions = (
	patientId: string,
	clinicId: string,
	fromDate: Date,
	toDate: Date,
	page = 1,
	pageSize = 50
) =>
	queryOptions({
		queryKey: medicalKeys.vitalSignsByPatient(patientId, clinicId, fromDate, toDate, page, pageSize),
		queryFn: ({ signal }) =>
			listVitalSignsByPatient({ data: { patientId, clinicId, fromDate, toDate, page, pageSize }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getVitalSignsOptions = (filters: {
	patientId: string;
	clinicId: string;
	limit?: number;
	page?: number;
	pageSize?: number;
	fromDate?: Date;
	toDate?: Date;
	encounterId?: string;
}) =>
	queryOptions({
		queryKey: medicalKeys.vitalSignsList(filters),
		queryFn: ({ signal }) => getVitalSigns({ data: filters, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getLatestVitalSignsOptions = (patientId: string, clinicId: string) =>
	queryOptions({
		queryKey: medicalKeys.latestVitalSigns(patientId, clinicId),
		queryFn: ({ signal }) => getLatestVitalSigns({ data: { patientId, clinicId }, signal }),
		staleTime: 1000 * 60 * 1, // 1 minute
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getVitalSignByIdOptions = (id: string, clinicId: string) =>
	queryOptions({
		queryKey: medicalKeys.vitalSignDetail(id, clinicId),
		queryFn: ({ signal }) => getVitalSignById({ data: { id, clinicId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getVitalSignsByMedicalRecordIdOptions = (medicalId: string) =>
	queryOptions({
		queryKey: medicalKeys.vitalSignsByMedicalRecord(medicalId),
		queryFn: ({ signal }) => getVitalSignsByMedicalRecordId({ data: { medicalId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// =======================
// Trend Data Query Options
// =======================

export const getTrendDataOptions = (patientId: string, clinicId: string, days = 30) =>
	queryOptions({
		queryKey: medicalKeys.trendData(patientId, clinicId, days),
		queryFn: ({ signal }) => getTrendData({ data: { patientId, clinicId, days }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 15 // 15 minutes
	});

// =======================
// Access Control Query Options
// =======================

export const checkVitalSignsAccessOptions = (userId: string, patientId: string) =>
	queryOptions({
		queryKey: medicalKeys.vitalSignsAccess(userId, patientId),
		queryFn: ({ signal }) => checkVitalSignsAccess({ data: { userId, patientId }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

// =======================
// Payment Query Options
// =======================

export const getPaymentByIdOptions = (id: string) =>
	queryOptions({
		queryKey: medicalKeys.paymentDetail(id),
		queryFn: ({ signal }) => getPaymentById({ data: { id }, signal }),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10 // 10 minutes
	});

export const getPaymentsByPatientIdOptions = (patientId: string) =>
	queryOptions({
		queryKey: medicalKeys.paymentsByPatient(patientId),
		queryFn: ({ signal }) => getPaymentsByPatientId({ data: { patientId }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getPaymentsByAppointmentIdOptions = (appointmentId: string) =>
	queryOptions({
		queryKey: medicalKeys.paymentsByAppointment(appointmentId),
		queryFn: ({ signal }) => getPaymentsByAppointmentId({ data: { appointmentId }, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const listPaymentsOptions = (filters: {
	clinicId: string;
	startDate?: Date;
	endDate?: Date;
	status?: PaymentStatus;
	limit: number;
	offset: number;
}) =>
	queryOptions({
		queryKey: medicalKeys.paymentsList(filters),
		queryFn: ({ signal }) => listPayments({ data: filters, signal }),
		staleTime: 1000 * 60 * 2, // 2 minutes
		gcTime: 1000 * 60 * 5 // 5 minutes
	});

export const getClinicRevenueOptions = (clinicId: string, startDate: Date, endDate: Date) =>
	queryOptions({
		queryKey: medicalKeys.clinicRevenue(clinicId, startDate, endDate),
		queryFn: ({ signal }) => getClinicRevenue({ data: { clinicId, startDate, endDate }, signal }),
		staleTime: 1000 * 60 * 15, // 15 minutes
		gcTime: 1000 * 60 * 30 // 30 minutes
	});

export const getTimeLeftForAppointmentOptions = (appointmentId: string) =>
	queryOptions({
		queryKey: medicalKeys.timeLeftForAppointment(appointmentId),
		queryFn: ({ signal }) => getTimeLeftForAppointment({ data: { appointmentId }, signal }),
		staleTime: 1000 * 30, // 30 seconds (time changes frequently)
		gcTime: 1000 * 60 * 2, // 2 minutes
		refetchInterval: 60000 // Refetch every minute to update remaining time
	});

// =======================
// Mutation Query Options (for useQueryClient invalidation)
// =======================

// These are helper keys for invalidating queries after mutations
export const medicalMutationKeys = {
	// Medical Record mutations
	createMedicalRecord: () => ["createMedicalRecord"] as const,
	updateMedicalRecord: () => ["updateMedicalRecord"] as const,
	deleteMedicalRecord: () => ["deleteMedicalRecord"] as const,
	softDeleteMedicalRecord: () => ["softDeleteMedicalRecord"] as const,
	restoreMedicalRecord: () => ["restoreMedicalRecord"] as const,

	// Diagnosis mutations
	createDiagnosis: () => ["createDiagnosis"] as const,
	updateDiagnosis: () => ["updateDiagnosis"] as const,
	deleteDiagnosis: () => ["deleteDiagnosis"] as const,
	softDeleteDiagnosis: () => ["softDeleteDiagnosis"] as const,
	restoreDiagnosis: () => ["restoreDiagnosis"] as const,

	// Vital Sign mutations
	createVitalSign: () => ["createVitalSign"] as const,
	updateVitalSign: () => ["updateVitalSign"] as const,
	deleteVitalSign: () => ["deleteVitalSign"] as const,

	// Payment mutations
	createBillForAppointment: () => ["createBillForAppointment"] as const,
	processPayment: () => ["processPayment"] as const,

	// Patient Bill mutations
	createPatientBill: () => ["createPatientBill"] as const,
	updatePatientBill: () => ["updatePatientBill"] as const,
	deletePatientBill: () => ["deletePatientBill"] as const,

	// Complex Operations mutations
	completeEncounter: () => ["completeEncounter"] as const,
	addVitalSignsToMedicalRecord: () => ["addVitalSignsToMedicalRecord"] as const,
	createCompleteEncounter: () => ["createCompleteEncounter"] as const
};

// Invalidation helper
export const invalidateMedicalQueries = (
	queryClient: QueryClient,
	options?: {
		patientId?: string;
		medicalRecordId?: string;
		appointmentId?: string;
		clinicId?: string;
	}
) => {
	const { patientId, medicalRecordId, appointmentId, clinicId } = options || {};

	// Invalidate all medical records lists
	queryClient.invalidateQueries({ queryKey: medicalKeys.medicalRecords });

	// Invalidate patient-specific queries
	if (patientId) {
		queryClient.invalidateQueries({
			queryKey: medicalKeys.patientMedicalRecords(patientId, clinicId || "")
		});
		queryClient.invalidateQueries({
			queryKey: medicalKeys.patientEncounters(patientId, clinicId || "")
		});
		queryClient.invalidateQueries({
			queryKey: medicalKeys.vitalSignsList({ patientId, clinicId: clinicId || "" })
		});
		queryClient.invalidateQueries({
			queryKey: medicalKeys.latestVitalSigns(patientId, clinicId || "")
		});
		queryClient.invalidateQueries({
			queryKey: medicalKeys.paymentsByPatient(patientId)
		});
	}

	// Invalidate medical record specific queries
	if (medicalRecordId) {
		queryClient.invalidateQueries({
			queryKey: medicalKeys.medicalRecordDetail(medicalRecordId, clinicId || "")
		});
		queryClient.invalidateQueries({
			queryKey: medicalKeys.diagnosesByMedicalRecord(medicalRecordId)
		});
		queryClient.invalidateQueries({
			queryKey: medicalKeys.vitalSignsByMedicalRecord(medicalRecordId)
		});
	}

	// Invalidate appointment payment queries
	if (appointmentId) {
		queryClient.invalidateQueries({
			queryKey: medicalKeys.paymentsByAppointment(appointmentId)
		});
	}

	// Invalidate clinic revenue
	if (clinicId) {
		queryClient.invalidateQueries({
			queryKey: medicalKeys.paymentsList({ clinicId, limit: 0, offset: 0 })
		});
	}
};
