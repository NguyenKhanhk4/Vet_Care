import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Avatar, Button, Divider, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { format } from 'date-fns';

const UserDetailAdminScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { userId } = route.params;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`/users/${userId}`);
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    if (user.role === 'admin') {
      Alert.alert('Permission Denied', 'You cannot change the status of an Admin account.');
      return;
    }

    Alert.alert(
      user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      `Bạn có chắc chắn muốn ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản của ${user.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: user.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await adminApi.put(`/users/${user._id}/status`, { isActive: !user.isActive });
              setUser({ ...user, isActive: !user.isActive });
            } catch (error) {
              Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.text} style={{ alignSelf: 'flex-start', marginLeft: -8 }}>
            Quay lại
          </Button>
          <Text style={styles.title}>Chi tiết người dùng</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.text} style={{ alignSelf: 'flex-start', marginLeft: -8 }}>
            Quay lại
          </Button>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Không tìm thấy người dùng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.text} style={{ alignSelf: 'flex-start', marginLeft: -8 }}>
          Quay lại
        </Button>
        <Text style={styles.title}>Chi tiết người dùng</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.profileHeader}>
              <Avatar.Icon 
                size={70} 
                icon="account" 
                style={{ backgroundColor: colors.primary + '20' }}
                color={colors.primary} 
              />
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.name}>{user.name}</Text>
                <View style={styles.badgeContainer}>
                  <Chip 
                    style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#FFEBEE' : user.role === 'doctor' ? '#E3F2FD' : '#F5F5F5' }]}
                    textStyle={{ color: user.role === 'admin' ? '#F44336' : user.role === 'doctor' ? '#2196F3' : '#666', fontSize: 12, ...FONTS.bold }}
                  >
                    {user.role.toUpperCase()}
                  </Chip>
                  <Chip 
                    style={[styles.statusBadge, { backgroundColor: user.isActive ? '#E8F5E9' : '#FFEBEE' }]}
                    textStyle={{ color: user.isActive ? '#4CAF50' : '#F44336', fontSize: 12, ...FONTS.bold }}
                  >
                    {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                  </Chip>
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Icon name="email-outline" size={22} color="#666" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="phone-outline" size={22} color="#666" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoText}>{user.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="map-marker-outline" size={22} color="#666" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoText}>{user.address || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="calendar-outline" size={22} color="#666" style={styles.icon} />
              <View>
                <Text style={styles.infoLabel}>Ngày tạo</Text>
                <Text style={styles.infoText}>{user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Doctor Details */}
        {user.role === 'doctor' && user.doctorProfile && (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Thông tin Bác sĩ</Text>
              <Divider style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Icon name="stethoscope" size={22} color="#666" style={styles.icon} />
                <View>
                  <Text style={styles.infoLabel}>Chuyên khoa</Text>
                  <Text style={styles.infoText}>{user.doctorProfile.specialization || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="briefcase-outline" size={22} color="#666" style={styles.icon} />
                <View>
                  <Text style={styles.infoLabel}>Kinh nghiệm</Text>
                  <Text style={styles.infoText}>{user.doctorProfile.experience ? `${user.doctorProfile.experience} năm` : 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="hospital-building" size={22} color="#666" style={styles.icon} />
                <View>
                  <Text style={styles.infoLabel}>Phòng khám</Text>
                  <Text style={styles.infoText}>{user.doctorProfile.clinic?.name || 'N/A'}</Text>
                  <Text style={styles.infoSubText}>{user.doctorProfile.clinic?.address || ''}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="card-text-outline" size={22} color="#666" style={styles.icon} />
                <View>
                  <Text style={styles.infoLabel}>Giới thiệu</Text>
                  <Text style={styles.infoText}>{user.doctorProfile.bio || 'Chưa cập nhật'}</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Customer Details */}
        {user.role === 'customer' && user.pets && user.pets.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Thú cưng ({user.pets.length})</Text>
              <Divider style={styles.divider} />
              
              {user.pets.map((pet: any, index: number) => (
                <View key={pet._id || index} style={styles.petItem}>
                  <Avatar.Icon size={40} icon="paw" style={{ backgroundColor: '#FFECB3' }} color="#FFA000" />
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petDetails}>{pet.species} - {pet.breed || 'Chưa cập nhật'}</Text>
                    <Text style={styles.petDetails}>{pet.age ? `${pet.age} tuổi` : ''} {pet.weight ? `- ${pet.weight}kg` : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Customer Details (Empty Pets) */}
        {user.role === 'customer' && (!user.pets || user.pets.length === 0) && (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Thú cưng (0)</Text>
              <Divider style={styles.divider} />
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Icon name="paw-off" size={40} color="#CCC" />
                <Text style={{ color: '#999', marginTop: 10 }}>Khách hàng chưa thêm thú cưng</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            buttonColor={user.isActive ? '#F44336' : '#4CAF50'}
            icon={user.isActive ? 'lock' : 'lock-open-variant'}
            disabled={user.role === 'admin'}
            onPress={handleToggleStatus}
            style={styles.actionBtn}
          >
            {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...SHADOWS.small,
  },
  cardContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHeaderInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: SIZES.xl,
    ...FONTS.bold,
    color: '#333',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    height: 28,
  },
  statusBadge: {
    height: 28,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#EEE',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: '#888',
    marginBottom: 2,
  },
  infoText: {
    fontSize: SIZES.md,
    color: '#333',
    ...FONTS.medium,
  },
  infoSubText: {
    fontSize: SIZES.sm,
    color: '#666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    color: '#333',
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  petInfo: {
    marginLeft: 12,
    flex: 1,
  },
  petName: {
    fontSize: SIZES.md,
    ...FONTS.bold,
    color: '#333',
  },
  petDetails: {
    fontSize: SIZES.sm,
    color: '#666',
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  actionBtn: {
    paddingVertical: 6,
    borderRadius: 8,
  },
});

export default UserDetailAdminScreen;
