"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const DatePicker = function DatePickerCmp({
	date,
	setDate,
	ref
}: {
	date?: Date;
	setDate: (date?: Date) => void;
	ref?: RefObject<HTMLDivElement | null>;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className={cn("w-full justify-start text-start font-normal", !date && "text-muted-foreground")}
					variant={"outline"}
				>
					<CalendarIcon className='me-2 h-4 w-4' />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className='w-auto p-0'
				ref={ref}
			>
				<Calendar
					mode='single'
					onSelect={setDate}
					selected={date}
				/>
			</PopoverContent>
		</Popover>
	);
};
