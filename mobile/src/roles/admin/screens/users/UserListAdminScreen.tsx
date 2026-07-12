import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Modal as RNModal, ScrollView } from 'react-native';
import { Text, Searchbar, useTheme, Card, Avatar, IconButton, Portal, Modal, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import AdminBackButton from '../../components/AdminBackButton';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: string;
  avatar?: string;
  createdAt: string;
}

const UserListAdminScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState(route?.params?.role || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = async (pageNumber = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const params: any = { page: pageNumber, limit: 10, search: searchQuery };
      if (roleFilter) params.role = roleFilter;

      const response = await adminApi.get('/users', { params });
      
      const { users: fetchedUsers, pagination } = response.data.data;

      if (isRefresh || pageNumber === 1) {
        setUsers(fetchedUsers);
      } else {
        setUsers((prev) => [...prev, ...fetchedUsers]);
      }

      setHasMore(pageNumber < pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers(1, false);
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    if (route?.params?.role !== undefined) {
      setRoleFilter(route.params.role);
    }
  }, [route?.params?.role]);

  const onRefresh = useCallback(() => {
    fetchUsers(1, true);
  }, [searchQuery, roleFilter]);

  const loadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchUsers(page + 1);
    }
  };

  const handleToggleStatus = (user: User) => {
    if (user.role === 'admin') {
      Alert.alert('Permission Denied', 'You cannot change the status of an Admin account.');
      return;
    }

    Alert.alert(
      user.isActive ? 'Lock Account' : 'Unlock Account',
      `Are you sure you want to ${user.isActive ? 'lock' : 'unlock'} ${user.name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: user.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await adminApi.put(`/users/${user._id}/status`, { isActive: !user.isActive });
              setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
            } catch (error) {
              Alert.alert('Error', 'Failed to update user status');
            }
          }
        }
      ]
    );
  };

  const openUserDetails = (user: User) => {
    navigation.navigate('UserDetail', { userId: user._id });
  };

  const renderItem = ({ item }: { item: User }) => {
    const isSelfOrAdmin = item.role === 'admin';
    
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => openUserDetails(item)}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Avatar.Icon 
              size={50} 
              icon="account" 
              style={{ backgroundColor: colors.primary + '20' }}
              color={colors.primary} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={[styles.roleBadge, { marginLeft: 0, backgroundColor: item.role === 'admin' ? '#FFEBEE' : item.role === 'doctor' ? '#E3F2FD' : '#F5F5F5' }]}>
                  <Text style={[styles.roleText, { color: item.role === 'admin' ? '#F44336' : item.role === 'doctor' ? '#2196F3' : '#666' }]}>
                    {item.role.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#4CAF50' : '#F44336' }]} />
                <Text style={styles.compactStatusText}>{item.isActive ? 'Active' : 'Locked'}</Text>
              </View>
            </View>
            <IconButton icon="chevron-right" size={24} iconColor="#CCC" onPress={() => openUserDetails(item)} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AdminBackButton navigation={navigation} />
      <View style={styles.header}>
        <Text style={styles.title}>System Users</Text>
        <Text style={styles.subtitle}>Manage all user accounts</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search name, email..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={colors.primary}
          inputStyle={styles.searchInput}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer} contentContainerStyle={styles.chipContent}>
          <Chip
            selected={roleFilter === ''}
            onPress={() => setRoleFilter('')}
            style={styles.chip}
            showSelectedOverlay
          >All</Chip>
          <Chip
            selected={roleFilter === 'admin'}
            onPress={() => setRoleFilter('admin')}
            style={styles.chip}
            showSelectedOverlay
          >Admin</Chip>
          <Chip
            selected={roleFilter === 'doctor'}
            onPress={() => setRoleFilter('doctor')}
            style={styles.chip}
            showSelectedOverlay
          >Doctor</Chip>
          <Chip
            selected={roleFilter === 'customer'}
            onPress={() => setRoleFilter('customer')}
            style={styles.chip}
            showSelectedOverlay
          >Customer</Chip>
        </ScrollView>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && users.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingLeft: 68,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    ...SHADOWS.light,
    zIndex: 10,
  },
  title: {
    fontSize: SIZES.xxl,
    ...FONTS.bold,
    color: '#333',
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 50,
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    fontSize: 15,
  },
  chipContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  chipContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#F0F0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...SHADOWS.light,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: SIZES.md,
    ...FONTS.semiBold,
    color: '#333',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
    marginRight: 4,
  },
  compactStatusText: {
    fontSize: SIZES.xs,
    color: '#666',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 9,
    ...FONTS.bold,
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalUserName: {
    fontSize: SIZES.xl,
    ...FONTS.bold,
    color: '#333',
  },
  modalInfoGroup: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalInfoText: {
    fontSize: SIZES.md,
    color: '#444',
    marginLeft: 12,
  },
  modalActions: {
    alignItems: 'center',
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: SIZES.md,
    color: '#999',
  },
});

export default UserListAdminScreen;
