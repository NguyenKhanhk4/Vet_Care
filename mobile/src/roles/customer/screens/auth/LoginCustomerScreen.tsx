/**
 * LoginCustomerScreen
 * Customer login screen with email and password
 * Uses React Hook Form + Yup validation
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
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useCustomer } from '../../context/CustomerContext';
import { LoginFormData } from '../../../../shared/types';

// Validation Schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const LoginCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoading } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>🐾</Text>
          <Text style={styles.logoText}>VetCare</Text>
          <Text style={styles.logoSubText}>Pet Healthcare Made Easy</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textLight}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPasswordCustomer')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RegisterCustomer')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.sm,
  },
  logoText: {
    fontSize: SIZES.title,
    color: colors.primary,
    ...FONTS.bold,
  },
  logoSubText: {
    fontSize: SIZES.md,
    color: colors.textSecondary,
    marginTop: SIZES.spacing.xs,
  },
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.xxl,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: SIZES.spacing.xs,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: colors.textSecondary,
    marginBottom: SIZES.spacing.xl,
  },
  inputGroup: {
    marginBottom: SIZES.spacing.base,
  },
  label: {
    fontSize: SIZES.md,
    color: colors.textPrimary,
    ...FONTS.medium,
    marginBottom: SIZES.spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZES.radius.base,
    paddingHorizontal: SIZES.spacing.base,
    paddingVertical: SIZES.spacing.md,
    fontSize: SIZES.base,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: SIZES.sm,
    marginTop: SIZES.spacing.xs,
  },
  forgotText: {
    color: colors.primary,
    fontSize: SIZES.md,
    ...FONTS.medium,
    textAlign: 'right',
    marginBottom: SIZES.spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: SIZES.radius.base,
    paddingVertical: SIZES.spacing.base,
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.light,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.textWhite,
    fontSize: SIZES.lg,
    ...FONTS.semiBold,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: SIZES.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: SIZES.md,
    color: colors.primary,
    ...FONTS.semiBold,
  },
});

export default LoginCustomerScreen;
