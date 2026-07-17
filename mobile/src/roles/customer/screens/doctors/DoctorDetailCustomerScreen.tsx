import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../../shared/utils/api';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

interface DoctorDetail {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  clinic: {
    _id: string;
    name: string;
    address: string;
  };
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
}

const mockReviews = [
  { id: '1', userName: 'John Doe', rating: 5, comment: 'Very professional and caring doctor. Highly recommended!', date: '2026-06-15' },
  { id: '2', userName: 'Alice Smith', rating: 4, comment: 'Great experience, my pet recovered very quickly.', date: '2026-07-02' },
  { id: '3', userName: 'Mike Johnson', rating: 5, comment: 'The doctor explained everything clearly. Excellent service.', date: '2026-07-10' },
];

const RatingStars = ({ rating, size = 16 }: { rating: number, size?: number }) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={{ fontSize: size, color: star <= rating ? '#FFD700' : '#E0E0E0' }}>★</Text>
      ))}
    </View>
  );
};

const DoctorDetailCustomerScreen = ({ route, navigation }: any) => {
  const { doctorId } = route.params;
  const { colors } = useTheme();
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const res = await api.get(`/doctors/${doctorId}`);
      setDoctor(res.data.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Doctor not found</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {doctor.user.avatar ? (
              <Image source={{ uri: doctor.user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>👨‍⚕️</Text>
            )}
          </View>
          <Text style={styles.doctorName}>{doctor.user.name}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{doctor.experience}+</Text>
              <Text style={styles.statLabel}>Years Exp.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.statValue}>{doctor.rating.toFixed(1)}</Text>
                <Text style={{ fontSize: SIZES.sm, color: '#FFD700', marginLeft: 2, marginTop: -4 }}>★</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{mockReviews.length}+</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>
            {doctor.bio || `Dr. ${doctor.user.name} is a highly experienced veterinarian specializing in ${doctor.specialization}. They are dedicated to providing the best care for your pets.`}
          </Text>
        </View>

        {/* Clinic Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working at</Text>
          <View style={styles.clinicCard}>
            <View style={styles.clinicIcon}>
              <Text style={{ fontSize: 24 }}>🏥</Text>
            </View>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>{doctor.clinic.name}</Text>
              <Text style={styles.clinicAddress}>{doctor.clinic.address}</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Feedback</Text>
          {mockReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>{review.userName.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <RatingStars rating={review.rating} size={14} />
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookingCustomer', { doctorId: doctor._id, clinicId: doctor.clinic._id })}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.base,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: { padding: SIZES.spacing.xs },
  backIcon: { fontSize: 24, color: colors.textPrimary, ...FONTS.bold },
  headerTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold },
  headerRight: { width: 30 },
  content: { flex: 1 },
  profileCard: {
    backgroundColor: colors.surface,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: { fontSize: 50 },
  doctorName: {
    fontSize: SIZES.xl,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: SIZES.md,
    color: colors.textSecondary,
    ...FONTS.medium,
    marginBottom: SIZES.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    height: '100%',
  },
  statValue: {
    fontSize: SIZES.lg,
    color: colors.primary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: colors.textSecondary,
    ...FONTS.medium,
  },
  section: {
    padding: SIZES.spacing.base,
    backgroundColor: colors.surface,
    marginTop: SIZES.spacing.sm,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: SIZES.spacing.md,
  },
  bioText: {
    fontSize: SIZES.base,
    color: colors.textSecondary,
    ...FONTS.medium,
    lineHeight: 22,
  },
  clinicCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  clinicIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: SIZES.base,
    color: colors.textPrimary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: SIZES.sm,
    color: colors.textSecondary,
    ...FONTS.medium,
  },
  reviewCard: {
    backgroundColor: colors.background,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  reviewerInitial: {
    fontSize: SIZES.base,
    color: colors.secondaryDark,
    ...FONTS.bold,
  },
  reviewerName: {
    fontSize: SIZES.sm,
    color: colors.textPrimary,
    ...FONTS.bold,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.textLight,
  },
  reviewComment: {
    fontSize: SIZES.sm,
    color: colors.textSecondary,
    ...FONTS.medium,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  bookButtonText: {
    color: colors.textWhite,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
});

export default DoctorDetailCustomerScreen;
