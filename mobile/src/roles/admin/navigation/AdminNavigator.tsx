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
import PlaceholderScreen from '../screens/PlaceholderScreen';

import ServicePriceListAdminScreen from '../screens/services/ServicePriceListAdminScreen';
import AddServicePriceAdminScreen from '../screens/services/AddServicePriceAdminScreen';
import EditServicePriceAdminScreen from '../screens/services/EditServicePriceAdminScreen';
import ServicePriceDetailAdminScreen from '../screens/services/ServicePriceDetailAdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({ name, focused, colors }: { name: string; focused: boolean; colors: ThemeColors }) => {
  const icons: Record<string, string> = {
    Dashboard: 'view-dashboard',
    Users: 'account-group',
    Appointments: 'calendar-check',
    Clinics: 'hospital-building',
    Services: 'medical-bag',
    Profile: 'shield-account',
  };

  const iconName = icons[name] || 'circle';

  return (
    <View style={styles.tabIconContainer}>
      <Icon 
        name={iconName} 
        size={26} 
        color={focused ? colors.primary : colors.textLight} 
      />
    </View>
  );
};

// Main Admin Tab Navigator
const MainAdminNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} colors={colors} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.divider }],
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardAdminScreen} />
      <Tab.Screen name="Users" component={UserListAdminScreen} />
      <Tab.Screen name="Appointments" component={AppointmentListAdminScreen} />
      <Tab.Screen name="Clinics" component={ClinicListAdminScreen} />
      <Tab.Screen name="Services" component={ServicePriceListAdminScreen} />
      <Tab.Screen name="Profile" component={ProfileAdminScreen} />
    </Tab.Navigator>
  );
};

// Root Admin Navigator
const AdminNavigator = () => {
  const { isAdminAuthenticated, isLoading } = useContext(AdminContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // We no longer need AuthNavigator here because RootNavigator handles it.
  // But just in case AdminContext somehow isn't synced, we could show a fallback.
  // For now, if they are not authenticated, they shouldn't even be here.
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={MainAdminNavigator} />
      <Stack.Screen name="ServiceAdd" component={AddServicePriceAdminScreen} />
      <Stack.Screen name="ServiceEdit" component={EditServicePriceAdminScreen} />
      <Stack.Screen name="ServiceDetail" component={ServicePriceDetailAdminScreen} />
    </Stack.Navigator>
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
