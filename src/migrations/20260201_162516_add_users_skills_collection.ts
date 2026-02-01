import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"skill_id" integer NOT NULL,
  	"learnt" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "users_skills_id" integer;
  ALTER TABLE "users_skills" ADD CONSTRAINT "users_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_skills" ADD CONSTRAINT "users_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_skills_user_idx" ON "users_skills" USING btree ("user_id");
  CREATE INDEX "users_skills_skill_idx" ON "users_skills" USING btree ("skill_id");
  CREATE INDEX "users_skills_updated_at_idx" ON "users_skills" USING btree ("updated_at");
  CREATE INDEX "users_skills_created_at_idx" ON "users_skills" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_skills_fk" FOREIGN KEY ("users_skills_id") REFERENCES "public"."users_skills"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_users_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("users_skills_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_skills" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_skills" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_users_skills_fk";
  
  DROP INDEX "payload_locked_documents_rels_users_skills_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "users_skills_id";`)
}
