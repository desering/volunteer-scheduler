"use client";

import type { User } from "@/payload-types";
import { createContext, use, useEffect, useState } from "react";

const Context = createContext(
  {} as {
    user: User | undefined;
    setUser: (user?: User) => void;
  },
);

type Props = {
  children: React.ReactNode;
};

export const useAuth = () => use(Context);

export const AuthProvider = (props: Props) => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchMe = async () => {
      const user = await fetch("/payload-api/auth/me");
      if (!user) {
        return;
      }
      const { user: userData } = await user.json();
      if (!userData) {
        return;
      }
      setUser(userData);
    };

    void fetchMe();
  }, []);

  return (
    <Context.Provider value={{ user, setUser }}>
      {props.children}
    </Context.Provider>
  );
};
