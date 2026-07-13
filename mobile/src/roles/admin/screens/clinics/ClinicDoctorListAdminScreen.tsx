import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text, Searchbar, useTheme, Card, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';

interface Doctor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  specialization: string;
  experience: number;
  isActive: boolean;
}

const ClinicDoctorListAdminScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { clinicId, clinicName } = route.params;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchDoctors = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await adminApi.get('/doctors', {
        params: { page: pageNumber, limit: 10, search: searchQuery, clinicId },
      });
      
      const { doctors: fetchedDoctors, pagination } = response.data.data;

      if (isRefresh || pageNumber === 1) {
        setDoctors(fetchedDoctors);
      } else {
        setDoctors((prev) => [...prev, ...fetchedDoctors]);
      }

      setHasMore(pageNumber < pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDoctors(1, false);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    fetchDoctors(1, true);
  }, [searchQuery]);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchDoctors(page + 1);
    }
  };

  const renderItem = ({ item }: { item: Doctor }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('UserDetail', { userId: item.user._id })}>
      <View style={styles.cardContent}>
        <Avatar.Icon 
          size={50} 
          icon="doctor" 
          style={{ backgroundColor: colors.primary + '20' }}
          color={colors.primary} 
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{item.user?.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="stethoscope" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>{item.specialization}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.user?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="briefcase-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.experience} years exp</Text>
          </View>
        </View>
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
    </Card>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.onSurface} style={{ alignSelf: 'flex-start', marginLeft: -8 }}>
          Quay lại
        </Button>
        <Text style={styles.title}>Doctors</Text>
        <Text style={styles.subtitle}>{clinicName}</Text>
      </View>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search name, specialization..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={colors.primary}
          inputStyle={styles.searchInput}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && page === 1 ? (
        <View style={{ flex: 1 }}>
          <ListHeader />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ListHeader />}
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="doctor" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No doctors found in this clinic</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && doctors.length > 0 ? (
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
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: SIZES.xxl,
    ...FONTS.bold,
    color: '#333',
    marginTop: 4,
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
    marginRight: 8,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    ...FONTS.medium,
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

export default ClinicDoctorListAdminScreen;
