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

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().required('Vui lòng nhập email').email('Email không hợp lệ'),
});

const ForgotPasswordDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { forgotPassword, isLoading } = useDoctor();
  const [isSuccess, setIsSuccess] = useState(false);
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      Alert.alert('Thất bại', error.message);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.icon}>🔑</Text>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            Đừng lo lắng! Vui lòng nhập địa chỉ email được liên kết với tài khoản của bạn.
          </Text>
        </View>

        {isSuccess ? (
          <View style={styles.successSection}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Đã gửi email!</Text>
            <Text style={styles.successText}>
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('LoginDoctor')}
            >
              <Text style={styles.buttonText}>Quay lại Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
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
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, padding: SIZES.spacing.xl },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 20,
      ...SHADOWS.light,
    },
    backIcon: { fontSize: 24, color: colors.textPrimary },
    headerSection: { alignItems: 'center', marginBottom: 40 },
    icon: { fontSize: 64, marginBottom: 20 },
    title: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold, marginBottom: 10 },
    subtitle: { fontSize: SIZES.md, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
    formSection: {
      backgroundColor: colors.surface,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.spacing.xl,
      ...SHADOWS.medium,
    },
    inputGroup: { marginBottom: 30 },
    label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: 8 },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.radius.base,
      padding: SIZES.spacing.base,
      fontSize: SIZES.base,
      color: colors.textPrimary,
    },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: 4 },
    button: {
      backgroundColor: colors.primary,
      borderRadius: SIZES.radius.base,
      padding: SIZES.spacing.base,
      alignItems: 'center',
      ...SHADOWS.light,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
    successSection: { alignItems: 'center', backgroundColor: colors.surface, padding: 30, borderRadius: SIZES.radius.lg },
    successIcon: { fontSize: 80, marginBottom: 20 },
    successTitle: { fontSize: SIZES.xxl, color: colors.success, ...FONTS.bold, marginBottom: 10 },
    successText: { fontSize: SIZES.md, color: colors.textSecondary, textAlign: 'center', marginBottom: 30 },
  });

export default ForgotPasswordDoctorScreen;
