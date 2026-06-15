// src/routes/appointments/$id.tsx
import { createFileRoute, Link, redirect, notFound } from "@tanstack/react-router";
import { Calendar, Clock, Stethoscope, User, FileText, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAppointmentById } from "@/data/appointments";
import { formatDate, formatTime } from "@/utils/formDate";
import type { AppointmentStatus } from '../../db/schema';

export const Route = createFileRoute("/appointments/$id")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (!session) throw redirect({ to: "/sign-in" });
    return { user: session.user };
  },
  loader: async ({ params }) => {
    const appointment = await getAppointmentById({ data: params.id });
    if (!appointment) throw notFound();
    return { appointment };
  },
  component: AppointmentDetailPage,
});

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

function AppointmentDetailPage() {
  const { appointment } = Route.useLoaderData();
  const isUpcoming = new Date(appointment.appointmentDate) >= new Date() && appointment.status !== "CANCELLED";
  const isCancellable = isUpcoming && appointment.status === "CONFIRMED";

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-2xl">Appointment Details</h1>
              <Badge className={statusColors[appointment.status as AppointmentStatus]}>
                {appointment.status}
              </Badge>
            </div>
            <p className="text-slate-600 text-sm dark:text-slate-400">
              Scheduled on {formatDate(appointment.appointmentDate)} at{" "}
              {appointment.time || formatTime(appointment.appointmentDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/appointments">
              <Button variant="outline">Back to Appointments</Button>
            </Link>
            {isCancellable && (
              <Link to="/appointments/$id/cancel" params={{ id: appointment.id }}>
                <Button variant="destructive">Cancel Appointment</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-slate-500 text-xs">Full Name</p>
                <p className="font-medium">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Date of Birth</p>
                <p className="font-medium">{formatDate(appointment.patient.dateOfBirth)}</p>
              </div>
              {appointment.patient.gender && (
                <div>
                  <p className="text-slate-500 text-xs">Gender</p>
                  <p className="font-medium capitalize">{appointment.patient.gender.toLowerCase()}</p>
                </div>
              )}
              {appointment.patient.mrn && (
                <div>
                  <p className="text-slate-500 text-xs">Medical Record Number</p>
                  <p className="font-medium font-mono text-sm">{appointment.patient.mrn}</p>
                </div>
              )}
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              {appointment.patient.phone && (
                <div>
                  <p className="text-slate-500 text-xs">Phone</p>
                  <p className="flex items-center gap-1 text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    {appointment.patient.phone}
                  </p>
                </div>
              )}
              {appointment.patient.email && (
                <div>
                  <p className="text-slate-500 text-xs">Email</p>
                  <p className="flex items-center gap-1 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {appointment.patient.email}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-slate-500 text-xs">Doctor Name</p>
                <p className="font-medium">Dr. {appointment.doctor.name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Specialty</p>
                <p className="font-medium">{appointment.doctor.specialty}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Date</p>
                  <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Time</p>
                  <p className="font-medium">{appointment.time || formatTime(appointment.appointmentDate)}</p>
                </div>
              </div>
            </div>

            {appointment.type && (
              <div>
                <p className="text-slate-500 text-xs">Appointment Type</p>
                <p className="font-medium capitalize">{appointment.type.toLowerCase()}</p>
              </div>
            )}

            {appointment.reason && (
              <div>
                <p className="text-slate-500 text-xs">Reason for Visit</p>
                <p className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
                  {appointment.reason}
                </p>
              </div>
            )}

            {appointment.note && (
              <div>
                <p className="text-slate-500 text-xs">Additional Notes</p>
                <p className="text-sm">{appointment.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
              <AlertCircle className="h-4 w-4" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 text-sm dark:text-blue-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Please arrive 15 minutes before your scheduled appointment time</li>
              <li>Bring your insurance card and photo ID</li>
              <li>Bring any relevant medical records or previous test results</li>
              <li>Cancellations require at least 24 hours notice</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
