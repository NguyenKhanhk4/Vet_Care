import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const AppointmentListDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  const fetchAppointments = async () => {
    try {
      const url = filter === 'all' ? '/appointments' : `/appointments?status=${filter}`;
      const response = await doctorApi.get(url);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
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

  const FilterTab = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity
      style={[styles.filterTab, filter === value && { backgroundColor: colors.primary }]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && { color: colors.textWhite }]}>{label}</Text>
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Lịch Hẹn</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <FilterTab label="Tất cả" value="all" />
          <FilterTab label="Chờ xác nhận" value="pending" />
          <FilterTab label="Đã xác nhận" value="confirmed" />
          <FilterTab label="Hoàn thành" value="completed" />
          <FilterTab label="Đã hủy" value="cancelled" />
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>📅 {new Date(item.date).toLocaleDateString('vi-VN')} lúc {item.time}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Khách hàng:</Text>
                  <Text style={styles.infoValue}>{item.customer?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thú cưng:</Text>
                  <Text style={styles.infoValue}>{item.pet?.name} ({item.pet?.species})</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dịch vụ:</Text>
                  <Text style={styles.infoValue}>{item.service?.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Không tìm thấy lịch hẹn nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: SIZES.spacing.lg, backgroundColor: colors.surface, ...SHADOWS.light },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    filterContainer: { paddingVertical: SIZES.spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, marginRight: 10, borderWidth: 1, borderColor: colors.border },
    filterText: { fontSize: SIZES.sm, color: colors.textSecondary, ...FONTS.medium },
    listContainer: { padding: SIZES.spacing.lg },
    card: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.md, ...SHADOWS.light },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 10 },
    dateText: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: 10, ...FONTS.bold },
    cardBody: { paddingTop: 5 },
    infoRow: { flexDirection: 'row', marginBottom: 6 },
    infoLabel: { width: 90, fontSize: SIZES.sm, color: colors.textSecondary },
    infoValue: { flex: 1, fontSize: SIZES.sm, color: colors.textPrimary, ...FONTS.medium },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default AppointmentListDoctorScreen;
