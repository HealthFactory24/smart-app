import { useSelector } from "@tanstack/react-store";

import { FileUploader } from "@/components/file-uploader";
import { FieldDescription, FieldLabel } from "@/components/ui/field";

import { createFormField, FormField, FormFieldError, FormFieldSet, useFieldContext } from "../form-context";

interface FileUploadFieldProps {
	label: string;
	description?: string;
	required?: boolean; // Keep this prop
	maxSize?: number;
	maxFiles?: number;
}

export function FileUploadField({ label, description, required, maxSize, maxFiles }: FileUploadFieldProps) {
	const field = useFieldContext();
	const value = useSelector(field.store, s => s.value) as File[] | undefined;

	return (
		<FormFieldSet>
			<FormField>
				<FieldLabel htmlFor={field.name}>
					{label}
					{required && " *"}
				</FieldLabel>
				<div>
					<FileUploader
						maxFiles={maxFiles}
						maxSize={maxSize}
						onValueChange={field.handleChange}
						value={value}
					/>
				</div>
				{description && <FieldDescription>{description}</FieldDescription>}
			</FormField>
			<FormFieldError />
		</FormFieldSet>
	);
}

export const FormFileUploadField = createFormField(FileUploadField);
