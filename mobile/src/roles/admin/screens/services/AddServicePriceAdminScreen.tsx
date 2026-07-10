import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, Switch, HelperText, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { Clinic } from '../../../../shared/types';

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
  clinic: yup.string().required('Vui lòng chọn phòng khám'),
  category: yup.string().default('other'),
});

const AddServicePriceAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicMenuVisible, setClinicMenuVisible] = useState(false);
  const [selectedClinicName, setSelectedClinicName] = useState('');

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      price: undefined,
      duration: undefined,
      description: '',
      isActive: true,
      clinic: '',
      category: 'other',
    },
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await adminApi.get('/clinics', { params: { limit: 100 } });
      const { clinics: fetchedClinics } = response.data.data;
      setClinics(fetchedClinics);
      if (fetchedClinics.length > 0) {
        setValue('clinic', fetchedClinics[0]._id);
        setSelectedClinicName(fetchedClinics[0].name);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await adminApi.post('/services', data);
      Alert.alert('Thành công', 'Thêm dịch vụ thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error adding service:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Thêm dịch vụ thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.text}>
          Quay lại
        </Button>
        <Text style={styles.title}>Thêm giá dịch vụ</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Clinic Selection */}
          <View style={styles.inputContainer}>
            <Menu
              visible={clinicMenuVisible}
              onDismiss={() => setClinicMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setClinicMenuVisible(true)}>
                  <TextInput
                    label="Phòng khám *"
                    value={selectedClinicName}
                    mode="outlined"
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#4CAF50"
                  />
                </TouchableOpacity>
              }
            >
              {clinics.map((clinic) => (
                <Menu.Item 
                  key={clinic._id} 
                  onPress={() => {
                    setValue('clinic', clinic._id);
                    setSelectedClinicName(clinic.name);
                    setClinicMenuVisible(false);
                  }} 
                  title={clinic.name} 
                />
              ))}
            </Menu>
            {errors.clinic && <HelperText type="error">{errors.clinic.message}</HelperText>}
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
            Lưu dịch vụ
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

export default AddServicePriceAdminScreen;
