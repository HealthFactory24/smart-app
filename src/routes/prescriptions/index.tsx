// src/routes/prescriptions/index.tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	Eye,
	FileText,
	Filter,
	MoreHorizontal,
	Pill,
	Plus,
	Search,
	Stethoscope,
	Trash2,
	User,
	XCircle
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllPrescriptions } from "@/data/prescriptions";
import { formatDate } from "@/utils/formDate";

type PrescriptionWithRelations = Awaited<ReturnType<typeof getAllPrescriptions>>[number];

export const Route = createFileRoute("/prescriptions/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllPrescriptions(),
	component: PrescriptionsListPage
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

function PrescriptionsListPage() {
	const prescriptions = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [activeTab, setActiveTab] = useState("all");

	const getStatusCount = (status: string) => {
		return prescriptions.filter(p => p.status === status).length;
	};

	const filteredPrescriptions = prescriptions.filter(prescription => {
		const matchesSearch =
			prescription.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			prescription.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			prescription.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			prescription.medicationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			prescription.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "ALL" || prescription.status === statusFilter;
		const matchesTab =
			activeTab === "all" ||
			(activeTab === "active" && prescription.status === "active") ||
			(activeTab === "completed" && prescription.status === "completed");

		return matchesSearch && matchesStatus && matchesTab;
	});

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-semibold text-2xl'>Prescriptions</h1>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							Manage and track patient prescriptions and medications
						</p>
					</div>
					<Link to='/prescriptions/new'>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							New Prescription
						</Button>
					</Link>
				</div>

				{/* Stats Cards */}
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<StatCard
						color='blue'
						icon={Pill}
						title='Total Prescriptions'
						value={prescriptions.length}
					/>
					<StatCard
						color='green'
						icon={CheckCircle}
						title='Active'
						value={getStatusCount("active")}
					/>
					<StatCard
						color='purple'
						icon={CheckCircle}
						title='Completed'
						value={getStatusCount("completed")}
					/>
					<StatCard
						color='orange'
						icon={Clock}
						title='Expiring Soon'
						value={
							prescriptions.filter(p => {
								if (!p.validUntil) return false;
								const daysUntilExpiry = Math.ceil(
									(new Date(p.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
								);
								return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
							}).length
						}
					/>
				</div>

				{/* Tabs */}
				<Tabs
					defaultValue='all'
					onValueChange={setActiveTab}
					value={activeTab}
				>
					<TabsList className='grid w-full max-w-md grid-cols-3'>
						<TabsTrigger value='all'>All</TabsTrigger>
						<TabsTrigger value='active'>Active</TabsTrigger>
						<TabsTrigger value='completed'>Completed</TabsTrigger>
					</TabsList>

					<TabsContent
						className='space-y-4 pt-4'
						value={activeTab}
					>
						{/* Filters */}
						<Card>
							<CardContent className='pt-6'>
								<div className='flex flex-col gap-4 sm:flex-row'>
									<div className='relative flex-1'>
										<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
										<Input
											className='pl-9'
											onChange={e => setSearchQuery(e.target.value)}
											placeholder='Search by patient, doctor, medication, or diagnosis...'
											value={searchQuery}
										/>
									</div>
									<Select
										onValueChange={setStatusFilter}
										value={statusFilter}
									>
										<SelectTrigger className='w-40'>
											<Filter className='mr-2 h-4 w-4' />
											<SelectValue placeholder='Status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='ALL'>All Status</SelectItem>
											<SelectItem value='active'>Active</SelectItem>
											<SelectItem value='completed'>Completed</SelectItem>
											<SelectItem value='cancelled'>Cancelled</SelectItem>
											<SelectItem value='expired'>Expired</SelectItem>
											<SelectItem value='on_hold'>On Hold</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Prescriptions Table */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Prescriptions</CardTitle>
								<CardDescription>
									Total {filteredPrescriptions.length} prescription
									{filteredPrescriptions.length !== 1 ? "s" : ""}
								</CardDescription>
							</CardHeader>
							<CardContent className='p-0'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Patient</TableHead>
											<TableHead>Doctor</TableHead>
											<TableHead>Medication</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Valid Until</TableHead>
											<TableHead className='w-[50px]' />
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredPrescriptions.length === 0 ? (
											<TableRow>
												<TableCell
													className='h-24 text-center text-slate-500'
													colSpan={7}
												>
													No prescriptions found.
												</TableCell>
											</TableRow>
										) : (
											filteredPrescriptions.map(prescription => {
												const StatusIcon = statusIcons[prescription.status] || FileText;
												return (
													<TableRow key={prescription.id}>
														<TableCell className='whitespace-nowrap'>
															<div className='flex items-center gap-1 text-sm'>
																<Calendar className='h-3.5 w-3.5 text-slate-400' />
																{formatDate(prescription.issuedDate)}
															</div>
														</TableCell>
														<TableCell>
															<Link
																className='flex items-center gap-2 hover:underline'
																params={{ id: prescription.patientId }}
																to='/patients/$id'
															>
																<User className='h-3.5 w-3.5 text-slate-400' />
																<span className='font-medium'>
																	{prescription.patient?.firstName}{" "}
																	{prescription.patient?.lastName}
																</span>
															</Link>
														</TableCell>
														<TableCell>
															<div className='flex items-center gap-1'>
																<Stethoscope className='h-3.5 w-3.5 text-slate-400' />
																<span>Dr. {prescription.doctor?.name}</span>
															</div>
														</TableCell>
														<TableCell>
															<div className='flex items-center gap-1'>
																<Pill className='h-3.5 w-3.5 text-slate-400' />
																<span className='line-clamp-1 text-sm'>
																	{prescription.medicationName ||
																		"Multiple medications"}
																</span>
															</div>
														</TableCell>
														<TableCell>
															<Badge className={statusColors[prescription.status]}>
																<StatusIcon className='mr-1 h-3 w-3' />
																{prescription.status.replace("_", " ")}
															</Badge>
														</TableCell>
														<TableCell>
															<span className='text-sm'>
																{prescription.validUntil
																	? formatDate(prescription.validUntil)
																	: "—"}
															</span>
														</TableCell>
														<TableCell>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		size='icon'
																		variant='ghost'
																	>
																		<MoreHorizontal className='h-4 w-4' />
																		<span className='sr-only'>Open menu</span>
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align='end'>
																	<DropdownMenuLabel>Actions</DropdownMenuLabel>
																	<Link
																		params={{ id: prescription.id }}
																		to='/prescriptions/$id'
																	>
																		<DropdownMenuItem>
																			<Eye className='mr-2 h-4 w-4' />
																			View Details
																		</DropdownMenuItem>
																	</Link>
																	<Link
																		params={{ id: prescription.id }}
																		to='/prescriptions/$id/edit'
																	>
																		<DropdownMenuItem>
																			<Edit className='mr-2 h-4 w-4' />
																			Edit Prescription
																		</DropdownMenuItem>
																	</Link>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem className='text-red-600'>
																		<Trash2 className='mr-2 h-4 w-4' />
																		Delete
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												);
											})
										)}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	icon: Icon,
	color
}: {
	title: string;
	value: number;
	icon: React.ElementType;
	color: "blue" | "green" | "purple" | "orange";
}) {
	const colorClasses = {
		blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
		green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
		purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
		orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
	};

	return (
		<Card>
			<CardContent className='flex items-center gap-4 p-4'>
				<div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClasses[color]}`}>
					<Icon className='h-5 w-5' />
				</div>
				<div>
					<p className='text-slate-500 text-xs'>{title}</p>
					<p className='font-bold text-xl'>{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}
