// src/routes/prescriptions/new.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllDoctors } from "@/data/doctors";
import { getAllPatients } from "@/data/patients";
import { createPrescription, getAllDrugs } from "@/data/prescriptions";
import { getFormData, serverValidate } from "@/lib/form-utils";
import { mergeForm, useForm, useTransform } from "@tanstack/react-form-start";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { toast } from "sonner";
import type { Doctor, Drug, Patient } from "../../db/zod";

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
};

type PrescriptionFormValues = {
	patientId: string;
	clinicId: string;
	doctorId: string;
	diagnosis: string;
	notes: string;
	instructions: string;
	validUntil: string;
	medications: MedicationValue[];
};

export const Route = createFileRoute("/prescriptions/new")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => {
		const [doctors, patients, drugs, formState] = await Promise.all([
			getAllDoctors(),
			getAllPatients(),
			getAllDrugs(),
			getFormData()
		]);
		return {
			doctors: doctors as Doctor[],
			patients: patients as Patient[],
			drugs: drugs as Drug[],
			formState
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

const formOpts = {
	defaultValues: {
		patientId: "",
		clinicId: "",
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
	validators: {
		onChange: ({ value }) => {
			if (!value.patientId) return { patientId: "Patient is required" };
			if (!value.doctorId) return { doctorId: "Doctor is required" };
			if (value.medications.length === 0) return { medications: "At least one medication is required" };
			for (let i = 0; i < value.medications.length; i++) {
				const med = value.medications[i];
				if (!med.drugId) return { [`medications.${i}.drugId`]: "Medication is required" };
				if (!med.dosageValue || med.dosageValue <= 0)
					return { [`medications.${i}.dosageValue`]: "Valid dosage is required" };
			}
			return undefined;
		}
	}
};

function NewPrescriptionPage() {
	const { doctors, patients, drugs, formState } = Route.useLoaderData();
	const navigate = useNavigate();

	const form = useForm({
		...formOpts,
		transform: useTransform(baseForm => mergeForm(baseForm, formState), [formState])
	});

	const formErrors = useStore(form.store, state => state.errors);

	const handleSubmit = async () => {
		const values = form.store.state.values as PrescriptionFormValues;

		try {
			const medications = values.medications.map(med => ({
				drugId: med.drugId,
				dosageValue: med.dosageValue,
				dosageUnit: med.dosageUnit,
				frequency: med.frequency,
				duration: med.duration,
				instructions: med.instructions || undefined,
				refillsRemaining: med.refillsRemaining
			}));

			await createPrescription({
				data: {
					patientId: values.patientId,
					doctorId: values.doctorId,
					diagnosis: values.diagnosis,
					notes: values.notes,
					instructions: values.instructions ?? "",
					validUntil: values.validUntil ? new Date(values.validUntil) : null,
					status: "active" as const,
					clinicId: values.clinicId || null,
					medicationName: values.medications.map(med => med.drugId).join(", "),
					id: "",
					medicalRecordId: "",
					encounterId: "",
					issuedDate: new Date(),
					endDate: null,
					renewedFromId: null,
					cancelledAt: null,
					cancellationReason: null,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			});
			toast.success("Prescription created successfully");
			navigate({ to: "/prescriptions" });
		} catch (error) {
			console.error(error);
			toast.error("Failed to create prescription");
		}
	};

	return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>New Prescription</CardTitle>
					<CardDescription>Create a new prescription for a patient</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						action={serverValidate.url}
						encType='multipart/form-data'
						method='post'
						onSubmit={async e => {
							e.preventDefault();
							e.stopPropagation();
							const isValid = await form.validate();
							if (isValid) {
								await handleSubmit();
							}
						}}
					>
						{formErrors.map((error, i) => (
							<p
								className='text-destructive text-sm'
								key={i}
							>
								{String(error)}
							</p>
						))}

						<div className='space-y-6'>
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
											{field.state.meta.errors.map((error, i) => (
												<p
													className='text-destructive text-sm'
													key={i}
												>
													{String(error)}
												</p>
											))}
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
											{field.state.meta.errors.map((error, i) => (
												<p
													className='text-destructive text-sm'
													key={i}
												>
													{String(error)}
												</p>
											))}
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
											{field.state.value.map((_, index) => (
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
											{field.state.meta.errors.map((error, i) => (
												<p
													className='text-destructive text-sm'
													key={i}
												>
													{String(error)}
												</p>
											))}
										</div>
									)}
								</form.Field>
							</div>

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
	form: ReturnType<typeof useForm<PrescriptionFormValues>>;
	index: number;
	onRemove: () => void;
	showRemove: boolean;
}) {
	const getFieldName = (subPath: string): `medications.${number}.${string}` => {
		return `medications.${index}.${subPath}`;
	};

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
				<form.Field name={getFieldName("drugId")}>
					{field => (
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
							{field.state.meta.errors.map((error, i) => (
								<p
									className='text-destructive text-sm'
									key={i}
								>
									{String(error)}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<div className='grid grid-cols-2 gap-2'>
					<form.Field name={getFieldName("dosageValue")}>
						{field => (
							<div className='space-y-1'>
								<Label htmlFor={field.name}>Dosage *</Label>
								<Input
									id={field.name}
									onChange={e => field.handleChange(Number.parseFloat(e.target.value))}
									step='0.1'
									type='number'
									value={field.state.value || ""}
								/>
								{field.state.meta.errors.map((error, i) => (
									<p
										className='text-destructive text-sm'
										key={i}
									>
										{String(error)}
									</p>
								))}
							</div>
						)}
					</form.Field>

					<form.Field name={getFieldName("dosageUnit")}>
						{field => (
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

				<form.Field name={getFieldName("frequency")}>
					{field => (
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

				<form.Field name={getFieldName("duration")}>
					{field => (
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

				<form.Field name={getFieldName("refillsRemaining")}>
					{field => (
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

				<form.Field name={getFieldName("instructions")}>
					{field => (
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
