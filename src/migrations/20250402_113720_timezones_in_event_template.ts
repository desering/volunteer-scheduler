import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_templates_start_time_tz" AS ENUM('Europe/Amsterdam');
  ALTER TABLE "event_templates" ADD COLUMN "start_time_tz" "enum_event_templates_start_time_tz" DEFAULT 'Europe/Amsterdam' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_templates" DROP COLUMN IF EXISTS "start_time_tz";
  DROP TYPE "public"."enum_event_templates_start_time_tz";`)
}
