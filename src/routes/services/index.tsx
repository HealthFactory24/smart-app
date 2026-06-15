// src/routes/services/index.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllServices } from "@/data/services";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Clock, DollarSign, Stethoscope } from "lucide-react";
import { Suspense } from "react";
import type { DbService } from '@/db/schema';

export const Route = createFileRoute("/services/")({
	loader: async () => {
		return getAllServices();
	},
	component: ServicesPage
});

function ServicesPage() {
	const services = Route.useLoaderData();

	return (
		<div className='space-y-8'>
			{/* Hero Section */}
			<section className='rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 px-6 py-12 text-white shadow-xl dark:from-slate-950 dark:to-slate-900'>
				<div className='mx-auto max-w-3xl text-center'>
					<div className='mb-4 flex justify-center'>
						<div className='rounded-full bg-white/20 p-3'>
							<Stethoscope className='h-8 w-8' />
						</div>
					</div>
					<h1 className='mb-4 font-bold text-4xl'>Our Pediatric Services</h1>
					<p className='text-lg text-slate-300'>
						Comprehensive healthcare services for children from birth to adolescence. All our services are
						delivered by experienced pediatric specialists.
					</p>
				</div>
			</section>

			{/* Services Grid */}
			<section className='mx-auto max-w-6xl'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<h2 className='font-semibold text-2xl'>Available Services</h2>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							Browse our full range of pediatric services
						</p>
					</div>
				</div>

				<Suspense fallback={<ServicesGridSkeleton />}>
					<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3' data-slot="card-group">
						{Array.isArray(services) && (services as unknown as DbService[]).map((service: DbService) => (
							<ServiceCard
								key={service.id}
								service={service}
							/>
						))}
					</div>
				</Suspense>
			</section>
		</div>
	);
}

function ServiceCard({ service }: { service: DbService }) {
	const isAvailable = service.isAvailable;

	return (
		<Card className='group flex h-full flex-col transition-all hover:-translate-y-1 hover:shadow-lg'>
			<CardHeader>
				<div className='mb-2 flex items-center justify-between'>
					<div className='flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
						{service.icon ? (
							<span className='text-2xl'>{service.icon}</span>
						) : (
							<Stethoscope className='h-5 w-5' />
						)}
					</div>
					{isAvailable ? (
						<span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-medium text-[10px] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
							<CheckCircle className='h-3 w-3' />
							Available
						</span>
					) : (
						<span className='inline-flex rounded-full bg-slate-100 px-2 py-1 font-medium text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400'>
							Coming Soon
						</span>
					)}
				</div>
				<CardTitle className='text-xl'>{service.serviceName}</CardTitle>
				<CardDescription className='line-clamp-2'>{service.description}</CardDescription>
			</CardHeader>

			<CardContent className='flex-1 space-y-2'>
				<div className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
					<Clock className='h-4 w-4' />
					<span>~{service.duration} minutes</span>
				</div>
				<div className='flex items-center gap-2 font-semibold text-lg text-slate-900 dark:text-white'>
					<DollarSign className='h-4 w-4' />
					<span>${service.price}</span>
				</div>
			</CardContent>

			<CardFooter className='pt-4'>
				<Link
					className='w-full'
					params={{ id: service.id }}
					to='/services/$id'
				>
					<Button
						className='w-full'
						disabled={!isAvailable}
						variant={isAvailable ? "default" : "outline"}
					>
						{isAvailable ? "Book Appointment" : "Notify Me"}
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}

function ServicesGridSkeleton() {
	return (
		<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={i}>
					<CardHeader>
						<div className='mb-2 flex items-center justify-between'>
							<Skeleton className='h-12 w-12 rounded-xl' />
							<Skeleton className='h-5 w-16 rounded-full' />
						</div>
						<Skeleton className='h-6 w-3/4' />
						<Skeleton className='h-4 w-full' />
						<Skeleton className='h-4 w-2/3' />
					</CardHeader>
					<CardContent className='space-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-6 w-16' />
					</CardContent>
					<CardFooter>
						<Skeleton className='h-10 w-full rounded-md' />
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
