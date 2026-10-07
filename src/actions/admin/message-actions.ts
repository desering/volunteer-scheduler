"use server";

import config from "@payload-config";
import { and, eq } from "@payloadcms/db-postgres/drizzle";
import { getPayload } from "payload";
import { z } from "zod";
import { previewAudience } from "@/lib/engagement/messages";
import { messages } from "@/payload-generated-schema";
import { requireAdmin } from "./require-admin";

const idSchema = z.number().int().positive();

/** Who a saved message would reach right now. */
export async function previewMessageAudience(messageId: number) {
  await requireAdmin();
  const payload = await getPayload({ config });
  const message = await payload.findByID({
    collection: "messages",
    id: idSchema.parse(messageId),
    depth: 0,
  });
  return {
    status: message.status,
    ...(await previewAudience(payload, message)),
  };
}

/**
 * Locks the message (status → sending) and queues the job that emails the
 * audience. The audience is worked out again when the job runs, a few
 * minutes later at most.
 */
export async function sendMessage(messageId: number) {
  const admin = await requireAdmin();
  const payload = await getPayload({ config });
  const id = idSchema.parse(messageId);

  // Conditional update: of two admins pressing Send at once, only one wins.
  const claimed = await payload.db.drizzle
    .update(messages)
    .set({ status: "sending", sentBy: admin.id })
    .where(and(eq(messages.id, id), eq(messages.status, "draft")))
    .returning({ id: messages.id });
  if (claimed.length === 0) {
    throw new Error("This message has already been sent.");
  }

  await payload.jobs.queue({
    task: "send-volunteer-message",
    input: { messageId: id },
  });

  return { status: "sending" as const };
}
