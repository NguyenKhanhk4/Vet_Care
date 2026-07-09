import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const medicalRecordSchema = yup.object().shape({
  diagnosis: yup.string().required('Vui lòng nhập chẩn đoán'),
  symptoms: yup.string(),
  prescription: yup.string(),
  treatment: yup.string(),
  doctorNotes: yup.string(),
  cost: yup.number().min(0, 'Chi phí không được âm').typeError('Chi phí phải là số'),
});

const MedicalRecordDoctorScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(medicalRecordSchema),
    defaultValues: { diagnosis: '', symptoms: '', prescription: '', treatment: '', doctorNotes: '', cost: 0 },
  });

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      await doctorApi.post('/medical-records', {
        appointmentId,
        ...data,
      });
      Alert.alert('Thành công', 'Đã lưu hồ sơ bệnh án.', [
        { text: 'OK', onPress: () => navigation.navigate('HomeDoctor') }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu hồ sơ bệnh án.');
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
        <Text style={styles.headerTitle}>Cập Nhật Bệnh Án</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formSection}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chẩn đoán *</Text>
            <Controller
              control={control}
              name="diagnosis"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea, errors.diagnosis && styles.inputError]}
                  placeholder="Nhập chẩn đoán..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={4}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.diagnosis && <Text style={styles.errorText}>{errors.diagnosis.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Triệu chứng</Text>
            <Controller
              control={control}
              name="symptoms"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mô tả triệu chứng..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hướng điều trị</Text>
            <Controller
              control={control}
              name="treatment"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Chi tiết liệu trình điều trị..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Đơn thuốc</Text>
            <Controller
              control={control}
              name="prescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Kê đơn thuốc..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú thêm (Nội bộ)</Text>
            <Controller
              control={control}
              name="doctorNotes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ghi chú của bác sĩ..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chi phí phát sinh (VNĐ)</Text>
            <Controller
              control={control}
              name="cost"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.cost && styles.inputError]}
                  placeholder="Nhập chi phí (nếu có)"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ? value.toString() : ''}
                />
              )}
            />
            {errors.cost && <Text style={styles.errorText}>{errors.cost.message}</Text>}
          </View>

        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Đang lưu...' : 'Lưu Bệnh Án'}</Text>
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
    scrollContent: { padding: SIZES.spacing.lg, paddingBottom: 50 },
    formSection: { backgroundColor: colors.surface, padding: SIZES.spacing.xl, borderRadius: SIZES.radius.lg, ...SHADOWS.medium },
    inputGroup: { marginBottom: SIZES.spacing.lg },
    label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: 8 },
    input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, fontSize: SIZES.base, color: colors.textPrimary },
    textArea: { height: 100, textAlignVertical: 'top' },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: 4 },
    submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, alignItems: 'center', marginTop: SIZES.spacing.xl, ...SHADOWS.light },
    submitButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
  });

export default MedicalRecordDoctorScreen;
