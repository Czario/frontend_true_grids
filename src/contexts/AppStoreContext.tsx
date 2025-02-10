"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
}

interface AppStoreContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(
  undefined
);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AppStoreContext.Provider value={{ user, login, logout }}>
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
