import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Vaccination } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import { removeAccents } from '../../../../shared/utils/stringUtils';

const SPECIES_ICONS: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', hamster: '🐹', fish: '🐟', reptile: '🦎', other: '🐾',
};

const VaccinationListCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Upcoming' | 'Overdue'>('All');

  const fetchVaccinations = async () => {
    try {
      const res = await api.get('/vaccinations');
      setVaccinations(res.data.data || []);
    } catch (error) {
      console.error('Failed to load vaccinations:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVaccinations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVaccinations();
  };

  const getFilteredData = () => {
    let filtered = vaccinations;

    // Apply status filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(v => v.status === activeFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = removeAccents(searchQuery.toLowerCase());
      filtered = filtered.filter(v => 
        removeAccents(v.pet?.name?.toLowerCase() || '').includes(query) ||
        removeAccents(v.vaccineName.toLowerCase()).includes(query)
      );
    }

    return filtered;
  };

  const filteredVaccinations = getFilteredData();
  const styles = getStyles(colors);

  const renderStatusBadge = (status: string) => {
    let bgColor = colors.primaryLight;
    let textColor = colors.primaryDark;

    if (status === 'Upcoming') {
      bgColor = 'rgba(255, 152, 0, 0.2)';
      textColor = colors.warning;
    } else if (status === 'Overdue') {
      bgColor = 'rgba(244, 67, 54, 0.2)';
      textColor = colors.error;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
      </View>
    );
  };

  if (isLoading) return <LoadingSpinner message="Loading vaccinations..." />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pet or vaccine name..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {['All', 'Active', 'Upcoming', 'Overdue'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredVaccinations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💉</Text>
            <Text style={styles.emptyText}>No vaccinations found.</Text>
            <Text style={styles.emptySubText}>Tap the + button to add a new record.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('VaccinationDetailCustomer', { vaccinationId: item._id })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.petInfo}>
                <View style={styles.petAvatar}>
                  <Text style={styles.petEmoji}>{SPECIES_ICONS[item.pet?.species || 'other']}</Text>
                </View>
                <Text style={styles.petName} numberOfLines={1}>{item.pet?.name || 'Unknown Pet'}</Text>
              </View>
              {renderStatusBadge(item.status)}
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vaccine:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{item.vaccineName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date:</Text>
                <Text style={[
                  styles.infoValue, 
                  item.status === 'Overdue' ? { color: colors.error, ...FONTS.semiBold } : null
                ]}>
                  {new Date(item.nextDueDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddVaccinationCustomer')}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.base, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, ...SHADOWS.light },
  searchIcon: { fontSize: 18, marginRight: SIZES.spacing.sm },
  searchInput: { flex: 1, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, gap: SIZES.spacing.sm },
  filterChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: SIZES.sm, color: colors.textSecondary, ...FONTS.medium },
  filterTextActive: { color: colors.textWhite, ...FONTS.semiBold },
  listContainer: { padding: SIZES.spacing.base, paddingBottom: 100 },
  card: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.md, ...SHADOWS.medium },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: SIZES.spacing.sm },
  petInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: SIZES.spacing.sm },
  petAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.sm },
  petEmoji: { fontSize: 20 },
  petName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold, flex: 1 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusText: { fontSize: SIZES.xs, ...FONTS.bold, textTransform: 'uppercase' },
  cardBody: { gap: SIZES.spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { width: 80, fontSize: SIZES.sm, color: colors.textSecondary },
  infoValue: { flex: 1, fontSize: SIZES.sm, color: colors.textPrimary, ...FONTS.medium },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: SIZES.spacing.xxl, marginTop: SIZES.spacing.xxl },
  emptyEmoji: { fontSize: 64, marginBottom: SIZES.spacing.md },
  emptyText: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.xs },
  emptySubText: { fontSize: SIZES.md, color: colors.textSecondary, textAlign: 'center' },
  fab: { position: 'absolute', bottom: SIZES.spacing.xxl, right: SIZES.spacing.xl, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
  fabIcon: { color: colors.textWhite, fontSize: 32, ...FONTS.regular, marginTop: -4 },
});

export default VaccinationListCustomerScreen;
