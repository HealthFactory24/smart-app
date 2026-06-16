// src/routes/index.tsx
// Optimized Dashboard Page with Lazy Loading and Error Boundaries

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load heavy components (named exports mapped to default for React.lazy)
const QuickActions = lazy(() => import("@/components/dashboard/QuickActions").then(m => ({ default: m.QuickActions })));
const ClinicalDashboard = lazy(() =>
	import("@/components/dashboard/ClinicalDashboard").then(m => ({ default: m.ClinicalDashboard }))
);
const GrowthAlerts = lazy(() => import("@/components/dashboard/GrowthAlerts").then(m => ({ default: m.GrowthAlerts })));
const ServicesShowcase = lazy(() =>
	import("@/components/dashboard/ServicesShowcase").then(m => ({ default: m.ServicesShowcase }))
);
const HeroSection = lazy(() => import("@/components/dashboard/HeroSection").then(m => ({ default: m.HeroSection })));

// Loading skeletons - import these from actual files
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

// Data imports
import { getDashboardUpcomingAppointments, getUpcomingAppointmentsCount } from "@/data/appointments";
import { getRecentEncounters } from "@/data/diagnosis";
import { getClinicGrowthAlerts } from "@/data/growthRecord";
import { getDueImmunizations } from "@/data/immunization";
import { getRecentPatients } from "@/data/patients";

// Query keys for caching
const dashboardQueryKeys = {
	upcomingCount: ["dashboard", "upcoming-count"],
	upcomingAppointments: ["dashboard", "upcoming-appointments"],
	recentEncounters: ["dashboard", "recent-encounters"],
	dueImmunizations: ["dashboard", "due-immunizations"],
	recentPatients: ["dashboard", "recent-patients"],
	growthAlerts: ["dashboard", "growth-alerts"]
} as const;

// Stale times for different data types
const STALE_TIMES = {
	counts: 5 * 60 * 1000, // 5 minutes
	appointments: 60 * 1000, // 1 minute
	critical: 30 * 1000, // 30 seconds
	stats: 15 * 60 * 1000 // 15 minutes
};

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		return { session };
	},
	component: DashboardPage
});

// Optimized Dashboard Page Component
function DashboardPage() {
	const { session } = Route.useRouteContext();
	const userRole = session?.user?.role;
	const isLoggedIn = !!session;
	const isMedicalStaff = userRole === "admin" || userRole === "doctor" || userRole === "staff";

	// Use React Query for efficient data fetching with proper caching
	const upcomingCountQuery = useQuery({
		queryKey: dashboardQueryKeys.upcomingCount,
		queryFn: () => getUpcomingAppointmentsCount(),
		enabled: isLoggedIn,
		staleTime: STALE_TIMES.counts,
		placeholderData: keepPreviousData,
		retry: 1
	});

	const upcomingAppointmentsQuery = useQuery({
		queryKey: dashboardQueryKeys.upcomingAppointments,
		queryFn: () => getDashboardUpcomingAppointments(),
		enabled: isMedicalStaff,
		staleTime: STALE_TIMES.appointments,
		placeholderData: keepPreviousData
	});

	const recentEncountersQuery = useQuery({
		queryKey: dashboardQueryKeys.recentEncounters,
		queryFn: () => getRecentEncounters(),
		enabled: isMedicalStaff,
		staleTime: STALE_TIMES.appointments,
		placeholderData: keepPreviousData
	});

	const dueImmunizationsQuery = useQuery({
		queryKey: dashboardQueryKeys.dueImmunizations,
		queryFn: () => getDueImmunizations(),
		enabled: isMedicalStaff,
		staleTime: STALE_TIMES.critical,
		placeholderData: keepPreviousData
	});

	const recentPatientsQuery = useQuery({
		queryKey: dashboardQueryKeys.recentPatients,
		queryFn: () => getRecentPatients(),
		enabled: isMedicalStaff,
		staleTime: STALE_TIMES.stats,
		placeholderData: keepPreviousData
	});

	const growthAlertsQuery = useQuery({
		queryKey: dashboardQueryKeys.growthAlerts,
		queryFn: () => getClinicGrowthAlerts(),
		enabled: isMedicalStaff,
		staleTime: STALE_TIMES.critical,
		placeholderData: keepPreviousData
	});

	// Determine loading state
	const isLoading = useMemo(() => {
		if (isLoggedIn && upcomingCountQuery.isPending) return true;
		if (isMedicalStaff) {
			return (
				upcomingAppointmentsQuery.isPending ||
				recentEncountersQuery.isPending ||
				dueImmunizationsQuery.isPending ||
				recentPatientsQuery.isPending ||
				growthAlertsQuery.isPending
			);
		}
		return false;
	}, [
		isLoggedIn,
		isMedicalStaff,
		upcomingCountQuery.isPending,
		upcomingAppointmentsQuery.isPending,
		recentEncountersQuery.isPending,
		dueImmunizationsQuery.isPending,
		recentPatientsQuery.isPending,
		growthAlertsQuery.isPending
	]);

	if (isLoading) {
		return <DashboardSkeleton isMedicalStaff={isMedicalStaff} />;
	}

	return (
		<div className='space-y-8'>
			{/* Hero Section */}
			<ErrorBoundary fallback={<HeroErrorFallback />}>
				<Suspense fallback={<HeroSectionSkeleton />}>
					<HeroSection isLoggedIn={isLoggedIn} />
				</Suspense>
			</ErrorBoundary>

			{/* Quick Actions - Only for logged in users */}
			{isLoggedIn && (
				<ErrorBoundary fallback={<QuickActionsErrorFallback />}>
					<Suspense fallback={<QuickActionsSkeleton />}>
						<QuickActions upcomingCount={upcomingCountQuery.data ?? 0} />
					</Suspense>
				</ErrorBoundary>
			)}

			{/* Clinical Dashboard - Only for medical staff */}
			{isMedicalStaff && (
				<ErrorBoundary fallback={<ClinicalDashboardErrorFallback />}>
					<Suspense fallback={<ClinicalDashboardSkeleton />}>
						<ClinicalDashboard
							dueImmunizations={dueImmunizationsQuery.data ?? []}
							recentEncounters={recentEncountersQuery.data ?? []}
							recentPatients={recentPatientsQuery.data ?? []}
							upcomingAppointments={upcomingAppointmentsQuery.data ?? []}
						/>
					</Suspense>
				</ErrorBoundary>
			)}

			{/* Growth Alerts - Only show if there are alerts */}
			{isMedicalStaff && growthAlertsQuery.data && growthAlertsQuery.data.length > 0 && (
				<ErrorBoundary fallback={<GrowthAlertsErrorFallback />}>
					<Suspense fallback={<GrowthAlertsSkeleton />}>
						<GrowthAlerts alerts={growthAlertsQuery.data} />
					</Suspense>
				</ErrorBoundary>
			)}

			{/* Services Showcase - Always show */}
			<ErrorBoundary fallback={<ServicesErrorFallback />}>
				<Suspense fallback={<ServicesShowcaseSkeleton />}>
					<ServicesShowcase />
				</Suspense>
			</ErrorBoundary>

			{/* Prefetch adjacent routes for faster navigation */}
			<PrefetchLinks />
		</div>
	);
}

// Prefetch component for performance
function PrefetchLinks() {
	return (
		<div className='hidden'>
			<Link
				preload='intent'
				to='/appointments'
			/>
			<Link
				preload='intent'
				to='/patients'
			/>
			<Link
				preload='intent'
				to='/services'
			/>
			<Link
				preload='intent'
				to='/encounters'
			/>
			<Link
				preload='intent'
				to='/medical-records'
			/>
		</div>
	);
}

// ==================== ERROR FALLBACKS ====================

function HeroErrorFallback() {
	return (
		<div className='rounded-2xl bg-red-50 p-8 text-center dark:bg-red-950/20'>
			<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
				<svg
					className='h-6 w-6 text-red-600'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<title>Error Icon</title>
					<path
						d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
					/>
				</svg>
			</div>
			<h3 className='mt-3 font-semibold text-red-800 dark:text-red-300'>Unable to load hero section</h3>
			<p className='mt-1 text-red-600 text-sm dark:text-red-400'>Please refresh the page to try again.</p>
		</div>
	);
}

function QuickActionsErrorFallback() {
	return (
		<div className='rounded-lg bg-yellow-50 p-6 text-center dark:bg-yellow-950/20'>
			<p className='text-sm text-yellow-600 dark:text-yellow-400'>
				Unable to load quick actions. Some features may be unavailable.
			</p>
		</div>
	);
}

function ClinicalDashboardErrorFallback() {
	return (
		<div className='rounded-lg bg-red-50 p-6 text-center dark:bg-red-950/20'>
			<p className='text-red-600 text-sm dark:text-red-400'>
				Unable to load clinical dashboard data. Please refresh.
			</p>
		</div>
	);
}

function GrowthAlertsErrorFallback() {
	return null; // Silently fail for growth alerts
}

function ServicesErrorFallback() {
	return (
		<div className='rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-950/20'>
			<p className='text-gray-600 text-sm dark:text-gray-400'>Unable to load services. Please try again later.</p>
		</div>
	);
}

// ==================== SKELETONS ====================

function HeroSectionSkeleton() {
	return (
		<div className='relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12 shadow-xl'>
			<div className='animate-pulse space-y-4'>
				<div className='h-8 w-32 rounded bg-white/20' />
				<div className='h-12 w-96 rounded bg-white/20' />
				<div className='h-4 w-64 rounded bg-white/20' />
				<div className='flex gap-4'>
					<div className='h-10 w-32 rounded bg-white/20' />
					<div className='h-10 w-32 rounded bg-white/20' />
				</div>
			</div>
		</div>
	);
}

function QuickActionsSkeleton() {
	return (
		<div className='space-y-4'>
			<div className='mb-4 h-7 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map(i => (
					<div
						className='h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800'
						key={i}
					/>
				))}
			</div>
		</div>
	);
}

function ClinicalDashboardSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='h-7 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
				<div className='h-9 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
			</div>
			<div className='grid gap-6 lg:grid-cols-2'>
				{[1, 2, 3, 4].map(i => (
					<div
						className='h-80 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800'
						key={i}
					/>
				))}
			</div>
		</div>
	);
}

function GrowthAlertsSkeleton() {
	return <div className='h-40 animate-pulse rounded-lg bg-amber-50 dark:bg-amber-950/20' />;
}

function ServicesShowcaseSkeleton() {
	return (
		<div className='space-y-6'>
			<div className='space-y-2 text-center'>
				<div className='mx-auto h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
				<div className='mx-auto h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
			</div>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map(i => (
					<div
						className='h-56 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800'
						key={i}
					/>
				))}
			</div>
		</div>
	);
}
