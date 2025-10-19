"use client";

import { button } from "styled-system/recipes/button";
import { logout } from "@/actions/auth/logout";

export default function LogoutButton() {
  return (
    <button
      type={"button"}
      onClick={() => logout()}
      className={button({ size: "lg", variant: "outline" })}
    >
      Logout
    </button>
  );
}
