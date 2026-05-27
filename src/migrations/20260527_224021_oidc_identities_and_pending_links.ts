import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_user_identities_kind" AS ENUM('oidc');
  CREATE TABLE "oidc_pending_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"issuer" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "user_identities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum_user_identities_kind" DEFAULT 'oidc' NOT NULL,
  	"issuer" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"email_at_link_time" varchar,
  	"linked_at" timestamp(3) with time zone NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "oidc_pending_links" ADD CONSTRAINT "oidc_pending_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "oidc_pending_links_token_idx" ON "oidc_pending_links" USING btree ("token");
  CREATE INDEX "oidc_pending_links_expires_at_idx" ON "oidc_pending_links" USING btree ("expires_at");
  CREATE INDEX "oidc_pending_links_user_idx" ON "oidc_pending_links" USING btree ("user_id");
  CREATE INDEX "oidc_pending_links_updated_at_idx" ON "oidc_pending_links" USING btree ("updated_at");
  CREATE INDEX "oidc_pending_links_created_at_idx" ON "oidc_pending_links" USING btree ("created_at");
  CREATE INDEX "user_identities_issuer_idx" ON "user_identities" USING btree ("issuer");
  CREATE INDEX "user_identities_subject_idx" ON "user_identities" USING btree ("subject");
  CREATE INDEX "user_identities_user_idx" ON "user_identities" USING btree ("user_id");
  CREATE INDEX "user_identities_updated_at_idx" ON "user_identities" USING btree ("updated_at");
  CREATE INDEX "user_identities_created_at_idx" ON "user_identities" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "oidc_pending_links" CASCADE;
  DROP TABLE "user_identities" CASCADE;
  DROP TYPE "public"."enum_user_identities_kind";`)
}
