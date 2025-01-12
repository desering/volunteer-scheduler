import MoonIcon from "lucide-solid/icons/moon";
import SunIcon from "lucide-solid/icons/sun";
import SunMoonIcon from "lucide-solid/icons/sun-moon";

import { Match, Switch, createEffect, createSignal } from "solid-js";
import { HStack } from "styled-system/jsx";
import { getTheme, setTheme } from "~/utils/theme";
import { IconButton } from "./ui/icon-button";
import { Menu } from "./ui/menu";

export const ThemeSwitchButton = () => {
  const [themeSelection, setThemeSelection] = createSignal(getTheme());

  createEffect(() => setTheme(themeSelection()));

  return (
    <Menu.Root>
      <Menu.Trigger
        asChild={(triggerProps) => (
          <IconButton {...triggerProps()} variant="outline">
            <Switch>
              <Match when={themeSelection() === "light"}>
                <SunIcon />
              </Match>
              <Match when={themeSelection() === "dark"}>
                <MoonIcon />
              </Match>
              <Match when={true}>
                <SunMoonIcon />
              </Match>
            </Switch>
          </IconButton>
        )}
      />
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
};
