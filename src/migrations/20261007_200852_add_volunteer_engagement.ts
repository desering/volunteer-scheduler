import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_signups_attendance" AS ENUM('attended', 'no-show');
  CREATE TYPE "public"."enum_users_regular_override" AS ENUM('auto', 'always', 'never');
  CREATE TYPE "public"."enum_skill_awards_source" AS ENUM('training', 'coordinator');
  CREATE TYPE "public"."enum_messages_audience_regulars" AS ENUM('any', 'only', 'exclude');
  CREATE TYPE "public"."enum_messages_audience_did_shift_weekday" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('draft', 'sending', 'sent');
  CREATE TYPE "public"."enum_message_deliveries_kind" AS ENUM('message', 'after-shift');
  CREATE TYPE "public"."enum_message_deliveries_status" AS ENUM('sent', 'failed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'process-ended-shifts';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'send-volunteer-message';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'process-ended-shifts';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'send-volunteer-message';
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge" varchar DEFAULT '⭐' NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"invite_after_shifts" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "skills_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer
  );
  
  CREATE TABLE "skill_awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"skill_id" integer NOT NULL,
  	"source" "enum_skill_awards_source" DEFAULT 'coordinator' NOT NULL,
  	"event_id" integer,
  	"awarded_at" timestamp(3) with time zone NOT NULL,
  	"awarded_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"audience_min_shifts" numeric,
  	"audience_max_shifts" numeric,
  	"audience_active_within_days" numeric,
  	"audience_inactive_for_days" numeric,
  	"audience_regulars" "enum_messages_audience_regulars" DEFAULT 'any',
  	"audience_did_shift_role_contains" varchar,
  	"audience_did_shift_weekday" "enum_messages_audience_did_shift_weekday",
  	"audience_did_shift_within_days" numeric,
  	"status" "enum_messages_status" DEFAULT 'draft' NOT NULL,
  	"sent_at" timestamp(3) with time zone,
  	"sent_by_id" integer,
  	"recipient_count" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "message_deliveries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"kind" "enum_message_deliveries_kind" NOT NULL,
  	"message_id" integer,
  	"signup_id" integer,
  	"subject" varchar NOT NULL,
  	"status" "enum_message_deliveries_status" NOT NULL,
  	"error" varchar,
  	"sent_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "regular_card_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"viewed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "volunteer_settings_perks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "volunteer_settings_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"shifts" numeric NOT NULL,
  	"label" varchar NOT NULL,
  	"badge" varchar NOT NULL
  );
  
  CREATE TABLE "volunteer_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"regular_min_shifts" numeric DEFAULT 4 NOT NULL,
  	"regular_window_days" numeric DEFAULT 60 NOT NULL,
  	"card_note" varchar DEFAULT 'Show this screen at the bar.',
  	"after_shift_emails" boolean DEFAULT false,
  	"after_shift_delay_hours" numeric DEFAULT 3 NOT NULL,
  	"after_shift_subject" varchar DEFAULT 'Thank you for your shift, {name}!' NOT NULL,
  	"after_shift_body" varchar DEFAULT 'Hi {name},
  
  Thank you for volunteering at {event}. Every shift keeps De Sering going, and we are really glad you were there.
  
  Hope to see you again soon!' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "event_templates_rels" ADD COLUMN "skills_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "skills_id" integer;
  ALTER TABLE "signups" ADD COLUMN "attendance" "enum_signups_attendance";
  ALTER TABLE "signups" ADD COLUMN "after_shift_processed_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "regular_override" "enum_users_regular_override" DEFAULT 'auto';
  ALTER TABLE "payload_jobs" ADD COLUMN "meta" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "skills_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "skill_awards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "messages_id" integer;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skill_awards" ADD CONSTRAINT "skill_awards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skill_awards" ADD CONSTRAINT "skill_awards_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skill_awards" ADD CONSTRAINT "skill_awards_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skill_awards" ADD CONSTRAINT "skill_awards_awarded_by_id_users_id_fk" FOREIGN KEY ("awarded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages_rels" ADD CONSTRAINT "messages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "messages_rels" ADD CONSTRAINT "messages_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "messages_rels" ADD CONSTRAINT "messages_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "message_deliveries" ADD CONSTRAINT "message_deliveries_signup_id_signups_id_fk" FOREIGN KEY ("signup_id") REFERENCES "public"."signups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regular_card_views" ADD CONSTRAINT "regular_card_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "volunteer_settings_perks" ADD CONSTRAINT "volunteer_settings_perks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."volunteer_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "volunteer_settings_milestones" ADD CONSTRAINT "volunteer_settings_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."volunteer_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  CREATE INDEX "skills_rels_order_idx" ON "skills_rels" USING btree ("order");
  CREATE INDEX "skills_rels_parent_idx" ON "skills_rels" USING btree ("parent_id");
  CREATE INDEX "skills_rels_path_idx" ON "skills_rels" USING btree ("path");
  CREATE INDEX "skills_rels_skills_id_idx" ON "skills_rels" USING btree ("skills_id");
  CREATE INDEX "skill_awards_user_idx" ON "skill_awards" USING btree ("user_id");
  CREATE INDEX "skill_awards_skill_idx" ON "skill_awards" USING btree ("skill_id");
  CREATE INDEX "skill_awards_event_idx" ON "skill_awards" USING btree ("event_id");
  CREATE INDEX "skill_awards_awarded_by_idx" ON "skill_awards" USING btree ("awarded_by_id");
  CREATE INDEX "skill_awards_updated_at_idx" ON "skill_awards" USING btree ("updated_at");
  CREATE INDEX "skill_awards_created_at_idx" ON "skill_awards" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_skill_idx" ON "skill_awards" USING btree ("user_id","skill_id");
  CREATE INDEX "messages_sent_by_idx" ON "messages" USING btree ("sent_by_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "messages_rels_order_idx" ON "messages_rels" USING btree ("order");
  CREATE INDEX "messages_rels_parent_idx" ON "messages_rels" USING btree ("parent_id");
  CREATE INDEX "messages_rels_path_idx" ON "messages_rels" USING btree ("path");
  CREATE INDEX "messages_rels_skills_id_idx" ON "messages_rels" USING btree ("skills_id");
  CREATE INDEX "messages_rels_tags_id_idx" ON "messages_rels" USING btree ("tags_id");
  CREATE INDEX "message_deliveries_user_idx" ON "message_deliveries" USING btree ("user_id");
  CREATE INDEX "message_deliveries_message_idx" ON "message_deliveries" USING btree ("message_id");
  CREATE INDEX "message_deliveries_signup_idx" ON "message_deliveries" USING btree ("signup_id");
  CREATE INDEX "message_deliveries_updated_at_idx" ON "message_deliveries" USING btree ("updated_at");
  CREATE INDEX "message_deliveries_created_at_idx" ON "message_deliveries" USING btree ("created_at");
  CREATE UNIQUE INDEX "message_user_idx" ON "message_deliveries" USING btree ("message_id","user_id");
  CREATE INDEX "regular_card_views_user_idx" ON "regular_card_views" USING btree ("user_id");
  CREATE INDEX "regular_card_views_viewed_at_idx" ON "regular_card_views" USING btree ("viewed_at");
  CREATE INDEX "regular_card_views_updated_at_idx" ON "regular_card_views" USING btree ("updated_at");
  CREATE INDEX "regular_card_views_created_at_idx" ON "regular_card_views" USING btree ("created_at");
  CREATE INDEX "volunteer_settings_perks_order_idx" ON "volunteer_settings_perks" USING btree ("_order");
  CREATE INDEX "volunteer_settings_perks_parent_id_idx" ON "volunteer_settings_perks" USING btree ("_parent_id");
  CREATE INDEX "volunteer_settings_milestones_order_idx" ON "volunteer_settings_milestones" USING btree ("_order");
  CREATE INDEX "volunteer_settings_milestones_parent_id_idx" ON "volunteer_settings_milestones" USING btree ("_parent_id");
  ALTER TABLE "event_templates_rels" ADD CONSTRAINT "event_templates_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skill_awards_fk" FOREIGN KEY ("skill_awards_id") REFERENCES "public"."skill_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_templates_rels_skills_id_idx" ON "event_templates_rels" USING btree ("skills_id");
  CREATE INDEX "events_rels_skills_id_idx" ON "events_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_skill_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("skill_awards_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Hand-edited after generation: IF EXISTS on constraints that the
  // DROP TABLE ... CASCADE above already removed, and deleting queued jobs of
  // the two new task types before their enum values disappear.
  await db.execute(sql`
   ALTER TABLE "skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "skills_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "skill_awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "messages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "message_deliveries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regular_card_views" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteer_settings_perks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteer_settings_milestones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteer_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "skills" CASCADE;
  DROP TABLE "skills_rels" CASCADE;
  DROP TABLE "skill_awards" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "messages_rels" CASCADE;
  DROP TABLE "message_deliveries" CASCADE;
  DROP TABLE "regular_card_views" CASCADE;
  DROP TABLE "volunteer_settings_perks" CASCADE;
  DROP TABLE "volunteer_settings_milestones" CASCADE;
  DROP TABLE "volunteer_settings" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "event_templates_rels" DROP CONSTRAINT IF EXISTS "event_templates_rels_skills_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT IF EXISTS "events_rels_skills_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_skills_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_skill_awards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_messages_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DELETE FROM "payload_jobs_log" WHERE "task_slug" IN ('process-ended-shifts', 'send-volunteer-message');
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'send-event-signup-confirmation-email');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DELETE FROM "payload_jobs" WHERE "task_slug" IN ('process-ended-shifts', 'send-volunteer-message');
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'send-event-signup-confirmation-email');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "event_templates_rels_skills_id_idx";
  DROP INDEX "events_rels_skills_id_idx";
  DROP INDEX "payload_locked_documents_rels_skills_id_idx";
  DROP INDEX "payload_locked_documents_rels_skill_awards_id_idx";
  DROP INDEX "payload_locked_documents_rels_messages_id_idx";
  ALTER TABLE "event_templates_rels" DROP COLUMN "skills_id";
  ALTER TABLE "events_rels" DROP COLUMN "skills_id";
  ALTER TABLE "signups" DROP COLUMN "attendance";
  ALTER TABLE "signups" DROP COLUMN "after_shift_processed_at";
  ALTER TABLE "users" DROP COLUMN "regular_override";
  ALTER TABLE "payload_jobs" DROP COLUMN "meta";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "skills_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "skill_awards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "messages_id";
  DROP TYPE "public"."enum_signups_attendance";
  DROP TYPE "public"."enum_users_regular_override";
  DROP TYPE "public"."enum_skill_awards_source";
  DROP TYPE "public"."enum_messages_audience_regulars";
  DROP TYPE "public"."enum_messages_audience_did_shift_weekday";
  DROP TYPE "public"."enum_messages_status";
  DROP TYPE "public"."enum_message_deliveries_kind";
  DROP TYPE "public"."enum_message_deliveries_status";`)
}
