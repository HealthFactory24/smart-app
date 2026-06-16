// src/components/dashboard/QuickActions.tsx

import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Stethoscope, Users } from "lucide-react";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionsProps {
	upcomingCount: number;
}

interface Action {
	to: string;
	icon: React.ElementType;
	label: string;
	description: string;
	badge?: number;
	color: "blue" | "green" | "purple" | "amber";
}

const colorClasses = {
	blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
	green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
	purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
	amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
} as const;

export const QuickActions = memo(function QuickActions({ upcomingCount }: QuickActionsProps) {
	const actions: Action[] = useMemo(
		() => [
			{
				to: "/appointments/book",
				icon: Calendar,
				label: "Book Appointment",
				description: "Schedule a visit",
				color: "blue"
			},
			{
				to: "/appointments",
				icon: Clock,
				label: "My Appointments",
				description: "View history",
				badge: upcomingCount > 0 ? upcomingCount : undefined,
				color: "green"
			},
			{
				to: "/patients",
				icon: Users,
				label: "My Children",
				description: "View profiles",
				color: "purple"
			},
			{
				to: "/services",
				icon: Stethoscope,
				label: "Our Services",
				description: "What we offer",
				color: "amber"
			}
		],
		[upcomingCount]
	);

	return (
		<section>
			<h2 className='mb-4 font-semibold text-xl'>Quick Actions</h2>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{actions.map(action => (
					<Link
						key={action.to}
						to={action.to}
					>
						<Card className='cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg'>
							<CardContent className='flex items-center gap-4 p-4'>
								<div className={`rounded-lg p-3 ${colorClasses[action.color]}`}>
									<action.icon className='h-6 w-6' />
								</div>
								<div className='flex-1'>
									<p className='font-semibold'>{action.label}</p>
									<p className='text-slate-500 text-xs'>{action.description}</p>
								</div>
								{action.badge && <Badge className='ml-auto bg-green-500'>{action.badge}</Badge>}
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</section>
	);
});
