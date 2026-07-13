import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useDoctor } from '../../context/DoctorContext';
import { doctorApi } from '../../services/doctorApi';

const nameRegex = /^[\p{L}\s]+$/u;
const phoneRegex = /^[0-9]{10,11}$/;

const editProfileSchema = yup.object().shape({
  name: yup.string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .matches(nameRegex, 'Tên chỉ được chứa chữ cái tiếng Việt và khoảng trắng, không chứa số hay ký tự đặc biệt'),
  phone: yup.string()
    .required('Vui lòng nhập số điện thoại')
    .matches(phoneRegex, 'Số điện thoại không hợp lệ (gồm 10-11 chữ số)'),
  address: yup.string()
    .max(200, 'Địa chỉ không được vượt quá 200 ký tự'),
  specialization: yup.string()
    .max(100, 'Chuyên khoa không được vượt quá 100 ký tự'),
  experience: yup.number()
    .typeError('Kinh nghiệm phải là số')
    .min(0, 'Kinh nghiệm không được là số âm')
    .max(50, 'Kinh nghiệm không hợp lệ (>50 năm)')
    .required('Vui lòng nhập số năm kinh nghiệm'),
  bio: yup.string()
    .max(500, 'Giới thiệu không được vượt quá 500 ký tự'),
});

const EditProfileDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { doctor, updateProfile } = useDoctor();
  const { colors } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(doctor?.user.avatar || null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      name: doctor?.user.name || '',
      phone: doctor?.user.phone || '',
      address: doctor?.user.address || '',
      specialization: doctor?.specialization || '',
      experience: doctor?.experience || 0,
      bio: doctor?.bio || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      
      // Update profile text data
      await doctorApi.put('/profile', data);
      
      // Upload avatar if changed
      if (avatarUri && avatarUri !== doctor?.user.avatar) {
        const formData = new FormData();
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        } as any);

        await doctorApi.put('/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await updateProfile(); // Refresh context data
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật hồ sơ.');
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
        <Text style={styles.headerTitle}>Chỉnh Sửa Hồ Sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>{doctor?.user?.name?.charAt(0) || 'D'}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Nhấn để đổi ảnh đại diện</Text>
        </View>

        <View style={styles.formSection}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={colors.textLight}
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor={colors.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chuyên khoa</Text>
            <Controller
              control={control}
              name="specialization"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="VD: Phẫu thuật, Da liễu..."
                  placeholderTextColor={colors.textLight}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số năm kinh nghiệm</Text>
            <Controller
              control={control}
              name="experience"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="VD: 5"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ? value.toString() : ''}
                />
              )}
            />
            {errors.experience && <Text style={styles.errorText}>{errors.experience.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới thiệu ngắn (Bio)</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Giới thiệu về bản thân..."
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

        </View>

        <TouchableOpacity 
          style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}</Text>
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
    avatarSection: { alignItems: 'center', marginBottom: SIZES.spacing.xl },
    avatarContainer: { position: 'relative', width: 100, height: 100 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.primary },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.surface },
    avatarPlaceholderText: { fontSize: 40, color: colors.textWhite, ...FONTS.bold },
    editBadge: { position: 'absolute', right: 0, bottom: 0, backgroundColor: colors.surface, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...SHADOWS.light, borderWidth: 1, borderColor: colors.border },
    editBadgeIcon: { fontSize: 16 },
    avatarHint: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: SIZES.spacing.sm },
    formSection: { backgroundColor: colors.surface, padding: SIZES.spacing.xl, borderRadius: SIZES.radius.lg, ...SHADOWS.medium },
    inputGroup: { marginBottom: SIZES.spacing.lg },
    label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: 8 },
    input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, fontSize: SIZES.base, color: colors.textPrimary },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: SIZES.sm, marginTop: 4 },
    submitButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, alignItems: 'center', marginTop: SIZES.spacing.md, ...SHADOWS.light },
    submitButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.bold },
  });

export default EditProfileDoctorScreen;
