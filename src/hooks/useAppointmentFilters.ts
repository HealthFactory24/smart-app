// hooks/useAppointmentFilters.ts

import type { DataToolbarProps } from "@/components/DataToolbar";
import type { getMyAppointments } from "@/data/appointments";
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
	{ label: "Pending", value: "PENDING" },
	{ label: "Confirmed", value: "CONFIRMED" },
	{ label: "Completed", value: "COMPLETED" },
	{ label: "Cancelled", value: "CANCELLED" },
	{ label: "No Show", value: "NO_SHOW" }
];

const TYPE_OPTIONS = [
	{ label: "Consultation", value: "CONSULTATION" },
	{ label: "Follow-up", value: "FOLLOW_UP" },
	{ label: "Emergency", value: "EMERGENCY" },
	{ label: "Well Child", value: "WELL_CHILD" },
	{ label: "Sick Visit", value: "SICK_VISIT" },
	{ label: "Vaccination", value: "VACCINATION" }
];

type AppointmentListItem = Awaited<ReturnType<typeof getMyAppointments>>[number];

type UseAppointmentFiltersReturn = {
	filtered: AppointmentListItem[];
	toolbar: DataToolbarProps;
};

export function useAppointmentFilters(appointments: AppointmentListItem[]): UseAppointmentFiltersReturn {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [type, setType] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [sort, setSort] = useState("date-desc");

	const isDirty = !!(search || status || type || dateFrom || dateTo || sort !== "date-desc");

	const filtered = useMemo(() => {
		let result = [...appointments];

		// Search filter
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				apt =>
					apt.patientFirstName?.toLowerCase().includes(q) ||
					apt.patientLastName?.toLowerCase().includes(q) ||
					apt.doctorName?.toLowerCase().includes(q) ||
					apt.reason?.toLowerCase().includes(q)
			);
		}

		// Status filter
		if (status) {
			result = result.filter(apt => apt.status === status);
		}

		// Type filter
		if (type) {
			result = result.filter(apt => apt.type === type);
		}

		// Date range filter
		if (dateFrom) {
			result = result.filter(apt => {
				const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
				return aptDate >= dateFrom;
			});
		}

		if (dateTo) {
			result = result.filter(apt => {
				const aptDate = new Date(apt.appointmentDate).toISOString().split("T")[0];
				return aptDate <= dateTo;
			});
		}

		// Sorting
		if (sort === "date-desc") {
			result.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
		}
		if (sort === "date-asc") {
			result.sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
		}
		if (sort === "patient-asc") {
			result.sort((a, b) =>
				`${a.patientFirstName} ${a.patientLastName}`.localeCompare(`${b.patientFirstName} ${b.patientLastName}`)
			);
		}
		if (sort === "patient-desc") {
			result.sort((a, b) =>
				`${b.patientFirstName} ${b.patientLastName}`.localeCompare(`${a.patientFirstName} ${a.patientLastName}`)
			);
		}
		if (sort === "doctor-asc") {
			result.sort((a, b) => (a.doctorName || "").localeCompare(b.doctorName || ""));
		}
		if (sort === "doctor-desc") {
			result.sort((a, b) => (b.doctorName || "").localeCompare(a.doctorName || ""));
		}

		return result;
	}, [appointments, search, status, type, dateFrom, dateTo, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search by patient or doctor...",
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
				width: "w-[140px]"
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
		resultCount: { filtered: filtered.length, total: appointments.length }
	};

	return { filtered, toolbar };
}
