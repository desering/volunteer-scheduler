import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { css, cx } from "styled-system/css";
import { LayoutFooter } from "@/components/layout-footer";
import { NavBar } from "@/components/navbar";
import { themeColors } from "@/constants/theme-colors";
import { getThemeFromCookie } from "@/lib/services/get-theme-from-cookie";
import { ClientProviders } from "./client-providers";
import { ServerProviders } from "./server-providers";

import "./globals.css";

const body = css({
  backgroundColor: { base: "gray.4", _dark: "gray.2" },
  minHeight: "screen",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
});

const main = css({
  flex: "1",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const generateViewport = async () => {
  const theme = await getThemeFromCookie();

  const color = {
    light: themeColors.light,
    dark: themeColors.dark,
    system: "",
  }[theme];

  return {
    themeColor: color,
  };
};

export const metadata: Metadata = {
  title: "Volunteering Schedule",
  description: "Discover and sign up for volunteering shifts at De Sering!",
  other: {
    "darkreader-lock": "",
  },
};

export default async function RootLayout({
  children,
  modals,
}: LayoutProps<"/">) {
  const theme = await getThemeFromCookie();

  return (
    <html
      lang="en"
      className={cx(
        theme === "dark" && "dark",
        "use-panda",
        sourceSans.className,
      )}
      suppressHydrationWarning
    >
      <head>
        {theme === "system" && (
          // only add this script if the theme is set to system
          // this avoids a flash of light theme when user has preferred dark on page load
          <script>
            {`
              const darkMediaQuery = window.matchMedia("(prefers-color-scheme:dark)");
              darkMediaQuery.matches && document.documentElement.classList.add("dark"); 
              console.log("system theme applied");
            `}
          </script>
        )}
      </head>

      <body className={body}>
        <ServerProviders>
          <ClientProviders>
            <NavBar />
            <main className={main}>{children}</main>
            <LayoutFooter />

            {modals}
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  );
}
