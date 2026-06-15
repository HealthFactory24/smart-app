import { use } from "react";
import type { ProductSelect } from "@/db/schema";
import { ProductCard } from "./ProductCard";

export function RecommendedProducts({ recommendedProducts }: { recommendedProducts: Promise<ProductSelect[]> }) {
	const recommendedProductsData = use(recommendedProducts);

	return (
		<div>
			<h2 className='my-4 font-bold text-2xl'>Recommended Products</h2>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{recommendedProductsData.map(product => (
					<ProductCard
						key={product.id}
						product={product}
					/>
				))}
			</div>
		</div>
	);
}
