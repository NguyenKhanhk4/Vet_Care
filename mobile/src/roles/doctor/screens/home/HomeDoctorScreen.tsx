import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDoctor } from '../../context/DoctorContext';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const HomeDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { doctor } = useDoctor();
  const { colors } = useTheme();
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodaySchedule = async () => {
    try {
      const response = await doctorApi.get('/schedules/today');
      setSchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching today schedule:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodaySchedule();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>Bs. {doctor?.user?.name}</Text>
          <Text style={styles.specialization}>{doctor?.specialization}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng quan hôm nay</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{schedule?.stats?.total || 0}</Text>
            <Text style={styles.statLabel}>Tổng số ca</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{schedule?.stats?.pending || 0}</Text>
            <Text style={styles.statLabel}>Đang chờ</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{schedule?.stats?.completed || 0}</Text>
            <Text style={styles.statLabel}>Đã khám</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Lịch hẹn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Schedule')}
          >
            <Text style={styles.actionIcon}>⏰</Text>
            <Text style={styles.actionText}>Lịch trình</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ca khám tiếp theo</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {schedule?.appointments?.slice(0, 3).map((appt: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.appointmentCard}
            onPress={() => navigation.navigate('AppointmentDetail', { id: appt._id })}
          >
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>{appt.time}</Text>
              <Text style={[styles.statusBadge, {
                backgroundColor: appt.status === 'pending' ? colors.warning + '20' : appt.status === 'confirmed' ? colors.primary + '20' : colors.success + '20',
                color: appt.status === 'pending' ? colors.warning : appt.status === 'confirmed' ? colors.primary : colors.success
              }]}>{appt.status === 'pending' ? 'Chờ xác nhận' : appt.status === 'confirmed' ? 'Đã xác nhận' : appt.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}</Text>
            </View>
            <View style={styles.apptInfo}>
              <Text style={styles.petName}>🐾 {appt.pet.name}</Text>
              <Text style={styles.customerName}>👤 {appt.customer.name}</Text>
              <Text style={styles.serviceName}>🩺 {appt.service.name}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {(!schedule?.appointments || schedule.appointments.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>☕</Text>
            <Text style={styles.emptyText}>Hôm nay bạn không có lịch hẹn nào.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: SIZES.spacing.lg },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SIZES.spacing.xl,
      marginTop: 20,
    },
    greeting: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
    name: { fontSize: SIZES.xxl, color: colors.textPrimary, ...FONTS.bold, marginTop: 4 },
    specialization: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.semiBold, marginTop: 4 },
    notificationBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.light,
    },
    notificationIcon: { fontSize: 20 },
    section: { marginBottom: SIZES.spacing.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.base },
    sectionTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.base },
    seeAllText: { color: colors.primary, fontSize: SIZES.sm, ...FONTS.medium },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: SIZES.radius.lg,
      paddingVertical: SIZES.spacing.lg,
      ...SHADOWS.medium,
    },
    statBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    statNumber: { fontSize: SIZES.xxl, color: colors.primary, ...FONTS.bold },
    statLabel: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 4 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    actionCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: SIZES.spacing.lg,
      borderRadius: SIZES.radius.lg,
      alignItems: 'center',
      marginHorizontal: 5,
      ...SHADOWS.light,
    },
    actionIcon: { fontSize: 32, marginBottom: 8 },
    actionText: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium },
    appointmentCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      padding: SIZES.spacing.lg,
      borderRadius: SIZES.radius.lg,
      marginBottom: SIZES.spacing.md,
      ...SHADOWS.light,
    },
    timeBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: colors.border, paddingRight: 10 },
    timeText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold },
    statusBadge: {
      paddingHorizontal: SIZES.spacing.sm,
      paddingVertical: 4,
      borderRadius: SIZES.radius.sm,
      marginTop: SIZES.spacing.xs,
    },
    apptInfo: { flex: 2, paddingLeft: 15, justifyContent: 'center' },
    petName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold, marginBottom: 4 },
    customerName: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
    serviceName: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.medium },
    emptyState: { alignItems: 'center', padding: 30, backgroundColor: colors.surface, borderRadius: SIZES.radius.lg },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { color: colors.textSecondary, ...FONTS.medium },
  });

export default HomeDoctorScreen;
