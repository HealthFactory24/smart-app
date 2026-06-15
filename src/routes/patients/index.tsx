// src/routes/patients/index.tsx

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Mail, MoreHorizontal, Phone, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllPatients } from "@/data/patients";
import { formatDate, getInitials } from "@/utils/formDate";
import { calculateAge } from "@/utils/growth";

export const Route = createFileRoute("/patients/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	loader: async () => getAllPatients(),
	component: PatientsListPage
});

function PatientsListPage() {
	const patients = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");

	const filteredPatients = patients.filter(
		patient =>
			patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			patient.mrn?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
			case "INACTIVE":
				return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
			default:
				return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
		}
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-semibold text-2xl'>Patients</h1>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							Manage and view all patient records
						</p>
					</div>
					<Link to='/patients/new'>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							Add New Patient
						</Button>
					</Link>
				</div>

				{/* Search Bar */}
				<Card>
					<CardContent className='pt-6'>
						<div className='relative'>
							<Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
							<Input
								className='pl-9'
								onChange={e => setSearchQuery(e.target.value)}
								placeholder='Search by name or MRN...'
								value={searchQuery}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Patients Table */}
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>All Patients</CardTitle>
						<CardDescription>
							Total {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
						</CardDescription>
					</CardHeader>
					<CardContent className='p-0'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Patient</TableHead>
									<TableHead>MRN</TableHead>
									<TableHead>Age</TableHead>
									<TableHead>Gender</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className='w-[50px]' />
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredPatients.length === 0 ? (
									<TableRow>
										<TableCell
											className='h-24 text-center text-slate-500'
											colSpan={7}
										>
											No patients found.
										</TableCell>
									</TableRow>
								) : (
									filteredPatients.map(patient => (
										<TableRow key={patient.id}>
											<TableCell>
												<Link
													className='flex items-center gap-3 hover:underline'
													params={{ id: patient.id }}
													to='/patients/$id'
												>
													<Avatar className='h-9 w-9'>
														<AvatarImage src={patient.image || undefined} />
														<AvatarFallback className='bg-primary/10 text-primary text-xs'>
															{getInitials(patient.firstName, patient.lastName)}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className='font-medium text-sm'>
															{patient.firstName} {patient.lastName}
														</p>
														<p className='text-slate-500 text-xs'>
															DOB: {formatDate(patient.dateOfBirth)}
														</p>
													</div>
												</Link>
											</TableCell>
											<TableCell>
												<span className='font-mono text-sm'>{patient.mrn || "—"}</span>
											</TableCell>
											<TableCell>
												<span className='text-sm'>
													{calculateAge(patient.dateOfBirth, "string") as string}
												</span>
											</TableCell>
											<TableCell>
												<span className='text-sm capitalize'>
													{patient.gender?.toLowerCase() || "—"}
												</span>
											</TableCell>
											<TableCell>
												<div className='space-y-0.5'>
													{patient.phone && (
														<div className='flex items-center gap-1 text-slate-500 text-xs'>
															<Phone className='h-3 w-3' />
															{patient.phone}
														</div>
													)}
													{patient.email && (
														<div className='flex items-center gap-1 text-slate-500 text-xs'>
															<Mail className='h-3 w-3' />
															{patient.email}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(patient.status || "ACTIVE")}>
													{patient.status || "ACTIVE"}
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
															params={{ id: patient.id }}
															to='/patients/$id'
														>
															<DropdownMenuItem>View Details</DropdownMenuItem>
														</Link>
														<Link
															params={{ id: patient.id }}
															to='/patients/$id/edit'
														>
															<DropdownMenuItem>Edit Patient</DropdownMenuItem>
														</Link>
														<DropdownMenuSeparator />
														<DropdownMenuItem className='text-red-600'>
															Deactivate
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
			</div>
		</div>
	);
}
