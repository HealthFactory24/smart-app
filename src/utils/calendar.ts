/**
 * Generate time slots between start and end times
 */
export function generateTimeSlots(startTime: string, endTime: string, slotDurationMinutes: number): string[] {
	const slots: string[] = [];
	const [startHour, startMinute] = startTime.split(":").map(Number);
	const [endHour, endMinute] = endTime.split(":").map(Number);

	let currentHour = startHour ?? 0;
	let currentMinute = startMinute ?? 0;

	while (currentHour < (endHour ?? 0) || (currentHour === (endHour ?? 0) && currentMinute < (endMinute ?? 0))) {
		const time = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
		slots.push(time);

		currentMinute += slotDurationMinutes;
		if (currentMinute >= 60) {
			currentHour += Math.floor(currentMinute / 60);
			currentMinute = currentMinute % 60;
		}
	}

	return slots;
}

/**
 * Calculate available time slots based on working hours and booked slots
 */
export function calculateAvailableSlots(
	workingStart: string,
	workingEnd: string,
	durationMinutes: number,
	bookedSlots: Array<{ start: Date; duration: number }>,
	date: Date
): Array<{ startTime: string; endTime: string; available: boolean }> {
	const slots: Array<{
		startTime: string;
		endTime: string;
		available: boolean;
	}> = [];

	const [startHour, startMinute] = workingStart.split(":").map(Number);
	const [endHour, endMinute] = workingEnd.split(":").map(Number);

	let currentHour = startHour ?? 0;
	let currentMinute = startMinute ?? 0;
	const endTotalMinutes = (endHour ?? 0) * 60 + (endMinute ?? 0);

	// Create a set of booked time ranges for quick lookup
	const bookedRanges = bookedSlots.map(slot => ({
		startMinutes: slot.start.getHours() * 60 + slot.start.getMinutes(),
		endMinutes: slot.start.getHours() * 60 + slot.start.getMinutes() + slot.duration
	}));

	while (currentHour * 60 + currentMinute + durationMinutes <= endTotalMinutes) {
		const slotStartMinutes = currentHour * 60 + currentMinute;
		const slotEndMinutes = slotStartMinutes + durationMinutes;

		// Check if slot overlaps with any booked slot
		const isBooked = bookedRanges.some(
			booked => !(slotEndMinutes <= booked.startMinutes || slotStartMinutes >= booked.endMinutes)
		);

		const startTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

		const endTime = new Date(date);
		endTime.setHours(currentHour, currentMinute + durationMinutes);
		const endTimeStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime
			.getMinutes()
			.toString()
			.padStart(2, "0")}`;

		slots.push({
			startTime: startTimeStr,
			endTime: endTimeStr,
			available: !isBooked
		});

		currentMinute += durationMinutes;
		if (currentMinute >= 60) {
			currentHour += Math.floor(currentMinute / 60);
			currentMinute = currentMinute % 60;
		}
	}

	return slots;
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
export function formatTimeForDisplay(time: string): string {
	const [hour, minute] = time.split(":").map(Number);
	const period = (hour ?? 0) >= 12 ? "PM" : "AM";
	const displayHour = (hour ?? 0) % 12 || 12;
	return `${displayHour}:${minute?.toString().padStart(2, "0")} ${period}`;
}

/**
 * Check if a time is within working hours
 */
export function isWithinWorkingHours(time: string, workingStart: string, workingEnd: string): boolean {
	const [hour, minute] = time.split(":").map(Number);
	const [startHour, startMinute] = workingStart.split(":").map(Number);
	const [endHour, endMinute] = workingEnd.split(":").map(Number);

	const timeMinutes = (hour ?? 0) * 60 + (minute ?? 0);
	const startMinutes = (startHour ?? 0) * 60 + (startMinute ?? 0);
	const endMinutes = (endHour ?? 0) * 60 + (endMinute ?? 0);

	return timeMinutes >= startMinutes && timeMinutes + 30 <= endMinutes;
}

/**
 * Get event color based on appointment type
 */
export function getEventColor(type: string): string {
	const colors: Record<string, string> = {
		"well-child": "#10b981",
		"sick-visit": "#3b82f6",
		"follow-up": "#8b5cf6",
		immunization: "#f59e0b",
		consultation: "#06b6d4",
		CHECKUP: "#10b981",
		FOLLOW_UP: "#8b5cf6",
		CONSULTATION: "#06b6d4",
		EMERGENCY: "#ef4444",
		VACCINATION: "#f59e0b",
		LAB_TEST: "#8b5cf6"
	};
	return colors[type] || "#6b7280";
}

/**
 * Get status color based on appointment status
 */
export function getStatusColor(status: string): string {
	const colors: Record<string, string> = {
		SCHEDULED: "#3b82f6",
		CONFIRMED: "#10b981",
		COMPLETED: "#6b7280",
		CANCELLED: "#ef4444",
		NO_SHOW: "#ef4444",
		PENDING: "#f59e0b"
	};
	return colors[status] || "#6b7280";
}
