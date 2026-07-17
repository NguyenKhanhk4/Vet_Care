import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            VetCare respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile application.
          </Text>

          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>We may collect the following types of information:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Full name</Text>
            <Text style={styles.listItem}>• Email address</Text>
            <Text style={styles.listItem}>• Phone number</Text>
            <Text style={styles.listItem}>• Pet information</Text>
            <Text style={styles.listItem}>• Appointment history</Text>
            <Text style={styles.listItem}>• Device information (optional)</Text>
          </View>

          <Text style={styles.sectionTitle}>3. How We Use Information</Text>
          <Text style={styles.paragraph}>We use the collected information to:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Create and manage your user account</Text>
            <Text style={styles.listItem}>• Manage your appointments</Text>
            <Text style={styles.listItem}>• Improve our services and features</Text>
            <Text style={styles.listItem}>• Provide customer support</Text>
            <Text style={styles.listItem}>• Send notifications regarding your bookings</Text>
          </View>

          <Text style={styles.sectionTitle}>4. Data Sharing</Text>
          <Text style={styles.paragraph}>
            VetCare does not sell your personal information. We only share necessary data with veterinary clinics and doctors to facilitate your requested services and appointments.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            Your information is stored securely. We implement modern security practices and technical safeguards to protect your personal data against unauthorized access, alteration, or destruction.
          </Text>

          <Text style={styles.sectionTitle}>6. User Rights</Text>
          <Text style={styles.paragraph}>As a user, you have the right to:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• View your personal information</Text>
            <Text style={styles.listItem}>• Update or correct your information</Text>
            <Text style={styles.listItem}>• Request account deletion</Text>
            <Text style={styles.listItem}>• Contact our support team for privacy concerns</Text>
          </View>

          <Text style={styles.sectionTitle}>7. Contact</Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>support@vetcare.com</Text>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>+84 123 456 789</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.base,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.md,
    backgroundColor: colors.primary,
  },
  backButton: { padding: SIZES.spacing.xs },
  backIcon: { fontSize: 24, color: colors.textWhite, ...FONTS.bold },
  headerTitle: { fontSize: SIZES.lg, color: colors.textWhite, ...FONTS.semiBold },
  headerRight: { width: 30 },
  content: { flex: 1 },
  scrollContent: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius.base,
    padding: SIZES.spacing.lg,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
  },
  paragraph: {
    fontSize: SIZES.base,
    color: colors.textSecondary,
    ...FONTS.medium,
    lineHeight: 22,
  },
  list: {
    marginTop: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  listItem: {
    fontSize: SIZES.base,
    color: colors.textSecondary,
    ...FONTS.medium,
    lineHeight: 24,
    marginLeft: SIZES.spacing.sm,
  },
  contactBox: {
    backgroundColor: colors.background,
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
  },
  contactLabel: {
    fontSize: SIZES.sm,
    color: colors.textLight,
    ...FONTS.medium,
    marginTop: SIZES.spacing.sm,
  },
  contactValue: {
    fontSize: SIZES.base,
    color: colors.primary,
    ...FONTS.semiBold,
  }
});

export default PrivacyPolicyScreen;
