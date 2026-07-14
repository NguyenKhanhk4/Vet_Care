import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../shared/constants/theme';
import StatusBadge from './StatusBadge';
import InfoRow from './InfoRow';
import { translateSpecies } from '../../../shared/utils/translate';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  showTimeOnly?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPress, showTimeOnly = false }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={[styles.card, showTimeOnly && styles.cardRow]} onPress={onPress}>
      {showTimeOnly ? (
        <>
          <View style={styles.timeSection}>
            <Text style={styles.timeText}>{appointment.time}</Text>
            <StatusBadge status={appointment.status} />
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.petName}>🐾 {appointment.pet?.name} ({translateSpecies(appointment.pet?.species)})</Text>
            <Text style={styles.customerName}>👤 {appointment.customer?.name}</Text>
            <Text style={styles.serviceName}>🩺 {appointment.services?.[0]?.name || 'Dịch vụ'}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.cardHeader}>
            <Text style={styles.dateText}>📅 {new Date(appointment.date).toLocaleDateString('vi-VN')} lúc {appointment.time}</Text>
            <StatusBadge status={appointment.status} />
          </View>
          <View style={styles.cardBody}>
            <InfoRow label="Khách hàng:" value={appointment.customer?.name} />
            <InfoRow label="Thú cưng:" value={`${appointment.pet?.name} (${translateSpecies(appointment.pet?.species)})`} />
            <InfoRow label="Dịch vụ:" value={appointment.services?.map(s => s.name).join(', ') || 'Chưa chọn'} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: { 
      backgroundColor: colors.surface, 
      borderRadius: SIZES.radius.lg, 
      padding: SIZES.spacing.md, 
      marginBottom: SIZES.spacing.md, 
      ...SHADOWS.light 
    },
    cardRow: {
      flexDirection: 'row',
    },
    // Styles for time only (TodaySchedule)
    timeSection: { 
      width: 80, 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRightWidth: 1, 
      borderColor: colors.border, 
      paddingRight: SIZES.spacing.md 
    },
    timeText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: 8 },
    infoSection: { flex: 1, paddingLeft: SIZES.spacing.md, justifyContent: 'center' },
    petName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold, marginBottom: 4 },
    customerName: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
    serviceName: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.medium },
    // Styles for full card (AppointmentList)
    cardHeader: { 
      flex: 1,
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: SIZES.spacing.sm, 
      borderBottomWidth: 1, 
      borderColor: colors.border, 
      paddingBottom: 10 
    },
    dateText: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold },
    cardBody: { paddingTop: 5, flex: 1 },
  });

export default AppointmentCard;
