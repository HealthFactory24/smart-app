// src/components/dashboard/FeatureCards.tsx

import { Heart } from "lucide-react";
import { memo } from "react";

interface Feature {
	title: string;
	description: string;
}

const features: Feature[] = [
	{
		title: "Experienced Pediatricians",
		description: "Our team of board-certified pediatricians has years of experience in child healthcare."
	},
	{
		title: "Modern Facilities",
		description: "State-of-the-art equipment and child-friendly environment designed for comfort."
	},
	{
		title: "Digital Health Records",
		description: "Secure access to your child's medical history, growth charts, and immunization records."
	},
	{
		title: "Online Appointment Booking",
		description: "Easy scheduling and reminders for all your child's healthcare needs."
	},
	{
		title: "24/7 Telehealth Support",
		description: "Get expert advice from home for minor concerns and follow-up questions."
	},
	{
		title: "Family-Centered Care",
		description: "We partner with parents to ensure the best outcomes for every child."
	}
];

export const FeatureCards = memo(function FeatureCards() {
	return (
		<section className='rounded-2xl bg-slate-50 p-8 dark:bg-slate-900/50'>
			<div className='mb-8 text-center'>
				<h2 className='font-bold text-2xl'>Why Choose LittleHearts?</h2>
				<p className='mt-2 text-slate-600 dark:text-slate-400'>
					We're dedicated to providing the best possible care for your child
				</p>
			</div>
			<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
				{features.map((feature, index) => (
					<div
						className='flex gap-3'
						key={index}
					>
						<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10'>
							<Heart className='h-4 w-4 text-primary' />
						</div>
						<div>
							<h3 className='font-semibold'>{feature.title}</h3>
							<p className='text-slate-600 text-sm dark:text-slate-400'>{feature.description}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
});
