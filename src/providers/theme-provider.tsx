"use client";

import { themeColors } from "@/constants/theme-colors";
import CookieStore from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  initialValue?: Theme;
  children?: React.ReactNode;
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

const applyTheme = () => {
  const colorSchemeMediaQuery = matchMedia("(prefers-color-scheme: dark)");
  const prefersDark = colorSchemeMediaQuery.matches;
  const userSetting = fromStorage("theme", "system") as Theme;

  const systemTheme = prefersDark ? "dark" : "light";
  const theme = userSetting === "system" ? systemTheme : userSetting;

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

const fromStorage = (key: string, defaultValue: string) =>
  CookieStore.get(key) || defaultValue;

export const ThemeProvider = ({
  initialValue,
  children,
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(initialValue ?? "system");

  useEffect(() => {
    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, []);

  useEffect(() => {
    CookieStore.set("theme", theme, {
      sameSite: "strict",
    });
    applyTheme();
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
