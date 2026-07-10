import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Clinic, Doctor, Service } from '../../../../shared/types';
import RatingStars from '../../../../shared/components/RatingStars';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const ExploreCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { type, title } = route.params; // 'clinics' | 'doctors' | 'services'
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    navigation.setOptions({ title: title || 'Explore' });
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/${type}?limit=50`);
      setData(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to load ${type}`);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const styles = getStyles(colors);

  const renderClinic = ({ item }: { item: Clinic }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() => navigation.navigate('ClinicDetailCustomer', { clinicId: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles.clinicImagePlaceholder}>
        <Text style={styles.clinicEmoji}>🏥</Text>
      </View>
      <View style={styles.clinicInfo}>
        <Text style={styles.clinicName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.clinicAddress} numberOfLines={2}>📍 {item.address}</Text>
        <View style={styles.clinicRating}>
          <RatingStars rating={item.rating} size={14} />
          <Text style={styles.reviewCount}>({item.totalReviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <TouchableOpacity style={styles.doctorCard} activeOpacity={0.8}>
      <View style={styles.doctorAvatar}>
        <Text style={styles.doctorEmoji}>👨‍⚕️</Text>
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName} numberOfLines={1}>{item.user?.name || 'Doctor'}</Text>
        <Text style={styles.doctorSpec} numberOfLines={1}>{item.specialization}</Text>
        <View style={styles.doctorRating}>
          <RatingStars rating={item.rating} size={14} />
          <Text style={styles.reviewCount}>({item.totalReviews || 0})</Text>
        </View>
        <Text style={styles.doctorExp}>{item.experience} yrs exp</Text>
      </View>
    </TouchableOpacity>
  );

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceCustomer', { serviceId: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles.serviceIcon}>
        <Text style={styles.serviceEmoji}>
          {item.category === 'checkup' ? '🩺' : item.category === 'vaccination' ? '💉' : item.category === 'surgery' ? '🔬' : item.category === 'grooming' ? '✂️' : item.category === 'dental' ? '🦷' : item.category === 'emergency' ? '🚨' : item.category === 'laboratory' ? '🧪' : '📋'}
        </Text>
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDesc} numberOfLines={2}>{item.description}</Text>
      </View>
      <View style={styles.servicePriceContainer}>
        <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
        <Text style={styles.durationText}>{item.duration} min</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => {
    if (type === 'clinics') return renderClinic({ item });
    if (type === 'doctors') return renderDoctor({ item });
    return renderService({ item });
  };

  if (isLoading) return <LoadingSpinner message={`Loading ${type}...`} />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {type} found.</Text>
          </View>
        }
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContainer: { padding: SIZES.spacing.base },
  emptyContainer: { padding: SIZES.spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: SIZES.base, color: colors.textSecondary },
  
  // Clinic Cards
  clinicCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, marginBottom: SIZES.spacing.md, ...SHADOWS.light, overflow: 'hidden' },
  clinicImagePlaceholder: { width: 100, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center' },
  clinicEmoji: { fontSize: 40 },
  clinicInfo: { flex: 1, padding: SIZES.spacing.md },
  clinicName: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 4 },
  clinicAddress: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 8 },
  clinicRating: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: SIZES.xs, color: colors.textLight, marginLeft: 4 },
  
  // Doctor Cards
  doctorCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, marginBottom: SIZES.spacing.md, padding: SIZES.spacing.md, alignItems: 'center', ...SHADOWS.light },
  doctorAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  doctorEmoji: { fontSize: 32 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 2 },
  doctorSpec: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
  doctorRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  doctorExp: { fontSize: SIZES.xs, color: colors.textLight },
  
  // Service Cards
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginBottom: SIZES.spacing.md, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, ...SHADOWS.light },
  serviceIcon: { width: 56, height: 56, borderRadius: SIZES.radius.base, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  serviceEmoji: { fontSize: 28 },
  serviceInfo: { flex: 1, marginRight: SIZES.spacing.sm },
  serviceName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 4 },
  serviceDesc: { fontSize: SIZES.sm, color: colors.textSecondary },
  servicePriceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
  durationText: { fontSize: SIZES.xs, color: colors.textLight, marginTop: 4 },
});

export default ExploreCustomerScreen;
