// src/components/dashboard/ClinicalDashboard.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { getDashboardUpcomingAppointments } from "@/data/appointments";
import type { getRecentEncounters } from "@/data/diagnosis";
import type { getDueImmunizations } from "@/data/immunization";
import type { getRecentPatients } from "@/data/patients";
import { formatDate } from "@/utils/formDate";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, Calendar, FileText, Stethoscope, Syringe, Users } from "lucide-react";
import { memo, useMemo } from "react";

interface ClinicalDashboardProps {
	upcomingAppointments: Awaited<ReturnType<typeof getDashboardUpcomingAppointments>>;
	dueImmunizations: Awaited<ReturnType<typeof getDueImmunizations>>;
	recentPatients: Awaited<ReturnType<typeof getRecentPatients>>;
	recentEncounters: Awaited<ReturnType<typeof getRecentEncounters>>;
}

export const ClinicalDashboard = memo(function ClinicalDashboard({
	upcomingAppointments,
	dueImmunizations,
	recentPatients,
	recentEncounters
}: ClinicalDashboardProps) {
	const hasOverdueImmunizations = useMemo(() => dueImmunizations.some(imm => imm.isOverDue), [dueImmunizations]);

	return (
		<section>
			<div className='mb-4 flex items-center justify-between'>
				<h2 className='font-semibold text-xl'>Clinical Dashboard</h2>
				<Link to='/dashboard'>
					<Button
						size='sm'
						variant='ghost'
					>
						View Full Dashboard
						<ArrowRightIcon className='ml-1 h-4 w-4' />
					</Button>
				</Link>
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				{/* Upcoming Appointments */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Calendar className='h-5 w-5' />
							Upcoming Appointments
						</CardTitle>
						<CardDescription>Today's schedule and upcoming visits</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{upcomingAppointments.length === 0 ? (
							<p className='py-6 text-center text-slate-500 text-sm'>No upcoming appointments</p>
						) : (
							upcomingAppointments.map((apt) => (
								<Link
									className='block'
									key={apt.id}
									params={{ id: apt.id }}
									to='/appointments/$id'
								>
									<div className='flex items-center justify-between rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800'>
										<div className='space-y-0.5'>
											<p className='font-medium text-sm'>
												{apt.patient?.firstName} {apt.patient?.lastName}
											</p>
											<p className='flex items-center gap-2 text-slate-500 text-xs'>
												<Stethoscope className='h-3 w-3' />
												Dr. {apt.doctor?.name}
											</p>
										</div>
										<div className='text-right'>
											<p className='font-medium text-sm'>{apt.time}</p>
											<p className='text-slate-500 text-xs'>{formatDate(apt.appointmentDate)}</p>
										</div>
									</div>
								</Link>
							))
						)}
					</CardContent>
				</Card>

				{/* Due Immunizations */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Syringe className='h-5 w-5' />
							Due Immunizations
							{dueImmunizations.length > 0 && (
								<Badge variant={hasOverdueImmunizations ? "destructive" : "default"}>
									{dueImmunizations.length}
								</Badge>
							)}
						</CardTitle>
						<CardDescription>Vaccinations due or overdue</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{dueImmunizations.length === 0 ? (
							<p className='py-6 text-center text-slate-500 text-sm'>All immunizations up to date</p>
						) : (
							dueImmunizations.map(imm => (
								<div
									className='flex items-center justify-between rounded-lg border p-3'
									key={imm.id}
								>
									<div>
										<p className='font-medium text-sm'>{imm.vaccine}</p>
										<p className='text-slate-500 text-xs'>
											{imm.patient?.firstName} {imm.patient?.lastName}
										</p>
									</div>
									<Badge variant={imm.isOverDue ? "destructive" : "outline"}>
										{imm.isOverDue ? "Overdue" : "Due Soon"}
									</Badge>
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Recent Patients */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Users className='h-5 w-5' />
							Recent Patients
						</CardTitle>
						<CardDescription>Newly registered children</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{recentPatients.length === 0 ? (
							<p className='py-6 text-center text-slate-500 text-sm'>No recent patients</p>
						) : (
							recentPatients.map(patient => (
								<Link
									className='block'
									key={patient.id}
									params={{ id: patient.id }}
									to='/patients/$id'
								>
									<div className='flex items-center justify-between rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800'>
										<div>
											<p className='font-medium text-sm'>
												{patient.firstName} {patient.lastName}
											</p>
											<p className='text-slate-500 text-xs'>MRN: {patient.mrn}</p>
										</div>
										<ArrowRightIcon className='h-4 w-4 text-slate-400' />
									</div>
								</Link>
							))
						)}
					</CardContent>
				</Card>

				{/* Recent Encounters */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<FileText className='h-5 w-5' />
							Recent Encounters
						</CardTitle>
						<CardDescription>Latest consultations and diagnoses</CardDescription>
					</CardHeader>
					<CardContent className='max-h-[400px] space-y-3 overflow-y-auto'>
						{recentEncounters.length === 0 ? (
							<p className='py-6 text-center text-slate-500 text-sm'>No recent encounters</p>
						) : (
							recentEncounters.map(encounter => (
								<Link
									className='block'
									key={encounter.id}
									params={{ id: encounter.id }}
									to='/encounters/$id'
								>
									<div className='flex items-center justify-between rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800'>
										<div>
											<p className='font-medium text-sm'>
												{encounter.patientFirstName} {encounter.patientLastName}
											</p>
											<p className='text-slate-500 text-xs'>
												{encounter.diagnosis || "No diagnosis"}
											</p>
										</div>
										<div className='text-right'>
											<p className='text-slate-500 text-xs'>{formatDate(encounter.date)}</p>
											<ArrowRightIcon className='mt-1 h-4 w-4 text-slate-400' />
										</div>
									</div>
								</Link>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
});
