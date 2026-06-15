import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { clearCart, fetchCartItems, removeFromCart, updateCartQuantity } from "#/data/cart";
 import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { createCheckoutSession } from "@/data/checkout";

// DB shape: Array<{ id: string; name: string; price: string; quantity: number; image: string; inventory: string }>
// Mock — same shape as the DB response above, useful when copying to another project
// const cart: CartItem[] = [
// 	{
// 		id: "1",
// 		productId: "dffhdfgj54465",
// 		name: "TanStack Router Pro",
// 		price: "99.99",
// 		quantity: 2,
// 		image: "/tanstack-circle-logo.png",
// 		inventory: "in-stock",
// 	},
// ];

// type CartItem = {
// 	id: string;
// 	productId: string;
// 	name: string;
// 	price: string;
// 	quantity: number;
// 	image: string;
// 	inventory: "in-stock" | "backorder" | "preorder";
// };

export const Route = createFileRoute("/cart")({
	component: CartPage,
	loader: async () => {
		return await fetchCartItems();
	}
});

function CartPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const cart = Route.useLoaderData();
	const [clearing, setClearing] = useState(false);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [checkingOut, setCheckingOut] = useState(false);

	const subtotal = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
	const shipping = 0;
	const total = subtotal + shipping;

	async function handleUpdateQuantity(cartItemId: string, delta: 1 | -1) {
		setUpdatingId(cartItemId);
		await updateCartQuantity({ data: { cartItemId, delta } });
		await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
		router.invalidate();
		setUpdatingId(null);
	}

	// ✅ EMPTY CART
	if (cart.length === 0) {
		return (
			<div className='mx-auto max-w-5xl rounded-2xl border bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80'>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant='icon'>
							<ShoppingBag className='size-6' />
						</EmptyMedia>

						<EmptyTitle>Your cart is empty</EmptyTitle>

						<EmptyDescription>Add a few items from the catalog to see them here.</EmptyDescription>
					</EmptyHeader>

					<EmptyContent>
						<Link to='/products'>
							<Button>Browse products</Button>
						</Link>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	// ✅ NORMAL CART
	return (
		<div className='mx-auto grid max-w-5xl gap-6 rounded-2xl border bg-white/80 p-6 shadow-sm lg:grid-cols-[2fr,1fr] dark:border-slate-800 dark:bg-slate-900/80'>
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='font-semibold text-2xl'>Cart</h1>

						<p className='text-slate-600 text-sm dark:text-slate-300'>
							Review your picks before checking out.
						</p>
					</div>

					<Button
						disabled={clearing}
						onClick={async () => {
							setClearing(true);
							await clearCart();
							await queryClient.invalidateQueries({
								queryKey: cartCountQueryKey
							});
							router.invalidate();
							setClearing(false);
						}}
						size='sm'
						type='button'
						variant='ghost'
					>
						{clearing ? "Clearing..." : "Clear cart"}
					</Button>
				</div>

				<div className='divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/40'>
					{cart.map(item => {
						const isBusy = updatingId === item.id || removingId === item.id;

						return (
							<div
								className='grid gap-4 p-4 sm:grid-cols-[auto,1fr,auto]'
								key={item.id}
							>
								<div className='hidden h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 sm:flex dark:border-slate-800 dark:bg-slate-900'>
									<img
										alt={item.name}
										className='h-12 w-12 object-contain'
										loading='lazy'
										src={item.image}
									/>
								</div>

								<div className='space-y-1'>
									<Link
										className='font-semibold text-base hover:text-blue-600 dark:hover:text-blue-400'
										params={{ id: item.productId }}
										to='/products/$id'
									>
										{item.name}
									</Link>

									<div className='flex items-center gap-3 font-semibold text-sm'>
										<span>${Number(item.price).toFixed(2)}</span>

										<span className='text-slate-400'>·</span>

										<span className='text-slate-600 dark:text-slate-300'>
											{item.inventory === "in-stock"
												? "In stock"
												: item.inventory === "backorder"
													? "Backorder"
													: "Preorder"}
										</span>
									</div>
								</div>

								<div className='flex flex-col items-end gap-3 sm:items-center sm:justify-between sm:gap-2 sm:text-right'>
									<div className='flex items-center gap-2'>
										<Button
											disabled={isBusy}
											onClick={() => handleUpdateQuantity(item.id, -1)}
											size='icon'
											type='button'
											variant='outline'
										>
											<Minus size={14} />
										</Button>

										<input
											className='h-9 w-14 rounded-md border border-slate-200 bg-white text-center font-semibold text-sm shadow-xs dark:border-slate-800 dark:bg-slate-900'
											max={99}
											min={1}
											readOnly
											type='number'
											value={item.quantity}
										/>

										<Button
											disabled={isBusy}
											onClick={() => handleUpdateQuantity(item.id, 1)}
											size='icon'
											type='button'
											variant='outline'
										>
											<Plus size={14} />
										</Button>
									</div>

									<div className='font-semibold text-sm'>
										${(Number(item.price) * item.quantity).toFixed(2)}
									</div>

									<Button
										className='text-slate-500 hover:text-red-500'
										disabled={isBusy}
										onClick={async () => {
											setRemovingId(item.id);
											await removeFromCart({
												data: { cartItemId: item.id }
											});
											await queryClient.invalidateQueries({
												queryKey: cartCountQueryKey
											});
											router.invalidate();
											setRemovingId(null);
										}}
										size='sm'
										type='button'
										variant='ghost'
									>
										{removingId === item.id ? "Removing..." : "Remove"}
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className='h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-950/40'>
				<h2 className='font-semibold text-lg'>Order Summary</h2>

				<div className='mt-4 space-y-3 text-sm'>
					<div className='flex justify-between'>
						<span className='text-slate-600 dark:text-slate-300'>Subtotal</span>

						<span className='font-semibold'>${subtotal.toFixed(2)}</span>
					</div>

					<div className='flex justify-between'>
						<span className='text-slate-600 dark:text-slate-300'>Shipping</span>

						<span className='font-semibold'>${shipping.toFixed(2)}</span>
					</div>

					<div className='flex justify-between border-t pt-3 font-bold text-base dark:border-slate-800'>
						<span>Total</span>

						<span>${total.toFixed(2)}</span>
					</div>
				</div>

				<Button
					className='mt-5 w-full'
					disabled={checkingOut}
					onClick={async () => {
						setCheckingOut(true);
						try {
							const { url } = await createCheckoutSession();
							window.location.href = url;
						} catch (error) {
							toast.error(
								error instanceof Error ? error.message : "Failed to start checkout. Please try again."
							);
							setCheckingOut(false);
						}
					}}
					type='button'
				>
					{checkingOut ? "Redirecting to Stripe..." : "Checkout"}
				</Button>
			</div>
		</div>
	);
}
