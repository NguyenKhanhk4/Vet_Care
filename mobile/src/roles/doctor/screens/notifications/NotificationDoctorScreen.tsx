import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';

const NotificationDoctorScreen: React.FC = () => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await doctorApi.get('/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await doctorApi.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await doctorApi.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'payment': return '💳';
      case 'reminder': return '⏰';
      case 'completion': return '✅';
      default: return '🔔';
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.isRead && styles.unreadCard]}
              onPress={() => markAsRead(item._id)}
              disabled={item.isRead}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon(item.type)}</Text>
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Bạn chưa có thông báo nào.</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacing.lg, backgroundColor: colors.surface, paddingTop: Platform.OS === 'ios' ? 60 : 20, ...SHADOWS.light },
    headerTitle: { fontSize: SIZES.title, color: colors.textPrimary, ...FONTS.bold },
    markAllText: { color: colors.primary, fontSize: SIZES.md, ...FONTS.medium },
    listContainer: { padding: SIZES.spacing.lg },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.md, ...SHADOWS.light },
    unreadCard: { backgroundColor: colors.primary + '10', borderColor: colors.primary, borderWidth: 1 },
    iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
    icon: { fontSize: 24 },
    infoContainer: { flex: 1, justifyContent: 'center' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    title: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.bold, flex: 1 },
    unreadText: { color: colors.primary },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
    message: { fontSize: SIZES.sm, color: colors.textSecondary, marginBottom: 6, lineHeight: 20 },
    timeText: { fontSize: 12, color: colors.textLight, ...FONTS.medium },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default NotificationDoctorScreen;
