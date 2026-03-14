"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import { getUser } from "@/lib/services/get-user";

export async function generateCalendarToken(): Promise<
  { success: true } | { success: false; message: string }
> {
  const { user } = await getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "calendar-tokens",
    where: { user: { equals: user.id } },
    limit: 1,
  });

  if (existing.totalDocs > 0) {
    return { success: false, message: "Calendar link already exists" };
  }

  await payload.create({
    collection: "calendar-tokens",
    data: { token: crypto.randomUUID(), user: user.id },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function deleteCalendarToken(
  id: number,
): Promise<{ success: true } | { success: false; message: string }> {
  const { user } = await getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const payload = await getPayload({ config });

  const token = await payload.findByID({
    collection: "calendar-tokens",
    id,
  });

  if (!token) {
    return { success: false, message: "Token not found" };
  }

  const tokenUserId =
    typeof token.user === "number" ? token.user : token.user.id;

  if (tokenUserId !== user.id && !user.roles?.includes("admin")) {
    return { success: false, message: "Not authorized" };
  }

  await payload.delete({ collection: "calendar-tokens", id });

  revalidatePath("/account");
  return { success: true };
}
