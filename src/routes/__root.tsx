import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import Header from "#/components/Header";
import { getSession } from "#/lib/auth.functions";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
	beforeLoad: async () => {
		const session = await getSession();

		return {
			session
		};
	},

	head: () => ({
		meta: [
			{
				charSet: "utf-8"
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				title: "StackShop"
			},
			{
				description: "StackShop is a platform for buying and selling products"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss
			}
		]
	}),

	shellComponent: RootDocument
});

const queryClient = new QueryClient();

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<html lang='en'>
				<head>
					<HeadContent />
				</head>
				<body>
					<div className='min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white'>
						<Header />
						<main className='mx-auto max-w-6xl px-4 py-6'>{children}</main>
					</div>

					<Toaster />

					<TanStackDevtools
						config={{
							position: "bottom-right"
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />
							}
						]}
					/>

					<ReactQueryDevtools initialIsOpen={false} />
					<Scripts />
				</body>
			</html>
		</QueryClientProvider>
	);
}
