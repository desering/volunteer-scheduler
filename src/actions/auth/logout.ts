"use server";

import { logout as payloadLogout } from "@payloadcms/next/auth";
import config from "@payload-config";

export const logout = async () => {
  try {
    return await payloadLogout({ config });
  } catch (error) {
    throw new Error(
      `Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
