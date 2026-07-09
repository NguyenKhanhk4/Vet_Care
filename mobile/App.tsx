/**
 * VetCare App - Main Entry Point
 * Pet Healthcare Mobile Application
 *
 * Architecture: Role-based with customer focus
 * Currently active roles: Customer
 * Future expandable: Admin, Doctor
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/shared/navigation/RootNavigator';
import { AuthProvider } from './src/shared/context/AuthContext';
import { ThemeProvider } from './src/shared/context/ThemeContext';
import { Provider as PaperProvider } from 'react-native-paper';


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
