// hooks/index.ts
// Generated hooks for all clinic management models

import {
	type UseMutationOptions as UseMutationOptionsOriginal,
	type UseQueryOptions,
	useMutation,
	useQuery,
	useQueryClient
} from "@tanstack/react-query";

type UseMutationOptions<
	TData = unknown,
	TError = Error,
	TVariables = unknown,
	TContext = unknown
> = UseMutationOptionsOriginal<TData, TError, TVariables, TContext>;

// ============================================================================
// Auth Hooks
// ============================================================================

import { ensureSession, getSession } from "@/lib/auth.functions";

export const authKeys = {
	all: ["auth"] as const,
	session: () => [...authKeys.all, "session"] as const
};

export function useSession(options?: UseQueryOptions) {
	return useQuery({
		queryKey: authKeys.session(),
		queryFn: () => getSession(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		...options
	});
}

export function useEnsureSession(options?: UseQueryOptions) {
	return useQuery({
		queryKey: [...authKeys.session(), "ensure"],
		queryFn: () => ensureSession(),
		staleTime: 1000 * 60 * 2,
		...options
	});
}

// ============================================================================
// Appointment Hooks
// ============================================================================

import {
	cancelAppointment,
	createAppointment,
	getAllAppointments,
	getAppointmentById,
	getAppointmentsCount,
	getAvailableTimeSlots,
	getMyAppointments,
	updateAppointmentStatus
} from "@/data/appointments";

export const appointmentKeys = {
	all: ["appointments"] as const,
	lists: () => [...appointmentKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...appointmentKeys.lists(), filters] as const,
	details: () => [...appointmentKeys.all, "detail"] as const,
	detail: (id: string) => [...appointmentKeys.details(), id] as const,
	my: () => [...appointmentKeys.all, "my"] as const,
	count: () => [...appointmentKeys.all, "count"] as const,
	timeSlots: (doctorId: string, date: Date) => [...appointmentKeys.all, "timeSlots", doctorId, date] as const
};

export function useAllAppointments(options?: UseQueryOptions) {
	return useQuery({
		queryKey: appointmentKeys.lists(),
		queryFn: () => getAllAppointments(),
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useMyAppointments(options?: UseQueryOptions) {
	return useQuery({
		queryKey: appointmentKeys.my(),
		queryFn: () => getMyAppointments(),
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useAppointmentById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: appointmentKeys.detail(id),
		queryFn: () => getAppointmentById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useAppointmentsCount(options?: UseQueryOptions) {
	return useQuery({
		queryKey: appointmentKeys.count(),
		queryFn: () => getAppointmentsCount(),
		staleTime: 1000 * 60,
		refetchInterval: 60000,
		...options
	});
}

export function useAvailableTimeSlots(doctorId: string, date: Date, options?: UseQueryOptions) {
	return useQuery({
		queryKey: appointmentKeys.timeSlots(doctorId, date),
		queryFn: () => getAvailableTimeSlots({ data: { doctorId, date } }),
		enabled: !!doctorId && !!date,
		staleTime: 1000 * 30,
		...options
	});
}

export function useCreateAppointment(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createAppointment>[0]) => createAppointment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
			queryClient.invalidateQueries({ queryKey: appointmentKeys.count() });
			queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
		},
		...options
	});
}

export function useUpdateAppointmentStatus(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateAppointmentStatus>[0]) => updateAppointmentStatus(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
		},
		...options
	});
}

export function useCancelAppointment(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof cancelAppointment>[0]) => cancelAppointment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
		},
		...options
	});
}

// ============================================================================
// Patient Hooks
// ============================================================================

import {
	createPatient,
	deletePatient,
	getAllPatients,
	getMyChildren,
	getPatientById,
	searchPatients,
	updatePatient
} from "@/data/patients";

export const patientKeys = {
	all: ["patients"] as const,
	lists: () => [...patientKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...patientKeys.lists(), filters] as const,
	details: () => [...patientKeys.all, "detail"] as const,
	detail: (id: string) => [...patientKeys.details(), id] as const,
	myChildren: () => [...patientKeys.all, "myChildren"] as const,
	search: (term: string) => [...patientKeys.all, "search", term] as const
};

export function useAllPatients(options?: UseQueryOptions) {
	return useQuery({
		queryKey: patientKeys.lists(),
		queryFn: () => getAllPatients(),
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useMyChildren(options?: UseQueryOptions) {
	return useQuery({
		queryKey: patientKeys.myChildren(),
		queryFn: () => getMyChildren(),
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function usePatientById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: patientKeys.detail(id),
		queryFn: () => getPatientById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useSearchPatients(options?: UseMutationOptions) {
	return useMutation({
		mutationFn: (searchTerm: string) => searchPatients({ data: { searchTerm } }),
		...options
	});
}

export function useCreatePatient(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createPatient>[0]) => createPatient(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.all });
		},
		...options
	});
}

export function useUpdatePatient(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updatePatient>[0]) => updatePatient(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.data.id) });
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
		...options
	});
}

export function useDeletePatient(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deletePatient>[0]) => deletePatient(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.all });
		},
		...options
	});
}

// ============================================================================
// Doctor Hooks
// ============================================================================

import {
	createDoctor,
	deleteDoctor,
	getAllDoctors,
	getAvailableDoctors,
	getDoctorById,
	getDoctorsBySpecialty,
	updateDoctor
} from "@/data/doctors";

export const doctorKeys = {
	all: ["doctors"] as const,
	lists: () => [...doctorKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...doctorKeys.lists(), filters] as const,
	details: () => [...doctorKeys.all, "detail"] as const,
	detail: (id: string) => [...doctorKeys.details(), id] as const,
	available: () => [...doctorKeys.all, "available"] as const,
	bySpecialty: (specialty: string) => [...doctorKeys.all, "specialty", specialty] as const
};

export function useAllDoctors(options?: UseQueryOptions) {
	return useQuery({
		queryKey: doctorKeys.lists(),
		queryFn: () => getAllDoctors(),
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useDoctorById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: doctorKeys.detail(id),
		queryFn: () => getDoctorById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useAvailableDoctors(options?: UseQueryOptions) {
	return useQuery({
		queryKey: doctorKeys.available(),
		queryFn: () => getAvailableDoctors(),
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useDoctorsBySpecialty(specialty: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: doctorKeys.bySpecialty(specialty),
		queryFn: () => getDoctorsBySpecialty({ data: { specialty } }),
		enabled: !!specialty,
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useCreateDoctor(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createDoctor>[0]) => createDoctor(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: doctorKeys.all });
		},
		...options
	});
}

export function useUpdateDoctor(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateDoctor>[0]) => updateDoctor(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: doctorKeys.detail(variables.data.id) });
			queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
		},
		...options
	});
}

export function useDeleteDoctor(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteDoctor>[0]) => deleteDoctor(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: doctorKeys.all });
		},
		...options
	});
}

// ============================================================================
// Service Hooks
// ============================================================================

import {
	createService,
	deleteService,
	getAllServices,
	getAvailableServices,
	getServiceById,
	updateService
} from "@/data/services";

export const serviceKeys = {
	all: ["services"] as const,
	lists: () => [...serviceKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...serviceKeys.lists(), filters] as const,
	details: () => [...serviceKeys.all, "detail"] as const,
	detail: (id: string) => [...serviceKeys.details(), id] as const,
	available: () => [...serviceKeys.all, "available"] as const
};

export function useAllServices(options?: UseQueryOptions) {
	return useQuery({
		queryKey: serviceKeys.lists(),
		queryFn: () => getAllServices(),
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useAvailableServices(options?: UseQueryOptions) {
	return useQuery({
		queryKey: serviceKeys.available(),
		queryFn: () => getAvailableServices(),
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useServiceById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: serviceKeys.detail(id),
		queryFn: () => getServiceById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useCreateService(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createService>[0]) => createService(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		...options
	});
}

export function useUpdateService(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateService>[0]) => updateService(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.data.id) });
			queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
		},
		...options
	});
}

export function useDeleteService(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteService>[0]) => deleteService(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		...options
	});
}

// ============================================================================
// Product Hooks
// ============================================================================

import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getProductById,
	getRecommendedProducts,
	updateProduct
} from "@/data/products";

export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
	details: () => [...productKeys.all, "detail"] as const,
	detail: (id: string) => [...productKeys.details(), id] as const,
	recommended: () => [...productKeys.all, "recommended"] as const
};

export function useAllProducts(options?: UseQueryOptions) {
	return useQuery({
		queryKey: productKeys.lists(),
		queryFn: () => getAllProducts(),
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useProductById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: productKeys.detail(id),
		queryFn: () => getProductById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useRecommendedProducts(options?: UseQueryOptions) {
	return useQuery({
		queryKey: productKeys.recommended(),
		queryFn: () => getRecommendedProducts(),
		staleTime: 1000 * 60 * 30,
		...options
	});
}

export function useCreateProduct(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createProduct>[0]) => createProduct(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.all });
		},
		...options
	});
}

export function useUpdateProduct(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateProduct>[0]) => updateProduct(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.data.id) });
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
		},
		...options
	});
}

export function useDeleteProduct(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteProduct>[0]) => deleteProduct(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.all });
		},
		...options
	});
}

// ============================================================================
// Cart Hooks
// ============================================================================

import {
	addToCart,
	clearCart,
	fetchCartItems,
	getCartItemsCount,
	removeFromCart,
	updateCartQuantity
} from "@/data/cart";

export const cartKeys = {
	all: ["cart"] as const,
	items: () => [...cartKeys.all, "items"] as const,
	count: () => [...cartKeys.all, "count"] as const
};

export function useCartItems(options?: UseQueryOptions) {
	return useQuery({
		queryKey: cartKeys.items(),
		queryFn: () => fetchCartItems(),
		staleTime: 1000 * 30,
		...options
	});
}

export function useCartCount(options?: UseQueryOptions) {
	return useQuery({
		queryKey: cartKeys.count(),
		queryFn: () => getCartItemsCount(),
		staleTime: 1000 * 30,
		...options
	});
}

export function useAddToCart(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof addToCart>[0]) => addToCart(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cartKeys.items() });
			queryClient.invalidateQueries({ queryKey: cartKeys.count() });
		},
		...options
	});
}

export function useRemoveFromCart(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof removeFromCart>[0]) => removeFromCart(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cartKeys.items() });
			queryClient.invalidateQueries({ queryKey: cartKeys.count() });
		},
		...options
	});
}

export function useUpdateCartQuantity(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateCartQuantity>[0]) => updateCartQuantity(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cartKeys.items() });
			queryClient.invalidateQueries({ queryKey: cartKeys.count() });
		},
		...options
	});
}

export function useClearCart(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => clearCart(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cartKeys.items() });
			queryClient.invalidateQueries({ queryKey: cartKeys.count() });
		},
		...options
	});
}

// ============================================================================
// Order Hooks
// ============================================================================

import { getAllOrders, getOrderById, getOrdersByUser, updateOrderStatus } from "@/data/orders";

export const orderKeys = {
	all: ["orders"] as const,
	lists: () => [...orderKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
	details: () => [...orderKeys.all, "detail"] as const,
	detail: (id: string) => [...orderKeys.details(), id] as const,
	my: () => [...orderKeys.all, "my"] as const,
	admin: () => [...orderKeys.all, "admin"] as const
};

export function useMyOrders(options?: UseQueryOptions) {
	return useQuery({
		queryKey: orderKeys.my(),
		queryFn: () => getOrdersByUser(),
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useOrderById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: orderKeys.detail(id),
		queryFn: () => getOrderById({ data: { orderId: id } }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useAllOrders(options?: UseQueryOptions) {
	return useQuery({
		queryKey: orderKeys.admin(),
		queryFn: () => getAllOrders(),
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useUpdateOrderStatus(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateOrderStatus>[0]) => updateOrderStatus(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orderKeys.all });
		},
		...options
	});
}

// ============================================================================
// Medical Record Hooks
// ============================================================================

import {
	createMedicalRecord,
	deleteMedicalRecord,
	getMedicalRecordById,
	getPatientMedicalRecords,
	updateMedicalRecord
} from "@/data/medical-records";

export const medicalRecordKeys = {
	all: ["medicalRecords"] as const,
	lists: () => [...medicalRecordKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...medicalRecordKeys.lists(), filters] as const,
	details: () => [...medicalRecordKeys.all, "detail"] as const,
	detail: (id: string) => [...medicalRecordKeys.details(), id] as const,
	byPatient: (patientId: string) => [...medicalRecordKeys.all, "patient", patientId] as const
};

export function usePatientMedicalRecords(
	patientId: string,
	limit?: number,
	offset?: number,
	options?: UseQueryOptions
) {
	return useQuery({
		queryKey: medicalRecordKeys.byPatient(patientId),
		queryFn: () => getPatientMedicalRecords({ data: { patientId, limit, offset } }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useMedicalRecordById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: medicalRecordKeys.detail(id),
		queryFn: () => getMedicalRecordById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useCreateMedicalRecord(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createMedicalRecord>[0]) => createMedicalRecord(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: medicalRecordKeys.byPatient(variables.data.patientId) });
		},
		...options
	});
}

export function useUpdateMedicalRecord(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateMedicalRecord>[0]) => updateMedicalRecord(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: medicalRecordKeys.detail(variables.data.id) });
		},
		...options
	});
}

export function useDeleteMedicalRecord(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteMedicalRecord>[0]) => deleteMedicalRecord(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: medicalRecordKeys.all });
		},
		...options
	});
}

// ============================================================================
// Diagnosis/Encounter Hooks
// ============================================================================

import {
	completeEncounter,
	createEncounter,
	deleteEncounter,
	getEncounterById,
	getPatientEncounters,
	updateEncounter
} from "@/data/diagnosis";

export const diagnosisKeys = {
	all: ["diagnoses"] as const,
	lists: () => [...diagnosisKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...diagnosisKeys.lists(), filters] as const,
	details: () => [...diagnosisKeys.all, "detail"] as const,
	detail: (id: string) => [...diagnosisKeys.details(), id] as const,
	byPatient: (patientId: string) => [...diagnosisKeys.all, "patient", patientId] as const
};

export function usePatientEncounters(patientId: string, limit?: number, offset?: number, options?: UseQueryOptions) {
	return useQuery({
		queryKey: diagnosisKeys.byPatient(patientId),
		queryFn: () => getPatientEncounters({ data: { patientId, limit, offset } }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useEncounterById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: diagnosisKeys.detail(id),
		queryFn: () => getEncounterById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useCreateEncounter(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createEncounter>[0]) => createEncounter(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: diagnosisKeys.byPatient(variables.data.patientId) });
		},
		...options
	});
}

export function useUpdateEncounter(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateEncounter>[0]) => updateEncounter(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: diagnosisKeys.detail(variables.data.id) });
		},
		...options
	});
}

export function useCompleteEncounter(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof completeEncounter>[0]) => completeEncounter(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: diagnosisKeys.detail(variables.data.id) });
		},
		...options
	});
}

export function useDeleteEncounter(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteEncounter>[0]) => deleteEncounter(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: diagnosisKeys.all });
		},
		...options
	});
}

// ============================================================================
// Growth Record Hooks
// ============================================================================

import {
	createGrowthRecord,
	deleteGrowthRecord,
	getGrowthChartData,
	getGrowthRecordById,
	getGrowthVelocity,
	getPatientGrowthRecords,
	updateGrowthRecord
} from "@/data/growthRecord";

export const growthRecordKeys = {
	all: ["growthRecords"] as const,
	lists: () => [...growthRecordKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...growthRecordKeys.lists(), filters] as const,
	details: () => [...growthRecordKeys.all, "detail"] as const,
	detail: (id: string) => [...growthRecordKeys.details(), id] as const,
	byPatient: (patientId: string) => [...growthRecordKeys.all, "patient", patientId] as const,
	chart: (patientId: string, measurementType: string) =>
		[...growthRecordKeys.all, "chart", patientId, measurementType] as const,
	velocity: (patientId: string) => [...growthRecordKeys.all, "velocity", patientId] as const
};

export function usePatientGrowthRecords(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: growthRecordKeys.byPatient(patientId),
		queryFn: () => getPatientGrowthRecords({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useGrowthRecordById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: growthRecordKeys.detail(id),
		queryFn: () => getGrowthRecordById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useGrowthChartData(
	patientId: string,
	measurementType: "WEIGHT" | "HEIGHT" | "BMI" | "HEAD_CIRCUMFERENCE",
	options?: UseQueryOptions
) {
	return useQuery({
		queryKey: growthRecordKeys.chart(patientId, measurementType),
		queryFn: () => getGrowthChartData({ data: { patientId, measurementType } }),
		enabled: !!patientId && !!measurementType,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useGrowthVelocity(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: growthRecordKeys.velocity(patientId),
		queryFn: () => getGrowthVelocity({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useCreateGrowthRecord(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createGrowthRecord>[0]) => createGrowthRecord(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: growthRecordKeys.byPatient(variables.data.patientId) });
		},
		...options
	});
}

export function useUpdateGrowthRecord(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateGrowthRecord>[0]) => updateGrowthRecord(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: growthRecordKeys.detail(variables.data.id) });
		},
		...options
	});
}

export function useDeleteGrowthRecord(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteGrowthRecord>[0]) => deleteGrowthRecord(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: growthRecordKeys.all });
		},
		...options
	});
}

// ============================================================================
// Immunization Hooks
// ============================================================================

import {
	deleteImmunization,
	getImmunizationCertificate,
	getImmunizationScheduleByAge,
	getPatientImmunizations,
	getUpcomingImmunizations,
	recordImmunization,
	updateImmunization
} from "@/data/immunization";

export const immunizationKeys = {
	all: ["immunizations"] as const,
	lists: () => [...immunizationKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...immunizationKeys.lists(), filters] as const,
	details: () => [...immunizationKeys.all, "detail"] as const,
	detail: (id: string) => [...immunizationKeys.details(), id] as const,
	byPatient: (patientId: string) => [...immunizationKeys.all, "patient", patientId] as const,
	upcoming: (patientId: string) => [...immunizationKeys.all, "upcoming", patientId] as const,
	schedule: (ageInDays: number) => [...immunizationKeys.all, "schedule", ageInDays] as const,
	certificate: (patientId: string) => [...immunizationKeys.all, "certificate", patientId] as const
};

export function usePatientImmunizations(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: immunizationKeys.byPatient(patientId),
		queryFn: () => getPatientImmunizations({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function useUpcomingImmunizations(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: immunizationKeys.upcoming(patientId),
		queryFn: () => getUpcomingImmunizations({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useImmunizationScheduleByAge(ageInDays: number, options?: UseQueryOptions) {
	return useQuery({
		queryKey: immunizationKeys.schedule(ageInDays),
		queryFn: () => getImmunizationScheduleByAge({ data: { ageInDays } }),
		enabled: ageInDays > 0,
		staleTime: 1000 * 60 * 60,
		...options
	});
}

export function useImmunizationCertificate(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: immunizationKeys.certificate(patientId),
		queryFn: () => getImmunizationCertificate({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 30,
		...options
	});
}

export function useRecordImmunization(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof recordImmunization>[0]) => recordImmunization(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: immunizationKeys.byPatient(variables.data.patientId) });
			queryClient.invalidateQueries({ queryKey: immunizationKeys.upcoming(variables.data.patientId) });
		},
		...options
	});
}

export function useUpdateImmunization(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateImmunization>[0]) => updateImmunization(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: immunizationKeys.all });
		},
		...options
	});
}

export function useDeleteImmunization(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deleteImmunization>[0]) => deleteImmunization(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: immunizationKeys.all });
		},
		...options
	});
}

// ============================================================================
// Payment Hooks
// ============================================================================

import {
	createPayment,
	deletePayment,
	getPatientPayments,
	getPaymentById,
	getPaymentSummary,
	processPayment,
	updatePaymentStatus
} from "@/data/payment";

export const paymentKeys = {
	all: ["payments"] as const,
	lists: () => [...paymentKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...paymentKeys.lists(), filters] as const,
	details: () => [...paymentKeys.all, "detail"] as const,
	detail: (id: string) => [...paymentKeys.details(), id] as const,
	byPatient: (patientId: string) => [...paymentKeys.all, "patient", patientId] as const,
	summary: () => [...paymentKeys.all, "summary"] as const
};

export function usePatientPayments(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: paymentKeys.byPatient(patientId),
		queryFn: () => getPatientPayments({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function usePaymentById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: paymentKeys.detail(id),
		queryFn: () => getPaymentById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function usePaymentSummary(startDate?: Date, endDate?: Date, options?: UseQueryOptions) {
	return useQuery({
		queryKey: paymentKeys.summary(),
		queryFn: () => getPaymentSummary({ data: { startDate, endDate } }),
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useCreatePayment(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createPayment>[0]) => createPayment(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.byPatient(variables.data.patientId??"") });
			queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
		},
		...options
	});
}

export function useUpdatePaymentStatus(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updatePaymentStatus>[0]) => updatePaymentStatus(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.all });
		},
		...options
	});
}

export function useProcessPayment(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof processPayment>[0]) => processPayment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.all });
		},
		...options
	});
}

export function useDeletePayment(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deletePayment>[0]) => deletePayment(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: paymentKeys.all });
		},
		...options
	});
}

// ============================================================================
// Prescription Hooks
// ============================================================================

import {
	createPrescription,
	deletePrescription,
	getPrescriptionById,
	getPrescriptionsByPatient,
	updatePrescriptionStatus
} from "@/data/prescriptions";

export const prescriptionKeys = {
	all: ["prescriptions"] as const,
	lists: () => [...prescriptionKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...prescriptionKeys.lists(), filters] as const,
	details: () => [...prescriptionKeys.all, "detail"] as const,
	detail: (id: string) => [...prescriptionKeys.details(), id] as const,
	byPatient: (patientId: string) => [...prescriptionKeys.all, "patient", patientId] as const
};

export function usePatientPrescriptions(patientId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: prescriptionKeys.byPatient(patientId),
		queryFn: () => getPrescriptionsByPatient({ data: patientId }),
		enabled: !!patientId,
		staleTime: 1000 * 60 * 2,
		...options
	});
}

export function usePrescriptionById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: prescriptionKeys.detail(id),
		queryFn: () => getPrescriptionById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useCreatePrescription(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createPrescription>[0]) => createPrescription(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: prescriptionKeys.byPatient(variables.data.patientId) });
		},
		...options
	});
}

export function useUpdatePrescriptionStatus(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updatePrescriptionStatus>[0]) => updatePrescriptionStatus(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });
		},
		...options
	});
}

export function useDeletePrescription(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof deletePrescription>[0]) => deletePrescription(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: prescriptionKeys.all });
		},
		...options
	});
}

// ============================================================================
// Clinic Hooks
// ============================================================================

import {
	addClinicMember,
	createClinic,
	getClinicById,
	getClinicMembers,
	getCurrentClinic,
	removeClinicMember,
	updateClinic
} from "@/data/clinic";

export const clinicKeys = {
	all: ["clinics"] as const,
	lists: () => [...clinicKeys.all, "list"] as const,
	list: (filters: Record<string, unknown>) => [...clinicKeys.lists(), filters] as const,
	details: () => [...clinicKeys.all, "detail"] as const,
	detail: (id: string) => [...clinicKeys.details(), id] as const,
	current: () => [...clinicKeys.all, "current"] as const,
	members: (clinicId: string) => [...clinicKeys.all, "members", clinicId] as const
};

export function useCurrentClinic(options?: UseQueryOptions) {
	return useQuery({
		queryKey: clinicKeys.current(),
		queryFn: () => getCurrentClinic(),
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useClinicById(id: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: clinicKeys.detail(id),
		queryFn: () => getClinicById({ data: id }),
		enabled: !!id,
		staleTime: 1000 * 60 * 10,
		...options
	});
}

export function useClinicMembers(clinicId: string, options?: UseQueryOptions) {
	return useQuery({
		queryKey: clinicKeys.members(clinicId),
		queryFn: () => getClinicMembers({ data: clinicId }),
		enabled: !!clinicId,
		staleTime: 1000 * 60 * 5,
		...options
	});
}

export function useCreateClinic(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof createClinic>[0]) => createClinic(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clinicKeys.all });
		},
		...options
	});
}

export function useUpdateClinic(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof updateClinic>[0]) => updateClinic(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clinicKeys.all });
		},
		...options
	});
}

export function useAddClinicMember(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof addClinicMember>[0]) => addClinicMember(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: clinicKeys.members(variables.data.clinicId) });
		},
		...options
	});
}

export function useRemoveClinicMember(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof removeClinicMember>[0]) => removeClinicMember(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: clinicKeys.members(variables.data.clinicId) });
		},
		...options
	});
}

// ============================================================================
// Checkout Hooks
// ============================================================================

import { confirmOrder, createCheckoutSession } from "@/data/checkout";

export const checkoutKeys = {
	all: ["checkout"] as const,
	session: () => [...checkoutKeys.all, "session"] as const,
	confirm: (sessionId: string) => [...checkoutKeys.all, "confirm", sessionId] as const
};

export function useCreateCheckoutSession(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => createCheckoutSession(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cartKeys.items() });
			queryClient.invalidateQueries({ queryKey: cartKeys.count() });
		},
		...options
	});
}

export function useConfirmOrder(options?: UseMutationOptions) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Parameters<typeof confirmOrder>[0]) => confirmOrder(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orderKeys.my() });
		},
		...options
	});
}
