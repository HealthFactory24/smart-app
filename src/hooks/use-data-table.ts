/** biome-ignore-all lint/suspicious/noExplicitAny: <ok> */
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	type ColumnFiltersState,
	type ColumnPinningState,
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type TableOptions,
	type TableState,
	type Updater,
	useReactTable,
	type VisibilityState
} from "@tanstack/react-table";
import * as React from "react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { parseSortingState, serializeSortingState } from "@/lib/parsers";
import type { ExtendedColumnSort } from "@/types/data-table";

const ARRAY_SEPARATOR = ",";
const DEBOUNCE_MS = 300;

interface UseDataTableProps<TData>
	extends Omit<
			TableOptions<TData>,
			"state" | "pageCount" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting"
		>,
		Required<Pick<TableOptions<TData>, "pageCount">> {
	initialState?: Omit<Partial<TableState>, "sorting"> & {
		sorting?: ExtendedColumnSort<TData>[];
	};
	history?: "push" | "replace";
	debounceMs?: number;
	throttleMs?: number;
	clearOnDefault?: boolean;
	enableAdvancedFilter?: boolean;
	scroll?: boolean;
	shallow?: boolean;
	startTransition?: React.TransitionStartFunction;
}

type SearchParams = Record<string, string | number | undefined>;

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
	const {
		columns,
		pageCount = -1,
		initialState,
		history = "replace",
		debounceMs = DEBOUNCE_MS,
		enableAdvancedFilter = false,
		shallow = true,
		...tableProps
	} = props;

	const search = useSearch({ strict: false }) as SearchParams;
	const navigate = useNavigate();

	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState?.rowSelection ?? {});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
		initialState?.columnVisibility ?? {}
	);
	const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(initialState?.columnPinning ?? {});

	// Read pagination from search params
	const page = Number(search.page) || 1;
	const perPage = Number(search.perPage) || (initialState?.pagination?.pageSize ?? 10);

	const pagination: PaginationState = React.useMemo(
		() => ({
			pageIndex: page - 1,
			pageSize: perPage
		}),
		[page, perPage]
	);

	const onPaginationChange = React.useCallback(
		(updaterOrValue: Updater<PaginationState>) => {
			const newPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
			navigate({
				search: ((prev: SearchParams) => ({
					...prev,
					page: newPagination.pageIndex + 1,
					perPage: newPagination.pageSize
				})) as any,
				replace: history === "replace"
			});
		},
		[pagination, navigate, history]
	);

	// Read sorting from search params
	const columnIds = React.useMemo(() => {
		return new Set(columns.map(column => column.id).filter(Boolean) as string[]);
	}, [columns]);

	const sorting = React.useMemo(
		() => parseSortingState<TData>(search.sort as string | undefined, columnIds) ?? initialState?.sorting ?? [],
		[search.sort, columnIds, initialState?.sorting]
	);

	const onSortingChange = React.useCallback(
		(updaterOrValue: Updater<SortingState>) => {
			const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
			navigate({
				search: ((prev: SearchParams) => ({
					...prev,
					sort:
						newSorting.length > 0
							? serializeSortingState(newSorting as ExtendedColumnSort<TData>[])
							: undefined
				})) as any,
				replace: history === "replace"
			});
		},
		[sorting, navigate, history]
	);

	// Filter handling
	const filterableColumns = React.useMemo(() => {
		if (enableAdvancedFilter) return [];
		return columns.filter(column => column.enableColumnFilter);
	}, [columns, enableAdvancedFilter]);

	// Read filter values from search params
	const filterValues = React.useMemo(() => {
		if (enableAdvancedFilter) return {};
		const values: Record<string, string | string[] | null> = {};
		for (const column of filterableColumns) {
			const key = column.id ?? "";
			const val = search[key];
			if (val !== undefined && val !== null) {
				if (column.meta?.options) {
					// Array filter - stored as comma-separated string
					values[key] = typeof val === "string" ? val.split(ARRAY_SEPARATOR) : null;
				} else {
					values[key] = typeof val === "string" ? val : null;
				}
			} else {
				values[key] = null;
			}
		}
		return values;
	}, [search, filterableColumns, enableAdvancedFilter]);

	const debouncedSetFilterValues = useDebouncedCallback((values: Record<string, string | string[] | null>) => {
		navigate({
			search: ((prev: SearchParams) => {
				const next: SearchParams = { ...prev, page: 1 };
				for (const [key, value] of Object.entries(values)) {
					if (value === null || value === undefined) {
						delete next[key];
					} else if (Array.isArray(value)) {
						next[key] = value.join(ARRAY_SEPARATOR);
					} else {
						next[key] = value;
					}
				}
				return next;
			}) as any,
			replace: history === "replace"
		});
	}, debounceMs);

	const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
		if (enableAdvancedFilter) return [];

		return Object.entries(filterValues).reduce<ColumnFiltersState>((filters, [key, value]) => {
			if (value !== null) {
				const processedValue = Array.isArray(value)
					? value
					: typeof value === "string" && /[^a-zA-Z0-9]/.test(value)
						? value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
						: [value];

				filters.push({
					id: key,
					value: processedValue
				});
			}
			return filters;
		}, []);
	}, [filterValues, enableAdvancedFilter]);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters);

	const onColumnFiltersChange = React.useCallback(
		(updaterOrValue: Updater<ColumnFiltersState>) => {
			if (enableAdvancedFilter) return;

			setColumnFilters(prev => {
				const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;

				const filterUpdates: Record<string, string | string[] | null> = {};
				for (const filter of next) {
					if (filterableColumns.find(column => column.id === filter.id)) {
						filterUpdates[filter.id] = filter.value as string | string[];
					}
				}

				for (const prevFilter of prev) {
					if (!next.some(filter => filter.id === prevFilter.id)) {
						filterUpdates[prevFilter.id] = null;
					}
				}

				debouncedSetFilterValues(filterUpdates);
				return next;
			});
		},
		[debouncedSetFilterValues, filterableColumns, enableAdvancedFilter]
	);

	const table = useReactTable({
		...tableProps,
		columns,
		initialState,
		pageCount,
		state: {
			pagination,
			sorting,
			columnVisibility,
			columnPinning,
			rowSelection,
			columnFilters
		},
		defaultColumn: {
			...tableProps.defaultColumn,
			enableColumnFilter: false
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnPinningChange: setColumnPinning,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true
	});

	return { table, shallow, debounceMs, throttleMs: props.throttleMs };
}
