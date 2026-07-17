import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';
import { translateSpecies, translateGender } from '../../../../shared/utils/translate';

const CustomerPetsDoctorScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { customerId, customerName } = route.params;
  const { colors } = useTheme();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async () => {
    try {
      const response = await doctorApi.get(`/customers/${customerId}/pets`);
      setPets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customer pets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [customerId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Thú cưng của {customerName}</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.petIcon}>🐾</Text>
                  <Text style={styles.petName}>{item.name}</Text>
                </View>
                {item.gender === 'male' ? <Ionicons name="male" size={20} color="#3498db" /> : item.gender === 'female' ? <Ionicons name="female" size={20} color="#e74c3c" /> : null}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Giống loài:</Text>
                  <Text style={styles.infoValue}>{translateSpecies(item.species)} {item.breed ? `- ${item.breed}` : ''}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Độ tuổi:</Text>
                  <Text style={styles.infoValue}>{item.age ? `${item.age} năm` : 'Chưa rõ'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cân nặng:</Text>
                  <Text style={styles.infoValue}>{item.weight ? `${item.weight} kg` : 'Chưa rõ'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.historyButton}
                onPress={() => navigation.navigate('MedicalHistoryDoctor', { petId: item._id, petName: item.name })}
              >
                <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.historyButtonText}>Xem lịch sử khám</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={64} color={colors.textLight} style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>Khách hàng chưa có thú cưng nào</Text>
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
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, color: colors.textPrimary, ...FONTS.bold, marginHorizontal: 10 },
    listContainer: { padding: SIZES.spacing.lg, flexGrow: 1 },
    card: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.lg, ...SHADOWS.medium },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 12, marginBottom: 12 },
    petIcon: { fontSize: 24, marginRight: 8 },
    petName: { fontSize: 20, color: colors.textPrimary, ...FONTS.bold },
    cardBody: { marginBottom: 16 },
    infoRow: { flexDirection: 'row', marginBottom: 8 },
    infoLabel: { width: 100, fontSize: SIZES.sm, color: colors.textSecondary },
    infoValue: { flex: 1, fontSize: SIZES.sm, color: colors.textPrimary, ...FONTS.medium },
    historyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '15', paddingVertical: 10, borderRadius: SIZES.radius.base },
    historyButtonText: { color: colors.primary, fontSize: SIZES.md, ...FONTS.bold },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -50 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default CustomerPetsDoctorScreen;
