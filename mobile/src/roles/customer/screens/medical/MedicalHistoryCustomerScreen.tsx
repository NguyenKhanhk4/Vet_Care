/**
 * MedicalHistoryCustomerScreen
 * Timeline view of all medical records (read-only)
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { MedicalRecord } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import EmptyState from '../../../../shared/components/EmptyState';

const MedicalHistoryCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  useFocusEffect(useCallback(() => {
    const fetchRecords = async () => {
      try { const res = await api.get('/medical-records?limit=50'); setRecords(res.data.data || []); }
      catch (error) { console.error('Error:', error); }
      finally { setIsLoading(false); }
    };
    fetchRecords();
  }, []));

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <EmptyState icon="📋" title="No Medical Records" message="Medical records will appear here after your pet's appointments are completed." />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recordCard} onPress={() => navigation.navigate('MedicalDetailCustomer', { recordId: item._id })} activeOpacity={0.8}>
              <View style={styles.timeline}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                <Text style={styles.diagnosis} numberOfLines={2}>🩺 {item.diagnosis}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>🐾 {typeof item.pet === 'object' ? item.pet.name : 'Pet'}</Text>
                  <Text style={styles.metaText}>👨‍⚕️ {typeof item.doctor === 'object' ? item.doctor.user?.name : 'Doctor'}</Text>
                </View>
                <Text style={styles.costText}>💰 {(item.cost || 0).toLocaleString('vi-VN')}đ</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: SIZES.spacing.base },
  recordCard: { flexDirection: 'row', marginBottom: SIZES.spacing.md },
  timeline: { alignItems: 'center', marginRight: SIZES.spacing.md },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.primaryLight, marginTop: 4 },
  cardContent: { flex: 1, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, ...SHADOWS.light },
  dateText: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.semiBold, marginBottom: SIZES.spacing.xs },
  diagnosis: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, marginBottom: SIZES.spacing.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.spacing.xs },
  metaText: { fontSize: SIZES.sm, color: colors.textSecondary },
  costText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.semiBold },
});

export default MedicalHistoryCustomerScreen;
