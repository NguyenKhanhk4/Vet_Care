import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Text, useTheme, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { doctorApi } from '../../services/doctorApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { format } from 'date-fns';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  totalVisits: number;
  lastVisit: string;
}

const CustomerListDoctorScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async (pageNumber = 1, isRefresh = false, searchQuery = search) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await doctorApi.get('/profile/customers', { 
        params: { page: pageNumber, limit: 15, search: searchQuery } 
      });
      const { customers: fetchedCustomers, pagination } = response.data.data;
      if (isRefresh || pageNumber === 1) {
        setCustomers(fetchedCustomers);
      } else {
        setCustomers(prev => [...prev, ...fetchedCustomers]);
      }
      setHasMore(pageNumber < pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(1, false, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const onRefresh = useCallback(() => {
    fetchCustomers(1, true);
  }, [search]);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchCustomers(page + 1, false, search);
    }
  };

  const renderItem = ({ item }: { item: Customer }) => {
    let lastVisitDate = 'N/A';
    try {
      if (item.lastVisit) lastVisitDate = format(new Date(item.lastVisit), 'MMM dd, yyyy');
    } catch (e) {}

    return (
      <Card style={styles.card} onPress={() => {}}>
        <Card.Content style={styles.cardContent}>
          {item.avatar ? (
            <Avatar.Image size={50} source={{ uri: item.avatar }} />
          ) : (
            <Avatar.Icon size={50} icon="account" style={{ backgroundColor: colors.primary + '20' }} color={colors.primary} />
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.detailRow}>
              <Icon name="phone" size={14} color="#666" />
              <Text style={styles.detailText}>{item.phone || 'Not updated'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="history" size={14} color="#666" />
              <Text style={styles.detailText}>Visits: {item.totalVisits} • Last: {lastVisitDate}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>List of examined customers</Text>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by name or phone..." 
          value={search} 
          onChangeText={setSearch} 
          placeholderTextColor="#999" 
        />
        {search ? (
          <Icon name="close-circle" size={20} color="#999" onPress={() => setSearch('')} style={styles.clearIcon} />
        ) : null}
      </View>
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList 
          data={customers} 
          keyExtractor={(item) => item._id} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContent} 
          showsVerticalScrollIndicator={false} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />} 
          onEndReached={loadMore} 
          onEndReachedThreshold={0.5} 
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No customers found</Text>
            </View>
          } 
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#fff' },
  title: { fontSize: SIZES.xxl, ...FONTS.bold, color: '#333' },
  subtitle: { fontSize: SIZES.sm, color: '#666', marginTop: 4 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    marginHorizontal: 16, marginVertical: 12, borderRadius: 8, 
    paddingHorizontal: 12, ...SHADOWS.light, height: 44 
  },
  searchIcon: { marginRight: 8 },
  clearIcon: { padding: 4 },
  searchInput: { flex: 1, height: '100%', fontSize: SIZES.md, color: '#333' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, ...SHADOWS.light },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  infoContainer: { marginLeft: 12, flex: 1 },
  name: { fontSize: SIZES.md, ...FONTS.bold, color: '#333', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  detailText: { fontSize: SIZES.sm, color: '#666', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 16, fontSize: SIZES.md, color: '#999' },
});

export default CustomerListDoctorScreen;