import { useSelector } from "@tanstack/react-store";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { createFormField, FormFieldError, FormFieldSet, useFieldContext } from "../form-context";

type Option = { value: string; label: string };

interface RadioGroupFieldProps {
	label: string;
	description?: string;
	required?: boolean;
	options: Option[];
}

export function RadioGroupField({ label, description, required, options }: RadioGroupFieldProps) {
	const field = useFieldContext();
	const value = useSelector(field.store, s => s.value) as string;

	return (
		<FormFieldSet>
			<FieldLabel>
				{label}
				{required && " *"}
			</FieldLabel>
			{description && <FieldDescription>{description}</FieldDescription>}
			<RadioGroup
				className='flex flex-wrap gap-x-6 gap-y-2'
				onBlur={field.handleBlur}
				onValueChange={field.handleChange}
				value={value}
			>
				{options.map(opt => (
					<div
						className='flex items-center space-x-2'
						key={opt.value}
					>
						<RadioGroupItem
							id={`${field.name}-${opt.value}`}
							value={opt.value}
						/>
						<Label htmlFor={`${field.name}-${opt.value}`}>{opt.label}</Label>
					</div>
				))}
			</RadioGroup>
			<FormFieldError />
		</FormFieldSet>
	);
}

export const FormRadioGroupField = createFormField(RadioGroupField);
