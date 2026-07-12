import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text, Searchbar, useTheme, Card, Avatar, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { Service } from '../../../../shared/types';
import { useFocusEffect } from '@react-navigation/native';
import AdminBackButton from '../../components/AdminBackButton';

const ServicePriceListAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchServices = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await adminApi.get('/services', {
        params: { page: pageNumber, limit: 10, search: searchQuery },
      });

      const { services: fetchedServices, pagination } = response.data.data;

      if (isRefresh || pageNumber === 1) {
        setServices(fetchedServices);
      } else {
        setServices((prev) => [...prev, ...fetchedServices]);
      }

      setHasMore(pageNumber < pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices(1, true);
    }, [searchQuery])
  );

  const onRefresh = useCallback(() => {
    fetchServices(1, true);
  }, [searchQuery]);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchServices(page + 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderItem = ({ item }: { item: Service }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}>
      <View style={styles.cardContent}>
        <Avatar.Icon
          size={50}
          icon="medical-bag"
          style={{ backgroundColor: '#4CAF5020' }}
          color="#4CAF50"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? '#4CAF50' : '#E0E0E0' }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                { color: item.isActive ? '#fff' : '#666' }
              ]}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.duration} mins</Text>
            <Icon name="hospital-building" size={14} color="#666" style={{ marginLeft: 12 }} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.clinic ? item.clinic.name : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Service Prices</Text>
        <Text style={styles.subtitle}>Manage veterinary services & prices</Text>
      </View>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search service name..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#4CAF50"
          inputStyle={styles.searchInput}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminBackButton navigation={navigation} />
      {loading && page === 1 ? (
        <View style={{ flex: 1 }}>
          <ListHeader />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ListHeader />}
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="medical-bag" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No services found</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && services.length > 0 ? (
              <ActivityIndicator size="small" color="#4CAF50" style={{ margin: 20 }} />
            ) : null
          }
        />
      )}

      <FAB
        style={[styles.fab, { backgroundColor: '#4CAF50' }]}
        icon="plus"
        color="#FFF"
        onPress={() => navigation.navigate('ServiceAdd')}
      />
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...SHADOWS.light,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: SIZES.md,
    ...FONTS.semiBold,
    color: '#333',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  price: {
    fontSize: SIZES.md,
    ...FONTS.bold,
    color: '#4CAF50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    ...FONTS.medium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: SIZES.xs,
    color: '#666',
    marginLeft: 4,
    flex: 1,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ServicePriceListAdminScreen;
