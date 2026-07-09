import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const TodayScheduleDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = async () => {
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
        <Text style={styles.headerTitle}>Lịch Khám Hôm Nay</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

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
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
          >
            <View style={styles.timeSection}>
              <Text style={styles.timeText}>{item.time}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
              </View>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.petName}>🐾 {item.pet.name} ({item.pet.species})</Text>
              <Text style={styles.customerName}>👤 {item.customer.name}</Text>
              <Text style={styles.serviceName}>🩺 {item.service.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏖️</Text>
            <Text style={styles.emptyText}>Hôm nay bạn không có lịch khám nào.</Text>
          </View>
        }
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { padding: SIZES.spacing.lg, backgroundColor: colors.surface, ...SHADOWS.light },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    headerDate: { fontSize: SIZES.md, color: colors.primary, ...FONTS.medium, marginTop: 4 },
    statsContainer: { flexDirection: 'row', backgroundColor: colors.surface, marginTop: SIZES.spacing.sm, paddingVertical: SIZES.spacing.md, ...SHADOWS.light },
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
