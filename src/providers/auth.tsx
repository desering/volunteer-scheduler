"use client";

import { createContext, use, useState } from "react";
import type { User } from "@/payload-types";

const Context = createContext(
  {} as { user?: User; setUser: (user?: User) => void },
);

type Props = {
  initialUser?: User;
  children: React.ReactNode;
};

export const useAuth = () => use(Context);

export const AuthProvider = ({ initialUser, children }: Props) => {
  const [user, setUser] = useState(initialUser);
  return (
    <Context.Provider value={{ user, setUser }}>{children}</Context.Provider>
  );
};
