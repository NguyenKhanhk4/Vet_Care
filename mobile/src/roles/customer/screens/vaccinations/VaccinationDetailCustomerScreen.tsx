import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Vaccination } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const SPECIES_ICONS: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🐦', rabbit: '🐰', hamster: '🐹', fish: '🐟', reptile: '🦎', other: '🐾',
};

const VaccinationDetailCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { vaccinationId } = route.params;
  const { colors } = useTheme();
  const [vaccination, setVaccination] = useState<Vaccination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVaccination();
  }, [vaccinationId]);

  const fetchVaccination = async () => {
    try {
      const res = await api.get(`/vaccinations/${vaccinationId}`);
      setVaccination(res.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vaccination details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this vaccination record?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await api.delete(`/vaccinations/${vaccinationId}`);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete record');
          }
        }
      },
    ]);
  };

  const handleBookAppointment = () => {
    navigation.navigate('BookingCustomer', { 
      petId: vaccination?.pet?._id,
      notes: `Vaccination follow-up for ${vaccination?.vaccineName}`
    });
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading details..." />;
  if (!vaccination) return null;

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

  const infoItems = [
    { icon: '💉', label: 'Vaccine', value: vaccination.vaccineName },
    { icon: '🏷️', label: 'Type', value: vaccination.vaccineType || 'N/A' },
    { icon: '📅', label: 'Date Given', value: new Date(vaccination.vaccinationDate).toLocaleDateString('vi-VN') },
    { icon: '⏱️', label: 'Next Due', value: new Date(vaccination.nextDueDate).toLocaleDateString('vi-VN') },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{SPECIES_ICONS[vaccination.pet?.species || 'other']}</Text>
        </View>
        <Text style={styles.petName}>{vaccination.pet?.name || 'Unknown Pet'}</Text>
        {renderStatusBadge(vaccination.status)}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Vaccination Details</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={[styles.infoRow, index < infoItems.length - 1 && styles.infoRowBorder]}>
            <Text style={styles.infoIcon}>{item.icon}</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Notes */}
      {!!vaccination.notes && (
        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{vaccination.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {vaccination.status !== 'Active' && (
          <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment} activeOpacity={0.8}>
            <Text style={styles.bookButtonText}>📅 Book Appointment</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.rowActions}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => navigation.navigate('EditVaccinationCustomer', { vaccinationId })} 
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete} 
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: SIZES.spacing.xxl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.divider, ...SHADOWS.light },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.md },
  avatarEmoji: { fontSize: 40 },
  petName: { fontSize: SIZES.xl, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.sm },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  statusText: { fontSize: SIZES.sm, ...FONTS.bold, textTransform: 'uppercase' },
  infoCard: { backgroundColor: colors.surface, margin: SIZES.spacing.base, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg, ...SHADOWS.light },
  sectionTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.spacing.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  infoIcon: { fontSize: 24, width: 40 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.medium },
  notesCard: { backgroundColor: 'rgba(255, 152, 0, 0.15)', marginHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.base, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg },
  notesText: { fontSize: SIZES.md, color: colors.warning, ...FONTS.medium, lineHeight: 22 },
  actionsContainer: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  bookButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', marginBottom: SIZES.spacing.md, ...SHADOWS.light },
  bookButtonText: { color: colors.textWhite, fontSize: SIZES.md, ...FONTS.bold },
  rowActions: { flexDirection: 'row', gap: SIZES.spacing.md },
  editButton: { flex: 1, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  editButtonText: { color: colors.primary, fontSize: SIZES.md, ...FONTS.semiBold },
  deleteButton: { flex: 1, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  deleteButtonText: { color: colors.error, fontSize: SIZES.md, ...FONTS.semiBold },
});

export default VaccinationDetailCustomerScreen;
