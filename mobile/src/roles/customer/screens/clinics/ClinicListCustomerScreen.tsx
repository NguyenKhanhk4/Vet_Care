import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, RefreshControl, Platform 
} from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Clinic } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import RatingStars from '../../../../shared/components/RatingStars';
import { removeAccents } from '../../../../shared/utils/stringUtils';

const ClinicListCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClinics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/clinics');
      setClinics(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClinics();
  };

  const getFilteredData = () => {
    let filtered = clinics;
    if (searchQuery) {
      const query = removeAccents(searchQuery.toLowerCase());
      filtered = filtered.filter(c => 
        removeAccents(c.name.toLowerCase()).includes(query) ||
        removeAccents(c.address.toLowerCase()).includes(query)
      );
    }
    return filtered;
  };

  const filteredClinics = getFilteredData();
  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading clinics..." />;

  return (
    <View style={styles.container}>
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
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ClinicDetailCustomer', { clinicId: item._id })}
            activeOpacity={0.8}
          >
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
              </View>
              <Text style={styles.hoursText}>🕒 {item.openingHours}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.base, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, ...SHADOWS.light },
  searchIcon: { fontSize: 18, marginRight: SIZES.spacing.sm },
  searchInput: { flex: 1, paddingVertical: Platform.OS === 'ios' ? SIZES.spacing.md : SIZES.spacing.sm, fontSize: SIZES.base, color: colors.textPrimary },
  
  listContainer: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: SIZES.spacing.xxl, marginTop: SIZES.spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: SIZES.spacing.md },
  emptyText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.semiBold, textAlign: 'center' },
  
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.lg, ...SHADOWS.medium },
  imagePlaceholder: { width: 80, height: 80, borderRadius: SIZES.radius.md, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  imageEmoji: { fontSize: 32 },
  clinicInfo: { flex: 1, justifyContent: 'center' },
  clinicName: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: 2 },
  clinicAddress: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: SIZES.xs, color: colors.textLight, marginLeft: 4 },
  hoursText: { fontSize: SIZES.xs, color: colors.textSecondary },
});

export default ClinicListCustomerScreen;
