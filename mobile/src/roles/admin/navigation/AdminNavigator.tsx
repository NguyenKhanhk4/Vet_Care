import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Context
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../../../shared/context/ThemeContext';
import { SIZES, FONTS, ThemeColors } from '../../../shared/constants/theme';

// Screens
import DashboardAdminScreen from '../screens/dashboard/DashboardAdminScreen';
import ProfileAdminScreen from '../screens/profile/ProfileAdminScreen';
import UserListAdminScreen from '../screens/users/UserListAdminScreen';
import AppointmentListAdminScreen from '../screens/appointments/AppointmentListAdminScreen';
import ClinicListAdminScreen from '../screens/clinics/ClinicListAdminScreen';
import RevenueAdminScreen from '../screens/revenue/RevenueAdminScreen';

import ServicePriceListAdminScreen from '../screens/services/ServicePriceListAdminScreen';
import AddServicePriceAdminScreen from '../screens/services/AddServicePriceAdminScreen';
import EditServicePriceAdminScreen from '../screens/services/EditServicePriceAdminScreen';
import ServicePriceDetailAdminScreen from '../screens/services/ServicePriceDetailAdminScreen';
import ClinicDoctorListAdminScreen from '../screens/clinics/ClinicDoctorListAdminScreen';
import UserDetailAdminScreen from '../screens/users/UserDetailAdminScreen';
import NotificationListAdminScreen from '../screens/notifications/NotificationListAdminScreen';
import PetListAdminScreen from '../screens/pets/PetListAdminScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const UsersStack = createNativeStackNavigator();
const AppointmentsStack = createNativeStackNavigator();
const ClinicStack = createNativeStackNavigator();
const ServicesStack = createNativeStackNavigator();
const RevenueStack = createNativeStackNavigator();

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="DashboardMain" component={DashboardAdminScreen} />
    <DashboardStack.Screen name="NotificationList" component={NotificationListAdminScreen} />
    <DashboardStack.Screen name="Profile" component={ProfileAdminScreen} />
    <DashboardStack.Screen name="PetList" component={PetListAdminScreen} />
  </DashboardStack.Navigator>
);

const UsersStackNavigator = () => (
  <UsersStack.Navigator screenOptions={{ headerShown: false }}>
    <UsersStack.Screen name="UsersMain" component={UserListAdminScreen} />
    <UsersStack.Screen name="UserDetail" component={UserDetailAdminScreen} />
  </UsersStack.Navigator>
);

const AppointmentsStackNavigator = () => (
  <AppointmentsStack.Navigator screenOptions={{ headerShown: false }}>
    <AppointmentsStack.Screen name="AppointmentsMain" component={AppointmentListAdminScreen} />
  </AppointmentsStack.Navigator>
);

const ClinicStackNavigator = () => (
  <ClinicStack.Navigator screenOptions={{ headerShown: false }}>
    <ClinicStack.Screen name="ClinicList" component={ClinicListAdminScreen} />
    <ClinicStack.Screen name="ClinicDoctorList" component={ClinicDoctorListAdminScreen} />
    <ClinicStack.Screen name="UserDetail" component={UserDetailAdminScreen} />
  </ClinicStack.Navigator>
);

const ServicesStackNavigator = () => (
  <ServicesStack.Navigator screenOptions={{ headerShown: false }}>
    <ServicesStack.Screen name="ServicesMain" component={ServicePriceListAdminScreen} />
    <ServicesStack.Screen name="ServiceAdd" component={AddServicePriceAdminScreen} />
    <ServicesStack.Screen name="ServiceEdit" component={EditServicePriceAdminScreen} />
    <ServicesStack.Screen name="ServiceDetail" component={ServicePriceDetailAdminScreen} />
  </ServicesStack.Navigator>
);

const RevenueStackNavigator = () => (
  <RevenueStack.Navigator screenOptions={{ headerShown: false }}>
    <RevenueStack.Screen name="RevenueMain" component={RevenueAdminScreen} />
  </RevenueStack.Navigator>
);

// Tab Icon Component
const TabIcon = ({ name, focused, colors }: { name: string; focused: boolean; colors: ThemeColors }) => {
  const icons: Record<string, string> = {
    Dashboard: 'view-dashboard',
    Users: 'account-group',
    Appointments: 'calendar-check',
    Clinics: 'hospital-building',
    Services: 'medical-bag',
    Revenue: 'cash-multiple',
  };

  const iconName = icons[name] || 'circle';

  return (
    <View style={styles.tabIconContainer}>
      <Icon 
        name={iconName as any}
        size={26} 
        color={focused ? colors.primary : colors.textLight} 
      />
    </View>
  );
};

// Root Admin Navigator
const AdminNavigator = () => {
  const { isLoading } = useContext(AdminContext);
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} colors={colors} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.divider }],
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Users" component={UsersStackNavigator} />
      <Tab.Screen name="Appointments" component={AppointmentsStackNavigator} />
      <Tab.Screen name="Clinics" component={ClinicStackNavigator} />
      <Tab.Screen name="Services" component={ServicesStackNavigator} />
      <Tab.Screen name="Revenue" component={RevenueStackNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  tabBar: {
    borderTopWidth: 1,
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
});

export default AdminNavigator;
