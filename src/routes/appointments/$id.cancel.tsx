// src/routes/appointments/$id.cancel.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cancelAppointment, getAppointmentById } from "@/data/appointments";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/appointments/$id/cancel")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user };
	},
	loader: async ({ params }) => {
		const appointment = await getAppointmentById({ data: params.id });
		if (!appointment) throw redirect({ to: "/appointments" });
		return { appointment };
	},
	component: CancelAppointmentPage
});

function CancelAppointmentPage() {
	const navigate = useNavigate();
	const { appointment } = Route.useLoaderData();
	const [reason, setReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const appointmentDate = new Date(appointment.appointmentDate);
	const isUpcoming = appointmentDate >= new Date();

	if (!isUpcoming || appointment.status === "CANCELLED") {
		return (
			<div className='mx-auto max-w-lg py-20 text-center'>
				<AlertCircle className='mx-auto h-12 w-12 text-slate-400' />
				<h1 className='mt-4 font-semibold text-xl'>Cannot Cancel Appointment</h1>
				<p className='mt-2 text-slate-600 dark:text-slate-400'>
					This appointment cannot be cancelled because it has already passed or is already cancelled.
				</p>
				<Button
					className='mt-6'
					onClick={() => navigate({ to: "/appointments" })}
				>
					Back to Appointments
				</Button>
			</div>
		);
	}

	const handleCancel = async () => {
		setIsSubmitting(true);
		try {
			await cancelAppointment({
				data: { appointmentId: appointment.id, reason }
			});
			toast.success("Appointment cancelled successfully");
			navigate({ to: "/appointments" });
		} catch (error) {
			toast.error("Failed to cancel appointment");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='mx-auto max-w-lg py-8'>
			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Cancel Appointment</CardTitle>
					<CardDescription>
						Are you sure you want to cancel your appointment with Dr. {appointment.doctor.name}?
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='rounded-lg bg-slate-50 p-4 dark:bg-slate-800'>
						<h3 className='font-medium'>Appointment Details</h3>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							{new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric"
							})}
							{" at "}
							{appointment.time}
						</p>
						<p className='text-slate-600 text-sm dark:text-slate-400'>
							Dr. {appointment.doctor.name} - {appointment.doctor.specialty}
						</p>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='reason'>Reason for cancellation (Optional)</Label>
						<Textarea
							id='reason'
							onChange={e => setReason(e.target.value)}
							placeholder="Please let us know why you're cancelling..."
							rows={4}
							value={reason}
						/>
					</div>

					<div className='flex gap-3'>
						<Button
							onClick={() => navigate({ to: `/appointments/${appointment.id}` })}
							variant='outline'
						>
							Go Back
						</Button>
						<Button
							disabled={isSubmitting}
							onClick={handleCancel}
							variant='destructive'
						>
							{isSubmitting ? "Cancelling..." : "Yes, Cancel Appointment"}
						</Button>
					</div>

					<p className='text-center text-slate-500 text-xs'>
						Cancellations made less than 24 hours before the appointment may incur a fee.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
