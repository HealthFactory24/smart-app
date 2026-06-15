import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import imageCompression from "browser-image-compression";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataToolbar } from "@/components/DataToolbar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deleteProduct, getAllProducts, updateProduct, uploadProductImage } from "@/data/products";
import type { BadgeValue, InventoryValue, ProductSelect } from "@/db/schema";
import { useProductFilters } from "@/hooks/useProductFilters";

export const Route = createFileRoute("/products/manage-products")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		if (session.user.role !== "admin") throw redirect({ to: "/" });
		return { user: session.user };
	},
	loader: async () => getAllProducts(),
	component: ManageProductsPage
});

function ManageProductsPage() {
	const products = Route.useLoaderData();
	const { filtered, toolbar } = useProductFilters(products);
	const router = useRouter();

	// Edit dialog state
	const [editingProduct, setEditingProduct] = useState<ProductSelect | null>(null);
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
		price: "",
		badge: "none",
		inventory: "in-stock"
	});

	// Image state
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [compressedFile, setCompressedFile] = useState<File | null>(null);

	// Delete dialog state
	const [deletingProduct, setDeletingProduct] = useState<ProductSelect | null>(null);

	// Loading states
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	function openEditDialog(product: ProductSelect) {
		setEditingProduct(product);
		setEditForm({
			name: product.name,
			description: product.description,
			price: product.price,
			badge: product.badge ?? "none",
			inventory: product.inventory
		});
		setImagePreview(null);
		setCompressedFile(null);
	}

	async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const compressed = await imageCompression(file, {
				maxSizeMB: 0.5,
				maxWidthOrHeight: 1200,
				useWebWorker: true
			});
			setCompressedFile(compressed);
			setImagePreview(URL.createObjectURL(compressed));
		} catch {
			console.error("Error compressing image");
		}
	}

	async function handleSave() {
		if (!editingProduct) return;
		setIsSaving(true);

		try {
			let imageUrl: string | undefined;

			if (compressedFile) {
				const base64 = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(compressedFile);
				});

				const { url } = await uploadProductImage({
					data: {
						fileBase64: base64,
						fileName: compressedFile.name
					}
				});
				imageUrl = url;
			}

			await updateProduct({
				data: {
					id: editingProduct.id,
					name: editForm.name,
					description: editForm.description,
					price: editForm.price,
					badge: editForm.badge === "none" ? undefined : (editForm.badge as BadgeValue),
					inventory: editForm.inventory as InventoryValue,
					...(imageUrl ? { image: imageUrl } : {})
				}
			});

			await router.invalidate();
			setEditingProduct(null);
			toast.success("Product updated successfully.");
		} catch {
			toast.error("Failed to update product. Please try again.");
		} finally {
			setIsSaving(false);
		}

		setIsSaving(false);
		setEditingProduct(null);
	}

	async function handleDelete() {
		if (!deletingProduct) return;
		setIsDeleting(true);

		try {
			await deleteProduct({ data: { id: deletingProduct.id } });
			await router.invalidate();
			setDeletingProduct(null);
			toast.success("Product deleted successfully.");
		} catch {
			toast.error("Failed to delete product. Please try again.");
		} finally {
			setIsDeleting(false);
		}

		setIsDeleting(false);
		setDeletingProduct(null);
	}

	const columns: ColumnDef<ProductSelect>[] = [
		{
			accessorKey: "image",
			header: "Image",
			cell: ({ row }) => (
				<img
					alt={row.original.name}
					className='h-10 w-10 rounded-md object-cover'
					src={row.original.image}
				/>
			)
		},
		{
			accessorKey: "name",
			header: "Name"
		},
		{
			accessorKey: "price",
			header: "Price",
			cell: ({ row }) => <span>${row.original.price}</span>
		},
		{
			accessorKey: "badge",
			header: "Badge",
			cell: ({ row }) => <span className='text-slate-500 text-sm'>{row.original.badge ?? "—"}</span>
		},
		{
			accessorKey: "inventory",
			header: "Inventory",
			cell: ({ row }) => {
				const status = row.original.inventory;
				const styles: Record<string, string> = {
					"in-stock": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
					backorder: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
					preorder: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
				};
				return (
					<span
						className={`inline-block rounded-full px-2 py-0.5 font-medium text-xs ${styles[status] ?? ""}`}
					>
						{status}
					</span>
				);
			}
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className='flex items-center gap-2'>
					<Button
						onClick={() => openEditDialog(row.original)}
						size='sm'
						variant='outline'
					>
						<Pencil size={14} />
					</Button>
					<Button
						className='text-red-500 hover:border-red-300 hover:text-red-700'
						onClick={() => setDeletingProduct(row.original)}
						size='sm'
						variant='outline'
					>
						<Trash2 size={14} />
					</Button>
				</div>
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
						<CardTitle className='text-lg'>Manage Products</CardTitle>
						<CardDescription>Edit or remove products from the catalog.</CardDescription>
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
											No products found.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			{/* Edit Dialog */}
			<Dialog
				onOpenChange={open => {
					if (!open) setEditingProduct(null);
				}}
				open={editingProduct !== null}
			>
				<DialogContent className='sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>Edit Product</DialogTitle>
						<DialogDescription>Update the product details below.</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='edit-name'>Name</Label>
							<Input
								id='edit-name'
								onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
								value={editForm.name}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='edit-description'>Description</Label>
							<Textarea
								id='edit-description'
								onChange={e =>
									setEditForm(prev => ({
										...prev,
										description: e.target.value
									}))
								}
								value={editForm.description}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='edit-price'>Price</Label>
							<Input
								id='edit-price'
								onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))}
								step='0.01'
								type='number'
								value={editForm.price}
							/>
						</div>

						<div className='space-y-2'>
							<Label>Badge</Label>
							<Select
								onValueChange={value => setEditForm(prev => ({ ...prev, badge: value ?? "none" }))}
								value={editForm.badge}
							>
								<SelectTrigger className='w-full'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='none'>None</SelectItem>
									<SelectItem value='New'>New</SelectItem>
									<SelectItem value='Sale'>Sale</SelectItem>
									<SelectItem value='Featured'>Featured</SelectItem>
									<SelectItem value='Limited'>Limited</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label>Inventory Status</Label>
							<Select
								onValueChange={value =>
									setEditForm(prev => ({
										...prev,
										inventory: value as InventoryValue
									}))
								}
								value={editForm.inventory}
							>
								<SelectTrigger className='w-full'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='in-stock'>In Stock</SelectItem>
									<SelectItem value='backorder'>Backorder</SelectItem>
									<SelectItem value='preorder'>Preorder</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Image field */}
						<div className='space-y-2'>
							<Label>Product Image</Label>
							<div className='flex items-center gap-4'>
								<img
									alt='Product'
									className='h-20 w-20 rounded-lg border object-cover'
									src={imagePreview ?? editingProduct?.image ?? ""}
								/>
								<div className='flex flex-col gap-2'>
									{!imagePreview && (
										<label className='inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-muted'>
											Change image
											<input
												accept='image/*'
												className='hidden'
												onChange={handleImageSelect}
												type='file'
											/>
										</label>
									)}
									{imagePreview && (
										<Button
											onClick={() => {
												setImagePreview(null);
												setCompressedFile(null);
											}}
											size='sm'
											type='button'
											variant='outline'
										>
											Undo change
										</Button>
									)}
								</div>
							</div>
							<p className='text-muted-foreground text-xs'>
								{imagePreview
									? "New image selected — will upload on save."
									: "Leave unchanged to keep the current image."}
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							disabled={isSaving}
							onClick={() => setEditingProduct(null)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isSaving}
							onClick={handleSave}
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete AlertDialog */}
			<AlertDialog
				onOpenChange={open => {
					if (!open) setDeletingProduct(null);
				}}
				open={deletingProduct !== null}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Product</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete{" "}
							<span className='font-semibold'>{deletingProduct?.name}</span>? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className='bg-red-600 hover:bg-red-700'
							disabled={isDeleting}
							onClick={handleDelete}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
