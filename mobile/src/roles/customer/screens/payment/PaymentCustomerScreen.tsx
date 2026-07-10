/**
 * PaymentCustomerScreen
 * Initiates payment via payOS
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Appointment } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const PaymentCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'payos' | 'cash'>('payos');
  const { colors } = useTheme();

  useEffect(() => {
    const fetchAppointment = async () => {
      try { 
        const res = await api.get(`/appointments/${appointmentId}`); 
        setAppointment(res.data.data); 
      }
      catch (error) { 
        Alert.alert('Error', 'Failed to load appointment'); 
        navigation.goBack(); 
      }
      finally { setIsLoading(false); }
    };
    fetchAppointment();
  }, [appointmentId, navigation]);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const res = await api.post('/payments/create', { appointmentId, method: paymentMethod });
      
      if (res.data.data.method === 'cash') {
        navigation.replace('PaymentSuccessCustomer', { orderCode: res.data.data.orderCode, method: 'cash' });
      } else {
        const { checkoutUrl, orderCode } = res.data.data;
        navigation.replace('PaymentWebViewCustomer', { checkoutUrl, orderCode });
      }
    } catch (error: any) {
      Alert.alert('Payment Failed', error.response?.data?.message || 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (!appointment) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Amount Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>{(appointment.totalAmount || 0).toLocaleString('vi-VN')}đ</Text>
        <Text style={styles.serviceText}>{typeof appointment.service === 'object' ? appointment.service.name : 'Service'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      <TouchableOpacity 
        style={paymentMethod === 'payos' ? styles.methodCardActive : styles.methodCard}
        onPress={() => setPaymentMethod('payos')}
        activeOpacity={0.7}
      >
        <Text style={styles.methodIcon}>💳</Text>
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>Thanh toán Online</Text>
          <Text style={styles.methodDesc}>Qua payOS (QR, Thẻ, Ví điện tử)</Text>
        </View>
        {paymentMethod === 'payos' && <Text style={styles.checkIcon}>✅</Text>}
      </TouchableOpacity>

      {appointment.paymentMethod !== 'payos' && (
        <TouchableOpacity 
          style={paymentMethod === 'cash' ? styles.methodCardActive : styles.methodCard}
          onPress={() => setPaymentMethod('cash')}
          activeOpacity={0.7}
        >
          <Text style={styles.methodIcon}>💵</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Thanh toán Tiền mặt</Text>
            <Text style={styles.methodDesc}>Thanh toán trực tiếp tại phòng khám</Text>
          </View>
          {paymentMethod === 'cash' && <Text style={styles.checkIcon}>✅</Text>}
        </TouchableOpacity>
      )}

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        <Text style={styles.payButtonText}>{isProcessing ? 'Processing...' : `Pay ${(appointment.totalAmount || 0).toLocaleString('vi-VN')}đ`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  amountCard: { backgroundColor: colors.primary, margin: SIZES.spacing.base, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.xxl, alignItems: 'center' },
  amountLabel: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.8)', marginBottom: SIZES.spacing.xs },
  amountValue: { fontSize: 36, color: colors.textWhite, ...FONTS.bold },
  serviceText: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.8)', marginTop: SIZES.spacing.sm },
  sectionTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.md, marginTop: SIZES.spacing.sm },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, borderWidth: 1, borderColor: colors.border },
  methodCardActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, marginHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, borderWidth: 2, borderColor: colors.primary, ...SHADOWS.light },
  methodIcon: { fontSize: 32, marginRight: SIZES.spacing.base },
  methodInfo: { flex: 1 },
  methodName: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold },
  methodDesc: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 2 },
  checkIcon: { fontSize: 20 },
  payButton: { backgroundColor: colors.primary, margin: SIZES.spacing.base, marginTop: SIZES.spacing.xl, marginBottom: SIZES.spacing.xxl, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', ...SHADOWS.medium },
  payButtonDisabled: { opacity: 0.5 },
  payButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
});

export default PaymentCustomerScreen;
