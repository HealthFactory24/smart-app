// components/ErrorBoundary.tsx

import { AlertCircle } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<Card className='mx-auto max-w-md'>
						<CardContent className='py-8 text-center'>
							<AlertCircle className='mx-auto h-12 w-12 text-red-500' />
							<h3 className='mt-4 font-semibold text-lg'>Something went wrong</h3>
							<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>
								{this.state.error?.message || "An unexpected error occurred"}
							</p>
							<Button
								className='mt-4'
								onClick={() => window.location.reload()}
								variant='outline'
							>
								Reload page
							</Button>
						</CardContent>
					</Card>
				)
			);
		}

		return this.props.children;
	}
}
