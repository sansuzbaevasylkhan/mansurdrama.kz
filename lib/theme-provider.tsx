'use client';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'mansurdrama-theme';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
}: PropsWithChildren<{
  defaultTheme?: Theme;
  enableSystem?: boolean;
  // Accept and ignore extra props so the root layout can pass them
  // through without TypeScript complaining.
  attribute?: string;
  storageKey?: string;
}>) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const stored = (typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY)
      : null) as Theme | null;
    const initial: Theme = stored ?? defaultTheme;
    setThemeState(initial);
    applyTheme(initial);
  }, [defaultTheme]);

  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme, enableSystem]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { theme: 'system' as Theme, setTheme: () => {} };
  }
  return ctx;
}
