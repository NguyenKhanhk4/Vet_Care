import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { format } from 'date-fns';

import adminApi from '../../utils/adminApi';
import { FONTS, SHADOWS, SIZES } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actor?: { name: string; role: string; email?: string };
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  booking: { icon: 'calendar-check', color: '#2196F3', bg: '#E3F2FD' },
  payment: { icon: 'cash-multiple', color: '#4CAF50', bg: '#E8F5E9' },
  reminder: { icon: 'bell-outline', color: '#FF9800', bg: '#FFF3E0' },
  completion: { icon: 'check-circle-outline', color: '#9C27B0', bg: '#F3E5F5' },
};

const DEFAULT_CONFIG = { icon: 'bell-outline', color: '#666', bg: '#F5F5F5' };
const LIMIT = 10;
const POLLING_INTERVAL_MS = 15000;

const NotificationListAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);

  const fetchNotifications = async (pageNumber = 1, isRefresh = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      if (isRefresh) setRefreshing(true);

      const response = await adminApi.get('/notifications', {
        params: { page: pageNumber, limit: LIMIT },
      });
      const data = response.data.data;
      const fetched: Notification[] = data.notifications || [];
      const total = data.pagination?.total ?? fetched.length;

      setNotifications(previous => (
        isRefresh || pageNumber === 1 ? fetched : [...previous, ...fetched]
      ));
      setHasMore(pageNumber * LIMIT < total);
      setPage(pageNumber);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
    const refreshInterval = setInterval(() => fetchNotifications(1), POLLING_INTERVAL_MS);

    return () => clearInterval(refreshInterval);
  }, []);

  const onRefresh = useCallback(() => {
    fetchNotifications(1, true);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchNotifications(page + 1);
    }
  };

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await adminApi.put(`/notifications/${notification._id}/read`);
      setNotifications(previous => previous.map(item => (
        item._id === notification._id ? { ...item, isRead: true } : item
      )));
      setUnreadCount(previous => Math.max(0, previous - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi.put('/notifications/read-all');
      setNotifications(previous => previous.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type] || DEFAULT_CONFIG;
    let dateTime = '';
    try {
      dateTime = format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss');
    } catch {
      dateTime = item.createdAt;
    }

    return (
      <Card
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => markAsRead(item)}
      >
        <View style={styles.cardRow}>
          <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
            <Icon name={config.icon as any} size={22} color={config.color} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={3}>{item.message}</Text>
            <View style={styles.meta}>
              <Text style={[styles.user, { color: colors.textLight }]}>{item.actor?.name || 'Hệ thống'}</Text>
              <Text style={[styles.date, { color: colors.textLight }]}>{dateTime}</Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            accessibilityLabel="Quay lại Dashboard"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Thông báo hệ thống</Text>
            <Text style={styles.headerSub}>Cập nhật tự động mỗi 15 giây</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.readAllButton}>
              <Text style={styles.readAllText}>Đọc tất cả ({unreadCount})</Text>
            </TouchableOpacity>
          )}
        </View>
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
              <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 4, marginRight: 8 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: SIZES.xxl, ...FONTS.bold, color: '#333' },
  headerSub: { fontSize: SIZES.sm, color: '#666', marginTop: 4 },
  readAllButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#E8F5E9' },
  readAllText: { color: '#2E7D32', fontSize: SIZES.xs, ...FONTS.semiBold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  list: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 10, borderRadius: 12, ...SHADOWS.light },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  textWrap: { flex: 1 },
  title: { fontSize: SIZES.md, ...FONTS.semiBold, marginBottom: 2 },
  message: { fontSize: SIZES.sm, lineHeight: 18 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, gap: 8 },
  user: { fontSize: SIZES.xs, flex: 1 },
  date: { fontSize: SIZES.xs },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', minWidth: 44, alignItems: 'center' },
  badgeText: { fontSize: 10, ...FONTS.bold },
  emptyText: { marginTop: 12, fontSize: SIZES.md },
  footerLoader: { margin: 20 },
});

export default NotificationListAdminScreen;
