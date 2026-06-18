import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Enforce light theme strictly for steps 1-13 as requested
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('light-theme');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }, []);

  const toggleTheme = () => {
    console.log('Theme toggle is disabled until Theme Management is implemented.');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
