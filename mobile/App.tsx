import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/shared/context/ThemeContext';
import { DoctorProvider } from './src/roles/doctor/context/DoctorContext';
import DoctorNavigator from './src/roles/doctor/navigation/DoctorNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <DoctorProvider>
        <NavigationContainer>
          <DoctorNavigator />
        </NavigationContainer>
      </DoctorProvider>
    </ThemeProvider>
  );
}
