"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { getCookie } from "@/modules/auth/utils/cookies";

interface AppStoreContextType {
  login: boolean;
  setUserlogin: (value: boolean) => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(
  undefined
);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [login, setLogin] = useState<boolean>(false);
  const setUserlogin = (value: boolean) => {
    setLogin(value);
    document.cookie = `login=${value}; path=/`;
  };

  useEffect(() => {
    setLogin(getCookie("login") === "true");
  }, []);

  return (
    <AppStoreContext.Provider value={{ login, setUserlogin }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreContextType {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  return context;
}
