// src/routes/encounters/new.tsx

import {
	createServerValidate,
	formOptions,
	getFormData,
	mergeForm,
	ServerValidateError,
	useForm as useFormStart,
	useTransform
} from "@tanstack/react-form-start";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { useSelector } from "@tanstack/react-store";
import { Activity, AlertCircle, Droplets, Heart, Ruler, Thermometer, Weight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatientAppointments } from "@/data/appointments";
import { createEncounter } from "@/data/diagnosis";
import { getAllDoctors } from "@/data/doctors";
import { getAllPatients } from "@/data/patients";
import { calculateAgeInDays, calculateAgeInMonths, calculateBMI } from "@/utils/growth";
import { generateId } from "../../utils";

// ============================================================================
// Shared Form Schema & Options
// ============================================================================

export const encounterFormSchema = z.object({
	patientId: z.string().min(1, "Please select a patient"),
	doctorId: z.string().min(1, "Please select a doctor"),
	appointmentId: z.string().optional(),
	type: z.string().default("CONSULTATION"),
	symptoms: z.string().min(1, "Please enter symptoms"),
	diagnosis: z.string().optional(),
	treatment: z.string().optional(),
	notes: z.string().optional(),
	followUpPlan: z.string().optional(),
	prescribedMedications: z.string().optional()
});

export const vitalSignsFormSchema = z.object({
	bodyTemperature: z.number().min(34, "Temperature too low").max(42, "Temperature too high").optional(),
	systolic: z.number().min(60, "Systolic too low").max(200, "Systolic too high").optional(),
	diastolic: z.number().min(40, "Diastolic too low").max(120, "Diastolic too high").optional(),
	heartRate: z.number().min(40, "Heart rate too low").max(200, "Heart rate too high").optional(),
	respiratoryRate: z.number().min(10, "Respiratory rate too low").max(60, "Respiratory rate too high").optional(),
	oxygenSaturation: z.number().min(70, "Oxygen saturation too low").max(100, "Oxygen saturation too high").optional(),
	weight: z.number().min(0.5, "Weight too low").max(200, "Weight too high").optional(),
	height: z.number().min(30, "Height too low").max(250, "Height too high").optional()
});

export const growthFormSchema = z.object({
	weight: z.number().min(0.5).max(200).optional(),
	height: z.number().min(30).max(250).optional(),
	headCircumference: z
		.number()
		.min(20, "Head circumference too small")
		.max(70, "Head circumference too large")
		.optional()
});

export const completeEncounterSchema = z.object({
	encounter: encounterFormSchema,
	vitalSigns: vitalSignsFormSchema,
	growth: growthFormSchema
});

export type CompleteEncounterForm = z.infer<typeof completeEncounterSchema>;

export const formOpts = formOptions({
	defaultValues: {
		encounter: {
			patientId: "",
			doctorId: "",
			appointmentId: "",
			type: "CONSULTATION",
			symptoms: "",
			diagnosis: "",
			treatment: "",
			notes: "",
			followUpPlan: "",
			prescribedMedications: ""
		},
		vitalSigns: {
			bodyTemperature: undefined,
			systolic: undefined,
			diastolic: undefined,
			heartRate: undefined,
			respiratoryRate: undefined,
			oxygenSaturation: undefined,
			weight: undefined,
			height: undefined
		},
		growth: {
			weight: undefined,
			height: undefined,
			headCircumference: undefined
		}
	} as CompleteEncounterForm
});

// ============================================================================
// Server Functions
// ============================================================================

const serverValidate = createServerValidate({
	...formOpts,
	onServerValidate: async ({ value }) => {
		const result = completeEncounterSchema.safeParse(value);
		if (!result.success) {
			return result.error.issues[0]?.message || "Invalid form data";
		}
		return undefined;
	}
});

export const submitEncounter = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => {
		if (!(data instanceof FormData)) {
			throw new Error("Invalid form data");
		}
		return data;
	})
	.handler(async ctx => {
		try {
			const validatedData = await serverValidate(ctx.data);

			// Create the encounter/diagnosis
			const encounter = await createEncounter({
				data: {
					patientId: validatedData.encounter.patientId,
					doctorId: validatedData.encounter.doctorId,
					medicalId: crypto.randomUUID(),
					appointmentId: validatedData.encounter.appointmentId || undefined,
					type: validatedData.encounter.type,
					symptoms: validatedData.encounter.symptoms,
					diagnosis: validatedData.encounter.diagnosis,
					treatment: validatedData.encounter.treatment,
					notes: validatedData.encounter.notes,
					followUpPlan: validatedData.encounter.followUpPlan,
					prescribedMedications: validatedData.encounter.prescribedMedications
				}
			});

			// Create vital signs if any provided
			const hasVitals = Object.values(validatedData.vitalSigns).some(v => v !== undefined);
			if (hasVitals) {
				const { createVitalSign } = await import("@/data/vital-signs");
				const vitalSignsData = {
					patientId: validatedData.encounter.patientId,
					medicalId: encounter.medicalId,
					encounterId: encounter.id,
					recordedAt: new Date(),
					...validatedData.vitalSigns
				};
				await createVitalSign({ data: vitalSignsData });
			}

			// Create growth record if weight or height provided
			if (validatedData.growth.weight || validatedData.growth.height) {
				const { createGrowthRecord } = await import("@/data/growthRecord");
				const growthData = {
					id: generateId(),
					patientId: validatedData.encounter.patientId,
					date: new Date(),
					weight: validatedData.growth.weight,
					height: validatedData.growth.height,
					headCircumference: validatedData.growth.headCircumference
				};
				await createGrowthRecord({ data: growthData });
			}

			return { success: true, encounterId: encounter.id };
		} catch (e) {
			if (e instanceof ServerValidateError) {
				return e.response;
			}
			setResponseStatus(500);
			throw new Error("Failed to create encounter");
		}
	});

export const getFormDataFromServer = createServerFn({ method: "GET" }).handler(async () => {
	return getFormData();
});

// ============================================================================
// Route Component
// ============================================================================

export const Route = createFileRoute("/encounters/new")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => ({
		formState: await getFormDataFromServer(),
		patients: await getAllPatients(),
		doctors: await getAllDoctors()
	}),
	component: NewEncounterPage
});

function NewEncounterPage() {
	const navigate = useNavigate();
	const { formState, patients: initialPatients, doctors: initialDoctors } = Route.useLoaderData();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState("encounter");
	const [appointments, setAppointments] = useState<any[]>([]);
	const [selectedPatient, setSelectedPatient] = useState<any>(null);
	const [growthPreview, setGrowthPreview] = useState<{ bmi?: number; ageMonths?: number; ageDays?: number }>({});

	// Use the server-side form with proper validation
	const form = useFormStart({
		...formOpts,
		transform: useTransform(baseForm => mergeForm(baseForm, formState), [formState])
	});

	// Form errors from server validation
	const formErrors = useSelector(form.store, s => s.errors);

	const loadPatientAppointments = async (patientId: string) => {
		try {
			const appointmentsData = await getPatientAppointments({ data: patientId });
			setAppointments(appointmentsData);
		} catch (error) {
			console.error("Failed to load appointments", error);
		}
	};

	const handlePatientChange = async (patientId: string) => {
		const patient = initialPatients.find((p: any) => p.id === patientId);
		setSelectedPatient(patient);

		if (patientId) {
			await loadPatientAppointments(patientId);
			// Calculate age for growth tracking
			if (patient?.dateOfBirth) {
				const ageMonths = calculateAgeInMonths(new Date(patient.dateOfBirth));
				const ageDays = calculateAgeInDays(new Date(patient.dateOfBirth));
				setGrowthPreview(prev => ({ ...prev, ageMonths, ageDays }));
			}
		} else {
			setAppointments([]);
			setSelectedPatient(null);
		}
	};

	const updateGrowthPreview = (weight?: number, height?: number) => {
		if (weight && height) {
			const bmi = calculateBMI(weight, height);
			setGrowthPreview(prev => ({ ...prev, bmi: bmi.bmi }));
		} else {
			setGrowthPreview(prev => ({ ...prev, bmi: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const formData = new FormData(e.target as HTMLFormElement);
			const result = await submitEncounter({ data: formData });

			if (!(result instanceof Response) && result.success) {
				toast.success("Encounter created successfully");
				navigate({ to: "/encounters" });
			} else if (result && "errors" in result) {
				// Handle validation errors
				toast.error("Please fix the validation errors");
			}
		} catch (error) {
			toast.error("Failed to create encounter");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!initialPatients.length && !initialDoctors.length) {
		return (
			<div className='mx-auto max-w-4xl px-4 py-8'>
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>
						Failed to load required data. Please refresh the page or contact support.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>New Patient Visit</CardTitle>
					<CardDescription>
						Document a new patient encounter, record vital signs, and track growth metrics
					</CardDescription>
				</CardHeader>

				<form
					action={submitEncounter.url}
					encType='multipart/form-data'
					method='post'
					onSubmit={handleSubmit}
				>
					<CardContent className='space-y-6'>
						{/* Server Validation Errors */}
						{formErrors.length > 0 && (
							<Alert variant='destructive'>
								<AlertCircle className='h-4 w-4' />
								<AlertDescription>
									<ul className='list-inside list-disc'>
										{formErrors.map((error, i) => (
											<li key={i}>{String(error)}</li>
										))}
									</ul>
								</AlertDescription>
							</Alert>
						)}

						<Tabs
							onValueChange={setActiveTab}
							value={activeTab}
						>
							<TabsList className='grid w-full grid-cols-3'>
								<TabsTrigger value='encounter'>Encounter Details</TabsTrigger>
								<TabsTrigger value='vitals'>Vital Signs</TabsTrigger>
								<TabsTrigger value='growth'>Growth Tracking</TabsTrigger>
							</TabsList>

							{/* Encounter Details Tab */}
							<TabsContent
								className='space-y-6 pt-4'
								value='encounter'
							>
								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='encounter.patientId'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Patient *</Label>
												<select
													className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
													id={field.name}
													name={field.name}
													onChange={e => {
														field.handleChange(e.target.value);
														handlePatientChange(e.target.value);
													}}
													value={field.state.value}
												>
													<option value=''>Select patient</option>
													{initialPatients.map((patient: any) => (
														<option
															key={patient.id}
															value={patient.id}
														>
															{patient.firstName} {patient.lastName} (
															{patient.mrn || "No MRN"})
														</option>
													))}
												</select>
												{field.state.meta.errors.map(error => (
													<p
														className='text-destructive text-sm'
														key={error}
													>
														{error}
													</p>
												))}
											</div>
										)}
									</form.Field>

									<form.Field name='encounter.doctorId'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Doctor *</Label>
												<select
													className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
													id={field.name}
													name={field.name}
													onChange={e => field.handleChange(e.target.value)}
													value={field.state.value}
												>
													<option value=''>Select doctor</option>
													{initialDoctors.map((doctor: any) => (
														<option
															key={doctor.id}
															value={doctor.id}
														>
															Dr. {doctor.name} - {doctor.specialty}
														</option>
													))}
												</select>
												{field.state.meta.errors.map(error => (
													<p
														className='text-destructive text-sm'
														key={error}
													>
														{error}
													</p>
												))}
											</div>
										)}
									</form.Field>

									<form.Field name='encounter.appointmentId'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Associated Appointment (Optional)</Label>
												<select
													className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
													id={field.name}
													name={field.name}
													onChange={e => field.handleChange(e.target.value || undefined)}
													value={field.state.value}
												>
													<option value=''>None</option>
													{appointments.map((apt: any) => (
														<option
															key={apt.id}
															value={apt.id}
														>
															{new Date(apt.appointmentDate).toLocaleDateString()} -{" "}
															{apt.type}
														</option>
													))}
												</select>
											</div>
										)}
									</form.Field>

									<form.Field name='encounter.type'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Visit Type *</Label>
												<select
													className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
													id={field.name}
													name={field.name}
													onChange={e => field.handleChange(e.target.value)}
													value={field.state.value}
												>
													<option value='CONSULTATION'>Consultation</option>
													<option value='FOLLOW_UP'>Follow-up</option>
													<option value='EMERGENCY'>Emergency</option>
													<option value='WELL_CHILD'>Well Child Visit</option>
													<option value='SICK_VISIT'>Sick Visit</option>
													<option value='VACCINATION'>Vaccination</option>
												</select>
											</div>
										)}
									</form.Field>
								</div>

								<form.Field name='encounter.symptoms'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Symptoms / Chief Complaint *</Label>
											<textarea
												className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												id={field.name}
												name={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder="Describe the patient's symptoms and reason for visit..."
												value={field.state.value}
											/>
											{field.state.meta.errors.map(error => (
												<p
													className='text-destructive text-sm'
													key={error}
												>
													{error}
												</p>
											))}
										</div>
									)}
								</form.Field>

								<form.Field name='encounter.diagnosis'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Diagnosis</Label>
											<textarea
												className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												id={field.name}
												name={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Primary diagnosis and differential diagnoses...'
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='encounter.treatment'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Treatment Plan</Label>
											<textarea
												className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												id={field.name}
												name={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Prescribed treatments, medications, procedures...'
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='encounter.prescribedMedications'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Prescribed Medications</Label>
											<textarea
												className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												id={field.name}
												name={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='List any medications prescribed with dosage and frequency...'
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='encounter.followUpPlan'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Follow-up Plan</Label>
											<textarea
												className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												id={field.name}
												name={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Recommended follow-up schedule, referrals, or additional tests...'
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='encounter.notes'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Additional Notes</Label>
											<textarea
												className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												id={field.name}
												name={field.name}
												onChange={e => field.handleChange(e.target.value)}
												placeholder='Any additional observations or notes...'
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>
							</TabsContent>

							{/* Vital Signs Tab */}
							<TabsContent
								className='space-y-6 pt-4'
								value='vitals'
							>
								<Alert>
									<Activity className='h-4 w-4' />
									<AlertDescription>
										Record the patient's vital signs. All measurements are optional.
									</AlertDescription>
								</Alert>

								<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
									<form.Field name='vitalSigns.bodyTemperature'>
										{field => (
											<div className='space-y-2'>
												<Label className='flex items-center gap-2'>
													<Thermometer className='h-4 w-4' />
													Body Temperature (°C)
												</Label>
												<Input
													id={field.name}
													name={field.name}
													onChange={e => field.handleChange(e.target.valueAsNumber)}
													placeholder='36.5 - 37.5'
													step='0.1'
													type='number'
													value={field.state.value ?? ""}
												/>
												{field.state.meta.errors.map(error => (
													<p
														className='text-destructive text-sm'
														key={error}
													>
														{error}
													</p>
												))}
											</div>
										)}
									</form.Field>

									<div className='space-y-2'>
										<Label className='flex items-center gap-2'>
											<Heart className='h-4 w-4' />
											Blood Pressure (mmHg)
										</Label>
										<div className='flex gap-2'>
											<form.Field name='vitalSigns.systolic'>
												{field => (
													<Input
														name={field.name}
														onChange={e => field.handleChange(e.target.valueAsNumber)}
														placeholder='Systolic'
														type='number'
														value={field.state.value ?? ""}
													/>
												)}
											</form.Field>
											<span className='self-center'>/</span>
											<form.Field name='vitalSigns.diastolic'>
												{field => (
													<Input
														name={field.name}
														onChange={e => field.handleChange(e.target.valueAsNumber)}
														placeholder='Diastolic'
														type='number'
														value={field.state.value ?? ""}
													/>
												)}
											</form.Field>
										</div>
									</div>

									<form.Field name='vitalSigns.heartRate'>
										{field => (
											<div className='space-y-2'>
												<Label className='flex items-center gap-2'>
													<Heart className='h-4 w-4' />
													Heart Rate (bpm)
												</Label>
												<Input
													name={field.name}
													onChange={e => field.handleChange(e.target.valueAsNumber)}
													placeholder='60 - 100'
													type='number'
													value={field.state.value ?? ""}
												/>
												{field.state.meta.errors.map(error => (
													<p
														className='text-destructive text-sm'
														key={error}
													>
														{error}
													</p>
												))}
											</div>
										)}
									</form.Field>

									<form.Field name='vitalSigns.respiratoryRate'>
										{field => (
											<div className='space-y-2'>
												<Label className='flex items-center gap-2'>
													<Activity className='h-4 w-4' />
													Respiratory Rate (breaths/min)
												</Label>
												<Input
													name={field.name}
													onChange={e => field.handleChange(e.target.valueAsNumber)}
													placeholder='12 - 20'
													type='number'
													value={field.state.value ?? ""}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='vitalSigns.oxygenSaturation'>
										{field => (
											<div className='space-y-2'>
												<Label className='flex items-center gap-2'>
													<Droplets className='h-4 w-4' />
													Oxygen Saturation (%)
												</Label>
												<Input
													name={field.name}
													onChange={e => field.handleChange(e.target.valueAsNumber)}
													placeholder='95 - 100'
													type='number'
													value={field.state.value ?? ""}
												/>
											</div>
										)}
									</form.Field>
								</div>
							</TabsContent>

							{/* Growth Tracking Tab */}
							<TabsContent
								className='space-y-6 pt-4'
								value='growth'
							>
								<Alert>
									<Ruler className='h-4 w-4' />
									<AlertDescription>
										Growth measurements help track the patient's development over time. These will
										be plotted on WHO growth charts.
									</AlertDescription>
								</Alert>

								{selectedPatient && (
									<div className='rounded-lg bg-slate-50 p-4 dark:bg-slate-800'>
										<p className='text-slate-600 text-sm dark:text-slate-400'>
											Patient Age: {growthPreview.ageMonths || 0} months (
											{growthPreview.ageDays || 0} days)
										</p>
										<p className='text-slate-600 text-sm dark:text-slate-400'>
											Gender: {selectedPatient.gender?.toLowerCase() || "Not specified"}
										</p>
										{growthPreview.bmi && (
											<p className='font-medium text-primary text-sm'>
												Calculated BMI: {growthPreview.bmi.toFixed(1)}
											</p>
										)}
									</div>
								)}

								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='growth.weight'>
										{field => (
											<div className='space-y-2'>
												<Label className='flex items-center gap-2'>
													<Weight className='h-4 w-4' />
													Weight (kg)
												</Label>
												<Input
													name={field.name}
													onChange={e => {
														const weight = e.target.valueAsNumber;
														field.handleChange(weight);
														const heightField = form.getFieldValue("growth.height");
														updateGrowthPreview(weight, heightField as number | undefined);
													}}
													placeholder='0.0'
													step='0.1'
													type='number'
													value={field.state.value ?? ""}
												/>
												{field.state.meta.errors.map(error => (
													<p
														className='text-destructive text-sm'
														key={error}
													>
														{error}
													</p>
												))}
											</div>
										)}
									</form.Field>

									<form.Field name='growth.height'>
										{field => (
											<div className='space-y-2'>
												<Label className='flex items-center gap-2'>
													<Ruler className='h-4 w-4' />
													Height / Length (cm)
												</Label>
												<Input
													name={field.name}
													onChange={e => {
														const height = e.target.valueAsNumber;
														field.handleChange(height);
														const weightField = form.getFieldValue("growth.weight");
														updateGrowthPreview(weightField as number | undefined, height);
													}}
													placeholder='0.0'
													step='0.1'
													type='number'
													value={field.state.value ?? ""}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='growth.headCircumference'>
										{field => (
											<div className='space-y-2'>
												<Label>Head Circumference (cm)</Label>
												<Input
													name={field.name}
													onChange={e => field.handleChange(e.target.valueAsNumber)}
													placeholder='For children under 2 years'
													step='0.1'
													type='number'
													value={field.state.value ?? ""}
												/>
												{field.state.meta.errors.map(error => (
													<p
														className='text-destructive text-sm'
														key={error}
													>
														{error}
													</p>
												))}
											</div>
										)}
									</form.Field>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>

					<CardFooter className='flex justify-end gap-3'>
						<Button
							onClick={() => navigate({ to: "/encounters" })}
							type='button'
							variant='outline'
						>
							Cancel
						</Button>
						<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button
									disabled={!canSubmit || isSubmitting}
									type='submit'
								>
									{isSubmitting ? "Creating..." : "Complete Visit"}
								</Button>
							)}
						</form.Subscribe>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
