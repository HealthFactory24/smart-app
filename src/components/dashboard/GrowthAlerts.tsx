// src/components/dashboard/GrowthAlerts.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { memo, useMemo } from "react";

interface GrowthAlert {
	patientName: string;
	type: "WEIGHT" | "HEIGHT" | "BMI";
	severity: "HIGH" | "MEDIUM";
	message: string;
}

interface GrowthAlertsProps {
	alerts: GrowthAlert[];
}

const severityColors = {
	HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
} as const;

export const GrowthAlerts = memo(function GrowthAlerts({ alerts }: GrowthAlertsProps) {
	const highSeverityAlerts = useMemo(() => alerts.filter(a => a.severity === "HIGH"), [alerts]);

	return (
		<section>
			<Card className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-amber-700 dark:text-amber-400'>
						<AlertCircle className='h-5 w-5' />
						Growth Monitoring Alerts
						{highSeverityAlerts.length > 0 && (
							<span className='ml-2 rounded-full bg-red-500 px-2 py-0.5 text-white text-xs'>
								{highSeverityAlerts.length} critical
							</span>
						)}
					</CardTitle>
					<CardDescription className='text-amber-600 dark:text-amber-400'>
						Children requiring attention for growth concerns
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='max-h-[300px] space-y-2 overflow-y-auto'>
						{alerts.map((alert, index) => (
							<div
								className={`flex items-center justify-between rounded-lg bg-white p-3 transition-all hover:shadow-md dark:bg-slate-900 ${severityColors[alert.severity]}`}
								key={index}
							>
								<div>
									<p className='font-medium'>{alert.patientName}</p>
									<p className='text-sm opacity-90'>{alert.message}</p>
								</div>
								<Link to='/growth'>
									<Button
										size='sm'
										variant='outline'
									>
										Review
									</Button>
								</Link>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</section>
	);
});
