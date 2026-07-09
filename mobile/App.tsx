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
import { CustomerProvider } from './src/roles/customer/context/CustomerContext';
import CustomerNavigator from './src/roles/customer/navigation/CustomerNavigator';
import { ThemeProvider } from './src/shared/context/ThemeContext';


export default function App() {
  return (
    <ThemeProvider>
      <CustomerProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <CustomerNavigator />
        </NavigationContainer>
      </CustomerProvider>
    </ThemeProvider>
  );
}
