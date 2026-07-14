import { useState, useCallback } from 'react';
import { doctorApi } from '../services/doctorApi';
import { DOCTOR_API_ENDPOINTS } from '../constants';
import { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorApi.get(DOCTOR_API_ENDPOINTS.NOTIFICATIONS);
      setNotifications(response.data.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await doctorApi.put(`${DOCTOR_API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await doctorApi.put(`${DOCTOR_API_ENDPOINTS.NOTIFICATIONS}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    loading,
    refreshing,
    fetchNotifications,
    onRefresh,
    markAsRead,
    markAllAsRead,
  };
};
