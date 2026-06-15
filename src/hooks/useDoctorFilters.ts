// hooks/useDoctorFilters.ts
import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbDoctor } from "@/db/schema/types";

const SORT_OPTIONS = [
  { label: "Name A → Z", value: "name-asc" },
  { label: "Name Z → A", value: "name-desc" },
  { label: "Rating (high to low)", value: "rating-desc" },
  { label: "Rating (low to high)", value: "rating-asc" },
  { label: "Newest first", value: "createdAt-desc" }
];

const SPECIALTY_OPTIONS = [
  { label: "Pediatrics", value: "Pediatrics" },
  { label: "Cardiology", value: "Cardiology" },
  { label: "Neurology", value: "Neurology" },
  { label: "Dermatology", value: "Dermatology" },
  { label: "Orthopedics", value: "Orthopedics" },
  { label: "General Medicine", value: "General Medicine" }
];

const AVAILABILITY_OPTIONS = [
  { label: "Available", value: "AVAILABLE" },
  { label: "Unavailable", value: "UNAVAILABLE" },
  { label: "On Leave", value: "ON_LEAVE" }
];

const DOCTOR_TYPE_OPTIONS = [
  { label: "Full Time", value: "FULL" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Consultant", value: "CONSULTANT" },
  { label: "Visiting", value: "VISITING" }
];

type UseDoctorFiltersReturn = {
  filtered: DbDoctor[];
  toolbar: DataToolbarProps;
};

export function useDoctorFilters(doctors: DbDoctor[]): UseDoctorFiltersReturn {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [availability, setAvailability] = useState("");
  const [doctorType, setDoctorType] = useState("");
  const [sort, setSort] = useState("name-asc");

  const isDirty = !!(search || specialty || availability || doctorType || sort !== "name-asc");

  const filtered = useMemo(() => {
    let result = [...doctors];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q) ||
          d.email?.toLowerCase().includes(q)
      );
    }

    // Specialty filter
    if (specialty) {
      result = result.filter(d => d.specialty === specialty);
    }

    // Availability filter
    if (availability) {
      result = result.filter(d => d.availabilityStatus === availability);
    }

    // Doctor type filter
    if (doctorType) {
      result = result.filter(d => d.type === doctorType);
    }

    // Sorting
    if (sort === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sort === "rating-desc") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sort === "rating-asc") {
      result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    if (sort === "createdAt-desc") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [doctors, search, specialty, availability, doctorType, sort]);

  const toolbar: DataToolbarProps = {
    searchValue: search,
    onSearchChange: setSearch,
    searchPlaceholder: "Search by name, specialty, or email...",
    filters: [
      {
        label: "specialty",
        value: specialty,
        placeholder: "All specialties",
        options: SPECIALTY_OPTIONS,
        onChange: setSpecialty,
        width: "w-[140px]"
      },
      {
        label: "availability",
        value: availability,
        placeholder: "All availability",
        options: AVAILABILITY_OPTIONS,
        onChange: setAvailability,
        width: "w-[130px]"
      },
      {
        label: "type",
        value: doctorType,
        placeholder: "All types",
        options: DOCTOR_TYPE_OPTIONS,
        onChange: setDoctorType,
        width: "w-[120px]"
      }
    ],
    sortOptions: SORT_OPTIONS,
    sortValue: sort,
    onSortChange: setSort,
    isDirty,
    onReset: () => {
      setSearch("");
      setSpecialty("");
      setAvailability("");
      setDoctorType("");
      setSort("name-asc");
    },
    resultCount: { filtered: filtered.length, total: doctors.length }
  };

  return { filtered, toolbar };
}
