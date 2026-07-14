import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

import RootNavigator from './src/shared/navigation/RootNavigator';

import { ThemeProvider } from './src/shared/context/ThemeContext';
import { AuthProvider } from './src/shared/context/AuthContext';


export default function App() {
  return (
    <PaperProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}