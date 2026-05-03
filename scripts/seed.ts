/**
 * Seed script for local development.
 *
 * Usage:
 *   npm run seed or bun --bun seed
 *
 * Requires the DB to be running and migrations applied (npm run dev once first).
 * Idempotent: re-running clears existing data and re-seeds.
 *
 * To add/modify seed data, edit the DATA section below.
 */
import "dotenv/config";
import config from "@payload-config";
import { getPayload } from "payload";

// =============================================================================
// DATA — edit this section to change what gets seeded
// =============================================================================

const TAGS = ["Kids", "Cooking", "Music"];

const LOCATIONS = [
  { title: "De Sering", address: "Rhoneweg 6, 1043 AH Amsterdam" },
  { title: "Garden", address: "Rhoneweg 6 (achtertuin), 1043 AH Amsterdam" },
];

const USERS: {
  email: string;
  preferredName: string;
  roles: "admin" | "editor" | "volunteer";
  password: string;
}[] = [
  {
    email: "admin@desering.nl",
    preferredName: "Admin",
    roles: "admin",
    password: "password",
  },
  {
    email: "alice@example.com",
    preferredName: "Alice",
    roles: "volunteer",
    password: "password",
  },
  {
    email: "bob@example.com",
    preferredName: "Bob",
    roles: "volunteer",
    password: "password",
  },
  {
    email: "carol@example.com",
    preferredName: "Carol",
    roles: "volunteer",
    password: "password",
  },
  {
    email: "david@example.com",
    preferredName: "David",
    roles: "editor",
    password: "password",
  },
];

// daysFromNow(0) = today, daysFromNow(-7) = last week, etc.
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

// Events reference tags/locations by the names defined above
const EVENTS: {
  title: string;
  description?: string;
  start: Date;
  durationHours: number;
  tags?: string[];
  location?: string;
  sections?: {
    title: string;
    roles: { title: string; maxSignups: number }[];
  }[];
  roles?: { title: string; maxSignups: number }[];
}[] = [
  {
    title: "Zomerbarbecue",
    description:
      "Gezellige zomerbarbecue in de tuin voor bewoners en vrijwilligers. We grillen samen en genieten van de zomer.",
    start: daysFromNow(-14),
    durationHours: 3,
    tags: ["Kids", "Cooking"],
    location: "Garden",
    roles: [
      { title: "Kok", maxSignups: 2 },
      { title: "Helper", maxSignups: 0 },
    ],
  },
  {
    title: "Koffie & Koek Ochtend",
    description:
      "Een laagdrempelige ochtend met koffie, thee en koek. Fijn om bij te praten en nieuwe mensen te ontmoeten.",
    start: daysFromNow(2),
    durationHours: 2,
    tags: ["Cooking"],
    location: "De Sering",
    sections: [
      {
        title: "Ochtend",
        roles: [
          { title: "Kok", maxSignups: 1 },
          { title: "Gastheer", maxSignups: 2 },
        ],
      },
      {
        title: "Middag",
        roles: [{ title: "Gastvrouw", maxSignups: 2 }],
      },
    ],
  },
  {
    title: "Muziekmiddag voor Kinderen",
    description:
      "Een interactieve muziekmiddag speciaal voor kinderen. We zingen, spelen instrumenten en dansen samen.",
    start: daysFromNow(8),
    durationHours: 3,
    tags: ["Kids", "Music"],
    location: "De Sering",
    roles: [
      { title: "Muziekbegeleider", maxSignups: 1 },
      { title: "Kinderopvang", maxSignups: 3 },
    ],
  },
  {
    title: "Algemene Vergadering",
    description:
      "Tweejaarlijkse vergadering voor alle vrijwilligers en bestuur. Agenda en stukken worden vooraf gedeeld.",
    start: daysFromNow(15),
    durationHours: 1.5,
    location: "Garden",
    roles: [
      { title: "Voorzitter", maxSignups: 1 },
      { title: "Notulist", maxSignups: 1 },
    ],
  },
];

// Signups: [userEmail, eventTitle, roleTitle]
const SIGNUPS: [string, string, string][] = [
  ["alice@example.com", "Zomerbarbecue", "Kok"],
  ["bob@example.com", "Zomerbarbecue", "Helper"],
  ["carol@example.com", "Zomerbarbecue", "Helper"],
  ["alice@example.com", "Koffie & Koek Ochtend", "Kok"],
  ["bob@example.com", "Koffie & Koek Ochtend", "Gastheer"],
  ["carol@example.com", "Muziekmiddag voor Kinderen", "Muziekbegeleider"],
  ["david@example.com", "Algemene Vergadering", "Voorzitter"],
];

// =============================================================================
// SEED LOGIC — you shouldn't need to edit below this line
// =============================================================================

const toRichText = (text: string) =>
  ({
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textStyle: "",
          textFormat: 0,
          children: [
            {
              type: "text",
              text,
              format: 0,
              style: "",
              mode: "normal",
              detail: 0,
              version: 1,
            },
          ],
        },
      ],
      direction: "ltr" as const,
    },
  }) as const;

const payload = await getPayload({ config });

// Wipe existing data in FK-safe order
const pool = (
  payload.db as unknown as {
    pool: { query: (sql: string) => Promise<unknown> };
  }
).pool;
const tables = [
  "signups",
  "webcal_tokens",
  "users_sessions",
  "payload_preferences_rels",
  "payload_preferences",
  "roles",
  "sections",
  "events",
  "locations",
  "tags",
  "users",
];
process.stdout.write("Clearing existing data... ");
for (const table of tables) {
  await pool.query(`DELETE FROM "${table}"`);
}
console.log("done");

// Tags
process.stdout.write(`Creating ${TAGS.length} tags... `);
const tagRecords = await Promise.all(
  TAGS.map((text) => payload.create({ collection: "tags", data: { text } })),
);
const tagByName = Object.fromEntries(tagRecords.map((t) => [t.text, t]));
console.log(TAGS.join(", "));

// Locations
process.stdout.write(`Creating ${LOCATIONS.length} locations... `);
const locationRecords = await Promise.all(
  LOCATIONS.map((l) => payload.create({ collection: "locations", data: l })),
);
const locationByName = Object.fromEntries(
  locationRecords.map((l) => [l.title, l]),
);
console.log(LOCATIONS.map((l) => l.title).join(", "));

// Users
process.stdout.write(`Creating ${USERS.length} users... `);
const userRecords = await Promise.all(
  USERS.map((u) => payload.create({ collection: "users", data: u })),
);
const userByEmail = Object.fromEntries(userRecords.map((u) => [u.email, u]));
console.log(USERS.map((u) => `${u.email} (${u.roles})`).join(", "));

// Events, sections, and roles
console.log(`Creating ${EVENTS.length} events:`);
const roleByKey: Record<string, { id: number; eventId: number }> = {}; // "eventTitle:roleTitle" -> role

for (const eventDef of EVENTS) {
  const start = eventDef.start;
  const end = new Date(
    start.getTime() + eventDef.durationHours * 60 * 60 * 1000,
  );

  const event = await payload.create({
    collection: "events",
    data: {
      title: eventDef.title,
      description: eventDef.description
        ? toRichText(eventDef.description)
        : undefined,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      tags: eventDef.tags?.map((name) => tagByName[name].id) ?? [],
      locations: eventDef.location
        ? [locationByName[eventDef.location].id]
        : [],
    },
  });

  const allRoles: string[] = [];

  // Top-level roles (no section)
  for (const roleDef of eventDef.roles ?? []) {
    const role = await payload.create({
      collection: "roles",
      data: {
        title: roleDef.title,
        event: event.id,
        maxSignups: roleDef.maxSignups,
      },
    });
    roleByKey[`${eventDef.title}:${roleDef.title}`] = {
      id: role.id,
      eventId: event.id,
    };
    allRoles.push(roleDef.title);
  }

  // Sections with their roles
  for (const sectionDef of eventDef.sections ?? []) {
    const section = await payload.create({
      collection: "sections",
      data: { title: sectionDef.title, event: event.id },
    });
    for (const roleDef of sectionDef.roles) {
      const role = await payload.create({
        collection: "roles",
        data: {
          title: roleDef.title,
          event: event.id,
          section: section.id,
          maxSignups: roleDef.maxSignups,
        },
      });
      roleByKey[`${eventDef.title}:${roleDef.title}`] = {
        id: role.id,
        eventId: event.id,
      };
      allRoles.push(`${sectionDef.title}/${roleDef.title}`);
    }
  }

  console.log(`  ${eventDef.title} — ${allRoles.join(", ")}`);
}

// Signups
console.log(`Creating ${SIGNUPS.length} signups:`);
for (const [email, eventTitle, roleTitle] of SIGNUPS) {
  const user = userByEmail[email];
  const role = roleByKey[`${eventTitle}:${roleTitle}`];
  await payload.create({
    collection: "signups",
    data: { event: role.eventId, role: role.id, user: user.id },
    overrideAccess: true,
  });
  console.log(`  ${email} → ${eventTitle} / ${roleTitle}`);
}

console.log("\n✓ Seed complete");
process.exit(0);
