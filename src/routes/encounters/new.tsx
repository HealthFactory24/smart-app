// src/routes/encounters/new.tsx
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertCircle, Ruler, Weight, Heart, Thermometer, Droplets } from "lucide-react";
import { getMyChildren } from "@/data/patients";
import { getAllDoctors } from "@/data/doctors";
import { getPatientAppointments } from "@/data/appointments";
import { createEncounter } from "@/data/diagnosis";
import { createVitalSign, type VitalSignInput } from "@/data/vital-signs";
import { createGrowthRecord, type GrowthRecordInput } from "@/data/growth-record";
import { calculateAgeInMonths, calculateAgeInDays } from "@/utils/growth";

const encounterSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentId: z.string().optional(),
  type: z.string().default("CONSULTATION"),
  symptoms: z.string().min(1, "Please enter symptoms"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  followUpPlan: z.string().optional(),
  prescribedMedications: z.string().optional(),
});

const vitalSignsSchema = z.object({
  bodyTemperature: z.number().min(34).max(42).optional(),
  systolic: z.number().min(60).max(200).optional(),
  diastolic: z.number().min(40).max(120).optional(),
  heartRate: z.number().min(40).max(200).optional(),
  respiratoryRate: z.number().min(10).max(60).optional(),
  oxygenSaturation: z.number().min(70).max(100).optional(),
  weight: z.number().min(0.5).max(200).optional(),
  height: z.number().min(30).max(250).optional(),
});

const growthRecordSchema = z.object({
  weight: z.number().min(0.5).max(200).optional(),
  height: z.number().min(30).max(250).optional(),
  headCircumference: z.number().min(20).max(70).optional(),
});

export const Route = createFileRoute("/encounters/new")({
  beforeLoad: async ({ context }) => {
    const session = context.session;
    if (!session) throw redirect({ to: "/sign-in" });
    if (session.user.role === "patient") throw redirect({ to: "/" });
    return { user: session.user };
  },
  component: NewEncounterPage,
});

function NewEncounterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("encounter");
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [growthCalculations, setGrowthCalculations] = useState<{
    bmi?: number;
    ageMonths?: number;
    ageDays?: number;
  }>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [patientsData, doctorsData] = await Promise.all([
        getAllPatients(),
        getAllDoctors(),
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientAppointments = async (patientId: string) => {
    try {
      const appointmentsData = await getPatientAppointments({ data: { patientId } });
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Failed to load appointments", error);
    }
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    if (patientId) {
      loadPatientAppointments(patientId);
    } else {
      setAppointments([]);
    }
  };

  const form = useForm({
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentId: "",
      type: "CONSULTATION",
      symptoms: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      followUpPlan: "",
      prescribedMedications: "",
    },
    onSubmit: async ({ value }) => {
      const result = encounterSchema.safeParse(value);
      if (!result.success) {
        toast.error(result.error.issues[0]?.message);
        return;
      }

      setIsSubmitting(true);
      try {
        // Create the encounter/diagnosis first
        const encounter = await createEncounter({
          data: {
            patientId: value.patientId,
            doctorId: value.doctorId,
            medicalId: crypto.randomUUID(), // Will be created with medical record
            appointmentId: value.appointmentId || undefined,
            type: value.type,
            symptoms: value.symptoms,
            diagnosis: value.diagnosis,
            treatment: value.treatment,
            notes: value.notes,
            followUpPlan: value.followUpPlan,
            prescribedMedications: value.prescribedMedications,
          },
        });

        // Create vital signs if provided
        const weight = (document.getElementById("weight") as HTMLInputElement)?.value;
        const height = (document.getElementById("height") as HTMLInputElement)?.value;
        const bodyTemp = (document.getElementById("bodyTemperature") as HTMLInputElement)?.value;
        const systolic = (document.getElementById("systolic") as HTMLInputElement)?.value;
        const diastolic = (document.getElementById("diastolic") as HTMLInputElement)?.value;
        const heartRate = (document.getElementById("heartRate") as HTMLInputElement)?.value;
        const respRate = (document.getElementById("respiratoryRate") as HTMLInputElement)?.value;
        const oxygenSat = (document.getElementById("oxygenSaturation") as HTMLInputElement)?.value;

        if (weight || height || bodyTemp || systolic || diastolic || heartRate || respRate || oxygenSat) {
          const vitalSignsData: VitalSignInput = {
            patientId: value.patientId,
            medicalId: encounter.medicalId,
            encounterId: encounter.id,
            recordedAt: new Date(),
          };
          if (weight) vitalSignsData.weight = parseFloat(weight);
          if (height) vitalSignsData.height = parseFloat(height);
          if (bodyTemp) vitalSignsData.bodyTemperature = parseFloat(bodyTemp);
          if (systolic) vitalSignsData.systolic = parseInt(systolic);
          if (diastolic) vitalSignsData.diastolic = parseInt(diastolic);
          if (heartRate) vitalSignsData.heartRate = parseInt(heartRate);
          if (respRate) vitalSignsData.respiratoryRate = parseInt(respRate);
          if (oxygenSat) vitalSignsData.oxygenSaturation = parseInt(oxygenSat);

          await createVitalSign({ data: vitalSignsData });
        }

        // Create growth record if weight or height provided
        if (weight || height) {
          const growthData: GrowthRecordInput = {
            patientId: value.patientId,
            date: new Date(),
          };
          if (weight) growthData.weight = parseFloat(weight);
          if (height) growthData.height = parseFloat(height);
          const headCirc = (document.getElementById("headCircumference") as HTMLInputElement)?.value;
          if (headCirc) growthData.headCircumference = parseFloat(headCirc);

          await createGrowthRecord({ data: growthData });
        }

        toast.success("Encounter created successfully");
        navigate({ to: "/encounters" });
      } catch (error) {
        toast.error("Failed to create encounter");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Calculate BMI and age when weight/height change
  const onGrowthChange = (weight: number, height: number) => {
    if (selectedPatient && selectedPatient.dateOfBirth) {
      const ageMonths = calculateAgeInMonths(new Date(selectedPatient.dateOfBirth));
      const ageDays = calculateAgeInDays(new Date(selectedPatient.dateOfBirth));
      setGrowthCalculations({ ageMonths, ageDays });

      if (weight && height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        setGrowthCalculations(prev => ({ ...prev, bmi: parseFloat(bmi.toFixed(1)) }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">New Patient Visit</CardTitle>
          <CardDescription>
            Document a new patient encounter, record vital signs, and track growth metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="encounter">Encounter Details</TabsTrigger>
                <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                <TabsTrigger value="growth">Growth Tracking</TabsTrigger>
              </TabsList>

              {/* Encounter Details Tab */}
              <TabsContent value="encounter" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="patientId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Patient *</Label>
                        <Select
                          onValueChange={(value) => {
                            field.handleChange(value);
                            handlePatientChange(value);
                          }}
                          value={field.state.value}
                        >
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.firstName} {patient.lastName} ({patient.mrn || "No MRN"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="doctorId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Doctor *</Label>
                        <Select onValueChange={field.handleChange} value={field.state.value}>
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                Dr. {doctor.name} - {doctor.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="appointmentId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Associated Appointment (Optional)</Label>
                        <Select onValueChange={field.handleChange} value={field.state.value || undefined}>
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select appointment" />
                          </SelectTrigger>
                          <SelectContent>
                            {appointments.map((apt) => (
                              <SelectItem key={apt.id} value={apt.id}>
                                {new Date(apt.appointmentDate).toLocaleDateString()} - {apt.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="type">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Visit Type *</Label>
                        <Select onValueChange={field.handleChange} value={field.state.value}>
                          <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select visit type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONSULTATION">Consultation</SelectItem>
                            <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            <SelectItem value="WELL_CHILD">Well Child Visit</SelectItem>
                            <SelectItem value="SICK_VISIT">Sick Visit</SelectItem>
                            <SelectItem value="VACCINATION">Vaccination</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field name="symptoms">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Symptoms / Chief Complaint *</Label>
                      <Textarea
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Describe the patient's symptoms and reason for visit..."
                        rows={3}
                        value={field.state.value}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="diagnosis">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Diagnosis</Label>
                      <Textarea
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Primary diagnosis and differential diagnoses..."
                        rows={2}
                        value={field.state.value}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="treatment">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Treatment Plan</Label>
                      <Textarea
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Prescribed treatments, medications, procedures..."
                        rows={2}
                        value={field.state.value}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="prescribedMedications">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Prescribed Medications</Label>
                      <Textarea
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="List any medications prescribed with dosage and frequency..."
                        rows={2}
                        value={field.state.value}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="followUpPlan">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Follow-up Plan</Label>
                      <Textarea
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Recommended follow-up schedule, referrals, or additional tests..."
                        rows={2}
                        value={field.state.value}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="notes">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Additional Notes</Label>
                      <Textarea
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Any additional observations or notes..."
                        rows={2}
                        value={field.state.value}
                      />
                    </div>
                  )}
                </form.Field>
              </TabsContent>

              {/* Vital Signs Tab */}
              <TabsContent value="vitals" className="space-y-6">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    Record the patient's vital signs. All measurements are optional.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Body Temperature (°C)
                    </Label>
                    <Input
                      id="bodyTemperature"
                      placeholder="36.5 - 37.5"
                      step="0.1"
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Blood Pressure (mmHg)
                    </Label>
                    <div className="flex gap-2">
                      <Input id="systolic" placeholder="Systolic" type="number" />
                      <span className="self-center">/</span>
                      <Input id="diastolic" placeholder="Diastolic" type="number" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Heart Rate (bpm)
                    </Label>
                    <Input id="heartRate" placeholder="60 - 100" type="number" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Respiratory Rate (breaths/min)
                    </Label>
                    <Input id="respiratoryRate" placeholder="12 - 20" type="number" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Oxygen Saturation (%)
                    </Label>
                    <Input id="oxygenSaturation" placeholder="95 - 100" type="number" />
                  </div>
                </div>
              </TabsContent>

              {/* Growth Tracking Tab */}
              <TabsContent value="growth" className="space-y-6">
                <Alert>
                  <Ruler className="h-4 w-4" />
                  <AlertDescription>
                    Growth measurements help track the patient's development over time.
                    These will be plotted on WHO growth charts.
                  </AlertDescription>
                </Alert>

                {selectedPatient && (
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Patient Age: {growthCalculations.ageMonths || calculateAgeInMonths(new Date(selectedPatient.dateOfBirth))} months (
                      {growthCalculations.ageDays || calculateAgeInDays(new Date(selectedPatient.dateOfBirth))} days)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Gender: {selectedPatient.gender?.toLowerCase() || "Not specified"}
                    </p>
                    {growthCalculations.bmi && (
                      <p className="text-sm font-medium text-primary">
                        Calculated BMI: {growthCalculations.bmi}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      onChange={(e) => {
                        const weight = parseFloat(e.target.value);
                        const height = parseFloat((document.getElementById("height") as HTMLInputElement)?.value || "0");
                        if (weight && height) onGrowthChange(weight, height);
                      }}
                      placeholder="0.0"
                      step="0.1"
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Height / Length (cm)
                    </Label>
                    <Input
                      id="height"
                      onChange={(e) => {
                        const height = parseFloat(e.target.value);
                        const weight = parseFloat((document.getElementById("weight") as HTMLInputElement)?.value || "0");
                        if (weight && height) onGrowthChange(weight, height);
                      }}
                      placeholder="0.0"
                      step="0.1"
                      type="number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Head Circumference (cm)</Label>
                    <Input
                      id="headCircumference"
                      placeholder="For children under 2 years"
                      step="0.1"
                      type="number"
                    />
                  </div>
                </div>

                {/* Growth Chart Preview (simplified) */}
                {selectedPatient && (document.getElementById("weight") as HTMLInputElement)?.value && (
                  <div className="mt-4 rounded-lg border p-4">
                    <h4 className="mb-2 font-medium">Growth Percentile Preview</h4>
                    <div className="h-32 w-full rounded-lg bg-slate-100 dark:bg-slate-800">
                      {/* Chart will be rendered here using recharts */}
                      <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                        Weight: {document.getElementById("weight")?.value} kg
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate({ to: "/encounters" })} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Complete Visit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
