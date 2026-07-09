import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useDoctor } from '../../context/DoctorContext';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';

const ProfileDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { doctor, logout } = useDoctor();
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ Sơ Của Tôi</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {doctor?.user.avatar ? (
            <Image source={{ uri: doctor.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{doctor?.user.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>Bs. {doctor?.user.name}</Text>
        <Text style={styles.email}>{doctor?.user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{doctor?.specialization}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Chuyên môn & Lịch sử</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MedicalHistoryDoctor')}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>🗂️</Text>
            <Text style={styles.menuText}>Lịch sử bệnh án đã tạo</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng Xuất</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: SIZES.spacing.lg, paddingBottom: 50 },
    header: { marginBottom: SIZES.spacing.xl, marginTop: 20 },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    profileSection: { alignItems: 'center', backgroundColor: colors.surface, padding: SIZES.spacing.xl, borderRadius: SIZES.radius.lg, marginBottom: SIZES.spacing.xl, ...SHADOWS.medium },
    avatarContainer: { marginBottom: SIZES.spacing.md },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 40, color: colors.textWhite, ...FONTS.bold },
    name: { fontSize: SIZES.xl, color: colors.textPrimary, ...FONTS.bold, marginBottom: 4 },
    email: { fontSize: SIZES.md, color: colors.textSecondary, marginBottom: SIZES.spacing.sm },
    badge: { backgroundColor: colors.primary + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: colors.primary, fontSize: SIZES.sm, ...FONTS.bold },
    menuSection: { marginBottom: SIZES.spacing.xl },
    sectionTitle: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.bold, marginBottom: SIZES.spacing.sm, paddingLeft: SIZES.spacing.xs },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: SIZES.spacing.lg, borderRadius: SIZES.radius.base, marginBottom: SIZES.spacing.xs, ...SHADOWS.light },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIcon: { fontSize: 20, marginRight: 15 },
    menuText: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium },
    menuArrow: { fontSize: 24, color: colors.textLight },
    logoutButton: { backgroundColor: colors.surface, padding: SIZES.spacing.md, borderRadius: SIZES.radius.base, alignItems: 'center', borderWidth: 1, borderColor: colors.error, marginTop: SIZES.spacing.md },
    logoutText: { color: colors.error, fontSize: SIZES.md, ...FONTS.bold },
    versionText: { textAlign: 'center', color: colors.textLight, marginTop: SIZES.spacing.xl, fontSize: SIZES.sm },
  });

export default ProfileDoctorScreen;
