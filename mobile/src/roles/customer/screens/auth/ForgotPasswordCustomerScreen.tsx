/**
 * ForgotPasswordCustomerScreen
 * Password reset request screen
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useCustomer } from '../../context/CustomerContext';

const schema = yup.object().shape({
  email: yup.string().required('Email is required').email('Please enter a valid email'),
});

const ForgotPasswordCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { forgotPassword } = useCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      setIsSubmitting(true);
      const message = await forgotPassword(data.email);
      Alert.alert('Success', message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔒</Text>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email address and we'll send you instructions to reset your password.</Text>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="Enter your email" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none" />
            )} />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>{isSubmitting ? 'Sending...' : 'Send Reset Instructions'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: SIZES.spacing.xl, paddingTop: 60 },
  backButton: { marginBottom: SIZES.spacing.xl },
  backIcon: { fontSize: SIZES.base, color: colors.primary, ...FONTS.medium },
  iconContainer: { alignItems: 'center', marginBottom: SIZES.spacing.lg },
  icon: { fontSize: 64 },
  title: { fontSize: SIZES.xxl, color: colors.textPrimary, ...FONTS.bold, textAlign: 'center', marginBottom: SIZES.spacing.sm },
  subtitle: { fontSize: SIZES.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.spacing.xxl },
  formSection: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.xl, ...SHADOWS.medium },
  inputGroup: { marginBottom: SIZES.spacing.lg },
  label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: SIZES.spacing.xs },
  submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', ...SHADOWS.light },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: colors.textWhite, fontSize: SIZES.base, ...FONTS.semiBold },
});

export default ForgotPasswordCustomerScreen;
