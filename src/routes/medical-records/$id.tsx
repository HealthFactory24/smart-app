// src/routes/medical-records/$id.tsx
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
	Activity,
	AlertCircle,
	ArrowLeft,
	Calendar,
	Clock,
	Droplets,
	Edit,
	FileText,
	Heart,
	Mail,
	Phone,
	Pill,
	Printer,
	Ruler,
	Share2,
	Stethoscope,
	Syringe,
	Thermometer,
	User,
	Weight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMedicalRecordById } from "@/data/medical-records";
import { formatDate } from "@/utils/formDate";
import { calculateAge, calculateBMI } from "@/utils/growth";

export const Route = createFileRoute("/medical-records/$id")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const record = await getMedicalRecordById({ data: params.id });
		if (!record) throw notFound();
		return { record };
	},
	component: MedicalRecordDetailPage
});

const statusColors: Record<string, string> = {
	ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	ON_HOLD: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
};

function MedicalRecordDetailPage() {
	const { record } = Route.useLoaderData();
	const { user } = Route.useRouteContext();
	const isAdmin = user?.role === "admin";
	const isStaff = user?.role === "staff" || user?.role === "doctor";
	const canEdit = isAdmin || isStaff;

	const patientAge = record.patient?.dateOfBirth
		? (calculateAge(record.patient.dateOfBirth, "string") as string)
		: "N/A";

	const bmi =
		record.vitalSigns?.[0]?.weight && record.vitalSigns?.[0]?.height
			? calculateBMI(record.vitalSigns[0].weight, record.vitalSigns[0].height)
			: null;

	return (
		<div className='mx-auto max-w-5xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<Link
						className='inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
						to='/medical-records'
					>
						<ArrowLeft className='h-4 w-4' />
						Back to Records
					</Link>
					<div className='flex gap-2'>
						<Button
							size='sm'
							variant='outline'
						>
							<Printer className='mr-2 h-4 w-4' />
							Print
						</Button>
						<Button
							size='sm'
							variant='outline'
						>
							<Share2 className='mr-2 h-4 w-4' />
							Share
						</Button>
						{canEdit && (
							<Link
								params={{ id: record.id }}
								to='/medical-records/$id/edit'
							>
								<Button size='sm'>
									<Edit className='mr-2 h-4 w-4' />
									Edit Record
								</Button>
							</Link>
						)}
					</div>
				</div>

				{/* Record Header */}
				<Card>
					<CardHeader>
						<div className='flex flex-wrap items-start justify-between gap-3'>
							<div>
								<div className='flex items-center gap-2'>
									<h1 className='font-semibold text-2xl'>Medical Record</h1>
									<Badge className={statusColors[record.status]}>{record.status}</Badge>
								</div>
								<CardDescription className='mt-1'>
									Created {formatDate(record.createdAt)} • Last updated {formatDate(record.updatedAt)}
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
						<TabsTrigger value='medications'>Medications</TabsTrigger>
						<TabsTrigger value='lab-results'>Lab Results</TabsTrigger>
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
										params={{ id: record.patientId }}
										to='/patients/$id'
									>
										{record.patient?.firstName} {record.patient?.lastName}
									</Link>
									<p className='text-slate-500 text-xs'>
										DOB: {formatDate(record.patient?.dateOfBirth)} ({patientAge})
									</p>
									{record.patient?.mrn && (
										<p className='text-slate-500 text-xs'>MRN: {record.patient.mrn}</p>
									)}
								</div>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<Stethoscope className='h-4 w-4 text-slate-400' />
										<span className='font-medium'>Doctor</span>
									</div>
									<p>Dr. {record.doctor?.name}</p>
									<p className='text-slate-500 text-xs'>{record.doctor?.specialty}</p>
								</div>
								{record.appointment && (
									<div className='sm:col-span-2'>
										<div className='flex items-center gap-2'>
											<Calendar className='h-4 w-4 text-slate-400' />
											<span className='font-medium'>Associated Appointment</span>
										</div>
										<Link
											className='text-primary hover:underline'
											params={{ id: record.appointment.id }}
											to='/appointments/$id'
										>
											{formatDate(record.appointment.appointmentDate)} - {record.appointment.type}
										</Link>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Clinical Information */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Clinical Information</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								{record.symptoms && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Symptoms / Chief Complaint</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{record.symptoms}
										</p>
									</div>
								)}
								{record.diagnosis && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Diagnosis</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{record.diagnosis}
										</p>
									</div>
								)}
								{record.treatmentPlan && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Treatment Plan</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{record.treatmentPlan}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Additional Information */}
						{(record.notes || record.labRequest || record.followUpDate) && (
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>Additional Information</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									{record.labRequest && (
										<div>
											<h3 className='mb-1 flex items-center gap-2 font-medium text-sm'>
												<Activity className='h-4 w-4' />
												Lab Requests
											</h3>
											<p className='text-sm'>{record.labRequest}</p>
										</div>
									)}
									{record.followUpDate && (
										<div>
											<h3 className='mb-1 flex items-center gap-2 font-medium text-sm'>
												<Calendar className='h-4 w-4' />
												Follow-up Date
											</h3>
											<p className='text-sm'>{formatDate(record.followUpDate)}</p>
										</div>
									)}
									{record.notes && (
										<div>
											<h3 className='mb-1 font-medium text-sm'>Notes</h3>
											<p className='text-sm'>{record.notes}</p>
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
						{record.vitalSigns && record.vitalSigns.length > 0 ? (
							record.vitalSigns.map((vitals, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className='text-lg'>Vital Signs</CardTitle>
										<CardDescription>Recorded on {formatDate(vitals.recordedAt)}</CardDescription>
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
										{bmi && (
											<div className='mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
												<p className='text-sm'>
													<span className='font-medium'>BMI:</span> {bmi.bmi} ({bmi.status})
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							))
						) : (
							<Card>
								<CardContent className='py-12 text-center'>
									<Activity className='mx-auto h-12 w-12 text-slate-400' />
									<h3 className='mt-4 font-semibold text-lg'>No Vital Signs</h3>
									<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
										No vital signs recorded for this medical record.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Medications Tab */}
					<TabsContent
						className='space-y-4'
						value='medications'
					>
						{record.prescriptions && record.prescriptions.length > 0 ? (
							record.prescriptions.map(prescription => (
								<Card key={prescription.id}>
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
										{prescription.diagnosis && (
											<p className='mb-3 font-medium'>Diagnosis: {prescription.diagnosis}</p>
										)}
										{prescription.prescribedItems && prescription.prescribedItems.length > 0 && (
											<div className='space-y-3'>
												<h4 className='font-medium text-sm'>Medications:</h4>
												<div className='space-y-2'>
													{prescription.prescribedItems.map((item, idx) => (
														<div
															className='rounded-lg border p-3 dark:border-slate-700'
															key={idx}
														>
															<div className='flex items-start justify-between'>
																<div>
																	<p className='font-medium'>
																		{item.drug?.name || item.drugId}
																	</p>
																	<p className='text-slate-600 text-sm dark:text-slate-400'>
																		{item.dosageValue} {item.dosageUnit} •{" "}
																		{item.frequency.replace(/_/g, " ")}
																	</p>
																	{item.duration && (
																		<p className='text-slate-500 text-xs'>
																			Duration: {item.duration}
																		</p>
																	)}
																</div>
																<Pill className='h-5 w-5 text-slate-400' />
															</div>
															{item.instructions && (
																<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
																	{item.instructions}
																</p>
															)}
														</div>
													))}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							))
						) : (
							<Card>
								<CardContent className='py-12 text-center'>
									<Pill className='mx-auto h-12 w-12 text-slate-400' />
									<h3 className='mt-4 font-semibold text-lg'>No Medications</h3>
									<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
										No prescriptions recorded for this medical record.
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Lab Results Tab */}
					<TabsContent
						className='space-y-4'
						value='lab-results'
					>
						{record.labRequest && record.labRequest.length > 0 ? (
							record.labRequest.map(labTest => (
								<Card key={labTest.id}>
									<CardHeader>
										<div className='flex flex-wrap items-start justify-between gap-2'>
											<div>
												<CardTitle className='text-lg'>
													{labTest.service?.serviceName || "Lab Test"}
												</CardTitle>
												<CardDescription>
													Test Date: {formatDate(labTest.testDate)}
												</CardDescription>
											</div>
											<Badge
												className={
													labTest.status === "COMPLETED"
														? "bg-green-100 text-green-700"
														: labTest.status === "PENDING"
															? "bg-yellow-100 text-yellow-700"
															: "bg-red-100 text-red-700"
												}
											>
												{labTest.status}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className='space-y-3'>
										{labTest.result && (
											<div>
												<h4 className='mb-1 font-medium text-sm'>Result</h4>
												<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
													{labTest.result}
												</p>
											</div>
										)}
										{labTest.notes && (
											<div>
												<h4 className='mb-1 font-medium text-sm'>Notes</h4>
												<p className='text-sm'>{labTest.notes}</p>
											</div>
										)}
									</CardContent>
								</Card>
							))
						) : (
							<Card>
								<CardContent className='py-12 text-center'>
									<TestTube className='mx-auto h-12 w-12 text-slate-400' />
									<h3 className='mt-4 font-semibold text-lg'>No Lab Results</h3>
									<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
										No lab results recorded for this medical record.
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

function TestTube(props: React.SVGProps<SVGSVGElement>) {
	return <svg {...props} />;
}
