import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_announcements_status" AS ENUM('neutral', 'info', 'warning', 'error', 'success');
  ALTER TABLE "announcements" ADD COLUMN "status" "enum_announcements_status" DEFAULT 'info';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "announcements" DROP COLUMN "status";
  DROP TYPE "public"."enum_announcements_status";`)
}
