import "./globals.css";

import { panda } from "styled-system/jsx";
import NavBar from "@/components/navbar";
import { AuthProvider } from "@/providers/auth";
import { Source_Sans_3 } from "next/font/google";
import Providers from "../providers";
import { cookies } from "next/headers";
import { themeColors, type Theme } from "@/utils/theme";
import { ListenToThemeChanges } from "@/components/listen-to-theme-changes";
import { cx } from "styled-system/css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const getCookieTheme = async () => {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "system") as Theme;
  return theme;
};

export const generateViewport = async () => {
  const theme = await getCookieTheme();
  const color = {
    light: themeColors.light,
    dark: themeColors.dark,
    system: "",
  }[theme];

  return {
    themeColor: color,
  };
};

export const metadata = {
  title: "Volunteering Schedule",
  description: "Discover and sign up for volunteering shifts at De Sering!",
  other: {
    "darkreader-lock": "",
  },
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const theme = await getCookieTheme();

  return (
    <html
      lang="en"
      className={cx(
        theme === "dark" && "dark",
        "use-panda",
        sourceSans.className,
      )}
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

      <panda.body backgroundColor={{ base: "gray.4", _dark: "gray.2" }}>
        <ListenToThemeChanges />
        <Providers>
          <AuthProvider>
            <NavBar />
            <main>{children}</main>
          </AuthProvider>
        </Providers>
      </panda.body>
    </html>
  );
}
