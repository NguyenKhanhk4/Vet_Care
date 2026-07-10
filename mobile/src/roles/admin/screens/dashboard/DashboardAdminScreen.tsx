import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import adminApi from '../../utils/adminApi';

const { width } = Dimensions.get('window');

const DashboardAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await adminApi.get('/dashboard');
      if (response.data?.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { overview, recentNotifications, charts } = dashboardData || {};

  const StatCard = ({ title, value, icon, color, bgColor, onPress }: any) => (
    <Card style={[styles.statCard, { backgroundColor: colors.surface, ...SHADOWS.light }]} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <View>
          <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
        </View>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon name={icon} size={28} color={color} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>System Overview</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Starts</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Customers"
            value={overview?.totalCustomers || 0}
            icon="account-group"
            color="#2196F3"
            bgColor="#E3F2FD"
            onPress={() => navigation.navigate('Users', { role: 'customer' })}
          />
          <StatCard
            title="Appointments"
            value={overview?.totalAppointments || 0}
            icon="calendar-check"
            color="#FF9800"
            bgColor="#FFF3E0"
            onPress={() => navigation.navigate('Appointments')}
          />
          <StatCard
            title="Doctors"
            value={overview?.totalDoctors || 0}
            icon="doctor"
            color="#4CAF50"
            bgColor="#E8F5E9"
            onPress={() => navigation.navigate('Users', { role: 'doctor' })}
          />
          <StatCard
            title="Pets"
            value={overview?.totalPets || 0}
            icon="paw"
            color="#9C27B0"
            bgColor="#F3E5F5"
            onPress={() => navigation.navigate('Users', { role: 'customer' })}
          />
          <StatCard
            title="Clinics"
            value={overview?.totalClinics || 0}
            icon="hospital-building"
            color="#E91E63"
            bgColor="#FCE4EC"
            onPress={() => navigation.navigate('Clinics')}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(overview?.totalRevenue)}
            icon="cash-multiple"
            color="#009688"
            bgColor="#E0F2F1"
          />
        </View>

        {/* Recent Notifications */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
            Thông báo gần đây
          </Text>
          <Text
            style={[styles.seeAllText, { color: colors.primary }]}
            onPress={() => navigation.navigate('NotificationList')}
          >
            Xem tất cả
          </Text>
        </View>

        <View style={styles.notificationBox}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
          >
            {recentNotifications?.length > 0 ? (
              recentNotifications.slice(0, 5).map((noti: any) => (
                <View key={noti._id} style={[styles.notiItem, { borderBottomColor: colors.divider || '#EEE' }]}>
                  <View style={styles.notiLeft}>
                    <View style={[styles.notiDot, { backgroundColor: noti.isRead ? '#4CAF50' : '#FF9800' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.notiTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {noti.title}
                      </Text>
                      <Text style={[styles.notiMsg, { color: colors.textSecondary }]} numberOfLines={2}>
                        {noti.message}
                      </Text>
                      <Text style={[styles.notiMeta, { color: colors.textLight }]}>
                        {noti.user?.name || 'Hệ thống'} · {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.notiBadge, { backgroundColor: noti.isRead ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={[styles.notiBadgeText, { color: noti.isRead ? '#4CAF50' : '#FF9800' }]}>
                      {noti.isRead ? 'Đã đọc' : 'Mới'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.notiEmpty}>
                <Icon name="bell-off-outline" size={40} color="#CCC" />
                <Text style={{ color: colors.textLight, marginTop: 8 }}>Chưa có thông báo</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    marginBottom: SIZES.spacing.md,
  },
  headerTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xxxl,
    color: '#fff',
  },
  headerSubtitle: {
    ...FONTS.regular,
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
    paddingBottom: 100, // padding for bottom tabs
  },
  revenueCard: {
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.xl,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  revenueLabel: {
    ...FONTS.medium,
    fontSize: SIZES.base,
    color: '#fff',
    marginLeft: SIZES.spacing.sm,
  },
  revenueAmount: {
    ...FONTS.bold,
    fontSize: SIZES.title,
    color: '#fff',
    marginTop: SIZES.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.lg,
    marginBottom: SIZES.spacing.md,
  },
  seeAllText: {
    ...FONTS.medium,
    fontSize: SIZES.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - SIZES.spacing.lg * 2 - SIZES.spacing.md) / 2,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  statTitle: {
    ...FONTS.medium,
    fontSize: SIZES.xs,
    textTransform: 'uppercase',
  },
  statValue: {
    ...FONTS.bold,
    fontSize: SIZES.xxl,
    marginTop: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCard: {
    marginBottom: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
  },
  appointmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
  },
  appointmentLeft: {
    flex: 1,
  },
  customerName: {
    ...FONTS.semiBold,
    fontSize: SIZES.base,
    marginBottom: 2,
  },
  petName: {
    ...FONTS.regular,
    fontSize: SIZES.sm,
  },
  serviceName: {
    ...FONTS.medium,
    fontSize: SIZES.sm,
    marginTop: 4,
  },
  appointmentRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
  },
  statusText: {
    ...FONTS.bold,
    fontSize: 10,
  },
  dateText: {
    ...FONTS.regular,
    fontSize: SIZES.xs,
  },
  emptyText: {
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: SIZES.spacing.xl,
  },
  notificationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 320,
    overflow: 'hidden',
    ...SHADOWS.small,
    marginBottom: SIZES.spacing.xl,
  },
  notiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  notiLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 10,
  },
  notiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 10,
  },
  notiTitle: {
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
    marginBottom: 2,
  },
  notiMsg: {
    fontSize: SIZES.xs,
    lineHeight: 16,
  },
  notiMeta: {
    fontSize: 10,
    marginTop: 4,
  },
  notiBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  notiBadgeText: {
    fontSize: 9,
    ...FONTS.bold,
  },
  notiEmpty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
});

export default DashboardAdminScreen;
