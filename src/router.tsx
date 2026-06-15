import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter, Link } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		context: {
			queryClient: new QueryClient()
		},
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => {
			return (
				<div>
					Not found Page
					<Link to='/'>Go home</Link>
				</div>
			);
		}
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
