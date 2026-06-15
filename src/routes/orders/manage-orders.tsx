import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataToolbar } from "#/components/DataToolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderData } from "@/data/orders";
import { getAllOrders, updateOrderStatus } from "@/data/orders";
import { useOrderFilters } from "@/hooks/useOrderFilters";

const statusStyles = {
	pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

export const Route = createFileRoute("/orders/manage-orders")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role !== "admin") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllOrders(),
	component: ManageOrdersPage
});

// ── Component ──
function ManageOrdersPage() {
	const orders = Route.useLoaderData();
	const { filtered, toolbar } = useOrderFilters(orders);
	const router = useRouter();

	const [viewingOrder, setViewingOrder] = useState<OrderData | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const columns: ColumnDef<OrderData>[] = [
		{
			accessorKey: "createdAt",
			header: "Date",
			cell: ({ row }) => (
				<span className='text-slate-600 text-sm dark:text-slate-300'>
					{row.original.createdAt.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric"
					})}
				</span>
			)
		},
		{
			id: "customer",
			header: "Customer",
			cell: ({ row }) => (
				<div>
					<p className='font-medium text-sm'>{row.original.user.name}</p>
					<p className='text-slate-500 text-xs'>{row.original.user.email}</p>
				</div>
			)
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<span
					className={`inline-block rounded-full px-2.5 py-0.5 font-medium text-xs ${statusStyles[row.original.status]}`}
				>
					{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
				</span>
			)
		},
		{
			id: "itemsCount",
			header: "Items",
			cell: ({ row }) => (
				<span className='text-sm'>{row.original.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
			)
		},
		{
			accessorKey: "total",
			header: "Total",
			cell: ({ row }) => <span className='font-semibold text-sm'>${Number(row.original.total).toFixed(2)}</span>
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<Button
					onClick={() => setViewingOrder(row.original)}
					size='sm'
					variant='outline'
				>
					<Eye size={14} />
				</Button>
			)
		}
	];

	const table = useReactTable({
		data: filtered,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Manage Orders</CardTitle>
						<CardDescription>View all customer orders and their details.</CardDescription>
						<DataToolbar {...toolbar} />
					</CardHeader>
				</Card>

				<Card>
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
											No orders found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Order detail Dialog */}
			<Dialog
				onOpenChange={open => {
					if (!open) setViewingOrder(null);
				}}
				open={viewingOrder !== null}
			>
				<DialogContent className='max-w-lg'>
					<DialogHeader>
						<DialogTitle>Order Details</DialogTitle>
						<DialogDescription>
							Order placed on{" "}
							{viewingOrder?.createdAt.toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric"
							})}
						</DialogDescription>
					</DialogHeader>

					{viewingOrder && (
						<div className='space-y-4'>
							<div className='rounded-lg border border-slate-200 p-3 dark:border-slate-800'>
								<p className='font-medium text-sm'>{viewingOrder.user.name}</p>
								<p className='text-slate-500 text-xs'>{viewingOrder.user.email}</p>
							</div>

							<div className='flex items-center justify-between'>
								<Select
									disabled={updatingId === viewingOrder.id}
									onValueChange={async value => {
										setUpdatingId(viewingOrder.id);
										try {
											await updateOrderStatus({
												data: {
													orderId: viewingOrder.id,
													status: value as "pending" | "paid" | "failed"
												}
											});
											toast.success("Order status updated");
											router.invalidate();
											setViewingOrder(null);
										} catch {
											toast.error("Failed to update status");
										}
										setUpdatingId(null);
									}}
									value={viewingOrder.status}
								>
									<SelectTrigger className='h-8 w-30 text-xs'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='pending'>
											<span className='text-yellow-600'>Pending</span>
										</SelectItem>
										<SelectItem value='paid'>
											<span className='text-green-600'>Paid</span>
										</SelectItem>
										<SelectItem value='failed'>
											<span className='text-red-600'>Failed</span>
										</SelectItem>
									</SelectContent>
								</Select>
								<span className='font-bold text-lg'>${Number(viewingOrder.total).toFixed(2)}</span>
							</div>

							<div className='divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800'>
								{viewingOrder.items.map(item => (
									<div
										className='flex items-center gap-3 p-3'
										key={item.id}
									>
										<div className='flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
											<img
												alt={item.name}
												className='h-6 w-6 object-contain'
												src={item.image}
											/>
										</div>
										<div className='flex-1'>
											<p className='font-medium text-sm'>{item.name}</p>
											<p className='text-slate-500 text-xs'>
												Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each
											</p>
										</div>
										<span className='font-semibold text-sm'>
											${(Number(item.price) * item.quantity).toFixed(2)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
