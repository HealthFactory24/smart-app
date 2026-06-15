// src/routes/appointments/manage.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import type { getAppointmentById } from "@/data/appointments";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cancelAppointment, getAllAppointments, updateAppointmentStatus } from "@/data/appointments";
import { formatDate, formatTime } from "@/utils/formDate";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Calendar, CheckCircle, Clock, Eye, MoreHorizontal, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppointmentStatus } from '../../db/schema';

type AppointmentDetail = Awaited<ReturnType<typeof getAppointmentById>>;

export const Route = createFileRoute("/appointments/manage")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role !== "admin") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllAppointments(),
	component: ManageAppointmentsPage
});

const statusColors = {
	PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	NO_SHOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
};

const statusOptions = [
	{ value: "PENDING", label: "Pending" },
	{ value: "CONFIRMED", label: "Confirmed" },
	{ value: "COMPLETED", label: "Completed" },
	{ value: "CANCELLED", label: "Cancelled" },
	{ value: "NO_SHOW", label: "No Show" }
];

function ManageAppointmentsPage() {
	const router = useRouter();
	const appointments = Route.useLoaderData();
	const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [showCancelDialog, setShowCancelDialog] = useState(false);

	const columns: ColumnDef<typeof appointments[number]>[] = [
		{
			accessorKey: "appointmentDate",
			header: "Date & Time",
			cell: ({ row }) => (
				<div className='space-y-0.5'>
					<div className='flex items-center gap-1 text-sm'>
						<Calendar className='h-3.5 w-3.5 text-slate-400' />
						<span>{formatDate(row.original.appointmentDate)}</span>
					</div>
					<div className='flex items-center gap-1 text-slate-500 text-xs'>
						<Clock className='h-3 w-3' />
						<span>{row.original.time || formatTime(row.original.appointmentDate)}</span>
					</div>
				</div>
			)
		},
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) => (
				<div>
					<p className='font-medium text-sm'>
						{row.original.patientFirstName} {row.original.patientLastName}
					</p>
				</div>
			)
		},
		{
			id: "doctor",
			header: "Doctor",
			cell: ({ row }) => (
				<div>
					<p className='text-sm'>Dr. {row.original.doctorName}</p>
					<p className='text-slate-500 text-xs'>{row.original.doctorSpecialty}</p>
				</div>
			)
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<span className='text-sm capitalize'>{row.original.type?.toLowerCase() || "Regular"}</span>
			)
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge className={statusColors[row.original.status as keyof typeof statusColors]}>
					{row.original.status}
				</Badge>
			)
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
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
						<DropdownMenuItem onClick={() => setSelectedAppointment(row.original as unknown as AppointmentDetail)}>
							<Eye className='mr-2 h-4 w-4' />
							View Details
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{row.original.status !== "COMPLETED" && row.original.status !== "CANCELLED" && (
							<>
								<DropdownMenuItem onClick={() => handleStatusUpdate(row.original.id, "CONFIRMED")}>
									<CheckCircle className='mr-2 h-4 w-4 text-green-600' />
									Confirm
								</DropdownMenuItem>
								<DropdownMenuItem
									className='text-red-600'
									onClick={() => {
										setSelectedAppointment(row.original as unknown as AppointmentDetail);
										setShowCancelDialog(true);
									}}
								>
									<XCircle className='mr-2 h-4 w-4' />
									Cancel
								</DropdownMenuItem>
							</>
						)}
						{row.original.status === "CONFIRMED" && (
							<DropdownMenuItem onClick={() => handleStatusUpdate(row.original.id, "COMPLETED")}>
								<CheckCircle className='mr-2 h-4 w-4' />
								Mark Complete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)
		}
	];

	const table = useReactTable({
		data: appointments,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	const handleStatusUpdate = async (appointmentId: string, status: string) => {
		setIsUpdating(true);
		try {
			await updateAppointmentStatus({
				data: { appointmentId, status: status as AppointmentStatus }
			});
			await router.invalidate();
			toast.success(`Appointment ${status.toLowerCase()} successfully`);
		} catch (error) {
      console.error(error)
			toast.error("Failed to update appointment status");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCancel = async () => {
		if (!selectedAppointment) return;
		setIsUpdating(true);
		try {
			await cancelAppointment({
				data: { appointmentId: selectedAppointment.id, reason: cancelReason }
			});
			await router.invalidate();
			toast.success("Appointment cancelled successfully");
			setShowCancelDialog(false);
			setCancelReason("");
			setSelectedAppointment(null);
		} catch (error) {
      console.error(error)
			toast.error("Failed to cancel appointment");
		} finally {
			setIsUpdating(false);
		}
	};

	const pendingCount = appointments.filter(a => a.status === "PENDING").length;
	const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;
	const completedCount = appointments.filter(a => a.status === "COMPLETED").length;

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-semibold text-2xl'>Manage Appointments</h1>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							View and manage all clinic appointments
						</p>
					</div>
				</div>

				{/* Stats Cards */}
				<div className='grid gap-4 sm:grid-cols-3'>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='font-medium text-slate-500 text-sm'>Pending</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='font-bold text-2xl'>{pendingCount}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='font-medium text-slate-500 text-sm'>Confirmed</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='font-bold text-2xl'>{confirmedCount}</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='font-medium text-slate-500 text-sm'>Completed</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='font-bold text-2xl'>{completedCount}</p>
						</CardContent>
					</Card>
				</div>

				{/* Appointments Table */}
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>All Appointments</CardTitle>
						<CardDescription>
							Total {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
						</CardDescription>
					</CardHeader>
					<CardContent className='p-0'>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map(headerGroup => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map(header => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows.length ? (
									table.getRowModel().rows.map(row => (
										<TableRow key={row.id}>
											{row.getVisibleCells().map(cell => (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											className='h-24 text-center text-slate-500'
											colSpan={columns.length}
										>
											No appointments found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Appointment Details Dialog */}
			<Dialog
				onOpenChange={() => setSelectedAppointment(null)}
				open={!!selectedAppointment && !showCancelDialog}
			>
				<DialogContent className='max-w-lg'>
					<DialogHeader>
						<DialogTitle>Appointment Details</DialogTitle>
						<DialogDescription>Detailed information about the appointment</DialogDescription>
					</DialogHeader>
					{selectedAppointment && (
						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label className='text-slate-500 text-xs'>Patient</Label>
									<p className='font-medium'>
										{selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}
									</p>
								</div>
								<div>
									<Label className='text-slate-500 text-xs'>Doctor</Label>
									<p className='font-medium'>Dr. {selectedAppointment.doctor.name}</p>
									<p className='text-slate-500 text-xs'>{selectedAppointment.doctor.specialty}</p>
								</div>
								<div>
									<Label className='text-slate-500 text-xs'>Date & Time</Label>
									<p className='font-medium'>
										{formatDate(selectedAppointment.appointmentDate)} at{" "}
										{selectedAppointment.time || formatTime(selectedAppointment.appointmentDate)}
									</p>
								</div>
								<div>
									<Label className='text-slate-500 text-xs'>Status</Label>
									<Badge className={statusColors[selectedAppointment.status as keyof typeof statusColors]}>
										{selectedAppointment.status}
									</Badge>
								</div>
							</div>

							{selectedAppointment.reason && (
								<div>
									<Label className='text-slate-500 text-xs'>Reason for Visit</Label>
									<p className='rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800'>
										{selectedAppointment.reason}
									</p>
								</div>
							)}

							{selectedAppointment.note && (
								<div>
									<Label className='text-slate-500 text-xs'>Notes</Label>
									<p className='text-sm'>{selectedAppointment.note}</p>
								</div>
							)}

							<div className='flex gap-2 pt-4'>
								<Select
									onValueChange={value => handleStatusUpdate(selectedAppointment.id, value)}
									value={selectedAppointment.status as AppointmentStatus}
								>
									<SelectTrigger className='w-40'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map(opt => (
											<SelectItem
												key={opt.value}
												value={opt.value}
											>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									onClick={() => setSelectedAppointment(null)}
									variant='outline'
								>
									Close
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Cancel Confirmation Dialog */}
			<Dialog
				onOpenChange={setShowCancelDialog}
				open={showCancelDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancel Appointment</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel this appointment? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-3'>
						<Label htmlFor='cancelReason'>Reason for cancellation (Optional)</Label>
						<Textarea
							id='cancelReason'
							onChange={e => setCancelReason(e.target.value)}
							placeholder='Enter cancellation reason...'
							rows={3}
							value={cancelReason}
						/>
					</div>
					<DialogFooter>
						<Button
							disabled={isUpdating}
							onClick={() => setShowCancelDialog(false)}
							variant='outline'
						>
							Keep Appointment
						</Button>
						<Button
							disabled={isUpdating}
							onClick={handleCancel}
							variant='destructive'
						>
							{isUpdating ? "Cancelling..." : "Yes, Cancel Appointment"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
