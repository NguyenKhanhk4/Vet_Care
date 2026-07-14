import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const MedicalHistoryDoctorScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { petId, petName } = route.params || {};
  const { colors } = useTheme();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter(record => 
    record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.treatment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(record.date).toLocaleDateString('vi-VN').includes(searchQuery)
  );

  const fetchRecords = async () => {
    try {
      const response = await doctorApi.get('/medical-records', { params: { petId } });
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
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Lịch Sử Khám {petName ? `- ${petName}` : ''}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm chẩn đoán, điều trị, ngày..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('MedicalRecordDoctor', { existingRecord: item, isReadOnly: true })}
            >
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
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyText}>Đây là lần khám đầu tiên của bé</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacing.lg, paddingTop: 60, backgroundColor: colors.surface, ...SHADOWS.light, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: SIZES.spacing.md },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, color: colors.textPrimary, ...FONTS.bold, marginHorizontal: 10 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, marginHorizontal: SIZES.spacing.lg, marginTop: 10, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: colors.divider, ...SHADOWS.light },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: '100%', color: colors.textPrimary, fontSize: 15, ...FONTS.medium },
    clearButton: { padding: 4 },
    listContainer: { padding: SIZES.spacing.lg, flexGrow: 1 },
    card: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.md, ...SHADOWS.light },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 10 },
    dateText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.bold },
    petName: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
    cardBody: { paddingTop: 5 },
    infoRow: { flexDirection: 'row', marginBottom: 6 },
    infoLabel: { width: 90, fontSize: SIZES.sm, color: colors.textSecondary },
    infoValue: { flex: 1, fontSize: SIZES.sm, color: colors.textPrimary, ...FONTS.medium },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -50 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default MedicalHistoryDoctorScreen;
