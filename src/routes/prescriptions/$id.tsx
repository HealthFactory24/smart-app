// src/routes/prescriptions/$id.tsx
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle,
	Clock,
	Download,
	Edit,
	Eye,
	FileText,
	Mail,
	Phone,
	Pill,
	Printer,
	RefreshCw,
	Share2,
	Stethoscope,
	User,
	XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPrescriptionById } from "@/data/prescriptions";
import { formatDate } from "@/utils/formDate";

export const Route = createFileRoute("/prescriptions/$id")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const prescription = await getPrescriptionById({ data: params.id });
		if (!prescription) throw notFound();
		return { prescription };
	},
	component: PrescriptionDetailPage
});

const statusColors: Record<string, string> = {
	active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	expired: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
	on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
};

const statusIcons: Record<string, React.ElementType> = {
	active: CheckCircle,
	completed: CheckCircle,
	cancelled: XCircle,
	expired: Clock,
	on_hold: AlertCircle
};

function PrescriptionDetailPage() {
	const { prescription } = Route.useLoaderData();
	const { user } = Route.useRouteContext();
	const isAdmin = user?.role === "admin";
	const isStaff = user?.role === "staff" || user?.role === "doctor";
	const canEdit = isAdmin || isStaff;

	const StatusIcon = statusIcons[prescription.status] || FileText;
	const isActive = prescription.status === "active";
	const isExpiring =
		prescription.endDate &&
		new Date(prescription.endDate) > new Date() &&
		Math.ceil((new Date(prescription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7;

	return (
		<div className='mx-auto max-w-5xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<Link
						className='inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
						to='/prescriptions'
					>
						<ArrowLeft className='h-4 w-4' />
						Back to Prescriptions
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
							<Download className='mr-2 h-4 w-4' />
							Download PDF
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
								params={{ id: prescription.id }}
								to='/prescriptions/$id/edit'
							>
								<Button size='sm'>
									<Edit className='mr-2 h-4 w-4' />
									Edit
								</Button>
							</Link>
						)}
					</div>
				</div>

				{/* Prescription Header */}
				<Card>
					<CardHeader>
						<div className='flex flex-wrap items-start justify-between gap-3'>
							<div>
								<div className='flex items-center gap-2'>
									<h1 className='font-semibold text-2xl'>
										Prescription #{prescription.id.slice(0, 8)}
									</h1>
									<Badge className={statusColors[prescription.status]}>
										<StatusIcon className='mr-1 h-3 w-3' />
										{prescription.status.replace("_", " ")}
									</Badge>
									{isExpiring && isActive && (
										<Badge
											className='border-orange-500 text-orange-600'
											variant='outline'
										>
											<AlertCircle className='mr-1 h-3 w-3' />
											Expiring Soon
										</Badge>
									)}
								</div>
								<CardDescription className='mt-1'>
									Issued {formatDate(prescription.issuedDate)} •
									{prescription.validUntil && ` Valid until ${formatDate(prescription.validUntil)}`}
								</CardDescription>
							</div>
							{isActive && (
								<Button
									className='gap-2'
									variant='outline'
								>
									<RefreshCw className='h-4 w-4' />
									Request Refill
								</Button>
							)}
						</div>
					</CardHeader>
				</Card>

				<Tabs
					className='space-y-6'
					defaultValue='details'
				>
					<TabsList className='grid w-full max-w-md grid-cols-3'>
						<TabsTrigger value='details'>Prescription Details</TabsTrigger>
						<TabsTrigger value='medications'>Medications</TabsTrigger>
						<TabsTrigger value='history'>History</TabsTrigger>
					</TabsList>

					{/* Details Tab */}
					<TabsContent
						className='space-y-4'
						value='details'
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
										params={{ id: prescription.patientId }}
										to='/patients/$id'
									>
										{prescription.patient?.firstName} {prescription.patient?.lastName}
									</Link>
									{prescription.patient?.mrn && (
										<p className='text-slate-500 text-xs'>MRN: {prescription.patient.mrn}</p>
									)}
									<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
										<Mail className='h-3.5 w-3.5' />
										<span>{prescription.patient?.email || "No email"}</span>
									</div>
									<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
										<Phone className='h-3.5 w-3.5' />
										<span>{prescription.patient?.phone || "No phone"}</span>
									</div>
								</div>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<Stethoscope className='h-4 w-4 text-slate-400' />
										<span className='font-medium'>Prescribing Doctor</span>
									</div>
									<p>Dr. {prescription.doctor?.name}</p>
									<p className='text-slate-500 text-xs'>{prescription.doctor?.specialty}</p>
									{prescription.doctor?.phone && (
										<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
											<Phone className='h-3.5 w-3.5' />
											<span>{prescription.doctor.phone}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Diagnosis & Notes */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Clinical Information</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								{prescription.diagnosis && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Diagnosis</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{prescription.diagnosis}
										</p>
									</div>
								)}
								{prescription.notes && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Additional Notes</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{prescription.notes}
										</p>
									</div>
								)}
								{prescription.instructions && (
									<div>
										<h3 className='mb-1 font-medium text-sm'>Special Instructions</h3>
										<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
											{prescription.instructions}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* Medications Tab */}
					<TabsContent
						className='space-y-4'
						value='medications'
					>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Medications</CardTitle>
								<CardDescription>Prescribed medications and dosage instructions</CardDescription>
							</CardHeader>
							<CardContent>
								{prescription.prescribedItems && prescription.prescribedItems.length > 0 ? (
									<div className='space-y-4'>
										{prescription.prescribedItems.map((item, idx) => (
											<div
												className='rounded-lg border p-4 dark:border-slate-700'
												key={idx}
											>
												<div className='flex flex-wrap items-start justify-between gap-2'>
													<div>
														<h3 className='font-semibold text-lg'>
															{item.drug?.name || item.drugId}
														</h3>
														{item.drug?.genericName && (
															<p className='text-slate-500 text-sm'>
																Generic: {item.drug.genericName}
															</p>
														)}
													</div>
													<Badge variant='outline'>
														{item.drugRoute?.replace("_", " ") || "Oral"}
													</Badge>
												</div>

												<Separator className='my-3' />

												<div className='grid gap-3 sm:grid-cols-2'>
													<div>
														<p className='text-slate-500 text-xs'>Dosage</p>
														<p className='font-medium'>
															{item.dosageValue} {item.dosageUnit}
														</p>
													</div>
													<div>
														<p className='text-slate-500 text-xs'>Frequency</p>
														<p className='font-medium'>
															{item.frequency.replace(/_/g, " ")}
														</p>
													</div>
													<div>
														<p className='text-slate-500 text-xs'>Duration</p>
														<p className='font-medium'>{item.duration}</p>
													</div>
													{item.refillsRemaining !== undefined && (
														<div>
															<p className='text-slate-500 text-xs'>Refills Remaining</p>
															<p className='font-medium'>{item.refillsRemaining}</p>
														</div>
													)}
												</div>

												{item.instructions && (
													<div className='mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800'>
														<p className='flex items-center gap-2 text-sm'>
															<FileText className='h-4 w-4 text-slate-400' />
															{item.instructions}
														</p>
													</div>
												)}

												{/* Dispense History */}
												{item.dispenses && item.dispenses.length > 0 && (
													<div className='mt-3'>
														<p className='mb-2 text-slate-500 text-xs'>Dispense History</p>
														<div className='space-y-1'>
															{item.dispenses.map((dispense, dIdx) => (
																<div
																	className='flex items-center justify-between text-sm'
																	key={dIdx}
																>
																	<span>{formatDate(dispense.dispensedAt)}</span>
																	<span>{dispense.quantityDispensed} units</span>
																	<Badge
																		className='text-xs'
																		variant='outline'
																	>
																		Dispensed
																	</Badge>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<div className='py-8 text-center'>
										<Pill className='mx-auto h-12 w-12 text-slate-400' />
										<p className='mt-2 text-slate-500'>No medications listed</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* History Tab */}
					<TabsContent
						className='space-y-4'
						value='history'
					>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Prescription History</CardTitle>
								<CardDescription>Track changes and updates to this prescription</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{/* Status Timeline */}
									<div className='relative'>
										<div className='absolute top-0 left-4 h-full w-px bg-slate-200 dark:bg-slate-700' />
										<div className='space-y-6'>
											{/* Created */}
											<div className='relative flex gap-4'>
												<div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
													<FileText className='h-4 w-4 text-green-600 dark:text-green-400' />
												</div>
												<div className='flex-1'>
													<p className='font-medium'>Prescription Created</p>
													<p className='text-slate-500 text-sm'>
														By Dr. {prescription.doctor?.name}
													</p>
													<p className='text-slate-400 text-xs'>
														{formatDate(prescription.issuedDate)}
													</p>
												</div>
											</div>

											{/* Status Changes */}
											{prescription.status !== "active" && (
												<div className='relative flex gap-4'>
													<div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
														<StatusIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
													</div>
													<div className='flex-1'>
														<p className='font-medium'>
															Status Changed to {prescription.status.replace("_", " ")}
														</p>
														<p className='text-slate-500 text-sm'>
															Prescription {prescription.status}
														</p>
														<p className='text-slate-400 text-xs'>
															{formatDate(prescription.updatedAt)}
														</p>
													</div>
												</div>
											)}

											{/* Refill History */}
											{prescription.prescribedItems?.some(item => item.dispenses?.length) && (
												<div className='relative flex gap-4'>
													<div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
														<RefreshCw className='h-4 w-4 text-purple-600 dark:text-purple-400' />
													</div>
													<div className='flex-1'>
														<p className='font-medium'>Prescription Filled</p>
														<p className='text-slate-500 text-sm'>
															Medications dispensed to patient
														</p>
														<p className='text-slate-400 text-xs'>
															Last filled:{" "}
															{formatDate(
																prescription.prescribedItems
																	.flatMap(item => item.dispenses || [])
																	.sort(
																		(a, b) =>
																			new Date(b.dispensedAt).getTime() -
																			new Date(a.dispensedAt).getTime()
																	)[0]?.dispensedAt
															)}
														</p>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
