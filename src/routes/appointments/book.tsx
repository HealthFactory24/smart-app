// src/routes/appointments/book.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createAppointment, getAvailableTimeSlots } from "@/data/appointments";
import { getAllDoctors } from "@/data/doctors";
import { getMyChildren } from "@/data/patients";
import { getAvailableServices } from "@/data/services";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formDate";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	CalendarIcon,
	CheckCircle,
	Clock,
	Loader2,
	Stethoscope,
	User
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { DbAppointment, DbDoctor, DbPatient, DbService } from "../../db/schema";

type WizardStep = "details" | "review" | "confirm";

const appointmentSchema = z.object({
	patientId: z.string().min(1, "Please select a child"),
	doctorId: z.string().min(1, "Please select a doctor"),
	serviceId: z.string().optional(),
	appointmentDate: z.date().min(new Date(), "Please select a future date"),
	time: z.string().min(1, "Please select a time"),
	reason: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export const Route = createFileRoute("/appointments/book")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	component: BookAppointmentPage
});

function BookAppointmentPage() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<WizardStep>("details");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);
	const [isLoadingSlots, setIsLoadingSlots] = useState(false);
	const [confirmedAppointment, setConfirmedAppointment] = useState<DbAppointment | null>(null);

	const [patients, setPatients] = useState<DbPatient[]>([]);
	const [doctors, setDoctors] = useState<DbDoctor[]>([]);
	const [services, setServices] = useState<DbService[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadInitialData = useCallback(async () => {
		setIsLoading(true);
		try {
			const [patientsData, doctorsData, servicesData] = await Promise.all([
				getMyChildren(),
				getAllDoctors(),
				getAvailableServices()
			]);
			setPatients(patientsData);
			setDoctors(doctorsData);
			setServices(servicesData);
		} catch (_error) {
			toast.error("Failed to load data");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadInitialData();
	}, [loadInitialData]);

	const form = useForm({
		defaultValues: {
			patientId: "",
			doctorId: "",
			serviceId: "",
			appointmentDate: undefined as unknown as Date,
			time: "",
			reason: ""
		} as AppointmentFormValues,
		validators: {
			onChange: ({ value }) => {
				const result = appointmentSchema.safeParse(value);
				if (!result.success) {
					const errors: Record<string, string> = {};
					result.error.issues.forEach(issue => {
						const path = issue.path[0];
						if (path) {
							errors[path.toString()] = issue.message;
						}
					});
					return errors;
				}
				return undefined;
			}
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				const appointment = await createAppointment({
					data: {
						patientId: value.patientId,
						doctorId: value.doctorId,
						serviceId: value.serviceId || undefined,
						appointmentDate: value.appointmentDate,
						time: value.time,
						reason: value.reason,
						durationMinutes: 30,
						type: "REGULAR"
					}
				});

				setConfirmedAppointment(appointment);
				setCurrentStep("confirm");
				toast.success("Appointment booked successfully!");
			} catch (_error) {
				toast.error("Failed to book appointment. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		}
	});

	// Helper to get field values
	const getFieldValue = (fieldName: keyof AppointmentFormValues): string | Date => {
		return (form.store.state.values as AppointmentFormValues)[fieldName] as string | Date;
	};

	const selectedDoctor = doctors.find(d => d.id === (getFieldValue("doctorId") as string));
	const selectedPatient = patients.find(p => p.id === (getFieldValue("patientId") as string));
	const selectedService = services.find(s => s.id === (getFieldValue("serviceId") as string));
	const selectedDate = getFieldValue("appointmentDate") as Date;
	const selectedTime = getFieldValue("time") as string;
	const reason = (getFieldValue("reason") as string) || "";

	const loadAvailableSlots = useCallback(
		async (doctorId: string, date: Date) => {
			setIsLoadingSlots(true);
			try {
				const slots = await getAvailableTimeSlots({
					data: { doctorId, date }
				});
				setAvailableSlots(slots);
				form.setFieldValue("time", "");
			} catch (_error) {
				setAvailableSlots([]);
			} finally {
				setIsLoadingSlots(false);
			}
		},
		[form]
	);

	useEffect(() => {
		if (selectedDoctor && selectedDate) {
			loadAvailableSlots(selectedDoctor.id, selectedDate);
		}
	}, [selectedDoctor, selectedDate, loadAvailableSlots]);

	const validateAndProceed = () => {
		const values = form.store.state.values as AppointmentFormValues;
		const result = appointmentSchema.safeParse(values);
		if (!result.success) {
			toast.error(result.error.issues[0]?.message);
			return false;
		}
		return true;
	};

	const goToReview = () => {
		if (validateAndProceed()) {
			setCurrentStep("review");
		}
	};

	if (isLoading) {
		return (
			<div className='flex h-[60vh] items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-slate-400' />
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-3xl py-8'>
			<div className='mb-8'>
				<div className='flex items-center justify-center gap-2'>
					<StepIndicator
						isActive={currentStep === "details"}
						isCompleted={currentStep !== "details"}
						step={1}
						title='Details'
					/>
					<div
						className={cn(
							"h-0.5 w-12 transition-colors",
							currentStep !== "details" ? "bg-primary" : "bg-slate-200"
						)}
					/>
					<StepIndicator
						isActive={currentStep === "review"}
						isCompleted={currentStep === "confirm"}
						step={2}
						title='Review'
					/>
					<div
						className={cn(
							"h-0.5 w-12 transition-colors",
							currentStep === "confirm" ? "bg-primary" : "bg-slate-200"
						)}
					/>
					<StepIndicator
						isActive={currentStep === "confirm"}
						isCompleted={false}
						step={3}
						title='Confirm'
					/>
				</div>
			</div>

			{currentStep === "details" && (
				<AppointmentDetailsForm
					availableSlots={availableSlots}
					doctors={doctors}
					form={form}
					isLoadingSlots={isLoadingSlots}
					onCancel={() => navigate({ to: "/appointments" })}
					onContinue={goToReview}
					patients={patients}
					selectedDate={selectedDate}
					selectedDoctor={selectedDoctor}
					services={services}
				/>
			)}

			{currentStep === "review" && (
				<AppointmentReview
					date={selectedDate}
					doctor={selectedDoctor}
					isSubmitting={isSubmitting}
					onBack={() => setCurrentStep("details")}
					onConfirm={() => form.handleSubmit()}
					patient={selectedPatient}
					reason={reason}
					service={selectedService}
					time={selectedTime}
				/>
			)}

			{currentStep === "confirm" && confirmedAppointment && (
				<AppointmentConfirmation
					appointment={confirmedAppointment}
					date={selectedDate}
					doctor={selectedDoctor}
					patient={selectedPatient}
					time={selectedTime}
				/>
			)}
		</div>
	);
}

function StepIndicator({
	step,
	title,
	isActive,
	isCompleted
}: {
	step: number;
	title: string;
	isActive: boolean;
	isCompleted: boolean;
}) {
	return (
		<div className='flex flex-col items-center gap-1'>
			<div
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm transition-all",
					isCompleted && "bg-primary text-white",
					isActive && "border-2 border-primary bg-white text-primary",
					!isActive && !isCompleted && "bg-slate-100 text-slate-400"
				)}
			>
				{isCompleted ? <CheckCircle className='h-5 w-5' /> : step}
			</div>
			<span className={cn("text-xs transition-colors", isActive && "font-medium text-primary")}>{title}</span>
		</div>
	);
}

interface AppointmentDetailsFormProps {
	// Use the validator type that matches the form definition
	form: FormApi<AppointmentFormValues, undefined>;
	patients: DbPatient[]; // Explicitly type patients
	doctors: DbDoctor[];
	services: DbService[];
	selectedDoctor: DbDoctor | undefined;
	selectedDate: Date | undefined;
	availableSlots: string[];
	isLoadingSlots: boolean;
	onContinue: () => void;
	onCancel: () => void;
}

function AppointmentDetailsForm({
	form,
	patients,
	doctors,
	services,
	selectedDoctor,
	selectedDate,
	availableSlots,
	isLoadingSlots,
	onContinue,
	onCancel
}: AppointmentDetailsFormProps) {
	return (
		<Card className='max-w-3xl'>
			<CardHeader>
				<CardTitle className='text-2xl'>Book an Appointment</CardTitle>
				<CardDescription>Schedule a visit for your child with one of our pediatric specialists</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-6'>
					<form.Field name='patientId'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>Select Child *</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder='Choose your child' />
									</SelectTrigger>
									<SelectContent>
										{patients.map((patient: DbPatient) => (
											<SelectItem
												key={patient.id}
												value={patient.id}
											>
												{patient.firstName} {patient.lastName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<p className='text-destructive text-sm'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='serviceId'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>Service Type (Optional)</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value || undefined}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder='Select a service' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='_none'>General Consultation</SelectItem>
										{services.map((service: DbService) => (
											<SelectItem
												key={service.id}
												value={service.id}
											>
												{service.serviceName} (${service.price})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name='doctorId'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>Select Doctor *</Label>
								<Select
									onValueChange={(value: string) => {
										field.handleChange(value);
										form.setFieldValue("appointmentDate", undefined as unknown as Date);
										form.setFieldValue("time", "");
									}}
									value={field.state.value}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder='Choose a doctor' />
									</SelectTrigger>
									<SelectContent>
										{doctors.map((doctor: DbDoctor) => (
											<SelectItem
												key={doctor.id}
												value={doctor.id}
											>
												Dr. {doctor.name} - {doctor.specialty}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<p className='text-destructive text-sm'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name='appointmentDate'>
						{(field) => (
							<div className='space-y-2'>
								<Label>Select Date *</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											className={cn(
												"w-full justify-start text-left font-normal",
												!field.state.value && "text-muted-foreground"
											)}
											variant='outline'
										>
											<CalendarIcon className='mr-2 h-4 w-4' />
											{field.state.value ? formatDate(field.state.value) : "Pick a date"}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0'>
										<Calendar
											disabled={date => date < new Date()}
											mode='single'
											onSelect={date => {
												if (date) {
													field.handleChange(date);
													form.setFieldValue("time", "");
												}
											}}
											selected={field.state.value}
										/>
									</PopoverContent>
								</Popover>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<p className='text-destructive text-sm'>{String(field.state.meta.errors[0])}</p>
								)}
							</div>
						)}
					</form.Field>

					{selectedDoctor && selectedDate && (
						<form.Field name='time'>
							{(field) => (
								<div className='space-y-2'>
									<Label htmlFor={field.name}>Select Time *</Label>
									{isLoadingSlots ? (
										<div className='flex items-center justify-center py-4'>
											<Loader2 className='h-6 w-6 animate-spin text-slate-400' />
										</div>
									) : availableSlots.length > 0 ? (
										<div className='grid grid-cols-3 gap-2'>
											{availableSlots.map((slot: string) => (
												<Button
													className={cn(
														"h-10",
														field.state.value === slot &&
															"bg-primary text-primary-foreground"
													)}
													key={slot}
													onClick={() => field.handleChange(slot)}
													type='button'
													variant={field.state.value === slot ? "default" : "outline"}
												>
													{slot}
												</Button>
											))}
										</div>
									) : (
										<p className='py-4 text-center text-slate-500 text-sm'>
											No available time slots for this date. Please select another date.
										</p>
									)}
									{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
										<p className='text-destructive text-sm'>{String(field.state.meta.errors[0])}</p>
									)}
								</div>
							)}
						</form.Field>
					)}

					<form.Field name='reason'>
						{(field) => (
							<div className='space-y-2'>
								<Label htmlFor={field.name}>Reason for Visit (Optional)</Label>
								<Textarea
									id={field.name}
									onChange={e => field.handleChange(e.target.value)}
									placeholder='Please describe any symptoms or concerns...'
									rows={3}
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>

					<div className='flex gap-3 pt-4'>
						<Button
							onClick={onCancel}
							type='button'
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							className='flex-1'
							onClick={onContinue}
							type='button'
						>
							Review Appointment
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
// Review Component Props Interface
interface AppointmentReviewProps {
	patient: DbPatient | undefined;
	doctor: DbDoctor | undefined;
	service: DbService | undefined;
	date: Date | undefined;
	time: string;
	reason: string;
	onBack: () => void;
	onConfirm: () => void;
	isSubmitting: boolean;
}

function AppointmentReview({
	patient,
	doctor,
	service,
	date,
	time,
	reason,
	onBack,
	onConfirm,
	isSubmitting
}: AppointmentReviewProps) {
	const isSameDay = date && new Date(date).toDateString() === new Date().toDateString();

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-2xl'>Review Your Appointment</CardTitle>
				<CardDescription>Please review the details before confirming your appointment</CardDescription>
			</CardHeader>
			<CardContent className='space-y-6'>
				{doctor && (
					<div className='rounded-lg border bg-gradient-to-r from-blue-50 to-white p-4 dark:from-blue-950/20 dark:to-slate-900'>
						<div className='flex items-start gap-4'>
							<Avatar className='h-16 w-16 border-2 border-blue-200'>
								<AvatarFallback className='bg-blue-100 text-blue-600 text-lg'>
									{doctor.name?.charAt(0) || "D"}
								</AvatarFallback>
							</Avatar>
							<div className='flex-1'>
								<h3 className='font-semibold text-lg'>Dr. {doctor.name}</h3>
								<p className='text-slate-600 text-sm dark:text-slate-400'>{doctor.specialty}</p>
								<div className='mt-2 flex flex-wrap gap-2'>
									<Badge
										className='bg-green-50 text-green-700 text-xs'
										variant='outline'
									>
										Available
									</Badge>
								</div>
							</div>
						</div>
					</div>
				)}

				<Separator />

				<div className='grid gap-4 sm:grid-cols-2'>
					<div className='flex items-start gap-3'>
						<User className='mt-0.5 h-5 w-5 text-slate-400' />
						<div>
							<p className='text-slate-500 text-xs'>Patient</p>
							<p className='font-medium'>
								{patient?.firstName} {patient?.lastName}
							</p>
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<Stethoscope className='mt-0.5 h-5 w-5 text-slate-400' />
						<div>
							<p className='text-slate-500 text-xs'>Service</p>
							<p className='font-medium'>{service?.serviceName || "General Consultation"}</p>
							{service?.price && <p className='text-slate-500 text-xs'>${service.price}</p>}
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<CalendarIcon className='mt-0.5 h-5 w-5 text-slate-400' />
						<div>
							<p className='text-slate-500 text-xs'>Date</p>
							<p className='font-medium'>
								{date ? formatDate(date) : "Not selected"}
								{isSameDay && <span className='ml-2 text-orange-500 text-xs'>(Today)</span>}
							</p>
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<Clock className='mt-0.5 h-5 w-5 text-slate-400' />
						<div>
							<p className='text-slate-500 text-xs'>Time</p>
							<p className='font-medium'>{time || "Not selected"}</p>
						</div>
					</div>
				</div>

				{reason && (
					<>
						<Separator />
						<div>
							<p className='text-slate-500 text-xs'>Reason for Visit</p>
							<p className='mt-1 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>{reason}</p>
						</div>
					</>
				)}

				<Separator />

				<div className='rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20'>
					<div className='flex items-start gap-3'>
						<AlertCircle className='h-5 w-5 text-amber-600' />
						<div>
							<p className='font-medium text-amber-800 text-sm dark:text-amber-400'>
								Important Information
							</p>
							<ul className='mt-2 list-inside list-disc space-y-1 text-amber-700 text-xs dark:text-amber-500'>
								<li>Please arrive 15 minutes before your scheduled time</li>
								<li>Bring your identity verification document/card</li>
								<li>Cancellations require at least 24 hours notice</li>
							</ul>
						</div>
					</div>
				</div>
			</CardContent>

			<CardFooter className='flex gap-3'>
				<Button
					disabled={isSubmitting}
					onClick={onBack}
					type='button'
					variant='outline'
				>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back
				</Button>
				<Button
					className='flex-1'
					disabled={isSubmitting}
					onClick={onConfirm}
				>
					{isSubmitting ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Confirming...
						</>
					) : (
						<>
							<CheckCircle className='mr-2 h-4 w-4' />
							Confirm Appointment
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}

// Confirmation Component Props Interface
interface AppointmentConfirmationProps {
	appointment: DbAppointment;
	patient: DbPatient | undefined;
	doctor: DbDoctor | undefined;
	date: Date | undefined;
	time: string;
}

function AppointmentConfirmation({ appointment, patient, doctor, date, time }: AppointmentConfirmationProps) {
	const navigate = useNavigate();

	return (
		<Card className='border-green-200 bg-linear-to-b from-green-50 to-white dark:from-green-950/20 dark:to-slate-900'>
			<CardContent className='py-8 text-center'>
				<div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
					<CheckCircle className='h-10 w-10 text-green-600 dark:text-green-400' />
				</div>

				<h2 className='font-bold text-2xl'>Appointment Confirmed!</h2>
				<p className='mt-2 text-slate-600 dark:text-slate-400'>
					Your appointment has been successfully scheduled.
				</p>

				<div className='mx-auto mt-6 max-w-sm space-y-3 rounded-lg border bg-white p-4 text-left dark:bg-slate-900'>
					<div className='flex items-center justify-between'>
						<span className='text-slate-500 text-sm'>Confirmation #</span>
						<span className='font-medium font-mono text-sm'>{appointment.id.slice(0, 8)}</span>
					</div>
					<div className='flex items-center justify-between'>
						<span className='text-slate-500 text-sm'>Patient</span>
						<span className='font-medium'>
							{patient?.firstName} {patient?.lastName}
						</span>
					</div>
					<div className='flex items-center justify-between'>
						<span className='text-slate-500 text-sm'>Doctor</span>
						<span className='font-medium'>Dr. {doctor?.name}</span>
					</div>
					<div className='flex items-center justify-between'>
						<span className='text-slate-500 text-sm'>Date & Time</span>
						<span className='font-medium'>
							{date ? formatDate(date) : "N/A"} at {time}
						</span>
					</div>
				</div>

				<div className='mt-8 flex flex-wrap justify-center gap-3'>
					<Button
						onClick={() => navigate({ to: "/appointments" })}
						variant='outline'
					>
						View My Appointments
					</Button>
					<Button onClick={() => window.location.reload()}>Book Another</Button>
				</div>

				<p className='mt-6 text-slate-500 text-xs'>
					A confirmation has been sent out. You can manage this record anytime on your panel.
				</p>
			</CardContent>
		</Card>
	);
}
