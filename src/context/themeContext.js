import React, {createContext, useState, useEffect} from 'react';
import {Appearance} from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setTheme(colorScheme); // Always update the theme instantly when system theme changes
    });

    return () => subscription.remove();
  }, []);

  const changeTheme = selectedTheme => {
    if (selectedTheme === 'SystemDefault') {
      setTheme(Appearance.getColorScheme()); // Sync with system theme
    } else {
      setTheme(selectedTheme.toLowerCase());
    }
  };

  return (
    <ThemeContext.Provider value={{theme, changeTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;