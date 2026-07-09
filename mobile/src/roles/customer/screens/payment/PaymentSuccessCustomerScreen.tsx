/**
 * PaymentSuccessCustomerScreen
 * Displays payment success with transaction details
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const PaymentSuccessCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { transactionId } = route.params;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✅</Text>
        </View>
        <Text style={styles.title}>Payment Success</Text>
        <Text style={styles.subtitle}>Your payment has been processed successfully</Text>

        <View style={styles.transactionCard}>
          <Text style={styles.transLabel}>Transaction ID</Text>
          <Text style={styles.transValue}>{transactionId}</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => { navigation.popToTop(); navigation.navigate('Appointments'); }} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Appointments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => { navigation.popToTop(); navigation.navigate('Home'); }} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: SIZES.spacing.xxl },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.xl },
  icon: { fontSize: 48 },
  title: { fontSize: SIZES.xxl, color: colors.primary, ...FONTS.bold, marginBottom: SIZES.spacing.sm },
  subtitle: { fontSize: SIZES.base, color: colors.textSecondary, textAlign: 'center', marginBottom: SIZES.spacing.xxl },
  transactionCard: { backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.xl, width: '100%', alignItems: 'center', marginBottom: SIZES.spacing.xxl, ...SHADOWS.light },
  transLabel: { fontSize: SIZES.sm, color: colors.textLight, marginBottom: SIZES.spacing.xs },
  transValue: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.medium },
  primaryButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, width: '100%', alignItems: 'center', marginBottom: SIZES.spacing.md, ...SHADOWS.light },
  primaryButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
  secondaryButton: { paddingVertical: SIZES.spacing.md },
  secondaryButtonText: { color: colors.primary, fontSize: SIZES.base, ...FONTS.medium },
});

export default PaymentSuccessCustomerScreen;
