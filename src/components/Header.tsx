import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Calendar, Stethoscope, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAppointmentsCount } from "#/data/appointments";
import { signOut } from "#/lib/auth-client";
import { Route as RootRoute } from "@/routes/__root";

export const appointmentsCountQueryKey = ["appointments-count"] as const;

export default function Header() {
	const { session } = RootRoute.useRouteContext();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const router = useRouter();
	const navigate = useNavigate();

	// Get upcoming appointments count for the badge
	const { data: appointmentsSummary } = useQuery({
		queryKey: appointmentsCountQueryKey,
		queryFn: () => getAppointmentsCount(),
		staleTime: 0,
		refetchInterval: 60000 // every minute refetch
	});

	const upcomingCount = appointmentsSummary?.count ?? 0;

	const handleLogout = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: async () => {
					await router.invalidate();
					navigate({ to: "/" });
					setIsUserMenuOpen(false);
					toast.success("Logged out successfully.", {
						description: "You will be redirected to the home page."
					});
				}
			}
		});
	};

	return (
		<header className='sticky top-0 z-40 border-slate-200 border-b bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80'>
			<div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
				<div className='flex items-center gap-3'>
					<Link
						className='flex items-center gap-2'
						to='/'
					>
						<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-800'>
							<Stethoscope size={20} />
						</div>

						<div className='flex flex-col'>
							<span className='font-semibold text-slate-900 text-sm dark:text-white'>LittleHearts</span>
							<span className='text-[10px] text-slate-500 dark:text-slate-400'>Pediatric Clinic</span>
						</div>
					</Link>

					<nav className='hidden items-center gap-3 font-medium text-slate-700 text-sm sm:flex dark:text-slate-200'>
						<Link
							className='rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800'
							to='/'
						>
							Home
						</Link>

						<Link
							className='rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800'
							to='/services'
						>
							Services
						</Link>

						{session && (
							<Link
								className='rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800'
								to='/appointments'
							>
								My Appointments
							</Link>
						)}
					</nav>
				</div>

				<div className='flex items-center gap-2'>
					{session && (
						<Link
							className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
							to='/appointments/book'
						>
							<span>Book Appointment</span>

							{upcomingCount > 0 && (
								<span className='flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-2 font-bold text-[11px] text-white'>
									{upcomingCount}
								</span>
							)}
						</Link>
					)}

					{session ? (
						<div className='relative'>
							<button
								aria-label='Open user menu'
								className='flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
								onClick={() => setIsUserMenuOpen(current => !current)}
								type='button'
							>
								<User size={18} />
							</button>

							{isUserMenuOpen && (
								<div className='absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900'>
									<div className='border-slate-100 border-b px-3 py-2 dark:border-slate-800'>
										<p className='truncate font-semibold text-slate-900 text-sm dark:text-white'>
											{session.user.name}
										</p>
										<p className='truncate text-slate-500 text-xs'>{session.user.email}</p>
										{session.user.role === "admin" && (
											<span className='mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
												Medical Staff
											</span>
										)}
									</div>

									<Link
										className='mt-2 block rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
										onClick={() => setIsUserMenuOpen(false)}
										to='/profile'
									>
										<Calendar size={14} className='mr-2 inline' />
										My Profile
									</Link>

									<Link
										className='block rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
										onClick={() => setIsUserMenuOpen(false)}
										to='/appointments'
									>
										<Calendar size={14} className='mr-2 inline' />
										Appointment History
									</Link>

									{session?.user.role === "admin" && (
										<>
											<div className='border-slate-100 border-t my-2 dark:border-slate-800' />
											<p className='px-3 py-1 text-[10px] font-semibold uppercase text-slate-400'>
												Admin Panel
											</p>

											<Link
												className='mt-1 block rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
												onClick={() => setIsUserMenuOpen(false)}
												to='/services/manage'
											>
												<Stethoscope size={14} className='mr-2 inline' />
												Manage Services
											</Link>

											<Link
												className='block rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
												onClick={() => setIsUserMenuOpen(false)}
												to='/appointments/manage'
											>
												<Users size={14} className='mr-2 inline' />
												Manage Appointments
											</Link>
										</>
									)}

									<button
										className='mt-2 block w-full rounded-lg px-3 py-2 text-left text-red-500 text-sm transition hover:bg-red-50 dark:hover:bg-red-950/30'
										onClick={handleLogout}
										type='button'
									>
										Log out
									</button>
								</div>
							)}
						</div>
					) : (
						<div className='flex items-center gap-2'>
							<Link
								className='rounded-full px-4 py-2 font-semibold text-slate-700 text-xs transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
								to='/sign-in'
							>
								Login
							</Link>

							<Link
								className='rounded-full bg-slate-900 px-4 py-2 font-semibold text-white text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900'
								to='/sign-up'
							>
								Register Child
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
