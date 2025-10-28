import { cookies } from "next/headers";
import type { Theme } from "@/providers/theme-provider";

export const getThemeFromCookie = async () => {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "system") as Theme;
  return theme;
};
