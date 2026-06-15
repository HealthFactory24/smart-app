// db/repositories/types.ts
export interface NotificationFilters {
	userId: string;
	clinicId?: string;
	status?: "all" | "read" | "unread";
	type?: string | null;
	search?: string;
	limit?: number;
	offset?: number;
}

export interface AdvancedSearchFilters {
	clinicId?: string;
	patientName?: string;
	doctorName?: string;
	dateFrom?: Date;
	dateTo?: Date;
	status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

export interface PaymentFilters {
	clinicId?: string;
	patientId?: string;
	status?: "PAID" | "UNPAID" | "PENDING" | "REFUNDED" | "PARTIAL";
	dateFrom?: Date;
	dateTo?: Date;
}

export interface ConfigFilters {
	keys?: string[];
	prefix?: string;
}

export interface AnalyticsFilters {
	clinicId: string;
	startDate: Date;
	endDate: Date;
}

export interface StaffFilters {
	clinicId: string;
	role?: "admin" | "doctor" | "staff" | "patient";
	department?: string;
	isActive?: boolean;
	searchTerm?: string;
}
