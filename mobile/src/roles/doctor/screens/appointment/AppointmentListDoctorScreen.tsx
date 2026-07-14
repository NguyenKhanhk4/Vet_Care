import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useAppointments } from '../../hooks/useAppointments';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';

const AppointmentListDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const { appointments, loading, fetchAppointments } = useAppointments();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments(filter === 'all' ? undefined : filter);
    }, [filter, fetchAppointments])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments(filter === 'all' ? undefined : filter);
    setRefreshing(false);
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
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Quản Lý Lịch Hẹn</Text>
          <Ionicons name="calendar" size={28} color={colors.primary} />
        </View>
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
        <LoadingScreen />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onPress={() => navigation.navigate('AppointmentDetail', { id: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="📋" text="Không tìm thấy lịch hẹn nào." />
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
    header: { padding: SIZES.spacing.lg, paddingTop: 60, backgroundColor: colors.surface, ...SHADOWS.light, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 1 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 24, color: colors.textPrimary, ...FONTS.bold },
    filterContainer: { paddingVertical: SIZES.spacing.md, backgroundColor: colors.background },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 10, ...SHADOWS.light },
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
