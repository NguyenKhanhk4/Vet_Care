/**
 * ChangePasswordCustomerScreen
 * Change password with current/new/confirm fields
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';

const schema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().required('Please confirm password').oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

const ChangePasswordCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await api.put('/users/change-password', data);
      Alert.alert('Success', 'Password changed successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally { setIsSubmitting(false); }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <View style={styles.iconContainer}><Text style={styles.icon}>🔒</Text></View>

        {[
          { name: 'currentPassword' as const, label: 'Current Password', placeholder: 'Enter current password' },
          { name: 'newPassword' as const, label: 'New Password', placeholder: 'Enter new password' },
          { name: 'confirmPassword' as const, label: 'Confirm New Password', placeholder: 'Re-enter new password' },
        ].map((field) => (
          <View key={field.name} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <Controller control={control} name={field.name} render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors[field.name] && styles.inputError]} placeholder={field.placeholder} placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry />
            )} />
            {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]?.message}</Text>}
          </View>
        ))}

        <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.disabled]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} activeOpacity={0.8}>
          <Text style={styles.submitText}>{isSubmitting ? 'Changing...' : 'Change Password'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  iconContainer: { alignItems: 'center', marginBottom: SIZES.spacing.xl },
  icon: { fontSize: 48 },
  inputGroup: { marginBottom: SIZES.spacing.base },
  label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: SIZES.spacing.xs },
  submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: 10, alignItems: 'center', marginTop: SIZES.spacing.lg, ...SHADOWS.light },
  disabled: { opacity: 0.7 },
  submitText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
});

export default ChangePasswordCustomerScreen;
