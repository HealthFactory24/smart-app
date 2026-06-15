import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/checkout/cancel")({
	component: CheckoutCancel
});

function CheckoutCancel() {
	return (
		<div className='mx-auto max-w-lg py-20 text-center'>
			<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30'>
				<XCircle className='h-8 w-8 text-orange-600 dark:text-orange-400' />
			</div>

			<h1 className='mt-6 font-bold text-2xl'>Payment cancelled</h1>

			<p className='mt-2 text-slate-600 dark:text-slate-300'>
				No worries — your cart is still saved. Come back whenever you're ready.
			</p>

			<div className='mt-8 flex items-center justify-center gap-3'>
				<Link to='/cart'>
					<Button variant='outline'>Back to cart</Button>
				</Link>

				<Link to='/products'>
					<Button>Browse products</Button>
				</Link>
			</div>
		</div>
	);
}
