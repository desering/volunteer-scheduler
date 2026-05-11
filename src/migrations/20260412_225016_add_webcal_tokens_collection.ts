import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "webcal_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "webcal_tokens" ADD CONSTRAINT "webcal_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "webcal_tokens_token_idx" ON "webcal_tokens" USING btree ("token");
  CREATE UNIQUE INDEX "webcal_tokens_user_idx" ON "webcal_tokens" USING btree ("user_id");
  CREATE INDEX "webcal_tokens_updated_at_idx" ON "webcal_tokens" USING btree ("updated_at");
  CREATE INDEX "webcal_tokens_created_at_idx" ON "webcal_tokens" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "webcal_tokens" CASCADE;`)
}
