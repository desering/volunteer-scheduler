import type { Theme } from "@/providers/theme-provider";
import { cookies } from "next/headers";
import { cache } from "react";

export const getThemeFromCookie = cache(async () => {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "system") as Theme;
  return theme;
});
