"use server";

import config from "@payload-config";
import { logout as payloadLogout } from "@payloadcms/next/auth";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/services/get-user";

export async function signOut() {
  const user = await getUser();

  if (!user) {
    return redirect("/");
  }

  try {
    await payloadLogout({ config });
  } catch (error) {
    throw new Error(
      `Sign-out failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return redirect("/auth/signed-out");
}
