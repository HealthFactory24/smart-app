import type z from "zod";

import type { AppointmentStatus, DbDoctor, DbPatient } from "../db/schema";
import type {
	AppointmentSchema,
	DiagnosisSchema,
	DoctorSchema,
	PatientBillSchema,
	PatientSchema,
	PaymentSchema,
	ServiceSchema,
	StaffSchema,
	VitalSignSchema,
	WorkingDaySchema
} from "../db/zod";

export type AppointmentsChartProps = {
	name: string;
	appointment: number;
	completed: number;
}[];

export type Appointment = {
	id: number;
	patient_id: string;
	doctor_id: string;
	type: string;
	appointment_date: Date;
	time: string;
	status: AppointmentStatus;

	patient: DbPatient;
	doctor: DbDoctor;
};

export type AvailableDoctorProps = {
	id: string;
	name: string;
	specialization: string;
	img?: string;
	colorCode?: string;
	working_days: {
		day: string;
		start_time: string;
		close_time: string;
	}[];
}[];

export type PartialPatient = {
	firstName: string;
	lastName: string;
	gender: string;
	img: string | null;
	colorCode: string | null;
};

export type PartialDoctor = {
	name: string;
	img: string | null;
	colorCode: string | null;
	specialization: string;
};

export type PartialAppointment = {
	id: number;
	appointment_date: Date;
	time: string;
	status: AppointmentStatus;

	patient: PartialPatient;
	doctor: PartialDoctor;
};

export type PatientInput = z.infer<typeof PatientSchema>;
export type StaffInput = z.infer<typeof StaffSchema>;
export type DoctorInput = z.infer<typeof DoctorSchema>;
export type ServiceInput = z.infer<typeof ServiceSchema>;
export type WorkScheduleInput = z.infer<typeof WorkingDaySchema>;
export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type VitalSignsInput = z.infer<typeof VitalSignSchema>;
export type DiagnosisInput = z.infer<typeof DiagnosisSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
export type PatientBillInput = z.infer<typeof PatientBillSchema>;
