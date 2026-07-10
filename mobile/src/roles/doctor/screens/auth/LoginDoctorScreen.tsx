import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useDoctor } from '../../context/DoctorContext';
import { DoctorLoginFormData } from '../../types';

const loginSchema = yup.object().shape({
  email: yup.string().required('Vui lòng nhập email').email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const LoginDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoading } = useDoctor();
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorLoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: DoctorLoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message);
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
        <View style={styles.logoSection}>
          <Text style={styles.logoIcon}>🏥</Text>
          <Text style={styles.logoText}>VetCare</Text>
          <Text style={styles.logoBadge}>Dành Cho Bác Sĩ</Text>
          <Text style={styles.logoSubText}>Hệ Thống Quản Lý Thú Y Chuyên Nghiệp</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.title}>Chào Mừng, Bác Sĩ</Text>
          <Text style={styles.subtitle}>Đăng nhập vào tài khoản chuyên môn của bạn</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor={colors.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  testID="doctor-email-input"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
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
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={colors.textLight}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    testID="doctor-password-input"
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPasswordDoctor')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
            testID="doctor-login-button"
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🔒 Tài khoản bác sĩ được cấp bởi hệ thống.{'\n'}
              Vui lòng liên hệ quản trị viên nếu bạn cần tạo tài khoản mới.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.spacing.xl },
    logoSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
    logoIcon: { fontSize: 64, marginBottom: SIZES.spacing.sm },
    logoText: { fontSize: SIZES.title, color: colors.primary, ...FONTS.bold },
    logoBadge: {
      backgroundColor: colors.primary,
      color: colors.textWhite,
      fontSize: SIZES.sm,
      ...FONTS.semiBold,
      paddingHorizontal: SIZES.spacing.md,
      paddingVertical: SIZES.spacing.xs,
      borderRadius: SIZES.radius.round,
      overflow: 'hidden',
      marginTop: SIZES.spacing.xs,
    },
    logoSubText: { fontSize: SIZES.md, color: colors.textSecondary, marginTop: SIZES.spacing.sm, textAlign: 'center' },
    formSection: {
      backgroundColor: colors.surface,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.spacing.xl,
      ...SHADOWS.medium,
    },
    title: { fontSize: SIZES.xxl, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.xs },
    subtitle: { fontSize: SIZES.md, color: colors.textSecondary, marginBottom: SIZES.spacing.xl },
    inputGroup: { marginBottom: SIZES.spacing.base },
    label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
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
    inputError: { borderColor: colors.error },
    passwordContainer: { position: 'relative' },
    passwordInput: { paddingRight: 50 },
    eyeButton: { position: 'absolute', right: 12, top: 12, padding: 4 },
    eyeIcon: { fontSize: 20 },
    errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: SIZES.spacing.xs },
    forgotText: { color: colors.primary, fontSize: SIZES.md, ...FONTS.medium, textAlign: 'right', marginBottom: SIZES.spacing.lg },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: SIZES.radius.base,
      paddingVertical: SIZES.spacing.base,
      alignItems: 'center',
      marginBottom: SIZES.spacing.base,
      ...SHADOWS.light,
    },
    buttonDisabled: { opacity: 0.7 },
    loginButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
    infoBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: SIZES.radius.base,
      padding: SIZES.spacing.md,
      marginTop: SIZES.spacing.xs,
    },
    infoText: { fontSize: SIZES.sm, color: colors.primaryDark, textAlign: 'center', lineHeight: 20 },
  });

export default LoginDoctorScreen;
