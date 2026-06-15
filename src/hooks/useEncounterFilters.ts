// hooks/useEncounterFilters.ts

import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbDiagnosis, DbDoctor, DbPatient } from "@/db/schema/types";
import { useMemo, useState } from "react";

const SORT_OPTIONS = [
	{ label: "Date (newest first)", value: "date-desc" },
	{ label: "Date (oldest first)", value: "date-asc" },
	{ label: "Patient A → Z", value: "patient-asc" },
	{ label: "Patient Z → A", value: "patient-desc" },
	{ label: "Doctor A → Z", value: "doctor-asc" },
	{ label: "Doctor Z → A", value: "doctor-desc" }
];

const STATUS_OPTIONS = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Completed", value: "COMPLETED" },
	{ label: "On Hold", value: "ON_HOLD" },
	{ label: "Cancelled", value: "CANCELLED" }
];

const TYPE_OPTIONS = [
	{ label: "Initial", value: "Initial" },
	{ label: "Follow-up", value: "Follow-up" },
	{ label: "Emergency", value: "Emergency" },
	{ label: "Consultation", value: "Consultation" }
];
type EncounterListItem = DbDiagnosis & {
	patient?: DbPatient | null;
	doctor?: DbDoctor | null;
};

type UseEncounterFiltersReturn = {
	filtered: EncounterListItem[];
	toolbar: DataToolbarProps;
};

export function useEncounterFilters(encounters: EncounterListItem[]): UseEncounterFiltersReturn {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [type, setType] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sort, setSort] = useState("date-desc");

	const isDirty = !!(search || status || type || dateFrom || dateTo || sort !== "date-desc");

	const filtered = useMemo(() => {
		let result = [...encounters];

		// Search filter
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				e =>
					e.patient?.firstName?.toLowerCase().includes(q) ||
					e.patient?.lastName?.toLowerCase().includes(q) ||
					e.doctor?.name?.toLowerCase().includes(q) ||
					e.diagnosis?.toLowerCase().includes(q) ||
					e.symptoms?.toLowerCase().includes(q)
			);
		}

		// Status filter
		if (status) {
			result = result.filter(e => e.status === status);
		}

		// Type filter
		if (type) {
			result = result.filter(e => e.type === type);
		}

		// Date range filter
		if (dateFrom) {
			result = result.filter(e => {
				const encDate = new Date(e.date).toISOString().split("T")[0];
				return encDate >= dateFrom;
			});
		}

		if (dateTo) {
			result = result.filter(e => {
				const encDate = new Date(e.date).toISOString().split("T")[0];
				return encDate <= dateTo;
			});
		}

		// Sorting
		if (sort === "date-desc") {
			result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		}
		if (sort === "date-asc") {
			result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		}
		if (sort === "patient-asc") {
			result.sort((a, b) =>
				`${a.patient?.firstName} ${a.patient?.lastName}`.localeCompare(
					`${b.patient?.firstName} ${b.patient?.lastName}`
				)
			);
		}
		if (sort === "patient-desc") {
			result.sort((a, b) =>
				`${b.patient?.firstName} ${b.patient?.lastName}`.localeCompare(
					`${a.patient?.firstName} ${a.patient?.lastName}`
				)
			);
		}
		if (sort === "doctor-asc") {
			result.sort((a, b) => (a.doctor?.name || "").localeCompare(b.doctor?.name || ""));
		}
		if (sort === "doctor-desc") {
			result.sort((a, b) => (b.doctor?.name || "").localeCompare(a.doctor?.name || ""));
		}

		return result;
	}, [encounters, search, status, type, dateFrom, dateTo, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search by patient, doctor, or diagnosis...",
		filters: [
			{
				label: "status",
				value: status,
				placeholder: "All statuses",
				options: STATUS_OPTIONS,
				onChange: setStatus,
				width: "w-[130px]"
			},
			{
				label: "type",
				value: type,
				placeholder: "All types",
				options: TYPE_OPTIONS,
				onChange: setType,
				width: "w-[130px]"
			}
		],
		sortOptions: SORT_OPTIONS,
		sortValue: sort,
		onSortChange: setSort,
		dateRange: {
			from: dateFrom,
			to: dateTo,
			onFromChange: setDateFrom,
			onToChange: setDateTo
		},
		isDirty,
		onReset: () => {
			setSearch("");
			setStatus("");
			setType("");
			setDateFrom("");
			setDateTo("");
			setSort("date-desc");
		},
		resultCount: { filtered: filtered.length, total: encounters.length }
	};

	return { filtered, toolbar };
}
