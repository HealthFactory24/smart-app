// src/routes/encounters/$id.tsx

import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
	Activity,
	ArrowLeft,
	Calendar,
	Droplets,
	Heart,
	Pill,
	Ruler,
	Stethoscope,
	Thermometer,
	User,
	Weight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEncounterById } from "@/data/diagnosis";
import { formatDate } from "@/utils/formDate";
import type { DbDrug, DbPrescribedItem, DbPrescription, DbVitalSign } from "../../db/schema";

export const Route = createFileRoute("/encounters/$id")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const encounter = await getEncounterById({ data: params.id });
		if (!encounter) throw notFound();
		return { encounter };
	},
	component: EncounterDetailPage
});

function EncounterDetailPage() {
	const { encounter } = Route.useLoaderData();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			case "COMPLETED":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
		}
	};

	return (
		<div className='mx-auto max-w-4xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header with Back Button */}
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<Link
						className='inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
						to='/encounters'
					>
						<ArrowLeft className='h-4 w-4' />
						Back to Encounters
					</Link>
					<div className='flex gap-2'>
						<Link
							params={{ id: encounter.id }}
							to='/encounters/$id/edit'
						>
							<Button
								size='sm'
								variant='outline'
							>
								Edit Encounter
							</Button>
						</Link>
					</div>
				</div>

				{/* Encounter Header */}
				<Card>
					<CardHeader>
						<div className='flex flex-wrap items-start justify-between gap-3'>
							<div>
								<div className='flex items-center gap-2'>
									<h1 className='font-semibold text-2xl'>Encounter Details</h1>
									<Badge className={getStatusColor(encounter.status ?? "ACTIVE")}>
										{encounter.status || "ACTIVE"}
									</Badge>
								</div>
								<CardDescription className='mt-1'>
									{formatDate(encounter.date)} • {encounter.type || "Consultation"}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				<Tabs
					className='space-y-6'
					defaultValue='overview'
				>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='overview'>Overview</TabsTrigger>
						<TabsTrigger value='vitals'>Vital Signs</TabsTrigger>
						<TabsTrigger value='growth'>Growth</TabsTrigger>
						<TabsTrigger value='prescriptions'>Prescriptions</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent
						className='space-y-4'
						value='overview'
					>
						{/* Patient & Doctor Info */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Patient & Doctor Information</CardTitle>
							</CardHeader>
							<CardContent className='grid gap-4 sm:grid-cols-2'>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<User className='h-4 w-4 text-slate-400' />
										<span className='font-medium'>Patient</span>
									</div>
									<Link
										className='text-primary hover:underline'
										params={{ id: encounter.patientId }}
										to='/patients/$id'
									>
										{encounter.patient?.firstName} {encounter.patient?.lastName}
									</Link>
									<p className='text-slate-500 text-xs'>
										DOB: {formatDate(encounter.patient?.dateOfBirth)}
									</p>
								</div>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<Stethoscope className='h-4 w-4 text-slate-400' />
										<span className='font-medium'>Doctor</span>
									</div>
									<p>Dr. {encounter.doctor?.name}</p>
									<p className='text-slate-500 text-xs'>{encounter.doctor?.specialty}</p>
								</div>
								{encounter.appointment && (
									<div className='sm:col-span-2'>
										<div className='flex items-center gap-2'>
											<Calendar className='h-4 w-4 text-slate-400' />
											<span className='font-medium'>Associated Appointment</span>
										</div>
										<Link
											className='text-primary hover:underline'
											params={{ id: encounter.appointment.id }}
											to='/appointments/$id'
										>
											{formatDate(encounter.appointment.appointmentDate)} -{" "}
											{encounter.appointment.type}
										</Link>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Symptoms & Diagnosis */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Clinical Information</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<h3 className='mb-1 font-medium text-sm'>Symptoms / Chief Complaint</h3>
									<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
										{encounter.symptoms}
									</p>
								</div>
								{encounter.diagnosis && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Diagnosis</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{encounter.diagnosis}
										</p>
									</div>
								)}
								{encounter.treatment && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Treatment Plan</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{encounter.treatment}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Additional Information */}
						{(encounter.notes || encounter.followUpPlan || encounter.prescribedMedications) && (
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>Additional Information</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									{encounter.prescribedMedications && (
										<div>
											<h3 className='mb-1 flex items-center gap-2 font-medium text-sm'>
												<Pill className='h-4 w-4' />
												Prescribed Medications
											</h3>
											<p className='text-sm'>{encounter.prescribedMedications}</p>
										</div>
									)}
									{encounter.followUpPlan && (
										<div>
											<h3 className='mb-1 font-medium text-sm'>Follow-up Plan</h3>
											<p className='text-sm'>{encounter.followUpPlan}</p>
										</div>
									)}
									{encounter.notes && (
										<div>
											<h3 className='mb-1 font-medium text-sm'>Notes</h3>
											<p className='text-sm'>{encounter.notes}</p>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Vital Signs Tab */}
					<TabsContent
						className='space-y-4'
						value='vitals'
					>
						{encounter.vitalSigns && encounter.vitalSigns.length > 0 ? (
							encounter.vitalSigns.map((vitals: DbVitalSign, index: number) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className='text-lg'>Vital Signs Recorded</CardTitle>
										<CardDescription>{formatDate(vitals.recordedAt)}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
											{vitals.bodyTemperature && (
												<div className='flex items-center gap-2'>
													<Thermometer className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>Temperature</p>
														<p className='font-medium'>{vitals.bodyTemperature}°C</p>
													</div>
												</div>
											)}
											{vitals.systolic && vitals.diastolic && (
												<div className='flex items-center gap-2'>
													<Heart className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>Blood Pressure</p>
														<p className='font-medium'>
															{vitals.systolic}/{vitals.diastolic} mmHg
														</p>
													</div>
												</div>
											)}
											{vitals.heartRate && (
												<div className='flex items-center gap-2'>
													<Heart className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>Heart Rate</p>
														<p className='font-medium'>{vitals.heartRate} bpm</p>
													</div>
												</div>
											)}
											{vitals.respiratoryRate && (
												<div className='flex items-center gap-2'>
													<Activity className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>Respiratory Rate</p>
														<p className='font-medium'>{vitals.respiratoryRate} /min</p>
													</div>
												</div>
											)}
											{vitals.oxygenSaturation && (
												<div className='flex items-center gap-2'>
													<Droplets className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>O₂ Saturation</p>
														<p className='font-medium'>{vitals.oxygenSaturation}%</p>
													</div>
												</div>
											)}
											{vitals.weight && (
												<div className='flex items-center gap-2'>
													<Weight className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>Weight</p>
														<p className='font-medium'>{vitals.weight} kg</p>
													</div>
												</div>
											)}
											{vitals.height && (
												<div className='flex items-center gap-2'>
													<Ruler className='h-4 w-4 text-slate-400' />
													<div>
														<p className='text-slate-500 text-xs'>Height</p>
														<p className='font-medium'>{vitals.height} cm</p>
													</div>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))
						) : (
							<Card>
								<CardContent className='py-12 text-center'>
									<Activity className='mx-auto h-12 w-12 text-slate-400' />
									<h3 className='mt-4 font-semibold text-lg'>No Vital Signs</h3>
									<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
										No vital signs were recorded for this encounter.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Growth Tab */}
					<TabsContent
						className='space-y-4'
						value='growth'
					>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Growth Measurements</CardTitle>
								<CardDescription>Height, weight, and BMI tracking</CardDescription>
							</CardHeader>
							<CardContent>
								{encounter.vitalSigns?.[0]?.weight ? (
									<div className='grid gap-4 sm:grid-cols-3'>
										<div className='text-center'>
											<p className='text-slate-500 text-xs'>Weight</p>
											<p className='font-bold text-xl'>{encounter.vitalSigns[0].weight} kg</p>
										</div>
										<div className='text-center'>
											<p className='text-slate-500 text-xs'>Height</p>
											<p className='font-bold text-xl'>
												{encounter.vitalSigns[0].height || "—"} cm
											</p>
										</div>
										<div className='text-center'>
											<p className='text-slate-500 text-xs'>BMI</p>
											<p className='font-bold text-xl'>
												{encounter.vitalSigns[0].weight && encounter.vitalSigns[0].height
													? (
															encounter.vitalSigns[0].weight /
															(encounter.vitalSigns[0].height / 100) ** 2
														).toFixed(1)
													: "—"}
											</p>
										</div>
									</div>
								) : (
									<p className='py-8 text-center text-slate-500 text-sm'>
										No growth measurements recorded for this encounter.
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Prescriptions Tab */}
					<TabsContent
						className='space-y-4'
						value='prescriptions'
					>
						{encounter.prescriptions && encounter.prescriptions.length > 0 ? (
							encounter.prescriptions.map(
								(
									prescription: DbPrescription & { prescribedItems?: DbPrescribedItem[] | null },
									index: number
								) => (
									<Card key={index}>
										<CardHeader>
											<div className='flex flex-wrap items-start justify-between gap-2'>
												<div>
													<CardTitle className='text-lg'>
														Prescription #{prescription.id.slice(0, 8)}
													</CardTitle>
													<CardDescription>
														Issued: {formatDate(prescription.issuedDate)} • Status:{" "}
														{prescription.status}
													</CardDescription>
												</div>
												<Link
													params={{ id: prescription.id }}
													to='/prescriptions/$id'
												>
													<Button
														size='sm'
														variant='outline'
													>
														View Details
													</Button>
												</Link>
											</div>
										</CardHeader>
										<CardContent>
											<p className='font-medium'>
												Diagnosis: {prescription.diagnosis || "Not specified"}
											</p>
											{prescription.prescribedItems &&
												prescription.prescribedItems.length > 0 && (
													<div className='mt-3 space-y-2'>
														<p className='font-medium text-sm'>Medications:</p>
														<ul className='list-inside list-disc space-y-1 text-sm'>
															{prescription.prescribedItems.map(
																(
																	item: DbPrescribedItem & { drug?: DbDrug | null },
																	i: number
																) => (
																	<li key={i}>
																		{item.drug?.name || item.drugId} -{" "}
																		{item.dosageValue} {item.dosageUnit} -{" "}
																		{item.frequency}
																	</li>
																)
															)}
														</ul>
													</div>
												)}
										</CardContent>
									</Card>
								)
							)
						) : (
							<Card>
								<CardContent className='py-12 text-center'>
									<Pill className='mx-auto h-12 w-12 text-slate-400' />
									<h3 className='mt-4 font-semibold text-lg'>No Prescriptions</h3>
									<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
										No prescriptions were created for this encounter.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
