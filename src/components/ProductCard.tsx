import { addToCart } from "#/data/cart";
import type { ProductSelect } from "#/db/schema";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { ShoppingBagIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
export const cartCountQueryKey = ["cart-count"] as const;
const inventoryTone = {
	"in-stock": "bg-emerald-50 text-emerald-600 border-emerald-100",
	backorder: "bg-amber-50 text-amber-700 border-amber-100",
	preorder: "bg-indigo-50 text-indigo-700 border-indigo-100"
};

export function ProductCard({ product }: { product: ProductSelect }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [adding, setAdding] = useState(false);

	return (
		<Link
			className='h-full cursor-pointer transition hover:-translate-y-1 hover:shadow-lg'
			params={{ id: product.id }}
			to='/products/$id'
		>
			<Card className='px-2 py-4'>
				<CardHeader className='gap-2'>
					<div className='flex items-center gap-2'>
						{product.badge && (
							<span className='rounded-full bg-slate-900 px-2 py-0.5 font-semibold text-white text-xs'>
								{product.badge}
							</span>
						)}
					</div>
					<CardTitle className='font-semibold text-lg'>{product.name}</CardTitle>
					<CardDescription>{product.description}</CardDescription>
				</CardHeader>

				<CardContent className='flex items-center justify-between'>
					<p className='flex items-center gap-2 text-slate-600 text-sm'>
						<span className='font-semibold'>{product.rating}</span>
						<span className='text-slate-400'>({product.reviews} reviews)</span>
					</p>
					<span
						className={cn(
							"rounded-full border px-3 py-1 font-semibold text-xs",
							inventoryTone[product.inventory as keyof typeof inventoryTone]
						)}
					>
						{product.inventory === "in-stock"
							? "In Stock"
							: product.inventory === "backorder"
								? "Backorder"
								: "Preorder"}
					</span>
				</CardContent>
				<CardFooter className='flex items-center justify-between border-t-0 bg-transparent pt-0'>
					<span className='font-semibold text-lg'>${product.price}</span>
					<Button
						className={"bg-slate-900 text-white hover:bg-slate-800"}
						disabled={adding}
						onClick={async e => {
							e.preventDefault();
							e.stopPropagation();
							setAdding(true);
							await addToCart({ data: { productId: product.id } });
							await queryClient.invalidateQueries({
								queryKey: cartCountQueryKey
							}); // "the data you cached under this key is now stale — refetch it."
							router.invalidate();
							setAdding(false);
						}}
						size='sm'
						variant={"secondary"}
					>
						<ShoppingBagIcon size={16} />
						{adding ? "Adding..." : "Add to Cart"}
					</Button>
				</CardFooter>
			</Card>
		</Link>
	);
}
