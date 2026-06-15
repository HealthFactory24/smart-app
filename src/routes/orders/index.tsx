import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getOrdersByUser } from "@/data/orders";

export const Route = createFileRoute("/orders/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
	},
	loader: async () => getOrdersByUser(),
	component: RouteComponent
});

const statusStyles = {
	pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

function RouteComponent() {
	const orders = Route.useLoaderData();

	if (orders.length === 0) {
		return (
			<div className='mx-auto max-w-3xl py-16'>
				<Empty>
					<EmptyHeader>
						<Package
							className='mx-auto text-slate-400'
							size={40}
						/>
						<EmptyTitle>No orders yet</EmptyTitle>
						<EmptyDescription>Once you complete a purchase, your orders will appear here.</EmptyDescription>
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

	return (
		<div className='mx-auto max-w-3xl space-y-6 py-8'>
			<div>
				<h1 className='font-semibold text-2xl'>My Orders</h1>
				<p className='text-slate-600 text-sm dark:text-slate-300'>Your purchase history.</p>
			</div>

			<div className='space-y-4'>
				{orders.map(order => (
					<div
						className='rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-950/40'
						key={order.id}
					>
						<div className='flex items-center justify-between border-slate-200 border-b px-5 py-3 dark:border-slate-800'>
							<div className='flex items-center gap-4 text-sm'>
								<span className='text-slate-500'>
									{order.createdAt.toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric"
									})}
								</span>

								<span
									className={`rounded-full px-2.5 py-0.5 font-medium text-xs ${statusStyles[order.status]}`}
								>
									{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
								</span>
							</div>

							<span className='font-semibold text-sm'>${Number(order.total).toFixed(2)}</span>
						</div>

						<div className='divide-y divide-slate-100 dark:divide-slate-800'>
							{order.items.map(item => (
								<div
									className='flex items-center gap-4 px-5 py-3'
									key={item.id}
								>
									<div className='flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'>
										<img
											alt={item.name}
											className='h-8 w-8 object-contain'
											loading='lazy'
											src={item.image}
										/>
									</div>

									<div className='flex-1'>
										<p className='font-semibold text-sm'>{item.name}</p>
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
				))}
			</div>
		</div>
	);
}
