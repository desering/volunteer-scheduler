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
