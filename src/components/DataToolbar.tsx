import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FilterOption = {
	label: string;
	value: string;
};

export type DataToolbarProps = {
	searchValue: string;
	onSearchChange: (value: string) => void;
	searchPlaceholder?: string;
	filters?: {
		label: string;
		value: string;
		placeholder: string;
		options: FilterOption[];
		onChange: (value: string) => void;
		width?: string;
	}[];
	sortOptions?: FilterOption[];
	sortValue: string;
	onSortChange: (value: string) => void;
	dateRange?: {
		from: string;
		to: string;
		onFromChange: (value: string) => void;
		onToChange: (value: string) => void;
	};
	isDirty: boolean;
	onReset: () => void;
	resultCount?: { filtered: number; total: number };
};

export function DataToolbar({
	searchValue,
	onSearchChange,
	searchPlaceholder = "Search...",
	filters = [],
	sortOptions = [],
	sortValue,
	onSortChange,
	isDirty,
	onReset,
	dateRange,
	resultCount
}: DataToolbarProps) {
	return (
		<div className='mt-4 flex flex-col gap-3'>
			<div className='flex flex-wrap items-center gap-2'>
				{/* Search input */}
				<div className='relative min-w-50 flex-1'>
					<Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
					<Input
						className='pr-8 pl-9'
						onChange={e => onSearchChange(e.target.value ?? "")}
						placeholder={searchPlaceholder}
						value={searchValue}
					/>
					{searchValue && (
						<button
							aria-label='Clear search'
							className='absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200'
							onClick={() => onSearchChange("")}
							type='button'
						>
							<X size={14} />
						</button>
					)}
				</div>

				{/* Dynamic filter dropdowns (inventory, status, badge…) */}
				{filters.map(filter => (
					<Select
						key={filter.placeholder}
						onValueChange={v => filter.onChange(v === "__reset__" ? "" : (v ?? ""))}
						value={filter.value}
					>
						<SelectTrigger className={filter.width ?? "w-40"}>
							<SelectValue placeholder={filter.placeholder} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='__reset__'>{filter.placeholder}</SelectItem>
							{filter.options.map(opt => (
								<SelectItem
									key={opt.value}
									value={opt.value}
								>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				))}

				{/* Date range — only renders when dateRange prop is passed */}
				{dateRange && (
					<div className='flex items-center gap-2'>
						<Input
							className='w-37.5 text-sm'
							onChange={e => dateRange.onFromChange(e.target.value ?? "")}
							type='date'
							value={dateRange.from}
						/>
						<span className='text-slate-400 text-xs'>to</span>
						<Input
							className='w-37.5 text-sm'
							onChange={e => dateRange.onToChange(e.target.value ?? "")}
							type='date'
							value={dateRange.to}
						/>
					</div>
				)}

				{/* Sort dropdown */}
				{sortOptions.length > 0 && (
					<Select
						onValueChange={v => onSortChange(v === "__reset__" ? "" : (v ?? ""))}
						value={sortValue}
					>
						<SelectTrigger className='w-45'>
							<SelectValue placeholder='Sort by...' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='__reset__'>Sort by...</SelectItem>
							{sortOptions.map(opt => (
								<SelectItem
									key={opt.value}
									value={opt.value}
								>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}

				{/* Reset button — only visible when any filter is active */}
				{isDirty && (
					<Button
						className='gap-1.5 text-slate-500'
						onClick={onReset}
						size='sm'
						variant='outline'
					>
						<RotateCcw size={13} />
						Reset
					</Button>
				)}
			</div>

			{/* Result count — only shown when filters are active */}
			{resultCount && isDirty && (
				<p className='text-slate-400 text-xs'>
					Showing{" "}
					<span className='font-medium text-slate-600 dark:text-slate-300'>{resultCount.filtered}</span> of{" "}
					{resultCount.total} results
				</p>
			)}
		</div>
	);
}
