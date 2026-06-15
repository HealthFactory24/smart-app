// stores/index.ts
import { Store } from "@tanstack/store";

import type {
	DbAppointment,
	DbClinic,
	DbDevelopmentalMilestones,
	DbDoctor,
	DbFeedingLog,
	DbGrowthRecord,
	DbImmunization,
	DbLabTest,
	DbNeonatalAssessment,
	DbNotification,
	DbPatient,
	DbPayment,
	DbPrescription,
	DbService,
	DbStaff,
	DatabaseUser as DbUser,
	DbVaccineSchedule,
	DbVitalSign
} from "@/db/schema/types";

// ============================================================================
// Auth Store
// ============================================================================

interface AuthState {
	user: DbUser | null;
	isLoading: boolean;
	error: string | null;
	isAuthenticated: boolean;
	sessionToken: string | null;
}

export const authStore = new Store<AuthState>({
	user: null,
	isLoading: false,
	error: null,
	isAuthenticated: false,
	sessionToken: null
});

export const authActions = {
	setUser: (user: DbUser | null) => {
		authStore.setState(prev => ({
			...prev,
			user,
			isAuthenticated: !!user
		}));
	},
	setLoading: (isLoading: boolean) => {
		authStore.setState(state => ({ ...state, isLoading }));
	},
	setError: (error: string | null) => {
		authStore.setState(state => ({ ...state, error }));
	},
	logout: () => {
		authStore.setState(() => ({
			user: null,
			isLoading: false,
			error: null,
			isAuthenticated: false,
			sessionToken: null
		}));
	}
};

// ============================================================================
// Clinic Store
// ============================================================================

interface ClinicState {
	currentClinic: DbClinic | null;
	clinics: DbClinic[];
	isLoading: boolean;
	error: string | null;
}

export const clinicStore = new Store<ClinicState>({
	currentClinic: null,
	clinics: [],
	isLoading: false,
	error: null
});

export const clinicActions = {
	setCurrentClinic: (clinic: DbClinic | null) => {
		clinicStore.setState(state => ({ ...state, currentClinic: clinic }));
	},
	setClinics: (clinics: DbClinic[]) => {
		clinicStore.setState(state => ({ ...state, clinics }));
	},
	addClinic: (clinic: DbClinic) => {
		clinicStore.setState(state => ({
			...state,
			clinics: [...state.clinics, clinic]
		}));
	},
	updateClinic: (id: string, updates: Partial<DbClinic>) => {
		clinicStore.setState(state => ({
			...state,
			clinics: state.clinics.map(c => (c.id === id ? { ...c, ...updates } : c)),
			currentClinic: state.currentClinic?.id === id ? { ...state.currentClinic, ...updates } : state.currentClinic
		}));
	},
	setLoading: (isLoading: boolean) => {
		clinicStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Patient Store
// ============================================================================

interface PatientState {
	patients: DbPatient[];
	currentPatient: DbPatient | null;
	isLoading: boolean;
	error: string | null;
	totalCount: number;
	filters: {
		search: string;
		status: string | null;
		dateRange: { start: Date | null; end: Date | null } | null;
	};
}

export const patientStore = new Store<PatientState>({
	patients: [],
	currentPatient: null,
	isLoading: false,
	error: null,
	totalCount: 0,
	filters: {
		search: "",
		status: null,
		dateRange: null
	}
});

export const patientActions = {
	setPatients: (patients: DbPatient[], totalCount?: number) => {
		patientStore.setState(state => ({
			...state,
			patients,
			totalCount: totalCount ?? state.totalCount
		}));
	},
	setCurrentPatient: (patient: DbPatient | null) => {
		patientStore.setState(state => ({ ...state, currentPatient: patient }));
	},
	addPatient: (patient: DbPatient) => {
		patientStore.setState(state => ({
			...state,
			patients: [patient, ...state.patients],
			totalCount: state.totalCount + 1
		}));
	},
	updatePatient: (id: string, updates: Partial<DbPatient>) => {
		patientStore.setState(state => ({
			...state,
			patients: state.patients.map(p => (p.id === id ? { ...p, ...updates } : p)),
			currentPatient:
				state.currentPatient?.id === id ? { ...state.currentPatient, ...updates } : state.currentPatient
		}));
	},
	deletePatient: (id: string) => {
		patientStore.setState(state => ({
			...state,
			patients: state.patients.filter(p => p.id !== id),
			totalCount: state.totalCount - 1,
			currentPatient: state.currentPatient?.id === id ? null : state.currentPatient
		}));
	},
	setFilters: (filters: Partial<PatientState["filters"]>) => {
		patientStore.setState(state => ({
			...state,
			filters: { ...state.filters, ...filters }
		}));
	},
	setLoading: (isLoading: boolean) => {
		patientStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Appointment Store
// ============================================================================

interface AppointmentState {
	appointments: DbAppointment[];
	currentAppointment: DbAppointment | null;
	isLoading: boolean;
	error: string | null;
	selectedDate: Date | null;
	viewMode: "day" | "week" | "month";
}

export const appointmentStore = new Store<AppointmentState>({
	appointments: [],
	currentAppointment: null,
	isLoading: false,
	error: null,
	selectedDate: new Date(),
	viewMode: "day"
});

export const appointmentActions = {
	setAppointments: (appointments: DbAppointment[]) => {
		appointmentStore.setState(state => ({ ...state, appointments }));
	},
	setCurrentAppointment: (appointment: DbAppointment | null) => {
		appointmentStore.setState(state => ({ ...state, currentAppointment: appointment }));
	},
	addAppointment: (appointment: DbAppointment) => {
		appointmentStore.setState(state => ({
			...state,
			appointments: [...state.appointments, appointment]
		}));
	},
	updateAppointment: (id: string, updates: Partial<DbAppointment>) => {
		appointmentStore.setState(state => ({
			...state,
			appointments: state.appointments.map(a => (a.id === id ? { ...a, ...updates } : a)),
			currentAppointment:
				state.currentAppointment?.id === id
					? { ...state.currentAppointment, ...updates }
					: state.currentAppointment
		}));
	},
	deleteAppointment: (id: string) => {
		appointmentStore.setState(state => ({
			...state,
			appointments: state.appointments.filter(a => a.id !== id),
			currentAppointment: state.currentAppointment?.id === id ? null : state.currentAppointment
		}));
	},
	setSelectedDate: (date: Date | null) => {
		appointmentStore.setState(state => ({ ...state, selectedDate: date }));
	},
	setViewMode: (viewMode: "day" | "week" | "month") => {
		appointmentStore.setState(state => ({ ...state, viewMode }));
	},
	setLoading: (isLoading: boolean) => {
		appointmentStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Doctor Store
// ============================================================================

interface DoctorState {
	doctors: DbDoctor[];
	currentDoctor: DbDoctor | null;
	isLoading: boolean;
	error: string | null;
	specialties: string[];
}

export const doctorStore = new Store<DoctorState>({
	doctors: [],
	currentDoctor: null,
	isLoading: false,
	error: null,
	specialties: []
});

export const doctorActions = {
	setDoctors: (doctors: DbDoctor[]) => {
		doctorStore.setState(state => ({ ...state, doctors }));
	},
	setCurrentDoctor: (doctor: DbDoctor | null) => {
		doctorStore.setState(state => ({ ...state, currentDoctor: doctor }));
	},
	addDoctor: (doctor: DbDoctor) => {
		doctorStore.setState(state => ({
			...state,
			doctors: [...state.doctors, doctor]
		}));
	},
	updateDoctor: (id: string, updates: Partial<DbDoctor>) => {
		doctorStore.setState(state => ({
			...state,
			doctors: state.doctors.map(d => (d.id === id ? { ...d, ...updates } : d)),
			currentDoctor: state.currentDoctor?.id === id ? { ...state.currentDoctor, ...updates } : state.currentDoctor
		}));
	},
	setSpecialties: (specialties: string[]) => {
		doctorStore.setState(state => ({ ...state, specialties }));
	},
	setLoading: (isLoading: boolean) => {
		doctorStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Staff Store
// ============================================================================

interface StaffState {
	staff: DbStaff[];
	currentStaff: DbStaff | null;
	isLoading: boolean;
	error: string | null;
}

export const staffStore = new Store<StaffState>({
	staff: [],
	currentStaff: null,
	isLoading: false,
	error: null
});

export const staffActions = {
	setStaff: (staff: DbStaff[]) => {
		staffStore.setState(state => ({ ...state, staff }));
	},
	setCurrentStaff: (staff: DbStaff | null) => {
		staffStore.setState(state => ({ ...state, currentStaff: staff }));
	},
	addStaff: (staff: DbStaff) => {
		staffStore.setState(state => ({
			...state,
			staff: [...state.staff, staff]
		}));
	},
	updateStaff: (id: string, updates: Partial<DbStaff>) => {
		staffStore.setState(state => ({
			...state,
			staff: state.staff.map(s => (s.id === id ? { ...s, ...updates } : s)),
			currentStaff: state.currentStaff?.id === id ? { ...state.currentStaff, ...updates } : state.currentStaff
		}));
	},
	deleteStaff: (id: string) => {
		staffStore.setState(state => ({
			...state,
			staff: state.staff.filter(s => s.id !== id),
			currentStaff: state.currentStaff?.id === id ? null : state.currentStaff
		}));
	},
	setLoading: (isLoading: boolean) => {
		staffStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Notification Store
// ============================================================================

interface NotificationState {
	notifications: DbNotification[];
	unreadCount: number;
	isLoading: boolean;
	error: string | null;
}

export const notificationStore = new Store<NotificationState>({
	notifications: [],
	unreadCount: 0,
	isLoading: false,
	error: null
});

export const notificationActions = {
	setNotifications: (notifications: DbNotification[]) => {
		const unreadCount = notifications.filter(n => n.status === "unread").length;
		notificationStore.setState(state => ({
			...state,
			notifications,
			unreadCount
		}));
	},
	addNotification: (notification: DbNotification) => {
		notificationStore.setState(state => ({
			...state,
			notifications: [notification, ...state.notifications],
			unreadCount: notification.status === "unread" ? state.unreadCount + 1 : state.unreadCount
		}));
	},
	markAsRead: (id: string) => {
		notificationStore.setState(state => {
			const updated = state.notifications.map(n =>
				n.id === id && n.status === "unread" ? { ...n, status: "read" as const } : n
			);
			const newUnreadCount = updated.filter(n => n.status === "unread").length;
			return { ...state, notifications: updated, unreadCount: newUnreadCount };
		});
	},
	markAllAsRead: () => {
		notificationStore.setState(state => ({
			...state,
			notifications: state.notifications.map(n => ({ ...n, status: "read" as const })),
			unreadCount: 0
		}));
	},
	setLoading: (isLoading: boolean) => {
		notificationStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Pediatric Store - Growth Records
// ============================================================================

interface GrowthRecordState {
	records: DbGrowthRecord[];
	currentRecord: DbGrowthRecord | null;
	isLoading: boolean;
	error: string | null;
	chartData: { date: Date; weight: number; height: number; bmi: number }[];
}

export const growthRecordStore = new Store<GrowthRecordState>({
	records: [],
	currentRecord: null,
	isLoading: false,
	error: null,
	chartData: []
});

export const growthRecordActions = {
	setRecords: (records: DbGrowthRecord[]) => {
		const chartData = records.map(r => ({
			date: r.date,
			weight: r.weight ?? 0,
			height: r.height ?? 0,
			bmi: r.bmi ?? 0
		}));
		growthRecordStore.setState(state => ({
			...state,
			records,
			chartData
		}));
	},
	addRecord: (record: DbGrowthRecord) => {
		growthRecordStore.setState(state => ({
			...state,
			records: [...state.records, record],
			chartData: [
				...state.chartData,
				{ date: record.date, weight: record.weight ?? 0, height: record.height ?? 0, bmi: record.bmi ?? 0 }
			]
		}));
	},
	setCurrentRecord: (record: DbGrowthRecord | null) => {
		growthRecordStore.setState(state => ({ ...state, currentRecord: record }));
	},
	setLoading: (isLoading: boolean) => {
		growthRecordStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Pediatric Store - Immunizations
// ============================================================================

interface ImmunizationState {
	immunizations: DbImmunization[];
	upcomingVaccines: DbImmunization[];
	isLoading: boolean;
	error: string | null;
}

export const immunizationStore = new Store<ImmunizationState>({
	immunizations: [],
	upcomingVaccines: [],
	isLoading: false,
	error: null
});

export const immunizationActions = {
	setImmunizations: (immunizations: DbImmunization[]) => {
		const upcoming = immunizations.filter(i => i.status === "PENDING" || i.isOverDue);
		immunizationStore.setState(state => ({
			...state,
			immunizations,
			upcomingVaccines: upcoming
		}));
	},
	addImmunization: (immunization: DbImmunization) => {
		immunizationStore.setState(state => ({
			...state,
			immunizations: [...state.immunizations, immunization],
			upcomingVaccines:
				immunization.status === "PENDING" || immunization.isOverDue
					? [...state.upcomingVaccines, immunization]
					: state.upcomingVaccines
		}));
	},
	updateImmunization: (id: string, updates: Partial<DbImmunization>) => {
		immunizationStore.setState(state => ({
			...state,
			immunizations: state.immunizations.map(i => (i.id === id ? { ...i, ...updates } : i)),
			upcomingVaccines: state.upcomingVaccines.filter(i => i.id !== id)
		}));
	},
	setLoading: (isLoading: boolean) => {
		immunizationStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Pediatric Store - Feeding Logs
// ============================================================================

interface FeedingLogState {
	logs: DbFeedingLog[];
	currentLog: DbFeedingLog | null;
	isLoading: boolean;
	error: string | null;
	stats: {
		totalFeedings: number;
		byType: Record<string, number>;
		averageDuration: number;
		totalAmount: number;
	} | null;
}

export const feedingLogStore = new Store<FeedingLogState>({
	logs: [],
	currentLog: null,
	isLoading: false,
	error: null,
	stats: null
});

export const feedingLogActions = {
	setLogs: (logs: DbFeedingLog[]) => {
		const byType: Record<string, number> = {};
		let totalDuration = 0;
		let totalAmount = 0;

		logs.forEach(log => {
			byType[log.type] = (byType[log.type] || 0) + 1;
			totalDuration += log.duration ?? 0;
			totalAmount += log.amount ?? 0;
		});

		const stats = {
			totalFeedings: logs.length,
			byType,
			averageDuration: logs.length ? totalDuration / logs.length : 0,
			totalAmount
		};

		feedingLogStore.setState(state => ({ ...state, logs, stats }));
	},
	addLog: (log: DbFeedingLog) => {
		feedingLogStore.setState(state => ({
			...state,
			logs: [...state.logs, log]
		}));
		feedingLogActions.setLogs([...feedingLogStore.state.logs, log]);
	},
	setCurrentLog: (log: DbFeedingLog | null) => {
		feedingLogStore.setState(state => ({ ...state, currentLog: log }));
	},
	setLoading: (isLoading: boolean) => {
		feedingLogStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Pediatric Store - Developmental Milestones
// ============================================================================

interface MilestonesState {
	milestones: DbDevelopmentalMilestones[];
	isLoading: boolean;
	error: string | null;
	byAgeGroup: Record<string, DbDevelopmentalMilestones[]>;
}

export const milestonesStore = new Store<MilestonesState>({
	milestones: [],
	isLoading: false,
	error: null,
	byAgeGroup: {}
});

export const milestoneActions = {
	setMilestones: (milestones: DbDevelopmentalMilestones[]) => {
		const byAgeGroup: Record<string, DbDevelopmentalMilestones[]> = {};
		milestones.forEach(m => {
			const age = m.dateRecorded.getFullYear();
			if (!byAgeGroup[age]) byAgeGroup[age] = [];
			byAgeGroup[age].push(m);
		});
		milestonesStore.setState(state => ({ ...state, milestones, byAgeGroup }));
	},
	addMilestone: (milestone: DbDevelopmentalMilestones) => {
		milestonesStore.setState(state => ({
			...state,
			milestones: [...state.milestones, milestone]
		}));
		milestoneActions.setMilestones([...milestonesStore.state.milestones, milestone]);
	},
	setLoading: (isLoading: boolean) => {
		milestonesStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Pediatric Store - Vaccine Schedule
// ============================================================================

interface VaccineScheduleState {
	schedules: DbVaccineSchedule[];
	isLoading: boolean;
	error: string | null;
	mandatoryVaccines: DbVaccineSchedule[];
}

export const vaccineScheduleStore = new Store<VaccineScheduleState>({
	schedules: [],
	isLoading: false,
	error: null,
	mandatoryVaccines: []
});

export const vaccineScheduleActions = {
	setSchedules: (schedules: DbVaccineSchedule[]) => {
		const mandatory = schedules.filter(s => s.isMandatory);
		vaccineScheduleStore.setState(state => ({
			...state,
			schedules,
			mandatoryVaccines: mandatory
		}));
	},
	setLoading: (isLoading: boolean) => {
		vaccineScheduleStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Pediatric Store - Neonatal Assessment
// ============================================================================

interface NeonatalState {
	assessments: DbNeonatalAssessment[];
	currentAssessment: DbNeonatalAssessment | null;
	isLoading: boolean;
	error: string | null;
}

export const neonatalStore = new Store<NeonatalState>({
	assessments: [],
	currentAssessment: null,
	isLoading: false,
	error: null
});

export const neonatalActions = {
	setAssessments: (assessments: DbNeonatalAssessment[]) => {
		neonatalStore.setState(state => ({ ...state, assessments }));
	},
	addAssessment: (assessment: DbNeonatalAssessment) => {
		neonatalStore.setState(state => ({
			...state,
			assessments: [...state.assessments, assessment]
		}));
	},
	setCurrentAssessment: (assessment: DbNeonatalAssessment | null) => {
		neonatalStore.setState(state => ({ ...state, currentAssessment: assessment }));
	},
	setLoading: (isLoading: boolean) => {
		neonatalStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Prescription Store
// ============================================================================

interface PrescriptionState {
	prescriptions: DbPrescription[];
	currentPrescription: DbPrescription | null;
	isLoading: boolean;
	error: string | null;
	activePrescriptions: DbPrescription[];
}

export const prescriptionStore = new Store<PrescriptionState>({
	prescriptions: [],
	currentPrescription: null,
	isLoading: false,
	error: null,
	activePrescriptions: []
});

export const prescriptionActions = {
	setPrescriptions: (prescriptions: DbPrescription[]) => {
		const active = prescriptions.filter(p => p.status === "active" || p.status === "on_hold");
		prescriptionStore.setState(state => ({
			...state,
			prescriptions,
			activePrescriptions: active
		}));
	},
	setCurrentPrescription: (prescription: DbPrescription | null) => {
		prescriptionStore.setState(state => ({ ...state, currentPrescription: prescription }));
	},
	addPrescription: (prescription: DbPrescription) => {
		prescriptionStore.setState(state => ({
			...state,
			prescriptions: [...state.prescriptions, prescription],
			activePrescriptions:
				prescription.status === "active" || prescription.status === "on_hold"
					? [...state.activePrescriptions, prescription]
					: state.activePrescriptions
		}));
	},
	updatePrescription: (id: string, updates: Partial<DbPrescription>) => {
		prescriptionStore.setState(state => ({
			...state,
			prescriptions: state.prescriptions.map(p => (p.id === id ? { ...p, ...updates } : p)),
			activePrescriptions: state.activePrescriptions.filter(p => p.id !== id),
			currentPrescription:
				state.currentPrescription?.id === id
					? { ...state.currentPrescription, ...updates }
					: state.currentPrescription
		}));
	},
	setLoading: (isLoading: boolean) => {
		prescriptionStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Vital Signs Store
// ============================================================================

interface VitalSignsState {
	vitals: DbVitalSign[];
	currentVitals: DbVitalSign | null;
	isLoading: boolean;
	error: string | null;
	trends: {
		systolic: number[];
		diastolic: number[];
		heartRate: number[];
		recordedAt: Date[];
	} | null;
}

export const vitalSignsStore = new Store<VitalSignsState>({
	vitals: [],
	currentVitals: null,
	isLoading: false,
	error: null,
	trends: null
});

export const vitalSignsActions = {
	setVitals: (vitals: DbVitalSign[]) => {
		const sorted = [...vitals].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
		const trends = {
			systolic: sorted.map(v => v.systolic ?? 0),
			diastolic: sorted.map(v => v.diastolic ?? 0),
			heartRate: sorted.map(v => v.heartRate ?? 0),
			recordedAt: sorted.map(v => v.recordedAt)
		};
		vitalSignsStore.setState(state => ({ ...state, vitals: sorted, trends }));
	},
	addVitals: (vitals: DbVitalSign) => {
		vitalSignsStore.setState(state => ({
			...state,
			vitals: [...state.vitals, vitals]
		}));
		vitalSignsActions.setVitals([...vitalSignsStore.state.vitals, vitals]);
	},
	setCurrentVitals: (vitals: DbVitalSign | null) => {
		vitalSignsStore.setState(state => ({ ...state, currentVitals: vitals }));
	},
	setLoading: (isLoading: boolean) => {
		vitalSignsStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Service Store
// ============================================================================

interface ServiceState {
	services: DbService[];
	isLoading: boolean;
	error: string | null;
	categories: string[];
}

export const serviceStore = new Store<ServiceState>({
	services: [],
	isLoading: false,
	error: null,
	categories: []
});

export const serviceActions = {
	setServices: (services: DbService[]) => {
		const categories = [...new Set(services.map(s => s.category).filter(Boolean))] as string[];
		serviceStore.setState(state => ({
			...state,
			services,
			categories
		}));
	},
	addService: (service: DbService) => {
		serviceStore.setState(state => ({
			...state,
			services: [...state.services, service]
		}));
		serviceActions.setServices([...serviceStore.state.services, service]);
	},
	updateService: (id: string, updates: Partial<DbService>) => {
		serviceStore.setState(state => ({
			...state,
			services: state.services.map(s => (s.id === id ? { ...s, ...updates } : s))
		}));
	},
	deleteService: (id: string) => {
		serviceStore.setState(state => ({
			...state,
			services: state.services.filter(s => s.id !== id)
		}));
	},
	setLoading: (isLoading: boolean) => {
		serviceStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Payment Store
// ============================================================================

interface PaymentState {
	payments: DbPayment[];
	currentPayment: DbPayment | null;
	isLoading: boolean;
	error: string | null;
	totalRevenue: number;
	pendingAmount: number;
}

export const paymentStore = new Store<PaymentState>({
	payments: [],
	currentPayment: null,
	isLoading: false,
	error: null,
	totalRevenue: 0,
	pendingAmount: 0
});

export const paymentActions = {
	setPayments: (payments: DbPayment[]) => {
		const totalRevenue = payments
			.filter(p => p.status === "PAID")
			.reduce((sum, p) => sum + (p.amountPaid ?? p.amount ?? 0), 0);
		const pendingAmount = payments
			.filter(p => p.status === "PENDING" || p.status === "PARTIAL")
			.reduce((sum, p) => sum + ((p.totalAmount ?? p.amount ?? 0) - (p.amountPaid ?? 0)), 0);
		paymentStore.setState(state => ({
			...state,
			payments,
			totalRevenue,
			pendingAmount
		}));
	},
	addPayment: (payment: DbPayment) => {
		paymentStore.setState(state => ({
			...state,
			payments: [...state.payments, payment]
		}));
		paymentActions.setPayments([...paymentStore.state.payments, payment]);
	},
	setCurrentPayment: (payment: DbPayment | null) => {
		paymentStore.setState(state => ({ ...state, currentPayment: payment }));
	},
	setLoading: (isLoading: boolean) => {
		paymentStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// Lab Test Store
// ============================================================================

interface LabTestState {
	labTests: DbLabTest[];
	currentLabTest: DbLabTest | null;
	isLoading: boolean;
	error: string | null;
	pendingTests: DbLabTest[];
}

export const labTestStore = new Store<LabTestState>({
	labTests: [],
	currentLabTest: null,
	isLoading: false,
	error: null,
	pendingTests: []
});

export const labTestActions = {
	setLabTests: (labTests: DbLabTest[]) => {
		const pending = labTests.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS");
		labTestStore.setState(state => ({
			...state,
			labTests,
			pendingTests: pending
		}));
	},
	addLabTest: (labTest: DbLabTest) => {
		labTestStore.setState(state => ({
			...state,
			labTests: [...state.labTests, labTest],
			pendingTests:
				labTest.status === "PENDING" || labTest.status === "IN_PROGRESS"
					? [...state.pendingTests, labTest]
					: state.pendingTests
		}));
	},
	updateLabTest: (id: string, updates: Partial<DbLabTest>) => {
		labTestStore.setState(state => ({
			...state,
			labTests: state.labTests.map(t => (t.id === id ? { ...t, ...updates } : t)),
			pendingTests: state.pendingTests.filter(t => t.id !== id)
		}));
	},
	setCurrentLabTest: (labTest: DbLabTest | null) => {
		labTestStore.setState(state => ({ ...state, currentLabTest: labTest }));
	},
	setLoading: (isLoading: boolean) => {
		labTestStore.setState(state => ({ ...state, isLoading }));
	}
};

// ============================================================================
// UI Store (for global UI state)
// ============================================================================

interface UIState {
	sidebarOpen: boolean;
	theme: "light" | "dark" | "system";
	notificationsEnabled: boolean;
	currentModule: "dashboard" | "patients" | "appointments" | "prescriptions" | "pediatrics" | "billing" | "reports";
	loadingOverlay: boolean;
	toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" | "warning" }>;
}

export const uiStore = new Store<UIState>({
	sidebarOpen: true,
	theme: "system",
	notificationsEnabled: true,
	currentModule: "dashboard",
	loadingOverlay: false,
	toasts: []
});

export const uiActions = {
	toggleSidebar: () => {
		uiStore.setState(state => ({ ...state, sidebarOpen: !state.sidebarOpen }));
	},
	setTheme: (theme: UIState["theme"]) => {
		uiStore.setState(state => ({ ...state, theme }));
	},
	setCurrentModule: (module: UIState["currentModule"]) => {
		uiStore.setState(state => ({ ...state, currentModule: module }));
	},
	setLoadingOverlay: (loading: boolean) => {
		uiStore.setState(state => ({ ...state, loadingOverlay: loading }));
	},
	addToast: (toast: { message: string; type: UIState["toasts"][number]["type"] }) => {
		const id = Date.now().toString();
		uiStore.setState(state => ({
			...state,
			toasts: [...state.toasts, { id, message: toast.message, type: toast.type }]
		}));
		setTimeout(() => {
			uiStore.setState(state => ({
				...state,
				toasts: state.toasts.filter(t => t.id !== id)
			}));
		}, 5000);
	},
	removeToast: (id: string) => {
		uiStore.setState(state => ({
			...state,
			toasts: state.toasts.filter(t => t.id !== id)
		}));
	}
};

// ============================================================================
// Example derived store (full name pattern)
// ============================================================================

export const demoStore = new Store({
	firstName: "Jane",
	lastName: "Smith"
});

export const fullName = new Store(`${demoStore.state.firstName} ${demoStore.state.lastName}`);

demoStore.subscribe(() => {
	fullName.setState(() => `${demoStore.state.firstName} ${demoStore.state.lastName}`);
});

// ============================================================================
// Consolidated Exports
// ============================================================================

export const stores = {
	auth: authStore,
	clinic: clinicStore,
	patient: patientStore,
	appointment: appointmentStore,
	doctor: doctorStore,
	staff: staffStore,
	notification: notificationStore,
	growthRecord: growthRecordStore,
	immunization: immunizationStore,
	feedingLog: feedingLogStore,
	milestones: milestonesStore,
	vaccineSchedule: vaccineScheduleStore,
	neonatal: neonatalStore,
	prescription: prescriptionStore,
	vitalSigns: vitalSignsStore,
	service: serviceStore,
	payment: paymentStore,
	labTest: labTestStore,
	ui: uiStore
};

export const actions = {
	auth: authActions,
	clinic: clinicActions,
	patient: patientActions,
	appointment: appointmentActions,
	doctor: doctorActions,
	staff: staffActions,
	notification: notificationActions,
	growthRecord: growthRecordActions,
	immunization: immunizationActions,
	feedingLog: feedingLogActions,
	milestones: milestoneActions,
	vaccineSchedule: vaccineScheduleActions,
	neonatal: neonatalActions,
	prescription: prescriptionActions,
	vitalSigns: vitalSignsActions,
	service: serviceActions,
	payment: paymentActions,
	labTest: labTestActions,
	ui: uiActions
};
