"use server";

import { getThemeFromCookie } from "@/lib/services/get-theme-from-cookie";
import { getUser } from "@/lib/services/get-user";
import { AuthProvider } from "@/providers/auth";
import { ThemeProvider } from "@/providers/theme-provider";

export const ServerProviders = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = await getUser();
  const theme = await getThemeFromCookie();

  return (
    <AuthProvider initialUser={user ?? undefined}>
      <ThemeProvider initialValue={theme}>{children}</ThemeProvider>
    </AuthProvider>
  );
};
