// src/routes/patients/$id.tsx
import { createFileRoute, Link, redirect, notFound } from "@tanstack/react-router";
import {
  User, Calendar, Phone, Mail, MapPin, Droplet, AlertCircle,
  Stethoscope, Clock, FileText, Edit, ArrowLeft, Heart, Shield,
  Activity, Syringe, Pill, ClipboardList
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getPatientById } from "@/data/patients";
import { getPatientAppointments } from "@/data/appointments";
import { getPatientMedicalRecords } from "@/data/medical-records";
import { getPatientEncounters } from "@/data/diagnosis";
import { formatDate, getInitials } from "@/utils/formDate";
import { calculateAge } from "@/utils/growth";

export const Route = createFileRoute("/patients/$id")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (!session) throw redirect({ to: "/sign-in" });
    return { user: session.user };
  },
  loader: async ({ params }) => {
    const patient = await getPatientById({ data: params.id });
    if (!patient) throw notFound();
    return { patient };
  },
  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { patient } = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff" || user?.role === "doctor";
  const canEdit = isAdmin || isStaff;

  const bloodGroupLabels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            to="/patients"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>
          {canEdit && (
            <Link params={{ id: patient.id }} to="/patients/$id/edit">
              <Button size="sm" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Patient
              </Button>
            </Link>
          )}
        </div>

        {/* Patient Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex justify-center sm:justify-start">
                <Avatar className="h-24 w-24 border-4 border-slate-100 dark:border-slate-800">
                  <AvatarImage src={patient.image || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(patient.firstName, patient.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Patient Info */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="font-bold text-2xl">
                      {patient.firstName} {patient.lastName}
                    </h1>
                    <Badge variant="outline" className="text-xs">
                      MRN: {patient.mrn || "—"}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Patient since {formatDate(patient.createdAt)}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Date of Birth</p>
                      <p className="text-sm font-medium">
                        {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth, "string")})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Gender</p>
                      <p className="text-sm font-medium capitalize">
                        {patient.gender?.toLowerCase() || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Blood Group</p>
                      <p className="text-sm font-medium">
                        {patient.bloodGroup ? bloodGroupLabels[patient.bloodGroup] : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Status</p>
                      <Badge
                        className={`mt-1 ${
                          patient.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {patient.status || "ACTIVE"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Contact Information */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-sm">Contact Information</h3>
                <div className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-sm">Emergency Contact</h3>
                <div className="space-y-2">
                  {patient.emergencyContactName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{patient.emergencyContactName}</span>
                    </div>
                  )}
                  {patient.emergencyContactNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{patient.emergencyContactNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information Section */}
        {(patient.allergies || patient.medicalConditions || patient.medicalHistory) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.allergies && (
                <div>
                  <p className="text-slate-500 text-xs">Allergies</p>
                  <p className="text-sm">{patient.allergies}</p>
                </div>
              )}
              {patient.medicalConditions && (
                <div>
                  <p className="text-slate-500 text-xs">Medical Conditions</p>
                  <p className="text-sm">{patient.medicalConditions}</p>
                </div>
              )}
              {patient.medicalHistory && (
                <div>
                  <p className="text-slate-500 text-xs">Medical History</p>
                  <p className="text-sm">{patient.medicalHistory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs for Appointments, Records, etc. */}
        <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="encounters">Encounters</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Calendar}
                label="Total Appointments"
                value="—"
                color="blue"
              />
              <StatCard
                icon={Stethoscope}
                label="Total Encounters"
                value="—"
                color="green"
              />
              <StatCard
                icon={Syringe}
                label="Immunizations"
                value="—"
                color="purple"
              />
              <StatCard
                icon={Activity}
                label="Growth Records"
                value="—"
                color="orange"
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest appointments and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="py-8 text-center text-slate-500 text-sm">
                  No recent activity to display.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <PatientAppointmentsTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="encounters" className="mt-6">
            <PatientEncountersTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <PatientRecordsTab patientId={patient.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: 'blue' | 'green' | 'purple' | 'orange' }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-slate-500 text-xs">{label}</p>
          <p className="font-bold text-xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientAppointmentsTab({ patientId }: { patientId: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getPatientAppointments({ data: { patientId } });
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [patientId]);

  if (loading) {
    return <PatientTabSkeleton />;
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 font-semibold text-lg">No Appointments</h3>
          <p className="mt-2 text-slate-600 text-sm dark:text-slate-400">
            This patient doesn't have any appointments yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <Card key={apt.id}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">
                    {formatDate(apt.appointmentDate)} at {apt.time}
                  </span>
                </div>
                <p className="text-sm">Dr. {apt.doctorName}</p>
                {apt.reason && (
                  <p className="text-slate-500 text-sm">{apt.reason}</p>
                )}
              </div>
              <Badge
                className={
                  apt.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : apt.status === "CONFIRMED"
                      ? "bg-blue-100 text-blue-700"
                      : apt.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                }
              >
                {apt.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PatientEncountersTab  ({ patientId }: { patientId: string }) {
  const [encounters, setEncounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        const { encounters: data } = await getPatientEncounters({
          data: { patientId },
        });
        setEncounters(data);
      } catch (error) {
        console.error("Failed to fetch encounters", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEncounters();
  }, [patientId]);

  if (loading) {
    return <PatientTabSkeleton />;
  }

  if (encounters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 font-semibold text-lg">No Encounters</h3>
          <p className="mt-2 text-slate-600 text-sm dark:text-slate-400">
            No encounter records found for this patient.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {encounters.map((encounter) => (
        <Card key={encounter.id}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{formatDate(encounter.date)}</span>
                </div>
                <Badge variant="outline">
                  {encounter.type || "Consultation"}
                </Badge>
              </div>
              {encounter.diagnosis && (
                <p className="text-sm">
                  <span className="font-medium">Diagnosis:</span> {encounter.diagnosis}
                </p>
              )}
              {encounter.treatment && (
                <p className="text-sm">
                  <span className="font-medium">Treatment:</span> {encounter.treatment}
                </p>
              )}
              <Link
                className="inline-block text-primary text-sm hover:underline"
                params={{ id: encounter.id }}
                to="/encounters/$id"
              >
                View Details →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PatientRecordsTab({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { records: data } = await getPatientMedicalRecords({
          data: { patientId },
        });
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch medical records", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [patientId]);

  if (loading) {
    return <PatientTabSkeleton />;
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 font-semibold text-lg">No Medical Records</h3>
          <p className="mt-2 text-slate-600 text-sm dark:text-slate-400">
            No medical records found for this patient.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{formatDate(record.createdAt)}</span>
                </div>
                {record.followUpDate && (
                  <Badge variant="outline">
                    Follow-up: {formatDate(record.followUpDate)}
                  </Badge>
                )}
              </div>
              {record.diagnosis && (
                <p className="text-sm">
                  <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                </p>
              )}
              {record.treatmentPlan && (
                <p className="text-sm">
                  <span className="font-medium">Treatment Plan:</span> {record.treatmentPlan}
                </p>
              )}
              <Link
                className="inline-block text-primary text-sm hover:underline"
                params={{ id: record.id }}
                to="/medical-records/$id"
              >
                View Details →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PatientTabSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
