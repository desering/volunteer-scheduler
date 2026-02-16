import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_notification_preferenc_fk";
  
  DROP INDEX "payload_locked_documents_rels_user_notification_preferen_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_notification_preferences_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_notification_preferences_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_notification_preferenc_fk" FOREIGN KEY ("user_notification_preferences_id") REFERENCES "public"."user_notification_preferences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_user_notification_preferen_idx" ON "payload_locked_documents_rels" USING btree ("user_notification_preferences_id");`)
}
