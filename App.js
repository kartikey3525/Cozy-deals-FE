import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import {AuthProvider} from './src/context/authcontext';
import {ThemeProvider, useTheme} from './src/context/themeContext';
import MainScreens from './src/navigation/MainScreens';

const AppContent = () => {
  const {isDark} = useTheme();

  return (
    <NavigationContainer>
      <AuthProvider>
        <SafeAreaView
          style={[
            styles.container,
            {backgroundColor: isDark ? '#000' : '#fff'},
          ]}
          edges={['top', 'bottom', 'left', 'right']}>
          <MainScreens />
        </SafeAreaView>
      </AuthProvider>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
