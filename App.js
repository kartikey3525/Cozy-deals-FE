import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, Text } from 'react-native'; // Added for status bar
import MainScreens from './src/navigation/MainScreens';
import { AuthProvider } from './src/context/authcontext';
import { ThemeProvider } from './src/context/themeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider> 
            <MainScreens />
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
     </SafeAreaView>
  );
};

export default App;