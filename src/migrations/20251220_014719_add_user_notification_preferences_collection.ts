import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "user_notification_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"type" varchar NOT NULL,
  	"channel" varchar NOT NULL,
  	"preference" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "user_notification_preferences_id" integer;
  ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "user_notification_preferences_user_idx" ON "user_notification_preferences" USING btree ("user_id");
  CREATE INDEX "user_notification_preferences_updated_at_idx" ON "user_notification_preferences" USING btree ("updated_at");
  CREATE INDEX "user_notification_preferences_created_at_idx" ON "user_notification_preferences" USING btree ("created_at");
  CREATE UNIQUE INDEX "user_type_channel_idx" ON "user_notification_preferences" USING btree ("user_id","type","channel");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_notification_preferenc_fk" FOREIGN KEY ("user_notification_preferences_id") REFERENCES "public"."user_notification_preferences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_user_notification_preferen_idx" ON "payload_locked_documents_rels" USING btree ("user_notification_preferences_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "user_notification_preferences" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "user_notification_preferences" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_user_notification_preferenc_fk";
  
  DROP INDEX "payload_locked_documents_rels_user_notification_preferen_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "user_notification_preferences_id";`)
}
