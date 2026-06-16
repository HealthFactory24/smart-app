// src/components/DoctorAvailabilityCalendar.tsx

import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { getAvailableTimeSlots } from "../data/appointments";
import { cn } from "../lib/utils";

interface TimeSlot {
	time: string;
	available: boolean;
}

interface DoctorAvailabilityCalendarProps {
	doctorId: string;
	onSelectSlot: (date: Date, time: string) => void;
	selectedDate?: Date;
	selectedTime?: string;
}

export function DoctorAvailabilityCalendar({
	doctorId,
	onSelectSlot,
	selectedDate,
	selectedTime
}: DoctorAvailabilityCalendarProps) {
	const [date, setDate] = useState<Date | undefined>(selectedDate);
	const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
	const [loading, setLoading] = useState(false);

	// Fetch available time slots when date changes
	const handleDateSelect = async (newDate: Date | undefined) => {
		setDate(newDate);
		if (!newDate) return;

		setLoading(true);
		try {
			// Fetch available slots from API
			const slots = await getAvailableTimeSlots({
				data: { doctorId, date: newDate }
			});
			setTimeSlots(slots.map(slot => ({ time: slot, available: true })));
		} catch (error) {
			console.error("Failed to load time slots", error);
		} finally {
			setLoading(false);
		}
	};

	const isDateDisabled = (date: Date) => {
		// Disable past dates
		if (date < new Date()) return true;
		// Disable weekends if needed
		// if (date.getDay() === 0 || date.getDay() === 6) return true;
		return false;
	};

	return (
		<div className='grid gap-6 lg:grid-cols-2'>
			{/* Calendar */}
			<Card>
				<CardContent className='pt-6'>
					<Calendar
						className='rounded-md'
						disabled={isDateDisabled}
						mode='single'
						onSelect={handleDateSelect}
						selected={date}
					/>
				</CardContent>
			</Card>

			{/* Time Slots */}
			<Card>
				<CardContent className='pt-6'>
					<h3 className='mb-4 font-semibold'>
						Available Time Slots
						{date && <span className='ml-2 text-slate-500 text-sm'>for {date.toLocaleDateString()}</span>}
					</h3>

					{loading ? (
						<div className='flex items-center justify-center py-8'>
							<Clock className='h-6 w-6 animate-pulse text-slate-400' />
						</div>
					) : timeSlots.length > 0 ? (
						<div className='grid grid-cols-2 gap-2'>
							{timeSlots.map(slot => (
								<Button
									className={cn(
										"justify-start",
										selectedTime === slot.time && "bg-primary text-primary-foreground"
									)}
									key={slot.time}
									onClick={() => onSelectSlot(date??new Date(), slot.time)}
									variant={selectedTime === slot.time ? "default" : "outline"}
								>
									<Clock className='mr-2 h-3 w-3' />
									{slot.time}
									{selectedTime === slot.time && <CheckCircle className='ml-auto h-4 w-4' />}
								</Button>
							))}
						</div>
					) : date ? (
						<div className='py-8 text-center'>
							<XCircle className='mx-auto h-8 w-8 text-slate-400' />
							<p className='mt-2 text-slate-500 text-sm'>No available slots for this date</p>
							<p className='text-slate-400 text-xs'>Please select another date</p>
						</div>
					) : (
						<div className='py-8 text-center'>
							<Clock className='mx-auto h-8 w-8 text-slate-400' />
							<p className='mt-2 text-slate-500 text-sm'>Select a date to see available times</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
