// src/routes/profile.tsx
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import imageCompression from "browser-image-compression";
import { Building2, Calendar, Mail, MapPin, Pencil, Phone, Save, Shield, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateProfile, uploadProfileImage } from "@/data/user";
import { useCurrentClinic } from "@/hooks";
import type { Session } from "@/lib/auth-client";

// Validation schemas
const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	phone: z.string().optional(),
	address: z.string().optional()
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password")
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Extended user type with additional fields
interface ExtendedUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	role: "admin" | "doctor" | "staff" | "patient";
	phone?: string | null;
	address?: string | null;
	createdAt: string | Date;
	clinicId?: string | null;
}

export const Route = createFileRoute("/profile")({
	beforeLoad: async ({ context }) => {
		const session = context.session as Session | null;
		if (!session) throw redirect({ to: "/sign-in" });
		return { user: session.user as ExtendedUser };
	},
	component: ProfilePage
});

function ProfilePage() {
	const { user } = Route.useRouteContext();
	const router = useRouter();
	const { data: clinic, isLoading: clinicLoading } = useCurrentClinic();

	// Edit dialog state
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isPasswordOpen, setIsPasswordOpen] = useState(false);
	const [editForm, setEditForm] = useState<ProfileFormValues>({
		name: user.name,
		phone: user.phone || "",
		address: user.address || ""
	});

	// Image state
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [compressedFile, setCompressedFile] = useState<File | null>(null);

	// Password form state
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: ""
	});
	const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

	// Loading states
	const [isSaving, setIsSaving] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	// Notification preferences
	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		smsNotifications: false,
		appointmentReminders: true,
		marketingEmails: false
	});

	function openEditDialog() {
		setEditForm({
			name: user.name,
			phone: user.phone || "",
			address: user.address || ""
		});
		setImagePreview(null);
		setCompressedFile(null);
		setIsEditOpen(true);
	}

	async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be less than 5MB");
			return;
		}

		try {
			const compressed = await imageCompression(file, {
				maxSizeMB: 0.5,
				maxWidthOrHeight: 800,
				useWebWorker: true
			});
			setCompressedFile(compressed);
			setImagePreview(URL.createObjectURL(compressed));
		} catch (error) {
			console.error("Error compressing image", error);
			toast.error("Failed to process image");
		}
	}

	async function handleSave() {
		setIsSaving(true);

		try {
			let imageUrl: string | undefined;

			if (compressedFile) {
				const formData = new FormData();
				formData.append("file", compressedFile);
				const uploadedUser = await uploadProfileImage({
					data: formData
				});
				imageUrl = uploadedUser.image || undefined;
			}

			await updateProfile({
				data: {
					name: editForm.name,
					phone: editForm.phone || undefined,
					address: editForm.address || undefined,
					...(imageUrl ? { image: imageUrl } : {})
				}
			});

			await router.invalidate();
			setIsEditOpen(false);
			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Failed to update profile", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handlePasswordChange() {
		// Validate form
		const result = passwordSchema.safeParse(passwordForm);
		if (!result.success) {
			const errors: Record<string, string> = {};
			result.error.issues.forEach(issue => {
				if (issue.path[0]) {
					errors[issue.path[0] as string] = issue.message;
				}
			});
			setPasswordErrors(errors);
			return;
		}

		setIsChangingPassword(true);
		try {
			// Call your password change API here
			await new Promise(resolve => setTimeout(resolve, 1000));

			setIsPasswordOpen(false);
			setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
			setPasswordErrors({});
			toast.success("Password changed successfully");
		} catch (error) {
			toast.error("Failed to change password. Please check your current password.");
		} finally {
			setIsChangingPassword(false);
		}
	}

	async function handleNotificationChange(key: keyof typeof notifications) {
		setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
		toast.success("Preferences saved");
	}

	const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});

	const getRoleBadge = () => {
		const roleConfig = {
			admin: {
				label: "Administrator",
				color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
				icon: Shield
			},
			doctor: {
				label: "Medical Doctor",
				color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
				icon: User
			},
			staff: {
				label: "Staff Member",
				color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
				icon: User
			},
			patient: {
				label: "Patient",
				color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
				icon: User
			}
		};
		const config = roleConfig[user.role] || roleConfig.patient;
		const Icon = config.icon;
		return (
			<span
				className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs ${config.color}`}
			>
				<Icon size={12} />
				{config.label}
			</span>
		);
	};

	return (
		<div className='mx-auto max-w-5xl space-y-6 py-8'>
			{/* Page header */}
			<div>
				<h1 className='font-semibold text-2xl tracking-tight'>My Profile</h1>
				<p className='text-slate-500 text-sm'>Manage your account settings and preferences</p>
			</div>

			<Tabs
				className='space-y-6'
				defaultValue='profile'
			>
				<TabsList className='grid w-full max-w-md grid-cols-3'>
					<TabsTrigger value='profile'>Profile</TabsTrigger>
					<TabsTrigger value='security'>Security</TabsTrigger>
					<TabsTrigger value='notifications'>Notifications</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent
					className='space-y-6'
					value='profile'
				>
					{/* Profile Card */}
					<Card>
						<CardHeader className='flex flex-row items-center justify-between'>
							<div className='space-y-1'>
								<CardTitle>Personal Information</CardTitle>
								<CardDescription>View and manage your personal details</CardDescription>
							</div>
							<Button
								onClick={openEditDialog}
								size='sm'
								variant='outline'
							>
								<Pencil
									className='mr-2'
									size={14}
								/>
								Edit Profile
							</Button>
						</CardHeader>

						<CardContent className='space-y-6'>
							{/* Avatar + Name Section */}
							<div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
								<Avatar className='h-20 w-20 border-2 border-slate-200 dark:border-slate-700'>
									<AvatarImage
										alt={user.name}
										src={user.image || undefined}
									/>
									<AvatarFallback className='bg-primary/10 text-primary text-xl'>
										{user.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className='space-y-1 text-center sm:text-left'>
									<div className='flex flex-wrap items-center justify-center gap-2 sm:justify-start'>
										<p className='font-semibold text-slate-900 text-xl dark:text-white'>
											{user.name}
										</p>
										{getRoleBadge()}
									</div>
									<p className='text-slate-500 text-sm'>{user.email}</p>
								</div>
							</div>

							<Separator />

							{/* Contact Information Grid */}
							<div className='grid gap-6 sm:grid-cols-2'>
								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-slate-500 text-sm'>
										<Mail size={14} />
										<span>Email Address</span>
									</div>
									<p className='font-medium'>{user.email}</p>
									{user.emailVerified && (
										<Badge
											className='text-emerald-600 text-xs'
											variant='outline'
										>
											Verified
										</Badge>
									)}
								</div>

								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-slate-500 text-sm'>
										<Phone size={14} />
										<span>Phone Number</span>
									</div>
									<p className='font-medium'>{user.phone || "Not provided"}</p>
								</div>

								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-slate-500 text-sm'>
										<MapPin size={14} />
										<span>Address</span>
									</div>
									<p className='font-medium'>{user.address || "Not provided"}</p>
								</div>

								<div className='space-y-1'>
									<div className='flex items-center gap-2 text-slate-500 text-sm'>
										<Calendar size={14} />
										<span>Member Since</span>
									</div>
									<p className='font-medium'>{memberSince}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Clinic Information Card (for staff) */}
					{(user.role === "admin" || user.role === "doctor" || user.role === "staff") && (
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Building2 size={18} />
									Clinic Information
								</CardTitle>
								<CardDescription>Your affiliated clinic details</CardDescription>
							</CardHeader>
							<CardContent>
								{clinicLoading ? (
									<div className='space-y-2'>
										<Skeleton className='h-5 w-48' />
										<Skeleton className='h-4 w-64' />
									</div>
								) : clinic ? (
									<div className='space-y-2'>
										<p className='font-semibold text-lg'>{clinic.name}</p>
										{clinic.address && (
											<p className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
												<MapPin size={14} />
												{clinic.address}
											</p>
										)}
										{clinic.phone && (
											<p className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
												<Phone size={14} />
												{clinic.phone}
											</p>
										)}
										{clinic.email && (
											<p className='flex items-center gap-2 text-slate-600 text-sm dark:text-slate-400'>
												<Mail size={14} />
												{clinic.email}
											</p>
										)}
									</div>
								) : (
									<p className='text-slate-500 text-sm'>No clinic information available</p>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Security Tab */}
				<TabsContent
					className='space-y-6'
					value='security'
				>
					<Card>
						<CardHeader>
							<CardTitle>Password & Security</CardTitle>
							<CardDescription>Manage your password and security settings</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Change Password</p>
									<p className='text-slate-500 text-sm'>
										Update your password to keep your account secure
									</p>
								</div>
								<Button
									onClick={() => setIsPasswordOpen(true)}
									variant='outline'
								>
									Change Password
								</Button>
							</div>

							<Separator />

							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Two-Factor Authentication</p>
									<p className='text-slate-500 text-sm'>
										Add an extra layer of security to your account
									</p>
								</div>
								<Button
									disabled
									variant='outline'
								>
									Coming Soon
								</Button>
							</div>

							<Separator />

							<div className='flex items-center justify-between'>
								<div>
									<p className='font-medium'>Active Sessions</p>
									<p className='text-slate-500 text-sm'>Manage devices where you're logged in</p>
								</div>
								<Button
									disabled
									variant='outline'
								>
									Manage Sessions
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Notifications Tab */}
				<TabsContent
					className='space-y-6'
					value='notifications'
				>
					<Card>
						<CardHeader>
							<CardTitle>Notification Preferences</CardTitle>
							<CardDescription>Choose how you want to receive updates</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label className='font-medium'>Email Notifications</Label>
									<p className='text-slate-500 text-sm'>Receive important updates via email</p>
								</div>
								<Switch
									checked={notifications.emailNotifications}
									onCheckedChange={() => handleNotificationChange("emailNotifications")}
								/>
							</div>

							<Separator />

							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label className='font-medium'>SMS Notifications</Label>
									<p className='text-slate-500 text-sm'>Get text message alerts for appointments</p>
								</div>
								<Switch
									checked={notifications.smsNotifications}
									onCheckedChange={() => handleNotificationChange("smsNotifications")}
								/>
							</div>

							<Separator />

							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label className='font-medium'>Appointment Reminders</Label>
									<p className='text-slate-500 text-sm'>Receive reminders before your appointments</p>
								</div>
								<Switch
									checked={notifications.appointmentReminders}
									onCheckedChange={() => handleNotificationChange("appointmentReminders")}
								/>
							</div>

							<Separator />

							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label className='font-medium'>Marketing Communications</Label>
									<p className='text-slate-500 text-sm'>Receive news, offers, and updates</p>
								</div>
								<Switch
									checked={notifications.marketingEmails}
									onCheckedChange={() => handleNotificationChange("marketingEmails")}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit Profile Dialog */}
			<Dialog
				onOpenChange={setIsEditOpen}
				open={isEditOpen}
			>
				<DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
						<DialogDescription>Update your personal information and profile picture</DialogDescription>
					</DialogHeader>

					<div className='space-y-5 py-3'>
						{/* Avatar Section */}
						<div className='space-y-3'>
							<Label>Profile Picture</Label>
							<div className='flex items-center gap-5'>
								<div className='relative'>
									<Avatar className='h-20 w-20 border-2 border-slate-200 dark:border-slate-700'>
										{imagePreview ? (
											<AvatarImage
												alt='Preview'
												src={imagePreview}
											/>
										) : user.image ? (
											<AvatarImage
												alt={user.name}
												src={user.image}
											/>
										) : (
											<AvatarFallback className='bg-primary/10 text-primary text-xl'>
												{user.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										)}
									</Avatar>
									{imagePreview && (
										<button
											className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600'
											onClick={() => {
												setImagePreview(null);
												setCompressedFile(null);
											}}
											type='button'
										>
											<X size={12} />
										</button>
									)}
								</div>
								<div>
									<label className='inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-muted'>
										Upload New Photo
										<input
											accept='image/*'
											className='hidden'
											onChange={handleImageSelect}
											type='file'
										/>
									</label>
									<p className='mt-1 text-muted-foreground text-xs'>JPG, PNG or GIF. Max 5MB.</p>
								</div>
							</div>
						</div>

						<Separator />

						{/* Name Field */}
						<div className='space-y-2'>
							<Label htmlFor='edit-name'>Full Name *</Label>
							<Input
								id='edit-name'
								onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
								placeholder='Your full name'
								value={editForm.name}
							/>
						</div>

						{/* Phone Field */}
						<div className='space-y-2'>
							<Label htmlFor='edit-phone'>Phone Number</Label>
							<Input
								id='edit-phone'
								onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
								placeholder='+1 (555) 000-0000'
								type='tel'
								value={editForm.phone}
							/>
						</div>

						{/* Address Field */}
						<div className='space-y-2'>
							<Label htmlFor='edit-address'>Address</Label>
							<Input
								id='edit-address'
								onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
								placeholder='Your street address'
								value={editForm.address}
							/>
						</div>

						{/* Email is read-only */}
						<div className='space-y-2'>
							<Label htmlFor='edit-email'>Email Address</Label>
							<Input
								className='bg-muted'
								id='edit-email'
								readOnly
								type='email'
								value={user.email}
							/>
							<p className='text-muted-foreground text-xs'>
								Email cannot be changed. Contact support for assistance.
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							disabled={isSaving}
							onClick={() => setIsEditOpen(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isSaving}
							onClick={handleSave}
						>
							{isSaving ? (
								<>Saving...</>
							) : (
								<>
									<Save
										className='mr-2'
										size={14}
									/>
									Save Changes
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Change Password Dialog */}
			<Dialog
				onOpenChange={setIsPasswordOpen}
				open={isPasswordOpen}
			>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Change Password</DialogTitle>
						<DialogDescription>Enter your current password and choose a new one</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-3'>
						<div className='space-y-2'>
							<Label htmlFor='current-password'>Current Password</Label>
							<Input
								id='current-password'
								onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
								type='password'
								value={passwordForm.currentPassword}
							/>
							{passwordErrors.currentPassword && (
								<p className='text-destructive text-sm'>{passwordErrors.currentPassword}</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='new-password'>New Password</Label>
							<Input
								id='new-password'
								onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
								type='password'
								value={passwordForm.newPassword}
							/>
							{passwordErrors.newPassword && (
								<p className='text-destructive text-sm'>{passwordErrors.newPassword}</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='confirm-password'>Confirm New Password</Label>
							<Input
								id='confirm-password'
								onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
								type='password'
								value={passwordForm.confirmPassword}
							/>
							{passwordErrors.confirmPassword && (
								<p className='text-destructive text-sm'>{passwordErrors.confirmPassword}</p>
							)}
						</div>

						<div className='rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30'>
							<p className='text-amber-800 text-xs dark:text-amber-400'>
								Password must be at least 8 characters and include a mix of letters, numbers, and
								symbols.
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							disabled={isChangingPassword}
							onClick={() => setIsPasswordOpen(false)}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							disabled={isChangingPassword}
							onClick={handlePasswordChange}
						>
							{isChangingPassword ? "Changing..." : "Change Password"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
