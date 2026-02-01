import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "event_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer
  );
  
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"badge" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events_rels" ADD COLUMN "skills_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "skills_id" integer;
  ALTER TABLE "event_templates_rels" ADD CONSTRAINT "event_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_templates_rels" ADD CONSTRAINT "event_templates_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_templates_rels_order_idx" ON "event_templates_rels" USING btree ("order");
  CREATE INDEX "event_templates_rels_parent_idx" ON "event_templates_rels" USING btree ("parent_id");
  CREATE INDEX "event_templates_rels_path_idx" ON "event_templates_rels" USING btree ("path");
  CREATE INDEX "event_templates_rels_skills_id_idx" ON "event_templates_rels" USING btree ("skills_id");
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_rels_skills_id_idx" ON "events_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_templates_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "skills" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_templates_rels" CASCADE;
  DROP TABLE "skills" CASCADE;
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_skills_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_skills_fk";
  
  DROP INDEX "events_rels_skills_id_idx";
  DROP INDEX "payload_locked_documents_rels_skills_id_idx";
  ALTER TABLE "events_rels" DROP COLUMN "skills_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "skills_id";`)
}
