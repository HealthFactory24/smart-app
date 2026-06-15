// src/config/nav-config.ts
// Navigation configuration for the sidebar and Cmd+K bar.
// All URLs must match actual TanStack Router route paths.

import type { Icons } from "../components/icons";
import type { UserRole } from "../lib/auth/permissions";

export interface NavItem {
	title: string;
	url: string;
	icon?: keyof typeof Icons;
	badge?: string | number;
	isActive?: boolean;
	shortcut?: [string, string];
	requiredRole?: UserRole | UserRole[];
	pageType?: string;
	patientId?: string;
	roles?: ("admin" | "doctor" | "staff" | "patient")[];
	children?: NavItem[];
	items?: NavSubItem[];
}

export interface NavSubItem {
	title: string;
	url: string;
	icon?: keyof typeof Icons;
	shortcut?: [string, string];
	isActive?: boolean;
	requiredRole?: UserRole | UserRole[];
	pageType?: string;
	patientId?: string | undefined;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const navGroups: NavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: "dashboard",
				shortcut: ["d", "d"],
				roles: ["admin", "doctor", "staff", "patient"]
			}
		]
	},
	{
		label: "Patient Management",
		items: [
			{
				title: "Patients",
				url: "/dashboard/patients",
				icon: "users",
				shortcut: ["p", "p"],
				pageType: "patients",
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "All Patients",
						url: "/dashboard/patients",
						pageType: "patients"
					},
					{
						title: "New Patient",
						url: "/dashboard/patients/new",
						icon: "add",
						pageType: "patients"
					}
				]
			},
			{
				title: "Appointments",
				url: "/dashboard/appointments",
				icon: "calendar",
				shortcut: ["a", "a"],
				roles: ["admin", "doctor", "staff", "patient"],
				items: [
					{
						title: "Schedule New",
						url: "/dashboard/appointments/new",
						icon: "add"
					},
					{
						title: "Today's Schedule",
						url: "/dashboard/appointments/today",
						icon: "clock"
					}
				]
			},
			{
				title: "Encounters",
				url: "/dashboard/encounters",
				icon: "clipboardList",
				shortcut: ["e", "e"],
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "All Encounters",
						url: "/dashboard/encounters"
					},
					{
						title: "New Encounter",
						url: "/dashboard/encounters/new",
						icon: "add"
					}
				]
			}
		]
	},
	{
		label: "Clinical Care",
		items: [
			{
				title: "Vital Signs",
				url: "/dashboard/vitals",
				icon: "activity",
				shortcut: ["v", "v"],
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "Record Vitals",
						url: "/dashboard/vitals/record",
						icon: "add"
					},
					{
						title: "History",
						url: "/dashboard/vitals/history",
						icon: "clock"
					}
				]
			},
			{
				title: "Growth Tracking",
				url: "/dashboard/growth",
				icon: "charts",
				shortcut: ["g", "g"],
				pageType: "growth",
				roles: ["admin", "doctor", "staff"]
			},
			{
				title: "Immunizations",
				url: "/dashboard/immunizations",
				icon: "syringe",
				badge: "Due: 12",
				pageType: "immunizations",
				shortcut: ["i", "i"],
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "Schedule",
						url: "/dashboard/immunizations/schedule"
					},
					{
						title: "Record Vaccination",
						url: "/dashboard/immunizations/record",
						icon: "add"
					},
					{
						title: "Inventory",
						url: "/dashboard/immunizations/inventory",
						icon: "package",
						requiredRole: ["admin", "staff"]
					}
				]
			},
			{
				title: "Prescriptions",
				url: "/dashboard/prescriptions",
				icon: "prescription",
				shortcut: ["r", "r"],
				roles: ["admin", "doctor", "staff"],
				items: [
					{
						title: "Active Prescriptions",
						url: "/dashboard/prescriptions"
					},
					{
						title: "New Prescription",
						url: "/dashboard/prescriptions/new",
						icon: "add"
					},
					{
						title: "Refill Requests",
						url: "/dashboard/prescriptions/refills",
						icon: "refresh"
					},
					{
						title: "Drug Database",
						url: "/dashboard/prescriptions/drugs",
						icon: "database"
					},
					{
						title: "Dose Calculator",
						url: "/dashboard/prescriptions/dose-calculator",
						icon: "calculator"
					}
				]
			},
			{
				title: "Lab Results",
				url: "/dashboard/lab-results",
				icon: "flask",
				shortcut: ["l", "l"],
				requiredRole: ["admin", "doctor", "staff"],
				items: [
					{
						title: "Pending Results",
						url: "/dashboard/lab-results/pending",
						icon: "clock"
					},
					{
						title: "All Results",
						url: "/dashboard/lab-results"
					},
					{
						title: "Trends",
						url: "/dashboard/lab-results/trends",
						icon: "trendingUp"
					}
				]
			},
			{
				title: "Neonatal Care",
				url: "/dashboard/neonatal",
				icon: "baby",
				pageType: "neonatal",
				roles: ["admin", "doctor", "staff"]
			}
		]
	},
	{
		label: "Medical Records",
		items: [
			{
				title: "Medical Records",
				url: "/dashboard/records",
				icon: "fileText",
				shortcut: ["m", "m"],
				roles: ["admin", "doctor", "staff", "patient"]
			},
			{
				title: "Documents",
				url: "/dashboard/documents",
				icon: "folder",
				shortcut: ["c", "c"],
				roles: ["admin", "doctor", "staff"]
			}
		]
	},
	{
		label: "Operations",
		items: [
			{
				title: "Billing",
				url: "/dashboard/billing",
				icon: "creditCard",
				shortcut: ["b", "b"],
				roles: ["admin", "staff"],
				items: [
					{
						title: "Payments",
						url: "/dashboard/billing/payments"
					},
					{
						title: "Invoices",
						url: "/dashboard/billing/invoices"
					}
				]
			},
			{
				title: "Staff",
				url: "/dashboard/staff",
				icon: "briefcase",
				shortcut: ["f", "f"],
				requiredRole: ["admin"],
				items: [
					{
						title: "Doctors",
						url: "/dashboard/staff/doctors"
					},
					{
						title: "Nurses",
						url: "/dashboard/staff/nurses"
					},
					{
						title: "Schedule",
						url: "/dashboard/staff/schedule",
						icon: "calendar"
					}
				]
			},
			{
				title: "Reports",
				url: "/dashboard/reports",
				icon: "fileText",
				requiredRole: ["admin", "doctor"],
				items: [
					{
						title: "Clinical Reports",
						url: "/dashboard/reports/clinical"
					},
					{
						title: "Financial Reports",
						url: "/dashboard/reports/financial",
						requiredRole: ["admin"]
					},
					{
						title: "Immunization Coverage",
						url: "/dashboard/reports/immunizations"
					},
					{
						title: "Growth Analytics",
						url: "/dashboard/reports/growth"
					}
				]
			}
		]
	},
	{
		label: "Communication",
		items: [
			{
				title: "Notifications",
				url: "/dashboard/notification",
				icon: "bell",
				shortcut: ["n", "n"],
				badge: "unread",
				roles: ["admin", "doctor", "staff", "patient"]
			},
			{
				title: "Messages",
				url: "/dashboard/messages",
				icon: "chat",
				shortcut: ["m", "m"],
				roles: ["admin", "doctor", "staff"]
			}
		]
	},
	{
		label: "Resources",
		items: [
			{
				title: "Clinical Guidelines",
				url: "/dashboard/resources/guidelines",
				icon: "bookOpen",
				pageType: "resources"
			},
			{
				title: "Patient Education",
				url: "/dashboard/resources/patient-education",
				icon: "fileText",
				pageType: "resources"
			},
			{
				title: "WHO Growth Standards",
				url: "https://www.who.int/tools/child-growth-standards",
				icon: "globe"
			}
		]
	},
	{
		label: "Administration",
		items: [
			{
				title: "Users",
				url: "/dashboard/admin/users",
				icon: "account",
				shortcut: ["u", "u"],
				requiredRole: ["admin"]
			},
			{
				title: "Clinics",
				url: "/dashboard/admin/clinics",
				icon: "building",
				requiredRole: ["admin"]
			},
			{
				title: "Audit Log",
				url: "/dashboard/admin/audit",
				icon: "shield",
				requiredRole: ["admin"]
			},
			{
				title: "System",
				url: "/dashboard/admin/system",
				icon: "settings",
				requiredRole: ["admin"]
			},
			{
				title: "Profile",
				url: "/dashboard/profile",
				icon: "user",
				shortcut: ["u", "p"],
				roles: ["admin", "doctor", "staff", "patient"]
			},
			{
				title: "Settings",
				url: "/dashboard/settings",
				icon: "settings",
				shortcut: ["s", "s"],
				roles: ["admin", "doctor", "staff"]
			}
		]
	}
];

export const bottomNavItems: NavItem[] = [
	{
		title: "Support",
		url: "/support",
		icon: "help",
		roles: ["admin", "doctor", "staff", "patient"]
	},
	{
		title: "Privacy",
		url: "/privacy",
		icon: "shield",
		roles: ["admin", "doctor", "staff", "patient"]
	},
	{
		title: "Terms",
		url: "/terms",
		icon: "fileText",
		roles: ["admin", "doctor", "staff", "patient"]
	},
	{
		title: "Accessibility",
		url: "/accessibility",
		icon: "accessibility",
		roles: ["admin", "doctor", "staff", "patient"]
	},
	{
		title: "About",
		url: "/about",
		icon: "info",
		roles: ["admin", "doctor", "staff", "patient"]
	}
];

// Helper function to get role display name
export const getRoleDisplay = (role: string): string => {
	const roleMap: Record<string, string> = {
		admin: "Admin",
		doctor: "Doctor",
		staff: "Staff",
		patient: "Patient"
	};
	return roleMap[role] || role;
};

// Helper function to get role color
export const getRoleColor = (role: string): string => {
	const colorMap: Record<string, string> = {
		admin: "text-red-600 dark:text-red-400",
		doctor: "text-blue-600 dark:text-blue-400",
		staff: "text-green-600 dark:text-green-400",
		patient: "text-yellow-600 dark:text-yellow-400"
	};
	return colorMap[role] || "text-gray-600";
};
