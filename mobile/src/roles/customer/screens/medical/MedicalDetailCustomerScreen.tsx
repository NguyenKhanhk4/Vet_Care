/**
 * MedicalDetailCustomerScreen
 * Read-only detail view of a medical record
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { MedicalRecord } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const MedicalDetailCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route }) => {
  const { recordId } = route.params;
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => { fetchRecord(); }, [recordId]);

  const fetchRecord = async () => {
    try { const res = await api.get(`/medical-records/${recordId}`); setRecord(res.data.data); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed to load record'); }
    finally { setIsLoading(false); }
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRecord} />;
  if (!record) return null;

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const sections = [
    { icon: '🐾', title: 'Pet', content: typeof record.pet === 'object' ? record.pet.name : 'Pet' },
    { icon: '👨‍⚕️', title: 'Doctor', content: typeof record.doctor === 'object' ? record.doctor.user?.name : 'Doctor' },
    { icon: '📅', title: 'Date', content: formatDate(record.date) },
    { icon: '🔍', title: 'Symptoms', content: record.symptoms || 'None recorded' },
    { icon: '🩺', title: 'Diagnosis', content: record.diagnosis },
    { icon: '💊', title: 'Prescription', content: record.prescription || 'None' },
    { icon: '📝', title: 'Doctor Notes', content: record.doctorNotes || 'No additional notes' },
    { icon: '💰', title: 'Cost', content: `${(record.cost || 0).toLocaleString('vi-VN')}đ` },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📋</Text>
        <Text style={styles.headerTitle}>Medical Record</Text>
        <Text style={styles.headerDate}>{formatDate(record.date)}</Text>
      </View>

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{section.icon}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
      ))}

      <View style={styles.readOnlyNote}>
        <Text style={styles.readOnlyText}>ℹ️ Medical records are read-only and cannot be modified.</Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: SIZES.spacing.xxl, backgroundColor: colors.primaryLight },
  headerIcon: { fontSize: 48, marginBottom: SIZES.spacing.sm },
  headerTitle: { fontSize: SIZES.xl, color: colors.primaryDark, ...FONTS.bold },
  headerDate: { fontSize: SIZES.md, color: colors.textSecondary, marginTop: 4 },
  section: { backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.sm, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, ...SHADOWS.light },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacing.sm },
  sectionIcon: { fontSize: 18, marginRight: SIZES.spacing.sm },
  sectionTitle: { fontSize: SIZES.md, color: colors.textLight, ...FONTS.medium },
  sectionContent: { fontSize: SIZES.base, color: colors.textPrimary, lineHeight: 24 },
  readOnlyNote: { margin: SIZES.spacing.base, marginBottom: SIZES.spacing.xxl, padding: SIZES.spacing.base, backgroundColor: '#FFF3E0', borderRadius: SIZES.radius.base },
  readOnlyText: { fontSize: SIZES.sm, color: '#E65100', textAlign: 'center' },
});

export default MedicalDetailCustomerScreen;
