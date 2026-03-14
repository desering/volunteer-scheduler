"use server";

import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import { getUser } from "@/lib/services/get-user";

export async function deleteCalendarToken(): Promise<
  { success: true } | { success: false; message: string }
> {
  const { user } = await getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const payload = await getPayload({ config });

  await payload.delete({
    collection: "calendar-tokens",
    where: { user: { equals: user.id } },
  });

  revalidatePath("/account");
  return { success: true };
}
