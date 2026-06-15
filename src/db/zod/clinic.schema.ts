import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import { z } from "zod";

import {
	actionTypeEnum,
	adverseEvent,
	alert,
	appointment,
	appointmentStatusEnum,
	availabilityStatusEnum,
	bloodGroupEnum,
	breastEnum,
	clinic,
	clinicMember,
	clinicSetting,
	configStore,
	type DbDrug,
	type DbPrescribedItem,
	type DbPrescription,
	developmentalCheck,
	developmentalMilestones,
	diagnosis,
	doctor,
	doctorTypeEnum,
	doseGuideline,
	drug,
	drugRouteEnum,
	feedingLog,
	feedingTypeEnum,
	file,
	fileUpload,
	folder,
	frequencyEnum,
	genderEnum,
	growthRecord,
	guardian,
	immunization,
	immunizationStatusEnum,
	invite,
	labTest,
	labTestStatusEnum,
	maritalStatusEnum,
	measurementTypeEnum,
	medicalRecord,
	medicationDispense,
	notification,
	notificationPriorityEnum,
	notificationStatusEnum,
	nutritionalAssessment,
	nutritionalStatusEnum,
	patient,
	patientBill,
	payment,
	paymentMethodEnum,
	paymentStatusEnum,
	prescribedItem,
	prescription,
	prescriptionLog,
	prescriptionStatusEnum,
	rating,
	reminder,
	reminderMethodEnum,
	reminderStatusEnum,
	roleEnum,
	service,
	severityEnum,
	staff,
	statusEnum,
	todo,
	userQuota,
	vaccineInventory,
	vaccineSchedule,
	vitalSign,
	weekdayEnum,
	whoGrowthStandard,
	workingDay
} from "../schema";
import { UserSchema } from "./auth.schema";

// System Schemas
export const UserQuotaSchema = createSelectSchema(userQuota);
export const UserQuotaCreateSchema = createInsertSchema(userQuota);
export const UserQuotaUpdateSchema = createUpdateSchema(userQuota);
export type UserQuotaCreateInput = z.infer<typeof UserQuotaCreateSchema>;
export type UserQuotaUpdateInput = z.infer<typeof UserQuotaUpdateSchema>;
export const FolderSchema = createSelectSchema(folder);
export const FolderCreateSchema = createInsertSchema(folder);
export const FolderUpdateSchema = createUpdateSchema(folder);

export const FileSchema = createSelectSchema(file);
export const FileCreateSchema = createInsertSchema(file);
export const FileUpdateSchema = createUpdateSchema(file);

export const ConfigStoreSchema = createSelectSchema(configStore);
export const ConfigStoreCreateSchema = createInsertSchema(configStore);
export const ConfigStoreUpdateSchema = createUpdateSchema(configStore);

export const InviteSchema = createSelectSchema(invite);
export const InviteCreateSchema = createInsertSchema(invite);
export const InviteUpdateSchema = createUpdateSchema(invite);

// Clinic Management Schemas
export const ClinicSchema = createSelectSchema(clinic);
export const ClinicCreateSchema = createInsertSchema(clinic);
export const ClinicUpdateSchema = createUpdateSchema(clinic);
export type ClinicCreateInput = z.infer<typeof ClinicCreateSchema>;
export type ClinicUpdateInput = z.infer<typeof ClinicUpdateSchema>;

export const ClinicMemberSchema = createSelectSchema(clinicMember);
export const ClinicMemberCreateSchema = createInsertSchema(clinicMember);
export const ClinicMemberUpdateSchema = createUpdateSchema(clinicMember);
export type ClinicMemberCreateInput = z.infer<typeof ClinicMemberCreateSchema>;
export type ClinicMemberUpdateInput = z.infer<typeof ClinicMemberUpdateSchema>;
export const ClinicSettingSchema = createSelectSchema(clinicSetting);
export const ClinicSettingCreateSchema = createInsertSchema(clinicSetting);
export const ClinicSettingUpdateSchema = createUpdateSchema(clinicSetting);

// Staff Schemas
export const DoctorSchema = createSelectSchema(doctor);
export const DoctorCreateSchema = createInsertSchema(doctor);
export const DoctorUpdateSchema = createUpdateSchema(doctor);
export type DoctorCreateInput = z.infer<typeof DoctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof DoctorUpdateSchema>;

export const StaffSchema = createSelectSchema(staff);
export const StaffCreateSchema = createInsertSchema(staff);
export const StaffUpdateSchema = createUpdateSchema(staff);
export type StaffCreateInput = z.infer<typeof StaffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof StaffUpdateSchema>;
export const WorkingDaySchema = createSelectSchema(workingDay);
export const WorkingDayCreateSchema = createInsertSchema(workingDay);
export const WorkingDayUpdateSchema = createUpdateSchema(workingDay);
export type WorkingDayCreateInput = z.infer<typeof WorkingDayCreateSchema>;
export type WorkingDayUpdateInput = z.infer<typeof WorkingDayUpdateSchema>;
export const NutritionalAssessmentCreateSchema = createInsertSchema(nutritionalAssessment);
export const NutritionalAssessmentUpdateSchema = createUpdateSchema(nutritionalAssessment);
export type NutritionalAssessmentCreateInput = z.infer<typeof NutritionalAssessmentCreateSchema>;
export type NutritionalAssessmentUpdateInput = z.infer<typeof NutritionalAssessmentUpdateSchema>;
// Patient Schemas
export const PatientSchema = createSelectSchema(patient);
export const PatientCreateSchema = createInsertSchema(patient);
export const PatientUpdateSchema = createUpdateSchema(patient);
export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;

export const GuardianSchema = createSelectSchema(guardian);
export const GuardianCreateSchema = createInsertSchema(guardian);
export const GuardianUpdateSchema = createUpdateSchema(guardian);
export type GuardianCreateInput = z.infer<typeof GuardianCreateSchema>;
export type GuardianUpdateInput = z.infer<typeof GuardianUpdateSchema>;

// Appointment & Medical Schemas
export const AppointmentSchema = createSelectSchema(appointment);
export const AppointmentCreateSchema = createInsertSchema(appointment);
export const AppointmentUpdateSchema = createUpdateSchema(appointment);
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>;
export const MedicalRecordSchema = createSelectSchema(medicalRecord);
export const MedicalRecordCreateSchema = createInsertSchema(medicalRecord);
export const MedicalRecordUpdateSchema = createUpdateSchema(medicalRecord);
export type MedicalRecordCreateInput = z.infer<typeof MedicalRecordCreateSchema>;
export type MedicalRecordUpdateInput = z.infer<typeof MedicalRecordUpdateSchema>;

export const DiagnosisSchema = createSelectSchema(diagnosis);
export const DiagnosisCreateSchema = createInsertSchema(diagnosis);
export const DiagnosisUpdateSchema = createUpdateSchema(diagnosis);
export type DiagnosisCreateInput = z.infer<typeof DiagnosisCreateSchema>;
export type DiagnosisUpdateInput = z.infer<typeof DiagnosisUpdateSchema>;
export const VitalSignSchema = createSelectSchema(vitalSign);
export const VitalSignCreateSchema = createInsertSchema(vitalSign);
export const VitalSignUpdateSchema = createUpdateSchema(vitalSign);
export type VitalSignCreateInput = z.infer<typeof VitalSignCreateSchema>;
export type VitalSignUpdateInput = z.infer<typeof VitalSignUpdateSchema>;
// Growth & Development Schemas
export const GrowthRecordSchema = createSelectSchema(growthRecord);
export const GrowthRecordCreateSchema = createInsertSchema(growthRecord);
export const GrowthRecordUpdateSchema = createUpdateSchema(growthRecord);

export const WhoGrowthStandardSchema = createSelectSchema(whoGrowthStandard);
export const WhoGrowthStandardCreateSchema = createInsertSchema(whoGrowthStandard);
export const WhoGrowthStandardUpdateSchema = createUpdateSchema(whoGrowthStandard);

export const DevelopmentalMilestonesSchema = createSelectSchema(developmentalMilestones);
export const DevelopmentalMilestonesCreateSchema = createInsertSchema(developmentalMilestones);
export const DevelopmentalMilestonesUpdateSchema = createUpdateSchema(developmentalMilestones);
export type DevelopmentalMilestonesCreateInput = z.infer<typeof DevelopmentalMilestonesCreateSchema>;
export type DevelopmentalMilestonesUpdateInput = z.infer<typeof DevelopmentalMilestonesUpdateSchema>;
export const DevelopmentalCheckSchema = createSelectSchema(developmentalCheck);
export const DevelopmentalCheckCreateSchema = createInsertSchema(developmentalCheck);
export const DevelopmentalCheckUpdateSchema = createUpdateSchema(developmentalCheck);

export const FeedingLogSchema = createSelectSchema(feedingLog);
export const FeedingLogCreateSchema = createInsertSchema(feedingLog);
export const FeedingLogUpdateSchema = createUpdateSchema(feedingLog);
export type FeedingLogCreateInput = z.infer<typeof FeedingLogCreateSchema>;
export type FeedingLogUpdateInput = z.infer<typeof FeedingLogUpdateSchema>;
// Immunization Schemas
export const ImmunizationSchema = createSelectSchema(immunization);
export const ImmunizationCreateSchema = createInsertSchema(immunization);
export const ImmunizationUpdateSchema = createUpdateSchema(immunization);
export type ImmunizationCreateInput = z.infer<typeof ImmunizationCreateSchema>;
export type ImmunizationUpdateInput = z.infer<typeof ImmunizationUpdateSchema>;

export const VaccineScheduleSchema = createSelectSchema(vaccineSchedule);
export const VaccineScheduleCreateSchema = createInsertSchema(vaccineSchedule);
export const VaccineScheduleUpdateSchema = createUpdateSchema(vaccineSchedule);
export type VaccineScheduleCreateInput = z.infer<typeof VaccineScheduleCreateSchema>;
export type VaccineScheduleUpdateInput = z.infer<typeof VaccineScheduleUpdateSchema>;

export const VaccineInventorySchema = createSelectSchema(vaccineInventory);
export const VaccineInventoryCreateSchema = createInsertSchema(vaccineInventory);
export const VaccineInventoryUpdateSchema = createUpdateSchema(vaccineInventory);
export type VaccineInventoryUpdateInput = z.infer<typeof VaccineInventoryUpdateSchema>;
export type VaccineInventoryCreateInput = z.infer<typeof VaccineInventoryCreateSchema>;

export const AdverseEventSchema = createSelectSchema(adverseEvent);
export const AdverseEventCreateSchema = createInsertSchema(adverseEvent);
export const AdverseEventUpdateSchema = createUpdateSchema(adverseEvent);
export type AdverseEventCreateInput = z.infer<typeof AdverseEventCreateSchema>;
export type AdverseEventUpdateInput = z.infer<typeof AdverseEventUpdateSchema>;
// Medication Schemas
export const DrugSchema = createSelectSchema(drug);
export const DrugCreateSchema = createInsertSchema(drug);
export const DrugUpdateSchema = createUpdateSchema(drug);
export type DrugCreateInput = z.infer<typeof DrugCreateSchema>;
export type DrugUpdateInput = z.infer<typeof DrugUpdateSchema>;
export const DoseGuidelineSchema = createSelectSchema(doseGuideline);
export const DoseGuidelineCreateSchema = createInsertSchema(doseGuideline);
export const DoseGuidelineUpdateSchema = createUpdateSchema(doseGuideline);
export type DoseGuidelineCreateInput = z.infer<typeof DoseGuidelineCreateSchema>;
export type DoseGuidelineUpdateInput = z.infer<typeof DoseGuidelineUpdateSchema>;
export const PrescriptionSchema = createSelectSchema(prescription);
export const PrescriptionCreateSchema = createInsertSchema(prescription);
export const PrescriptionUpdateSchema = createUpdateSchema(prescription);
export type PrescriptionCreateInput = z.infer<typeof PrescriptionCreateSchema>;
export type PrescriptionUpdateInput = z.infer<typeof PrescriptionUpdateSchema>;
export const PrescribedItemSchema = createSelectSchema(prescribedItem);
export const PrescribedItemCreateSchema = createInsertSchema(prescribedItem);
export const PrescribedItemUpdateSchema = createUpdateSchema(prescribedItem);
export type PrescribedItemCreateInput = z.infer<typeof PrescribedItemCreateSchema>;
export type PrescribedItemUpdateInput = z.infer<typeof PrescribedItemUpdateSchema>;
export const MedicationDispenseSchema = createSelectSchema(medicationDispense);
export const MedicationDispenseCreateSchema = createInsertSchema(medicationDispense);
export const MedicationDispenseUpdateSchema = createUpdateSchema(medicationDispense);
export type MedicationDispenseCreateInput = z.infer<typeof MedicationDispenseCreateSchema>;
export type MedicationDispenseUpdateInput = z.infer<typeof MedicationDispenseUpdateSchema>;
export const PrescriptionLogSchema = createSelectSchema(prescriptionLog);
export const PrescriptionLogCreateSchema = createInsertSchema(prescriptionLog);
export const PrescriptionLogUpdateSchema = createUpdateSchema(prescriptionLog);
export type PrescriptionLogCreateInput = z.infer<typeof PrescriptionLogCreateSchema>;
export type PrescriptionLogUpdateInput = z.infer<typeof PrescriptionLogUpdateSchema>;
// Service & Billing Schemas
export const ServiceSchema = createSelectSchema(service);
export const ServiceCreateSchema = createInsertSchema(service);
export const ServiceUpdateSchema = createUpdateSchema(service);
export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;

export const LabTestSchema = createSelectSchema(labTest);
export const LabTestCreateSchema = createInsertSchema(labTest);
export const LabTestUpdateSchema = createUpdateSchema(labTest);
export type LabTestCreateInput = z.infer<typeof LabTestCreateSchema>;
export type LabTestUpdateInput = z.infer<typeof LabTestUpdateSchema>;

export const PaymentSchema = createSelectSchema(payment);
export const PaymentCreateSchema = createInsertSchema(payment);
export const PaymentUpdateSchema = createUpdateSchema(payment);
export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>;
export const PatientBillSchema = createSelectSchema(patientBill);
export const PatientBillCreateSchema = createInsertSchema(patientBill);
export const PatientBillUpdateSchema = createUpdateSchema(patientBill);
export type PatientBillCreateInput = z.infer<typeof PatientBillCreateSchema>;
export type PatientBillUpdateInput = z.infer<typeof PatientBillUpdateSchema>;

// Communication Schemas
export const ReminderSchema = createSelectSchema(reminder);
export const ReminderCreateSchema = createInsertSchema(reminder);
export const ReminderUpdateSchema = createUpdateSchema(reminder);
export type ReminderCreateInput = z.infer<typeof ReminderCreateSchema>;

export const NotificationSchema = createSelectSchema(notification);
export const NotificationCreateSchema = createInsertSchema(notification);
export const NotificationUpdateSchema = createUpdateSchema(notification);
// File & Rating Schemas
export const FileUploadSchema = createSelectSchema(fileUpload);
export const FileUploadCreateSchema = createInsertSchema(fileUpload);
export const FileUploadUpdateSchema = createUpdateSchema(fileUpload);

export const RatingSchema = createSelectSchema(rating);
export const RatingCreateSchema = createInsertSchema(rating);
export const RatingUpdateSchema = createUpdateSchema(rating);
export type RatingCreateInput = z.infer<typeof RatingCreateSchema>;
export type RatingUpdateInput = z.infer<typeof RatingUpdateSchema>;

// Utility Schemas
export const TodoSchema = createSelectSchema(todo);
export const TodoCreateSchema = createInsertSchema(todo);
export const TodoUpdateSchema = createUpdateSchema(todo);

export const AlertSchema = createSelectSchema(alert);
export const AlertCreateSchema = createInsertSchema(alert);
export const AlertUpdateSchema = createUpdateSchema(alert);

// =======================
// ENHANCED SCHEMAS WITH CUSTOM VALIDATION
// =======================

// Time validation regex
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// User Quota Schema with enhanced validation
export const UserQuotaEnhancedCreateSchema = createInsertSchema(userQuota, {
	userId: z.string().min(1, "User ID is required"),
	quota: z.number().int().min(0, "Quota must be non-negative"),
	usedQuota: z.number().int().min(0, "Used quota must be non-negative"),
	fileCount: z.number().int().min(0, "File count must be non-negative"),
	fileCountQuota: z.number().int().min(0, "File count quota must be non-negative"),
	inviteCount: z.number().int().min(0, "Invite count must be non-negative"),
	inviteQuota: z.number().int().min(0, "Invite quota must be non-negative")
}).omit({ updatedAt: true });

export const UserQuotaEnhancedUpdateSchema = UserQuotaEnhancedCreateSchema.safeExtend({
	userId: z.string().min(1, "User ID is required")
});

// Folder Schema with enhanced validation
export const FolderEnhancedCreateSchema = createInsertSchema(folder)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		userId: true,
		name: true,
		parentId: true
	})
	.extend({
		id: z.string().min(1, "Folder ID is required"),
		userId: z.string().min(1, "User ID is required"),
		name: z.string().min(1, "Folder name is required").max(255, "Folder name too long"),
		parentId: z.string().nullable().optional()
	});

export const FolderEnhancedUpdateSchema = FolderEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Folder ID is required")
});

// File Schema with enhanced validation
export const FileEnhancedCreateSchema = createInsertSchema(file)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		slug: true,
		userId: true,
		folderId: true,
		filename: true,
		searchText: true,
		size: true,
		mimeType: true
	})
	.extend({
		id: z.string().min(1, "File ID is required"),
		slug: z.string().min(1, "File slug is required"),
		userId: z.string().min(1, "User ID is required"),
		folderId: z.string().nullable().optional(),
		filename: z.string().min(1, "Filename is required"),
		searchText: z.string().default(""),
		size: z.number().int().min(0, "File size must be non-negative"),
		mimeType: z.string().min(1, "MIME type is required")
	});

export const FileEnhancedUpdateSchema = FileEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "File ID is required")
});

// Clinic Schema with enhanced validation
export const ClinicEnhancedCreateSchema = createInsertSchema(clinic)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		name: true,
		email: true,
		timezone: true,
		address: true,
		phone: true,
		deletedAt: true,
		isDeleted: true
	})
	.extend({
		id: z.string().min(1, "Clinic ID is required"),
		name: z.string().min(1, "Clinic name is required").max(255, "Clinic name too long"),
		email: z.email("Invalid email format").nullable().optional(),
		timezone: z.string().min(1, "Timezone is required"),
		address: z.string().nullable().optional(),
		phone: z.string().nullable().optional(),
		deletedAt: z.date().nullable().optional(),
		isDeleted: z.boolean().default(false)
	});

export const ClinicEnhancedUpdateSchema = ClinicEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Clinic ID is required")
});

// Doctor Schema with enhanced validation
export const DoctorEnhancedCreateSchema = createInsertSchema(doctor)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		name: true,
		specialty: true,
		email: true,
		userId: true,
		clinicId: true,
		licenseNumber: true,
		phone: true,
		address: true,
		department: true,
		img: true,
		colorCode: true,
		availabilityStatus: true,
		availableFromWeekDay: true,
		availableToWeekDay: true,
		isActive: true,
		status: true,
		availableFromTime: true,
		availableToTime: true,
		type: true,
		appointmentPrice: true,
		role: true,
		rating: true,
		deletedAt: true,
		isDeleted: true
	})
	.extend({
		id: z.string().min(1, "Doctor ID is required"),
		email: z.email("Invalid email format").nullable().optional(),
		name: z.string().min(1, "Doctor name is required"),
		userId: z.string().nullable().optional(),
		clinicId: z.string().nullable().optional(),
		specialty: z.string().min(1, "Specialty is required"),
		licenseNumber: z.string().nullable().optional(),
		phone: z.string().nullable().optional(),
		address: z.string().nullable().optional(),
		department: z.string().nullable().optional(),
		img: z.string().url("Invalid image URL").nullable().optional(),
		colorCode: z
			.string()
			.regex(/^#[0-9A-F]{6}$/i, "Invalid color code")
			.nullable()
			.optional(),
		availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).nullable().optional(),
		availableFromWeekDay: z
			.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
			.nullable()
			.optional(),
		availableToWeekDay: z
			.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
			.nullable()
			.optional(),
		isActive: z.boolean().nullable().optional(),
		status: z
			.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
			.nullable()
			.optional(),
		availableFromTime: z.string().regex(TIME_REGEX, "Invalid time format").nullable().optional(),
		availableToTime: z.string().regex(TIME_REGEX, "Invalid time format").nullable().optional(),
		type: z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]).default("FULL"),
		appointmentPrice: z.number().int().min(0, "Price must be non-negative").nullable().optional(),
		role: z.enum(["admin", "doctor", "staff", "patient"]).nullable().optional(),
		rating: z.number().int().min(0).max(5, "Rating must be between 0 and 5").nullable().optional(),
		deletedAt: z.date().nullable().optional(),
		isDeleted: z.boolean().default(false)
	});

export const DoctorEnhancedUpdateSchema = DoctorEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Doctor ID is required")
});

// Working Day Schema with enhanced validation
const WorkingDayBaseSchema = createInsertSchema(workingDay)
	.omit({
		createdAt: true,
		updatedAt: true,
		id: true,
		doctorId: true,
		day: true,
		startTime: true,
		endTime: true
	})
	.extend({
		id: z.string().min(1, "Working day ID is required"),
		doctorId: z.string().min(1, "Doctor ID is required"),
		day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
		startTime: z.string().regex(TIME_REGEX, "Invalid start time format"),
		endTime: z.string().regex(TIME_REGEX, "Invalid end time format")
	});

export const WorkingDayEnhancedCreateSchema = WorkingDayBaseSchema.refine(data => data.startTime < data.endTime, {
	message: "Start time must be before end time",
	path: ["endTime"]
});

export const WorkingDayEnhancedUpdateSchema = WorkingDayEnhancedCreateSchema.safeExtend({
	id: z.string().min(1, "Working day ID is required")
});

// =======================
// QUERY SCHEMAS FOR FILTERING AND PAGINATION
// =======================

export const PatientListQuerySchema = z.object({
	clinicId: z.string().optional(),
	search: z.string().optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
		.optional(),
	gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
	bloodGroup: z
		.enum([
			"A_POSITIVE",
			"A_NEGATIVE",
			"B_POSITIVE",
			"B_NEGATIVE",
			"O_POSITIVE",
			"O_NEGATIVE",
			"AB_POSITIVE",
			"AB_NEGATIVE"
		])
		.optional(),
	ageMin: z.number().int().min(0).optional(),
	ageMax: z.number().int().min(0).optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["firstName", "lastName", "dateOfBirth", "createdAt"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export const AppointmentListQuerySchema = z.object({
	clinicId: z.string().optional(),
	doctorId: z.string().optional(),
	patientId: z.string().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
	appointmentDate: z.date().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	type: z.string().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["appointmentDate", "createdAt", "status"]).default("appointmentDate"),
	sortOrder: z.enum(["asc", "desc"]).default("asc")
});

export const DoctorListQuerySchema = z.object({
	clinicId: z.string().optional(),
	specialty: z.string().optional(),
	status: z
		.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
		.optional(),
	availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]).optional(),
	type: z.enum(["FULL", "PART_TIME", "CONSULTANT", "VISITING"]).optional(),
	search: z.string().optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["name", "specialty", "rating", "createdAt"]).default("name"),
	sortOrder: z.enum(["asc", "desc"]).default("asc")
});

export const PaymentListQuerySchema = z.object({
	clinicId: z.string().optional(),
	patientId: z.string().optional(),
	status: z.enum(["PAID", "UNPAID", "PENDING", "REFUNDED", "PARTIAL"]).optional(),
	paymentMethod: z.enum(["CASH", "CARD", "INSURANCE", "BANK_TRANSFER", "MOBILE_MONEY"]).optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	minAmount: z.number().int().min(0).optional(),
	maxAmount: z.number().int().min(0).optional(),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.enum(["billDate", "paymentDate", "amount", "status"]).default("billDate"),
	sortOrder: z.enum(["asc", "desc"]).default("desc")
});

// =======================
// BULK OPERATION SCHEMAS
// =======================

export const BulkPatientUpdateSchema = z.object({
	patientIds: z.array(z.string().min(1)).min(1, "At least one patient ID is required"),
	updates: z
		.object({
			status: z
				.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED", "COMPLETED", "CANCELLED", "EXPIRED", "ON_HOLD"])
				.optional(),
			isActive: z.boolean().optional(),
			updatedById: z.string().optional()
		})
		.refine(data => Object.keys(data).length > 0, {
			message: "At least one field must be updated"
		})
});

export const BulkAppointmentUpdateSchema = z.object({
	appointmentIds: z.array(z.string().min(1)).min(1, "At least one appointment ID is required"),
	updates: z
		.object({
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
			doctorId: z.string().optional(),
			appointmentDate: z.date().optional()
		})
		.refine(data => Object.keys(data).length > 0, {
			message: "At least one field must be updated"
		})
});

export const PatientBillReorderSchema = z
	.array(
		z.object({
			id: z.string().min(1, "Bill ID is required"),
			order: z.number().int().min(0, "Order must be non-negative")
		})
	)
	.min(1, "At least one bill item is required");
// =======================
// TYPE EXPORTS (Inferred from schemas)
// =======================

export type UserQuota = z.infer<typeof UserQuotaSchema>;
export type Folder = z.infer<typeof FolderSchema>;
export type File = z.infer<typeof FileSchema>;
export type ConfigStore = z.infer<typeof ConfigStoreSchema>;
export type Invite = z.infer<typeof InviteSchema>;

// Clinic Types
export type Clinic = z.infer<typeof ClinicSchema>;
export type ClinicMember = z.infer<typeof ClinicMemberSchema>;
export type ClinicSetting = z.infer<typeof ClinicSettingSchema>;

// Staff Types
export type Doctor = z.infer<typeof DoctorSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type WorkingDay = z.infer<typeof WorkingDaySchema>;

// Patient Types
export type Patient = z.infer<typeof PatientSchema>;
export type Guardian = z.infer<typeof GuardianSchema>;

// Medical Types
export type Appointment = z.infer<typeof AppointmentSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
export type VitalSign = z.infer<typeof VitalSignSchema>;

// Growth & Development Types
export type GrowthRecord = z.infer<typeof GrowthRecordSchema>;
export type WhoGrowthStandard = z.infer<typeof WhoGrowthStandardSchema>;
export type DevelopmentalMilestones = z.infer<typeof DevelopmentalMilestonesSchema>;
export type DevelopmentalCheck = z.infer<typeof DevelopmentalCheckSchema>;
export type FeedingLog = z.infer<typeof FeedingLogSchema>;

// Immunization Types
export type Immunization = z.infer<typeof ImmunizationSchema>;
export type VaccineSchedule = z.infer<typeof VaccineScheduleSchema>;
export type VaccineInventory = z.infer<typeof VaccineInventorySchema>;
export type AdverseEvent = z.infer<typeof AdverseEventSchema>;

// Medication Types
export type Drug = z.infer<typeof DrugSchema>;
export type DoseGuideline = z.infer<typeof DoseGuidelineSchema>;
export type Prescription = z.infer<typeof PrescriptionSchema>;
export type PrescribedItem = z.infer<typeof PrescribedItemSchema>;
export type MedicationDispense = z.infer<typeof MedicationDispenseSchema>;
export type PrescriptionLog = z.infer<typeof PrescriptionLogSchema>;

// Communication Types
export type Reminder = z.infer<typeof ReminderSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

// Utility Types
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Todo = z.infer<typeof TodoSchema>;
export type Alert = z.infer<typeof AlertSchema>;

// Enhanced Input Types
export type UserQuotaEnhancedCreateInput = z.infer<typeof UserQuotaEnhancedCreateSchema>;
export type UserQuotaEnhancedUpdateInput = z.infer<typeof UserQuotaEnhancedUpdateSchema>;
export type FolderEnhancedCreateInput = z.infer<typeof FolderEnhancedCreateSchema>;
export type FolderEnhancedUpdateInput = z.infer<typeof FolderEnhancedUpdateSchema>;
export type FileEnhancedCreateInput = z.infer<typeof FileEnhancedCreateSchema>;
export type FileEnhancedUpdateInput = z.infer<typeof FileEnhancedUpdateSchema>;
export type ClinicEnhancedCreateInput = z.infer<typeof ClinicEnhancedCreateSchema>;
export type ClinicEnhancedUpdateInput = z.infer<typeof ClinicEnhancedUpdateSchema>;
export type DoctorEnhancedCreateInput = z.infer<typeof DoctorEnhancedCreateSchema>;
export type DoctorEnhancedUpdateInput = z.infer<typeof DoctorEnhancedUpdateSchema>;
export type WorkingDayEnhancedCreateInput = z.infer<typeof WorkingDayEnhancedCreateSchema>;
export type WorkingDayEnhancedUpdateInput = z.infer<typeof WorkingDayEnhancedUpdateSchema>;

// Query Types
export type PatientListQuery = z.infer<typeof PatientListQuerySchema>;
export type AppointmentListQuery = z.infer<typeof AppointmentListQuerySchema>;
export type DoctorListQuery = z.infer<typeof DoctorListQuerySchema>;
export type PaymentListQuery = z.infer<typeof PaymentListQuerySchema>;

// Bulk Operation Types
export type BulkPatientUpdateInput = z.infer<typeof BulkPatientUpdateSchema>;
export type BulkAppointmentUpdateInput = z.infer<typeof BulkAppointmentUpdateSchema>;
export type PatientBillReorder = z.infer<typeof PatientBillReorderSchema>;
// Service & Billing Types
export type Service = z.infer<typeof ServiceSchema>;
export type LabTest = z.infer<typeof LabTestSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type PatientBill = z.infer<typeof PatientBillSchema>;

export const RoleSchema = z.enum(roleEnum.enumValues);
export const StatusSchema = z.enum(statusEnum.enumValues);
export const AppointmentStatusSchema = z.enum(appointmentStatusEnum.enumValues);
export const GenderSchema = z.enum(genderEnum.enumValues);
export const BloodGroupSchema = z.enum(bloodGroupEnum.enumValues);
export const MaritalStatusSchema = z.enum(maritalStatusEnum.enumValues);
export const NutritionalStatusSchema = z.enum(nutritionalStatusEnum.enumValues);
export const DoctorTypeSchema = z.enum(doctorTypeEnum.enumValues);
export const PaymentStatusSchema = z.enum(paymentStatusEnum.enumValues);
export const PaymentMethodSchema = z.enum(paymentMethodEnum.enumValues);
export const AvailabilityStatusSchema = z.enum(availabilityStatusEnum.enumValues);
export const NotificationStatusSchema = z.enum(notificationStatusEnum.enumValues);
export const NotificationPrioritySchema = z.enum(notificationPriorityEnum.enumValues);
export const ImmunizationStatusSchema = z.enum(immunizationStatusEnum.enumValues);
export const PrescriptionStatusSchema = z.enum(prescriptionStatusEnum.enumValues);
export const WeekdaySchema = z.enum(weekdayEnum.enumValues);
export const MeasurementTypeSchema = z.enum(measurementTypeEnum.enumValues);
export const FeedingTypeSchema = z.enum(feedingTypeEnum.enumValues);
export const BreastSchema = z.enum(breastEnum.enumValues);
export const DrugRouteSchema = z.enum(drugRouteEnum.enumValues);
export const FrequencySchema = z.enum(frequencyEnum.enumValues);
export const ReminderMethodSchema = z.enum(reminderMethodEnum.enumValues);
export const ReminderStatusSchema = z.enum(reminderStatusEnum.enumValues);
export const LabTestStatusSchema = z.enum(labTestStatusEnum.enumValues);
export const SeveritySchema = z.enum(severityEnum.enumValues);
export const ActionTypeSchema = z.enum(actionTypeEnum.enumValues);

export type Role = z.infer<typeof RoleSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type Gender = z.infer<typeof GenderSchema>;
export type BloodGroup = z.infer<typeof BloodGroupSchema>;
export type MaritalStatus = z.infer<typeof MaritalStatusSchema>;
export type NutritionalStatus = z.infer<typeof NutritionalStatusSchema>;
export type DoctorType = z.infer<typeof DoctorTypeSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type ImmunizationStatus = z.infer<typeof ImmunizationStatusSchema>;
export type PrescriptionStatus = z.infer<typeof PrescriptionStatusSchema>;
export type Weekday = z.infer<typeof WeekdaySchema>;
export type MeasurementType = z.infer<typeof MeasurementTypeSchema>;
export type FeedingType = z.infer<typeof FeedingTypeSchema>;
export type Breast = z.infer<typeof BreastSchema>;
export type DrugRoute = z.infer<typeof DrugRouteSchema>;
export type Frequency = z.infer<typeof FrequencySchema>;
export type ReminderMethod = z.infer<typeof ReminderMethodSchema>;
export type ReminderStatus = z.infer<typeof ReminderStatusSchema>;
export type LabTestStatus = z.infer<typeof LabTestStatusSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;

export type AdherenceItem = DbPrescribedItem & {
	prescription?: DbPrescription | null;
	dispenses?: {
		quantityDispensed: number;
	}[];
	dosageValue: number | null;
	frequency: string;
};

// Helper functions
export function calculateAdherenceMetrics(prescribedItems: AdherenceItem[]) {
	let totalAdherence = 0;
	let count = 0;

	for (const item of prescribedItems) {
		const expectedDoses = calculateExpectedDoses(
			item,
			item.prescription?.issuedDate ?? new Date(),
			item.prescription?.validUntil ?? new Date()
		);
		const dispensedDoses =
			item.dispenses?.reduce(
				(sum: number, dispense: { quantityDispensed: number }) =>
					sum + dispense.quantityDispensed / (item.dosageValue || 1),
				0
			) ?? 0;

		const adherence = expectedDoses > 0 ? (dispensedDoses / expectedDoses) * 100 : 0;
		totalAdherence += adherence;
		count++;
	}

	return {
		overallAdherence: count > 0 ? totalAdherence / count : 0,
		status: getAdherenceStatus(totalAdherence / count)
	};
}

function getAdherenceStatus(percentage: number): "GOOD" | "FAIR" | "POOR" {
	if (percentage >= 80) return "GOOD";
	if (percentage >= 50) return "FAIR";
	return "POOR";
}

export function calculateExpectedDoses(item: AdherenceItem, startDate: Date, endDate: Date) {
	const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
	const frequencyPerDay = parseFrequency(item.frequency);
	return days * frequencyPerDay * (item.dosageValue || 1);
}
export type PrescriptionWithItems = DbPrescription & {
	prescribedItems: (DbPrescribedItem & {
		drug?: DbDrug | null;
	})[];
};

function parseFrequency(frequency: string): number {
	const f = frequency.toUpperCase();
	if (f.includes("QD") || f.includes("ONCE")) return 1;
	if (f.includes("BID") || f.includes("TWICE")) return 2;
	if (f.includes("TID") || f.includes("THREE")) return 3;
	if (f.includes("QID") || f.includes("FOUR")) return 4;
	if (f.includes("QHS")) return 1;
	return 1;
}

export const createCompleteEncounterSchema = z.object({
	medicalRecord: MedicalRecordCreateSchema,
	diagnoses: DiagnosisCreateSchema.array(),
	vitalSigns: VitalSignCreateSchema.array(),
	growthRecord: GrowthRecordCreateSchema.array()
});

export type createCompleteEncounterInput = z.infer<typeof createCompleteEncounterSchema>;

export interface AppointmentCount {
	status: string | null;
	count: number;
}

export interface AppointmentRecord {
	id: string;
	patient?: {
		firstName: string;
		lastName: string;
	} | null;
	doctor?: {
		name: string;
	} | null;
	appointmentDate: Date;
	status?: string | null;
	type?: string | null;
}

// Schema for admin dashboard stats response
export const AdminDashboardStatsSchema = z.object({
	availableDoctors: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			specialty: z.string().nullable(),
			available: z.boolean(),
			nextAvailableTime: z.string().nullable()
		})
	),
	last5Records: z.array(
		z.object({
			id: z.string(),
			patientName: z.string(),
			doctorName: z.string(),
			appointmentDate: z.date(),
			status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "PENDING", "NO_SHOW", "CONFIRMED"]),
			type: z.string().nullable()
		})
	),
	appointmentCounts: z.object({
		SCHEDULED: z.number(),
		COMPLETED: z.number(),
		CANCELLED: z.number(),
		PENDING: z.number(),
		CONFIRMED: z.number(),
		NO_SHOW: z.number()
	}),
	monthlyData: z.array(
		z.object({
			month: z.string(),
			appointments: z.number()
		})
	),
	totalDoctors: z.number(),
	totalPatient: z.number(),
	totalAppointments: z.number()
});

export const UserAuthSchema = UserSchema.omit({ role: true }).extend({
	role: z.enum(["admin", "doctor", "patient", "staff"]),
	password: z.string().min(6)
});

export const GetAppointmentsInRangeSchema = z.object({
	startDate: z.date(),
	endDate: z.date(),
	doctorId: z.string().optional()
});

export const GetAppointmentsSchema = z.object({
	page: z.number().default(1),
	limit: z.number().default(10),
	status: z.enum(appointmentStatusEnum.enumValues).optional(),
	doctorId: z.string().optional(),
	patientId: z.string().optional()
});

export const UpdateAppointmentStatusSchema = z.object({
	id: z.string(),
	status: z.enum(appointmentStatusEnum.enumValues)
});

export const CancelApstringpointmentSchema = z.object({
	id: z.string(),
	reason: z.string().optional()
});

export const RescheduleAppointmentSchema = z.object({
	id: z.string(),
	newDate: z.date(),
	newTime: z.string(),
	reason: z.string().optional()
});

export const BulkUpdateStatusSchema = z.object({
	appointmentIds: z.array(z.string()),
	status: z.enum(appointmentStatusEnum.enumValues),
	reason: z.string().optional()
});

export const ListAppointmentsSchema = z.object({
	page: z.number().default(1),
	limit: z.number().default(10),
	search: z.string().optional(),
	status: z.enum(appointmentStatusEnum.enumValues).optional(),
	fromDate: z.date().optional(),
	toDate: z.date().optional(),
	patientId: z.string().optional(),
	doctorId: z.string().optional(),
	doctorSpecialty: z.string().optional(),
	type: z.string().optional()
});

export const GetDoctorAvailabilitySchema = z.object({
	doctorId: z.string(),
	date: z.date()
});

export const GetAvailableTimeSlotsSchema = z.object({
	doctorId: z.string(),
	date: z.date(),
	durationMinutes: z.number().min(15).max(120).default(30)
});

export const CreateAppointmentWithReminderSchema = z.object({
	data: AppointmentCreateSchema,
	reminderData: ReminderCreateSchema.optional()
});
export const UpdateUserInputSchema = z.object({
	id: z.string(),
	email: z.email().optional(),
	name: z.string().min(1).optional(),
	phone: z.string().optional(),
	clinicId: z.string().optional(),
	address: z.string().optional(),
	role: z.enum(roleEnum.enumValues).optional()
});

export const CancelAppointmentSchema = z.object({
	id: z.string(),
	reason: z.string().optional()
});

export const PatientWithRelationsSchema = PatientSchema.extend({
	appointments: z.array(z.any()).optional(),
	medicalRecords: z.array(z.any()).optional(),
	encounters: z.array(z.any()).optional(),
	immunizations: z.array(z.any()).optional(),
	vitalSigns: z.array(z.any()).optional(),
	prescriptions: z.array(z.any()).optional(),
	growthRecords: z.array(z.any()).optional(),
	payments: z.array(z.any()).optional(),
	guardians: z.array(z.any()).optional()
});

export const NeonatalAssessmentSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	clinicId: z.string(),
	weight: z.number(),
	height: z.number(),
	vitals: z
		.object({
			bodyTemperature: z.number(),
			heartRate: z.number(),
			respiratoryRate: z.number(),
			oxygenSaturation: z.number()
		})
		.nullable(),
	headCircumference: z.number(),
	apgarScore: z.number(),
	feedingType: z.enum(feedingTypeEnum.enumValues),
	createdAt: z.date(),
	updatedAt: z.date()
});
