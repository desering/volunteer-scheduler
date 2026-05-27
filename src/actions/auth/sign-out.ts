"use server";

import { redirect } from "next/navigation";

export async function signOut() {
  return redirect("/auth/oidc/logout");
}
