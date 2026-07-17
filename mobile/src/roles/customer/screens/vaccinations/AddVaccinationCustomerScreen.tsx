import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Pet } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const validationSchema = yup.object().shape({
  pet: yup.string().required('Please select a pet'),
  vaccineName: yup.string().required('Vaccine name is required').max(100, 'Too long'),
  vaccineType: yup.string().max(50, 'Too long'),
  vaccinationDate: yup.string().required('Vaccination date is required').matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  nextDueDate: yup.string().required('Next due date is required').matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  notes: yup.string().max(500, 'Notes too long')
});

const AddVaccinationCustomerScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialPetId = route.params?.petId || '';

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      pet: initialPetId,
      vaccineName: '',
      vaccineType: '',
      vaccinationDate: new Date().toISOString().split('T')[0],
      nextDueDate: '',
      notes: ''
    }
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await api.get('/pets');
      setPets(res.data.data || []);
      if (!initialPetId && res.data.data?.length > 0) {
        setValue('pet', res.data.data[0]._id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load pets');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post('/vaccinations', data);
      Alert.alert('Success', 'Vaccination record added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add vaccination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Preparing form..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Add Vaccination Record</Text>
      
      {/* Pet Selection */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Select Pet *</Text>
        <Controller
          control={control}
          name="pet"
          render={({ field: { onChange, value } }) => (
            <View style={styles.petSelector}>
              {pets.map((p) => (
                <TouchableOpacity
                  key={p._id}
                  style={[styles.petChip, value === p._id && styles.petChipActive]}
                  onPress={() => onChange(p._id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.petChipText, value === p._id && styles.petChipTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.pet && <Text style={styles.errorText}>{errors.pet.message}</Text>}
      </View>

      {/* Vaccine Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Vaccine Name *</Text>
        <Controller
          control={control}
          name="vaccineName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.vaccineName && styles.inputError]}
              placeholder="e.g. Rabies, DHPP..."
              placeholderTextColor={colors.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.vaccineName && <Text style={styles.errorText}>{errors.vaccineName.message}</Text>}
      </View>

      {/* Vaccine Type */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Vaccine Type</Text>
        <Controller
          control={control}
          name="vaccineType"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g. Core, Non-core..."
              placeholderTextColor={colors.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.vaccineType && <Text style={styles.errorText}>{errors.vaccineType.message}</Text>}
      </View>

      {/* Vaccination Date */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date Given (YYYY-MM-DD) *</Text>
        <Controller
          control={control}
          name="vaccinationDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.vaccinationDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.vaccinationDate && <Text style={styles.errorText}>{errors.vaccinationDate.message as string}</Text>}
      </View>

      {/* Next Due Date */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Next Due Date (YYYY-MM-DD) *</Text>
        <Controller
          control={control}
          name="nextDueDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.nextDueDate && styles.inputError]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.nextDueDate && <Text style={styles.errorText}>{errors.nextDueDate.message as string}</Text>}
      </View>

      {/* Notes */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes..."
              placeholderTextColor={colors.textLight}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
        {errors.notes && <Text style={styles.errorText}>{errors.notes.message}</Text>}
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: SIZES.spacing.xl, paddingBottom: 100 },
  title: { fontSize: SIZES.xl, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.xl },
  formGroup: { marginBottom: SIZES.spacing.lg },
  label: { fontSize: SIZES.sm, color: colors.textSecondary, ...FONTS.medium, marginBottom: SIZES.spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.md, paddingVertical: Platform.OS === 'ios' ? SIZES.spacing.md : SIZES.spacing.sm, fontSize: SIZES.base, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  textArea: { height: 100 },
  errorText: { color: colors.error, fontSize: SIZES.xs, marginTop: 4, ...FONTS.medium },
  petSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacing.sm },
  petChip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.xl, paddingVertical: SIZES.spacing.sm, paddingHorizontal: SIZES.spacing.md },
  petChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  petChipText: { fontSize: SIZES.sm, color: colors.textSecondary, ...FONTS.medium },
  petChipTextActive: { color: colors.textWhite, ...FONTS.semiBold },
  submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', marginTop: SIZES.spacing.lg, ...SHADOWS.medium },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: colors.textWhite, fontSize: SIZES.md, ...FONTS.bold },
});

export default AddVaccinationCustomerScreen;
