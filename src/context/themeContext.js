import React, {createContext, useContext, useEffect, useState} from 'react';
import {Appearance} from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setTheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  const changeTheme = selectedTheme => {
    if (selectedTheme === 'SystemDefault') {
      setTheme(Appearance.getColorScheme() || 'light');
    } else {
      setTheme(selectedTheme.toLowerCase());
    }
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        changeTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
