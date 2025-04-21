"use client";

import { applyTheme } from "@/utils/theme";
import { useEffect } from "react";

export const ListenToThemeChanges = () => {
  useEffect(() => {
    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", applyTheme);

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, []);

  return null;
};
