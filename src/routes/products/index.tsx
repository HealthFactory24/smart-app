import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getAllProducts } from "#/data/products";
import { DataToolbar } from "@/components/DataToolbar";
import { ProductCard } from "@/components/ProductCard";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductFilters } from "@/hooks/useProductFilters";

const loggerMiddleware = createMiddleware().server(async ({ next, request }) => {
	console.log("-----loggerMiddleware----", request.url, "from", request.headers.get("origin"));
	return next();
});

export const Route = createFileRoute("/products/")({
	loader: async () => getAllProducts(),
	component: RouteComponent,
	server: {
		middleware: [loggerMiddleware],
		handlers: {
			POST: async ({ request }) => {
				let body = null;
				try {
					body = await request.json();
				} catch {
					body = {};
				}
				return Response.json({
					message: "Hello, world from POST request",
					body
				});
			}
		}
	}
});

function RouteComponent() {
	const products = Route.useLoaderData();
	const { data } = useQuery({
		queryKey: ["products"],
		queryFn: () => getAllProducts(),
		initialData: products
	});

	const { filtered, toolbar } = useProductFilters(data);

	return (
		<div className='space-y-6'>
			<section className='mx-auto max-w-6xl space-y-4'>
				<Card className='bg-white/80 p-6 shadow-md'>
					<div className='flex items-center justify-between'>
						<div className='space-y-1'>
							<CardHeader className='px-0'>
								<p className='text-slate-500 text-sm uppercase tracking-wide'>StartShop Catalog</p>
								<CardTitle className='font-semibold text-2xl'>Products built for makers</CardTitle>
							</CardHeader>
							<CardDescription className='text-slate-600 text-sm'>
								Browse a minimal, production-flavoured catalog with TanStack Start server functions and
								typed routes.
							</CardDescription>
							<DataToolbar {...toolbar} />
						</div>
					</div>
				</Card>
			</section>
			<section className='mx-auto max-w-6xl'>
				{filtered.length > 0 ? (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{filtered.map(product => (
							<ProductCard
								key={product.id}
								product={product}
							/>
						))}
					</div>
				) : (
					<p className='py-16 text-center text-slate-500 text-sm'>No products match your filters.</p>
				)}
			</section>
		</div>
	);
}
