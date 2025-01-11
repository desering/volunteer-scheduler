import { token } from "styled-system/tokens";
import Cookies from "js-cookie";

export type Theme = "light" | "dark" | "system";

export const themeColors = {
  light: token("colors.gray.light.4"),
  dark: token("colors.gray.dark.2"),
};

export const applyTheme = () => {
  const colorSchemeMediaQuery = matchMedia("(prefers-color-scheme: dark)");
  const prefersDark = colorSchemeMediaQuery.matches;
  const userSetting = fromStorage("theme", "system") as Theme;

  console.log(prefersDark, userSetting);

  const theme =
    userSetting === "system" ? (prefersDark ? "dark" : "light") : userSetting;

  const color = theme === "light" ? themeColors.light : themeColors.dark;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", color);

  if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
  }
};

export const setTheme = (theme: Theme) => {
  Cookies.set("theme", theme);
  applyTheme();
};

export const getTheme = (): Theme => {
  return fromStorage("theme", "system") as Theme;
};

const fromStorage = (key: string, defaultValue: string) =>
  Cookies.get(key) || defaultValue;
