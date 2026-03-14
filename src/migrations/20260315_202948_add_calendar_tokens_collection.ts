import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "calendar_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "calendar_tokens" ADD CONSTRAINT "calendar_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "calendar_tokens_token_idx" ON "calendar_tokens" USING btree ("token");
  CREATE UNIQUE INDEX "calendar_tokens_user_idx" ON "calendar_tokens" USING btree ("user_id");
  CREATE INDEX "calendar_tokens_updated_at_idx" ON "calendar_tokens" USING btree ("updated_at");
  CREATE INDEX "calendar_tokens_created_at_idx" ON "calendar_tokens" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "calendar_tokens" CASCADE;`)
}
