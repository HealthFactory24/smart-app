import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, productSchema, uploadProductImage } from "@/data/products";
import type { BadgeValue, InventoryValue } from "@/db/schema";
import { type FieldApi, useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import imageCompression from "browser-image-compression";
import { useState } from "react";
import type { z } from "zod";

export const Route = createFileRoute("/products/create-product")({
	beforeLoad: async ({ context }) => {
		const session = context.session;

		if (!session) {
			throw redirect({ to: "/sign-in" });
		}

		if (session.user.role !== "admin") {
			throw redirect({ to: "/" });
		}

		return { user: session.user };
	},
	component: RouteComponent
});

function fieldValidator(schema: z.ZodTypeAny) {
	return ({ value }: { value: unknown }) => {
		const result = schema.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};
}

function FieldMessage({ error }: { error?: string }) {
	if (!error) return null;
	return <p className='text-destructive text-sm'>{error}</p>;
}

function FormField({ field, label, children }: { field: FieldApi<any, any, any, any>; label: string; children: React.ReactNode }) {
	const error = field.state.meta.isTouched ? (field.state.meta.errors[0] as string | undefined) : undefined;

	return (
		<div className='space-y-2'>
			<Label htmlFor={field.name}>{label}</Label>
			{children}
			<FieldMessage error={error} />
		</div>
	);
}

function RouteComponent() {
	const navigate = useNavigate();
	const router = useRouter();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [compressedFile, setCompressedFile] = useState<File | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			price: "",
			badge: undefined as BadgeValue | undefined,
			image: "",
			inventory: "in-stock" as InventoryValue
		},
		onSubmit: async ({ value }) => {
			try {
				setSubmitError(null);

				if (!compressedFile) {
					setSubmitError("Please select an image");
					return; // Exit early if no image is selected
				}

				// Convert to base64 and upload only now
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

				await createProduct({
					data: {
						name: value.name,
						description: value.description,
						price: value.price,
						badge: value.badge,
						image: url,
						inventory: value.inventory
					}
				});

				await router.invalidate({ sync: true });
				navigate({ to: "/products" });
			} catch {
				setSubmitError("Something went wrong. Please try again.");
			}
		}
	});

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
			setSubmitError("Error compressing image");
		}
	}

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<div className='space-y-6'>
				<Card>
					<CardHeader className='gap-2'>
						<CardTitle className='text-lg'>Create Product</CardTitle>
						<CardDescription className='line-clamp-2'>
							Fill in the details to add a new product to the catalog.
						</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardContent>
						<form
							className='space-y-6'
							onSubmit={e => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
						>
							<form.Field
								name='name'
								validators={{
									onChange: fieldValidator(productSchema.shape.name)
								}}
							>
								{field => (
									<FormField
										field={field}
										label='Product Name *'
									>
										<Input
											aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
											id={field.name}
											name={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter product name'
											type='text'
											value={field.state.value}
										/>
									</FormField>
								)}
							</form.Field>

							<form.Field
								name='description'
								validators={{
									onChange: fieldValidator(productSchema.shape.description)
								}}
							>
								{field => (
									<FormField
										field={field}
										label='Description *'
									>
										<Textarea
											aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
											id={field.name}
											name={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='Enter product description'
											value={field.state.value}
										/>
									</FormField>
								)}
							</form.Field>

							<form.Field
								name='price'
								validators={{
									onChange: fieldValidator(productSchema.shape.price)
								}}
							>
								{field => (
									<FormField
										field={field}
										label='Price *'
									>
										<Input
											aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
											id={field.name}
											name={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='0.00'
											step='0.01'
											type='number'
											value={field.state.value}
										/>
									</FormField>
								)}
							</form.Field>

							<form.Field name='image'>
								{field => (
									<FormField
										field={field}
										label='Product Image *'
									>
										<div className='space-y-3'>
											<label className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50 hover:bg-muted/50'>
												{imagePreview ? (
													<img
														alt='Preview'
														className='h-36 w-36 rounded-lg object-cover'
														src={imagePreview}
													/>
												) : (
													<>
														<div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
															<svg
																className='text-muted-foreground'
																fill='none'
																height='20'
																stroke='currentColor'
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth='1.5'
																viewBox='0 0 24 24'
																width='20'
																xmlns='http://www.w3.org/2000/svg'
															>
																<title>Upload icon</title>
																<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
																<polyline points='17 8 12 3 7 8' />
																<line
																	x1='12'
																	x2='12'
																	y1='3'
																	y2='15'
																/>
															</svg>
														</div>
														<p className='text-muted-foreground text-sm'>
															Click to select an image
														</p>
													</>
												)}
												<input
													accept='image/*'
													className='hidden'
													onChange={handleImageSelect}
													type='file'
												/>
											</label>

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
													Remove image
												</Button>
											)}
										</div>
									</FormField>
								)}
							</form.Field>

							<form.Field
								name='badge'
								validators={{
									onChange: fieldValidator(productSchema.shape.badge)
								}}
							>
								{field => (
									<FormField
										field={field}
										label='Badge (optional)'
									>
										<Select
											name={field.name}
											onValueChange={value =>
												field.handleChange(value === "none" ? undefined : (value as BadgeValue))
											}
											value={field.state.value ?? "none"}
										>
											<SelectTrigger className='w-full'>
												<SelectValue placeholder='Select badge' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='none'>None</SelectItem>
												<SelectItem value='New'>New</SelectItem>
												<SelectItem value='Sale'>Sale</SelectItem>
												<SelectItem value='Featured'>Featured</SelectItem>
												<SelectItem value='Limited'>Limited</SelectItem>
											</SelectContent>
										</Select>
									</FormField>
								)}
							</form.Field>

							<form.Field
								name='inventory'
								validators={{
									onChange: fieldValidator(productSchema.shape.inventory)
								}}
							>
								{field => (
									<FormField
										field={field}
										label='Inventory Status *'
									>
										<Select
											onValueChange={value => field.handleChange(value as InventoryValue)}
											value={field.state.value}
										>
											<SelectTrigger
												className='w-full'
												id={field.name}
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='in-stock'>In Stock</SelectItem>
												<SelectItem value='backorder'>Backorder</SelectItem>
												<SelectItem value='preorder'>Preorder</SelectItem>
											</SelectContent>
										</Select>
									</FormField>
								)}
							</form.Field>

							<FieldMessage error={submitError ?? undefined} />

							<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
								{([canSubmit, isSubmitting]) => (
									<div className='flex gap-4'>
										<Button
											className='flex-1'
											disabled={!canSubmit || isSubmitting}
											type='submit'
										>
											{isSubmitting ? "Creating..." : "Create Product"}
										</Button>
										<Button
											onClick={() => navigate({ to: "/products" })}
											type='button'
											variant='outline'
										>
											Cancel
										</Button>
									</div>
								)}
							</form.Subscribe>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
