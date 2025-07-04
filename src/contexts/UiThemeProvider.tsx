
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const UI_THEME_KEY = 'bito-ai-ui-theme';

type Theme = 'minimalist' | 'kawaii' | 'hacker' | 'retro' | 'cyberpunk';

interface UiThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const UiThemeContext = createContext<UiThemeContextType | undefined>(undefined);

export const UiThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('minimalist');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedTheme = localStorage.getItem(UI_THEME_KEY) as Theme | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (error) {
      console.error("Could not load UI theme from localStorage", error);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(UI_THEME_KEY, newTheme);
    } catch (error) {
      console.error("Could not save UI theme to localStorage", error);
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <UiThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </UiThemeContext.Provider>
  );
};

export const useUiTheme = (): UiThemeContextType => {
  const context = useContext(UiThemeContext);
  if (context === undefined) {
    throw new Error('useUiTheme must be used within a UiThemeProvider');
  }
  return context;
};
