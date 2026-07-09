/**
 * AppointmentListCustomerScreen
 * Lists all customer appointments with status tab filters
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Appointment } from '../../../../shared/types';
import StatusBadge from '../../../../shared/components/StatusBadge';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import EmptyState from '../../../../shared/components/EmptyState';

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'paid'];

const AppointmentListCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  useFocusEffect(useCallback(() => { fetchAppointments(); }, []));

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/appointments?limit=50');
      setAppointments(res.data.data || []);
    } catch (error) { console.error('Error fetching appointments:', error); }
    finally { setIsLoading(false); }
  };

  const filtered = activeTab === 'all' ? appointments : appointments.filter((a) => a.status === activeTab);

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <View style={styles.container}>
      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointment List */}
      {filtered.length === 0 ? (
        <EmptyState icon="📅" title="No Appointments" message={`No ${activeTab !== 'all' ? activeTab : ''} appointments found`} actionLabel="Book Now" onAction={() => navigation.navigate('BookingCustomer')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.appointmentCard} onPress={() => navigation.navigate('AppointmentDetailCustomer', { appointmentId: item._id })} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  <Text style={styles.timeText}>⏰ {item.time}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardIcon}>🐾</Text>
                  <Text style={styles.cardLabel}>Pet:</Text>
                  <Text style={styles.cardValue}>{typeof item.pet === 'object' ? item.pet.name : 'Pet'}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardIcon}>🏥</Text>
                  <Text style={styles.cardLabel}>Clinic:</Text>
                  <Text style={styles.cardValue} numberOfLines={1}>{typeof item.clinic === 'object' ? item.clinic.name : 'Clinic'}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardIcon}>👨‍⚕️</Text>
                  <Text style={styles.cardLabel}>Doctor:</Text>
                  <Text style={styles.cardValue}>{typeof item.doctor === 'object' ? item.doctor.user?.name : 'Doctor'}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardIcon}>💰</Text>
                  <Text style={styles.cardLabel}>Amount:</Text>
                  <Text style={styles.priceText}>{(item.totalAmount || 0).toLocaleString('vi-VN')}đ</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('BookingCustomer')} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsContainer: { maxHeight: 50, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider },
  tabsContent: { paddingHorizontal: SIZES.spacing.sm, alignItems: 'center' },
  tab: { paddingVertical: SIZES.spacing.md, paddingHorizontal: SIZES.spacing.base, marginHorizontal: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: SIZES.md, color: colors.textLight, ...FONTS.medium },
  tabTextActive: { color: colors.primary },
  listContent: { padding: SIZES.spacing.base },
  appointmentCard: { backgroundColor: colors.surface, borderRadius: SIZES.radius.base, marginBottom: SIZES.spacing.md, padding: SIZES.spacing.base, ...SHADOWS.light },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.md, paddingBottom: SIZES.spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dateContainer: {},
  dateText: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold },
  timeText: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 2 },
  cardBody: {},
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacing.xs },
  cardIcon: { fontSize: 14, width: 24 },
  cardLabel: { fontSize: SIZES.md, color: colors.textSecondary, width: 60 },
  cardValue: { flex: 1, fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium },
  priceText: { flex: 1, fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.dark },
  fabText: { color: colors.textWhite, fontSize: 28, lineHeight: 30 },
});

export default AppointmentListCustomerScreen;
