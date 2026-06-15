// hooks/useGrowthRecordFilters.ts
import { useMemo, useState } from "react";
import type { DataToolbarProps } from "@/components/DataToolbar";
import type { DbGrowthRecord, DbPatient } from "@/db/schema/types";

export type GrowthRecordWithPatient = DbGrowthRecord & {
  patient?: DbPatient | null;
};

const SORT_OPTIONS = [
  { label: "Date (newest first)", value: "date-desc" },
  { label: "Date (oldest first)", value: "date-asc" },
  { label: "Age (youngest first)", value: "age-asc" },
  { label: "Age (oldest first)", value: "age-desc" },
  { label: "Weight (highest first)", value: "weight-desc" },
  { label: "Weight (lowest first)", value: "weight-asc" }
];

const MEASUREMENT_TYPE_OPTIONS = [
  { label: "Weight", value: "WEIGHT" },
  { label: "Height", value: "HEIGHT" },
  { label: "BMI", value: "BMI" },
  { label: "Head Circumference", value: "HEAD_CIRCUMFERENCE" }
];

type UseGrowthRecordFiltersReturn = {
  filtered: GrowthRecordWithPatient[];
  toolbar: DataToolbarProps;
};

export function useGrowthRecordFilters(records: GrowthRecordWithPatient[]): UseGrowthRecordFiltersReturn {
  const [search, setSearch] = useState("");
  const [measurementType, setMeasurementType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("date-desc");

  const isDirty = !!(search || measurementType || dateFrom || dateTo || sort !== "date-desc");

  const filtered = useMemo(() => {
    let result = [...records];

    // Search filter (by patient name)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        r =>
          r.patient?.firstName?.toLowerCase().includes(q) ||
          r.patient?.lastName?.toLowerCase().includes(q)
      );
    }

    // Filter by which measurement has data
    if (measurementType) {
      result = result.filter(r => {
        switch (measurementType) {
          case "WEIGHT":
            return r.weight !== null && r.weight !== undefined;
          case "HEIGHT":
            return r.height !== null && r.height !== undefined;
          case "BMI":
            return r.bmi !== null && r.bmi !== undefined;
          case "HEAD_CIRCUMFERENCE":
            return r.headCircumference !== null && r.headCircumference !== undefined;
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(r => {
        const recordDate = new Date(r.date).toISOString().split("T")[0];
        return recordDate >= dateFrom;
      });
    }

    if (dateTo) {
      result = result.filter(r => {
        const recordDate = new Date(r.date).toISOString().split("T")[0];
        return recordDate <= dateTo;
      });
    }

    // Sorting
    if (sort === "date-desc") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    if (sort === "date-asc") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    if (sort === "age-asc") {
      result.sort((a, b) => (a.ageDays || 0) - (b.ageDays || 0));
    }
    if (sort === "age-desc") {
      result.sort((a, b) => (b.ageDays || 0) - (a.ageDays || 0));
    }
    if (sort === "weight-desc") {
      result.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    }
    if (sort === "weight-asc") {
      result.sort((a, b) => (a.weight || 0) - (b.weight || 0));
    }

    return result;
  }, [records, search, measurementType, dateFrom, dateTo, sort]);

  const toolbar: DataToolbarProps = {
    searchValue: search,
    onSearchChange: setSearch,
    searchPlaceholder: "Search by patient name...",
    filters: [
      {
        label: "measurement",
        value: measurementType,
        placeholder: "All measurements",
        options: MEASUREMENT_TYPE_OPTIONS,
        onChange: setMeasurementType,
        width: "w-[160px]"
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
      setMeasurementType("");
      setDateFrom("");
      setDateTo("");
      setSort("date-desc");
    },
    resultCount: { filtered: filtered.length, total: records.length }
  };

  return { filtered, toolbar };
}
