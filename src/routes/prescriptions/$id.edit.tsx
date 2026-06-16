// src/routes/prescriptions/$id.edit.tsx

import {
	type DeepKeys,
	type DeepKeys,
	type FieldApi,
	type FieldApi,
	type FormApi,
	type FormApi,
	useForm,
	useForm
} from "@tanstack/react-form";
import { createFileRoute, createFileRoute, redirect, redirect, useNavigate, useNavigate } from "@tanstack/react-router";
import { useState, useState } from "react";
import { toast, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllDoctors } from "@/data/doctors";
import { getAllPatients } from "@/data/patients";
import { getAllDrugs, getPrescriptionById, updatePrescription } from "@/data/prescriptions";
import type { Doctor, Drug, Patient, PrescriptionWithItems } from "../../db/zod";

type MedicationValue = {
	drugId: string;
	dosageValue: number;
	dosageUnit: string;
	frequency: string;
	duration: string;
	instructions: string;
	refillsRemaining: number;
};

type PrescriptionFormValues = {
	patientId: string;
	doctorId: string;
	diagnosis: string;
	notes: string;
	instructions: string;
	status: "active" | "completed" | "cancelled" | "expired" | "on_hold";
	validUntil: string;
	medications: MedicationValue[];
};

// Define a type that matches what getPrescriptionById actually returns with relations
type PrescriptionWithRelationsAndItems = PrescriptionWithItems & {
	patient?: Patient | null;
	doctor?: Doctor | null;
};

export const Route = createFileRoute("/prescriptions/$id/edit")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async ({
		params
	}): Promise<{ prescription: PrescriptionWithItems; doctors: Doctor[]; patients: Patient[]; drugs: Drug[] }> => {
	}): Promise<{ prescription: PrescriptionWithRelationsAndItems; doctors: Doctor[]; patients: Patient[]; drugs: Drug[] }> => {
		const [prescription, doctors, patients, drugs] = await Promise.all([
			getPrescriptionById({ data: params.id }),
			getAllDoctors(),
			getAllPatients(),
			getAllDrugs()
		]);
if (!prescription) throw redirect({ to: "/prescriptions" });
return { prescription, doctors: doctors as Doctor[], patients: patients as Patient[], drugs: drugs as Drug[] };
if (!prescription) throw redirect({ to: "/prescriptions" }); // Ensure prescription is not null
return {
			prescription: prescription as PrescriptionWithRelationsAndItems, // Cast to the new type
			doctors: doctors as Doctor[],
			patients: patients as Patient[],
			drugs: drugs as Drug[]
		};
},
	component: EditPrescriptionPage
})

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

function EditPrescriptionPage() {
	const { prescription, doctors, patients, drugs } = Route.useLoaderData();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formatDateForInput = (date: Date | string | null | undefined) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toISOString().split("T")[0];
	};

	const defaultMedications = prescription.prescribedItem.map((item: any) => ({
	const defaultMedications = prescription.prescribedItems.map((item: PrescriptionWithItems['prescribedItems'][number]) => ({
		drugId: item.drugId,
		dosageValue: item.dosageValue,
		dosageUnit: item.dosageUnit,
		frequency: item.frequency,
		duration: item.duration || "",
		instructions: item.instructions || "",
		refillsRemaining: item.refillsRemaining || 0
	})) || [
		{
			drugId: "",
			drugId: "", // Default value for new medication
			dosageValue: 0,
			dosageUnit: "mg",
			frequency: "TWICE_DAILY",
			duration: "",
			instructions: "",
			refillsRemaining: 0
		}
	];

	const form = useForm<PrescriptionFormValues>({
		defaultValues: {
			patientId: prescription.patientId,
			doctorId: prescription.doctorId,
			diagnosis: prescription.diagnosis || "",
			notes: prescription.notes || "",
			instructions: (prescription as any).instructions || "",
			status: prescription.status as "active" | "completed" | "cancelled" | "expired" | "on_hold",
			validUntil: formatDateForInput((prescription as any).validUntil),
			instructions: prescription.instructions || "",
			status: prescription.status,
			validUntil: formatDateForInput(prescription.validUntil),
			medications: defaultMedications as MedicationValue[]
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				await updatePrescription({
					data: {
						id: prescription.id,
						...value,
						validUntil: value.validUntil ? new Date(value.validUntil) : undefined
					}
				});
				toast.success("Prescription updated successfully");
				navigate({ to: "/prescriptions/$id", params: { id: prescription.id } });
			} catch (error) {
				console.error(error);
				toast.error("Failed to update prescription");
			} finally {
				setIsSubmitting(false);
			}
		}
	});

	return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Edit Prescription</CardTitle>
					<CardDescription>
						Update prescription details for {prescription.patient?.firstName}{" "}
						{prescription.patient?.lastName}
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
												<SelectTrigger id={field.name}>
													<SelectValue placeholder='Select patient' />
												</SelectTrigger>
												<SelectContent>
													{patients.map((patient: Patient) => (
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
												<SelectTrigger id={field.name}>
													<SelectValue placeholder='Select doctor' />
												</SelectTrigger>
												<SelectContent>
													{doctors.map((doctor: Doctor) => (
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

								<form.Field name='status'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Status</Label>
											<Select
												onValueChange={field.handleChange}
												value={field.state.value}
												value={field.state.value as string} // Cast to string for Select component
											>
												<SelectTrigger id={field.name}>
													<SelectValue placeholder='Select status' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='active'>Active</SelectItem>
													<SelectItem value='completed'>Completed</SelectItem>
													<SelectItem value='cancelled'>Cancelled</SelectItem>
													<SelectItem value='expired'>Expired</SelectItem>
													<SelectItem value='on_hold'>On Hold</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
								</form.Field>

								<form.Field name='validUntil'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Valid Until</Label>
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
									<Label className='font-semibold text-base'>Medications</Label>
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
											{field.state.value.map((_med: MedicationValue, index: number) => (
												<MedicationFormFields
													drugs={drugs}
													form={form}
													index={index}
													key={index}
													onRemove={() => {
														const currentMeds = field.state.value;
														const newMeds = currentMeds.filter(
															(_: MedicationValue, i: number) => i !== index
														);
														field.handleChange(newMeds);
													}}
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
									onClick={() =>
										navigate({ to: "/prescriptions/$id", params: { id: prescription.id } })
									}
									type='button'
									variant='outline'
								>
									Cancel
								</Button>
								<Button
									disabled={isSubmitting}
									type='submit'
								>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
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
	onRemove
}: {
	drugs: Drug[];
	form: FormApi<PrescriptionFormValues>;
	index: number;
	onRemove: () => void;
}) {
	const fieldName = (subPath: string) =>
		`medications[${index}].${subPath}` as unknown as DeepKeys<PrescriptionFormValues>;

	return (
		<div className='rounded-lg border p-4 dark:border-slate-700'>
			<div className='mb-3 flex items-center justify-between'>
				<h4 className='font-medium'>Medication {index + 1}</h4>
				<Button
					className='text-red-500 hover:text-red-700'
					onClick={onRemove}
					size='sm'
					type='button'
					variant='ghost'
				>
					Remove
				</Button>
			</div>
			<div className='grid gap-3 sm:grid-cols-2'>
				<form.Field name={fieldName("drugId")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => ( // Explicitly type field
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Medication *</Label>
							<Select
								onValueChange={field.handleChange}
								value={field.state.value as string}
							>
								<SelectTrigger id={field.name}>
									<SelectValue placeholder='Select medication' />
								</SelectTrigger>
								<SelectContent>
									{drugs.map((drug: Drug) => (
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
						{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => ( // Explicitly type field
							<div className='space-y-1'>
								<Label htmlFor={field.name}>Dosage *</Label>
								<Input
									id={field.name}
									onChange={e => field.handleChange(Number.parseFloat(e.target.value))}
									step='0.1'
									type='number'
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name={fieldName("dosageUnit")}>
						{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
						{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => ( // Explicitly type field
							<div className='space-y-1'>
								<Label htmlFor={field.name}>Unit *</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value as string}
								>
									<SelectTrigger id={field.name}>
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
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => ( // Explicitly type field
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Frequency *</Label>
							<Select
								onValueChange={field.handleChange}
								value={field.state.value as string}
							>
								<SelectTrigger id={field.name}>
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
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => ( // Explicitly type field
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

				<form.Field
	name={fieldName("refillsRemaining")}>
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
	(
		field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>> // Explicitly type field
	) => (
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
	);
	</form.Field>

				<form.Field name=
	fieldName("instructions");
	>
	(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => (
					{(field: FieldApi<PrescriptionFormValues, DeepKeys<PrescriptionFormValues>>) => ( // Explicitly type field
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
					)
	</form.Field>
			</div>
		</div>
	)
}
