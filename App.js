import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/authcontext';
import {ThemeProvider} from './src/context/themeContext';
import MainScreens from './src/navigation/MainScreens';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider>
            <SafeAreaView
              style={styles.container}
              edges={['top', 'bottom', 'left', 'right']}>
              <MainScreens />
            </SafeAreaView>
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {height: 10, backgroundColor: '#007aff'},
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007aff',
    fontWeight: '500',
  },
});
export default App;
