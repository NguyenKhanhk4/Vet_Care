import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const AboutUsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🐾</Text>
          <Text style={styles.appName}>VetCare</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            At VetCare, our mission is to provide seamless, high-quality healthcare for your beloved pets. We connect pet owners with top-rated veterinary clinics and experienced doctors.
          </Text>

          <Text style={styles.sectionTitle}>Why Choose VetCare?</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Easy appointment booking process</Text>
            <Text style={styles.listItem}>• Access to a wide network of clinics</Text>
            <Text style={styles.listItem}>• Comprehensive pet medical records</Text>
            <Text style={styles.listItem}>• Direct communication with doctors</Text>
            <Text style={styles.listItem}>• Transparent pricing and reviews</Text>
          </View>

          <Text style={styles.sectionTitle}>Our Story</Text>
          <Text style={styles.paragraph}>
            Founded in 2026, VetCare started with a simple idea: making pet healthcare as accessible as human healthcare. We understand that pets are family, and they deserve the best care possible. Our platform bridges the gap between pet parents and veterinarians, ensuring your furry friends live long, happy, and healthy lives.
          </Text>

          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>📘</Text>
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>📸</Text>
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>🐦</Text>
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.footerText}>© 2026 VetCare Inc. All rights reserved.</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: SIZES.spacing.xl,
  },
  logoText: {
    fontSize: 64,
  },
  appName: {
    fontSize: SIZES.xxl,
    color: colors.primaryDark,
    ...FONTS.bold,
    marginTop: SIZES.spacing.sm,
  },
  version: {
    fontSize: SIZES.sm,
    color: colors.textLight,
    ...FONTS.medium,
    marginTop: 4,
  },
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
    marginTop: SIZES.spacing.md,
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
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.spacing.md,
  },
  socialButton: {
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  socialText: {
    fontSize: SIZES.xs,
    color: colors.textSecondary,
    ...FONTS.medium,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: SIZES.xs,
    ...FONTS.medium,
    marginTop: SIZES.spacing.xl,
  }
});

export default AboutUsScreen;
