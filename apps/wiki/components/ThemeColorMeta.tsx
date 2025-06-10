'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeColorMeta = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isDarkMode || theme === "dark" ? (
    <meta name="theme-color" content="#000000" />
  ) : null;
};

export default ThemeColorMeta;
