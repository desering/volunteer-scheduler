"use server";

import config from "@payload-config";
import { logout as payloadLogout } from "@payloadcms/next/auth";
import { redirect } from "next/navigation";

export async function logout() {
  try {
    await payloadLogout({ config });
  } catch (error) {
    throw new Error(
      `Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
  return redirect("/auth/signed-out");
}
