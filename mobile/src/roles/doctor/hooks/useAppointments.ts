import { useState, useCallback } from 'react';
import { doctorApi } from '../services/doctorApi';
import { DOCTOR_API_ENDPOINTS } from '../constants';
import { Appointment } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = useCallback(async (currentFilter: string = filter) => {
    try {
      setLoading(true);
      const url = currentFilter === 'all' 
        ? DOCTOR_API_ENDPOINTS.APPOINTMENTS 
        : `${DOCTOR_API_ENDPOINTS.APPOINTMENTS}?status=${currentFilter}`;
        
      const response = await doctorApi.get(url);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
  }, [fetchAppointments]);

  const changeFilter = useCallback((newFilter: string) => {
    setFilter(newFilter);
    fetchAppointments(newFilter);
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    refreshing,
    filter,
    fetchAppointments,
    onRefresh,
    changeFilter,
  };
};
