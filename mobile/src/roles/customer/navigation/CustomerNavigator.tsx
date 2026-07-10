/**
 * Customer Navigator
 * Handles navigation for the customer role
 * - Auth Stack: Login, Register, ForgotPassword (when not authenticated)
 * - Main Tabs: Home, Pets, Appointments, Notifications, Profile
 * - Each tab has its own stack navigator for detail screens
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
import ServiceCustomerScreen from '../screens/home/ServiceCustomerScreen';
import ExploreCustomerScreen from '../screens/home/ExploreCustomerScreen';

// Import Clinic Screens
import ClinicDetailCustomerScreen from '../screens/clinics/ClinicDetailCustomerScreen';
import NearbyClinicCustomerScreen from '../screens/clinics/NearbyClinicCustomerScreen';
import ClinicListCustomerScreen from '../screens/clinics/ClinicListCustomerScreen';

// Import Pet Screens
import PetListCustomerScreen from '../screens/pets/PetListCustomerScreen';
import AddPetCustomerScreen from '../screens/pets/AddPetCustomerScreen';
import EditPetCustomerScreen from '../screens/pets/EditPetCustomerScreen';
import PetDetailCustomerScreen from '../screens/pets/PetDetailCustomerScreen';

// Import Vaccination Screens
import VaccinationListCustomerScreen from '../screens/vaccinations/VaccinationListCustomerScreen';
import VaccinationDetailCustomerScreen from '../screens/vaccinations/VaccinationDetailCustomerScreen';
import AddVaccinationCustomerScreen from '../screens/vaccinations/AddVaccinationCustomerScreen';
import EditVaccinationCustomerScreen from '../screens/vaccinations/EditVaccinationCustomerScreen';

// Import Appointment Screens
import AppointmentListCustomerScreen from '../screens/appointments/AppointmentListCustomerScreen';
import AppointmentDetailCustomerScreen from '../screens/appointments/AppointmentDetailCustomerScreen';
import BookingCustomerScreen from '../screens/appointments/BookingCustomerScreen';
import ReviewCustomerScreen from '../screens/appointments/ReviewCustomerScreen';

// Import Medical Screens
import MedicalHistoryCustomerScreen from '../screens/medical/MedicalHistoryCustomerScreen';
import MedicalDetailCustomerScreen from '../screens/medical/MedicalDetailCustomerScreen';

// Import Payment Screens
import PaymentCustomerScreen from '../screens/payment/PaymentCustomerScreen';
import PaymentSuccessCustomerScreen from '../screens/payment/PaymentSuccessCustomerScreen';

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
  PaymentSuccessCustomer: { paymentId: string; transactionId: string };
  NotificationCustomer: undefined;
  ExploreCustomer: { type: string; title: string };
  NearbyClinicCustomer: undefined;
  ClinicListCustomer: undefined;
};

export type PetStackParamList = {
  PetListCustomer: undefined;
  AddPetCustomer: undefined;
  EditPetCustomer: { petId: string };
  PetDetailCustomer: { petId: string };
  VaccinationListCustomer: undefined;
  VaccinationDetailCustomer: { vaccinationId: string };
  AddVaccinationCustomer: { petId?: string };
  EditVaccinationCustomer: { vaccinationId: string };
};

export type AppointmentStackParamList = {
  AppointmentListCustomer: undefined;
  AppointmentDetailCustomer: { appointmentId: string };
  BookingCustomer: { clinicId?: string; doctorId?: string; serviceId?: string };
  PaymentCustomer: { appointmentId: string };
  PaymentSuccessCustomer: { paymentId: string; transactionId: string };
  MedicalDetailCustomer: { recordId: string };
  ReviewCustomer: { appointmentId: string };
};

export type MedicalStackParamList = {
  MedicalHistoryCustomer: undefined;
  MedicalDetailCustomer: { recordId: string };
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
const MedicalStack = createNativeStackNavigator<MedicalStackParamList>();
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
    Medical: '📋',
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
        options={({ navigation }: any) => ({ 
          title: 'VetCare', 
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('NotificationCustomer')} style={{ marginRight: 15 }}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </TouchableOpacity>
          )
        })}
      />
      <HomeStack.Screen name="ClinicDetailCustomer" component={ClinicDetailCustomerScreen} options={{ title: 'Clinic Details' }} />
      <HomeStack.Screen name="ServiceCustomer" component={ServiceCustomerScreen} options={{ title: 'Service Details' }} />
      <HomeStack.Screen name="BookingCustomer" component={BookingCustomerScreen} options={{ title: 'Book Appointment' }} />
      <HomeStack.Screen name="PaymentCustomer" component={PaymentCustomerScreen} options={{ title: 'Payment' }} />
      <HomeStack.Screen name="PaymentSuccessCustomer" component={PaymentSuccessCustomerScreen} options={{ title: 'Payment Success', headerShown: false }} />
      <HomeStack.Screen name="NotificationCustomer" component={NotificationCustomerScreen} options={{ title: 'Notifications' }} />
      <HomeStack.Screen name="ExploreCustomer" component={ExploreCustomerScreen} options={{ title: 'Explore' }} />
      <HomeStack.Screen name="NearbyClinicCustomer" component={NearbyClinicCustomerScreen} options={{ title: 'Nearby Clinics' }} />
      <HomeStack.Screen name="ClinicListCustomer" component={ClinicListCustomerScreen} options={{ title: 'All Clinics' }} />
    </HomeStack.Navigator>
  );

  // Pet Stack Navigator
  const PetNavigator = () => (
    <PetStack.Navigator screenOptions={screenOptions}>
      <PetStack.Screen name="PetListCustomer" component={PetListCustomerScreen} options={{ title: 'My Pets' }} />
      <PetStack.Screen name="AddPetCustomer" component={AddPetCustomerScreen} options={{ title: 'Add Pet' }} />
      <PetStack.Screen name="EditPetCustomer" component={EditPetCustomerScreen} options={{ title: 'Edit Pet' }} />
      <PetStack.Screen name="PetDetailCustomer" component={PetDetailCustomerScreen} options={{ title: 'Pet Details' }} />
      <PetStack.Screen name="VaccinationListCustomer" component={VaccinationListCustomerScreen} options={{ title: 'Vaccinations' }} />
      <PetStack.Screen name="VaccinationDetailCustomer" component={VaccinationDetailCustomerScreen} options={{ title: 'Vaccination Details' }} />
      <PetStack.Screen name="AddVaccinationCustomer" component={AddVaccinationCustomerScreen} options={{ title: 'Add Vaccination' }} />
      <PetStack.Screen name="EditVaccinationCustomer" component={EditVaccinationCustomerScreen} options={{ title: 'Edit Vaccination' }} />
    </PetStack.Navigator>
  );

  // Appointment Stack Navigator
  const AppointmentNavigator = () => (
    <AppointmentStack.Navigator screenOptions={screenOptions}>
      <AppointmentStack.Screen name="AppointmentListCustomer" component={AppointmentListCustomerScreen} options={{ title: 'Appointments' }} />
      <AppointmentStack.Screen name="AppointmentDetailCustomer" component={AppointmentDetailCustomerScreen} options={{ title: 'Appointment Details' }} />
      <AppointmentStack.Screen name="BookingCustomer" component={BookingCustomerScreen} options={{ title: 'Book Appointment' }} />
      <AppointmentStack.Screen name="PaymentCustomer" component={PaymentCustomerScreen} options={{ title: 'Payment' }} />
      <AppointmentStack.Screen name="PaymentSuccessCustomer" component={PaymentSuccessCustomerScreen} options={{ title: 'Payment Success', headerShown: false }} />
      <AppointmentStack.Screen name="MedicalDetailCustomer" component={MedicalDetailCustomerScreen} options={{ title: 'Medical Record' }} />
      <AppointmentStack.Screen name="ReviewCustomer" component={ReviewCustomerScreen} options={{ title: 'Leave a Review' }} />
    </AppointmentStack.Navigator>
  );

  // Medical Stack Navigator
  const MedicalNavigator = () => (
    <MedicalStack.Navigator screenOptions={screenOptions}>
      <MedicalStack.Screen name="MedicalHistoryCustomer" component={MedicalHistoryCustomerScreen} options={{ title: 'Medical History' }} />
      <MedicalStack.Screen name="MedicalDetailCustomer" component={MedicalDetailCustomerScreen} options={{ title: 'Medical Record' }} />
    </MedicalStack.Navigator>
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
      <Tab.Screen name="Medical" component={MedicalNavigator} options={{ tabBarLabel: 'Medical' }} />
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
