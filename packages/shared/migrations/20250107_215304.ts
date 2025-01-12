import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'nl');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'volunteer');
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"roles" "enum_users_roles",
  	"preferred_name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "event_templates_sections_roles_signups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "event_templates_sections_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"max_signups" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "event_templates_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "event_templates_roles_signups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "event_templates_roles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"max_signups" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "event_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"template_title" varchar NOT NULL,
  	"event_title" varchar NOT NULL,
  	"start_time" timestamp(3) with time zone NOT NULL,
  	"end_time" timestamp(3) with time zone NOT NULL,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer,
  	"section_id" integer,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"max_signups" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "signups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" integer,
  	"role_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"event_templates_id" integer,
  	"events_id" integer,
  	"sections_id" integer,
  	"roles_id" integer,
  	"signups_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_sections_roles_signups" ADD CONSTRAINT "event_templates_sections_roles_signups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_sections_roles_signups" ADD CONSTRAINT "event_templates_sections_roles_signups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_templates_sections_roles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_sections_roles" ADD CONSTRAINT "event_templates_sections_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_templates_sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_sections" ADD CONSTRAINT "event_templates_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_templates"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_roles_signups" ADD CONSTRAINT "event_templates_roles_signups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_roles_signups" ADD CONSTRAINT "event_templates_roles_signups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_templates_roles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "event_templates_roles" ADD CONSTRAINT "event_templates_roles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_templates"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "sections" ADD CONSTRAINT "sections_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "roles" ADD CONSTRAINT "roles_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "roles" ADD CONSTRAINT "roles_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "signups" ADD CONSTRAINT "signups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "signups" ADD CONSTRAINT "signups_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "signups" ADD CONSTRAINT "signups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_templates_fk" FOREIGN KEY ("event_templates_id") REFERENCES "public"."event_templates"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sections_fk" FOREIGN KEY ("sections_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_signups_fk" FOREIGN KEY ("signups_id") REFERENCES "public"."signups"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_roles_signups_order_idx" ON "event_templates_sections_roles_signups" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_roles_signups_parent_id_idx" ON "event_templates_sections_roles_signups" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_roles_signups_user_idx" ON "event_templates_sections_roles_signups" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_roles_order_idx" ON "event_templates_sections_roles" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_roles_parent_id_idx" ON "event_templates_sections_roles" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_order_idx" ON "event_templates_sections" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_templates_sections_parent_id_idx" ON "event_templates_sections" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_templates_roles_signups_order_idx" ON "event_templates_roles_signups" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_templates_roles_signups_parent_id_idx" ON "event_templates_roles_signups" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_templates_roles_signups_user_idx" ON "event_templates_roles_signups" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "event_templates_roles_order_idx" ON "event_templates_roles" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "event_templates_roles_parent_id_idx" ON "event_templates_roles" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "event_templates_updated_at_idx" ON "event_templates" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "event_templates_created_at_idx" ON "event_templates" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "sections_event_idx" ON "sections" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "sections_updated_at_idx" ON "sections" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "sections_created_at_idx" ON "sections" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "roles_event_idx" ON "roles" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "roles_section_idx" ON "roles" USING btree ("section_id");
  CREATE INDEX IF NOT EXISTS "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "signups_event_idx" ON "signups" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "signups_role_idx" ON "signups" USING btree ("role_id");
  CREATE INDEX IF NOT EXISTS "signups_user_idx" ON "signups" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "signups_updated_at_idx" ON "signups" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "signups_created_at_idx" ON "signups" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_event_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("event_templates_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("sections_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_signups_id_idx" ON "payload_locked_documents_rels" USING btree ("signups_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users" CASCADE;
  DROP TABLE "event_templates_sections_roles_signups" CASCADE;
  DROP TABLE "event_templates_sections_roles" CASCADE;
  DROP TABLE "event_templates_sections" CASCADE;
  DROP TABLE "event_templates_roles_signups" CASCADE;
  DROP TABLE "event_templates_roles" CASCADE;
  DROP TABLE "event_templates" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "sections" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "signups" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";`)
}
