"use server";

import config from "@payload-config";
import { connection } from "next/server";
import { getPayload } from "payload";
import { traced } from "@/utils/otel";

export const getMostRecentAnnouncement = async () => {
  return await traced(
    "homepage.getMostRecentAnnouncement",
    async (span) => {
      await connection(); // Disable caching for this function

      const payload = await getPayload({ config });

      const result = await payload.find({
        collection: "announcements",
        limit: 1,
        sort: "-updatedAt",
      });

      const announcement = result.docs[0];

      span.setAttribute("announcement.found", Boolean(announcement));
      span.setAttribute("announcement.result_count", result.docs.length);

      if (!announcement) {
        return null;
      }

      // Return only serializable data to avoid React Server Component issues
      return {
        id: announcement.id,
        title: announcement.title,
        description: announcement.description,
        status: announcement.status,
      };
    },
    { tracerName: "volunteer-scheduler.homepage" },
  );
};
