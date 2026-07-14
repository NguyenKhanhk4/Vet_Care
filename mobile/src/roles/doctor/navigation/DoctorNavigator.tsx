import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { useDoctor } from '../context/DoctorContext';
import { useTheme } from '../../../shared/context/ThemeContext';
import { FONTS } from '../../../shared/constants/theme';



// Main Screens
import HomeDoctorScreen from '../screens/home/HomeDoctorScreen';
import TodayScheduleDoctorScreen from '../screens/schedule/TodayScheduleDoctorScreen';
import WeeklyScheduleDoctorScreen from '../screens/schedule/WeeklyScheduleDoctorScreen';
import AppointmentListDoctorScreen from '../screens/appointment/AppointmentListDoctorScreen';
import AppointmentDetailDoctorScreen from '../screens/appointment/AppointmentDetailDoctorScreen';
import MedicalRecordDoctorScreen from '../screens/medical/MedicalRecordDoctorScreen';
import ProfileDoctorScreen from '../screens/profile/ProfileDoctorScreen';
import EditProfileDoctorScreen from '../screens/profile/EditProfileDoctorScreen';
import ChangePasswordDoctorScreen from '../screens/profile/ChangePasswordDoctorScreen';
import MedicalHistoryDoctorScreen from '../screens/medical/MedicalHistoryDoctorScreen';
import NotificationDoctorScreen from '../screens/notifications/NotificationDoctorScreen';
import CustomerPetsDoctorScreen from '../screens/customer/CustomerPetsDoctorScreen';

const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon = '';
          if (route.name === 'HomeTab') icon = '🏠';
          else if (route.name === 'ScheduleTab') icon = '📅';
          else if (route.name === 'AppointmentTab') icon = '📋';
          else if (route.name === 'ProfileTab') icon = '👤';
          return <Text style={{ fontSize: size - 4, color }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          ...FONTS.medium,
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeDoctorScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="ScheduleTab" component={TodayScheduleDoctorScreen} options={{ tabBarLabel: 'Lịch hôm nay' }} />
      <Tab.Screen name="AppointmentTab" component={AppointmentListDoctorScreen} options={{ tabBarLabel: 'Lịch hẹn' }} />
      <Tab.Screen name="ProfileTab" component={ProfileDoctorScreen} options={{ tabBarLabel: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
};

const DoctorNavigator = () => {
  const { doctor, isLoading } = useDoctor();

  if (isLoading) {
    return null; // Return splash or loader if needed
  }

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Main" component={TabNavigator} />
      {/* Stack screens nested inside Main */}
      <MainStack.Screen name="WeeklySchedule" component={WeeklyScheduleDoctorScreen} />
      <MainStack.Screen name="AppointmentDetail" component={AppointmentDetailDoctorScreen} />
      <MainStack.Screen name="MedicalRecordDoctor" component={MedicalRecordDoctorScreen} />
      <MainStack.Screen name="MedicalHistoryDoctor" component={MedicalHistoryDoctorScreen} />
      <MainStack.Screen name="EditProfile" component={EditProfileDoctorScreen} />
      <MainStack.Screen name="ChangePassword" component={ChangePasswordDoctorScreen} />
      <MainStack.Screen name="Notifications" component={NotificationDoctorScreen} />
      <MainStack.Screen name="CustomerPetsDoctor" component={CustomerPetsDoctorScreen} />
    </MainStack.Navigator>
  );
};

export default DoctorNavigator;
