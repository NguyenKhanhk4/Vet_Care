/**
 * HomeCustomerScreen
 * Main dashboard showing banners, clinics, doctors, services, and search
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, RefreshControl, Image,
} from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useCustomer } from '../../context/CustomerContext';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Clinic, Doctor, Service } from '../../../../shared/types';
import RatingStars from '../../../../shared/components/RatingStars';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';

const HomeCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useCustomer();
  const { colors } = useTheme();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [clinicRes, doctorRes, serviceRes] = await Promise.all([
        api.get('/clinics?limit=10'),
        api.get('/doctors?limit=10'),
        api.get('/services?limit=10'),
      ]);
      setClinics(clinicRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
      setServices(serviceRes.data.data || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.bannerSubText}>Find the best care for your pet</Text>
        </View>
        <Text style={styles.bannerEmoji}>🐾</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { icon: '📍', label: 'Nearby', action: () => navigation.navigate('NearbyClinicCustomer') },
          { icon: '🏥', label: 'All Clinics', action: () => navigation.navigate('ClinicListCustomer') },
          { icon: '👨‍⚕️', label: 'Top Doctors', action: () => navigation.navigate('ExploreCustomer', { type: 'doctors', title: 'Top Doctors' }) },
          { icon: '📋', label: 'Services', action: () => navigation.navigate('ExploreCustomer', { type: 'services', title: 'Our Services' }) },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.quickActionItem} onPress={item.action} activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.quickActionLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Clinics Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Clinics</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ExploreCustomer', { type: 'clinics', title: 'All Clinics' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={clinics}
          horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
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
                  <Text style={styles.clinicAddress} numberOfLines={1}>📍 {item.address}</Text>
                  <View style={styles.clinicRating}>
                    <RatingStars rating={item.rating} size={14} />
                    <Text style={styles.reviewCount}>({item.totalReviews})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
      </View>

      {/* Doctors Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ExploreCustomer', { type: 'doctors', title: 'Top Doctors' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={doctors}
          horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.doctorCard} activeOpacity={0.8} onPress={() => navigation.navigate('DoctorDetailCustomer', { doctorId: item._id })}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorEmoji}>👨‍⚕️</Text>
                </View>
                <Text style={styles.doctorName} numberOfLines={1}>{item.user?.name || 'Doctor'}</Text>
                <Text style={styles.doctorSpec} numberOfLines={1}>{item.specialization}</Text>
                <View style={styles.doctorRating}>
                  <RatingStars rating={item.rating} size={12} />
                </View>
                <Text style={styles.doctorExp}>{item.experience} yrs exp</Text>
              </TouchableOpacity>
            )}
          />
      </View>

      {/* Services Section */}
      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ExploreCustomer', { type: 'services', title: 'Our Services' })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {services.slice(0, 5).map((service) => (
            <TouchableOpacity
              key={service._id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('ServiceCustomer', { serviceId: service._id })}
              activeOpacity={0.8}
            >
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceEmoji}>
                  {service.category === 'checkup' ? '🩺' : service.category === 'vaccination' ? '💉' : service.category === 'surgery' ? '🔬' : service.category === 'grooming' ? '✂️' : service.category === 'dental' ? '🦷' : service.category === 'emergency' ? '🚨' : service.category === 'laboratory' ? '🧪' : '📋'}
                </Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc} numberOfLines={1}>{service.description}</Text>
              </View>
              <View style={styles.servicePrice}>
                <Text style={styles.priceText}>{formatPrice(service.price)}</Text>
                <Text style={styles.durationText}>{service.duration} min</Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: { backgroundColor: colors.primary, marginHorizontal: SIZES.spacing.xl, marginTop: SIZES.spacing.xl, borderRadius: SIZES.radius.xl, padding: SIZES.spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOWS.medium },
  bannerContent: { flex: 1 },
  welcomeText: { fontSize: SIZES.xl, color: colors.textWhite, ...FONTS.bold, marginBottom: SIZES.spacing.xs },
  bannerSubText: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.85)' },
  bannerEmoji: { fontSize: 48 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SIZES.spacing.xl, marginTop: SIZES.spacing.xl },
  quickActionItem: { alignItems: 'center', width: 70 },
  quickActionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  quickActionEmoji: { fontSize: 24 },
  quickActionLabel: { fontSize: SIZES.xs, color: colors.textSecondary, ...FONTS.medium, textAlign: 'center' },
  section: { marginTop: SIZES.spacing.xl + 10 },
  lastSection: { marginBottom: SIZES.spacing.xxl + 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: SIZES.spacing.xl, marginBottom: SIZES.spacing.md },
  sectionTitle: { fontSize: SIZES.xl, color: colors.textPrimary, ...FONTS.bold },
  seeAll: { fontSize: SIZES.md, color: colors.primary, ...FONTS.semiBold, paddingBottom: 2 },
  horizontalList: { paddingHorizontal: SIZES.spacing.xl, paddingBottom: SIZES.spacing.sm },
  // Clinic Cards
  clinicCard: { width: 240, backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, marginRight: SIZES.spacing.md, ...SHADOWS.light, overflow: 'hidden' },
  clinicImagePlaceholder: { height: 120, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center' },
  clinicEmoji: { fontSize: 48 },
  clinicInfo: { padding: SIZES.spacing.md },
  clinicName: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 4 },
  clinicAddress: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 6 },
  clinicRating: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: SIZES.xs, color: colors.textLight, marginLeft: 4 },
  // Doctor Cards
  doctorCard: { width: 150, backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, marginRight: SIZES.spacing.md, padding: SIZES.spacing.lg, alignItems: 'center', ...SHADOWS.light },
  doctorAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.md, ...SHADOWS.light },
  doctorEmoji: { fontSize: 32 },
  doctorName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, textAlign: 'center', marginBottom: 2 },
  doctorSpec: { fontSize: SIZES.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  doctorRating: { marginBottom: 2 },
  doctorExp: { fontSize: SIZES.xs, color: colors.textLight },
  // Service Cards
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.xl, marginBottom: SIZES.spacing.md, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md, ...SHADOWS.light },
  serviceIcon: { width: 56, height: 56, borderRadius: SIZES.radius.round, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  serviceEmoji: { fontSize: 28 },
  serviceInfo: { flex: 1, marginRight: SIZES.spacing.sm },
  serviceName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 2 },
  serviceDesc: { fontSize: SIZES.sm, color: colors.textSecondary },
  servicePrice: { alignItems: 'flex-end' },
  priceText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
  durationText: { fontSize: SIZES.xs, color: colors.textLight, marginTop: 2 },
});

export default HomeCustomerScreen;
