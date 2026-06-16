// src/components/DoctorReviews.tsx

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/formDate";
import { Flag, Star, StarHalf, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface Review {
	id: string;
	patientName: string;
	rating: number;
	comment: string;
	date: Date;
	helpful: number;
}

interface DoctorReviewsProps {
	doctorId: string;
	reviews: Review[];
	averageRating: number;
	totalReviews: number;
}

export function DoctorReviews({ reviews, averageRating, totalReviews }: DoctorReviewsProps) {
	const [expanded, setExpanded] = useState(false);
	const displayedReviews = expanded ? reviews : reviews.slice(0, 3);

	const renderStars = (rating: number) => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

		return (
			<div className='flex items-center gap-0.5'>
				{[...Array(fullStars)].map((_, i) => (
					<Star
						className='h-4 w-4 fill-yellow-400 text-yellow-400'
						key={`full-${i}`}
					/>
				))}
				{hasHalfStar && <StarHalf className='h-4 w-4 fill-yellow-400 text-yellow-400' />}
				{[...Array(emptyStars)].map((_, i) => (
					<Star
						className='h-4 w-4 text-slate-300'
						key={`empty-${i}`}
					/>
				))}
			</div>
		);
	};

	return (
		<div className='space-y-4'>
			{/* Rating Summary */}
			<div className='flex items-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800'>
				<div className='text-center'>
					<p className='font-bold text-3xl'>{averageRating.toFixed(1)}</p>
					{renderStars(averageRating)}
					<p className='mt-1 text-slate-500 text-xs'>{totalReviews} reviews</p>
				</div>
				<div className='flex-1'>
					<div className='space-y-1'>
						{[5, 4, 3, 2, 1].map(star => {
							const count = reviews.filter(r => Math.floor(r.rating) === star).length;
							const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
							return (
								<div
									className='flex items-center gap-2 text-sm'
									key={star}
								>
									<span className='w-6'>{star}★</span>
									<div className='h-2 flex-1 rounded-full bg-slate-200'>
										<div
											className='h-2 rounded-full bg-yellow-400'
											style={{ width: `${percentage}%` }}
										/>
									</div>
									<span className='w-8 text-slate-500 text-xs'>{count}</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Reviews List */}
			<div className='space-y-4'>
				{displayedReviews.map(review => (
					<Card key={review.id}>
						<CardContent className='pt-6'>
							<div className='flex items-start gap-3'>
								<Avatar className='h-10 w-10'>
									<AvatarFallback className='bg-primary/10 text-primary'>
										{review.patientName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className='flex-1'>
									<div className='flex flex-wrap items-center justify-between gap-2'>
										<div>
											<p className='font-medium'>{review.patientName}</p>
											{renderStars(review.rating)}
										</div>
										<p className='text-slate-500 text-xs'>{formatDate(review.date)}</p>
									</div>
									<p className='mt-2 text-slate-600 text-sm dark:text-slate-400'>{review.comment}</p>
									<div className='mt-3 flex items-center gap-3'>
										<Button
											className='h-8 gap-1 px-2 text-xs'
											size='sm'
											variant='ghost'
										>
											<ThumbsUp className='h-3 w-3' />
											Helpful ({review.helpful})
										</Button>
										<Button
											className='h-8 gap-1 px-2 text-xs'
											size='sm'
											variant='ghost'
										>
											<Flag className='h-3 w-3' />
											Report
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{reviews.length > 3 && (
				<Button
					className='w-full'
					onClick={() => setExpanded(!expanded)}
					variant='outline'
				>
					{expanded ? "Show Less" : `See All ${reviews.length} Reviews`}
				</Button>
			)}
		</div>
	);
}
