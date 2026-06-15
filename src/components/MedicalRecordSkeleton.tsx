// components/MedicalRecordSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MedicalRecordSkeleton() {
	return (
		<div className='space-y-4'>
			{[1, 2, 3].map(i => (
				<Card key={i}>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<Skeleton className='h-6 w-48' />
							<Skeleton className='h-5 w-20' />
						</div>
						<Skeleton className='h-4 w-32' />
					</CardHeader>
					<CardContent className='space-y-3'>
						<Skeleton className='h-4 w-full' />
						<Skeleton className='h-4 w-3/4' />
						<div className='flex gap-2'>
							<Skeleton className='h-8 w-20' />
							<Skeleton className='h-8 w-20' />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
