export function calculateDateRange(period: string, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
	const end = endDate || new Date();
	const start =
		startDate ||
		(() => {
			const d = new Date();
			switch (period) {
				case "week":
					d.setDate(d.getDate() - 7);
					break;
				case "month":
					d.setMonth(d.getMonth() - 1);
					break;
				case "quarter":
					d.setMonth(d.getMonth() - 3);
					break;
				case "year":
					d.setFullYear(d.getFullYear() - 1);
					break;
				case "6months":
					d.setMonth(d.getMonth() - 6);
					break;
				default:
					d.setMonth(d.getMonth() - 1);
			}
			return d;
		})();
	return { start, end };
}

export function groupDataByDate<T extends { date?: Date; appointmentDate?: Date; createdAt?: Date }>(
	items: T[],
	groupBy: string,
	valueExtractor: (item: T) => number
): Array<{ date: string; value: number; label: string }> {
	const grouped = new Map<string, number>();

	for (const item of items) {
		const rawDate = item.date || item.appointmentDate || item.createdAt;
		if (!rawDate) continue;

		const date = new Date(rawDate);
		let key: string;

		if (groupBy === "day") {
			key = date.toISOString().split("T")[0] || "";
		} else if (groupBy === "week") {
			const weekStart = new Date(date);
			weekStart.setDate(date.getDate() - date.getDay());
			key = weekStart.toISOString().split("T")[0] || "";
		} else {
			key = `${date.getFullYear()}-${date.getMonth() + 1}`;
		}

		grouped.set(key, (grouped.get(key) || 0) + valueExtractor(item));
	}

	return Array.from(grouped.entries())
		.map(([key, value]) => ({ date: key, value, label: key }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateTrend(current: number, previous: number): "improving" | "declining" | "stable" {
	if (current > previous * 1.05) return "improving";
	if (current < previous * 0.95) return "declining";
	return "stable";
}
