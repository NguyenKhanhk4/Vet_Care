import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useNotifications } from '../../hooks/useNotifications';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const NotificationDoctorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.rightAction}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {loading ? (
        <LoadingScreen />
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
              <View style={[styles.iconContainer, !item.isRead && styles.iconContainerUnread]}>
                <Text style={styles.icon}>{getIcon(item.type)}</Text>
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.isRead && styles.unreadText]} numberOfLines={1}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState icon="📭" text="Bạn chưa có thông báo nào." />
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacing.lg, paddingTop: 60, backgroundColor: colors.surface, ...SHADOWS.light, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: SIZES.spacing.md },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    rightAction: { minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, color: colors.textPrimary, ...FONTS.bold, marginHorizontal: 10 },
    markAllText: { color: colors.primary, fontSize: SIZES.md, ...FONTS.medium },
    listContainer: { padding: SIZES.spacing.lg },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: SIZES.radius.md, padding: SIZES.spacing.md, marginBottom: SIZES.spacing.md, ...SHADOWS.light, borderWidth: 1, borderColor: 'transparent' },
    unreadCard: { backgroundColor: colors.surface, borderLeftWidth: 4, borderLeftColor: colors.primary, borderColor: colors.surface, ...SHADOWS.medium },
    iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacing.md },
    iconContainerUnread: { backgroundColor: colors.primary + '15' },
    icon: { fontSize: 22 },
    infoContainer: { flex: 1, justifyContent: 'center' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    title: { fontSize: 16, color: colors.textPrimary, ...FONTS.bold, flex: 1, marginRight: 8 },
    unreadText: { color: colors.primaryDark },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
    message: { fontSize: 14, color: colors.textSecondary, marginBottom: 8, lineHeight: 20 },
    timeText: { fontSize: 12, color: colors.textLight, ...FONTS.medium },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyText: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
  });

export default NotificationDoctorScreen;
