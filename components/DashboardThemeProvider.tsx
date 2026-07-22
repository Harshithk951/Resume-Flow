"use client";

import { createContext, useContext, type ReactNode } from "react";

type Theme = "light";

interface DashboardThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextValue>({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useDashboardTheme() {
  return useContext(DashboardThemeContext);
}

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  return (
    <DashboardThemeContext.Provider
      value={{
        theme: "light",
        isDark: false,
        toggleTheme: () => {},
        setTheme: () => {},
      }}
    >
      <div className="dashboard-root light">
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}
