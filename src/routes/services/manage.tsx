// src/routes/services/manage.tsx

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createService, deleteService, getAllServices, updateService } from "@/data/services";
import type { DbService } from "@/db/schema";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/services/manage")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role !== "admin") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllServices(),
	component: ManageServicesPage
});

function ManageServicesPage() {
	const router = useRouter();
	const initialServices = Route.useLoaderData();
	const [services, setServices] = useState<DbService[]>(initialServices as unknown as DbService[]);

	// Dialog states
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [deletingService, setDeletingService] = useState<DbService | null>(null);

	// Form states
	const [formData, setFormData] = useState({
		serviceName: "",
		description: "",
		price: "",
		duration: "30",
		category: "CONSULTATION",
		isAvailable: true,
		icon: "🩺",
		color: "#3b82f6"
	});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const columns: ColumnDef<DbService>[] = [
		{
			accessorKey: "serviceName",
			header: "Service Name",
			cell: ({ row }) => (
				<div className='flex items-center gap-3'>
					<div
						className='flex h-8 w-8 items-center justify-center rounded-lg text-sm'
						style={{ backgroundColor: `${row.original.color}20`, color: row.original.color ?? "" }}
					>
						{row.original.icon || "🩺"}
					</div>
					<span className='font-medium'>{row.original.serviceName}</span>
				</div>
			)
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => (
				<span className='line-clamp-2 max-w-xs text-slate-600 text-sm dark:text-slate-400'>
					{row.original.description}
				</span>
			)
		},
		{
			accessorKey: "duration",
			header: "Duration",
			cell: ({ row }) => <span>{row.original.duration} min</span>
		},
		{
			accessorKey: "price",
			header: "Price",
			cell: ({ row }) => <span className='font-semibold'>${row.original.price}</span>
		},
		{
			accessorKey: "isAvailable",
			header: "Status",
			cell: ({ row }) => (
				<span
					className={`inline-flex rounded-full px-2 py-1 font-medium text-xs ${
						row.original.isAvailable
							? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
							: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
					}`}
				>
					{row.original.isAvailable ? "Available" : "Unavailable"}
				</span>
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
						<DropdownMenuItem onClick={() => openEditDialog(row.original)}>
							<Pencil className='mr-2 h-4 w-4' />
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className='text-red-600'
							onClick={() => setDeletingService(row.original)}
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
		data: services,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	const openEditDialog = (service: DbService) => {
		setEditingId(service.id);
		setFormData({
			serviceName: service.serviceName,
			description: service.description,
			price: service.price.toString(),
			duration: (service.duration ?? 30).toString(),
			category: service.category ?? "",
			isAvailable: service.isAvailable ?? true,
			icon: service.icon || "🩺",
			color: service.color || "#3b82f6"
		});
		setIsEditOpen(true);
	};

	const handleCreate = async () => {
		setIsSubmitting(true);
		try {
			await createService({
				data: {
					serviceName: formData.serviceName,
					description: formData.description,
					price: Number.parseFloat(formData.price),
					duration: Number.parseInt(formData.duration, 10),
					category: formData.category ??"",
					isAvailable: formData.isAvailable,
					icon: formData.icon,
					color: formData.color
				}
			});
			await router.invalidate();
			setServices((await getAllServices()) as unknown as DbService[]);
			setIsCreateOpen(false);
			resetForm();
			toast.success("Service created successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create service");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async () => {
		if (!editingId) return;
		setIsSubmitting(true);
		try {
			await updateService({
				data: {
					id: editingId,
					serviceName: formData.serviceName,
					description: formData.description,
					price: Number.parseFloat(formData.price),
					duration: Number.parseInt(formData.duration, 10),
					category: formData.category ??"",
					isAvailable: formData.isAvailable,
					icon: formData.icon,
					color: formData.color
				}
			});
			await router.invalidate();
			setServices((await getAllServices()) as unknown as DbService[]);
			setIsEditOpen(false);
			resetForm();
			toast.success("Service updated successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update service");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!deletingService) return;
		setIsSubmitting(true);
		try {
			await deleteService({ data: { id: deletingService.id } });
			await router.invalidate();
			setServices((await getAllServices()) as unknown as DbService[]);
			setDeletingService(null);
			toast.success("Service deleted successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete service");
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		setFormData({
			serviceName: "",
			description: "",
			price: "",
			duration: "30",
			category: "CONSULTATION",
			isAvailable: true,
			icon: "🩺",
			color: "#3b82f6"
		});
		setEditingId(null);
	};

	const commonIcons = ["🩺", "💉", "🩸", "🧪", "📋", "🩹", "💊", "🏥", "👶", "🧬", "🫀", "🧠"];

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-semibold text-2xl'>Manage Services</h1>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							Create, edit, and manage your clinic's service offerings
						</p>
					</div>
					<Button onClick={() => setIsCreateOpen(true)}>
						<Plus className='mr-2 h-4 w-4' />
						Add Service
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>All Services</CardTitle>
						<CardDescription>
							Total {services.length} service{services.length !== 1 ? "s" : ""} available
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
											No services found. Create your first service to get started.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Create Service Dialog */}
			<Dialog
				onOpenChange={setIsCreateOpen}
				open={isCreateOpen}
			>
				<DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>Create New Service</DialogTitle>
						<DialogDescription>
							Add a new service to your clinic's catalog. Fill in the details below.
						</DialogDescription>
					</DialogHeader>
					<ServiceForm
						commonIcons={commonIcons}
						formData={formData}
						setFormData={setFormData}
					/>
					<DialogFooter>
						<Button
							disabled={isSubmitting}
							onClick={() => setIsCreateOpen(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isSubmitting}
							onClick={handleCreate}
						>
							{isSubmitting ? "Creating..." : "Create Service"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Service Dialog */}
			<Dialog
				onOpenChange={setIsEditOpen}
				open={isEditOpen}
			>
				<DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>Edit Service</DialogTitle>
						<DialogDescription>Update the service details below.</DialogDescription>
					</DialogHeader>
					<ServiceForm
						commonIcons={commonIcons}
						formData={formData}
						setFormData={setFormData}
					/>
					<DialogFooter>
						<Button
							disabled={isSubmitting}
							onClick={() => setIsEditOpen(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isSubmitting}
							onClick={handleUpdate}
						>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				onOpenChange={() => setDeletingService(null)}
				open={!!deletingService}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Service</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deletingService?.serviceName}"? This action cannot be
							undone and may affect existing appointments.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className='bg-red-600 hover:bg-red-700'
							disabled={isSubmitting}
							onClick={handleDelete}
						>
							{isSubmitting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

interface ServiceFormData {
	serviceName: string;
	description: string;
	price: string;
	duration: string;
	category: string;
	isAvailable: boolean;
	icon: string;
	color: string;
}

// Service Form Component (reused for create/edit)
function ServiceForm({
	formData,
	setFormData,
	commonIcons
}: {
	formData: ServiceFormData;
	setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
	commonIcons: string[];
}) {
	const categories = [
		{ value: "CONSULTATION", label: "Consultation" },
		{ value: "LAB_TEST", label: "Lab Test" },
		{ value: "VACCINATION", label: "Vaccination" },
		{ value: "PROCEDURE", label: "Procedure" },
		{ value: "DIAGNOSIS", label: "Diagnosis" },
		{ value: "PHARMACY", label: "Pharmacy" },
		{ value: "OTHER", label: "Other" }
	];

	return (
		<div className='space-y-4 py-2'>
			<div className='space-y-2'>
				<Label htmlFor='serviceName'>Service Name *</Label>
				<Input
					id='serviceName'
					onChange={e => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
					placeholder='e.g., General Checkup'
					value={formData.serviceName}
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='description'>Description *</Label>
				<Textarea
					id='description'
					onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
					placeholder='Describe the service...'
					rows={3}
					value={formData.description}
				/>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<Label htmlFor='price'>Price ($) *</Label>
					<Input
						id='price'
						onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
						placeholder='49.99'
						step='0.01'
						type='number'
						value={formData.price}
					/>
				</div>
				<div className='space-y-2'>
					<Label htmlFor='duration'>Duration (minutes) *</Label>
					<Input
						id='duration'
						onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
						placeholder='30'
						type='number'
						value={formData.duration}
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='category'>Category</Label>
				<select
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
					id='category'
					onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
					value={formData.category}
				>
					{categories.map(cat => (
						<option
							key={cat.value}
							value={cat.value}
						>
							{cat.label}
						</option>
					))}
				</select>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<Label htmlFor='icon'>Icon</Label>
					<select
						className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
						id='icon'
						onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
						value={formData.icon}
					>
						{commonIcons.map(icon => (
							<option
								key={icon}
								value={icon}
							>
								{icon}
							</option>
						))}
					</select>
				</div>
				<div className='space-y-2'>
					<Label htmlFor='color'>Color</Label>
					<Input
						id='color'
						onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
						type='color'
						value={formData.color}
					/>
				</div>
			</div>

			<div className='flex items-center justify-between'>
				<Label htmlFor='isAvailable'>Service Available</Label>
				<Switch
					checked={formData.isAvailable}
					id='isAvailable'
					onCheckedChange={checked => setFormData(prev => ({ ...prev, isAvailable: checked }))}
				/>
			</div>
		</div>
	);
}
