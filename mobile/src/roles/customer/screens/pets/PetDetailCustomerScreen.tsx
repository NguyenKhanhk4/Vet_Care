/**
 * PetDetailCustomerScreen
 * Displays detailed pet information
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Pet } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const SPECIES_ICONS: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', hamster: '🐹', fish: '🐟', reptile: '🦎', other: '🐾',
};

const PetDetailCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => { fetchPet(); }, [petId]);

  const fetchPet = async () => {
    try {
      const res = await api.get(`/pets/${petId}`);
      setPet(res.data.data);
    } catch (error) { Alert.alert('Error', 'Failed to load pet'); navigation.goBack(); }
    finally { setIsLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete', `Are you sure you want to remove ${pet?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/pets/${petId}`); navigation.goBack(); }
        catch { Alert.alert('Error', 'Failed to delete pet'); }
      }},
    ]);
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (!pet) return null;

  const infoItems = [
    { icon: '🏷️', label: 'Species', value: pet.species },
    { icon: '🐕', label: 'Breed', value: pet.breed || 'Unknown' },
    { icon: pet.gender === 'male' ? '♂️' : '♀️', label: 'Gender', value: pet.gender },
    { icon: '🎂', label: 'Age', value: `${pet.age || 0} years` },
    { icon: '⚖️', label: 'Weight', value: `${pet.weight || 0} kg` },
    { icon: '🎨', label: 'Color', value: pet.color || 'Unknown' },
    { icon: '💉', label: 'Vaccine', value: pet.vaccineStatus?.replace(/-/g, ' ') || 'Unknown' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{SPECIES_ICONS[pet.species] || '🐾'}</Text>
        </View>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>{pet.breed || pet.species}</Text>
      </View>

      <View style={styles.infoCard}>
        {infoItems.map((item, index) => (
          <View key={index} style={[styles.infoRow, index < infoItems.length - 1 && styles.infoRowBorder]}>
            <Text style={styles.infoIcon}>{item.icon}</Text>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.vaccinationButton} 
        onPress={() => navigation.navigate('VaccinationListCustomer')}
        activeOpacity={0.8}
      >
        <Text style={styles.vaccinationButtonIcon}>💉</Text>
        <View style={styles.vaccinationButtonTextContainer}>
          <Text style={styles.vaccinationButtonTitle}>Vaccinations</Text>
          <Text style={styles.vaccinationButtonSub}>Manage vaccination records</Text>
        </View>
        <Text style={styles.vaccinationButtonArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditPetCustomer', { petId })} activeOpacity={0.8}>
          <Text style={styles.editButtonText}>✏️ Edit Pet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: SIZES.spacing.xxl, backgroundColor: colors.primaryLight, borderBottomLeftRadius: SIZES.radius.xl, borderBottomRightRadius: SIZES.radius.xl, ...SHADOWS.light },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.md, ...SHADOWS.medium },
  avatarEmoji: { fontSize: 60 },
  petName: { fontSize: SIZES.xxxl, color: colors.textPrimary, ...FONTS.bold },
  petBreed: { fontSize: SIZES.lg, color: colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  infoCard: { backgroundColor: colors.surface, margin: SIZES.spacing.xl, borderRadius: SIZES.radius.xl, padding: SIZES.spacing.lg, ...SHADOWS.medium },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.spacing.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  infoIcon: { fontSize: 24, width: 40 },
  infoLabel: { flex: 1, fontSize: SIZES.base, color: colors.textSecondary },
  infoValue: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.bold, textTransform: 'capitalize' },
  vaccinationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.xl, marginBottom: SIZES.spacing.xl, padding: SIZES.spacing.lg, borderRadius: SIZES.radius.xl, ...SHADOWS.medium },
  vaccinationButtonIcon: { fontSize: 32, marginRight: SIZES.spacing.md },
  vaccinationButtonTextContainer: { flex: 1 },
  vaccinationButtonTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold },
  vaccinationButtonSub: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 4 },
  vaccinationButtonArrow: { fontSize: 32, color: colors.textLight },
  actions: { flexDirection: 'row', marginHorizontal: SIZES.spacing.xl, marginBottom: SIZES.spacing.xxl, gap: SIZES.spacing.md },
  editButton: { flex: 1, backgroundColor: colors.primary, borderRadius: SIZES.radius.round, paddingVertical: 14, alignItems: 'center', ...SHADOWS.medium },
  editButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
  deleteButton: { backgroundColor: '#FFEBEE', borderRadius: SIZES.radius.round, paddingVertical: 14, paddingHorizontal: SIZES.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  deleteButtonText: { color: colors.error, fontSize: SIZES.lg, ...FONTS.bold },
});

export default PetDetailCustomerScreen;
