"use client";

import { signOut } from "@/actions/auth/sign-out";
import { Button } from "../ui/button";

export const SignOutButton = () => (
  <Button
    onClick={() => {
      signOut();
    }}
    variant="outline"
  >
    Sign out
  </Button>
);
