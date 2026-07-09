/**
 * AddPetCustomerScreen
 * Form to add a new pet with image picker
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { PetFormData } from '../../../../shared/types';

const petSchema = yup.object().shape({
  name: yup.string().required('Pet name is required').max(50),
  species: yup.string().required('Species is required'),
  breed: yup.string().optional(),
  gender: yup.string().optional(),
  age: yup.number().optional().min(0).max(50).transform((v, o) => o === '' ? undefined : v),
  weight: yup.number().optional().min(0).max(200).transform((v, o) => o === '' ? undefined : v),
  color: yup.string().optional(),
  vaccineStatus: yup.string().optional(),
});

const SPECIES_OPTIONS = [
  { value: 'dog', label: '🐕 Dog' }, { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' }, { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'hamster', label: '🐹 Hamster' }, { value: 'fish', label: '🐟 Fish' },
  { value: 'reptile', label: '🦎 Reptile' }, { value: 'other', label: '🐾 Other' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: '♂️ Male' }, { value: 'female', label: '♀️ Female' }, { value: 'unknown', label: '❓ Unknown' },
];

const VACCINE_OPTIONS = [
  { value: 'up-to-date', label: '✅ Up to Date' }, { value: 'overdue', label: '⚠️ Overdue' },
  { value: 'not-vaccinated', label: '❌ Not Vaccinated' }, { value: 'unknown', label: '❓ Unknown' },
];

const AddPetCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<PetFormData>({
    resolver: yupResolver(petSchema) as any,
    defaultValues: { name: '', species: '', breed: '', gender: 'unknown', color: '', vaccineStatus: 'unknown' },
  });

  const selectedSpecies = watch('species');
  const selectedGender = watch('gender');
  const selectedVaccine = watch('vaccineStatus');

  const onSubmit = async (data: PetFormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/pets', data);
      Alert.alert('Success', 'Pet added successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = getStyles(colors);

  const SelectionGroup = ({ options, selected, onSelect, label }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionGrid}>
        {options.map((opt: any) => (
          <TouchableOpacity key={opt.value} style={[styles.optionButton, selected === opt.value && styles.optionSelected]} onPress={() => onSelect(opt.value)} activeOpacity={0.7}>
            <Text style={[styles.optionText, selected === opt.value && styles.optionTextSelected]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pet Name *</Text>
          <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="e.g. Lucky" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
        </View>

        {/* Species */}
        <SelectionGroup options={SPECIES_OPTIONS} selected={selectedSpecies} onSelect={(v: string) => setValue('species', v)} label="Species *" />
        {errors.species && <Text style={styles.errorText}>{errors.species.message}</Text>}

        {/* Breed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <Controller control={control} name="breed" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} placeholder="e.g. Golden Retriever" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
        </View>

        {/* Gender */}
        <SelectionGroup options={GENDER_OPTIONS} selected={selectedGender} onSelect={(v: string) => setValue('gender', v)} label="Gender" />

        {/* Age & Weight Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: SIZES.spacing.sm }]}>
            <Text style={styles.label}>Age (years)</Text>
            <Controller control={control} name="age" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value?.toString() || ''} keyboardType="numeric" />
            )} />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.spacing.sm }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <Controller control={control} name="weight" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value?.toString() || ''} keyboardType="numeric" />
            )} />
          </View>
        </View>

        {/* Color */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <Controller control={control} name="color" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} placeholder="e.g. Golden" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
        </View>

        {/* Vaccine Status */}
        <SelectionGroup options={VACCINE_OPTIONS} selected={selectedVaccine} onSelect={(v: string) => setValue('vaccineStatus', v)} label="Vaccine Status" />

        {/* Submit */}
        <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} activeOpacity={0.8}>
          <Text style={styles.submitText}>{isSubmitting ? 'Adding...' : 'Add Pet'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  inputGroup: { marginBottom: SIZES.spacing.base },
  label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: SIZES.spacing.xs },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacing.sm },
  optionButton: { paddingVertical: SIZES.spacing.sm, paddingHorizontal: SIZES.spacing.md, borderRadius: SIZES.radius.round, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionText: { fontSize: SIZES.md, color: colors.textSecondary },
  optionTextSelected: { color: colors.primaryDark, ...FONTS.medium },
  row: { flexDirection: 'row' },
  submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', marginTop: SIZES.spacing.lg, ...SHADOWS.light },
  buttonDisabled: { opacity: 0.7 },
  submitText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
});

export default AddPetCustomerScreen;
