import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

const PaymentSuccessCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { orderCode, method } = route.params || {};
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✅</Text>
        </View>
        <Text style={styles.title}>
          {method === 'cash' ? 'Đặt lịch thành công' : method === 'payos_later' ? 'Đặt lịch thành công' : 'Thanh toán thành công'}
        </Text>
        <Text style={styles.subtitle}>
          {method === 'cash' ? 'Vui lòng thanh toán trực tiếp tại phòng khám' : method === 'payos_later' ? 'Vui lòng thanh toán chuyển khoản trước giờ hẹn' : 'Lịch hẹn của bạn đã được đặt'}
        </Text>

        {orderCode && (
          <View style={styles.transactionCard}>
            <Text style={styles.transLabel}>Order Code</Text>
            <Text style={styles.transValue}>{orderCode}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => { navigation.popToTop(); navigation.navigate('Appointments'); }} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Appointments</Text>
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
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.xl },
  icon: { fontSize: 48 },
  title: { fontSize: SIZES.xxl, color: colors.primary, ...FONTS.bold, marginBottom: SIZES.spacing.sm },
  subtitle: { fontSize: SIZES.base, color: colors.textSecondary, textAlign: 'center', marginBottom: SIZES.spacing.xxl },
  transactionCard: { backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.xl, width: '100%', alignItems: 'center', marginBottom: SIZES.spacing.xxl, ...SHADOWS.light },
  transLabel: { fontSize: SIZES.sm, color: colors.textLight, marginBottom: SIZES.spacing.xs },
  transValue: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.medium },
  primaryButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: 10, width: '100%', alignItems: 'center', marginBottom: SIZES.spacing.md, ...SHADOWS.light },
  primaryButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
  secondaryButton: { paddingVertical: 10 },
  secondaryButtonText: { color: colors.primary, fontSize: SIZES.base, ...FONTS.medium },
});

export default PaymentSuccessCustomerScreen;
