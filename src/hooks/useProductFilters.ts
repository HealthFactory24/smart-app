import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { ProductSelect } from "@/db/schema";

const SORT_OPTIONS = [
	{ label: "Name A → Z", value: "name-asc" },
	{ label: "Name Z → A", value: "name-desc" },
	{ label: "Price low → high", value: "price-asc" },
	{ label: "Price high → low", value: "price-desc" },
	{ label: "Top rated", value: "rating-desc" }
];

const INVENTORY_OPTIONS = [
	{ label: "In stock", value: "in-stock" },
	{ label: "Backorder", value: "backorder" },
	{ label: "Preorder", value: "preorder" }
];

const BADGE_OPTIONS = [
	{ label: "New", value: "New" },
	{ label: "Sale", value: "Sale" },
	{ label: "Featured", value: "Featured" },
	{ label: "Limited", value: "Limited" }
];

type UseProductFiltersReturn = {
	filtered: ProductSelect[];
	toolbar: DataToolbarProps;
};

export function useProductFilters(products: ProductSelect[]): UseProductFiltersReturn {
	const [search, setSearch] = useState("");
	const [inventory, setInventory] = useState("");
	const [badge, setBadge] = useState("");
	const [sort, setSort] = useState("");

	const isDirty = !!(search || inventory || badge || sort);

	const filtered = useMemo(() => {
		let result = [...products];

		if (search) {
			const q = search.toLowerCase();
			result = result.filter(p => p.name.toLowerCase().includes(q));
		}
		if (inventory) result.filter(p => p.inventory === inventory);
		if (inventory) result = result.filter(p => p.inventory === inventory);
		if (badge) result = result.filter(p => p.badge === badge);

		if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));
		if (sort === "name-desc") result.sort((a, b) => b.name.localeCompare(a.name));
		if (sort === "price-asc") result.sort((a, b) => Number(a.price) - Number(b.price));
		if (sort === "price-desc") result.sort((a, b) => Number(b.price) - Number(a.price));
		if (sort === "rating-desc") result.sort((a, b) => Number(b.rating) - Number(a.rating));

		return result;
	}, [products, search, inventory, badge, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search products by name...",
		filters: [
			{
				label: "inventory",
				value: inventory,
				placeholder: "All inventory",
				options: INVENTORY_OPTIONS,
				onChange: setInventory,
				width: "w-[150px]"
			},
			{
				label: "badges",
				value: badge,
				placeholder: "All badges",
				options: BADGE_OPTIONS,
				onChange: setBadge,
				width: "w-[140px]"
			}
		],
		sortOptions: SORT_OPTIONS,
		sortValue: sort,
		onSortChange: setSort,
		isDirty,
		onReset: () => {
			setSearch("");
			setInventory("");
			setBadge("");
			setSort("");
		},
		resultCount: { filtered: filtered.length, total: products.length }
	};

	return { filtered, toolbar };
}
