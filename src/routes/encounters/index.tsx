// src/routes/encounters/index.tsx

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Calendar, Filter, Plus, Search, Stethoscope, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllEncounters } from "@/data/diagnosis";
import { formatDate } from "@/utils/formDate";

export const Route = createFileRoute("/encounters/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role === "patient") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllEncounters(),
	component: EncountersListPage
});

function EncountersListPage() {
	const encounters = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");

	const filteredEncounters = encounters.filter(encounter => {
		const matchesSearch =
			encounter.patientFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			encounter.patientLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			encounter.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			encounter.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "ALL" || encounter.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			case "COMPLETED":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
			case "ON_HOLD":
				return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
			default:
				return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
		}
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-semibold text-2xl'>Patient Encounters</h1>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							View all patient visits, diagnoses, and treatment records
						</p>
					</div>
					<Link to='/encounters/new'>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							New Encounter
						</Button>
					</Link>
				</div>

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
									<SelectItem value='ON_HOLD'>On Hold</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Encounters Table */}
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>All Encounters</CardTitle>
						<CardDescription>
							Total {filteredEncounters.length} encounter{filteredEncounters.length !== 1 ? "s" : ""}
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
								{filteredEncounters.length === 0 ? (
									<TableRow>
										<TableCell
											className='h-24 text-center text-slate-500'
											colSpan={6}
										>
											No encounters found.
										</TableCell>
									</TableRow>
								) : (
									filteredEncounters.map(encounter => (
										<TableRow key={encounter.id}>
											<TableCell className='whitespace-nowrap'>
												<div className='flex items-center gap-1 text-sm'>
													<Calendar className='h-3.5 w-3.5 text-slate-400' />
													{formatDate(encounter.date)}
												</div>
											</TableCell>
											<TableCell>
												<Link
													className='flex items-center gap-2 hover:underline'
													params={{ id: encounter.patientId }}
													to='/patients/$id'
												>
													<User className='h-3.5 w-3.5 text-slate-400' />
													<span className='font-medium'>
														{encounter.patientFirstName} {encounter.patientLastName}
													</span>
												</Link>
											</TableCell>
											<TableCell>
												<div className='flex items-center gap-1'>
													<Stethoscope className='h-3.5 w-3.5 text-slate-400' />
													<span>Dr. {encounter.doctorName}</span>
												</div>
											</TableCell>
											<TableCell>
												<span className='line-clamp-1 text-sm'>
													{encounter.diagnosis || "—"}
												</span>
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(encounter.status ?? "")}>
													{encounter.status || "ACTIVE"}
												</Badge>
											</TableCell>
											<TableCell>
												<Link
													params={{ id: encounter.id }}
													to='/encounters/$id'
												>
													<Button
														size='sm'
														variant='ghost'
													>
														View
													</Button>
												</Link>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
