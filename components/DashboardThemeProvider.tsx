"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark";

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

const STORAGE_KEY = "dashboard-theme";

export function DashboardThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  const isDark = theme === "dark";

  // Avoid flash of wrong theme
  if (!mounted) {
    return (
      <div className="dashboard-root">
        {children}
      </div>
    );
  }

  return (
    <DashboardThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      <div className={`dashboard-root ${isDark ? "dark" : ""}`}>
        {children}
      </div>
    </DashboardThemeContext.Provider>
  );
}
