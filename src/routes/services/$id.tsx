// src/routes/services/$id.tsx
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, DollarSign, Heart, Shield, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServiceById } from "@/data/services";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/services/$id")({
  component: ServiceDetailPage,
  loader: async ({ params }) => {
    const service = await getServiceById({ data: params.id });
    if (!service) {
      throw notFound();
    }
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { service } = loaderData;
    return {
      meta: [
        { title: `${service.serviceName} | Pediatric Services` },
        { name: "description", content: service.description },
      ],
    };
  },
});

function ServiceDetailPage() {
  const { service } = Route.useLoaderData();
  const router = useRouter();
  const { data: session } = useSession();
  const [isBooking, setIsBooking] = useState(false);

  const handleBookAppointment = async () => {
    if (!session) {
      toast.error("Please sign in to book an appointment");
      router.navigate({ to: "/sign-in" });
      return;
    }

    setIsBooking(true);
    try {
      // Navigate to appointment booking with service pre-selected
      router.navigate({
        to: "/appointments/book",
        search: { serviceId: service.id },
      });
    } catch (error) {
      console.error(error)
      toast.error("Failed to start booking process");
    } finally {
      setIsBooking(false);
    }
  };

  const features = [
    { icon: Heart, text: "Child-friendly environment" },
    { icon: Shield, text: "Certified pediatric specialists" },
    { icon: Star, text: "Trusted by thousands of parents" },
    { icon: Clock, text: "Flexible scheduling available" },
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link className="inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200" to="/services">
        <ArrowLeft className="h-4 w-4" />
        Back to all services
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${service.color}20`, color: service.color??"" }}
                >
                  {service.icon || "🩺"}
                </div>
                <div>
                  <CardTitle className="text-2xl">{service.serviceName}</CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{service.duration} minutes
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                      <DollarSign className="h-3 w-3" />
                      ${service.price}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold text-lg">About this service</h3>
                <p className="text-slate-600 leading-relaxed dark:text-slate-400">
                  {service.description}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-4 font-semibold text-lg">What to expect</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <feature.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="text-slate-700 text-sm dark:text-slate-300">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-semibold text-lg">Preparing for your visit</h3>
                <ul className="list-inside list-disc space-y-1 text-slate-600 text-sm dark:text-slate-400">
                  <li>Bring your child's insurance card and photo ID</li>
                  <li>Arrive 15 minutes before your scheduled appointment</li>
                  <li>Bring any relevant medical records or previous test results</li>
                  <li>List any medications your child is currently taking</li>
                  <li>Write down any questions or concerns you'd like to discuss</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking Card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-center text-lg">Book Appointment</CardTitle>
              <CardDescription className="text-center">
                Schedule this service for your child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm dark:text-slate-400">Service fee</span>
                  <span className="font-semibold">${service.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm dark:text-slate-400">Duration</span>
                  <span className="text-sm">{service.duration} minutes</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${service.price}</span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={isBooking}
                onClick={handleBookAppointment}
                size="lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {isBooking ? "Redirecting..." : "Book Appointment"}
              </Button>

              <p className="text-center text-slate-500 text-xs">
                Free cancellation up to 24 hours before appointment
              </p>
            </CardContent>
          </Card>

          {/* Related Info Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Insurance & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm dark:text-slate-400">
                We accept most major insurance plans. Contact our billing department for coverage verification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
