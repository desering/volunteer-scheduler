"use client";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

import { getTheme, setTheme } from "@/utils/theme";
import { useEffect, useState } from "react";
import { HStack } from "styled-system/jsx";
import { IconButton } from "./ui/icon-button";
import { Menu } from "./ui/menu";

export function ThemeSwitchButton() {
  const [themeSelection, setThemeSelection] = useState(getTheme());

  useEffect(() => setTheme(themeSelection));

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant="outline">
          {(() => {
            switch (themeSelection) {
              case "light":
                return <SunIcon suppressHydrationWarning />;
              case "dark":
                return <MoonIcon suppressHydrationWarning />;
              default:
                return <SunMoonIcon suppressHydrationWarning />;
            }
          })()}
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.ItemGroup>
            {/* <Menu.ItemGroupLabel>Theme</Menu.ItemGroupLabel>
            <Menu.Separator /> */}
            <Menu.Item
              value="profile"
              onClick={() => setThemeSelection("system")}
            >
              <HStack gap="2">
                <SunMoonIcon />
                System Theme
              </HStack>
            </Menu.Item>
            <Menu.Item
              value="billing"
              onClick={() => setThemeSelection("light")}
            >
              <HStack gap="2">
                <SunIcon /> Light Theme
              </HStack>
            </Menu.Item>
            <Menu.Item
              value="settings"
              onClick={() => setThemeSelection("dark")}
            >
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
