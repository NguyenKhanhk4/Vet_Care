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
import { removeAccents } from '../../../../shared/utils/stringUtils';

const HomeCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useCustomer();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
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
  
  const getFilteredData = () => {
    if (!searchQuery) return { filteredClinics: clinics, filteredDoctors: doctors, filteredServices: services };
    const query = removeAccents(searchQuery.toLowerCase());
    return {
      filteredClinics: clinics.filter(c => removeAccents(c.name.toLowerCase()).includes(query)),
      filteredDoctors: doctors.filter(d => removeAccents(d.user?.name?.toLowerCase() || '').includes(query)),
      filteredServices: services.filter(s => removeAccents(s.name.toLowerCase()).includes(query))
    };
  };

  const { filteredClinics, filteredDoctors, filteredServices } = getFilteredData();

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clinics, doctors..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { icon: '🏥', label: 'Find Clinic', action: () => navigation.navigate('ExploreCustomer', { type: 'clinics', title: 'All Clinics' }) },
          { icon: '👨‍⚕️', label: 'Find Doctor', action: () => navigation.navigate('ExploreCustomer', { type: 'doctors', title: 'Top Doctors' }) },
          { icon: '📋', label: 'Services', action: () => navigation.navigate('ExploreCustomer', { type: 'services', title: 'Our Services' }) },
          { icon: '📅', label: 'Book Appt', action: () => navigation.navigate('Appointments', { screen: 'BookingCustomer' }) },
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
      {(filteredClinics.length > 0 || !searchQuery) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Clinics</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreCustomer', { type: 'clinics', title: 'All Clinics' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredClinics}
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
      )}

      {/* Doctors Section */}
      {(filteredDoctors.length > 0 || !searchQuery) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Doctors</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreCustomer', { type: 'doctors', title: 'Top Doctors' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredDoctors}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.doctorCard} activeOpacity={0.8}>
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
      )}

      {/* Services Section */}
      {(filteredServices.length > 0 || !searchQuery) && (
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExploreCustomer', { type: 'services', title: 'Our Services' })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {filteredServices.slice(0, 5).map((service) => (
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
      )}
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: { backgroundColor: colors.primary, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.base, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerContent: { flex: 1 },
  welcomeText: { fontSize: SIZES.xl, color: colors.textWhite, ...FONTS.bold, marginBottom: SIZES.spacing.xs },
  bannerSubText: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.85)' },
  bannerEmoji: { fontSize: 48 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.base, borderRadius: SIZES.radius.base, paddingHorizontal: SIZES.spacing.base, ...SHADOWS.light },
  searchIcon: { fontSize: 18, marginRight: SIZES.spacing.sm },
  searchInput: { flex: 1, paddingVertical: SIZES.spacing.md, fontSize: SIZES.base, color: colors.textPrimary },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SIZES.spacing.base, marginTop: SIZES.spacing.lg },
  quickActionItem: { alignItems: 'center', width: 70 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.sm },
  quickActionEmoji: { fontSize: 24 },
  quickActionLabel: { fontSize: SIZES.xs, color: colors.textSecondary, ...FONTS.medium, textAlign: 'center' },
  section: { marginTop: SIZES.spacing.xl },
  lastSection: { marginBottom: SIZES.spacing.xxl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.md },
  sectionTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold },
  seeAll: { fontSize: SIZES.md, color: colors.primary, ...FONTS.medium },
  horizontalList: { paddingHorizontal: SIZES.spacing.base },
  // Clinic Cards
  clinicCard: { width: 220, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, marginRight: SIZES.spacing.md, ...SHADOWS.light, overflow: 'hidden' },
  clinicImagePlaceholder: { height: 100, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center' },
  clinicEmoji: { fontSize: 40 },
  clinicInfo: { padding: SIZES.spacing.md },
  clinicName: { fontSize: SIZES.base, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 4 },
  clinicAddress: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 6 },
  clinicRating: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: SIZES.xs, color: colors.textLight, marginLeft: 4 },
  // Doctor Cards
  doctorCard: { width: 140, backgroundColor: colors.surface, borderRadius: SIZES.radius.base, marginRight: SIZES.spacing.md, padding: SIZES.spacing.md, alignItems: 'center', ...SHADOWS.light },
  doctorAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacing.sm },
  doctorEmoji: { fontSize: 28 },
  doctorName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, textAlign: 'center', marginBottom: 2 },
  doctorSpec: { fontSize: SIZES.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: 4 },
  doctorRating: { marginBottom: 2 },
  doctorExp: { fontSize: SIZES.xs, color: colors.textLight },
  // Service Cards
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, borderRadius: SIZES.radius.base, padding: SIZES.spacing.md, ...SHADOWS.light },
  serviceIcon: { width: 48, height: 48, borderRadius: SIZES.radius.base, backgroundColor: colors.secondaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  serviceEmoji: { fontSize: 24 },
  serviceInfo: { flex: 1, marginRight: SIZES.spacing.sm },
  serviceName: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.semiBold, marginBottom: 2 },
  serviceDesc: { fontSize: SIZES.sm, color: colors.textSecondary },
  servicePrice: { alignItems: 'flex-end' },
  priceText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.bold },
  durationText: { fontSize: SIZES.xs, color: colors.textLight, marginTop: 2 },
});

export default HomeCustomerScreen;
