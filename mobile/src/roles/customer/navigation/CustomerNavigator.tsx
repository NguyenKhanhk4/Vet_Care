/**
 * Customer Navigator
 * Handles navigation for the customer role
 * - Auth Stack: Login, Register, ForgotPassword (when not authenticated)
 * - Main Tabs: Home, Pets, Appointments, Notifications, Profile
 * - Each tab has its own stack navigator for detail screens
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SIZES, FONTS, ThemeColors } from '../../../shared/constants/theme';
import { useCustomer } from '../context/CustomerContext';
import { useTheme } from '../../../shared/context/ThemeContext';

// Import Auth Screens
import LoginCustomerScreen from '../screens/auth/LoginCustomerScreen';
import RegisterCustomerScreen from '../screens/auth/RegisterCustomerScreen';
import ForgotPasswordCustomerScreen from '../screens/auth/ForgotPasswordCustomerScreen';

// Import Main Screens
import HomeCustomerScreen from '../screens/home/HomeCustomerScreen';
import ClinicDetailCustomerScreen from '../screens/home/ClinicDetailCustomerScreen';
import ServiceCustomerScreen from '../screens/home/ServiceCustomerScreen';

// Import Pet Screens
import PetListCustomerScreen from '../screens/pets/PetListCustomerScreen';
import AddPetCustomerScreen from '../screens/pets/AddPetCustomerScreen';
import EditPetCustomerScreen from '../screens/pets/EditPetCustomerScreen';
import PetDetailCustomerScreen from '../screens/pets/PetDetailCustomerScreen';

// Import Appointment Screens
import AppointmentListCustomerScreen from '../screens/appointments/AppointmentListCustomerScreen';
import AppointmentDetailCustomerScreen from '../screens/appointments/AppointmentDetailCustomerScreen';
import BookingCustomerScreen from '../screens/appointments/BookingCustomerScreen';

// Import Medical Screens
import MedicalHistoryCustomerScreen from '../screens/medical/MedicalHistoryCustomerScreen';
import MedicalDetailCustomerScreen from '../screens/medical/MedicalDetailCustomerScreen';

// Import Payment Screens
import PaymentCustomerScreen from '../screens/payment/PaymentCustomerScreen';
import PaymentWebViewCustomerScreen from '../screens/payment/PaymentWebViewCustomerScreen';
import PaymentSuccessCustomerScreen from '../screens/payment/PaymentSuccessCustomerScreen';
import PaymentFailedCustomerScreen from '../screens/payment/PaymentFailedCustomerScreen';

// Import Profile Screens
import ProfileCustomerScreen from '../screens/profile/ProfileCustomerScreen';
import EditProfileCustomerScreen from '../screens/profile/EditProfileCustomerScreen';
import ChangePasswordCustomerScreen from '../screens/profile/ChangePasswordCustomerScreen';
import SettingsCustomerScreen from '../screens/profile/SettingsCustomerScreen';

// Import Notification Screen
import NotificationCustomerScreen from '../screens/notifications/NotificationCustomerScreen';

// ============================================================
// Type Definitions
// ============================================================

export type AuthStackParamList = {
  LoginCustomer: undefined;
  RegisterCustomer: undefined;
  ForgotPasswordCustomer: undefined;
};

export type HomeStackParamList = {
  HomeCustomer: undefined;
  ClinicDetailCustomer: { clinicId: string };
  ServiceCustomer: { serviceId: string };
  BookingCustomer: { clinicId?: string; doctorId?: string; serviceId?: string };
  PaymentCustomer: { appointmentId: string };
  PaymentWebViewCustomer: { checkoutUrl: string; orderCode: number };
  PaymentSuccessCustomer: { orderCode?: number; appointmentId?: string };
  PaymentFailedCustomer: { orderCode?: number; appointmentId?: string };
};

export type PetStackParamList = {
  PetListCustomer: undefined;
  AddPetCustomer: undefined;
  EditPetCustomer: { petId: string };
  PetDetailCustomer: { petId: string };
};

export type AppointmentStackParamList = {
  AppointmentListCustomer: undefined;
  AppointmentDetailCustomer: { appointmentId: string };
  BookingCustomer: { clinicId?: string; doctorId?: string; serviceId?: string };
  PaymentCustomer: { appointmentId: string };
  PaymentWebViewCustomer: { checkoutUrl: string; orderCode: number };
  PaymentSuccessCustomer: { orderCode?: number; appointmentId?: string };
  PaymentFailedCustomer: { orderCode?: number; appointmentId?: string };
  MedicalDetailCustomer: { recordId: string };
};

export type NotificationStackParamList = {
  NotificationCustomer: undefined;
};

export type ProfileStackParamList = {
  ProfileCustomer: undefined;
  EditProfileCustomer: undefined;
  ChangePasswordCustomer: undefined;
  MedicalHistoryCustomer: undefined;
  MedicalDetailCustomer: { recordId: string };
  SettingsCustomer: undefined;
};

// ============================================================
// Stack Navigators
// ============================================================

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const PetStack = createNativeStackNavigator<PetStackParamList>();
const AppointmentStack = createNativeStackNavigator<AppointmentStackParamList>();
const NotificationStack = createNativeStackNavigator<NotificationStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="LoginCustomer" component={LoginCustomerScreen} />
    <AuthStack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
    <AuthStack.Screen name="ForgotPasswordCustomer" component={ForgotPasswordCustomerScreen} />
  </AuthStack.Navigator>
);

// Tab Icon Component
const TabIcon = ({ name, focused, colors }: { name: string; focused: boolean; colors: ThemeColors }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Pets: '🐾',
    Appointments: '📅',
    Notifications: '🔔',
    Profile: '👤',
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name] || '📋'}
      </Text>
    </View>
  );
};

// ============================================================
// Main Customer Navigator
// ============================================================

const CustomerNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useCustomer();
  const { colors } = useTheme();

  const styles = getStyles(colors);

  const screenOptions = {
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.textWhite,
    headerTitleStyle: {
      ...FONTS.semiBold,
      fontSize: SIZES.lg,
    },
    headerShadowVisible: false,
  };

  // Home Stack Navigator
  const HomeNavigator = () => (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="HomeCustomer"
        component={HomeCustomerScreen}
        options={{ title: 'VetCare', headerLeft: () => null }}
      />
      <HomeStack.Screen name="ClinicDetailCustomer" component={ClinicDetailCustomerScreen} options={{ title: 'Clinic Details' }} />
      <HomeStack.Screen name="ServiceCustomer" component={ServiceCustomerScreen} options={{ title: 'Service Details' }} />
      <HomeStack.Screen name="BookingCustomer" component={BookingCustomerScreen} options={{ title: 'Book Appointment' }} />
      <HomeStack.Screen name="PaymentCustomer" component={PaymentCustomerScreen} options={{ title: 'Payment' }} />
      <HomeStack.Screen name="PaymentWebViewCustomer" component={PaymentWebViewCustomerScreen} options={{ title: 'Checkout', headerShown: false }} />
      <HomeStack.Screen name="PaymentSuccessCustomer" component={PaymentSuccessCustomerScreen} options={{ title: 'Payment Success', headerShown: false }} />
      <HomeStack.Screen name="PaymentFailedCustomer" component={PaymentFailedCustomerScreen} options={{ title: 'Payment Failed', headerShown: false }} />
    </HomeStack.Navigator>
  );

  // Pet Stack Navigator
  const PetNavigator = () => (
    <PetStack.Navigator screenOptions={screenOptions}>
      <PetStack.Screen name="PetListCustomer" component={PetListCustomerScreen} options={{ title: 'My Pets' }} />
      <PetStack.Screen name="AddPetCustomer" component={AddPetCustomerScreen} options={{ title: 'Add Pet' }} />
      <PetStack.Screen name="EditPetCustomer" component={EditPetCustomerScreen} options={{ title: 'Edit Pet' }} />
      <PetStack.Screen name="PetDetailCustomer" component={PetDetailCustomerScreen} options={{ title: 'Pet Details' }} />
    </PetStack.Navigator>
  );

  // Appointment Stack Navigator
  const AppointmentNavigator = () => (
    <AppointmentStack.Navigator screenOptions={screenOptions}>
      <AppointmentStack.Screen name="AppointmentListCustomer" component={AppointmentListCustomerScreen} options={{ title: 'Appointments' }} />
      <AppointmentStack.Screen name="AppointmentDetailCustomer" component={AppointmentDetailCustomerScreen} options={{ title: 'Appointment Details' }} />
      <AppointmentStack.Screen name="BookingCustomer" component={BookingCustomerScreen} options={{ title: 'Book Appointment' }} />
      <AppointmentStack.Screen name="PaymentCustomer" component={PaymentCustomerScreen} options={{ title: 'Payment' }} />
      <AppointmentStack.Screen name="PaymentWebViewCustomer" component={PaymentWebViewCustomerScreen} options={{ title: 'Checkout', headerShown: false }} />
      <AppointmentStack.Screen name="PaymentSuccessCustomer" component={PaymentSuccessCustomerScreen} options={{ title: 'Payment Success', headerShown: false }} />
      <AppointmentStack.Screen name="PaymentFailedCustomer" component={PaymentFailedCustomerScreen} options={{ title: 'Payment Failed', headerShown: false }} />
      <AppointmentStack.Screen name="MedicalDetailCustomer" component={MedicalDetailCustomerScreen} options={{ title: 'Medical Record' }} />
    </AppointmentStack.Navigator>
  );

  // Notification Stack Navigator
  const NotificationNavigator = () => (
    <NotificationStack.Navigator screenOptions={screenOptions}>
      <NotificationStack.Screen name="NotificationCustomer" component={NotificationCustomerScreen} options={{ title: 'Notifications' }} />
    </NotificationStack.Navigator>
  );

  // Profile Stack Navigator
  const ProfileNavigator = () => (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileCustomer" component={ProfileCustomerScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="EditProfileCustomer" component={EditProfileCustomerScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStack.Screen name="ChangePasswordCustomer" component={ChangePasswordCustomerScreen} options={{ title: 'Change Password' }} />
      <ProfileStack.Screen name="MedicalHistoryCustomer" component={MedicalHistoryCustomerScreen} options={{ title: 'Medical History' }} />
      <ProfileStack.Screen name="MedicalDetailCustomer" component={MedicalDetailCustomerScreen} options={{ title: 'Medical Record' }} />
      <ProfileStack.Screen name="SettingsCustomer" component={SettingsCustomerScreen} options={{ title: 'Settings' }} />
    </ProfileStack.Navigator>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🐾</Text>
        <Text style={styles.loadingSubText}>VetCare</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} colors={colors} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Pets" component={PetNavigator} options={{ tabBarLabel: 'My Pets' }} />
      <Tab.Screen name="Appointments" component={AppointmentNavigator} options={{ tabBarLabel: 'Appointments' }} />
      <Tab.Screen name="Notifications" component={NotificationNavigator} options={{ tabBarLabel: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  loadingText: {
    fontSize: 64,
    marginBottom: SIZES.spacing.md,
  },
  loadingSubText: {
    fontSize: SIZES.xxl,
    color: colors.textWhite,
    ...FONTS.bold,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: SIZES.xs,
    ...FONTS.medium,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

export default CustomerNavigator;
