import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'cc-theme';
const ThemeContext = createContext(null);

function getInitialTheme() {
  // index.html already applied the right class before React loaded; read it back.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Follow OS changes only while the user hasn't chosen a theme explicitly.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => {
      if (!localStorage.getItem(STORAGE_KEY)) setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
