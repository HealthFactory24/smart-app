import { useSelector } from "@tanstack/react-store";
import * as React from "react";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input"; // Assuming you have a standard Input component

import { createFormField, FormField, FormFieldError, FormFieldSet, useFieldContext } from "../form-context";

interface DateFieldProps
	extends Omit<
		React.ComponentProps<"input">,
		"value" | "onChange" | "onBlur" | "type" // Omit type to lock it down to "date"
	> {
	label: string;
	description?: string;
	required?: boolean;
	min?: string; // e.g., "2026-01-01"
	max?: string; // e.g., "2026-12-31"
}

export function DateField({ label, description, required, min, max, className, ...inputProps }: DateFieldProps) {
	const field = useFieldContext();
	const isTouched = useSelector(field.store, s => s.meta.isTouched);
	const isValid = useSelector(field.store, s => s.meta.isValid);

	// Safely fallback to an empty string so the HTML input stays controlled
	const value = (useSelector(field.store, s => s.value) as string) ?? "";

	return (
		<FormFieldSet>
			<FormField>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && " *"}
				</FieldLabel>

				<Input
					aria-invalid={isTouched && !isValid}
					className={className}
					id={field.name}
					max={max}
					min={min}
					onBlur={field.handleBlur}
					// Directly feed the string value 'YYYY-MM-DD' upstream to the TanStack Store
					onChange={e => field.handleChange(e.target.value)}
					required={required}
					type='date'
					value={value}
					{...inputProps}
				/>

				{description && <FieldDescription>{description}</FieldDescription>}
			</FormField>
			<FormFieldError />
		</FormFieldSet>
	);
}

// Wrap it using your context factory to generate the high-order Form component
export const FormDateField = createFormField(DateField);
