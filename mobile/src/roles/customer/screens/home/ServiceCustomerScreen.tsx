/**
 * ServiceCustomerScreen
 * Displays service details with price, duration, and clinic info
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Service } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const CATEGORY_ICONS: Record<string, string> = {
  checkup: '🩺', vaccination: '💉', surgery: '🔬', grooming: '✂️',
  dental: '🦷', emergency: '🚨', laboratory: '🧪', other: '📋',
};

const ServiceCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => { fetchService(); }, [serviceId]);

  const fetchService = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/services/${serviceId}`);
      setService(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load service');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchService} />;
  if (!service) return <ErrorMessage message="Service not found" />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{CATEGORY_ICONS[service.category] || '📋'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{service.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{service.category}</Text>
        </View>
        <Text style={styles.description}>{service.description}</Text>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>{service.price.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{service.duration} min</Text>
          </View>
        </View>

        {service.clinic && (
          <>
            <View style={styles.divider} />
            <View style={styles.clinicSection}>
              <Text style={styles.clinicLabel}>Available at</Text>
              <TouchableOpacity style={styles.clinicCard} onPress={() => navigation.navigate('ClinicDetailCustomer', { clinicId: typeof service.clinic === 'string' ? service.clinic : service.clinic._id })}>
                <Text style={styles.clinicEmoji}>🏥</Text>
                <View>
                  <Text style={styles.clinicName}>{typeof service.clinic === 'string' ? 'Clinic' : service.clinic.name}</Text>
                  <Text style={styles.clinicAddress}>{typeof service.clinic === 'string' ? '' : service.clinic.address}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookingCustomer', { 
          serviceId: service._id, 
          clinicId: typeof service.clinic === 'string' ? service.clinic : (service.clinic as any)._id 
        })}
        activeOpacity={0.8}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  iconContainer: { alignItems: 'center', paddingVertical: SIZES.spacing.xxl, backgroundColor: colors.secondaryLight },
  icon: { fontSize: 80 },
  card: { backgroundColor: colors.surface, margin: SIZES.spacing.base, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.xl, ...SHADOWS.medium },
  name: { fontSize: SIZES.xxl, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.sm },
  categoryBadge: { backgroundColor: colors.primaryLight, paddingVertical: 4, paddingHorizontal: 12, borderRadius: SIZES.radius.round, alignSelf: 'flex-start', marginBottom: SIZES.spacing.base },
  categoryText: { color: colors.primaryDark, fontSize: SIZES.sm, ...FONTS.medium, textTransform: 'capitalize' },
  description: { fontSize: SIZES.base, color: colors.textSecondary, lineHeight: 24 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: SIZES.spacing.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-around' },
  detailItem: { alignItems: 'center' },
  detailLabel: { fontSize: SIZES.sm, color: colors.textLight, marginBottom: 4 },
  detailValue: { fontSize: SIZES.xl, color: colors.primary, ...FONTS.bold },
  clinicSection: {},
  clinicLabel: { fontSize: SIZES.md, color: colors.textLight, marginBottom: SIZES.spacing.sm },
  clinicCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md },
  clinicEmoji: { fontSize: 32, marginRight: SIZES.spacing.md },
  clinicName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold },
  clinicAddress: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 2 },
  bookButton: { backgroundColor: colors.primary, margin: SIZES.spacing.base, marginBottom: SIZES.spacing.xxl, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', ...SHADOWS.medium },
  bookButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
});

export default ServiceCustomerScreen;
