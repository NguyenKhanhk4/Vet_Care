import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const MedicalHistoryDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = async () => {
    try {
      const response = await doctorApi.get('/medical-records');
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Sử Bệnh Án</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>📅 {new Date(item.date).toLocaleDateString('vi-VN')}</Text>
                <Text style={styles.petName}>🐾 {item.pet?.name}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Khách hàng:</Text>
                  <Text style={styles.infoValue}>{item.customer?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chẩn đoán:</Text>
                  <Text style={[styles.infoValue, { color: colors.error, ...FONTS.bold }]}>{item.diagnosis}</Text>
                </View>
                {item.treatment ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Điều trị:</Text>
                    <Text style={styles.infoValue}>{item.treatment}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyText}>Chưa có hồ sơ bệnh án nào.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacing.lg, backgroundColor: colors.surface, ...SHADOWS.light },
    backButton: { padding: SIZES.spacing.xs },
    backIcon: { fontSize: 24, color: colors.textPrimary },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    listContainer: { padding: SIZES.spacing.lg },
    card: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.md, ...SHADOWS.light },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 10 },
    dateText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.bold },
    petName: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
    cardBody: { paddingTop: 5 },
    infoRow: { flexDirection: 'row', marginBottom: 6 },
    infoLabel: { width: 90, fontSize: SIZES.sm, color: colors.textSecondary },
    infoValue: { flex: 1, fontSize: SIZES.sm, color: colors.textPrimary, ...FONTS.medium },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default MedicalHistoryDoctorScreen;
