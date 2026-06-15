// src/routes/appointments/index.tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Calendar, Clock, FileText, Stethoscope, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyAppointments } from "@/data/appointments";
import { formatDate, formatTime } from "@/utils/formDate";

type AppointmentListItem = Awaited<ReturnType<typeof getMyAppointments>>[number];

export const Route = createFileRoute("/appointments/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	loader: async () => getMyAppointments(),
	component: MyAppointmentsPage
});

const statusColors = {
	PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	NO_SHOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
};

const statusLabels = {
	PENDING: "Pending",
	CONFIRMED: "Confirmed",
	COMPLETED: "Completed",
	CANCELLED: "Cancelled",
	NO_SHOW: "No Show"
};

function MyAppointmentsPage() {
	const appointments = Route.useLoaderData();

	const upcoming = appointments.filter(
		apt => new Date(apt.appointmentDate) >= new Date() && apt.status !== "CANCELLED" && apt.status !== "COMPLETED"
	);

	const past = appointments.filter(apt => new Date(apt.appointmentDate) < new Date() || apt.status === "COMPLETED");

	return (
		<div className='mx-auto max-w-4xl space-y-6 py-8'>
			<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
				<div>
					<h1 className='font-semibold text-2xl'>My Appointments</h1>
					<p className='text-slate-600 text-sm dark:text-slate-400'>
						View and manage your scheduled appointments
					</p>
				</div>
				<Link to='/appointments/book'>
					<Button>
						<Calendar className='mr-2 h-4 w-4' />
						Book New Appointment
					</Button>
				</Link>
			</div>

			<Tabs
				className='space-y-4'
				defaultValue='upcoming'
			>
				<TabsList>
					<TabsTrigger value='upcoming'>Upcoming ({upcoming.length})</TabsTrigger>
					<TabsTrigger value='past'>Past ({past.length})</TabsTrigger>
				</TabsList>

				<TabsContent
					className='space-y-4'
					value='upcoming'
				>
					{upcoming.length === 0 ? (
						<EmptyAppointmentsState type='upcoming' />
					) : (
						upcoming.map(appointment => (
							<AppointmentCard
								appointment={appointment}
								key={appointment.id}
							/>
						))
					)}
				</TabsContent>

				<TabsContent
					className='space-y-4'
					value='past'
				>
					{past.length === 0 ? (
						<EmptyAppointmentsState type='past' />
					) : (
						past.map(appointment => (
							<AppointmentCard
								appointment={appointment}
								key={appointment.id}
							/>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function AppointmentCard({ appointment }: { appointment: AppointmentListItem }) {
	const appointmentDate = new Date(appointment.appointmentDate);
	const isUpcoming = appointmentDate >= new Date() && appointment.status !== "CANCELLED";
	const isCancellable = isUpcoming && appointment.status === "CONFIRMED";

	return (
		<Card className='transition-all hover:shadow-md'>
			<CardHeader className='flex flex-col space-y-2 pb-3'>
				<div className='flex flex-wrap items-start justify-between gap-2'>
					<div className='space-y-1'>
						<CardTitle className='text-lg'>
							{appointment.patientFirstName} {appointment.patientLastName}
						</CardTitle>
						<CardDescription className='flex flex-wrap gap-3'>
							<span className='flex items-center gap-1 text-sm'>
								<Stethoscope className='h-3.5 w-3.5' />
								Dr. {appointment.doctorName}
							</span>
							<span className='flex items-center gap-1 text-sm'>
								<span className='text-slate-400'>|</span>
								{appointment.doctorSpecialty}
							</span>
						</CardDescription>
					</div>
					<Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
						{statusLabels[appointment.status as keyof typeof statusLabels]}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-3 pb-4'>
				<div className='grid gap-2 sm:grid-cols-2'>
					<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
						<Calendar className='h-4 w-4' />
						<span>{formatDate(appointmentDate)}</span>
					</div>
					<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
						<Clock className='h-4 w-4' />
						<span>{appointment.time || formatTime(appointmentDate)}</span>
					</div>
					{appointment.type && (
						<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
							<FileText className='h-4 w-4' />
							<span className='capitalize'>{appointment.type.toLowerCase()}</span>
						</div>
					)}
				</div>

				{appointment.reason && (
					<div className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50'>
						<p className='font-medium text-slate-700 dark:text-slate-300'>Reason for visit:</p>
						<p className='text-slate-600 dark:text-slate-400'>{appointment.reason}</p>
					</div>
				)}

				<div className='flex flex-wrap gap-2 pt-2'>
					{isCancellable && (
						<Link
							params={{ id: appointment.id }}
							to='/appointments/$id/cancel'
						>
							<Button
								className='text-red-600 hover:bg-red-50 hover:text-red-700'
								size='sm'
								variant='outline'
							>
								<XCircle className='mr-1 h-3.5 w-3.5' />
								Cancel
							</Button>
						</Link>
					)}
					<Link
						params={{ id: appointment.id }}
						to='/appointments/$id'
					>
						<Button
							size='sm'
							variant='ghost'
						>
							View Details
						</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}

function EmptyAppointmentsState({ type }: { type: "upcoming" | "past" }) {
	return (
		<Card className='py-12 text-center'>
			<CardContent>
				<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
					<Calendar className='h-6 w-6 text-slate-400' />
				</div>
				<h3 className='mt-4 font-semibold text-lg'>No {type} appointments</h3>
				<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
					{type === "upcoming"
						? "You don't have any upcoming appointments scheduled."
						: "Your past appointments will appear here."}
				</p>
				{type === "upcoming" && (
					<Link
						className='mt-4 inline-block'
						to='/appointments/book'
					>
						<Button>Book an Appointment</Button>
					</Link>
				)}
			</CardContent>
		</Card>
	);
}
