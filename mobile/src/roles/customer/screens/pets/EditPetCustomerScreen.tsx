/**
 * EditPetCustomerScreen
 * Pre-filled form to edit an existing pet
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Pet } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const EditPetCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', age: '', weight: '', color: '', gender: '', species: '', vaccineStatus: '' });
  const { colors } = useTheme();

  useEffect(() => { fetchPet(); }, [petId]);

  const fetchPet = async () => {
    try {
      const res = await api.get(`/pets/${petId}`);
      const p = res.data.data;
      setPet(p);
      setForm({
        name: p.name, breed: p.breed || '', age: p.age?.toString() || '', weight: p.weight?.toString() || '',
        color: p.color || '', gender: p.gender || 'unknown', species: p.species, vaccineStatus: p.vaccineStatus || 'unknown',
      });
    } catch (error) { Alert.alert('Error', 'Failed to load pet'); navigation.goBack(); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Pet name is required'); return; }
    try {
      setIsSubmitting(true);
      await api.put(`/pets/${petId}`, {
        ...form,
        age: form.age ? parseFloat(form.age) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      });
      Alert.alert('Success', 'Pet updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update pet');
    } finally { setIsSubmitting(false); }
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pet Name</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Pet name" placeholderTextColor={colors.textLight} />
        </View>

        {/* Breed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <TextInput style={styles.input} value={form.breed} onChangeText={(v) => setForm({ ...form, breed: v })} placeholder="Breed" placeholderTextColor={colors.textLight} />
        </View>

        {/* Age & Weight */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput style={styles.input} value={form.age} onChangeText={(v) => setForm({ ...form, age: v })} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} value={form.weight} onChangeText={(v) => setForm({ ...form, weight: v })} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} />
          </View>
        </View>

        {/* Color */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <TextInput style={styles.input} value={form.color} onChangeText={(v) => setForm({ ...form, color: v })} placeholder="Color" placeholderTextColor={colors.textLight} />
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.disabled]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8}>
          <Text style={styles.submitText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
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
  row: { flexDirection: 'row' },
  submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', marginTop: SIZES.spacing.lg, ...SHADOWS.light },
  disabled: { opacity: 0.7 },
  submitText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
});

export default EditPetCustomerScreen;
