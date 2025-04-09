"use client";

import { MoonIcon } from "lucide-react";
import { SunIcon } from "lucide-react";
import { SunMoonIcon } from "lucide-react";

import { HStack } from "../../styled-system/jsx";
import { getTheme, setTheme } from "@/utils/theme";
import { IconButton } from "../../packages/astro/src/components/ui/icon-button";
import { Menu } from "../../packages/astro/src/components/ui/menu";
import {useState} from "react";

export const ThemeSwitchButton = () => {
  const [themeSelection, setThemeSelection] = useState(getTheme());

  let themeIcon;
  switch (themeSelection) {
    case "light":
      themeIcon = <SunIcon />;
      break;
    case "dark":
      themeIcon = <MoonIcon />;
      break;
    default:
      themeIcon = <SunMoonIcon />;
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        asChild={(triggerProps) => (
          <IconButton  variant="outline">
            {themeIcon}
          </IconButton>
        )}
      />
      <Menu.Positioner>
        <Menu.Content>
          <Menu.ItemGroup>
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
};
