/**
 * RegisterCustomerScreen
 * Customer registration screen with full validation
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useCustomer } from '../../context/CustomerContext';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { RegisterFormData } from '../../../../shared/types';

const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Please enter a valid email'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().required('Please confirm your password').oneOf([yup.ref('password')], 'Passwords do not match'),
  phone: yup.string().optional().matches(/^[0-9]{10,11}$/, 'Phone must be 10-11 digits'),
});

const RegisterCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, isLoading } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', phone: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data.name, data.email, data.password, data.phone);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>🐾</Text>
          <Text style={styles.logoText}>Create Account</Text>
          <Text style={styles.logoSubText}>Join VetCare today</Text>
        </View>

        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="Enter your full name" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="words" />
            )} />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="Enter your email" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none" />
            )} />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.phone && styles.inputError]} placeholder="Enter phone number" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="phone-pad" />
            )} />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[styles.input, styles.passwordInput, errors.password && styles.inputError]} placeholder="Create a password" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry={!showPassword} />
              )} />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, errors.confirmPassword && styles.inputError]} placeholder="Confirm your password" placeholderTextColor={colors.textLight} onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry={!showPassword} />
            )} />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
          </View>

          {/* Register Button */}
          <TouchableOpacity style={[styles.registerButton, isLoading && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={isLoading} activeOpacity={0.8}>
            <Text style={styles.registerButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginCustomer')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.spacing.xl, paddingBottom: SIZES.spacing.xxl },
  logoSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  logoIcon: { fontSize: 48, marginBottom: SIZES.spacing.sm },
  logoText: { fontSize: SIZES.xxl, color: colors.primary, ...FONTS.bold },
  logoSubText: { fontSize: SIZES.md, color: colors.textSecondary, marginTop: SIZES.spacing.xs },
  formSection: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.xl, ...SHADOWS.medium },
  inputGroup: { marginBottom: SIZES.spacing.base },
  label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  inputError: { borderColor: colors.error },
  passwordContainer: { position: 'relative' as const },
  passwordInput: { paddingRight: 50 },
  eyeButton: { position: 'absolute' as const, right: 12, top: 12, padding: 4 },
  eyeIcon: { fontSize: 20 },
  errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: SIZES.spacing.xs },
  registerButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center' as const, marginTop: SIZES.spacing.sm, marginBottom: SIZES.spacing.lg, ...SHADOWS.light },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
  loginContainer: { flexDirection: 'row' as const, justifyContent: 'center' as const, alignItems: 'center' as const },
  loginText: { fontSize: SIZES.md, color: colors.textSecondary },
  loginLink: { fontSize: SIZES.md, color: colors.primary, ...FONTS.semiBold },
});

export default RegisterCustomerScreen;
