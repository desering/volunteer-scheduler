"use server";

import type { Event, Role, Section, Signup, Tag } from "@/payload-types";

export type EventDetailsRole = Omit<Role, "signups"> & {
  signups: Signup[];
};

export type EventDetails = Omit<
  Event,
  "sections" | "roles" | "signups" | "tags"
> & {
  sections: (Section & {
    roles: EventDetailsRole[];
  })[];
  roles: EventDetailsRole[];
  tags: Tag[];
};
