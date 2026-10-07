import type { TaskConfig } from "payload";
import { processEndedShifts } from "@/lib/engagement/after-shift";

/**
 * Awards training skills and sends thank-you emails for shifts that just
 * ended. Scheduled every 5 minutes; the default `beforeSchedule` hook skips a
 * tick while a previous run is still queued or running.
 */
export const processEndedShiftsTask: TaskConfig<"process-ended-shifts"> = {
  slug: "process-ended-shifts",
  schedule: [{ cron: "*/5 * * * *", queue: "default" }],
  handler: async ({ req: { payload } }) => {
    const result = await processEndedShifts(payload);
    return { output: result };
  },
};
