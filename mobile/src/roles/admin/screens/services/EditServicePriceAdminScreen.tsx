import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { Service } from '../../../../shared/types';

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().required('Tên dịch vụ không được để trống').min(2, 'Ít nhất 2 ký tự'),
  price: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Giá không được để trống')
    .positive('Giá phải lớn hơn 0')
    .typeError('Giá phải là số'),
  duration: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Thời gian không được để trống')
    .positive('Thời gian phải lớn hơn 0')
    .min(5, 'Ít nhất 5 phút')
    .typeError('Thời gian phải là số'),
  description: yup.string(),
  isActive: yup.boolean().default(true),
});

const EditServicePriceAdminScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { serviceId } = route.params;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      price: undefined,
      duration: undefined,
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setFetching(true);
      const response = await adminApi.get(`/services/${serviceId}`);
      const serviceData = response.data.data;
      setService(serviceData);
      
      reset({
        name: serviceData.name,
        price: serviceData.price,
        duration: serviceData.duration,
        description: serviceData.description || '',
        isActive: serviceData.isActive,
      });
    } catch (error) {
      console.error('Error fetching service details:', error);
      Alert.alert('Lỗi', 'Không tải được thông tin dịch vụ', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await adminApi.put(`/services/${serviceId}`, data);
      Alert.alert('Thành công', 'Cập nhật dịch vụ thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error updating service:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Cập nhật dịch vụ thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.text}>
          Quay lại
        </Button>
        <Text style={styles.title}>Sửa giá dịch vụ</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Clinic Name (Read-Only) */}
          <View style={styles.inputContainer}>
             <TextInput
                label="Phòng khám"
                value={service?.clinic?.name || 'N/A'}
                mode="outlined"
                editable={false}
                style={styles.input}
                outlineColor="#E0E0E0"
             />
          </View>

          {/* Service Name */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Tên dịch vụ *"
                  mode="outlined"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.name}
                  style={styles.input}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4CAF50"
                />
              )}
            />
            {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
          </View>

          {/* Price */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Giá (VNĐ) *"
                  mode="outlined"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ? String(value) : ''}
                  error={!!errors.price}
                  style={styles.input}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4CAF50"
                />
              )}
            />
            {errors.price && <HelperText type="error">{errors.price.message}</HelperText>}
          </View>

          {/* Duration */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="duration"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Thời gian (phút) *"
                  mode="outlined"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ? String(value) : ''}
                  error={!!errors.duration}
                  style={styles.input}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4CAF50"
                />
              )}
            />
            {errors.duration && <HelperText type="error">{errors.duration.message}</HelperText>}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Mô tả"
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.description}
                  style={styles.input}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4CAF50"
                />
              )}
            />
          </View>

          {/* Is Active */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Trạng thái (Hoạt động)</Text>
            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <Switch 
                  value={value} 
                  onValueChange={onChange} 
                  color="#4CAF50"
                />
              )}
            />
          </View>

          <Button 
            mode="contained" 
            onPress={handleSubmit(onSubmit)} 
            loading={loading}
            disabled={loading}
            style={[styles.submitButton, { backgroundColor: '#4CAF50' }]}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonText}
          >
            Cập nhật dịch vụ
          </Button>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...SHADOWS.small,
  },
  title: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    color: '#333',
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: SIZES.md,
    ...FONTS.medium,
    color: '#333',
  },
  submitButton: {
    borderRadius: 8,
    elevation: 2,
  },
  submitButtonContent: {
    height: 50,
  },
  submitButtonText: {
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
});

export default EditServicePriceAdminScreen;
