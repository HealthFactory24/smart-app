import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { OrderData } from "@/data/orders";

const SORT_OPTIONS = [
	{ label: "Customer A → Z", value: "name-asc" },
	{ label: "Customer Z → A", value: "name-desc" },
	{ label: "Total high → low", value: "total-desc" },
	{ label: "Total low → high", value: "total-asc" }
];

const STATUS_OPTIONS = [
	{ label: "Paid", value: "paid" },
	{ label: "Pending", value: "pending" },
	{ label: "Failed", value: "failed" }
];

type UseOrderFiltersReturn = {
	filtered: OrderData[];
	toolbar: DataToolbarProps;
};

export function useOrderFilters(orders: OrderData[]): UseOrderFiltersReturn {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [sort, setSort] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");

	const isDirty = !!(search || status || dateFrom || dateTo || sort);

	const filtered = useMemo(() => {
		let result = [...orders];

		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				o => o.user.name.toLowerCase().includes(q) || o.user.email.toLowerCase().includes(q)
			);
		}

		if (status) {
			result = result.filter(o => o.status === status);
		}

		if (dateFrom) {
			result = result.filter(o => {
				const d = new Date(o.createdAt);
				const orderDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
				return orderDate >= dateFrom;
			});
		}

		if (dateTo) {
			result = result.filter(o => {
				const d = new Date(o.createdAt);
				const orderDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
				return orderDate <= dateTo;
			});
		}
		if (sort === "name-asc") result.sort((a, b) => a.user.name.localeCompare(b.user.name));
		if (sort === "name-desc") result.sort((a, b) => b.user.name.localeCompare(a.user.name));
		if (sort === "total-desc") result.sort((a, b) => Number(b.total) - Number(a.total));
		if (sort === "total-asc") result.sort((a, b) => Number(a.total) - Number(b.total));

		return result;
	}, [orders, search, status, dateFrom, dateTo, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search by customer or email...",
		filters: [
			{
				label: "statuses",
				value: status,
				placeholder: "All statuses",
				options: STATUS_OPTIONS,
				onChange: setStatus,
				width: "w-[150px]"
			}
		],
		sortOptions: SORT_OPTIONS,
		sortValue: sort,
		onSortChange: setSort,
		isDirty,
		onReset: () => {
			setSearch("");
			setStatus("");
			setDateFrom("");
			setDateTo("");
			setSort("");
		},
		dateRange: {
			from: dateFrom,
			to: dateTo,
			onFromChange: setDateFrom,
			onToChange: setDateTo
		},
		resultCount: { filtered: filtered.length, total: orders.length }
	};

	return { filtered, toolbar };
}
