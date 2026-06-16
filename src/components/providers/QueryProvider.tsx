// src/components/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useState } from "react";

// Optimized default settings for dashboard performance
const defaultQueryClientOptions = {
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // 1 minute
			gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
			retry: 1,
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			refetchOnMount: true,
			throwOnError: false,
			placeholderData: (previousData: unknown) => previousData
		},
		mutations: {
			retry: 1
		}
	}
};

interface QueryProviderProps {
	children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(() => new QueryClient(defaultQueryClientOptions));

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools
					initialIsOpen={false}
					position='bottom'
				/>
			)}
		</QueryClientProvider>
	);
}
