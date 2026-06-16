// src/hooks/useOptimizedQuery.ts
import { type UseQueryOptions, type UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

// Broaden the type configuration for v5 flexibility (supporting select, error types, data variations)
interface OptimizedQueryOptions<TQueryFnData, TError, TData>
	extends Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey" | "queryFn"> {
	enablePrefetch?: boolean;
}

export function useOptimizedQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	queryKey: readonly unknown[],
	queryFn: () => Promise<TQueryFnData>,
	options: OptimizedQueryOptions<TQueryFnData, TError, TData> = {}
): UseQueryResult<TData, TError> {
	const queryClient = useQueryClient();
	const { enablePrefetch = false, ...queryOptions } = options;

	// 1. Maintain stable references using a mutable ref instead of a broken useMemo array
	const optionsRef = useRef(queryOptions);
	optionsRef.current = queryOptions;

	const queryFnRef = useRef(queryFn);
	queryFnRef.current = queryFn;

	// 2. Build the structural configuration safely
	const stableOptions = {
		queryKey,
		queryFn: () => queryFnRef.current(),
		staleTime: 60 * 1000, // 1 minute default stale time
		gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
		retry: 1,
		...optionsRef.current
	};

	// 3. Implement actual prefetch logic inside a side effect safely
	useEffect(() => {
		if (!enablePrefetch) return;

		// Prefetch the query eagerly if it doesn't exist or is stale
		queryClient.prefetchQuery({
			queryKey,
			queryFn: () => queryFnRef.current(),
			staleTime: stableOptions.staleTime
		});
	}, [queryKey, enablePrefetch, queryClient, stableOptions.staleTime]);

	// 4. Fire the hook with a stable options reference
	return useQuery(stableOptions);
}
