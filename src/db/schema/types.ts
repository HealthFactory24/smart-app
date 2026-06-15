// db/types.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { account, roleEnum, session, twoFactor, user, verification } from "./auth";
import type {
	actionTypeEnum,
	adverseEvent,
	aiReport,
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
	neonatalAssessment,
	notification,
	notificationPriorityEnum,
	notificationStatusEnum,
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
	service,
	severityEnum,
	staff,
	statusEnum,
	userQuota,
	vaccineInventory,
	vaccineSchedule,
	vitalSign,
	weekdayEnum,
	whoGrowthStandard,
	workingDay
} from "./clinic";

// ============================================================================
// Helper Types for Any Table
// ============================================================================

export type Select<T> = T extends { $inferSelect: infer U } ? U : never;
export type Insert<T> = T extends { $inferInsert: infer U } ? U : never;

// ============================================================================
// Identity & Auth (from auth.ts)
// ============================================================================

export type DbUser = Select<typeof user>;
export type NewDbUser = Insert<typeof user>;

export type DbSession = Select<typeof session>;
export type NewDbSession = Insert<typeof session>;

export type DbAccount = Select<typeof account>;
export type NewDbAccount = Insert<typeof account>;

export type DbVerification = Select<typeof verification>;
export type NewDbVerification = Insert<typeof verification>;
export type CreateTwoFactorInput = InferInsertModel<typeof twoFactor>;
export type UpdateTwoFactorInput = Partial<CreateTwoFactorInput>;

export type DbTwoFactor = Select<typeof twoFactor>;
export type NewDbTwoFactor = Insert<typeof twoFactor>;
export type CreateVerificationInput = InferInsertModel<typeof verification>;
export type UpdateVerificationInput = Partial<CreateVerificationInput>;

export type DbInvite = Select<typeof invite>;
export type NewDbInvite = Insert<typeof invite>;

// ============================================================================
// Clinic Management (from clinic.ts)
// ============================================================================

export type DbClinic = Select<typeof clinic>;
export type NewDbClinic = Insert<typeof clinic>;

export type DbClinicMember = Select<typeof clinicMember>;
export type NewDbClinicMember = Insert<typeof clinicMember>;

export type DbDoctor = Select<typeof doctor>;
export type NewDbDoctor = Insert<typeof doctor>;

export type DbWorkingDay = Select<typeof workingDay>;
export type NewDbWorkingDay = Insert<typeof workingDay>;

export type DbStaff = Select<typeof staff>;
export type NewDbStaff = Insert<typeof staff>;

export type DbClinicSetting = Select<typeof clinicSetting>;
export type NewDbClinicSetting = Insert<typeof clinicSetting>;

export type DbRating = Select<typeof rating>;
export type NewDbRating = Insert<typeof rating>;

// ============================================================================
// Patient Management (from patient.ts)
// ============================================================================

export type DbPatient = Select<typeof patient>;
export type NewDbPatient = Insert<typeof patient>;

export type DbGuardian = Select<typeof guardian>;
export type NewDbGuardian = Insert<typeof guardian>;

export type DbUserQuota = Select<typeof userQuota>;
export type NewDbUserQuota = Insert<typeof userQuota>;

// ============================================================================
// Medical Records (from medical.ts)
// ============================================================================

export type DbAppointment = Select<typeof appointment>;
export type NewDbAppointment = Insert<typeof appointment>;

export type DbMedicalRecord = Select<typeof medicalRecord>;
export type NewDbMedicalRecord = Insert<typeof medicalRecord>;

export type DbDiagnosis = Select<typeof diagnosis>;
export type NewDbDiagnosis = Insert<typeof diagnosis>;

export type DbVitalSign = Select<typeof vitalSign>;
export type NewDbVitalSign = Insert<typeof vitalSign>;

export type DbService = Select<typeof service>;
export type NewDbService = Insert<typeof service>;

export type DbLabTest = Select<typeof labTest>;
export type NewDbLabTest = Insert<typeof labTest>;

export type DbPayment = Select<typeof payment>;
export type NewDbPayment = Insert<typeof payment>;

export type DbPatientBill = Select<typeof patientBill>;
export type NewDbPatientBill = Insert<typeof patientBill>;

export type DbAiReport = Select<typeof aiReport>;
export type NewDbAiReport = Insert<typeof aiReport>;

export type DbAlert = Select<typeof alert>;
export type NewDbAlert = Insert<typeof alert>;

export type DbReminder = Select<typeof reminder>;
export type NewDbReminder = Insert<typeof reminder>;

// ============================================================================
// Pediatric & Growth (from pediatric.ts)
// ============================================================================

export type DbGrowthRecord = Select<typeof growthRecord>;
export type NewDbGrowthRecord = Insert<typeof growthRecord>;

export type DbImmunization = Select<typeof immunization>;
export type NewDbImmunization = Insert<typeof immunization>;

export type DbWhoGrowthStandard = Select<typeof whoGrowthStandard>;
export type NewDbWhoGrowthStandard = Insert<typeof whoGrowthStandard>;

export type DbFeedingLog = Select<typeof feedingLog>;
export type NewDbFeedingLog = Insert<typeof feedingLog>;

export type DbDevelopmentalMilestones = Select<typeof developmentalMilestones>;
export type NewDbDevelopmentalMilestones = Insert<typeof developmentalMilestones>;

export type DbDevelopmentalCheck = Select<typeof developmentalCheck>;
export type NewDbDevelopmentalCheck = Insert<typeof developmentalCheck>;

export type DbAdverseEvent = Select<typeof adverseEvent>;
export type NewDbAdverseEvent = Insert<typeof adverseEvent>;

export type DbVaccineInventory = Select<typeof vaccineInventory>;
export type NewDbVaccineInventory = Insert<typeof vaccineInventory>;

export type DbVaccineSchedule = Select<typeof vaccineSchedule>;
export type NewDbVaccineSchedule = Insert<typeof vaccineSchedule>;

export type DbNeonatalAssessment = Select<typeof neonatalAssessment>;
export type NewDbNeonatalAssessment = Insert<typeof neonatalAssessment>;

// ============================================================================
// Pharmacy (from pharmacy.ts)
// ============================================================================

export type DbPrescription = Select<typeof prescription>;
export type NewDbPrescription = Insert<typeof prescription>;

export type DbDrug = Select<typeof drug>;
export type NewDbDrug = Insert<typeof drug>;

export type DbDoseGuideline = Select<typeof doseGuideline>;
export type NewDbDoseGuideline = Insert<typeof doseGuideline>;

export type DbPrescribedItem = Select<typeof prescribedItem>;
export type NewDbPrescribedItem = Insert<typeof prescribedItem>;

export type DbMedicationDispense = Select<typeof medicationDispense>;
export type NewDbMedicationDispense = Insert<typeof medicationDispense>;

export type DbPrescriptionLog = Select<typeof prescriptionLog>;
export type NewDbPrescriptionLog = Insert<typeof prescriptionLog>;

// ============================================================================
// System (from system.ts)
// ============================================================================

export type DbFolder = Select<typeof folder>;
export type NewDbFolder = Insert<typeof folder>;

export type DbFile = Select<typeof file>;
export type NewDbFile = Insert<typeof file>;

export type DbConfigStore = Select<typeof configStore>;
export type NewDbConfigStore = Insert<typeof configStore>;

export type DbNotification = Select<typeof notification>;
export type NewDbNotification = Insert<typeof notification>;

// ============================================================================
// Enums (Grouped by domain)
// ============================================================================

// ============================================================================
// Utility Types for Updates
// ============================================================================

export type Update<T> = Partial<T> & { id: string };
export type UpdateUser = Update<DbUser>;
export type UpdatePatient = Update<DbPatient>;
export type UpdateAppointment = Update<DbAppointment>;
export type UpdateDoctor = Update<DbDoctor>;
export type UpdateStaff = Update<DbStaff>;
export type UpdatePrescription = Update<DbPrescription>;
export type UpdateFeedingLog = Update<DbFeedingLog>;

// ============================================================================
// Filter & Query Types
// ============================================================================

export interface FeedingLogFilters {
	patientId: string;
	clinicId: string;
	startDate?: Date;
	endDate?: Date;
	type?: FeedingType;
	limit?: number;
	offset?: number;
}

export interface FeedingStats {
	totalFeedings: number;
	byType: Record<string, number>;
	averageDuration: number;
	totalAmount: number;
	feedingsByDay: Array<{
		date: string;
		count: number;
		totalDuration: number;
		totalAmount: number;
	}>;
}

export interface NutritionAssessment {
	id: string;
	patientId: string;
	clinicId: string;
	assessmentDate: Date;
	nutritionalStatus: "NORMAL" | "UNDERWEIGHT" | "OVERWEIGHT" | "OBESE" | "MALNOURISHED";
	dietaryRestrictions: string[];
	recommendations: string[];
	followUpDate: Date | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// ============================================================================
// Legacy Compatibility Exports (for existing code)
// ============================================================================

// These aliases help with the transition from old naming conventions
export type DatabaseUser = DbUser;
export type NewDatabaseUser = NewDbUser;
export type DatabaseAccount = DbAccount;
export type NewDatabaseAccount = NewDbAccount;
export type DatabaseSession = DbSession;
export type NewDatabaseSession = NewDbSession;
export type DatabaseUserQuota = DbUserQuota;
export type NewDatabaseUserQuota = NewDbUserQuota;

export type NotificationItem = DbNotification;
export type NewNotification = NewDbNotification;
export type AdverseEvent = DbAdverseEvent;
export type NewAdverseEvent = NewDbAdverseEvent;
export type VaccineInventory = DbVaccineInventory;
export type NewVaccineInventory = NewDbVaccineInventory;

// Re-export for convenience
export type { InferInsertModel, InferSelectModel };
export type CreateFilesInput = InferInsertModel<typeof file>;
export type UpdateFilesInput = Partial<CreateFilesInput>;
export type CreateFoldersInput = InferInsertModel<typeof folder>;
export type UpdateFoldersInput = Partial<CreateFoldersInput>;
export type CreateConfigStoreInput = InferInsertModel<typeof configStore>;
export type UpdateConfigStoreInput = Partial<CreateConfigStoreInput>;
export type CreateInvitesInput = InferInsertModel<typeof invite>;
export type UpdateInvitesInput = Partial<CreateInvitesInput>;
export type CreateUserQuotaInput = InferInsertModel<typeof userQuota>;
export type UpdateUserQuotaInput = Partial<CreateUserQuotaInput>;

export type CreateClinicsInput = InferInsertModel<typeof clinic>;
export type UpdateClinicsInput = Partial<CreateClinicsInput>;
export type CreateClinicMembersInput = InferInsertModel<typeof clinicMember>;
export type UpdateClinicMembersInput = Partial<CreateClinicMembersInput>;
export type CreateDoctorInput = InferInsertModel<typeof doctor>;
export type UpdateDoctorInput = Partial<CreateDoctorInput>;

export type CreateWorkingDayInput = InferInsertModel<typeof workingDay>;
export type UpdateWorkingDayInput = Partial<CreateWorkingDayInput>;

export type CreateStaffInput = InferInsertModel<typeof staff>;
export type UpdateStaffInput = Partial<CreateStaffInput>;
export type CreatePatientInput = InferInsertModel<typeof patient>;
export type UpdatePatientInput = Partial<CreatePatientInput>;

export type CreatePrescriptionInput = InferInsertModel<typeof prescription>;
export type UpdatePrescriptionInput = Partial<CreatePrescriptionInput>;

export type CreatePaymentInput = InferInsertModel<typeof payment>;
export type UpdatePaymentInput = Partial<CreatePaymentInput>;

export type CreatePatientBillInput = InferInsertModel<typeof patientBill>;
export type UpdatePatientBillInput = Partial<CreatePatientBillInput>;

export type CreatePrescriptionsInput = InferInsertModel<typeof prescription>;
export type UpdatePrescriptionsInput = Partial<CreatePrescriptionsInput>;

export type CreatePrescribedItemsInput = InferInsertModel<typeof prescribedItem>;
export type UpdatePrescribedItemsInput = Partial<CreatePrescribedItemsInput>;

export type CreatePrescriptionLogsInput = InferInsertModel<typeof prescriptionLog>;
export type UpdatePrescriptionLogsInput = Partial<CreatePrescriptionLogsInput>;
export type CreateGuardiansInput = InferInsertModel<typeof guardian>;
export type UpdateGuardiansInput = Partial<CreateGuardiansInput>;
export type CreateFeedingLogsInput = InferInsertModel<typeof feedingLog>;
export type UpdateFeedingLogsInput = Partial<CreateFeedingLogsInput>;
export type CreateAppointmentInput = InferInsertModel<typeof appointment>;
export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;
export type CreateMedicalRecordInput = InferInsertModel<typeof medicalRecord>;
export type UpdateMedicalRecordInput = Partial<CreateMedicalRecordInput>;
export type CreateDiagnosisInput = InferInsertModel<typeof diagnosis>;
export type UpdateDiagnosisInput = Partial<CreateDiagnosisInput>;
export type CreateVitalSignInput = InferInsertModel<typeof vitalSign>;
export type UpdateVitalSignInput = Partial<CreateVitalSignInput>;
export type CreateGrowthRecordInput = InferInsertModel<typeof growthRecord>;
export type UpdateGrowthRecordInput = Partial<CreateGrowthRecordInput>;
export type CreateImmunizationInput = InferInsertModel<typeof immunization>;
export type UpdateImmunizationInput = Partial<CreateImmunizationInput>;
export type CreateServiceInput = InferInsertModel<typeof service>;
export type UpdateServiceInput = Partial<CreateServiceInput>;
export type CreateLabTestInput = InferInsertModel<typeof labTest>;
export type UpdateLabTestInput = Partial<CreateLabTestInput>;
export type CreateReminderInput = InferInsertModel<typeof reminder>;
export type UpdateReminderInput = Partial<CreateReminderInput>;
export type CreateClinicSettingInput = InferInsertModel<typeof clinicSetting>;
export type UpdateClinicSettingInput = Partial<CreateClinicSettingInput>;
export type CreateWhoGrowthStandardsInput = InferInsertModel<typeof whoGrowthStandard>;
export type UpdateWhoGrowthStandardsInput = Partial<CreateWhoGrowthStandardsInput>;
export type CreateRatingInput = InferInsertModel<typeof rating>;
export type UpdateRatingInput = Partial<CreateRatingInput>;
export type CreateDrugsInput = InferInsertModel<typeof drug>;
export type UpdateDrugsInput = Partial<CreateDrugsInput>;
export type CreateDoseGuidelinesInput = InferInsertModel<typeof doseGuideline>;
export type UpdateDoseGuidelinesInput = Partial<CreateDoseGuidelinesInput>;
export type CreateFilesUploadInput = InferInsertModel<typeof fileUpload>;
export type UpdateFilesUploadInput = Partial<CreateFilesUploadInput>;
export type CreateNotificationsInput = InferInsertModel<typeof notification>;
export type UpdateNotificationsInput = Partial<CreateNotificationsInput>;
export type CreateDevelopmentalMilestonesInput = InferInsertModel<typeof developmentalMilestones>;
export type UpdateDevelopmentalMilestonesInput = Partial<CreateDevelopmentalMilestonesInput>;
export type CreateDevelopmentalCheckInput = InferInsertModel<typeof developmentalCheck>;
export type UpdateDevelopmentalCheckInput = Partial<CreateDevelopmentalCheckInput>;
export type CreateMedicationDispensesInput = InferInsertModel<typeof medicationDispense>;
export type UpdateMedicationDispensesInput = Partial<CreateMedicationDispensesInput>;
export type CreateVaccineScheduleInput = InferInsertModel<typeof vaccineSchedule>;
export type UpdateVaccineScheduleInput = Partial<CreateVaccineScheduleInput>;
export type CreateAdverseEventInput = InferInsertModel<typeof adverseEvent>;
export type UpdateAdverseEventInput = Partial<CreateAdverseEventInput>;
export type CreateVaccineInventoryInput = InferInsertModel<typeof vaccineInventory>;
export type UpdateVaccineInventoryInput = Partial<CreateVaccineInventoryInput>;
export type CreateFeedingLogInput = typeof feedingLog.$inferInsert;
export type UpdateFeedingLogInput = Partial<CreateFeedingLogInput>;

export interface CreateNutritionAssessmentInput {
	patientId: string;
	clinicId: string;
	assessmentDate: Date;
	nutritionalStatus: "NORMAL" | "UNDERWEIGHT" | "OVERWEIGHT" | "OBESE" | "MALNOURISHED";
	dietaryRestrictions?: string[];
	recommendations: string[];
	followUpDate?: Date | null;
	notes?: string | null;
}

export interface UpdateNutritionAssessmentInput extends Partial<CreateNutritionAssessmentInput> {
	id: string;
}
export interface NutritionRecommendation {
	id: string;
	patientId: string;
	clinicId: string;
	recommendationType: "dietary" | "supplement" | "lifestyle" | "followup";
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
	dueDate?: Date | null;
	completed: boolean;
	createdAt: Date;
	updatedAt: Date;
}
export type CreateCompleteEncounterInput = {
	appointmentId: string;
	patientId: string;
	doctorId: string;
	medicalRecord: Omit<CreateMedicalRecordInput, "id" | "clinicId" | "patientId" | "appointmentId" | "doctorId">;
	diagnosis: Omit<CreateDiagnosisInput, "id" | "medicalId" | "patientId" | "doctorId" | "appointmentId">;
	vitals?: Omit<CreateVitalSignInput, "id" | "medicalId" | "encounterId">;
	growth?: Omit<CreateGrowthRecordInput, "id" | "patientId">;
};
export interface TimeSlot {
	start: Date;
	end: Date;
}

export interface BookedSlot {
	start: Date;
	duration: number;
}

// Role & Identity
export type Role = (typeof roleEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type BloodGroup = (typeof bloodGroupEnum.enumValues)[number];
export type MaritalStatus = (typeof maritalStatusEnum.enumValues)[number];
export type DoctorType = (typeof doctorTypeEnum.enumValues)[number];

// Statuses
export type Status = (typeof statusEnum.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];
export type AvailabilityStatus = (typeof availabilityStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type NotificationStatus = (typeof notificationStatusEnum.enumValues)[number];
export type ImmunizationStatus = (typeof immunizationStatusEnum.enumValues)[number];
export type PrescriptionStatus = (typeof prescriptionStatusEnum.enumValues)[number];
export type LabTestStatus = (typeof labTestStatusEnum.enumValues)[number];
export type ReminderStatus = (typeof reminderStatusEnum.enumValues)[number];

// Clinical & Pediatric Specific
export type NutritionalStatus = (typeof nutritionalStatusEnum.enumValues)[number];
export type MeasurementType = (typeof measurementTypeEnum.enumValues)[number];
export type FeedingType = (typeof feedingTypeEnum.enumValues)[number];
export type BreastSide = (typeof breastEnum.enumValues)[number];
export type DrugRoute = (typeof drugRouteEnum.enumValues)[number];
export type Frequency = (typeof frequencyEnum.enumValues)[number];
export type Severity = (typeof severityEnum.enumValues)[number];

// Operational & Infrastructure
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type NotificationPriority = (typeof notificationPriorityEnum.enumValues)[number];
export type Weekday = (typeof weekdayEnum.enumValues)[number];
export type ReminderMethod = (typeof reminderMethodEnum.enumValues)[number];
export type ActionType = (typeof actionTypeEnum.enumValues)[number];
export type Day = (typeof weekdayEnum.enumValues)[number];
