import { db } from "@/db";

export async function getTimeLeftForAppointment(appointmentId: string): Promise<string> {
	const record = await db.query.appointment.findFirst({
		with: {
			patient: true,
			doctor: true,
			clinic: true,
			service: true
		},
		where: { id: appointmentId }
	});

	if (!record?.appointmentDate) {
		return "Appointment not found or date missing";
	}

	const now = new Date();
	const appointmentTime = new Date(record.appointmentDate);

	const diffMs = appointmentTime.getTime() - now.getTime();
	if (diffMs < 0) return "Appointment has already passed";

	const diffMins = Math.floor(diffMs / (1000 * 60));
	const hours = Math.floor(diffMins / 60);
	const mins = diffMins % 60;

	if (hours > 0) {
		return `${hours} hours and ${mins} minutes remaining`;
	}
	return `${mins} minutes remaining`;
}
