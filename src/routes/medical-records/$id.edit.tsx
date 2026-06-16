// src/routes/medical-records/$id.edit.tsx

import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAllDoctors } from "@/data/doctors";
import { getMedicalRecordById, updateMedicalRecord } from "@/data/medical-records";
import { getAllPatients } from "@/data/patients";
import type { Status } from "../../db/schema";

export const Route = createFileRoute("/medical-records/$id/edit")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const [record, doctors, patients] = await Promise.all([
			getMedicalRecordById({ data: params.id }),
			getAllDoctors(),
			getAllPatients()
		]);
		if (!record) throw redirect({ to: "/medical-records" });
		return { record, doctors, patients };
	},
	component: EditMedicalRecordPage
});

function EditMedicalRecordPage() {
	const { record, doctors, patients } = Route.useLoaderData();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const formatDateForInput = (date: Date | string | null | undefined) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toISOString().split("T")[0];
	};

	const form = useForm({
		defaultValues: {
			diagnosis: record.diagnosis || "",
			symptoms: record.symptoms || "",
			treatmentPlan: record.treatmentPlan || "",
			labRequest: record.labRequest || "",
			notes: record.notes || "",
			followUpDate: formatDateForInput(record.followUpDate),
			status: (record.status as Status) || "ACTIVE",
			doctorId: record.doctorId,
			patientId: record.patientId
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				await updateMedicalRecord({
					data: {
						id: record.id,
						values: {
							...value,
							followUpDate: value.followUpDate ? new Date(value.followUpDate) : undefined
						}
					}
				});
				toast.success("Medical record updated successfully");
				navigate({ to: "/medical-records/$id", params: { id: record.id } });
			} catch (error) {
				console.error(error);
				toast.error("Failed to update medical record");
			} finally {
				setIsSubmitting(false);
			}
		}
	});

	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Edit Medical Record</CardTitle>
					<CardDescription>
						Update clinical information for {record.patient?.firstName} {record.patient?.lastName}
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
												<SelectTrigger id={field.name}>
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

								<form.Field name='status'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Status</Label>
											<Select
												onValueChange={value => field.handleChange(value as Status)}
												value={field.state.value}
											>
												<SelectTrigger id={field.name}>
													<SelectValue placeholder='Select status' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='ACTIVE'>Active</SelectItem>
													<SelectItem value='COMPLETED'>Completed</SelectItem>
													<SelectItem value='PENDING'>Pending</SelectItem>
													<SelectItem value='ON_HOLD'>On Hold</SelectItem>
													<SelectItem value='CANCELLED'>Cancelled</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
								</form.Field>

								<form.Field name='followUpDate'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Follow-up Date</Label>
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

							<form.Field name='symptoms'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Symptoms / Chief Complaint</Label>
										<Textarea
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder="Describe the patient's symptoms..."
											rows={3}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

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

							<form.Field name='treatmentPlan'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Treatment Plan</Label>
										<Textarea
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Describe the treatment plan...'
											rows={2}
											value={field.state.value}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name='labRequest'>
								{field => (
									<div className='space-y-2'>
										<Label htmlFor={field.name}>Lab Requests</Label>
										<Textarea
											id={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter any lab test requests...'
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
									onClick={() => navigate({ to: "/medical-records/$id", params: { id: record.id } })}
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
