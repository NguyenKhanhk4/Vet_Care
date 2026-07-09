/**
 * PaymentCustomerScreen
 * Payment method selection and processing (VNPay, MoMo, Cash)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Appointment, PaymentMethod } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const PAYMENT_METHODS = [
  { id: 'vnpay' as PaymentMethod, name: 'VNPay', icon: '🏦', descKey: 'VNPay Secure Payment' },
  { id: 'momo' as PaymentMethod, name: 'MoMo', icon: '📱', descKey: 'MoMo E-Wallet' },
  { id: 'cash' as PaymentMethod, name: 'Cash', icon: '💵', descKey: 'Pay at clinic' },
];

const PaymentCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const fetchAppointment = async () => {
      try { const res = await api.get(`/appointments/${appointmentId}`); setAppointment(res.data.data); }
      catch { Alert.alert('Error', 'Failed to load appointment'); navigation.goBack(); }
      finally { setIsLoading(false); }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!selectedMethod) { Alert.alert('Error', 'Please select a payment method'); return; }
    try {
      setIsProcessing(true);
      const res = await api.post('/payments', { appointmentId, method: selectedMethod });
      const payment = res.data.data;
      navigation.replace('PaymentSuccessCustomer', { paymentId: payment._id, transactionId: payment.transactionId });
    } catch (error: any) {
      Alert.alert('Payment Failed', error.response?.data?.message || 'Payment processing failed');
    } finally { setIsProcessing(false); }
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

      {/* Payment Methods */}
      <Text style={styles.sectionTitle}>Select Payment Method</Text>
      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
          onPress={() => setSelectedMethod(method.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.methodIcon}>{method.icon}</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>{method.name}</Text>
            <Text style={styles.methodDesc}>{method.descKey}</Text>
          </View>
          <View style={[styles.radio, selectedMethod === method.id && styles.radioActive]}>
            {selectedMethod === method.id && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      ))}

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, (!selectedMethod || isProcessing) && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={!selectedMethod || isProcessing}
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
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, borderWidth: 2, borderColor: 'transparent', ...SHADOWS.light },
  methodCardActive: { borderColor: colors.primary, backgroundColor: colors.secondaryLight },
  methodIcon: { fontSize: 32, marginRight: SIZES.spacing.base },
  methodInfo: { flex: 1 },
  methodName: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold },
  methodDesc: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  payButton: { backgroundColor: colors.primary, margin: SIZES.spacing.base, marginTop: SIZES.spacing.xl, marginBottom: SIZES.spacing.xxl, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', ...SHADOWS.medium },
  payButtonDisabled: { opacity: 0.5 },
  payButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
});

export default PaymentCustomerScreen;
