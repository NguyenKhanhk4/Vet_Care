import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { AuthContext } from '../../../../shared/context/AuthContext';
import { AdminContext } from '../../context/AdminContext';

const ProfileAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { logoutUnified } = useContext(AuthContext);
  const { adminUser } = useContext(AdminContext);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logoutUnified();
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: 'account-edit', title: 'Edit Profile', route: 'EditProfileAdmin' },
    { icon: 'shield-account', title: 'Security Settings', route: 'SettingsAdmin' },
    { icon: 'bell-outline', title: 'Notifications', route: 'NotificationsAdmin' },
    { icon: 'help-circle-outline', title: 'Help & Support', route: 'HelpAdmin' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {adminUser?.avatar ? (
              <Avatar.Image source={{ uri: adminUser.avatar }} size={100} />
            ) : (
              <Avatar.Icon icon="account-tie" size={100} style={{ backgroundColor: colors.primary }} />
            )}
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.secondary }]}>
              <Icon name="camera" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {adminUser?.name || 'Administrator'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {adminUser?.email || 'admin@vetcare.com'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.roleText, { color: colors.primaryDark }]}>System Admin</Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
          <View style={styles.infoRow}>
            <Icon name="phone" size={24} color={colors.textSecondary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {adminUser?.phone || 'Not set'}
              </Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={24} color={colors.textSecondary} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {adminUser?.address || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: colors.secondaryLight }]}>
                    <Icon name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>{item.title}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.textLight} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <Divider style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textColor={colors.error}
          icon="logout"
        >
          Log Out
        </Button>
        <Text style={[styles.versionText, { color: colors.textLight }]}>
          VetCare Admin v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.spacing.md,
  },
  editAvatarBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    ...FONTS.bold,
    fontSize: SIZES.xl,
    marginBottom: SIZES.spacing.xs,
  },
  email: {
    ...FONTS.regular,
    fontSize: SIZES.md,
    marginBottom: SIZES.spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.round,
  },
  roleText: {
    ...FONTS.semiBold,
    fontSize: SIZES.xs,
    textTransform: 'uppercase',
  },
  infoCard: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  infoTextContainer: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  infoLabel: {
    ...FONTS.regular,
    fontSize: SIZES.sm,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.medium,
    fontSize: SIZES.base,
  },
  divider: {
    marginVertical: SIZES.spacing.xs,
  },
  menuCard: {
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    marginBottom: SIZES.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing.base,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  menuItemText: {
    ...FONTS.medium,
    fontSize: SIZES.base,
  },
  menuDivider: {
    marginHorizontal: SIZES.spacing.base,
  },
  logoutBtn: {
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.xl,
  },
  versionText: {
    textAlign: 'center',
    ...FONTS.regular,
    fontSize: SIZES.sm,
  },
});

export default ProfileAdminScreen;
