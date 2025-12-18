import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check local storage
    if (typeof window !== 'undefined' && localStorage.getItem('ui-theme')) {
      return localStorage.getItem('ui-theme');
    }
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  /* State to track the resolved theme (actual visual state) */
  const [actualTheme, setActualTheme] = useState(() => {
     if (theme === 'system') {
        return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
     }
     return theme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystem = () => {
         const resolved = mediaQuery.matches ? 'dark' : 'light';
         setActualTheme(resolved);
         root.classList.remove('light', 'dark');
         root.classList.add(resolved);
      };

      applySystem();
      mediaQuery.addEventListener('change', applySystem);
      return () => mediaQuery.removeEventListener('change', applySystem);
    } 

    setActualTheme(theme);
    root.classList.add(theme);
    localStorage.setItem('ui-theme', theme);
    
  }, [theme]);

  // Removed redundant second useEffect as the logic is now combined above



  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
