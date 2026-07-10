import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { format } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  user?: { name: string; role: string };
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  booking:     { icon: 'calendar-check',    color: '#2196F3', bg: '#E3F2FD' },
  payment:     { icon: 'cash-multiple',     color: '#4CAF50', bg: '#E8F5E9' },
  reminder:    { icon: 'bell-outline',      color: '#FF9800', bg: '#FFF3E0' },
  completion:  { icon: 'check-circle-outline', color: '#9C27B0', bg: '#F3E5F5' },
};

const DEFAULT_CONFIG = { icon: 'bell-outline', color: '#666', bg: '#F5F5F5' };

const NotificationListAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 10;

  const fetchNotifications = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await adminApi.get('/notifications', {
        params: { page: pageNumber, limit: LIMIT },
      });
      const data = response.data.data;
      const fetched: Notification[] = data.notifications || data || [];
      const total = data.pagination?.total || fetched.length;

      if (isRefresh || pageNumber === 1) {
        setNotifications(fetched);
      } else {
        setNotifications(prev => [...prev, ...fetched]);
      }
      setHasMore(pageNumber * LIMIT < total);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const onRefresh = useCallback(() => {
    fetchNotifications(1, true);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchNotifications(page + 1);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const cfg = TYPE_CONFIG[item.type] || DEFAULT_CONFIG;
    let dateStr = '';
    try { dateStr = format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm'); } catch (e) {}

    return (
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardRow}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
            <Icon name={cfg.icon} size={22} color={cfg.color} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
            <View style={styles.meta}>
              <Text style={[styles.user, { color: colors.textLight }]}>{item.user?.name || 'Hệ thống'}</Text>
              <Text style={[styles.date, { color: colors.textLight }]}>{dateStr}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: item.isRead ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: item.isRead ? '#4CAF50' : '#FF9800' }]}>
              {item.isRead ? 'Đã đọc' : 'Mới'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo hệ thống</Text>
        <Text style={styles.headerSub}>Tất cả các hoạt động gần đây</Text>
      </View>

      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.center}>
              <Icon name="bell-off-outline" size={60} color="#CCC" />
              <Text style={[styles.emptyText, { color: colors.textLight }]}>Chưa có thông báo nào</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && notifications.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: SIZES.xxl, ...FONTS.bold, color: '#333' },
  headerSub: { fontSize: SIZES.sm, color: '#666', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: { flex: 1 },
  title: { fontSize: SIZES.md, ...FONTS.semiBold, marginBottom: 2 },
  message: { fontSize: SIZES.sm, lineHeight: 18 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  user: { fontSize: SIZES.xs },
  date: { fontSize: SIZES.xs },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    minWidth: 44,
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, ...FONTS.bold },
  emptyText: { marginTop: 12, fontSize: SIZES.md },
});

export default NotificationListAdminScreen;
