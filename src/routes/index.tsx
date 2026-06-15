// src/routes/index.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUpcomingAppointmentsCount, getDashboardUpcomingAppointments } from "@/data/appointments";
import { getRecentEncounters } from "@/data/diagnosis";
import { getClinicGrowthAlerts } from "@/data/growthRecord";
import { getDueImmunizations } from "@/data/immunization";
import { getRecentPatients } from "@/data/patients";
import type { DbAppointment, DbDiagnosis, DbDoctor, DbImmunization, DbPatient } from "@/db/schema/types";
import { formatDate } from "@/utils/formDate";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	AlertCircle,
	ArrowRightIcon,
	Baby,
	Calendar,
	Clock,
	FileText,
	Heart,
	Stethoscope,
	Syringe,
	TrendingUp,
	UserPlus,
	Users
} from "lucide-react";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		const session = context.session;
		return { session };
	},
	component: DashboardPage,
	loader: async () => {
		const [upcomingCount, recentPatients, recentEncounters, dueImmunizations, upcomingAppointments, growthAlerts] =
			await Promise.all([
				getUpcomingAppointmentsCount(),
				getRecentPatients(),
				getRecentEncounters(),
				getDueImmunizations(),
				getDashboardUpcomingAppointments(),
				getClinicGrowthAlerts()
			]);

		return {
			upcomingCount,
			recentPatients,
			recentEncounters,
			dueImmunizations,
			upcomingAppointments,
			growthAlerts
		};
	}
});

function DashboardPage() {
	const { session } = Route.useRouteContext();
	const { upcomingCount, recentPatients, recentEncounters, dueImmunizations, upcomingAppointments, growthAlerts } =
		Route.useLoaderData();

	const isLoggedIn = !!session;
	const userRole = session?.user?.role;

	const isMedicalStaff = userRole === "admin" || userRole === "doctor" || userRole === "staff";

	return (
		<div className='space-y-8'>
			{/* Hero Section */}
			<section className='relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-white shadow-xl dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
				<div className='absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl' />
				<div className='absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl' />

				<div className='relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
					<div className='space-y-4'>
						<div className='flex items-center gap-2'>
							<div className='rounded-full bg-white/20 p-2'>
								<Stethoscope className='h-6 w-6' />
							</div>
							<span className='text-sm text-white/80'>LittleHearts Pediatric Clinic</span>
						</div>
						<h1 className='font-bold text-4xl leading-tight lg:text-5xl'>
							Compassionate Care for
							<br />
							<span className='text-primary-foreground'>Every Child</span>
						</h1>
						<p className='max-w-xl text-lg text-slate-300'>
							Providing comprehensive pediatric care from birth to adolescence. Expert doctors, modern
							facilities, and a caring environment for your child's health.
						</p>
						<div className='flex flex-wrap gap-3 pt-2'>
							{isLoggedIn ? (
								<Link to='/appointments/book'>
									<Button
										className='bg-white text-slate-900 hover:bg-slate-100'
										size='lg'
									>
										<Calendar className='mr-2 h-5 w-5' />
										Book Appointment
									</Button>
								</Link>
							) : (
								<Link to='/sign-up'>
									<Button
										className='bg-white text-slate-900 hover:bg-slate-100'
										size='lg'
									>
										<UserPlus className='mr-2 h-5 w-5' />
										Register Your Child
									</Button>
								</Link>
							)}
							<Link to='/services'>
								<Button
									className='border-white text-white hover:bg-white/20'
									size='lg'
									variant='outline'
								>
									Our Services
								</Button>
							</Link>
						</div>
					</div>

					{/* Stats Cards */}
					<div className='grid grid-cols-2 gap-3'>
						<div className='rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm'>
							<div className='flex justify-center'>
								<Baby className='h-8 w-8 text-primary-foreground' />
							</div>
							<p className='mt-2 font-bold text-2xl'>5000+</p>
							<p className='text-slate-300 text-xs'>Happy Children</p>
						</div>
						<div className='rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm'>
							<div className='flex justify-center'>
								<Stethoscope className='h-8 w-8 text-primary-foreground' />
							</div>
							<p className='mt-2 font-bold text-2xl'>15+</p>
							<p className='text-slate-300 text-xs'>Specialists</p>
						</div>
						<div className='rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm'>
							<div className='flex justify-center'>
								<Clock className='h-8 w-8 text-primary-foreground' />
							</div>
							<p className='mt-2 font-bold text-2xl'>24/7</p>
							<p className='text-slate-300 text-xs'>Emergency Care</p>
						</div>
						<div className='rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm'>
							<div className='flex justify-center'>
								<TrendingUp className='h-8 w-8 text-primary-foreground' />
							</div>
							<p className='mt-2 font-bold text-2xl'>98%</p>
							<p className='text-slate-300 text-xs'>Satisfaction Rate</p>
						</div>
					</div>
				</div>
			</section>

			{/* Quick Actions - Only for logged-in users */}
			{isLoggedIn && (
				<section>
					<h2 className='mb-4 font-semibold text-xl'>Quick Actions</h2>
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						<Link to='/appointments/book'>
							<Card className='cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg'>
								<CardContent className='flex items-center gap-4 p-4'>
									<div className='rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30'>
										<Calendar className='h-6 w-6 text-blue-600 dark:text-blue-400' />
									</div>
									<div>
										<p className='font-semibold'>Book Appointment</p>
										<p className='text-slate-500 text-xs'>Schedule a visit</p>
									</div>
								</CardContent>
							</Card>
						</Link>

						<Link to='/appointments'>
							<Card className='cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg'>
								<CardContent className='flex items-center gap-4 p-4'>
									<div className='rounded-lg bg-green-100 p-3 dark:bg-green-900/30'>
										<Clock className='h-6 w-6 text-green-600 dark:text-green-400' />
									</div>
									<div>
										<p className='font-semibold'>My Appointments</p>
										<p className='text-slate-500 text-xs'>
											{upcomingCount > 0 ? `${upcomingCount} upcoming` : "View history"}
										</p>
									</div>
									{upcomingCount > 0 && (
										<Badge className='ml-auto bg-green-500'>{upcomingCount}</Badge>
									)}
								</CardContent>
							</Card>
						</Link>

						<Link to='/patients'>
							<Card className='cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg'>
								<CardContent className='flex items-center gap-4 p-4'>
									<div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30'>
										<Users className='h-6 w-6 text-purple-600 dark:text-purple-400' />
									</div>
									<div>
										<p className='font-semibold'>My Children</p>
										<p className='text-slate-500 text-xs'>View profiles</p>
									</div>
								</CardContent>
							</Card>
						</Link>

						<Link to='/services'>
							<Card className='cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg'>
								<CardContent className='flex items-center gap-4 p-4'>
									<div className='rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30'>
										<Stethoscope className='h-6 w-6 text-amber-600 dark:text-amber-400' />
									</div>
									<div>
										<p className='font-semibold'>Our Services</p>
										<p className='text-slate-500 text-xs'>What we offer</p>
									</div>
								</CardContent>
							</Card>
						</Link>
					</div>
				</section>
			)}

			{/* Medical Staff Dashboard */}
			{isMedicalStaff && (
				<section>
					<div className='mb-4 flex items-center justify-between'>
						<h2 className='font-semibold text-xl'>Clinical Dashboard</h2>
						<Link to='/dashboard'>
							<Button
								size='sm'
								variant='ghost'
							>
								View Full Dashboard
								<ArrowRightIcon className='ml-1 h-4 w-4' />
							</Button>
						</Link>
					</div>

					<div className='grid gap-6 lg:grid-cols-2'>
						{/* Upcoming Appointments */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Calendar className='h-5 w-5' />
									Upcoming Appointments
								</CardTitle>
								<CardDescription>Today's schedule and upcoming visits</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								{upcomingAppointments.length === 0 ? (
									<p className='py-6 text-center text-slate-500 text-sm'>No upcoming appointments</p>
								) : (
									upcomingAppointments.map(apt => (
										<div
											className='flex items-center justify-between rounded-lg border p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800'
											key={apt.id}
										>
											<div className='space-y-0.5'>
												<p className='font-medium text-sm'>
													{apt.patient?.firstName} {apt.patient?.lastName}
												</p>
												<p className='flex items-center gap-2 text-slate-500 text-xs'>
													<Stethoscope className='h-3 w-3' />
													Dr. {apt.doctor?.name}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-medium text-sm'>{apt.time}</p>
												<p className='text-slate-500 text-xs'>
													{formatDate(apt.appointmentDate)}
												</p>
											</div>
										</div>
									))
								)}
							</CardContent>
						</Card>

						{/* Due Immunizations */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Syringe className='h-5 w-5' />
									Due Immunizations
									{dueImmunizations.length > 0 && (
										<Badge
											className='ml-2'
											variant='destructive'
										>
											{dueImmunizations.length}
										</Badge>
									)}
								</CardTitle>
								<CardDescription>Vaccinations due or overdue</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								{dueImmunizations.length === 0 ? (
									<p className='py-6 text-center text-slate-500 text-sm'>
										All immunizations up to date
									</p>
								) : (
									dueImmunizations.map(imm => (
										<div
											className='flex items-center justify-between rounded-lg border p-3'
											key={imm.id}
										>
											<div>
												<p className='font-medium text-sm'>{imm.vaccine}</p>
												<p className='text-slate-500 text-xs'>
													{imm.patient?.firstName} {imm.patient?.lastName}
												</p>
											</div>
											<Badge variant={imm.isOverDue ? "destructive" : "outline"}>
												{imm.isOverDue ? "Overdue" : "Due Soon"}
											</Badge>
										</div>
									))
								)}
							</CardContent>
						</Card>

						{/* Recent Patients */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Users className='h-5 w-5' />
									Recent Patients
								</CardTitle>
								<CardDescription>Newly registered children</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								{recentPatients.length === 0 ? (
									<p className='py-6 text-center text-slate-500 text-sm'>No recent patients</p>
								) : (
									recentPatients.map(patient => (
										<Link
											className='flex items-center justify-between rounded-lg border p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800'
											key={patient.id}
											params={{ id: patient.id }}
											to='/patients/$id'
										>
											<div>
												<p className='font-medium text-sm'>
													{patient.firstName} {patient.lastName}
												</p>
												<p className='text-slate-500 text-xs'>MRN: {patient.mrn}</p>
											</div>
											<ArrowRightIcon className='h-4 w-4 text-slate-400' />
										</Link>
									))
								)}
							</CardContent>
						</Card>

						{/* Recent Encounters */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<FileText className='h-5 w-5' />
									Recent Encounters
								</CardTitle>
								<CardDescription>Latest consultations and diagnoses</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								{recentEncounters.length === 0 ? (
									<p className='py-6 text-center text-slate-500 text-sm'>No recent encounters</p>
								) : (
									recentEncounters.map(encounter => (
										<Link
											className='flex items-center justify-between rounded-lg border p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800'
											key={encounter.id}
											params={{ id: encounter.id }}
											to='/encounters/$id'
										>
											<div>
												<p className='font-medium text-sm'>
													{encounter.patientFirstName} {encounter.patientLastName}
												</p>
												<p className='text-slate-500 text-xs'>
													{encounter.diagnosis || "No diagnosis"}
												</p>
											</div>
											<div className='text-right'>
												<p className='text-slate-500 text-xs'>{formatDate(encounter.date)}</p>
												<ArrowRightIcon className='mt-1 h-4 w-4 text-slate-400' />
											</div>
										</Link>
									))
								)}
							</CardContent>
						</Card>
					</div>
				</section>
			)}

			{/* Growth Alerts Section */}
			{isMedicalStaff && growthAlerts && growthAlerts.length > 0 && (
				<section>
					<Card className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-amber-700 dark:text-amber-400'>
								<AlertCircle className='h-5 w-5' />
								Growth Monitoring Alerts
							</CardTitle>
							<CardDescription className='text-amber-600 dark:text-amber-400'>
								Children requiring attention for growth concerns
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								{growthAlerts.map((alert, index) => (
									<div
										className='flex items-center justify-between rounded-lg bg-white p-3 dark:bg-slate-900'
										key={index}
									>
										<div>
											<p className='font-medium'>{alert.patientName}</p>
											<p className='text-slate-500 text-sm'>{alert.message}</p>
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
			)}

			{/* Services Showcase */}
			<section>
				<div className='mb-6 text-center'>
					<h2 className='font-bold text-2xl'>Our Pediatric Services</h2>
					<p className='mt-2 text-slate-600 dark:text-slate-400'>
						Comprehensive care for every stage of childhood
					</p>
				</div>
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<ServiceCard
						color='blue'
						description='Regular check-ups, growth monitoring, and developmental screenings'
						icon={Baby}
						title='Well-Child Visits'
					/>
					<ServiceCard
						color='green'
						description='Complete immunization schedules following WHO guidelines'
						icon={Syringe}
						title='Vaccinations'
					/>
					<ServiceCard
						color='red'
						description='24/7 urgent care for accidents, fevers, and acute illnesses'
						icon={Heart}
						title='Emergency Care'
					/>
					<ServiceCard
						color='purple'
						description='Tracking milestones and early intervention when needed'
						icon={Activity}
						title='Developmental Assessment'
					/>
				</div>
			</section>

			{/* Features Section */}
			<section className='rounded-2xl bg-slate-50 p-8 dark:bg-slate-900/50'>
				<div className='mb-8 text-center'>
					<h2 className='font-bold text-2xl'>Why Choose LittleHearts?</h2>
					<p className='mt-2 text-slate-600 dark:text-slate-400'>
						We're dedicated to providing the best possible care for your child
					</p>
				</div>
				<div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					<FeatureCard
						description='Our team of board-certified pediatricians has years of experience in child healthcare.'
						title='Experienced Pediatricians'
					/>
					<FeatureCard
						description='State-of-the-art equipment and child-friendly environment designed for comfort.'
						title='Modern Facilities'
					/>
					<FeatureCard
						description="Secure access to your child's medical history, growth charts, and immunization records."
						title='Digital Health Records'
					/>
					<FeatureCard
						description="Easy scheduling and reminders for all your child's healthcare needs."
						title='Online Appointment Booking'
					/>
					<FeatureCard
						description='Get expert advice from home for minor concerns and follow-up questions.'
						title='24/7 Telehealth Support'
					/>
					<FeatureCard
						description='We partner with parents to ensure the best outcomes for every child.'
						title='Family-Centered Care'
					/>
				</div>
			</section>
		</div>
	);
}

function ServiceCard({
	icon: Icon,
	title,
	description,
	color
}: {
	icon: React.ElementType;
	title: string;
	description: string;
	color: "blue" | "green" | "red" | "purple";
}) {
	const colorClasses = {
		blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
		green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
		red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
		purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
	};

	return (
		<Card className='h-full text-center transition-all hover:-translate-y-1 hover:shadow-lg'>
			<CardContent className='p-6'>
				<div
					className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}
				>
					<Icon className='h-6 w-6' />
				</div>
				<h3 className='mb-2 font-semibold text-lg'>{title}</h3>
				<p className='text-slate-600 text-sm dark:text-slate-400'>{description}</p>
			</CardContent>
		</Card>
	);
}

function FeatureCard({ title, description }: { title: string; description: string }) {
	return (
		<div className='flex gap-3'>
			<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10'>
				<Heart className='h-4 w-4 text-primary' />
			</div>
			<div>
				<h3 className='font-semibold'>{title}</h3>
				<p className='text-slate-600 text-sm dark:text-slate-400'>{description}</p>
			</div>
		</div>
	);
}
