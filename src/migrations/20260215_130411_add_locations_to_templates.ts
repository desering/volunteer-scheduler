import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "event_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"locations_id" integer
  );
  
  ALTER TABLE "event_templates_rels" ADD CONSTRAINT "event_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_templates_rels" ADD CONSTRAINT "event_templates_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_templates_rels" ADD CONSTRAINT "event_templates_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_templates_rels_order_idx" ON "event_templates_rels" USING btree ("order");
  CREATE INDEX "event_templates_rels_parent_idx" ON "event_templates_rels" USING btree ("parent_id");
  CREATE INDEX "event_templates_rels_path_idx" ON "event_templates_rels" USING btree ("path");
  CREATE INDEX "event_templates_rels_tags_id_idx" ON "event_templates_rels" USING btree ("tags_id");
  CREATE INDEX "event_templates_rels_locations_id_idx" ON "event_templates_rels" USING btree ("locations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "event_templates_rels" CASCADE;`)
}
