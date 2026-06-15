// src/routes/appointments/book.tsx
import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAppointment, getAvailableTimeSlots } from "@/data/appointments";
import { getAllDoctors } from "@/data/doctors";
import { getMyChildren } from "@/data/patients";
import { getAvailableServices } from "@/data/services";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formDate";

const appointmentSchema = z.object({
	patientId: z.string().min(1, "Please select a child"),
	doctorId: z.string().min(1, "Please select a doctor"),
	serviceId: z.string().optional(),
	appointmentDate: z.date().min(new Date(), "Please select a future date"),
	time: z.string().min(1, "Please select a time"),
	reason: z.string().optional()
});

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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);
	const [isLoadingSlots, setIsLoadingSlots] = useState(false);

	// Data states
	const [patients, setPatients] = useState<Awaited<ReturnType<typeof getMyChildren>>>([]);
	const [doctors, setDoctors] = useState<Awaited<ReturnType<typeof getAllDoctors>>>([]);
	const [services, setServices] = useState<Awaited<ReturnType<typeof getAvailableServices>>>([]);
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
			appointmentDate: undefined as Date | undefined,
			time: "",
			reason: ""
		},
		onSubmit: async ({ value }) => {
			const result = appointmentSchema.safeParse(value);
			if (!result.success) {
				toast.error(result.error.issues[0]?.message);
				return;
			}

			const validatedData = result.data;
			setIsSubmitting(true);
			try {
				await createAppointment({
					data: {
						patientId: validatedData.patientId,
						doctorId: validatedData.doctorId,
						serviceId: validatedData.serviceId || undefined,
						appointmentDate: validatedData.appointmentDate,
						time: validatedData.time,
						reason: validatedData.reason,
						durationMinutes: 30,
						type: "REGULAR"
					}
				});
				toast.success("Appointment booked successfully!");
				navigate({ to: "/appointments" });
			} catch (_error) {
				toast.error("Failed to book appointment. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		}
	});

	const selectedDoctor = useStore(form.store, state => doctors.find(d => d.id === state.values.doctorId));
	const selectedDate = useStore(form.store, state => state.values.appointmentDate);

	const loadAvailableSlots = useCallback(
		async (doctorId: string, date: Date) => {
			setIsLoadingSlots(true);
			try {
				const slots = await getAvailableTimeSlots({
					data: {
						doctorId,
						date
					}
				});
				setAvailableSlots(slots);
				// Clear time selection when slots reload
				form.setFieldValue("time", "");
			} catch (_error) {
				setAvailableSlots([]);
			} finally {
				setIsLoadingSlots(false);
			}
		},
		[form]
	);

	// Load available slots when doctor and date are selected
	useEffect(() => {
		if (selectedDoctor && selectedDate) {
			loadAvailableSlots(selectedDoctor.id, selectedDate);
		}
	}, [selectedDoctor, selectedDate, loadAvailableSlots]);

	if (isLoading) {
		return (
			<div className='flex h-[60vh] items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-slate-400' />
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-2xl py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Book an Appointment</CardTitle>
					<CardDescription>
						Schedule a visit for your child with one of our pediatric specialists
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={e => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className='space-y-6'>
							{/* Step 1: Select Patient */}
							<form.Field name='patientId'>
								{field => (
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
												{patients.map(patient => (
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
											<p className='text-destructive text-sm'>{field.state.meta.errors[0]}</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Step 2: Select Service */}
							<form.Field name='serviceId'>
								{field => (
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
												<SelectItem value=''>General Consultation</SelectItem>
												{services.map(service => (
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

							{/* Step 3: Select Doctor */}
							<form.Field name='doctorId'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Select Doctor *</Label>
										<Select
											onValueChange={value => {
												field.handleChange(value);
												// Reset date and time when doctor changes
												form.setFieldValue("appointmentDate", undefined);
												form.setFieldValue("time", "");
											}}
											value={field.state.value}
										>
											<SelectTrigger id={field.name}>
												<SelectValue placeholder='Choose a doctor' />
											</SelectTrigger>
											<SelectContent>
												{doctors.map(doctor => (
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
											<p className='text-destructive text-sm'>{field.state.meta.errors[0]}</p>
										)}
									</div>
								)}
							</form.Field>

							{/* Step 4: Select Date */}
							<form.Field name='appointmentDate'>
								{field => (
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
														field.handleChange(date);
														form.setFieldValue("time", "");
													}}
													selected={field.state.value}
												/>
											</PopoverContent>
										</Popover>
									</div>
								)}
							</form.Field>

							{/* Step 5: Select Time Slot */}
							{selectedDoctor && selectedDate && (
								<form.Field name='time'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Select Time *</Label>
											{isLoadingSlots ? (
												<div className='flex items-center justify-center py-4'>
													<Loader2 className='h-6 w-6 animate-spin text-slate-400' />
												</div>
											) : availableSlots.length > 0 ? (
												<div className='grid grid-cols-3 gap-2'>
													{availableSlots.map(slot => (
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
										</div>
									)}
								</form.Field>
							)}

							{/* Step 6: Reason */}
							<form.Field name='reason'>
								{field => (
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
									onClick={() => navigate({ to: "/appointments" })}
									type='button'
									variant='outline'
								>
									Cancel
								</Button>
								<Button
									disabled={isSubmitting}
									type='submit'
								>
									{isSubmitting ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Booking...
										</>
									) : (
										"Book Appointment"
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
