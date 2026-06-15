// hooks/useServiceFilters.ts
import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbService } from "@/db/schema/types";

const SORT_OPTIONS = [
  { label: "Name A → Z", value: "name-asc" },
  { label: "Name Z → A", value: "name-desc" },
  { label: "Price (low to high)", value: "price-asc" },
  { label: "Price (high to low)", value: "price-desc" },
  { label: "Duration (shortest first)", value: "duration-asc" },
  { label: "Duration (longest first)", value: "duration-desc" }
];

const CATEGORY_OPTIONS = [
  { label: "Consultation", value: "CONSULTATION" },
  { label: "Lab Test", value: "LAB_TEST" },
  { label: "Vaccination", value: "VACCINATION" },
  { label: "Procedure", value: "PROCEDURE" },
  { label: "Diagnosis", value: "DIAGNOSIS" },
  { label: "Pharmacy", value: "PHARMACY" },
  { label: "Other", value: "OTHER" }
];

type UseServiceFiltersReturn = {
  filtered: DbService[];
  toolbar: DataToolbarProps;
};

export function useServiceFilters(services: DbService[]): UseServiceFiltersReturn {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [sort, setSort] = useState("name-asc");

  const isDirty = !!(search || category || availability || sort !== "name-asc");

  const filtered = useMemo(() => {
    let result = [...services];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        s =>
          s.serviceName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category) {
      result = result.filter(s => s.category === category);
    }

    // Availability filter
    if (availability) {
      result = result.filter(s => s.isAvailable === (availability === "available"));
    }

    // Sorting
    if (sort === "name-asc") {
      result.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
    }
    if (sort === "name-desc") {
      result.sort((a, b) => b.serviceName.localeCompare(a.serviceName));
    }
    if (sort === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sort === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sort === "duration-asc") {
      result.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    }
    if (sort === "duration-desc") {
      result.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    }

    return result;
  }, [services, search, category, availability, sort]);

  const toolbar: DataToolbarProps = {
    searchValue: search,
    onSearchChange: setSearch,
    searchPlaceholder: "Search services...",
    filters: [
      {
        label: "category",
        value: category,
        placeholder: "All categories",
        options: CATEGORY_OPTIONS,
        onChange: setCategory,
        width: "w-[140px]"
      },
      {
        label: "availability",
        value: availability,
        placeholder: "All services",
        options: [
          { label: "Available", value: "available" },
          { label: "Unavailable", value: "unavailable" }
        ],
        onChange: setAvailability,
        width: "w-[130px]"
      }
    ],
    sortOptions: SORT_OPTIONS,
    sortValue: sort,
    onSortChange: setSort,
    isDirty,
    onReset: () => {
      setSearch("");
      setCategory("");
      setAvailability("");
      setSort("name-asc");
    },
    resultCount: { filtered: filtered.length, total: services.length }
  };

  return { filtered, toolbar };
}
