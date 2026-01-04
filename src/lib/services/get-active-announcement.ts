"use server";

import config from "@payload-config";
import { getPayload } from "payload";

export const getActiveAnnouncement = async () => {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "announcements",
    limit: 1,
    sort: "-updatedAt",
  });

  const announcement = result.docs[0];

  if (!announcement) {
    return null;
  }

  // Return only serializable data to avoid React Server Component issues
  return {
    id: announcement.id,
    title: announcement.title,
    description: announcement.description,
  };
};
