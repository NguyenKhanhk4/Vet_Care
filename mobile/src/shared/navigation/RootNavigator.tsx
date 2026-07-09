import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context
import { AuthContext } from '../context/AuthContext';
import { CustomerProvider } from '../../roles/customer/context/CustomerContext';
import { AdminProvider } from '../../roles/admin/context/AdminContext';

// Navigators
import CustomerNavigator from '../../roles/customer/navigation/CustomerNavigator';
import AdminNavigator from '../../roles/admin/navigation/AdminNavigator';

// Unified Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// We can reuse the Register and ForgotPassword screens from the Customer role for now
// because Registration is only for customers, and Forgot Password logic is shared or similar
import RegisterCustomerScreen from '../../roles/customer/screens/auth/RegisterCustomerScreen';
import ForgotPasswordCustomerScreen from '../../roles/customer/screens/auth/ForgotPasswordCustomerScreen';

const Stack = createNativeStackNavigator();

const CustomerFlowComponent = () => (
  <CustomerProvider>
    <CustomerNavigator />
  </CustomerProvider>
);

const AdminFlowComponent = () => (
  <AdminProvider>
    <AdminNavigator />
  </AdminProvider>
);

export default function RootNavigator() {
  const { role, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Unified routing based on role
  if (role === 'admin') {
    return <AdminFlowComponent />;
  }

  if (role === 'customer') {
    return <CustomerFlowComponent />;
  }

  if (role === 'doctor') {
    // Return DoctorFlowComponent when ready
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  // Fallback for 'guest' (not logged in) - Show Unified Auth Stack
  return (
    <CustomerProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterCustomerScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordCustomerScreen} />
      </Stack.Navigator>
    </CustomerProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});
