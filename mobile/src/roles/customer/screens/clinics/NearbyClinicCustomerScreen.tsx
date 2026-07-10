import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, RefreshControl, Linking, Alert, Platform 
} from 'react-native';
import * as Location from 'expo-location';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Clinic } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import RatingStars from '../../../../shared/components/RatingStars';
import { calculateDistance, formatDistance } from '../../../../shared/utils/locationUtils';
import { removeAccents } from '../../../../shared/utils/stringUtils';

// Extended Clinic type to hold calculated distance
export interface ClinicWithDistance extends Clinic {
  distance?: number;
}

const NearbyClinicCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  
  const [clinics, setClinics] = useState<ClinicWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Nearest' | 'Rating' | 'Open'>('Nearest');

  const requestLocationAndFetchData = useCallback(async () => {
    setLocationError(null);
    setIsLoading(true);
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Không thể xác định vị trí hiện tại. Vui lòng bật GPS và thử lại.');
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(async (e) => {
        console.warn('getCurrentPositionAsync failed, trying getLastKnownPositionAsync...', e);
        return await Location.getLastKnownPositionAsync({});
      });

      if (!location) {
        console.warn('Cannot get real location. Using fallback mock location (Ho Chi Minh City) for testing.');
        location = {
          coords: {
            latitude: 10.7769,
            longitude: 106.7009,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };
      }
      setUserLocation(location);
      
      // Fetch clinics
      const res = await api.get('/clinics');
      let rawClinics: Clinic[] = res.data.data || [];
      
      // Calculate distances
      const processedClinics = rawClinics
        .filter(c => c.latitude != null && c.longitude != null)
        .map(c => {
          const dist = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            c.latitude!,
            c.longitude!
          );
          return { ...c, distance: dist };
        });
        
      setClinics(processedClinics);
    } catch (error) {
      console.error('Failed to get location or fetch clinics:', error);
      Alert.alert('Error', 'Failed to load nearby clinics');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    requestLocationAndFetchData();
  }, [requestLocationAndFetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    requestLocationAndFetchData();
  };

  const getFilteredData = () => {
    let filtered = clinics;

    // Apply search query (Name or Address)
    if (searchQuery) {
      const query = removeAccents(searchQuery.toLowerCase());
      filtered = filtered.filter(c => 
        removeAccents(c.name.toLowerCase()).includes(query) ||
        removeAccents(c.address.toLowerCase()).includes(query)
      );
    }

    // Apply filters and sort
    switch (activeFilter) {
      case 'Nearest':
        filtered = [...filtered].sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'Rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'Open':
        // Extremely simple check: isActive && we can assume they are open. 
        // Real logic would parse openingHours. For now, we filter by isActive.
        filtered = filtered.filter(c => c.isActive);
        filtered = [...filtered].sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
    }

    return filtered;
  };

  const openDirections = (clinic: ClinicWithDistance) => {
    if (!clinic.latitude || !clinic.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps', err);
      Alert.alert('Error', 'Cannot open Google Maps');
    });
  };

  const filteredClinics = getFilteredData();
  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Finding nearby clinics..." />;

  // Permission Denied View
  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestLocationAndFetchData} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc địa chỉ..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {['Nearest', 'Rating', 'Open'].map((filter) => {
          const labels: Record<string, string> = { Nearest: 'Gần nhất', Rating: 'Đánh giá cao', Open: 'Đang mở cửa' };
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {labels[filter]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredClinics}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏥</Text>
            <Text style={styles.emptyText}>Không tìm thấy phòng khám phù hợp.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageEmoji}>🏥</Text>
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.clinicAddress} numberOfLines={2}>📍 {item.address}</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.ratingContainer}>
                    <RatingStars rating={item.rating} size={14} />
                    <Text style={styles.ratingText}>({item.totalReviews})</Text>
                  </View>
                  {item.distance !== undefined && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceIcon}>🚗</Text>
                      <Text style={styles.distanceText}>Cách bạn {formatDistance(item.distance)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.hoursText}>🕒 {item.openingHours}</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.detailButton} 
                onPress={() => navigation.navigate('ClinicDetailCustomer', { clinicId: item._id, distance: item.distance })}
                activeOpacity={0.8}
              >
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.directionButton} 
                onPress={() => openDirections(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.directionButtonText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.spacing.xxl, backgroundColor: colors.background },
  errorEmoji: { fontSize: 64, marginBottom: SIZES.spacing.md },
  errorText: { fontSize: SIZES.md, color: colors.textSecondary, textAlign: 'center', marginBottom: SIZES.spacing.xl, lineHeight: 22 },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: SIZES.spacing.xxl, paddingVertical: SIZES.spacing.md, borderRadius: SIZES.radius.base, ...SHADOWS.light },
  retryButtonText: { color: colors.textWhite, fontSize: SIZES.base, ...FONTS.semiBold },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.base, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, ...SHADOWS.light },
  searchIcon: { fontSize: 18, marginRight: SIZES.spacing.sm },
  searchInput: { flex: 1, paddingVertical: Platform.OS === 'ios' ? SIZES.spacing.md : SIZES.spacing.sm, fontSize: SIZES.base, color: colors.textPrimary },
  
  filtersContainer: { flexDirection: 'row', paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, gap: SIZES.spacing.sm },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: SIZES.sm, color: colors.textSecondary, ...FONTS.medium },
  filterTextActive: { color: colors.textWhite, ...FONTS.semiBold },
  
  listContainer: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: SIZES.spacing.xxl, marginTop: SIZES.spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: SIZES.spacing.md },
  emptyText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.semiBold, textAlign: 'center' },
  
  card: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.lg, ...SHADOWS.medium },
  cardHeader: { flexDirection: 'row', marginBottom: SIZES.spacing.md },
  imagePlaceholder: { width: 80, height: 80, borderRadius: SIZES.radius.md, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  imageEmoji: { fontSize: 32 },
  clinicInfo: { flex: 1, justifyContent: 'space-between' },
  clinicName: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: 2 },
  clinicAddress: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SIZES.spacing.sm, marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: SIZES.xs, color: colors.textLight, marginLeft: 4 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  distanceIcon: { fontSize: 10, marginRight: 2 },
  distanceText: { fontSize: SIZES.xs, color: colors.primaryDark, ...FONTS.semiBold },
  hoursText: { fontSize: SIZES.xs, color: colors.textSecondary },
  
  cardActions: { flexDirection: 'row', gap: SIZES.spacing.md, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: SIZES.spacing.md },
  detailButton: { flex: 1, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  detailButtonText: { color: colors.primary, fontSize: SIZES.sm, ...FONTS.semiBold },
  directionButton: { flex: 1, backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.sm, alignItems: 'center', ...SHADOWS.light },
  directionButtonText: { color: colors.textWhite, fontSize: SIZES.sm, ...FONTS.semiBold },
});

export default NearbyClinicCustomerScreen;
