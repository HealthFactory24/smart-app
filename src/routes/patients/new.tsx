// src/routes/patients/new.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPatient } from "@/data/patients";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { BloodGroup, Gender } from "../../db/schema";
import { generateId } from "../../utils";

const patientFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dateOfBirth: z.string().min(1, "Date of birth is required"),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
	email: z.string().email().optional().or(z.literal("")),
	phone: z.string().optional(),
	address: z.string().optional(),
	bloodGroup: z
		.enum([
			"A_POSITIVE",
			"A_NEGATIVE",
			"B_POSITIVE",
			"B_NEGATIVE",
			"O_POSITIVE",
			"O_NEGATIVE",
			"AB_POSITIVE",
			"AB_NEGATIVE"
		])
		.optional(),
	allergies: z.string().optional(),
	medicalConditions: z.string().optional(),
	medicalHistory: z.string().optional(),
	emergencyContactName: z.string().optional(),
	emergencyContactNumber: z.string().optional()
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export const Route = createFileRoute("/patients/new")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user, clinicId: session.user.clinicId };
	},
	component: NewPatientPage
});

function NewPatientPage() {
	const navigate = useNavigate();
	const { user, clinicId } = Route.useRouteContext();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			dateOfBirth: "",
			gender: "MALE" as Gender,
			email: "",
			phone: "",
			address: "",
			bloodGroup: "AB_NEGATIVE" as BloodGroup,
			allergies: "",
			medicalConditions: "",
			medicalHistory: "",
			emergencyContactName: "",
			emergencyContactNumber: ""
		},
		onSubmit: async ({ value }) => {
			const result = patientFormSchema.safeParse(value);
			if (!result.success) {
				toast.error(result.error.issues[0]?.message);
				return;
			}

			setIsSubmitting(true);
			try {
				await createPatient({
					data: {
						...value,
						id: generateId(),
						userId: user.id,
						clinicId: clinicId,

						dateOfBirth: new Date(value.dateOfBirth),
						gender: value.gender,
						bloodGroup: value.bloodGroup
					}
				});
				toast.success("Patient created successfully");
				navigate({ to: "/patients" });
			} catch (error) {
				toast.error("Failed to create patient");
			} finally {
				setIsSubmitting(false);
			}
		}
	});

	const bloodGroupOptions = [
		{ value: "A_POSITIVE", label: "A+" },
		{ value: "A_NEGATIVE", label: "A-" },
		{ value: "B_POSITIVE", label: "B+" },
		{ value: "B_NEGATIVE", label: "B-" },
		{ value: "O_POSITIVE", label: "O+" },
		{ value: "O_NEGATIVE", label: "O-" },
		{ value: "AB_POSITIVE", label: "AB+" },
		{ value: "AB_NEGATIVE", label: "AB-" }
	];

	return (
		<div className='mx-auto max-w-2xl px-4 py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Add New Patient</CardTitle>
					<CardDescription>Enter the patient's information below to create a new record.</CardDescription>
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
							{/* Personal Information */}
							<div>
								<h3 className='mb-3 font-semibold text-lg'>Personal Information</h3>
								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='firstName'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>First Name *</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='lastName'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Last Name *</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='dateOfBirth'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Date of Birth *</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													type='date'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='gender'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Gender</Label>
												<Select
													onValueChange={value => field.handleChange(value as Gender)}
													value={field.state.value}
												>
													<SelectTrigger id={field.name}>
														<SelectValue placeholder='Select gender' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='MALE'>Male</SelectItem>
														<SelectItem value='FEMALE'>Female</SelectItem>
														<SelectItem value='OTHER'>Other</SelectItem>
													</SelectContent>
												</Select>
											</div>
										)}
									</form.Field>
								</div>
							</div>

							{/* Contact Information */}
							<div>
								<h3 className='mb-3 font-semibold text-lg'>Contact Information</h3>
								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='email'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Email</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='patient@example.com'
													type='email'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='phone'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Phone</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='(555) 555-5555'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='address'>
										{field => (
											<div className='space-y-2 sm:col-span-2'>
												<Label htmlFor={field.name}>Address</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='Street address, city, zip code'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>
								</div>
							</div>

							{/* Medical Information */}
							<div>
								<h3 className='mb-3 font-semibold text-lg'>Medical Information</h3>
								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='bloodGroup'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Blood Group</Label>
												<Select
													onValueChange={value => field.handleChange(value as BloodGroup)}
													value={field.state.value}
												>
													<SelectTrigger id={field.name}>
														<SelectValue placeholder='Select blood group' />
													</SelectTrigger>
													<SelectContent>
														{bloodGroupOptions.map(option => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}
									</form.Field>

									<form.Field name='allergies'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Allergies</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='e.g., Penicillin, Peanuts'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='medicalConditions'>
										{field => (
											<div className='space-y-2 sm:col-span-2'>
												<Label htmlFor={field.name}>Medical Conditions</Label>
												<Textarea
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='Chronic conditions, diagnoses, etc.'
													rows={2}
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='medicalHistory'>
										{field => (
											<div className='space-y-2 sm:col-span-2'>
												<Label htmlFor={field.name}>Medical History</Label>
												<Textarea
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='Previous surgeries, hospitalizations, etc.'
													rows={2}
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>
								</div>
							</div>

							{/* Emergency Contact */}
							<div>
								<h3 className='mb-3 font-semibold text-lg'>Emergency Contact</h3>
								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='emergencyContactName'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Contact Name</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='Full name'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name='emergencyContactNumber'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Contact Number</Label>
												<Input
													id={field.name}
													onChange={e => field.handleChange(e.target.value)}
													placeholder='Phone number'
													value={field.state.value}
												/>
											</div>
										)}
									</form.Field>
								</div>
							</div>

							<div className='flex gap-3 pt-4'>
								<Button
									onClick={() => navigate({ to: "/patients" })}
									type='button'
									variant='outline'
								>
									Cancel
								</Button>
								<Button
									disabled={isSubmitting}
									type='submit'
								>
									{isSubmitting ? "Creating..." : "Create Patient"}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
