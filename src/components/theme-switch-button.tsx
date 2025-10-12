"use client";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";
import { HStack } from "styled-system/jsx";
import { IconButton } from "./ui/icon-button";
import { Menu } from "./ui/menu";

export function ThemeSwitchButton() {
  const { theme, setTheme } = useTheme();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant="outline">
          {theme === "system" && <SunMoonIcon />}
          {theme === "light" && <SunIcon />}
          {theme === "dark" && <MoonIcon />}
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.ItemGroup>
            <Menu.Item value="profile" onClick={() => setTheme("system")}>
              <HStack gap="2">
                <SunMoonIcon />
                System Theme
              </HStack>
            </Menu.Item>
            <Menu.Item value="billing" onClick={() => setTheme("light")}>
              <HStack gap="2">
                <SunIcon /> Light Theme
              </HStack>
            </Menu.Item>
            <Menu.Item value="settings" onClick={() => setTheme("dark")}>
              <HStack gap="2">
                <MoonIcon /> Dark Theme
              </HStack>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
