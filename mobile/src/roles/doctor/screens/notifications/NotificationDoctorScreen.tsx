import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useNotifications } from '../../hooks/useNotifications';
import LoadingScreen from '../../components/LoadingScreen';
import EmptyState from '../../components/EmptyState';

const NotificationDoctorScreen: React.FC = () => {
  const { colors } = useTheme();
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

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
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
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
              style={[styles.card, !item.read && styles.unreadCard]}
              onPress={() => markAsRead(item._id)}
              disabled={item.read}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon(item.type)}</Text>
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.message}>{item.message}</Text>
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
