import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "#/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card.tsx";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "#/components/ui/field.tsx";
import { Input } from "#/components/ui/input.tsx";
import { signIn } from "#/lib/auth-client";
import { cn } from "#/lib/utils.ts";

function fieldValidator(schema: z.ZodTypeAny) {
	return ({ value }: { value: unknown }) => {
		const result = schema.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};
}

function FieldMessage({ error }: { error?: string }) {
	if (!error) return null;
	return <p className='text-destructive text-sm'>{error}</p>;
}

const loginSchema = z.object({
	email: z.string().email("Enter a valid email."),
	password: z.string().min(8, "Password must be at least 8 characters.")
});

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			email: "",
			password: ""
		},
		onSubmit: async ({ value }) => {
			const result = loginSchema.safeParse(value);

			if (!result.success) {
				setSubmitError(result.error.issues[0]?.message ?? "Invalid form.");
				return;
			}

			try {
				setSubmitError(null);

				const response = await signIn.email({
					email: value.email,
					password: value.password
				});

				if (response.error) {
					setSubmitError(response.error.message ?? "Could not login.");
					return;
				}
				await router.invalidate(); // Re-run __root beforeLoad to refresh the global session
				toast.success("Logged in successfully.");
				navigate({ to: "/" });
			} catch {
				setSubmitError("Something went wrong. Please try again.");
			}
		}
	});

	return (
		<div
			className={cn("flex flex-col gap-6", className)}
			{...props}
		>
			<Card>
				<CardHeader>
					<CardTitle>Login to your account</CardTitle>
					<CardDescription>Enter your email below to login to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={e => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
							<form.Field
								name='email'
								validators={{
									onChange: fieldValidator(loginSchema.shape.email)
								}}
							>
								{field => (
									<Field>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											onChange={e => field.handleChange(e.target.value)}
											placeholder='m@example.com'
											required
											value={field.state.value}
										/>
										<FieldMessage
											error={
												field.state.meta.isTouched
													? (field.state.meta.errors[0] as string | undefined)
													: undefined
											}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field
								name='password'
								validators={{
									onChange: fieldValidator(loginSchema.shape.password)
								}}
							>
								{field => (
									<Field>
										<div className='flex items-center'>
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>
										</div>
										<Input
											id={field.name}
											name={field.name}
											onChange={e => field.handleChange(e.target.value)}
											required
											type='password'
											value={field.state.value}
										/>
										<FieldMessage
											error={
												field.state.meta.isTouched
													? (field.state.meta.errors[0] as string | undefined)
													: undefined
											}
										/>
									</Field>
								)}
							</form.Field>

							{/* Shows a red error message if the form is invalid or has errors  */}
							<FieldMessage error={submitError ?? undefined} />

							<Field>
								<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
									{([canSubmit, isSubmitting]) => (
										<Button
											disabled={!canSubmit || isSubmitting}
											type='submit'
										>
											{isSubmitting ? "Logging in..." : "Login"}
										</Button>
									)}
								</form.Subscribe>
								<Button
									type='button'
									variant='outline'
								>
									Login with Google
								</Button>
								<FieldDescription className='text-center'>
									Don&apos;t have an account? <Link to='/sign-up'>Sign up</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
