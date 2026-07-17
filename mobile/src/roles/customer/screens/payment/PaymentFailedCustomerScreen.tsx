import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const PaymentFailedCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { orderCode } = route.params || {};
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>❌</Text>
        </View>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>Your payment could not be processed. Please try again.</Text>

        {orderCode && (
          <View style={styles.transactionCard}>
            <Text style={styles.transLabel}>Order Code</Text>
            <Text style={styles.transValue}>{orderCode}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => { navigation.goBack(); }} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => { navigation.popToTop(); navigation.navigate('Home'); }} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: SIZES.spacing.xxl },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.xl },
  icon: { fontSize: 48 },
  title: { fontSize: SIZES.xxl, color: colors.error, ...FONTS.bold, marginBottom: SIZES.spacing.sm },
  subtitle: { fontSize: SIZES.base, color: colors.textSecondary, textAlign: 'center', marginBottom: SIZES.spacing.xxl },
  transactionCard: { backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.xl, width: '100%', alignItems: 'center', marginBottom: SIZES.spacing.xxl, ...SHADOWS.light },
  transLabel: { fontSize: SIZES.sm, color: colors.textLight, marginBottom: SIZES.spacing.xs },
  transValue: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.medium },
  primaryButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', ...SHADOWS.light },
  primaryButtonText: { color: colors.textWhite, fontSize: SIZES.md, ...FONTS.semiBold },
  secondaryButton: { paddingVertical: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: SIZES.radius.base, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.primary, fontSize: SIZES.md, ...FONTS.semiBold },
});

export default PaymentFailedCustomerScreen;
