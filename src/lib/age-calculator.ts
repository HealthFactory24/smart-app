// src/lib/age-calculator.ts
export interface AgeResult {
	days: number;
	formatted: string;
	months: number;
	years: number;
}

export class AgeCalculator {
	/**
	 * Calculate age from date of birth
	 */
	calculate(dateOfBirth: Date | string, referenceDate: Date = new Date()): AgeResult {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		console.log("AgeCalculator.calculate called with:", { dob, ref });

		// Validate that birth date is not in the future
		if (dob > ref) {
			console.log("Throwing error: Birth date is in the future");
			throw new Error("Birth date cannot be in the future");
		}

		console.log("Validation passed, calculating age...");

		// Total days
		const days = Math.floor((ref.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));

		// Calculate years and months
		let years = ref.getFullYear() - dob.getFullYear();
		let months = ref.getMonth() - dob.getMonth();

		if (months < 0) {
			years--;
			months += 12;
		}

		// Adjust for day of month
		if (ref.getDate() < dob.getDate()) {
			months--;
			if (months < 0) {
				years--;
				months += 12;
			}
		}

		// Format for display
		let formatted: string;
		if (years === 0) {
			if (months === 0 || months === 1) {
				formatted = `${days} ${days === 1 ? "day" : "days"}`;
			} else if (months < 24) {
				formatted = `${months} ${months === 1 ? "month" : "months"}`;
			} else {
				formatted = `${years} years`;
			}
		} else {
			formatted = `${years} ${years === 1 ? "year" : "years"}, ${months} ${months === 1 ? "month" : "months"}`;
		}

		return {
			days,
			months: years * 12 + months,
			years,
			formatted
		};
	}

	/**
	 * Get age in months (standard for pediatric metrics)
	 */
	inMonths(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		let months = (ref.getFullYear() - dob.getFullYear()) * 12 + (ref.getMonth() - dob.getMonth());

		if (ref.getDate() < dob.getDate()) {
			months--;
		}

		return months;
	}

	/**
	 * Get age in days
	 */
	inDays(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		return Math.floor((ref.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
	}

	/**
	 * Get age in years
	 */
	inYears(dateOfBirth: Date | string, referenceDate: Date = new Date()): number {
		const dob = new Date(dateOfBirth);
		const ref = new Date(referenceDate);

		let years = ref.getFullYear() - dob.getFullYear();

		if (ref.getMonth() < dob.getMonth() || (ref.getMonth() === dob.getMonth() && ref.getDate() < dob.getDate())) {
			years--;
		}

		return years;
	}

	/**
	 * Get age group for pediatric care
	 */
	getAgeGroup(
		dateOfBirth: Date | string,
		referenceDate: Date = new Date()
	): "infant" | "toddler" | "preschool" | "school_age" | "adolescent" {
		const ageMonths = this.inMonths(dateOfBirth, referenceDate);

		if (ageMonths < 12) return "infant";
		if (ageMonths < 36) return "toddler";
		if (ageMonths < 72) return "preschool";
		if (ageMonths < 216) return "school_age";
		return "adolescent";
	}

	/**
	 * Get age range string
	 */
	getAgeRangeString(dateOfBirth: Date | string, referenceDate: Date = new Date()): string {
		const years = this.inYears(dateOfBirth, referenceDate);
		const months = this.inMonths(dateOfBirth, referenceDate) - years * 12;

		if (years === 0) {
			if (months === 0) return "0 months";
			return `${months} month${months === 1 ? "" : "s"}`;
		}
		return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
	}
}

export const ageCalculator = new AgeCalculator();

// Convenience function for backward compatibility
export function calculateAge(dateOfBirth: Date | string, referenceDate: Date = new Date()): AgeResult {
	const birthDate = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
	return ageCalculator.calculate(birthDate, referenceDate);
}
