"use client";

import type { User } from "@/payload-types";
import { useAuth } from "@/providers/auth";
import { useEffect } from "react";

export const HydrateClientUser: React.FC<{
  user?: User;
}> = ({ user }) => {
  const { setUser } = useAuth();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
};
