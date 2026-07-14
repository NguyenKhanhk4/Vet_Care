import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';
import { useSchedule } from '../../hooks/useSchedule';
import LoadingScreen from '../../components/LoadingScreen';
import StatusBadge from '../../components/StatusBadge';

const WeeklyScheduleDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { weeklySchedule: scheduleData, loading, fetchWeeklySchedule } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchWeeklySchedule(currentDate.toISOString().split('T')[0]);
  }, [fetchWeeklySchedule, currentDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeeklySchedule(currentDate.toISOString().split('T')[0]);
    setRefreshing(false);
  };

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
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
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch Khám Tuần</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={() => changeWeek(-1)} style={styles.navIconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.weekDatesContainer}>
            <Text style={styles.weekDatesLabel}>Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}</Text>
            <View style={styles.dateRangeBadge}>
              <Text style={styles.headerSubtitle}>{scheduleData?.weekStart}  →  {scheduleData?.weekEnd}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => changeWeek(1)} style={styles.navIconButton}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
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
                    <View style={{ marginTop: 5 }}>
                      <StatusBadge status={appt.status} />
                    </View>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={styles.petName}>🐾 {appt.pet?.name} ({appt.pet?.species === 'dog' ? 'Chó' : appt.pet?.species === 'cat' ? 'Mèo' : appt.pet?.species})</Text>
                    <Text style={styles.customerName}>👤 {appt.customer?.name}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : day.dayName === 'Chủ Nhật' ? (
              <View style={styles.emptyDayBox}>
                <Text style={styles.emptyDayIcon}>☕</Text>
                <Text style={styles.emptyDayText}>Ngày nghỉ</Text>
              </View>
            ) : (
              <View style={styles.emptyDayBox}>
                <Text style={styles.emptyDayIcon}>🐾</Text>
                <Text style={styles.emptyDayText}>Không có lịch khám</Text>
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
    header: { padding: SIZES.spacing.lg, paddingTop: 60, backgroundColor: colors.surface, ...SHADOWS.light, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: SIZES.spacing.md },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, color: colors.textPrimary, ...FONTS.bold },
    weekNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, paddingBottom: 10 },
    navIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', ...SHADOWS.light },
    weekDatesContainer: { alignItems: 'center', flex: 1 },
    weekDatesLabel: { fontSize: 18, color: colors.textPrimary, ...FONTS.bold, marginBottom: 8 },
    dateRangeBadge: { backgroundColor: colors.primary + '10', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    headerSubtitle: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.bold },
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
    emptyDayBox: { padding: SIZES.spacing.xl, backgroundColor: colors.background, borderRadius: SIZES.radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
    emptyDayText: { color: colors.textLight, ...FONTS.medium, marginTop: 8 },
    emptyDayIcon: { fontSize: 24, opacity: 0.5 },
  });

export default WeeklyScheduleDoctorScreen;
