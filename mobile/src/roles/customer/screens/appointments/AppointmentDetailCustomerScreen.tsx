/**
 * AppointmentDetailCustomerScreen
 * Shows full appointment details with action buttons
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, RefreshControl } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Appointment } from '../../../../shared/types';
import StatusBadge from '../../../../shared/components/StatusBadge';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const AppointmentDetailCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => { fetchAppointment(); }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/appointments/${appointmentId}`);
      setAppointment(res.data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to load'); }
    finally { setIsLoading(false); setRefreshing(false); }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAppointment();
  }, [appointmentId]);

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/appointments/${appointmentId}`);
            Alert.alert('Cancelled', 'Appointment cancelled successfully');
            fetchAppointment();
          } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed to cancel'); }
        }
      },
    ]);
  };

  const handleReview = () => {
    navigation.navigate('ReviewCustomer', { appointmentId });
  };

  const handleChangePaymentMethod = () => {
    const newMethod = appointment?.paymentMethod === 'cash' ? 'payos' : 'cash';
    const methodText = newMethod === 'cash' ? 'Cash' : 'Online (payOS)';
    
    Alert.alert('Change Payment Method', `Do you want to switch to ${methodText}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        try {
          await api.put(`/appointments/${appointmentId}`, { paymentMethod: newMethod });
          Alert.alert('Success', 'Payment method updated successfully');
          fetchAppointment();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Cannot update payment method'); }
      }}
    ]);
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAppointment} />;
  if (!appointment) return null;

  const a = appointment;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <StatusBadge status={a.status} />
        <Text style={styles.amount}>{(a.totalAmount || 0).toLocaleString('vi-VN')}đ</Text>
      </View>

      {/* Date & Time */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Schedule</Text>
        <Text style={styles.dateText}>{formatDate(a.date)}</Text>
        <Text style={styles.timeText}>⏰ {a.time}</Text>
      </View>

      {/* Pet Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🐾 Pet</Text>
        <Text style={styles.infoValue}>{typeof a.pet === 'object' ? `${a.pet.name} (${a.pet.breed || a.pet.species})` : 'Pet'}</Text>
      </View>

      {/* Clinic Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏥 Clinic</Text>
        <Text style={styles.infoValue}>{typeof a.clinic === 'object' ? a.clinic.name : 'Clinic'}</Text>
        <Text style={styles.infoSub}>{typeof a.clinic === 'object' ? a.clinic.address : ''}</Text>
      </View>

      {/* Doctor Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👨‍⚕️ Doctor</Text>
        <Text style={styles.infoValue}>{typeof a.doctor === 'object' ? a.doctor.user?.name : 'Doctor'}</Text>
        <Text style={styles.infoSub}>{typeof a.doctor === 'object' ? a.doctor.specialization : ''}</Text>
      </View>

      {/* Services Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🩺 Services</Text>
        {Array.isArray(a.services) ? a.services.map((s, index) => (
          <Text key={index} style={styles.infoValue}>{s.name}</Text>
        )) : <Text style={styles.infoValue}>Service</Text>}
      </View>

      {/* Notes */}
      {a.notes ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Notes</Text>
          <Text style={styles.infoSub}>{a.notes}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        {a.status === 'pending' && a.paymentStatus !== 'PAID' && (
          <View style={styles.paymentActionRow}>
            {a.paymentMethod === 'payos' && (
              <TouchableOpacity style={[styles.payButton, styles.halfButton]} onPress={() => navigation.navigate('PaymentCustomer', { appointmentId: a._id })} activeOpacity={0.8}>
                <Text style={styles.payButtonText}>💳 Pay Now</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.changeMethodButton, a.paymentMethod === 'payos' ? styles.halfButton : styles.fullButton]} onPress={handleChangePaymentMethod} activeOpacity={0.8}>
              <Text style={styles.changeMethodText}>🔄 Change Method</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {['pending', 'confirmed', 'completed', 'paid'].includes(a.status) && (
          <TouchableOpacity style={[styles.payButton, { backgroundColor: colors.info, marginBottom: SIZES.spacing.sm }]} onPress={() => navigation.navigate('ChatCustomer', { doctorId: typeof a.doctor === 'object' ? a.doctor.user?._id : a.doctor, doctorName: typeof a.doctor === 'object' ? a.doctor.user?.name : 'Doctor' })} activeOpacity={0.8}>
            <Text style={styles.payButtonText}>💬 Chat with Doctor</Text>
          </TouchableOpacity>
        )}
        
        {['pending', 'confirmed'].includes(a.status) && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
        {['completed', 'paid'].includes(a.status) && (
          <TouchableOpacity style={styles.payButton} onPress={handleReview} activeOpacity={0.8}>
            <Text style={styles.payButtonText}>⭐ Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacing.base, backgroundColor: colors.surface, ...SHADOWS.light },
  amount: { fontSize: SIZES.xl, color: colors.primary, ...FONTS.bold },
  card: { backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.sm, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, ...SHADOWS.light },
  cardTitle: { fontSize: SIZES.md, color: colors.textLight, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  dateText: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold },
  timeText: { fontSize: SIZES.md, color: colors.textSecondary, marginTop: 4 },
  infoValue: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold },
  infoSub: { fontSize: SIZES.md, color: colors.textSecondary, marginTop: 4 },
  actions: { padding: SIZES.spacing.base, marginBottom: SIZES.spacing.xxl },
  paymentActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.spacing.sm },
  halfButton: { flex: 0.48, marginBottom: 0 },
  fullButton: { flex: 1, marginBottom: 0 },
  changeMethodButton: { backgroundColor: colors.surface, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  changeMethodText: { color: colors.primary, fontSize: SIZES.base, ...FONTS.semiBold },
  payButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  payButtonText: { color: colors.textWhite, fontSize: SIZES.base, ...FONTS.semiBold },
  cancelButton: { backgroundColor: colors.surface, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  cancelButtonText: { color: colors.error, fontSize: SIZES.base, ...FONTS.semiBold },
});

export default AppointmentDetailCustomerScreen;
