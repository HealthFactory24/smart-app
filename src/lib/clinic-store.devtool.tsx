// clinic-store.devtool.tsx
// TanStack Devtools plugin for clinic stores.
// Usage in __root.tsx: import StoreDevtools from "@/lib/clinic-store.devtool";
// then add StoreDevtools to the plugins array of <TanStackDevtools />.

import { EventClient } from "@tanstack/devtools-event-client";
import { useEffect, useState } from "react";

import {
	appointmentStore,
	authStore,
	clinicStore,
	doctorStore,
	feedingLogStore,
	growthRecordStore,
	immunizationStore,
	milestonesStore,
	neonatalStore,
	notificationStore,
	patientStore,
	prescriptionStore,
	vaccineScheduleStore,
	vitalSignsStore
} from "./clinic.store";

// ============================================================================
// EventMap  (pluginId:eventName  →  payload shape)
// ============================================================================

type EventMap = {
	"clinic-store:auth": {
		isAuthenticated: boolean;
		isLoading: boolean;
		error: string | null;
		userId: string | null;
		userName: string | null;
	};
	"clinic-store:clinic": {
		currentClinicId: string | null;
		currentClinicName: string | null;
		clinicsCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:patient": {
		patientsCount: number;
		currentPatientName: string | null;
		totalCount: number;
		isLoading: boolean;
		error: string | null;
		filterSearch: string;
		filterStatus: string | null;
	};
	"clinic-store:appointment": {
		appointmentsCount: number;
		selectedDate: string | null;
		viewMode: "day" | "week" | "month";
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:doctor": {
		doctorsCount: number;
		currentDoctorName: string | null;
		specialtiesCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:notification": {
		notificationsCount: number;
		unreadCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:growth": {
		recordsCount: number;
		chartDataPoints: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:immunization": {
		immunizationsCount: number;
		upcomingVaccinesCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:feeding": {
		logsCount: number;
		totalFeedings: number;
		averageDuration: number;
		totalAmount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:milestones": {
		milestonesCount: number;
		ageGroupsCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:vaccine-schedule": {
		schedulesCount: number;
		mandatoryCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:neonatal": {
		assessmentsCount: number;
		currentAssessmentId: string | null;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:prescription": {
		prescriptionsCount: number;
		activePrescriptionsCount: number;
		isLoading: boolean;
		error: string | null;
	};
	"clinic-store:vitals": {
		vitalsCount: number;
		hasTrends: boolean;
		isLoading: boolean;
		error: string | null;
	};
};

// ============================================================================
// Event client  (pluginId = "clinic-store")
// ============================================================================

class ClinicStoreEventClient extends EventClient<EventMap> {
	constructor() {
		super({ pluginId: "clinic-store" });
	}
}

const sdec = new ClinicStoreEventClient();

// ============================================================================
// Subscriptions — emit short key ("auth", not "clinic-store:auth")
// ============================================================================

authStore.subscribe(() => {
	const s = authStore.state;
	sdec.emit("clinic-store:auth", {
		isAuthenticated: s.isAuthenticated,
		isLoading: s.isLoading,
		error: s.error,
		userId: s.user?.id ?? null,
		userName: s.user?.name ?? null
	});
});

clinicStore.subscribe(() => {
	const s = clinicStore.state;
	sdec.emit("clinic-store:clinic", {
		currentClinicId: s.currentClinic?.id ?? null,
		currentClinicName: s.currentClinic?.name ?? null,
		clinicsCount: s.clinics.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

patientStore.subscribe(() => {
	const s = patientStore.state;
	sdec.emit("clinic-store:patient", {
		patientsCount: s.patients.length,
		currentPatientName: s.currentPatient ? `${s.currentPatient.firstName} ${s.currentPatient.lastName}` : null,
		totalCount: s.totalCount,
		isLoading: s.isLoading,
		error: s.error,
		filterSearch: s.filters.search,
		filterStatus: s.filters.status
	});
});

appointmentStore.subscribe(() => {
	const s = appointmentStore.state;
	sdec.emit("clinic-store:appointment", {
		appointmentsCount: s.appointments.length,
		selectedDate: s.selectedDate?.toISOString() ?? null,
		viewMode: s.viewMode,
		isLoading: s.isLoading,
		error: s.error
	});
});

doctorStore.subscribe(() => {
	const s = doctorStore.state;
	sdec.emit("clinic-store:doctor", {
		doctorsCount: s.doctors.length,
		currentDoctorName: s.currentDoctor?.name ?? null,
		specialtiesCount: s.specialties.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

notificationStore.subscribe(() => {
	const s = notificationStore.state;
	sdec.emit("clinic-store:notification", {
		notificationsCount: s.notifications.length,
		unreadCount: s.unreadCount,
		isLoading: s.isLoading,
		error: s.error
	});
});

growthRecordStore.subscribe(() => {
	const s = growthRecordStore.state;
	sdec.emit("clinic-store:growth", {
		recordsCount: s.records.length,
		chartDataPoints: s.chartData.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

immunizationStore.subscribe(() => {
	const s = immunizationStore.state;
	sdec.emit("clinic-store:immunization", {
		immunizationsCount: s.immunizations.length,
		upcomingVaccinesCount: s.upcomingVaccines.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

feedingLogStore.subscribe(() => {
	const s = feedingLogStore.state;
	sdec.emit("clinic-store:feeding", {
		logsCount: s.logs.length,
		totalFeedings: s.stats?.totalFeedings ?? 0,
		averageDuration: s.stats?.averageDuration ?? 0,
		totalAmount: s.stats?.totalAmount ?? 0,
		isLoading: s.isLoading,
		error: s.error
	});
});

milestonesStore.subscribe(() => {
	const s = milestonesStore.state;
	sdec.emit("clinic-store:milestones", {
		milestonesCount: s.milestones.length,
		ageGroupsCount: Object.keys(s.byAgeGroup).length,
		isLoading: s.isLoading,
		error: s.error
	});
});

vaccineScheduleStore.subscribe(() => {
	const s = vaccineScheduleStore.state;
	sdec.emit("clinic-store:vaccine-schedule", {
		schedulesCount: s.schedules.length,
		mandatoryCount: s.mandatoryVaccines.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

neonatalStore.subscribe(() => {
	const s = neonatalStore.state;
	sdec.emit("clinic-store:neonatal", {
		assessmentsCount: s.assessments.length,
		currentAssessmentId: s.currentAssessment?.id ?? null,
		isLoading: s.isLoading,
		error: s.error
	});
});

prescriptionStore.subscribe(() => {
	const s = prescriptionStore.state;
	sdec.emit("clinic-store:prescription", {
		prescriptionsCount: s.prescriptions.length,
		activePrescriptionsCount: s.activePrescriptions.length,
		isLoading: s.isLoading,
		error: s.error
	});
});

vitalSignsStore.subscribe(() => {
	const s = vitalSignsStore.state;
	sdec.emit("clinic-store:vitals", {
		vitalsCount: s.vitals.length,
		hasTrends: s.trends !== null,
		isLoading: s.isLoading,
		error: s.error
	});
});

// ============================================================================
// Panel component
// ============================================================================

function DevtoolPanel() {
	const [auth, setAuth] = useState<EventMap["clinic-store:auth"]>(() => {
		const s = authStore.state;
		return {
			isAuthenticated: s.isAuthenticated,
			isLoading: s.isLoading,
			error: s.error,
			userId: s.user?.id ?? null,
			userName: s.user?.name ?? null
		};
	});
	const [clinic, setClinic] = useState<EventMap["clinic-store:clinic"]>(() => {
		const s = clinicStore.state;
		return {
			currentClinicId: s.currentClinic?.id ?? null,
			currentClinicName: s.currentClinic?.name ?? null,
			clinicsCount: s.clinics.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [patient, setPatient] = useState<EventMap["clinic-store:patient"]>(() => {
		const s = patientStore.state;
		return {
			patientsCount: s.patients.length,
			currentPatientName: s.currentPatient ? `${s.currentPatient.firstName} ${s.currentPatient.lastName}` : null,
			totalCount: s.totalCount,
			isLoading: s.isLoading,
			error: s.error,
			filterSearch: s.filters.search,
			filterStatus: s.filters.status
		};
	});
	const [appt, setAppt] = useState<EventMap["clinic-store:appointment"]>(() => {
		const s = appointmentStore.state;
		return {
			appointmentsCount: s.appointments.length,
			selectedDate: s.selectedDate?.toISOString() ?? null,
			viewMode: s.viewMode,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [doctor, setDoctor] = useState<EventMap["clinic-store:doctor"]>(() => {
		const s = doctorStore.state;
		return {
			doctorsCount: s.doctors.length,
			currentDoctorName: s.currentDoctor?.name ?? null,
			specialtiesCount: s.specialties.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [notif, setNotif] = useState<EventMap["clinic-store:notification"]>(() => {
		const s = notificationStore.state;
		return {
			notificationsCount: s.notifications.length,
			unreadCount: s.unreadCount,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [growth, setGrowth] = useState<EventMap["clinic-store:growth"]>(() => {
		const s = growthRecordStore.state;
		return {
			recordsCount: s.records.length,
			chartDataPoints: s.chartData.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [immun, setImmun] = useState<EventMap["clinic-store:immunization"]>(() => {
		const s = immunizationStore.state;
		return {
			immunizationsCount: s.immunizations.length,
			upcomingVaccinesCount: s.upcomingVaccines.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [feed, setFeed] = useState<EventMap["clinic-store:feeding"]>(() => {
		const s = feedingLogStore.state;
		return {
			logsCount: s.logs.length,
			totalFeedings: s.stats?.totalFeedings ?? 0,
			averageDuration: s.stats?.averageDuration ?? 0,
			totalAmount: s.stats?.totalAmount ?? 0,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [miles, setMiles] = useState<EventMap["clinic-store:milestones"]>(() => {
		const s = milestonesStore.state;
		return {
			milestonesCount: s.milestones.length,
			ageGroupsCount: Object.keys(s.byAgeGroup).length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [vacc, setVacc] = useState<EventMap["clinic-store:vaccine-schedule"]>(() => {
		const s = vaccineScheduleStore.state;
		return {
			schedulesCount: s.schedules.length,
			mandatoryCount: s.mandatoryVaccines.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [neon, setNeon] = useState<EventMap["clinic-store:neonatal"]>(() => {
		const s = neonatalStore.state;
		return {
			assessmentsCount: s.assessments.length,
			currentAssessmentId: s.currentAssessment?.id ?? null,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [rx, setRx] = useState<EventMap["clinic-store:prescription"]>(() => {
		const s = prescriptionStore.state;
		return {
			prescriptionsCount: s.prescriptions.length,
			activePrescriptionsCount: s.activePrescriptions.length,
			isLoading: s.isLoading,
			error: s.error
		};
	});
	const [vitals, setVitals] = useState<EventMap["clinic-store:vitals"]>(() => {
		const s = vitalSignsStore.state;
		return { vitalsCount: s.vitals.length, hasTrends: s.trends !== null, isLoading: s.isLoading, error: s.error };
	});

	useEffect(() => {
		const unsubs = [
			sdec.on("clinic-store:auth", e => setAuth(e.payload)),
			sdec.on("clinic-store:clinic", e => setClinic(e.payload)),
			sdec.on("clinic-store:patient", e => setPatient(e.payload)),
			sdec.on("clinic-store:appointment", e => setAppt(e.payload)),
			sdec.on("clinic-store:doctor", e => setDoctor(e.payload)),
			sdec.on("clinic-store:notification", e => setNotif(e.payload)),
			sdec.on("clinic-store:growth", e => setGrowth(e.payload)),
			sdec.on("clinic-store:immunization", e => setImmun(e.payload)),
			sdec.on("clinic-store:feeding", e => setFeed(e.payload)),
			sdec.on("clinic-store:milestones", e => setMiles(e.payload)),
			sdec.on("clinic-store:vaccine-schedule", e => setVacc(e.payload)),
			sdec.on("clinic-store:neonatal", e => setNeon(e.payload)),
			sdec.on("clinic-store:prescription", e => setRx(e.payload)),
			sdec.on("clinic-store:vitals", e => setVitals(e.payload))
		];
		return () =>
			unsubs.forEach(fn => {
				fn();
			});
	}, []);

	const val = (v: string | number | boolean | null | undefined) => (v === null || v === undefined ? "—" : String(v));

	const row = (label: string, value: string | number | boolean | null | undefined) => (
		<>
			<div className='whitespace-nowrap font-bold text-gray-500 text-sm'>{label}</div>
			<div className='text-sm'>{val(value)}</div>
		</>
	);

	return (
		<div className='grid grid-cols-[1fr_10fr] gap-4 p-4 text-sm'>
			{/* Auth */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Auth</div>
			{row("Authenticated", auth.isAuthenticated)}
			{row("User", auth.userName)}
			{row("User ID", auth.userId)}
			{row("Loading", auth.isLoading)}
			{row("Error", auth.error)}

			{/* Clinic */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Clinic</div>
			{row("Current Clinic", clinic.currentClinicName)}
			{row("Clinic ID", clinic.currentClinicId)}
			{row("Total Clinics", clinic.clinicsCount)}
			{row("Loading", clinic.isLoading)}

			{/* Patient */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Patient</div>
			{row("Loaded", patient.patientsCount)}
			{row("Total", patient.totalCount)}
			{row("Current", patient.currentPatientName)}
			{row("Search", patient.filterSearch || "—")}
			{row("Status Filter", patient.filterStatus)}

			{/* Appointment */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Appointment
			</div>
			{row("Count", appt.appointmentsCount)}
			{row("Selected Date", appt.selectedDate)}
			{row("View Mode", appt.viewMode)}

			{/* Doctor */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Doctor</div>
			{row("Count", doctor.doctorsCount)}
			{row("Current", doctor.currentDoctorName)}
			{row("Specialties", doctor.specialtiesCount)}

			{/* Notifications */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Notifications
			</div>
			{row("Total", notif.notificationsCount)}
			{row("Unread", notif.unreadCount)}

			{/* Growth */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Growth Records
			</div>
			{row("Records", growth.recordsCount)}
			{row("Chart Points", growth.chartDataPoints)}

			{/* Immunization */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Immunizations
			</div>
			{row("Total", immun.immunizationsCount)}
			{row("Upcoming", immun.upcomingVaccinesCount)}

			{/* Feeding */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Feeding Logs
			</div>
			{row("Logs", feed.logsCount)}
			{row("Total Feedings", feed.totalFeedings)}
			{row("Avg Duration (min)", feed.averageDuration.toFixed(1))}
			{row("Total Amount (mL)", feed.totalAmount.toFixed(1))}

			{/* Milestones */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Milestones
			</div>
			{row("Count", miles.milestonesCount)}
			{row("Age Groups", miles.ageGroupsCount)}

			{/* Vaccine Schedule */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Vaccine Schedule
			</div>
			{row("Schedules", vacc.schedulesCount)}
			{row("Mandatory", vacc.mandatoryCount)}

			{/* Neonatal */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>Neonatal</div>
			{row("Assessments", neon.assessmentsCount)}
			{row("Current", neon.currentAssessmentId)}

			{/* Prescriptions */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Prescriptions
			</div>
			{row("Total", rx.prescriptionsCount)}
			{row("Active", rx.activePrescriptionsCount)}

			{/* Vitals */}
			<div className='col-span-2 mt-2 font-semibold text-gray-700 text-xs uppercase tracking-wide'>
				Vital Signs
			</div>
			{row("Records", vitals.vitalsCount)}
			{row("Has Trends", vitals.hasTrends)}
		</div>
	);
}

// ============================================================================
// Export — single object, matching the TanStack Devtools plugin shape
// ============================================================================

export default {
	name: "TanStack Store",
	render: <DevtoolPanel />
};
