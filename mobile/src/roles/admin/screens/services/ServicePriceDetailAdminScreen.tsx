import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme, Card, Avatar, Divider, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import adminApi from '../../utils/adminApi';
import { SIZES, FONTS, SHADOWS } from '../../../../shared/constants/theme';
import { Service } from '../../../../shared/types';
import { format } from 'date-fns';

const ServicePriceDetailAdminScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { serviceId } = route.params;
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get(`/services/${serviceId}`);
      setService(response.data.data);
    } catch (error) {
      console.error('Error fetching service details:', error);
      Alert.alert('Error', 'Failed to load service details', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServiceDetails();
    }, [serviceId])
  );

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.delete(`/services/${serviceId}`);
              Alert.alert('Success', 'Service deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete service');
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading || !service) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} textColor={colors.text}>
          Back
        </Button>
        <Text style={styles.title}>Service Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Icon 
              size={64} 
              icon="medical-bag" 
              style={{ backgroundColor: colors.primary + '20', alignSelf: 'center', marginBottom: 16 }}
              color={colors.primary} 
            />
            <Text style={styles.serviceName}>{service.name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(service.price)}</Text>
            </View>

            <View style={styles.statusContainer}>
              <Chip 
                textStyle={{ fontSize: 12, color: service.isActive ? '#fff' : '#666' }} 
                style={[styles.statusChip, { backgroundColor: service.isActive ? colors.primary : '#E0E0E0' }]}
              >
                {service.isActive ? 'Active' : 'Inactive'}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Icon name="clock-outline" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{service.duration} minutes</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="hospital-building" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Clinic</Text>
                <Text style={styles.detailValue}>{service.clinic?.name || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="tag-outline" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{service.category}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="calendar-clock" size={20} color="#666" />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Created At</Text>
                <Text style={styles.detailValue}>{format(new Date(service.createdAt), 'dd/MM/yyyy HH:mm')}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.descriptionContainer}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.descriptionText}>
                {service.description || 'No description provided.'}
              </Text>
            </View>

          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          <Button 
            mode="contained" 
            icon="pencil" 
            onPress={() => navigation.navigate('ServiceEdit', { serviceId: service._id })}
            style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
            contentStyle={styles.btnContent}
          >
            Edit Service
          </Button>
          <Button 
            mode="outlined" 
            icon="delete" 
            onPress={handleDelete}
            style={[styles.actionBtn, { borderColor: colors.error }]}
            textColor={colors.error}
            contentStyle={styles.btnContent}
          >
            Delete Service
          </Button>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    ...SHADOWS.small,
  },
  title: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    color: '#333',
  },
  content: {
    padding: 16,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    ...SHADOWS.medium,
    marginBottom: 24,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  serviceName: {
    fontSize: SIZES.xl,
    ...FONTS.bold,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: SIZES.xxl,
    ...FONTS.bold,
    color: '#4CAF50',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#EEE',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.xs,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: SIZES.md,
    color: '#333',
    ...FONTS.medium,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: SIZES.sm,
    color: '#555',
    lineHeight: 22,
    marginTop: 8,
  },
  actionButtons: {
    paddingHorizontal: 8,
    gap: 12,
  },
  actionBtn: {
    borderRadius: 8,
  },
  btnContent: {
    height: 50,
  },
});

export default ServicePriceDetailAdminScreen;
