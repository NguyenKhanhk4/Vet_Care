import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';
import { useSchedule } from '../../hooks/useSchedule';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';

const TodayScheduleDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { todaySchedule: schedule, loading, fetchTodaySchedule } = useSchedule();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTodaySchedule();
    }, [fetchTodaySchedule])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodaySchedule();
    setRefreshing(false);
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

  const styles = getStyles(colors);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Khám Hôm Nay</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      <TouchableOpacity 
        style={styles.weeklyBanner}
        onPress={() => navigation.navigate('WeeklySchedule')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>📅</Text>
          <Text style={styles.weeklyBannerText}>Xem lịch trình cả tuần</Text>
        </View>
        <Text style={styles.weeklyBannerArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{schedule?.stats?.total || 0}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{schedule?.stats?.pending || 0}</Text>
          <Text style={styles.statLabel}>Đang chờ</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{schedule?.stats?.completed || 0}</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
      </View>

      <FlatList
        data={schedule?.appointments || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
            showTimeOnly
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="🏖️" text="Hôm nay bạn không có lịch khám nào." />
        }
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: SIZES.spacing.lg, paddingTop: 60, backgroundColor: colors.surface, ...SHADOWS.light },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    headerDate: { fontSize: SIZES.md, color: colors.primary, ...FONTS.medium, marginTop: 4 },
    weeklyBanner: { 
      marginHorizontal: SIZES.spacing.lg, 
      marginTop: SIZES.spacing.lg, 
      backgroundColor: colors.primary + '15', 
      padding: SIZES.spacing.md, 
      borderRadius: SIZES.radius.lg, 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary + '30'
    },
    weeklyBannerText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
    weeklyBannerArrow: { fontSize: 20, color: colors.primary, ...FONTS.bold },
    statsContainer: { flexDirection: 'row', backgroundColor: colors.surface, marginTop: SIZES.spacing.lg, paddingVertical: SIZES.spacing.md, ...SHADOWS.light },
    statBox: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderColor: colors.border },
    statNumber: { fontSize: SIZES.xl, color: colors.primary, ...FONTS.bold },
    statLabel: { fontSize: SIZES.sm, color: colors.textSecondary },
    listContainer: { padding: SIZES.spacing.lg },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.md, ...SHADOWS.light },
    timeSection: { width: 80, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: colors.border, paddingRight: SIZES.spacing.md },
    timeText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: 8 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, alignItems: 'center' },
    statusText: { fontSize: 10, ...FONTS.bold, textAlign: 'center' },
    infoSection: { flex: 1, paddingLeft: SIZES.spacing.md, justifyContent: 'center' },
    petName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold, marginBottom: 4 },
    customerName: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
    serviceName: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.medium },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default TodayScheduleDoctorScreen;
