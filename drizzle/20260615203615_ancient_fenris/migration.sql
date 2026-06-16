CREATE TYPE "action_type" AS ENUM('redirect', 'api_call', 'workflow', 'modal', 'none');--> statement-breakpoint
CREATE TYPE "appointment_status" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "availability_status" AS ENUM('AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE');--> statement-breakpoint
CREATE TYPE "badge" AS ENUM('New', 'Sale', 'Featured', 'Limited');--> statement-breakpoint
CREATE TYPE "blood_group" AS ENUM('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE');--> statement-breakpoint
CREATE TYPE "breast" AS ENUM('LEFT', 'RIGHT', 'BOTH');--> statement-breakpoint
CREATE TYPE "doctor_type" AS ENUM('FULL', 'PART_TIME', 'CONSULTANT', 'VISITING');--> statement-breakpoint
CREATE TYPE "drug_route" AS ENUM('ORAL', 'INTRAVENOUS', 'INTRAMUSCULAR', 'SUBCUTANEOUS', 'TOPICAL', 'INHALATION', 'RECTAL');--> statement-breakpoint
CREATE TYPE "feeding_type" AS ENUM('BREAST', 'BOTTLE', 'FORMULA', 'SOLID', 'MIXED');--> statement-breakpoint
CREATE TYPE "frequency" AS ENUM('ONCE_DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'FOUR_TIMES_DAILY', 'EVERY_OTHER_DAY', 'WEEKLY', 'MONTHLY', 'AS_NEEDED');--> statement-breakpoint
CREATE TYPE "gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "immunization_status" AS ENUM('COMPLETED', 'PENDING', 'CANCELLED', 'OVERDUE');--> statement-breakpoint
CREATE TYPE "inventory" AS ENUM('in-stock', 'backorder', 'preorder');--> statement-breakpoint
CREATE TYPE "lab_test_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "marital_status" AS ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');--> statement-breakpoint
CREATE TYPE "measurement_type" AS ENUM('WEIGHT', 'HEIGHT', 'BMI', 'HEAD_CIRCUMFERENCE');--> statement-breakpoint
CREATE TYPE "notification_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "notification_status" AS ENUM('read', 'unread');--> statement-breakpoint
CREATE TYPE "nutritional_status" AS ENUM('NORMAL', 'UNDERWEIGHT', 'OVERWEIGHT', 'OBESE', 'MALNOURISHED');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('CASH', 'CARD', 'INSURANCE', 'BANK_TRANSFER', 'MOBILE_MONEY');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PAID', 'UNPAID', 'PENDING', 'REFUNDED', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "prescription_status" AS ENUM('active', 'completed', 'cancelled', 'expired', 'on_hold');--> statement-breakpoint
CREATE TYPE "reminder_method" AS ENUM('SMS', 'EMAIL', 'PUSH', 'CALL');--> statement-breakpoint
CREATE TYPE "reminder_status" AS ENUM('PENDING', 'SENT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('admin', 'doctor', 'staff', 'patient');--> statement-breakpoint
CREATE TYPE "severity" AS ENUM('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "status" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'ON_HOLD');--> statement-breakpoint
CREATE TYPE "weekday" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adverse_event" (
	"id" text PRIMARY KEY,
	"immunization_id" text,
	"patient_id" text NOT NULL,
	"vaccine_name" text NOT NULL,
	"event_type" text NOT NULL,
	"severity" "severity" NOT NULL,
	"description" text,
	"outcome" text,
	"treatment" text,
	"date_reported" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reported_by_staff_id" text
);
--> statement-breakpoint
CREATE TABLE "ai_report" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"doctor_id" text,
	"clinic_id" text,
	"report_type" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"generated_by" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alert" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"action" jsonb
);
--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"doctor_id" text NOT NULL,
	"service_id" text,
	"doctor_specialty" text,
	"clinic_id" text NOT NULL,
	"appointment_date" timestamp NOT NULL,
	"time" text,
	"duration_minutes" integer,
	"appointment_price" integer,
	"status" "appointment_status" DEFAULT 'PENDING'::"appointment_status",
	"type" text NOT NULL,
	"note" text,
	"reason" text,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"address" text,
	"phone" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_clinic" (
	"user_id" text,
	"clinic_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "role",
	CONSTRAINT "users_to_clinic_pkey" PRIMARY KEY("user_id","clinic_id")
);
--> statement-breakpoint
CREATE TABLE "clinic_setting" (
	"id" text PRIMARY KEY,
	"clinic_id" text NOT NULL UNIQUE,
	"opening_time" text NOT NULL,
	"closing_time" text NOT NULL,
	"working_days" text NOT NULL,
	"default_appointment_duration" integer DEFAULT 30,
	"require_emergency_contact" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config_store" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developmental_check" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"check_date" timestamp NOT NULL,
	"age_months" integer NOT NULL,
	"motor_skills" text NOT NULL,
	"language_skills" text NOT NULL,
	"social_skills" text NOT NULL,
	"cognitive_skills" text NOT NULL,
	"milestones_met" text,
	"milestones_pending" text,
	"concerns" text,
	"recommendations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developmental_milestones" (
	"id" serial PRIMARY KEY,
	"patient_id" text NOT NULL,
	"milestone" text NOT NULL,
	"age_achieved" text NOT NULL,
	"date_recorded" timestamp NOT NULL,
	"notes" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnosis" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"doctor_id" text NOT NULL,
	"clinic_id" text,
	"appointment_id" text,
	"medical_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"type" text,
	"diagnosis" text,
	"status" "status",
	"treatment" text,
	"notes" text,
	"symptoms" text NOT NULL,
	"prescribed_medications" text,
	"follow_up_plan" text,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor" (
	"id" text PRIMARY KEY,
	"email" text,
	"name" text NOT NULL,
	"user_id" text UNIQUE,
	"clinic_id" text,
	"specialty" text NOT NULL,
	"license_number" text,
	"phone" text,
	"address" text,
	"department" text,
	"img" text,
	"color_code" text,
	"availability_status" "availability_status",
	"available_from_week_day" "weekday",
	"available_to_week_day" "weekday",
	"is_active" boolean,
	"status" "status",
	"available_from_time" text,
	"available_to_time" text,
	"type" "doctor_type" DEFAULT 'FULL'::"doctor_type",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"appointment_price" integer,
	"role" "role",
	"rating" integer,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "dose_guidelines" (
	"id" text PRIMARY KEY,
	"drug_id" text NOT NULL,
	"route" "drug_route" NOT NULL,
	"clinical_indication" text NOT NULL,
	"min_dose_per_kg" real,
	"max_dose_per_kg" real,
	"dose_unit" text,
	"frequency_days" text,
	"gestational_age_weeks_min" real,
	"gestational_age_weeks_max" real,
	"post_natal_age_days_min" real,
	"post_natal_age_days_max" real,
	"max_dose_per_24h" real,
	"stock_concentration_mg_ml" real,
	"final_concentration_mg_ml" real,
	"min_infusion_time_min" integer,
	"compatibility_diluent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"name" text NOT NULL UNIQUE,
	"generic_name" text,
	"brand_name" text,
	"description" text,
	"side_effects" text,
	"quantity_in_stock" integer DEFAULT 0,
	"interactions" text,
	"contraindications" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feeding_logs" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"type" "feeding_type" NOT NULL,
	"duration" integer,
	"amount" real,
	"breast" "breast",
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"folder_id" text,
	"filename" text NOT NULL,
	"search_text" text DEFAULT '' NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files_upload" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL,
	"file_name" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folder" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_record" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"patient_id" text NOT NULL,
	"gender" "gender",
	"age_days" integer,
	"age_months" integer,
	"head_circumference" real,
	"bmi" real,
	"percentile" real,
	"weight_for_age_z" real,
	"height_for_age_z" real,
	"bmi_for_age_z" real,
	"hc_for_age_z" real,
	"weight" real,
	"height" real,
	"notes" text,
	"date" timestamp NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"user_id" text NOT NULL,
	"relation" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"phone" text,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "immunization" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"patient_id" text NOT NULL,
	"vaccine" text NOT NULL,
	"date" timestamp NOT NULL,
	"dose" text,
	"lot_number" text,
	"administered_by_staff_id" text,
	"notes" text,
	"record_id" text NOT NULL,
	"vaccine_inventory_id" text,
	"is_overdue" boolean DEFAULT false,
	"status" "immunization_status" DEFAULT 'COMPLETED'::"immunization_status",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"code" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_by" text,
	"used_by" text,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lab_test" (
	"id" text PRIMARY KEY,
	"diagnosis_id" text,
	"patient_id" text,
	"record_id" text NOT NULL,
	"service_id" text NOT NULL,
	"test_date" timestamp NOT NULL,
	"result" text NOT NULL,
	"status" "lab_test_status" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_record" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"appointment_id" text,
	"doctor_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"diagnosis" text,
	"symptoms" text,
	"treatment_plan" text,
	"lab_request" text,
	"notes" text,
	"attachments" text,
	"diagnosis_date" timestamp,
	"status" "status" DEFAULT 'ACTIVE'::"status",
	"medications" text,
	"follow_up_date" timestamp,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_dispenses" (
	"id" text PRIMARY KEY,
	"prescribed_item_id" text NOT NULL,
	"prescription_id" text NOT NULL,
	"quantity_dispensed" real NOT NULL,
	"lot_number" text,
	"expiration_date" timestamp,
	"dispensed_by" text NOT NULL,
	"dispensed_at" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neonatal_assessment" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"weight" real NOT NULL,
	"height" real NOT NULL,
	"vitals" jsonb,
	"head_circumference" real NOT NULL,
	"apgar_score" integer NOT NULL,
	"feeding_type" "feeding_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"body" text NOT NULL,
	"user_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"status" "notification_status" DEFAULT 'unread'::"notification_status" NOT NULL,
	"priority" "notification_priority",
	"type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"actions" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "nutritional_assessment" (
	"id" text PRIMARY KEY,
	"patient_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"height" real NOT NULL,
	"weight" real NOT NULL,
	"bmi" real NOT NULL,
	"body_fat_percentage" real NOT NULL,
	"nutritional_status" text NOT NULL,
	"dietary_restrictions" text,
	"recommendations" text,
	"notes" text,
	"follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutritional_recommendation" (
	"id" text PRIMARY KEY,
	"assessment_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"recommendation_type" text NOT NULL,
	"priority" text DEFAULT 'medium',
	"due_date" timestamp,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"name" varchar(256) NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"quantity" integer NOT NULL,
	"image" varchar(512) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"stripe_session_id" text,
	"status" "order_status" DEFAULT 'pending'::"order_status" NOT NULL,
	"total" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" text PRIMARY KEY,
	"clinic_id" text NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"email" text UNIQUE,
	"phone" text,
	"emergency_contact_number" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"gender" "gender" DEFAULT 'MALE'::"gender",
	"marital_status" "marital_status",
	"nutritional_status" "nutritional_status",
	"address" text,
	"emergency_contact_name" text,
	"mrn" text UNIQUE,
	"relation" text,
	"guardian_id" text,
	"allergies" text,
	"medical_conditions" text,
	"medical_history" text,
	"image" text,
	"color_code" text,
	"role" "role",
	"status" "status" DEFAULT 'ACTIVE'::"status",
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"created_by_id" text,
	"updated_by_id" text,
	"blood_group" "blood_group",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_bill" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"bill_id" text NOT NULL,
	"service_id" text NOT NULL,
	"service_date" timestamp NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" integer,
	"total_cost" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"bill_id" text,
	"patient_id" text,
	"appointment_id" text UNIQUE,
	"bill_date" timestamp NOT NULL,
	"payment_date" timestamp,
	"discount" integer,
	"total_amount" integer,
	"amount_paid" integer,
	"amount" integer,
	"status" "payment_status" DEFAULT 'PAID'::"payment_status",
	"insurance" text,
	"insurance_id" text,
	"service_date" timestamp,
	"due_date" timestamp,
	"paid_date" timestamp,
	"notes" text,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"payment_method" "payment_method" DEFAULT 'CASH'::"payment_method",
	"receipt_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescribed_items" (
	"id" text PRIMARY KEY,
	"prescription_id" text NOT NULL,
	"clinic_id" text NOT NULL,
	"drug_id" text NOT NULL,
	"dosage_value" real NOT NULL,
	"dosage_unit" text NOT NULL,
	"frequency" "frequency" NOT NULL,
	"duration" text NOT NULL,
	"instructions" text,
	"drug_route" "drug_route",
	"refills_remaining" integer DEFAULT 0,
	"total_refills" integer DEFAULT 0,
	"last_refill_date" timestamp,
	"quantity_dispensed_total" real DEFAULT 0,
	"notes" text,
	"expire_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY,
	"medical_record_id" text NOT NULL,
	"doctor_id" text,
	"patient_id" text NOT NULL,
	"encounter_id" text NOT NULL,
	"diagnosis" text,
	"notes" text,
	"medication_name" text,
	"instructions" text,
	"issued_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"status" "prescription_status" NOT NULL,
	"clinic_id" text,
	"valid_until" timestamp,
	"renewed_from_id" text,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription_logs" (
	"id" text PRIMARY KEY,
	"prescription_id" text NOT NULL,
	"action" text NOT NULL,
	"performed_by" text NOT NULL,
	"details" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"badge" "badge",
	"rating" numeric(3,2) DEFAULT '0' NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"image" varchar(512) NOT NULL,
	"inventory" "inventory" DEFAULT 'in-stock'::"inventory" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rating" (
	"id" serial PRIMARY KEY,
	"staff_id" text,
	"patient_id" text,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminder" (
	"id" text PRIMARY KEY,
	"appointment_id" text NOT NULL UNIQUE,
	"method" "reminder_method" NOT NULL,
	"sent_at" timestamp NOT NULL,
	"status" "reminder_status" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"service_name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"category" text,
	"duration" integer,
	"is_available" boolean DEFAULT true,
	"icon" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" text PRIMARY KEY,
	"email" text,
	"name" text NOT NULL,
	"phone" text,
	"user_id" text UNIQUE,
	"clinic_id" text,
	"address" text NOT NULL,
	"department" text,
	"img" text,
	"license_number" text,
	"color_code" text,
	"hire_date" timestamp,
	"salary" real,
	"role" "role" NOT NULL,
	"status" "status" DEFAULT 'ACTIVE'::"status",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_active" boolean
);
--> statement-breakpoint
CREATE TABLE "todo" (
	"id" serial PRIMARY KEY,
	"text" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" "role" DEFAULT 'doctor'::"role" NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"two_factor_enabled" boolean DEFAULT false,
	"api_key" text,
	"clinic_id" text,
	"address" text,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "user_quota" (
	"user_id" text PRIMARY KEY,
	"quota" integer DEFAULT 0 NOT NULL,
	"used_quota" integer DEFAULT 0 NOT NULL,
	"file_count" integer DEFAULT 0 NOT NULL,
	"file_count_quota" integer DEFAULT 0 NOT NULL,
	"invite_count" integer DEFAULT 0 NOT NULL,
	"invite_quota" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vaccine_inventory" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"vaccine_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"lot_number" text,
	"expiration_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vaccine_schedule" (
	"id" text PRIMARY KEY,
	"vaccine_name" text NOT NULL,
	"recommended_age" text NOT NULL,
	"doses_required" integer NOT NULL,
	"minimum_interval" integer,
	"is_mandatory" boolean DEFAULT true,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"status" "immunization_status" DEFAULT 'PENDING'::"immunization_status",
	"is_overdue" boolean DEFAULT false,
	"clinic_id" text,
	"total_doses" integer,
	"is_deleted" boolean DEFAULT false,
	"age_in_days_min" integer,
	"age_in_days_max" integer
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vital_sign" (
	"id" text PRIMARY KEY,
	"clinic_id" text,
	"patient_id" text NOT NULL,
	"medical_id" text NOT NULL,
	"encounter_id" text UNIQUE,
	"growth_record_id" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"body_temperature" real,
	"systolic" integer,
	"diastolic" integer,
	"heart_rate" integer,
	"weight" real,
	"height" real,
	"bmi" real,
	"respiratory_rate" integer,
	"oxygen_saturation" integer,
	"gender" "gender",
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"age_days" integer,
	"age_months" integer
);
--> statement-breakpoint
CREATE TABLE "who_growth_standards" (
	"id" text PRIMARY KEY,
	"age_in_months" real,
	"age_days" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"measurement_type" "measurement_type" NOT NULL,
	"l_value" real NOT NULL,
	"m_value" real NOT NULL,
	"s_value" real NOT NULL,
	"sd0" real NOT NULL,
	"sd1neg" real NOT NULL,
	"sd1pos" real NOT NULL,
	"sd2neg" real NOT NULL,
	"sd2pos" real NOT NULL,
	"sd3neg" real NOT NULL,
	"sd3pos" real NOT NULL,
	"sd4neg" real,
	"sd4pos" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "working_day" (
	"id" text PRIMARY KEY,
	"doctor_id" text NOT NULL,
	"day" "weekday" NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "adverse_event_patient_vaccine_idx" ON "adverse_event" ("patient_id","vaccine_name");--> statement-breakpoint
CREATE INDEX "adverse_event_date_reported_idx" ON "adverse_event" ("date_reported");--> statement-breakpoint
CREATE INDEX "adverse_event_immunization_idx" ON "adverse_event" ("immunization_id");--> statement-breakpoint
CREATE INDEX "appointments_clinic_date_status_idx" ON "appointment" ("clinic_id","appointment_date","status");--> statement-breakpoint
CREATE INDEX "appointments_doctor_date_status_idx" ON "appointment" ("doctor_id","appointment_date","status");--> statement-breakpoint
CREATE INDEX "appointments_patient_date_idx" ON "appointment" ("patient_id","appointment_date");--> statement-breakpoint
CREATE INDEX "appointments_is_deleted_idx" ON "appointment" ("is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "clinics_name_unique" ON "clinic" ("name");--> statement-breakpoint
CREATE INDEX "clinics_is_deleted_idx" ON "clinic" ("is_deleted");--> statement-breakpoint
CREATE INDEX "developmental_check_patient_date_idx" ON "developmental_check" ("patient_id","check_date");--> statement-breakpoint
CREATE INDEX "developmental_check_age_months_idx" ON "developmental_check" ("age_months");--> statement-breakpoint
CREATE INDEX "developmental_milestones_patient_date_idx" ON "developmental_milestones" ("patient_id","date_recorded");--> statement-breakpoint
CREATE INDEX "diagnoses_clinic_date_idx" ON "diagnosis" ("clinic_id","date");--> statement-breakpoint
CREATE INDEX "diagnoses_doctor_date_idx" ON "diagnosis" ("doctor_id","date");--> statement-breakpoint
CREATE INDEX "diagnoses_patient_date_idx" ON "diagnosis" ("patient_id","date");--> statement-breakpoint
CREATE INDEX "diagnoses_is_deleted_idx" ON "diagnosis" ("is_deleted");--> statement-breakpoint
CREATE INDEX "doctors_clinic_id_is_active_idx" ON "doctor" ("clinic_id","is_active");--> statement-breakpoint
CREATE INDEX "doctors_specialty_clinic_id_idx" ON "doctor" ("specialty","clinic_id");--> statement-breakpoint
CREATE INDEX "doctors_is_deleted_idx" ON "doctor" ("is_deleted");--> statement-breakpoint
CREATE INDEX "dose_guidelines_drug_idx" ON "dose_guidelines" ("drug_id");--> statement-breakpoint
CREATE INDEX "drugs_clinic_idx" ON "drugs" ("clinic_id");--> statement-breakpoint
CREATE INDEX "feeding_logs_patient_date_idx" ON "feeding_logs" ("patient_id","date");--> statement-breakpoint
CREATE INDEX "idx_files_slug" ON "file" ("slug");--> statement-breakpoint
CREATE INDEX "idx_files_search_text" ON "file" ("search_text");--> statement-breakpoint
CREATE INDEX "idx_files_folder_id" ON "file" ("folder_id");--> statement-breakpoint
CREATE INDEX "idx_folders_user_id" ON "folder" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_folders_parent_id" ON "folder" ("parent_id");--> statement-breakpoint
CREATE INDEX "growth_records_patient_date_idx" ON "growth_record" ("patient_id","date");--> statement-breakpoint
CREATE INDEX "guardians_patient_id_idx" ON "guardians" ("patient_id");--> statement-breakpoint
CREATE INDEX "guardians_user_id_idx" ON "guardians" ("user_id");--> statement-breakpoint
CREATE INDEX "immunizations_clinic_patient_vaccine_date_idx" ON "immunization" ("clinic_id","patient_id","vaccine","date");--> statement-breakpoint
CREATE INDEX "immunizations_clinic_patient_date_idx" ON "immunization" ("clinic_id","patient_id","date");--> statement-breakpoint
CREATE INDEX "invites_used_by_idx" ON "invite" ("used_by");--> statement-breakpoint
CREATE INDEX "lab_tests_service_id_idx" ON "lab_test" ("service_id");--> statement-breakpoint
CREATE INDEX "lab_tests_record_id_idx" ON "lab_test" ("record_id");--> statement-breakpoint
CREATE UNIQUE INDEX "medical_records_patient_appointment_unique" ON "medical_record" ("patient_id","appointment_id");--> statement-breakpoint
CREATE INDEX "medical_records_clinic_followup_idx" ON "medical_record" ("clinic_id","follow_up_date");--> statement-breakpoint
CREATE INDEX "medical_records_patient_created_idx" ON "medical_record" ("patient_id","created_at");--> statement-breakpoint
CREATE INDEX "medical_records_doctor_idx" ON "medical_record" ("doctor_id");--> statement-breakpoint
CREATE INDEX "medical_records_is_deleted_idx" ON "medical_record" ("is_deleted");--> statement-breakpoint
CREATE INDEX "medication_dispenses_prescription_idx" ON "medication_dispenses" ("prescription_id");--> statement-breakpoint
CREATE INDEX "medication_dispenses_item_idx" ON "medication_dispenses" ("prescribed_item_id");--> statement-breakpoint
CREATE INDEX "neonatal_assessment_patient_idx" ON "neonatal_assessment" ("patient_id");--> statement-breakpoint
CREATE INDEX "nutritional_assessment_patient_idx" ON "nutritional_assessment" ("patient_id");--> statement-breakpoint
CREATE INDEX "patients_clinic_active_deleted_idx" ON "patient" ("clinic_id","is_active","is_deleted","created_at");--> statement-breakpoint
CREATE INDEX "patients_mrn_idx" ON "patient" ("mrn");--> statement-breakpoint
CREATE INDEX "patients_date_of_birth_idx" ON "patient" ("date_of_birth");--> statement-breakpoint
CREATE INDEX "patients_clinic_status_idx" ON "patient" ("clinic_id","status");--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patient" ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "payments_is_deleted_idx" ON "payment" ("is_deleted");--> statement-breakpoint
CREATE INDEX "payments_patient_status_idx" ON "payment" ("patient_id","status");--> statement-breakpoint
CREATE INDEX "payments_status_due_date_idx" ON "payment" ("status","due_date");--> statement-breakpoint
CREATE INDEX "payments_patient_payment_date_idx" ON "payment" ("patient_id","payment_date");--> statement-breakpoint
CREATE INDEX "prescriptions_clinic_id_idx" ON "prescriptions" ("clinic_id");--> statement-breakpoint
CREATE INDEX "prescription_logs_prescription_idx" ON "prescription_logs" ("prescription_id");--> statement-breakpoint
CREATE INDEX "rating_doctor_idx" ON "rating" ("staff_id");--> statement-breakpoint
CREATE INDEX "rating_patient_idx" ON "rating" ("patient_id");--> statement-breakpoint
CREATE INDEX "services_is_deleted_idx" ON "service" ("is_deleted");--> statement-breakpoint
CREATE INDEX "services_service_name_idx" ON "service" ("service_name");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "staffs_deleted_at_idx" ON "staff" ("deleted_at");--> statement-breakpoint
CREATE INDEX "staff_clinic_id_idx" ON "staff" ("clinic_id");--> statement-breakpoint
CREATE INDEX "staff_user_id_idx" ON "staff" ("user_id");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" ("user_id");--> statement-breakpoint
CREATE INDEX "vaccine_inventory_clinic_vaccine_idx" ON "vaccine_inventory" ("clinic_id","vaccine_name");--> statement-breakpoint
CREATE INDEX "vaccine_inventory_expiration_idx" ON "vaccine_inventory" ("expiration_date");--> statement-breakpoint
CREATE UNIQUE INDEX "vaccine_schedule_name_age_unique" ON "vaccine_schedule" ("vaccine_name","recommended_age");--> statement-breakpoint
CREATE INDEX "vaccine_schedule_age_range_idx" ON "vaccine_schedule" ("age_in_days_min","age_in_days_max");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "vital_signs_clinic_recorded_idx" ON "vital_sign" ("clinic_id","recorded_at");--> statement-breakpoint
CREATE INDEX "vital_signs_patient_recorded_idx" ON "vital_sign" ("patient_id","recorded_at");--> statement-breakpoint
CREATE INDEX "vital_signs_encounter_idx" ON "vital_sign" ("encounter_id");--> statement-breakpoint
CREATE UNIQUE INDEX "working_days_doctor_id_day_unique" ON "working_day" ("doctor_id","day");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "adverse_event" ADD CONSTRAINT "adverse_event_immunization_id_immunization_id_fkey" FOREIGN KEY ("immunization_id") REFERENCES "immunization"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "adverse_event" ADD CONSTRAINT "adverse_event_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "adverse_event" ADD CONSTRAINT "adverse_event_reported_by_staff_id_staff_id_fkey" FOREIGN KEY ("reported_by_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ai_report" ADD CONSTRAINT "ai_report_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_report" ADD CONSTRAINT "ai_report_doctor_id_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ai_report" ADD CONSTRAINT "ai_report_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_report" ADD CONSTRAINT "ai_report_generated_by_user_id_fkey" FOREIGN KEY ("generated_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_doctor_id_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_service_id_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users_to_clinic" ADD CONSTRAINT "users_to_clinic_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users_to_clinic" ADD CONSTRAINT "users_to_clinic_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "developmental_check" ADD CONSTRAINT "developmental_check_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "developmental_milestones" ADD CONSTRAINT "developmental_milestones_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagnosis" ADD CONSTRAINT "diagnosis_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "diagnosis" ADD CONSTRAINT "diagnosis_doctor_id_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagnosis" ADD CONSTRAINT "diagnosis_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagnosis" ADD CONSTRAINT "diagnosis_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "diagnosis" ADD CONSTRAINT "diagnosis_medical_id_medical_record_id_fkey" FOREIGN KEY ("medical_id") REFERENCES "medical_record"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "dose_guidelines" ADD CONSTRAINT "dose_guidelines_drug_id_drugs_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feeding_logs" ADD CONSTRAINT "feeding_logs_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_folder_id_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_id_folder_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "growth_record" ADD CONSTRAINT "growth_record_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "growth_record" ADD CONSTRAINT "growth_record_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "immunization" ADD CONSTRAINT "immunization_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "immunization" ADD CONSTRAINT "immunization_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "immunization" ADD CONSTRAINT "immunization_administered_by_staff_id_staff_id_fkey" FOREIGN KEY ("administered_by_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "immunization" ADD CONSTRAINT "immunization_record_id_medical_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "medical_record"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "immunization" ADD CONSTRAINT "immunization_vaccine_inventory_id_vaccine_inventory_id_fkey" FOREIGN KEY ("vaccine_inventory_id") REFERENCES "vaccine_inventory"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_used_by_user_id_fkey" FOREIGN KEY ("used_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lab_test" ADD CONSTRAINT "lab_test_diagnosis_id_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnosis"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lab_test" ADD CONSTRAINT "lab_test_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lab_test" ADD CONSTRAINT "lab_test_service_id_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_doctor_id_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medication_dispenses" ADD CONSTRAINT "medication_dispenses_beZC2ZbkrYEb_fkey" FOREIGN KEY ("prescribed_item_id") REFERENCES "prescribed_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medication_dispenses" ADD CONSTRAINT "medication_dispenses_prescription_id_prescriptions_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medication_dispenses" ADD CONSTRAINT "medication_dispenses_dispensed_by_user_id_fkey" FOREIGN KEY ("dispensed_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "neonatal_assessment" ADD CONSTRAINT "neonatal_assessment_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "neonatal_assessment" ADD CONSTRAINT "neonatal_assessment_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritional_assessment" ADD CONSTRAINT "nutritional_assessment_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritional_assessment" ADD CONSTRAINT "nutritional_assessment_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritional_recommendation" ADD CONSTRAINT "nutritional_recommendation_ZSqM0KtrRkpD_fkey" FOREIGN KEY ("assessment_id") REFERENCES "nutritional_assessment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritional_recommendation" ADD CONSTRAINT "nutritional_recommendation_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "nutritional_recommendation" ADD CONSTRAINT "nutritional_recommendation_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_guardian_id_guardians_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_created_by_id_user_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_updated_by_id_user_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patient_bill" ADD CONSTRAINT "patient_bill_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "patient_bill" ADD CONSTRAINT "patient_bill_service_id_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_appointment_id_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "prescribed_items" ADD CONSTRAINT "prescribed_items_prescription_id_prescriptions_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescribed_items" ADD CONSTRAINT "prescribed_items_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescribed_items" ADD CONSTRAINT "prescribed_items_drug_id_drugs_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_record"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounter_id_diagnosis_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "diagnosis"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescription_logs" ADD CONSTRAINT "prescription_logs_prescription_id_prescriptions_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescription_logs" ADD CONSTRAINT "prescription_logs_performed_by_user_id_fkey" FOREIGN KEY ("performed_by") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_staff_id_doctor_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "doctor"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_quota" ADD CONSTRAINT "user_quota_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vaccine_inventory" ADD CONSTRAINT "vaccine_inventory_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vaccine_schedule" ADD CONSTRAINT "vaccine_schedule_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vital_sign" ADD CONSTRAINT "vital_sign_clinic_id_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinic"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vital_sign" ADD CONSTRAINT "vital_sign_patient_id_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vital_sign" ADD CONSTRAINT "vital_sign_medical_id_medical_record_id_fkey" FOREIGN KEY ("medical_id") REFERENCES "medical_record"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vital_sign" ADD CONSTRAINT "vital_sign_encounter_id_diagnosis_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "diagnosis"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "working_day" ADD CONSTRAINT "working_day_doctor_id_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE;