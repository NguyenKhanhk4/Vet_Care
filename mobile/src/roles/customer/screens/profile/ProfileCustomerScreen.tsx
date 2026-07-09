import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useCustomer } from '../../context/CustomerContext';
import { useTheme } from '../../../../shared/context/ThemeContext';

const ProfileCustomerScreen = ({ navigation }: any) => {
  const { logout, user } = useCustomer();
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: '✏️', label: 'Edit Profile', screen: 'EditProfileCustomer' },
    { icon: '🔒', label: 'Change Password', screen: 'ChangePasswordCustomer' },
    { icon: '📋', label: 'Medical History', screen: 'MedicalHistoryCustomer' },
    { icon: '⚙️', label: 'Settings', screen: 'SettingsCustomer' },
  ];

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header / User Info */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User Name'}</Text>
        <Text style={styles.phone}>{user?.phone || 'No phone number'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Standard Member</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            {index < menuItems.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    ...SHADOWS.light,
    marginBottom: SIZES.spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontSize: 40,
    color: colors.primaryDark,
    ...FONTS.bold,
  },
  name: {
    fontSize: SIZES.xl,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: SIZES.spacing.xs,
  },
  phone: {
    fontSize: SIZES.md,
    color: colors.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  badge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.round,
  },
  badgeText: {
    color: colors.secondaryDark,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.light,
    marginBottom: SIZES.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: SIZES.spacing.md,
  },
  menuLabel: {
    fontSize: SIZES.md,
    color: colors.textPrimary,
    ...FONTS.medium,
  },
  menuArrow: {
    fontSize: SIZES.xl,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: SIZES.spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.light,
    marginBottom: SIZES.spacing.xxl,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SIZES.spacing.sm,
  },
  logoutText: {
    color: colors.error,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
});

export default ProfileCustomerScreen;
