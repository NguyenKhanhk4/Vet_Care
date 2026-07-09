/**
 * SettingsCustomerScreen
 * App settings including Theme, Language, Notifications
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const SettingsCustomerScreen: React.FC = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedNotif = await AsyncStorage.getItem('notifications');
        if (savedNotif === 'false') setNotificationsEnabled(false);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const handleToggleTheme = (value: boolean) => {
    toggleTheme(value);
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications', value ? 'true' : 'false');
  };



  const handleLink = (title: string) => {
    Alert.alert(title, `This will open the ${title} page in a web browser.`);
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌙</Text>
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: colors.divider, true: colors.primaryLight }}
            thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
            onValueChange={handleToggleTheme}
            value={isDarkMode}
          />
        </View>
        <View style={styles.divider} />

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: colors.divider, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>
      </View>

      {/* About & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About & Support</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => handleLink('Privacy Policy')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingItem} onPress={() => handleLink('Terms of Service')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>📜</Text>
            <Text style={styles.settingLabel}>Terms of Service</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.settingItem} onPress={() => handleLink('Help Center')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>❓</Text>
            <Text style={styles.settingLabel}>Help Center</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { backgroundColor: colors.surface, margin: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, borderRadius: SIZES.radius.base, ...SHADOWS.light, overflow: 'hidden' },
  sectionTitle: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold, padding: SIZES.spacing.base, backgroundColor: colors.background },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacing.base },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { fontSize: 20, marginRight: SIZES.spacing.md, width: 24, textAlign: 'center' },
  settingLabel: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.medium },
  settingValue: { fontSize: SIZES.base, color: colors.textSecondary },
  arrow: { fontSize: SIZES.xl, color: colors.textLight },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: SIZES.spacing.xxl },
});




export default SettingsCustomerScreen;
