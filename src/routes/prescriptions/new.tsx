// src/routes/prescriptions/new.tsx

import type { DeepKeys, FieldApi, FormApi } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppForm } from "@/components/ui/tanstack-form";
import { Textarea } from "@/components/ui/textarea";
import { getAllDoctors } from "@/data/doctors";
import { getAllPatients } from "@/data/patients";
import { createPrescription, getAllDrugs } from "@/data/prescriptions";

type MedicationValue = {
	drugId: string;
	dosageValue: number;
	dosageUnit: string;
	frequency:
		| "ONCE_DAILY"
		| "TWICE_DAILY"
		| "THREE_TIMES_DAILY"
		| "FOUR_TIMES_DAILY"
		| "EVERY_OTHER_DAY"
		| "WEEKLY"
		| "MONTHLY"
		| "AS_NEEDED";
	duration: string;
	instructions: string;
	refillsRemaining: number;
	drugRoute?: "ORAL" | "INTRAVENOUS" | "INTRAMUSCULAR" | "SUBCUTANEOUS" | "TOPICAL" | "INHALATION" | "RECTAL";
};

type PrescriptionFormValues = {
	patientId: string;
	doctorId: string;
	diagnosis: string;
	notes: string;
	instructions: string;
	validUntil: string;
	medications: MedicationValue[];
};

type Doctor = { id: string; name: string; specialty: string };
type Patient = { id: string; firstName: string; lastName: string; mrn: string };
type Drug = { id: string; name: string };

export const Route = createFileRoute("/prescriptions/new")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async (): Promise<{ doctors: Doctor[]; patients: Patient[]; drugs: Drug[] }> => {
		const [doctors, patients, drugs] = await Promise.all([getAllDoctors(), getAllPatients(), getAllDrugs()]);
		return {
			doctors: doctors as Doctor[],
			patients: patients as Patient[],
			drugs: drugs as Drug[]
		};
	},
	component: NewPrescriptionPage
});

const frequencyOptions = [
	{ value: "ONCE_DAILY", label: "Once daily" },
	{ value: "TWICE_DAILY", label: "Twice daily" },
	{ value: "THREE_TIMES_DAILY", label: "Three times daily" },
	{ value: "FOUR_TIMES_DAILY", label: "Four times daily" },
	{ value: "EVERY_OTHER_DAY", label: "Every other day" },
	{ value: "WEEKLY", label: "Weekly" },
	{ value: "MONTHLY", label: "Monthly" },
	{ value: "AS_NEEDED", label: "As needed" }
];

const dosageUnits = ["mg", "mcg", "g", "mL", "IU", "units"];

function NewPrescriptionPage() {
	const { doctors, patients, drugs } = Route.useLoaderData();
	const navigate = useNavigate();

	const form = useAppForm({
		defaultValues: {
			patientId: "",
			doctorId: "",
			diagnosis: "",
			notes: "",
			instructions: "",
			validUntil: "",
			medications: [
				{
					drugId: "",
					dosageValue: 0,
					dosageUnit: "mg",
					frequency: "TWICE_DAILY" as const,
					duration: "",
					instructions: "",
					refillsRemaining: 0
				}
			]
		} as PrescriptionFormValues,
		onSubmit: async ({ value }) => {
			try {
				// Transform medications array to match the expected format in createPrescription
				const medications = value.medications.map(med => ({
					name: drugs.find(d => d.id === med.drugId)?.name || "",
					dosage: `${med.dosageValue} ${med.dosageUnit}`,
					frequency: med.frequency.replace(/_/g, " "),
					duration: med.duration,
					instructions: med.instructions
				}));

				await createPrescription({
					data: {
						patientId: value.patientId,
						doctorId: value.doctorId,
						medications: medications,
						diagnosis: value.diagnosis,
						notes: value.notes,
						instructions: value.instructions,
						validUntil: value.validUntil ? new Date(value.validUntil) : undefined
					}
				});
				toast.success("Prescription created successfully");
				navigate({ to: "/prescriptions" });
			} catch (error) {
				console.error(error);
				toast.error("Failed to create prescription");
			}
		}
	});

	return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>New Prescription</CardTitle>
					<CardDescription>Create a new prescription for a patient</CardDescription>
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
							{/* Basic Information */}
							<div className='grid gap-4 sm:grid-cols-2'>
								<form.Field name='patientId'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Patient *</Label>
											<Select
												onValueChange={field.handleChange}
												value={field.state.value}
											>
												<SelectTrigger
													className='font-sans'
													id={field.name}
												>
													<SelectValue placeholder='Select patient' />
												</SelectTrigger>
												<SelectContent>
													{patients.map(patient => (
														<SelectItem
															key={patient.id}
															value={patient.id}
														>
															{patient.firstName} {patient.lastName} ({patient.mrn})
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</form.Field>

								<form.Field name='doctorId'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Doctor *</Label>
											<Select
												onValueChange={field.handleChange}
												value={field.state.value}
											>
												<SelectTrigger
													className='font-sans'
													id={field.name}
												>
													<SelectValue placeholder='Select doctor' />
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
										</div>
									)}
								</form.Field>

								<form.Field name='validUntil'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Valid Until (Optional)</Label>
											<Input
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
												type='date'
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>
							</div>

							{/* Medications Section */}
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label className='font-semibold text-base'>Medications *</Label>
									<Button
										onClick={() => {
											const currentMeds = form.getFieldValue("medications");
											form.setFieldValue("medications", [
												...currentMeds,
												{
													drugId: "",
													dosageValue: 0,
													dosageUnit: "mg",
													frequency: "TWICE_DAILY",
													duration: "",
													instructions: "",
													refillsRemaining: 0
												}
											]);
										}}
										size='sm'
										type='button'
										variant='outline'
									>
										Add Medication
									</Button>
								</div>

								<form.Field name='medications'>
									{field => (
										<div className='space-y-4'>
											{field.state.value.map((_med, index) => (
												<MedicationFormFields
													drugs={drugs}
													form={form}
													index={index}
													key={index}
													onRemove={() => {
														const currentMeds = field.state.value;
														if (currentMeds.length > 1) {
															const newMeds = currentMeds.filter((_, i) => i !== index);
															field.handleChange(newMeds);
														}
													}}
													showRemove={field.state.value.length > 1}
												/>
											))}
										</div>
									)}
								</form.Field>
							</div>

							{/* Clinical Information */}
							<form.Field name='diagnosis'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Diagnosis</Label>
										<Textarea
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter diagnosis...'
											rows={2}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name='instructions'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>General Instructions</Label>
										<Textarea
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='General instructions for the patient...'
											rows={2}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name='notes'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Additional Notes</Label>
										<Textarea
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Any additional notes...'
											rows={2}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

							<div className='flex justify-end gap-3 pt-4'>
								<Button
									onClick={() => navigate({ to: "/prescriptions" })}
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
											{isSubmitting ? "Creating..." : "Create Prescription"}
										</Button>
									)}
								</form.Subscribe>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

function MedicationFormFields({
	drugs,
	form,
	index,
	onRemove,
	showRemove = true
}: {
	drugs: Drug[];
	form: FormApi<PrescriptionFormValues, any>;
	index: number;
	onRemove: () => void;
	showRemove?: boolean;
}) {
	const fieldName = (subPath: string) =>
		`medications[${index}].${subPath}` as unknown as DeepKeys<PrescriptionFormValues>;

	return (
		<div className='rounded-lg border p-4 dark:border-slate-700'>
			<div className='mb-3 flex items-center justify-between'>
				<h4 className='font-medium'>Medication {index + 1}</h4>
				{showRemove && (
					<Button
						className='text-red-500 hover:text-red-700'
						onClick={onRemove}
						size='sm'
						type='button'
						variant='ghost'
					>
						Remove
					</Button>
				)}
			</div>
			<div className='grid gap-3 sm:grid-cols-2'>
				<form.Field name={fieldName("drugId")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Medication *</Label>
							<Select
								onValueChange={field.handleChange}
								value={field.state.value as string}
							>
								<SelectTrigger
									className='font-sans'
									id={field.name}
								>
									<SelectValue placeholder='Select medication' />
								</SelectTrigger>
								<SelectContent>
									{drugs.map(drug => (
										<SelectItem
											key={drug.id}
											value={drug.id}
										>
											{drug.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>

				<div className='grid grid-cols-2 gap-2'>
					<form.Field name={fieldName("dosageValue")}>
						{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
							<div className='space-y-1'>
								<Label htmlFor={field.name}>Dosage *</Label>
								<Input
									id={field.name}
									onChange={e => field.handleChange(Number.parseFloat(e.target.value))}
									step='0.1'
									type='number'
									value={field.state.value || ""}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name={fieldName("dosageUnit")}>
						{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
							<div className='space-y-1'>
								<Label htmlFor={field.name}>Unit *</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value as string}
								>
									<SelectTrigger
										className='font-sans'
										id={field.name}
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{dosageUnits.map(unit => (
											<SelectItem
												key={unit}
												value={unit}
											>
												{unit}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>
				</div>

				<form.Field name={fieldName("frequency")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Frequency *</Label>
							<Select
								onValueChange={field.handleChange}
								value={field.state.value as string}
							>
								<SelectTrigger
									className='font-sans'
									id={field.name}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{frequencyOptions.map(opt => (
										<SelectItem
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>

				<form.Field name={fieldName("duration")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Duration</Label>
							<Input
								id={field.name}
								onChange={e => field.handleChange(e.target.value)}
								placeholder='e.g., 7 days, 2 weeks'
								value={field.state.value}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name={fieldName("refillsRemaining")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Refills Remaining</Label>
							<Input
								id={field.name}
								min='0'
								onChange={e => field.handleChange(Number.parseInt(e.target.value, 10))}
								type='number'
								value={field.state.value}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name={fieldName("instructions")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
						<div className='space-y-1 sm:col-span-2'>
							<Label htmlFor={field.name}>Specific Instructions</Label>
							<Textarea
								id={field.name}
								onChange={e => field.handleChange(e.target.value)}
								placeholder='Take with food, avoid alcohol, etc.'
								rows={1}
								value={field.state.value}
							/>
						</div>
					)}
				</form.Field>
			</div>
		</div>
	);
}
