import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { signUp } from "#/lib/auth-client";

const signupSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters."),
		email: z.string().email("Enter a valid email."),
		password: z.string().min(8, "Password must be at least 8 characters."),
		confirmPassword: z.string()
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"]
	});

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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
	const navigate = useNavigate();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: ""
		},
		onSubmit: async ({ value }) => {
			const result = signupSchema.safeParse(value);

			if (!result.success) {
				setSubmitError(result.error.issues[0]?.message ?? "Invalid form.");
				return;
			}

			try {
				setSubmitError(null);

				const response = await signUp.email({
					name: value.name,
					email: value.email,
					password: value.password
				});

				if (response.error) {
					setSubmitError(response.error.message ?? "Could not create account.");
					return;
				}
				await router.invalidate(); // Re-run __root beforeLoad to refresh the global session
				toast.success("Account created successfully.");
				navigate({ to: "/" });
			} catch {
				setSubmitError("Something went wrong. Please try again.");
			}
		}
	});

	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle>Create an account</CardTitle>
				<CardDescription>Enter your information below to create your account</CardDescription>
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
							name='name'
							validators={{
								onChange: fieldValidator(signupSchema.shape.name)
							}}
						>
							{field => (
								<Field>
									<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										onChange={e => field.handleChange(e.target.value)}
										placeholder='John Doe'
										type='text'
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
							name='email'
							validators={{
								onChange: fieldValidator(signupSchema.shape.email)
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
										type='email'
										value={field.state.value}
									/>
									<FieldDescription>We&apos;ll use this to contact you.</FieldDescription>
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
								onChange: fieldValidator(signupSchema.shape.password)
							}}
						>
							{field => (
								<Field>
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										onChange={e => field.handleChange(e.target.value)}
										type='password'
										value={field.state.value}
									/>
									<FieldDescription>Must be at least 8 characters long.</FieldDescription>
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
							name='confirmPassword'
							validators={{
								onChangeListenTo: ["password"],
								onChange: ({ value, fieldApi }) => {
									const password = fieldApi.form.getFieldValue("password");

									if (value !== password) {
										return "Passwords do not match.";
									}

									return undefined;
								}
							}}
						>
							{field => (
								<Field>
									<FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										onChange={e => field.handleChange(e.target.value)}
										type='password'
										value={field.state.value}
									/>
									<FieldDescription>Please confirm your password.</FieldDescription>
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

						<FieldMessage error={submitError ?? undefined} />

						<FieldGroup>
							<Field>
								<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
									{([canSubmit, isSubmitting]) => (
										<Button
											disabled={!canSubmit || isSubmitting}
											type='submit'
										>
											{isSubmitting ? "Creating..." : "Create Account"}
										</Button>
									)}
								</form.Subscribe>

								<Button
									type='button'
									variant='outline'
								>
									Sign up with Google
								</Button>

								<FieldDescription className='px-6 text-center'>
									Already have an account?{" "}
									<Link
										className='underline'
										to='/sign-in'
									>
										Sign in
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
