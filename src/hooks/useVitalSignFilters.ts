// hooks/useVitalSignFilters.ts

import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbPatient, DbVitalSign } from "@/db/schema/types";

export type VitalSignWithPatient = DbVitalSign & {
	patient?: DbPatient | null;
};

const SORT_OPTIONS = [
	{ label: "Date (newest first)", value: "date-desc" },
	{ label: "Date (oldest first)", value: "date-asc" },
	{ label: "Heart Rate (high to low)", value: "hr-desc" },
	{ label: "Heart Rate (low to high)", value: "hr-asc" },
	{ label: "Blood Pressure (systolic high)", value: "bp-desc" },
	{ label: "Blood Pressure (systolic low)", value: "bp-asc" }
];

const VITAL_TYPE_OPTIONS = [
	{ label: "All Vitals", value: "" },
	{ label: "Temperature", value: "temperature" },
	{ label: "Blood Pressure", value: "bp" },
	{ label: "Heart Rate", value: "hr" },
	{ label: "Respiratory Rate", value: "rr" },
	{ label: "Oxygen Saturation", value: "o2" }
];

type UseVitalSignFiltersReturn = {
	filtered: VitalSignWithPatient[];
	toolbar: DataToolbarProps;
};

export function useVitalSignFilters(vitals: VitalSignWithPatient[]): UseVitalSignFiltersReturn {
	const [search, setSearch] = useState("");
	const [vitalType, setVitalType] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sort, setSort] = useState("date-desc");

	const isDirty = !!(search || vitalType || dateFrom || dateTo || sort !== "date-desc");

	const filtered = useMemo(() => {
		let result = [...vitals];

		// Search filter (by patient name)
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				v => v.patient?.firstName?.toLowerCase().includes(q) || v.patient?.lastName?.toLowerCase().includes(q)
			);
		}

		// Filter by which vital sign has data
		if (vitalType) {
			result = result.filter(v => {
				switch (vitalType) {
					case "temperature":
						return v.bodyTemperature !== null && v.bodyTemperature !== undefined;
					case "bp":
						return v.systolic !== null && v.diastolic !== null;
					case "hr":
						return v.heartRate !== null && v.heartRate !== undefined;
					case "rr":
						return v.respiratoryRate !== null && v.respiratoryRate !== undefined;
					case "o2":
						return v.oxygenSaturation !== null && v.oxygenSaturation !== undefined;
					default:
						return true;
				}
			});
		}

		// Date range filter
		if (dateFrom) {
			result = result.filter(v => {
				const recordDate = new Date(v.recordedAt).toISOString().split("T")[0];
				return recordDate >= dateFrom;
			});
		}

		if (dateTo) {
			result = result.filter(v => {
				const recordDate = new Date(v.recordedAt).toISOString().split("T")[0];
				return recordDate <= dateTo;
			});
		}

		// Sorting
		if (sort === "date-desc") {
			result.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
		}
		if (sort === "date-asc") {
			result.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
		}
		if (sort === "hr-desc") {
			result.sort((a, b) => (b.heartRate || 0) - (a.heartRate || 0));
		}
		if (sort === "hr-asc") {
			result.sort((a, b) => (a.heartRate || 0) - (b.heartRate || 0));
		}
		if (sort === "bp-desc") {
			result.sort((a, b) => (b.systolic || 0) - (a.systolic || 0));
		}
		if (sort === "bp-asc") {
			result.sort((a, b) => (a.systolic || 0) - (b.systolic || 0));
		}

		return result;
	}, [vitals, search, vitalType, dateFrom, dateTo, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search by patient name...",
		filters: [
			{
				label: "vital sign",
				value: vitalType,
				placeholder: "All vital signs",
				options: VITAL_TYPE_OPTIONS,
				onChange: setVitalType,
				width: "w-[150px]"
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
			setVitalType("");
			setDateFrom("");
			setDateTo("");
			setSort("date-desc");
		},
		resultCount: { filtered: filtered.length, total: vitals.length }
	};

	return { filtered, toolbar };
}
