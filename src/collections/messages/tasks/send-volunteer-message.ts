import type { TaskConfig } from "payload";
import { sendVolunteerMessage } from "@/lib/engagement/messages";

/** Queued by the Send button on a message (actions/admin/send-message.ts). */
export const sendVolunteerMessageTask: TaskConfig<"send-volunteer-message"> = {
  slug: "send-volunteer-message",
  inputSchema: [{ name: "messageId", type: "number", required: true }],
  retries: 2,
  handler: async ({ req: { payload }, input }) => {
    const result = await sendVolunteerMessage(payload, input.messageId);
    return { output: result };
  },
};
