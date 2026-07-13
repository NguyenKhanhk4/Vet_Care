import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const WeeklyScheduleDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = async () => {
    try {
      const response = await doctorApi.get('/schedules/week');
      setScheduleData(response.data.data);
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const isToday = (dateString: string) => {
    return dateString === new Date().toISOString().split('T')[0];
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Khám Trong Tuần</Text>
        <Text style={styles.headerSubtitle}>Từ {scheduleData?.weekStart} đến {scheduleData?.weekEnd}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {scheduleData?.schedule?.map((day: any, index: number) => (
          <View key={index} style={styles.dayGroup}>
            <View style={[styles.dayHeader, isToday(day.date) && styles.todayHeader]}>
              <Text style={[styles.dayName, isToday(day.date) && { color: colors.primary }]}>
                {day.dayName} {isToday(day.date) ? '(Hôm nay)' : ''}
              </Text>
              <Text style={[styles.dateText, isToday(day.date) && { color: colors.primary }]}>{day.date}</Text>
            </View>

            {day.appointments.length > 0 ? (
              day.appointments.map((appt: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.card}
                  onPress={() => navigation.navigate('AppointmentDetail', { id: appt._id })}
                >
                  <View style={styles.timeSection}>
                    <Text style={styles.timeText}>{appt.time}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appt.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(appt.status) }]}>{getStatusText(appt.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={styles.petName}>🐾 {appt.pet.name}</Text>
                    <Text style={styles.customerName}>👤 {appt.customer.name}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyDayBox}>
                <Text style={styles.emptyDayText}>Không có lịch hẹn</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: SIZES.spacing.lg, backgroundColor: colors.surface, ...SHADOWS.light },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    headerSubtitle: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 4 },
    scrollContent: { padding: SIZES.spacing.lg },
    dayGroup: { marginBottom: SIZES.spacing.xl },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.sm, paddingBottom: 8, borderBottomWidth: 1, borderColor: colors.border },
    todayHeader: { borderColor: colors.primary, borderBottomWidth: 2 },
    dayName: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold },
    dateText: { fontSize: SIZES.md, color: colors.textSecondary },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
    timeSection: { width: 90, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: colors.border, paddingRight: SIZES.spacing.md },
    timeText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: 4 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusText: { fontSize: 10, ...FONTS.bold },
    infoSection: { flex: 1, paddingLeft: SIZES.spacing.md, justifyContent: 'center' },
    petName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold, marginBottom: 4 },
    customerName: { fontSize: SIZES.sm, color: colors.textSecondary },
    emptyDayBox: { padding: SIZES.spacing.lg, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, alignItems: 'center', opacity: 0.7 },
    emptyDayText: { color: colors.textSecondary, fontStyle: 'italic' },
  });

export default WeeklyScheduleDoctorScreen;
