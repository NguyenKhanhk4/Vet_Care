/**
 * PetListCustomerScreen
 * Displays a grid of user's pets with FAB to add new pet
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Pet } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import EmptyState from '../../../../shared/components/EmptyState';

const SPECIES_ICONS: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', hamster: '🐹', fish: '🐟', reptile: '🦎', other: '🐾',
};

const PetListCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => { fetchPets(); }, [])
  );

  const fetchPets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/pets');
      setPets(res.data.data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (petId: string, petName: string) => {
    Alert.alert('Delete', `Are you sure you want to remove ${petName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/pets/${petId}`);
            setPets((prev) => prev.filter((p) => p._id !== petId));
          } catch (error) { Alert.alert('Error', 'Failed to delete pet'); }
        },
      },
    ]);
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {pets.length === 0 ? (
        <EmptyState icon="🐾" title="No Pets Yet" message="Add your first pet to get started!" actionLabel="Add Pet" onAction={() => navigation.navigate('AddPetCustomer')} />
      ) : (
        <FlatList
          data={pets}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => navigation.navigate('PetDetailCustomer', { petId: item._id })}
              onLongPress={() => handleDelete(item._id, item.name)}
              activeOpacity={0.8}
            >
              <View style={styles.petImageContainer}>
                <Text style={styles.petEmoji}>{SPECIES_ICONS[item.species] || '🐾'}</Text>
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.petBreed} numberOfLines={1}>{item.breed || item.species}</Text>
                <View style={styles.petMeta}>
                  <Text style={styles.petMetaText}>{item.gender === 'male' ? '♂️' : item.gender === 'female' ? '♀️' : '❓'}</Text>
                  <Text style={styles.petMetaText}>{item.age ? `${item.age}yr` : ''}</Text>
                </View>
              </View>
              <View style={[styles.vaccineBadge, { backgroundColor: item.vaccineStatus === 'up-to-date' ? '#E8F5E9' : item.vaccineStatus === 'overdue' ? '#FFEBEE' : '#FFF3E0' }]}>
                <Text style={[styles.vaccineText, { color: item.vaccineStatus === 'up-to-date' ? '#2E7D32' : item.vaccineStatus === 'overdue' ? '#C62828' : '#E65100' }]}>
                  {item.vaccineStatus === 'up-to-date' ? '✓ Vaccinated' : item.vaccineStatus === 'overdue' ? '⚠ Overdue' : 'Unknown'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddPetCustomer')} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: SIZES.spacing.base },
  columnWrapper: { justifyContent: 'space-between' },
  petCard: { width: '48%', backgroundColor: colors.surface, borderRadius: SIZES.radius.xl, marginBottom: SIZES.spacing.lg, alignItems: 'center', padding: SIZES.spacing.base, ...SHADOWS.medium },
  petImageContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  petEmoji: { fontSize: 40 },
  petInfo: { width: '100%', alignItems: 'center' },
  petName: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: 2 },
  petBreed: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4, textTransform: 'capitalize' },
  petMeta: { flexDirection: 'row', gap: 8 },
  petMetaText: { fontSize: SIZES.xs, color: colors.textLight, ...FONTS.medium },
  vaccineBadge: { paddingVertical: 4, paddingHorizontal: SIZES.spacing.sm, borderRadius: SIZES.radius.round, alignItems: 'center', marginTop: SIZES.spacing.sm },
  vaccineText: { fontSize: 10, ...FONTS.bold },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.dark },
  fabText: { color: colors.textWhite, fontSize: 32, lineHeight: 34 },
});

export default PetListCustomerScreen;
