// hooks/usePatientFilters.ts
import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbPatient } from "@/db/schema/types";

const SORT_OPTIONS = [
	{ label: "Name A → Z", value: "name-asc" },
	{ label: "Name Z → A", value: "name-desc" },
	{ label: "Age (youngest first)", value: "age-asc" },
	{ label: "Age (oldest first)", value: "age-desc" },
	{ label: "Newest first", value: "createdAt-desc" },
	{ label: "Oldest first", value: "createdAt-asc" }
];

const STATUS_OPTIONS = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
	{ label: "Pending", value: "PENDING" },
	{ label: "Suspended", value: "SUSPENDED" }
];

const GENDER_OPTIONS = [
	{ label: "Male", value: "MALE" },
	{ label: "Female", value: "FEMALE" },
	{ label: "Other", value: "OTHER" }
];

const BLOOD_GROUP_OPTIONS = [
	{ label: "A+", value: "A_POSITIVE" },
	{ label: "A-", value: "A_NEGATIVE" },
	{ label: "B+", value: "B_POSITIVE" },
	{ label: "B-", value: "B_NEGATIVE" },
	{ label: "O+", value: "O_POSITIVE" },
	{ label: "O-", value: "O_NEGATIVE" },
	{ label: "AB+", value: "AB_POSITIVE" },
	{ label: "AB-", value: "AB_NEGATIVE" }
];

type UsePatientFiltersReturn = {
	filtered: DbPatient[];
	toolbar: DataToolbarProps;
};

export function usePatientFilters(patients: DbPatient[]): UsePatientFiltersReturn {
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [gender, setGender] = useState("");
	const [bloodGroup, setBloodGroup] = useState("");
	const [sort, setSort] = useState("");

	const isDirty = !!(search || status || gender || bloodGroup || sort);

	const filtered = useMemo(() => {
		let result = [...patients];

		// Search filter
		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				p =>
					p.firstName.toLowerCase().includes(q) ||
					p.lastName.toLowerCase().includes(q) ||
					p.mrn?.toLowerCase().includes(q) ||
					p.email?.toLowerCase().includes(q)
			);
		}

		// Status filter
		if (status) {
			result = result.filter(p => p.status === status);
		}

		// Gender filter
		if (gender) {
			result = result.filter(p => p.gender === gender);
		}

		// Blood group filter
		if (bloodGroup) {
			result = result.filter(p => p.bloodGroup === bloodGroup);
		}

		// Sorting
		if (sort === "name-asc") {
			result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
		}
		if (sort === "name-desc") {
			result.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`));
		}
		if (sort === "age-asc") {
			result.sort((a, b) => new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime());
		}
		if (sort === "age-desc") {
			result.sort((a, b) => new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime());
		}
		if (sort === "createdAt-desc") {
			result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
		if (sort === "createdAt-asc") {
			result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		}

		return result;
	}, [patients, search, status, gender, bloodGroup, sort]);

	const toolbar: DataToolbarProps = {
		searchValue: search,
		onSearchChange: setSearch,
		searchPlaceholder: "Search by name, MRN, or email...",
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
				label: "gender",
				value: gender,
				placeholder: "All genders",
				options: GENDER_OPTIONS,
				onChange: setGender,
				width: "w-[120px]"
			},
			{
				label: "blood group",
				value: bloodGroup,
				placeholder: "All blood types",
				options: BLOOD_GROUP_OPTIONS,
				onChange: setBloodGroup,
				width: "w-[130px]"
			}
		],
		sortOptions: SORT_OPTIONS,
		sortValue: sort,
		onSortChange: setSort,
		isDirty,
		onReset: () => {
			setSearch("");
			setStatus("");
			setGender("");
			setBloodGroup("");
			setSort("");
		},
		resultCount: { filtered: filtered.length, total: patients.length }
	};

	return { filtered, toolbar };
}
