"use server";

import config from "@payload-config";
import { logout as payloadLogout } from "@payloadcms/next/auth";
import { redirect } from "next/navigation";

export async function signOut() {
  try {
    await payloadLogout({ config });
  } catch {
    // OIDC users do not necessarily have a Payload local auth cookie to clear.
  }

  return redirect("/auth/oidc/logout");
}
