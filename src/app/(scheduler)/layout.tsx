import "./globals.css";

import { panda } from "styled-system/jsx";
import NavBar from "@/components/navbar";
import { AuthProvider } from "@/providers/auth";

export const metadata = {
  title: "Volunteering Schedule",
  description: "Discover and sign up for volunteering shifts at De Sering!",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <panda.body backgroundColor={{ base: "gray.4", _dark: "gray.2" }}>
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
        </AuthProvider>
      </panda.body>
    </html>
  );
}
