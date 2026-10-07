import { format } from "@/utils/tz-format";

/** Absolute links for emails. SERVER_URL is the public address of the app. */
const base = () => (process.env.SERVER_URL ?? "").replace(/\/$/, "");

export const appUrls = {
  schedule: () => `${base()}/`,
  progress: () => `${base()}/account/progress`,
  account: () => `${base()}/account`,
  /** Opens the schedule on the event's day with the event drawer open. */
  event: (event: { id: number; start: Date }) =>
    `${base()}/?date=${format(event.start, "yyyy-MM-dd")}&eventId=${event.id}`,
};
