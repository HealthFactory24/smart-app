import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowLeft, Droplets, Heart, Ruler, Thermometer, Weight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getEncounterById, updateEncounter } from "@/data/diagnosis";
import { getAllDoctors } from "@/data/doctors";
import type { Status } from "../../db/schema";

const encounterSchema = z.object({
	type: z.string().min(1, "Visit type is required"),
	symptoms: z.string().min(1, "Symptoms are required"),
	diagnosis: z.string().optional(),
	treatment: z.string().optional(),
	notes: z.string().optional(),
	followUpPlan: z.string().optional(),
	prescribedMedications: z.string().optional(),
	status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
	doctorId: z.string().min(1, "Doctor is required")
});

export const Route = createFileRoute("/encounters/$id/edit")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const [encounter, doctors] = await Promise.all([getEncounterById({ data: params.id }), getAllDoctors()]);
		if (!encounter) throw redirect({ to: "/encounters" });
		return { encounter, doctors };
	},
	component: EditEncounterPage
});

function EditEncounterPage() {
	const { encounter, doctors } = Route.useLoaderData();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState("encounter");

	const form = useForm({
		defaultValues: {
			type: encounter.type || "CONSULTATION",
			symptoms: encounter.symptoms || "",
			diagnosis: encounter.diagnosis || "",
			treatment: encounter.treatment || "",
			notes: encounter.notes || "",
			followUpPlan: encounter.followUpPlan || "",
			prescribedMedications: encounter.prescribedMedications || "",
			status: (encounter.status as Status) || "ACTIVE",
			doctorId: encounter.doctorId || ""
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				await updateEncounter({
					data: {
						values: {
							...value
						},
						id: encounter.id
					}
				});
				toast.success("Encounter updated successfully");
				navigate({ to: "/encounters/$id", params: { id: encounter.id } });
			} catch (error) {
				toast.error("Failed to update encounter");
			} finally {
				setIsSubmitting(false);
			}
		}
	});

	return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<div className='mb-6'>
				<Link
					className='inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
					params={{ id: encounter.id }}
					to='/encounters/$id'
				>
					<ArrowLeft className='h-4 w-4' />
					Back to Details
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Edit Encounter</CardTitle>
					<CardDescription>
						Update clinical information for {encounter.patient?.firstName} {encounter.patient?.lastName}
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
						<Tabs
							className='space-y-6'
							onValueChange={setActiveTab}
							value={activeTab}
						>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='encounter'>Clinical Details</TabsTrigger>
								<TabsTrigger
									disabled
									value='vitals'
								>
									Vital Signs (Read Only)
								</TabsTrigger>
							</TabsList>

							<TabsContent
								className='space-y-6'
								value='encounter'
							>
								<div className='grid gap-4 sm:grid-cols-2'>
									<form.Field name='doctorId'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Attending Doctor</Label>
												<Select
													onValueChange={field.handleChange}
													value={field.state.value}
												>
													<SelectTrigger id={field.name}>
														<SelectValue placeholder='Select doctor' />
													</SelectTrigger>
													<SelectContent>
														{doctors.map(doc => (
															<SelectItem
																key={doc.id}
																value={doc.id}
															>
																Dr. {doc.name}
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
												<Label htmlFor={field.name}>Encounter Status</Label>
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
														<SelectItem value='ON_HOLD'>On Hold</SelectItem>
													</SelectContent>
												</Select>
											</div>
										)}
									</form.Field>

									<form.Field name='type'>
										{field => (
											<div className='space-y-2'>
												<Label htmlFor={field.name}>Visit Type</Label>
												<Select
													onValueChange={field.handleChange}
													value={field.state.value}
												>
													<SelectTrigger id={field.name}>
														<SelectValue placeholder='Select type' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='CONSULTATION'>Consultation</SelectItem>
														<SelectItem value='FOLLOW_UP'>Follow-up</SelectItem>
														<SelectItem value='EMERGENCY'>Emergency</SelectItem>
														<SelectItem value='WELL_CHILD'>Well Child Visit</SelectItem>
														<SelectItem value='SICK_VISIT'>Sick Visit</SelectItem>
														<SelectItem value='VACCINATION'>Vaccination</SelectItem>
													</SelectContent>
												</Select>
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
												rows={2}
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='treatment'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Treatment Plan</Label>
											<Textarea
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
												rows={2}
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='prescribedMedications'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Prescribed Medications</Label>
											<Textarea
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
												rows={2}
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name='followUpPlan'>
									{field => (
										<div className='space-y-2'>
											<Label htmlFor={field.name}>Follow-up Plan</Label>
											<Textarea
												id={field.name}
												onChange={e => field.handleChange(e.target.value)}
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
												rows={2}
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>
							</TabsContent>

							<TabsContent
								className='space-y-4'
								value='vitals'
							>
								<Alert>
									<Activity className='h-4 w-4' />
									<AlertDescription>
										Vital signs are currently read-only in the edit view. To update vitals, please
										create a new vital sign record.
									</AlertDescription>
								</Alert>

								{encounter.vitalSigns && encounter.vitalSigns.length > 0 ? (
									<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
										<div className='space-y-1'>
											<Label className='flex items-center gap-2 text-slate-500'>
												<Thermometer className='h-3.5 w-3.5' /> Temperature
											</Label>
											<p className='font-medium'>
												{encounter.vitalSigns[0].bodyTemperature || "—"} °C
											</p>
										</div>
										<div className='space-y-1'>
											<Label className='flex items-center gap-2 text-slate-500'>
												<Heart className='h-3.5 w-3.5' /> Blood Pressure
											</Label>
											<p className='font-medium'>
												{encounter.vitalSigns[0].systolic || "—"}/
												{encounter.vitalSigns[0].diastolic || "—"} mmHg
											</p>
										</div>
										<div className='space-y-1'>
											<Label className='flex items-center gap-2 text-slate-500'>
												<Weight className='h-3.5 w-3.5' /> Weight
											</Label>
											<p className='font-medium'>{encounter.vitalSigns[0].weight || "—"} kg</p>
										</div>
										<div className='space-y-1'>
											<Label className='flex items-center gap-2 text-slate-500'>
												<Ruler className='h-3.5 w-3.5' /> Height
											</Label>
											<p className='font-medium'>{encounter.vitalSigns[0].height || "—"} cm</p>
										</div>
										<div className='space-y-1'>
											<Label className='flex items-center gap-2 text-slate-500'>
												<Droplets className='h-3.5 w-3.5' /> O₂ Saturation
											</Label>
											<p className='font-medium'>
												{encounter.vitalSigns[0].oxygenSaturation || "—"} %
											</p>
										</div>
										<div className='space-y-1'>
											<Label className='flex items-center gap-2 text-slate-500'>
												<Activity className='h-3.5 w-3.5' /> Heart Rate
											</Label>
											<p className='font-medium'>
												{encounter.vitalSigns[0].heartRate || "—"} bpm
											</p>
										</div>
									</div>
								) : (
									<p className='py-8 text-center text-slate-500 text-sm'>
										No vital signs recorded for this encounter.
									</p>
								)}
							</TabsContent>
						</Tabs>

						<div className='mt-8 flex justify-end gap-3 border-t pt-6'>
							<Button
								onClick={() => navigate({ to: "/encounters/$id", params: { id: encounter.id } })}
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
										<LoadingSpinner
											className='mr-2'
											size='sm'
										/>
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
