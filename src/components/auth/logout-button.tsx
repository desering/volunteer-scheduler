"use client";

import { logout } from "@/actions/auth/logout";
import { Button } from "../ui/button";

export const LogoutButton = () => (
  <Button
    onClick={() => {
      logout();
    }}
    variant="outline"
  >
    Sign out
  </Button>
);
