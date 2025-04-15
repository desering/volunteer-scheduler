import "./globals.css";

import { panda } from "styled-system/jsx";
import NavBar from "@/components/navbar";
import { AuthProvider } from "@/providers/auth";
import { Source_Sans_3 } from "next/font/google";
import Providers from "../providers";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata = {
  title: "Volunteering Schedule",
  description: "Discover and sign up for volunteering shifts at De Sering!",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={sourceSans.className}>
      <panda.body backgroundColor={{ base: "gray.4", _dark: "gray.2" }}>
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

// todo: theme switching

// const theme = (Astro.cookies.get("theme")?.value || "system") as Theme;
// const color = {
//   light: themeColors.light,
//   dark: themeColors.dark,
//   system: "",
// }[theme];

// <html lang="en" class:list={[{ dark: theme === "dark" }]}>
// <head>
//   <meta name="theme-color" content={color} />
//   <meta name="darkreader-lock" />
//   <title>{title}</title>
//
//   {
//     // only add this script if the theme is set to system
//     // this avoids a flash of light theme on page load
//     theme === "system" && (
//       <script is:inline>
//         const darkMediaQuery =
//         window.matchMedia("(prefers-color-scheme:dark)");
//         darkMediaQuery.matches &&
//         document.documentElement.classList.add("dark");
//       </script>
//     )
//   }
//   <script>
//     import { applyTheme } from "~/utils/theme";
//
//     applyTheme();
//
//     window
//     .matchMedia("(prefers-color-scheme: dark)")
//     .addEventListener("change", applyTheme);
//   </script>
// </head>
// </html>
