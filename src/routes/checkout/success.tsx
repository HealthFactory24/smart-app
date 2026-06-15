import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cartCountQueryKey } from "#/components/Header";
import { Button } from "#/components/ui/button";
import { confirmOrder } from "#/data/checkout";

export const Route = createFileRoute("/checkout/success")({
	component: CheckoutSuccess
});

function CheckoutSuccess() {
	const queryClient = useQueryClient();
	const confirmed = useRef(false);
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

	// Runs once when the page loads — verifies payment with Stripe
	useEffect(() => {
		if (confirmed.current) return;
		confirmed.current = true;

		const params = new URLSearchParams(window.location.search);
		const sessionId = params.get("session_id");

		if (!sessionId) {
			setStatus("error");
			return;
		}

		confirmOrder({ data: { sessionId } })
			.then(() => {
				queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
				setStatus("success");
			})
			.catch(() => {
				setStatus("error");
			});
	}, [queryClient]);

	if (status === "loading") {
		return (
			<div className='mx-auto max-w-lg py-20 text-center'>
				<Loader2 className='mx-auto h-8 w-8 animate-spin text-slate-400' />
				<p className='mt-4 text-slate-600 dark:text-slate-300'>Verifying your payment...</p>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className='mx-auto max-w-lg py-20 text-center'>
				<h1 className='font-bold text-2xl'>Something went wrong</h1>
				<p className='mt-2 text-slate-600 dark:text-slate-300'>
					We couldn't verify your payment. If you were charged, please contact support.
				</p>
				<Link
					className='mt-6 inline-block'
					to='/products'
				>
					<Button>Back to products</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-lg py-20 text-center'>
			<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
				<CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
			</div>

			<h1 className='mt-6 font-bold text-2xl'>Payment successful!</h1>

			<p className='mt-2 text-slate-600 dark:text-slate-300'>
				Thank you for your purchase. Your order is being processed.
			</p>

			<div className='mt-8 flex items-center justify-center gap-3'>
				<Link to='/orders'>
					<Button variant='outline'>View my orders</Button>
				</Link>

				<Link to='/products'>
					<Button>Continue shopping</Button>
				</Link>
			</div>
		</div>
	);
}
