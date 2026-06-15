// hooks/usePrescriptionFilters.ts

import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbDiagnosis, DbDoctor, DbPatient, DbPrescription } from "@/db/schema/types";

export type PrescriptionWithRelation = DbPrescription & {
	patient?: DbPatient | null;
	doctor?: DbDoctor | null;
	diagnosis?: DbDiagnosis | null;
};

const SORT_OPTIONS = [
	{ label: "Date (newest first)", value: "date-desc" },
	{ label: "Date (oldest first)", value: "date-asc" },
	{ label: "Patient A → Z", value: "patient-asc" },
	{ label: "Patient Z → A", value: "patient-desc" },
	{ label: "Doctor A → Z", value: "doctor-asc" },
	{ label: "Doctor Z → A", value: "doctor-desc" }
];

const STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Completed", value: "completed" },
	{ label: "Cancelled", value: "cancelled" },
	{ label: "Expired", value: "expired" },
	{ label: "On Hold", value: "on_hold" }
];

type UsePrescriptionFiltersReturn = {
	filtered: PrescriptionWithRelation[];
	toolbar: DataToolbarProps;
};

export function usePrescriptionFilters(prescriptions: PrescriptionWithRelation[]): UsePrescriptionFiltersReturn {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sort, setSort] = useState("date-desc");

	const isDirty = !!(search || status || dateFrom || dateTo || sort !== "date-desc");

	const filtered = useMemo(() => {
		let result = [...prescriptions];

		// Search filter
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				p =>
					p.patient?.firstName?.toLowerCase().includes(q) ||
					p.patient?.lastName?.toLowerCase().includes(q) ||
					p.doctor?.name?.toLowerCase().includes(q) ||
					p.medicationName?.toLowerCase().includes(q) ||
					p.diagnosis?.toLowerCase().includes(q)
			);
		}

		// Status filter
		if (status) {
			result = result.filter(p => p.status === status);
		}

		// Date range filter
		if (dateFrom) {
			result = result.filter(p => {
				const issueDate = new Date(p.issuedDate).toISOString().split("T")[0];
				return issueDate >= dateFrom;
			});
		}

		if (dateTo) {
			result = result.filter(p => {
				const issueDate = new Date(p.issuedDate).toISOString().split("T")[0];
				return issueDate <= dateTo;
			});
		}

		// Sorting
		if (sort === "date-desc") {
			result.sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());
		}
		if (sort === "date-asc") {
			result.sort((a, b) => new Date(a.issuedDate).getTime() - new Date(b.issuedDate).getTime());
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
	}, [prescriptions, search, status, dateFrom, dateTo, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search by patient, doctor, or medication...",
		filters: [
			{
				label: "status",
				value: status,
				placeholder: "All statuses",
				options: STATUS_OPTIONS,
				onChange: setStatus,
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
			setDateFrom("");
			setDateTo("");
			setSort("date-desc");
		},
		resultCount: { filtered: filtered.length, total: prescriptions.length }
	};

	return { filtered, toolbar };
}
