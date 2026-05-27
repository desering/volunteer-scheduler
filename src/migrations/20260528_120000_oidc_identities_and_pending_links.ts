import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_user_identities_kind" AS ENUM('oidc');

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

   ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "oidc_pending_links" ADD CONSTRAINT "oidc_pending_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

   CREATE UNIQUE INDEX "user_identities_issuer_subject_uidx" ON "user_identities" USING btree ("issuer","subject");
   CREATE INDEX "user_identities_issuer_idx" ON "user_identities" USING btree ("issuer");
   CREATE INDEX "user_identities_subject_idx" ON "user_identities" USING btree ("subject");
   CREATE INDEX "user_identities_user_idx" ON "user_identities" USING btree ("user_id");
   CREATE INDEX "user_identities_updated_at_idx" ON "user_identities" USING btree ("updated_at");
   CREATE INDEX "user_identities_created_at_idx" ON "user_identities" USING btree ("created_at");

   CREATE UNIQUE INDEX "oidc_pending_links_token_idx" ON "oidc_pending_links" USING btree ("token");
   CREATE INDEX "oidc_pending_links_expires_at_idx" ON "oidc_pending_links" USING btree ("expires_at");
   CREATE INDEX "oidc_pending_links_user_idx" ON "oidc_pending_links" USING btree ("user_id");
   CREATE INDEX "oidc_pending_links_updated_at_idx" ON "oidc_pending_links" USING btree ("updated_at");
   CREATE INDEX "oidc_pending_links_created_at_idx" ON "oidc_pending_links" USING btree ("created_at");

   DO $$
   BEGIN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'oidc_issuer'
    ) AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'oidc_subject'
    ) THEN
      INSERT INTO "user_identities" ("kind", "issuer", "subject", "email_at_link_time", "linked_at", "user_id")
      SELECT
        'oidc',
        "oidc_issuer",
        "oidc_subject",
        "email",
        COALESCE("updated_at", now()),
        "id"
      FROM "users"
      WHERE "oidc_issuer" IS NOT NULL
        AND "oidc_subject" IS NOT NULL
      ON CONFLICT ("issuer", "subject") DO NOTHING;

      ALTER TABLE "users" DROP COLUMN IF EXISTS "oidc_issuer";
      ALTER TABLE "users" DROP COLUMN IF EXISTS "oidc_subject";
    END IF;
   END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oidc_issuer" varchar;
   ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oidc_subject" varchar;

   UPDATE "users" AS "users"
   SET
    "oidc_issuer" = "identity"."issuer",
    "oidc_subject" = "identity"."subject"
   FROM (
    SELECT DISTINCT ON ("user_id")
      "user_id",
      "issuer",
      "subject"
    FROM "user_identities"
    ORDER BY "user_id", "created_at" ASC
   ) AS "identity"
   WHERE "users"."id" = "identity"."user_id";

   CREATE INDEX IF NOT EXISTS "users_oidc_issuer_idx" ON "users" USING btree ("oidc_issuer");
   CREATE UNIQUE INDEX IF NOT EXISTS "users_oidc_subject_idx" ON "users" USING btree ("oidc_subject");

   DROP TABLE "oidc_pending_links" CASCADE;
   DROP TABLE "user_identities" CASCADE;
   DROP TYPE "public"."enum_user_identities_kind";
  `);
}
