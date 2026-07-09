/**
 * EditProfileCustomerScreen
 * Edit user profile information
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { useCustomer } from '../../context/CustomerContext';
import api from '../../../../shared/utils/api';

const EditProfileCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useCustomer();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    try {
      setIsSubmitting(true);
      const res = await api.put('/users/profile', form);
      updateUser(res.data.data);
      Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally { setIsSubmitting(false); }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.avatarSection}>
        <View style={styles.avatar}><Text style={styles.avatarEmoji}>👤</Text></View>
        <TouchableOpacity><Text style={styles.changePhoto}>Change Photo</Text></TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Your name" placeholderTextColor={colors.textLight} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email || ''} editable={false} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="Phone number" placeholderTextColor={colors.textLight} keyboardType="phone-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput style={[styles.input, styles.textArea]} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} placeholder="Your address" placeholderTextColor={colors.textLight} multiline numberOfLines={3} textAlignVertical="top" />
        </View>

        <TouchableOpacity style={[styles.saveButton, isSubmitting && styles.disabled]} onPress={handleSave} disabled={isSubmitting} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  avatarSection: { alignItems: 'center', paddingVertical: SIZES.spacing.xl, backgroundColor: colors.surface },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.sm },
  avatarEmoji: { fontSize: 36 },
  changePhoto: { fontSize: SIZES.md, color: colors.primary, ...FONTS.medium },
  form: { padding: SIZES.spacing.base, paddingBottom: SIZES.spacing.xxl },
  inputGroup: { marginBottom: SIZES.spacing.base },
  label: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  inputDisabled: { backgroundColor: colors.divider, color: colors.textLight },
  textArea: { minHeight: 80, paddingTop: SIZES.spacing.md },
  saveButton: { backgroundColor: colors.primary, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', marginTop: SIZES.spacing.lg, ...SHADOWS.light },
  disabled: { opacity: 0.7 },
  saveButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
});

export default EditProfileCustomerScreen;
