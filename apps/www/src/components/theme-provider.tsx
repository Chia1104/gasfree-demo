import { createContext, use, useEffect, useState } from "react";

import { useMediaQuery } from "usehooks-ts";

import type { Theme } from "@/enums/theme.enum";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isDark: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "currency-hunter-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined"
      ? (window.localStorage.getItem(storageKey) as Theme)
      : defaultTheme
  );
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = isDarkOS ? "dark" : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, isDarkOS]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    isDark: theme === "dark" || (theme === "system" && isDarkOS),
  };

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  );
}

export const useTheme = (nameSpace = "useTheme") => {
  const context = use(ThemeProviderContext);

  if (context === undefined)
    throw new Error(`${nameSpace} must be used within a ThemeProvider`);

  return context;
};
