import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, useTheme, Card, Avatar, IconButton, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { format } from 'date-fns';
import AdminBackButton from '../../components/AdminBackButton';

interface Appointment {
  _id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  time: string;
  customer: { _id: string; name: string };
  pet: { _id: string; name: string; species: string };
  doctor: { _id: string; user: { name: string } };
  clinic: { _id: string; name: string };
  services: { _id: string; name: string; price: number }[];
}

const AppointmentListAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(''); // empty means all

  const fetchAppointments = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const params: any = { page: pageNumber, limit: 10 };
      if (filterStatus) params.status = filterStatus;

      const response = await adminApi.get('/appointments', { params });
      const { appointments: fetchedAppointments, pagination } = response.data.data;

      if (isRefresh || pageNumber === 1) {
        setAppointments(fetchedAppointments);
      } else {
        setAppointments((prev) => [...prev, ...fetchedAppointments]);
      }

      setHasMore(pageNumber < pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAppointments(1, false);
  }, [filterStatus]);

  const onRefresh = useCallback(() => {
    fetchAppointments(1, true);
  }, [filterStatus]);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchAppointments(page + 1);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await adminApi.put(`/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: status as any } : a));
    } catch (error) {
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  const handleStatusChange = (appointment: Appointment) => {
    Alert.alert(
      'Update Status',
      'Choose new status for this appointment',
      [
        { text: 'Pending', onPress: () => updateStatus(appointment._id, 'pending') },
        { text: 'Confirmed', onPress: () => updateStatus(appointment._id, 'confirmed') },
        { text: 'Completed', onPress: () => updateStatus(appointment._id, 'completed') },
        { text: 'Cancelled', onPress: () => updateStatus(appointment._id, 'cancelled'), style: 'destructive' },
        { text: 'Back', style: 'cancel' }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#E8F5E9', text: '#4CAF50' };
      case 'confirmed': return { bg: '#E3F2FD', text: '#2196F3' };
      case 'cancelled': return { bg: '#FFEBEE', text: '#F44336' };
      default: return { bg: '#FFF3E0', text: '#FF9800' };
    }
  };

  const renderFilterChips = () => {
    const statuses = [
      { label: 'All', value: '' },
      { label: 'Pending', value: 'pending' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ];

    return (
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statuses}
          keyExtractor={item => item.label}
          renderItem={({ item }) => (
            <Chip
              selected={filterStatus === item.value}
              onPress={() => setFilterStatus(item.value)}
              style={[styles.chip, filterStatus === item.value && { backgroundColor: colors.primary }]}
              textStyle={filterStatus === item.value ? { color: '#fff' } : {}}
            >
              {item.label}
            </Chip>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    );
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const statusColor = getStatusColor(item.status);
    let dateStr = 'Unknown Date';
    try {
      dateStr = format(new Date(item.date), 'MMM dd, yyyy');
    } catch(e) {}

    return (
      <Card style={styles.card} onPress={() => handleStatusChange(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <Avatar.Icon size={40} icon="account" style={{ backgroundColor: colors.primary + '20' }} color={colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.customerName}>{item.customer?.name || 'Unknown'}</Text>
              <Text style={styles.petName}>Pet: {item.pet?.name || 'Unknown'} ({item.pet?.species || 'N/A'})</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>{dateStr} at {item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="doctor" size={16} color="#666" />
            <Text style={styles.detailText}>Dr. {item.doctor?.user?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="hospital-building" size={16} color="#666" />
            <Text style={styles.detailText}>{item.clinic?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="medical-bag" size={16} color="#666" />
            <Text style={styles.detailText}>{Array.isArray(item.services) ? item.services.map(s => s.name).join(', ') : 'Unknown Service'}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminBackButton navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <Text style={styles.subtitle}>Manage system bookings</Text>
      </View>

      {renderFilterChips()}

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-remove" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No appointments found</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && appointments.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingLeft: 68,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  title: {
    fontSize: SIZES.xxl,
    ...FONTS.bold,
    color: '#333',
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    ...SHADOWS.light,
  },
  chip: {
    marginRight: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerName: {
    fontSize: SIZES.md,
    ...FONTS.bold,
    color: '#333',
  },
  petName: {
    fontSize: SIZES.sm,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    ...FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: SIZES.sm,
    color: '#555',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: SIZES.md,
    color: '#999',
  },
});

export default AppointmentListAdminScreen;
