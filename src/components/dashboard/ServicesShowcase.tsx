// src/components/dashboard/ServicesShowcase.tsx

import { Link } from "@tanstack/react-router";
import { Activity, Baby, Heart, Syringe } from "lucide-react";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Service {
	icon: React.ElementType;
	title: string;
	description: string;
	color: "blue" | "green" | "red" | "purple";
}

const services: Service[] = [
	{
		icon: Baby,
		title: "Well-Child Visits",
		description: "Regular check-ups, growth monitoring, and developmental screenings",
		color: "blue"
	},
	{
		icon: Syringe,
		title: "Vaccinations",
		description: "Complete immunization schedules following WHO guidelines",
		color: "green"
	},
	{
		icon: Heart,
		title: "Emergency Care",
		description: "24/7 urgent care for accidents, fevers, and acute illnesses",
		color: "red"
	},
	{
		icon: Activity,
		title: "Developmental Assessment",
		description: "Tracking milestones and early intervention when needed",
		color: "purple"
	}
];

const colorClasses = {
	blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
	green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
	red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
	purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
} as const;

export const ServicesShowcase = memo(function ServicesShowcase() {
	return (
		<section>
			<div className='mb-6 text-center'>
				<h2 className='font-bold text-2xl'>Our Pediatric Services</h2>
				<p className='mt-2 text-slate-600 dark:text-slate-400'>
					Comprehensive care for every stage of childhood
				</p>
			</div>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{services.map(service => (
					<Link
						key={service.title}
						to='/services'
					>
						<Card className='h-full cursor-pointer text-center transition-all hover:-translate-y-1 hover:shadow-lg'>
							<CardContent className='p-6'>
								<div
									className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[service.color]}`}
								>
									<service.icon className='h-6 w-6' />
								</div>
								<h3 className='mb-2 font-semibold text-lg'>{service.title}</h3>
								<p className='text-slate-600 text-sm dark:text-slate-400'>{service.description}</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</section>
	);
});
