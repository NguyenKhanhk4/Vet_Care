import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: yup.string().required('Vui lòng nhập mật khẩu mới').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp').required('Vui lòng xác nhận mật khẩu'),
});

const ChangePasswordDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      await doctorApi.put('/profile/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.', [
        { text: 'OK', onPress: () => { reset(); navigation.goBack(); } }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.currentPassword && styles.inputError]}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showCurrent}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrent(!showCurrent)}>
                <Text style={styles.eyeIcon}>{showCurrent ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.newPassword && styles.inputError]}
                    placeholder="Nhập mật khẩu mới"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showNew}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNew(!showNew)}>
                <Text style={styles.eyeIcon}>{showNew ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={!showConfirm}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.eyeIcon}>{showConfirm ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
          </View>

        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacing.lg, backgroundColor: colors.surface, ...SHADOWS.light },
    backButton: { padding: SIZES.spacing.xs },
    backIcon: { fontSize: 24, color: colors.textPrimary },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    scrollContent: { padding: SIZES.spacing.lg },
    formSection: { backgroundColor: colors.surface, padding: SIZES.spacing.xl, borderRadius: SIZES.radius.lg, ...SHADOWS.medium },
    inputGroup: { marginBottom: SIZES.spacing.lg },
    label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: 8 },
    input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, fontSize: SIZES.base, color: colors.textPrimary },
    passwordContainer: { position: 'relative' },
    passwordInput: { paddingRight: 50 },
    eyeButton: { position: 'absolute', right: 12, top: 12, padding: 4 },
    eyeIcon: { fontSize: 20 },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: 4 },
    submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, alignItems: 'center', marginTop: SIZES.spacing.md, ...SHADOWS.light },
    submitButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
  });

export default ChangePasswordDoctorScreen;
