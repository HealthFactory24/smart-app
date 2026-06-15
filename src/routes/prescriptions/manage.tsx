// src/routes/prescriptions/manage.tsx

import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { CheckCircle, Eye, MoreHorizontal, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deletePrescription, getAllPrescriptions, updatePrescriptionStatus } from "@/data/prescriptions";
import { formatDate } from "@/utils/formDate";

type PrescriptionWithRelations = Awaited<ReturnType<typeof getAllPrescriptions>>[number];

import type { PrescriptionStatus } from "../../db/schema";

export const Route = createFileRoute("/prescriptions/manage")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role !== "admin") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllPrescriptions(),
	component: ManagePrescriptionsPage
});

const statusColors: Record<string, string> = {
	active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	expired: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
	on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
};

const statusOptions = [
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "expired", label: "Expired" },
	{ value: "on_hold", label: "On Hold" }
];

function ManagePrescriptionsPage() {
	const router = useRouter();
	const prescriptions = Route.useLoaderData();
	const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithRelations | null>(null);
	const [showStatusDialog, setShowStatusDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [newStatus, setNewStatus] = useState("");
	const [cancellationReason, setCancellationReason] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);

	const columns: ColumnDef<PrescriptionWithRelations>[] = [
		{
			accessorKey: "issuedDate",
			header: "Date",
			cell: ({ row }) => <span className='text-sm'>{formatDate(row.original.issuedDate)}</span>
		},
		{
			id: "patient",
			header: "Patient",
			cell: ({ row }) => (
				<div>
					<p className='font-medium text-sm'>
						{row.original.patient?.firstName} {row.original.patient?.lastName}
					</p>
					<p className='text-slate-500 text-xs'>{row.original.patient?.mrn}</p>
				</div>
			)
		},
		{
			id: "doctor",
			header: "Doctor",
			cell: ({ row }) => (
				<div>
					<p className='text-sm'>Dr. {row.original.doctor?.name}</p>
					<p className='text-slate-500 text-xs'>{row.original.doctor?.specialty}</p>
				</div>
			)
		},
		{
			accessorKey: "medicationName",
			header: "Medication",
			cell: ({ row }) => (
				<span className='line-clamp-1 text-sm'>
					{row.original.medicationName || `${row.original.prescribedItems?.length || 0} medications`}
				</span>
			)
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge className={statusColors[row.original.status]}>{row.original.status.replace("_", " ")}</Badge>
			)
		},
		{
			accessorKey: "validUntil",
			header: "Valid Until",
			cell: ({ row }) => (
				<span className='text-sm'>{row.original.validUntil ? formatDate(row.original.validUntil) : "—"}</span>
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
						<DropdownMenuItem onClick={() => (window.location.href = `/prescriptions/${row.original.id}`)}>
							<Eye className='mr-2 h-4 w-4' />
							View Details
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{row.original.status === "active" && (
							<DropdownMenuItem
								onClick={() => {
									setSelectedPrescription(row.original);
									setNewStatus("completed");
									setShowStatusDialog(true);
								}}
							>
								<CheckCircle className='mr-2 h-4 w-4 text-green-600' />
								Mark as Completed
							</DropdownMenuItem>
						)}
						{row.original.status === "active" && (
							<DropdownMenuItem
								className='text-red-600'
								onClick={() => {
									setSelectedPrescription(row.original);
									setNewStatus("cancelled");
									setShowStatusDialog(true);
								}}
							>
								<XCircle className='mr-2 h-4 w-4' />
								Cancel Prescription
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className='text-red-600'
							onClick={() => {
								setSelectedPrescription(row.original);
								setShowDeleteDialog(true);
							}}
						>
							<Trash2 className='mr-2 h-4 w-4' />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		}
	];

	const table = useReactTable({
		data: prescriptions,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	const handleStatusUpdate = async () => {
		if (!selectedPrescription) return;
		setIsUpdating(true);
		try {
			await updatePrescriptionStatus({
				data: {
					id: selectedPrescription.id,
					status: newStatus as PrescriptionStatus
				}
			});
			await router.invalidate();
			toast.success(`Prescription ${newStatus === "completed" ? "completed" : "cancelled"} successfully`);
			setShowStatusDialog(false);
			setSelectedPrescription(null);
			setNewStatus("");
			setCancellationReason("");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update prescription status");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedPrescription) return;
		setIsUpdating(true);
		try {
			await deletePrescription({ data: { id: selectedPrescription.id } });
			await router.invalidate();
			toast.success("Prescription deleted successfully");
			setShowDeleteDialog(false);
			setSelectedPrescription(null);
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete prescription");
		} finally {
			setIsUpdating(false);
		}
	};

	const activeCount = prescriptions.filter(p => p.status === "active").length;
	const completedCount = prescriptions.filter(p => p.status === "completed").length;
	const expiredCount = prescriptions.filter(p => p.status === "expired").length;

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				{/* Header */}
				<div>
					<h1 className='font-semibold text-2xl'>Manage Prescriptions</h1>
					<p className='text-slate-600 text-sm dark:text-slate-400'>
						View and manage all prescriptions across the clinic
					</p>
				</div>

				{/* Stats */}
				<div className='grid gap-4 sm:grid-cols-3'>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='font-medium text-slate-500 text-sm'>Active</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='font-bold text-2xl'>{activeCount}</p>
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
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='font-medium text-slate-500 text-sm'>Expired</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='font-bold text-2xl'>{expiredCount}</p>
						</CardContent>
					</Card>
				</div>

				{/* Prescriptions Table */}
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>All Prescriptions</CardTitle>
						<CardDescription>
							Total {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}
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
											No prescriptions found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Status Update Dialog */}
			<Dialog
				onOpenChange={setShowStatusDialog}
				open={showStatusDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{newStatus === "completed" ? "Complete Prescription" : "Cancel Prescription"}
						</DialogTitle>
						<DialogDescription>
							{newStatus === "completed"
								? "Mark this prescription as completed. This action cannot be undone."
								: "Are you sure you want to cancel this prescription?"}
						</DialogDescription>
					</DialogHeader>
					{newStatus === "cancelled" && (
						<div className='space-y-3'>
							<Label htmlFor='cancel-reason'>Reason for cancellation (Optional)</Label>
							<Textarea
								id='cancel-reason'
								onChange={e => setCancellationReason(e.target.value)}
								placeholder='Enter cancellation reason...'
								rows={3}
								value={cancellationReason}
							/>
						</div>
					)}
					<DialogFooter>
						<Button
							disabled={isUpdating}
							onClick={() => setShowStatusDialog(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isUpdating}
							onClick={handleStatusUpdate}
							variant={newStatus === "cancelled" ? "destructive" : "default"}
						>
							{isUpdating
								? "Processing..."
								: newStatus === "completed"
									? "Complete"
									: "Cancel Prescription"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				onOpenChange={setShowDeleteDialog}
				open={showDeleteDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Prescription</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this prescription? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							disabled={isUpdating}
							onClick={() => setShowDeleteDialog(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isUpdating}
							onClick={handleDelete}
							variant='destructive'
						>
							{isUpdating ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
