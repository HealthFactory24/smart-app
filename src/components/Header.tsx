// src/components/Header.tsx

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Calendar, Stethoscope, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAppointmentsCount } from "@/data/appointments";
import { signOut } from "@/lib/auth-client";
import { Route as RootRoute } from "@/routes/__root";

export const cartCountQueryKey = ["cart-count"] as const;
export const appointmentsCountQueryKey = ["appointments-count"] as const;

interface AppointmentsSummary {
	count: number;
}

export default function Header() {
	const { session } = RootRoute.useRouteContext();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const router = useRouter();
	const navigate = useNavigate();

	// Get upcoming appointments count for the badge
	const { data: appointmentsSummary } = useQuery<AppointmentsSummary>({
		queryKey: appointmentsCountQueryKey,
		queryFn: () => getAppointmentsCount(),
		staleTime: 0,
		refetchInterval: 60000 // every minute refetch
	});

	const upcomingCount = appointmentsSummary?.count ?? 0;

	const handleLogout = async () => {
		try {
			await signOut({
				fetchOptions: {
					onSuccess: async () => {
						await router.invalidate();
						await navigate({ to: "/" });
						setIsUserMenuOpen(false);
						toast.success("Logged out successfully.", {
							description: "You will be redirected to the home page."
						});
					}
				}
			});
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to logout. Please try again.");
		}
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
							activeProps={{ className: "bg-slate-100 dark:bg-slate-800" }}
							className='rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800'
							to='/'
						>
							Home
						</Link>

						<Link
							activeProps={{ className: "bg-slate-100 dark:bg-slate-800" }}
							className='rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800'
							to='/services'
						>
							Services
						</Link>

						{session && (
							<Link
								activeProps={{ className: "bg-slate-100 dark:bg-slate-800" }}
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
							className='relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
							to='/appointments/book'
						>
							<span>Book Appointment</span>

							{upcomingCount > 0 && (
								<span className='absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 font-bold text-[10px] text-white'>
									{upcomingCount > 99 ? "99+" : upcomingCount}
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
								<>
									{/* Backdrop for mobile */}
									<div
										className='fixed inset-0 z-40'
										onClick={() => setIsUserMenuOpen(false)}
									/>

									<div className='absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900'>
										<div className='border-slate-100 border-b px-3 py-2 dark:border-slate-800'>
											<p className='truncate font-semibold text-slate-900 text-sm dark:text-white'>
												{session.user.name}
											</p>
											<p className='truncate text-slate-500 text-xs'>{session.user.email}</p>
											{session.user.role === "admin" && (
												<span className='mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 font-medium text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
													Medical Staff
												</span>
											)}
										</div>

										<div className='space-y-1'>
											<Link
												className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
												onClick={() => setIsUserMenuOpen(false)}
												to='/profile'
											>
												<User size={14} />
												My Profile
											</Link>

											<Link
												className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
												onClick={() => setIsUserMenuOpen(false)}
												to='/appointments'
											>
												<Calendar size={14} />
												Appointment History
											</Link>

											{session?.user.role === "admin" && (
												<>
													<div className='my-2 border-slate-100 border-t dark:border-slate-800' />
													<p className='px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase'>
														Admin Panel
													</p>

													<Link
														className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
														onClick={() => setIsUserMenuOpen(false)}
														to='/services/manage'
													>
														<Stethoscope size={14} />
														Manage Services
													</Link>

													<Link
														className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
														onClick={() => setIsUserMenuOpen(false)}
														to='/appointments/manage'
													>
														<Users size={14} />
														Manage Appointments
													</Link>

													<Link
														className='flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
														onClick={() => setIsUserMenuOpen(false)}
														to='/medical-records'
													>
														<Stethoscope size={14} />
														Medical Records
													</Link>
												</>
											)}
										</div>

										<button
											className='mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 text-sm transition hover:bg-red-50 dark:hover:bg-red-950/30'
											onClick={handleLogout}
											type='button'
										>
											<svg
												className='h-4 w-4'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												viewBox='0 0 24 24'
											>
												<title>Logout Icon</title>
												<path
													d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
											Log out
										</button>
									</div>
								</>
							)}
						</div>
					) : (
						<div className='flex items-center gap-2'>
							<Link
								className='rounded-full px-4 py-2 font-semibold text-slate-700 text-sm transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
								to='/sign-in'
							>
								Login
							</Link>

							<Link
								className='rounded-full bg-slate-900 px-4 py-2 font-semibold text-sm text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-900'
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
