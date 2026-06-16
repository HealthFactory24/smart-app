// src/components/dashboard/DashboardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
	isMedicalStaff: boolean;
}

export function DashboardSkeleton({ isMedicalStaff }: DashboardSkeletonProps) {
	return (
		<div className='space-y-8'>
			{/* Hero Skeleton */}
			<div className='relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12'>
				<div className='animate-pulse space-y-4'>
					<Skeleton className='h-8 w-32 bg-white/20' />
					<Skeleton className='h-12 w-96 bg-white/20' />
					<Skeleton className='h-4 w-64 bg-white/20' />
					<div className='flex gap-4'>
						<Skeleton className='h-10 w-32 bg-white/20' />
						<Skeleton className='h-10 w-32 bg-white/20' />
					</div>
				</div>
			</div>

			{/* Quick Actions Skeleton */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map(i => (
					<Skeleton
						className='h-24 rounded-lg'
						key={i}
					/>
				))}
			</div>

			{/* Clinical Dashboard Skeleton */}
			{isMedicalStaff && (
				<div className='grid gap-6 lg:grid-cols-2'>
					{[1, 2, 3, 4].map(i => (
						<Skeleton
							className='h-64 rounded-lg'
							key={i}
						/>
					))}
				</div>
			)}

			{/* Services Showcase Skeleton */}
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map(i => (
					<Skeleton
						className='h-48 rounded-lg'
						key={i}
					/>
				))}
			</div>
		</div>
	);
}
