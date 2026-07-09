/**
 * NotificationCustomerScreen
 * Displays all notifications with read/unread indicators
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';
import { Notification, NotificationType } from '../../../../shared/types';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import EmptyState from '../../../../shared/components/EmptyState';

const TYPE_ICONS: Record<NotificationType, string> = {
  booking: '📅', payment: '💳', reminder: '⏰', completion: '✅',
};

const NotificationCustomerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { colors } = useTheme();

  useFocusEffect(useCallback(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=50');
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) { console.error('Error:', error); }
      finally { setIsLoading(false); }
    };
    fetchNotifications();
  }, []));

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) { console.error('Error marking all read:', error); }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) { console.error('Error:', error); }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const styles = getStyles(colors);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead} activeOpacity={0.7}>
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No Notifications" message="You're all caught up!" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
              onPress={() => handleMarkRead(item._id)}
              activeOpacity={0.8}
            >
              <View style={styles.notifIcon}>
                <Text style={styles.iconEmoji}>{TYPE_ICONS[item.type] || '📋'}</Text>
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  markAllButton: { backgroundColor: colors.surface, padding: SIZES.spacing.md, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.divider },
  markAllText: { fontSize: SIZES.md, color: colors.primary, ...FONTS.medium },
  listContent: { padding: SIZES.spacing.base },
  notifCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.base, padding: SIZES.spacing.base, marginBottom: SIZES.spacing.sm, ...SHADOWS.light },
  notifCardUnread: { backgroundColor: colors.secondaryLight, borderLeftWidth: 3, borderLeftColor: colors.primary },
  notifIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
  iconEmoji: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: SIZES.md, color: colors.textPrimary, ...FONTS.medium, flex: 1 },
  notifTitleUnread: { ...FONTS.bold },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: SIZES.spacing.sm },
  notifMessage: { fontSize: SIZES.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: SIZES.xs, color: colors.textLight, marginTop: 6 },
});

export default NotificationCustomerScreen;
