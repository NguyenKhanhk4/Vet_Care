import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const TermsOfServiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the VetCare mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </Text>

          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            Users are responsible for keeping their login information secure. You agree to notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={styles.sectionTitle}>3. Appointment Booking</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Appointments depend on clinic availability.</Text>
            <Text style={styles.listItem}>• Users should arrive on time for their scheduled appointments.</Text>
            <Text style={styles.listItem}>• Late arrivals may require rescheduling at the clinic's discretion.</Text>
          </View>

          <Text style={styles.sectionTitle}>4. Payments</Text>
          <Text style={styles.paragraph}>
            Payment policies may vary by clinic. VetCare may facilitate online payments, but final service charges and refund policies are determined by the respective veterinary clinics.
          </Text>

          <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
          <Text style={styles.paragraph}>By using VetCare, users agree to:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Provide accurate information about themselves and their pets.</Text>
            <Text style={styles.listItem}>• Respect veterinarians and clinic staff.</Text>
            <Text style={styles.listItem}>• Avoid misuse of the application or its booking systems.</Text>
          </View>

          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            VetCare provides appointment booking services only. All medical decisions, diagnoses, and treatments are made by licensed veterinarians. VetCare is not liable for medical outcomes.
          </Text>

          <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            VetCare may update these terms at any time. Continued use of the application following such changes indicates your acknowledgment and acceptance of the new terms.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact</Text>
          <View style={styles.contactBox}>
            <Text style={styles.contactLabel}>Email Support:</Text>
            <Text style={styles.contactValue}>support@vetcare.com</Text>
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
    marginTop: SIZES.spacing.xs,
  },
  contactValue: {
    fontSize: SIZES.base,
    color: colors.primary,
    ...FONTS.semiBold,
  }
});

export default TermsOfServiceScreen;
