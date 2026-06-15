// src/routes/prescriptions/$id.edit.tsx
import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllDoctors } from "@/data/doctors";
import { getAllDrugs } from "@/data/functions/pharmacy";
import { getAllPatients } from "@/data/patients";
import { getPrescriptionById, updatePrescription } from "@/data/prescriptions";

const prescriptionSchema = z.object({
	patientId: z.string().min(1, "Patient is required"),
	doctorId: z.string().min(1, "Doctor is required"),
	diagnosis: z.string().optional(),
	notes: z.string().optional(),
	instructions: z.string().optional(),
	status: z.enum(["active", "completed", "cancelled", "expired", "on_hold"]).default("active"),
	validUntil: z.string().optional(),
	medications: z
		.array(
			z.object({
				drugId: z.string().min(1, "Medication is required"),
				dosageValue: z.number().min(0.1, "Dosage is required"),
				dosageUnit: z.string().min(1, "Unit is required"),
				frequency: z.string().min(1, "Frequency is required"),
				duration: z.string().optional(),
				instructions: z.string().optional(),
				refillsRemaining: z.number().min(0).default(0)
			})
		)
		.min(1, "At least one medication is required")
});

export const Route = createFileRoute("/prescriptions/$id/edit")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const [prescription, doctors, patients, drugs] = await Promise.all([
			getPrescriptionById({ data: params.id }),
			getAllDoctors(),
			getAllPatients(),
			getAllDrugs()
		]);
		if (!prescription) throw redirect({ to: "/prescriptions" });
		return { prescription, doctors, patients, drugs };
	},
	component: EditPrescriptionPage
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

function EditPrescriptionPage() {
	const { prescription, doctors, patients, drugs } = Route.useLoaderData();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formatDateForInput = (date: Date | string | null | undefined) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toISOString().split("T")[0];
	};

	const defaultMedications = prescription.prescribedItems?.map(item => ({
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
			dosageValue: 0,
			dosageUnit: "mg",
			frequency: "TWICE_DAILY",
			duration: "",
			instructions: "",
			refillsRemaining: 0
		}
	];

	const form = useForm({
		defaultValues: {
			patientId: prescription.patientId,
			doctorId: prescription.doctorId,
			diagnosis: prescription.diagnosis || "",
			notes: prescription.notes || "",
			instructions: prescription.instructions || "",
			status: prescription.status as "active" | "completed" | "cancelled" | "expired" | "on_hold",
			validUntil: formatDateForInput(prescription.validUntil),
			medications: defaultMedications
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
													{patients.map((patient: any) => (
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
													{doctors.map((doctor: any) => (
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
											{field.state.value.map((_, index) => (
												<MedicationFormFields
													drugs={drugs}
													index={index}
													key={index}
													onRemove={() => {
														const currentMeds = field.state.value;
														const newMeds = currentMeds.filter((_, i) => i !== index);
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

function MedicationFormFields({ drugs, index, onRemove }: { drugs: any[]; index: number; onRemove: () => void }) {
	const fieldName = (subPath: string) => `medications[${index}].${subPath}`;

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
					{field => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Medication *</Label>
							<Select
								onValueChange={field.handleChange}
								value={field.state.value}
							>
								<SelectTrigger id={field.name}>
									<SelectValue placeholder='Select medication' />
								</SelectTrigger>
								<SelectContent>
									{drugs.map((drug: any) => (
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
						{field => (
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
						{field => (
							<div className='space-y-1'>
								<Label htmlFor={field.name}>Unit *</Label>
								<Select
									onValueChange={field.handleChange}
									value={field.state.value}
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
					{field => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Frequency *</Label>
							<Select
								onValueChange={field.handleChange}
								value={field.state.value}
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

				<form.Field name={fieldName("refillsRemaining")}>
					{field => (
						<div className='space-y-1'>
							<Label htmlFor={field.name}>Refills Remaining</Label>
							<Input
								id={field.name}
								min='0'
								onChange={e => field.handleChange(Number.parseInt(e.target.value))}
								type='number'
								value={field.state.value}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name={fieldName("instructions")}>
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
