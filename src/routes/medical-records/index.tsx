// src/routes/medical-records/index.tsx

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	Activity,
	Calendar,
	Edit,
	Eye,
	FileText,
	Filter,
	MoreHorizontal,
	Plus,
	Search,
	Stethoscope,
	Trash2,
	User
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
import { getAllMedicalRecords } from "@/data/medical-records";
import { formatDate } from "@/utils/formDate";

// type MedicalRecordWithRelations = Awaited<ReturnType<typeof getAllMedicalRecords>>[number];

export const Route = createFileRoute("/medical-records/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllMedicalRecords(),
	component: MedicalRecordsListPage
});

const statusColors: Record<string, string> = {
	ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	ON_HOLD: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

function MedicalRecordsListPage() {
	const records = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	// const [typeFilter, setTypeFilter] = useState("ALL");
	const [activeTab, setActiveTab] = useState("all");

	const getStatusCount = (status: string) => {
		return records.filter(r => r.status === status).length;
	};

	const filteredRecords = records.filter(record => {
		const matchesSearch =
			record.patient?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			record.patient?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			record.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
		const matchesTab =
			activeTab === "all" ||
			(activeTab === "active" && record.status === "ACTIVE") ||
			(activeTab === "completed" && record.status === "COMPLETED");

		return matchesSearch && matchesStatus && matchesTab;
	});

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-semibold text-2xl'>Medical Records</h1>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							View and manage all patient medical records, diagnoses, and treatment histories
						</p>
					</div>
					<Link to='/medical-records/new'>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							New Medical Record
						</Button>
					</Link>
				</div>

				{/* Stats Cards */}
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<StatCard
						color='blue'
						icon={FileText}
						title='Total Records'
						value={records.length}
					/>
					<StatCard
						color='green'
						icon={Activity}
						title='Active'
						value={getStatusCount("ACTIVE")}
					/>
					<StatCard
						color='purple'
						icon={CheckCircle}
						title='Completed'
						value={getStatusCount("COMPLETED")}
					/>
					<StatCard
						color='orange'
						icon={Calendar}
						title='This Month'
						value={
							records.filter(r => {
								const date = new Date(r.createdAt);
								const now = new Date();
								return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
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
						<TabsTrigger value='all'>All Records</TabsTrigger>
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
											placeholder='Search by patient, doctor, or diagnosis...'
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
											<SelectItem value='ACTIVE'>Active</SelectItem>
											<SelectItem value='COMPLETED'>Completed</SelectItem>
											<SelectItem value='PENDING'>Pending</SelectItem>
											<SelectItem value='ON_HOLD'>On Hold</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Records Table */}
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Medical Records</CardTitle>
								<CardDescription>
									Total {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
								</CardDescription>
							</CardHeader>
							<CardContent className='p-0'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Patient</TableHead>
											<TableHead>Doctor</TableHead>
											<TableHead>Diagnosis</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className='w-[50px]' />
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredRecords.length === 0 ? (
											<TableRow>
												<TableCell
													className='h-24 text-center text-slate-500'
													colSpan={6}
												>
													No medical records found.
												</TableCell>
											</TableRow>
										) : (
											filteredRecords.map(record => (
												<TableRow key={record.id}>
													<TableCell className='whitespace-nowrap'>
														<div className='flex items-center gap-1 text-sm'>
															<Calendar className='h-3.5 w-3.5 text-slate-400' />
															{formatDate(record.createdAt)}
														</div>
													</TableCell>
													<TableCell>
														<Link
															className='flex items-center gap-2 hover:underline'
															params={{ id: record.patientId }}
															to='/patients/$id'
														>
															<User className='h-3.5 w-3.5 text-slate-400' />
															<span className='font-medium'>
																{record.patient?.firstName} {record.patient?.lastName}
															</span>
														</Link>
													</TableCell>
													<TableCell>
														<div className='flex items-center gap-1'>
															<Stethoscope className='h-3.5 w-3.5 text-slate-400' />
															<span>Dr. {record.doctor?.name}</span>
														</div>
													</TableCell>
													<TableCell>
														<span className='line-clamp-1 text-sm'>
															{record.diagnosis || "—"}
														</span>
													</TableCell>
													<TableCell>
														<Badge
															className={record.status ? statusColors[record.status] : ""}
														>
															{record.status}
														</Badge>
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
																	params={{ id: record.id }}
																	to='/medical-records/$id'
																>
																	<DropdownMenuItem>
																		<Eye className='mr-2 h-4 w-4' />
																		View Details
																	</DropdownMenuItem>
																</Link>
																<Link
																	params={{ id: record.id }}
																	to='/medical-records/$id/edit'
																>
																	<DropdownMenuItem>
																		<Edit className='mr-2 h-4 w-4' />
																		Edit Record
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
											))
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

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
	return <svg {...props} />;
}
