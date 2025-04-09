import { panda } from "styled-system/jsx";
import NavBar from "@/components/navbar";

export const metadata = {
  title: "Volunteering Schedule",
  description: "Discover and sign up for volunteering shifts at De Sering!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <panda.body backgroundColor={{ base: "gray.4", _dark: "gray.2" }}>
        <NavBar />
        {children}
      </panda.body>
    </html>
  );
}
