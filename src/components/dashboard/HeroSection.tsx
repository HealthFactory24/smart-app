// src/components/dashboard/HeroSection.tsx

import { Link } from "@tanstack/react-router";
import { Calendar, Stethoscope, UserPlus } from "lucide-react";
import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
	isLoggedIn: boolean;
}

export const HeroSection = memo(function HeroSection({ isLoggedIn }: HeroSectionProps) {
	return (
		<section className='relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-white shadow-xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
			<div className='absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl' />
			<div className='absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl' />

			<div className='relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
				<div className='space-y-4'>
					<div className='flex items-center gap-2'>
						<div className='rounded-full bg-white/20 p-2'>
							<Stethoscope className='h-6 w-6' />
						</div>
						<span className='text-sm text-white/80'>LittleHearts Pediatric Clinic</span>
					</div>
					<h1 className='font-bold text-4xl leading-tight lg:text-5xl'>
						Compassionate Care for
						<br />
						<span className='text-primary-foreground'>Every Child</span>
					</h1>
					<p className='max-w-xl text-lg text-slate-300'>
						Providing comprehensive pediatric care from birth to adolescence. Expert doctors, modern
						facilities, and a caring environment for your child's health.
					</p>
					<div className='flex flex-wrap gap-3 pt-2'>
						{isLoggedIn ? (
							<Link to='/appointments/book'>
								<Button
									className='bg-white text-slate-900 hover:bg-slate-100'
									size='lg'
								>
									<Calendar className='mr-2 h-5 w-5' />
									Book Appointment
								</Button>
							</Link>
						) : (
							<Link to='/sign-up'>
								<Button
									className='bg-white text-slate-900 hover:bg-slate-100'
									size='lg'
								>
									<UserPlus className='mr-2 h-5 w-5' />
									Register Your Child
								</Button>
							</Link>
						)}
						<Link to='/services'>
							<Button
								className='border-white text-white hover:bg-white/20'
								size='lg'
								variant='outline'
							>
								Our Services
							</Button>
						</Link>
					</div>
				</div>

				<StatsCards />
			</div>
		</section>
	);
});

// Separate StatsCards component for better memoization
const StatsCards = memo(function StatsCards() {
	const stats = useMemo(
		() => [
			{ icon: "👶", value: "5000+", label: "Happy Children" },
			{ icon: "👨‍⚕️", value: "15+", label: "Specialists" },
			{ icon: "🕐", value: "24/7", label: "Emergency Care" },
			{ icon: "📈", value: "98%", label: "Satisfaction Rate" }
		],
		[]
	);

	return (
		<div className='grid grid-cols-2 gap-3'>
			{stats.map((stat, idx) => (
				<div
					className='rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm'
					key={idx}
				>
					<div className='text-2xl'>{stat.icon}</div>
					<p className='mt-2 font-bold text-2xl'>{stat.value}</p>
					<p className='text-slate-300 text-xs'>{stat.label}</p>
				</div>
			))}
		</div>
	);
});
