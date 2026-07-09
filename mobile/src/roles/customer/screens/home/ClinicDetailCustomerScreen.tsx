/**
 * ClinicDetailCustomerScreen
 * Displays detailed clinic information with doctors and services
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Clinic, Doctor, Service } from '../../../../shared/types';
import RatingStars from '../../../../shared/components/RatingStars';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const ClinicDetailCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { clinicId } = route.params;
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    fetchClinicData();
  }, [clinicId]);

  const fetchClinicData = async () => {
    try {
      setIsLoading(true);
      const [clinicRes, doctorRes, serviceRes] = await Promise.all([
        api.get(`/clinics/${clinicId}`),
        api.get(`/doctors?clinicId=${clinicId}`),
        api.get(`/services?clinicId=${clinicId}`),
      ]);
      setClinic(clinicRes.data.data);
      setDoctors(doctorRes.data.data || []);
      setServices(serviceRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clinic details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchClinicData} />;
  if (!clinic) return <ErrorMessage message="Clinic not found" />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Clinic Header */}
      <View style={styles.header}>
        <View style={styles.headerImage}><Text style={styles.headerEmoji}>🏥</Text></View>
        <View style={styles.headerInfo}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={clinic.rating} size={16} showValue />
            <Text style={styles.reviewCount}>({clinic.totalReviews} reviews)</Text>
          </View>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        {[
          { icon: '📍', label: 'Address', value: clinic.address },
          { icon: '📞', label: 'Phone', value: clinic.phone },
          { icon: '🕐', label: 'Hours', value: clinic.openingHours },
          { icon: '📧', label: 'Email', value: clinic.email || 'N/A' },
        ].map((item, index) => (
          <View key={index} style={styles.infoRow}>
            <Text style={styles.infoIcon}>{item.icon}</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Description */}
      {clinic.description ? (
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{clinic.description}</Text>
        </View>
      ) : null}

      {/* Doctors */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Top Doctors ({doctors.length})</Text>
        {doctors.map((doctor) => (
          <View key={doctor._id} style={styles.doctorCard}>
            <View style={styles.doctorAvatar}><Text style={styles.avatarEmoji}>👨‍⚕️</Text></View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.user?.name || 'Doctor'}</Text>
              <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
              <RatingStars rating={doctor.rating} size={12} />
            </View>
            <Text style={styles.expText}>{doctor.experience}yr</Text>
          </View>
        ))}
      </View>

      {/* Services */}
      <View style={[styles.listSection, styles.lastSection]}>
        <Text style={styles.sectionTitle}>All Services ({services.length})</Text>
        {services.map((service) => (
          <TouchableOpacity key={service._id} style={styles.serviceCard} onPress={() => navigation.navigate('ServiceCustomer', { serviceId: service._id })} activeOpacity={0.7}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc} numberOfLines={1}>{service.description}</Text>
            </View>
            <View style={styles.servicePriceContainer}>
              <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
              <Text style={styles.serviceDuration}>{service.duration} min</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Book Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookingCustomer', { clinicId: clinic._id })}
        activeOpacity={0.8}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, padding: SIZES.spacing.xl, ...SHADOWS.light },
  headerImage: { height: 140, backgroundColor: colors.secondaryLight, borderRadius: SIZES.radius.base, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.base },
  headerEmoji: { fontSize: 64 },
  headerInfo: {},
  clinicName: { fontSize: SIZES.xxl, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: SIZES.sm, color: colors.textLight, marginLeft: SIZES.spacing.sm },
  infoSection: { backgroundColor: colors.surface, margin: SIZES.spacing.base, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, ...SHADOWS.light },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SIZES.spacing.sm },
  infoIcon: { fontSize: 18, marginRight: SIZES.spacing.md, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: SIZES.sm, color: colors.textLight, marginBottom: 2 },
  infoValue: { fontSize: SIZES.md, color: colors.textPrimary },
  descSection: { backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, ...SHADOWS.light },
  sectionTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.md },
  description: { fontSize: SIZES.md, color: colors.textSecondary, lineHeight: 22 },
  listSection: { marginTop: SIZES.spacing.base, marginHorizontal: SIZES.spacing.base },
  lastSection: { marginBottom: SIZES.spacing.base },
  doctorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  doctorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  avatarEmoji: { fontSize: 24 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 2 },
  doctorSpec: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 4 },
  expText: { fontSize: SIZES.sm, color: colors.primary, ...FONTS.medium },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  serviceInfo: { flex: 1, marginRight: SIZES.spacing.sm },
  serviceName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 2 },
  serviceDesc: { fontSize: SIZES.sm, color: colors.textSecondary },
  servicePriceContainer: { alignItems: 'flex-end' },
  servicePrice: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
  serviceDuration: { fontSize: SIZES.xs, color: colors.textLight, marginTop: 2 },
  bookButton: { backgroundColor: colors.primary, margin: SIZES.spacing.base, marginBottom: SIZES.spacing.xxl, borderRadius: SIZES.radius.base, paddingVertical: SIZES.spacing.base, alignItems: 'center', ...SHADOWS.medium },
  bookButtonText: { color: colors.textWhite, fontSize: SIZES.lg, ...FONTS.semiBold },
});

export default ClinicDetailCustomerScreen;
