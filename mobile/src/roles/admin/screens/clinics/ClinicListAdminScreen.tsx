import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text, Searchbar, useTheme, Card, Avatar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  operatingHours: string;
}

const ClinicListAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchClinics = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await adminApi.get('/clinics', {
        params: { page: pageNumber, limit: 10, search: searchQuery },
      });
      
      const { clinics: fetchedClinics, pagination } = response.data.data;

      if (isRefresh || pageNumber === 1) {
        setClinics(fetchedClinics);
      } else {
        setClinics((prev) => [...prev, ...fetchedClinics]);
      }

      setHasMore(pageNumber < pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      Alert.alert('Error', 'Failed to load clinics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchClinics(1, false);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    fetchClinics(1, true);
  }, [searchQuery]);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchClinics(page + 1);
    }
  };

  const renderItem = ({ item }: { item: Clinic }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ClinicDoctorList', { clinicId: item._id, clinicName: item.name })}>
      <View style={styles.cardContent}>
        <Avatar.Icon 
          size={50} 
          icon="hospital-building" 
          style={{ backgroundColor: colors.primary + '20' }}
          color={colors.primary} 
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={2}>{item.address || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.phone || 'N/A'}</Text>
          </View>
          {item.operatingHours && (
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{item.operatingHours}</Text>
            </View>
          )}
        </View>
        <IconButton
          icon="chevron-right"
          iconColor="#CCC"
          size={24}
          onPress={() => navigation.navigate('ClinicDoctorList', { clinicId: item._id, clinicName: item.name })}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Clinics</Text>
        <Text style={styles.subtitle}>Manage VetCare branches</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search name, address..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={colors.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={clinics}
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
              <Icon name="hospital-marker" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No clinics found</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && clinics.length > 0 ? (
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
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    ...SHADOWS.small,
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
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...SHADOWS.small,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: SIZES.xs,
    color: '#666',
    marginLeft: 6,
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
});

export default ClinicListAdminScreen;
