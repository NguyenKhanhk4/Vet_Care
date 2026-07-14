import { useState, useCallback } from 'react';
import { doctorApi } from '../services/doctorApi';
import { DOCTOR_API_ENDPOINTS } from '../constants';
import { ScheduleDay, WeeklySchedule, ScheduleStats } from '../types';

export const useSchedule = () => {
  const [todaySchedule, setTodaySchedule] = useState<{ appointments: any[], stats: ScheduleStats } | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodaySchedule = useCallback(async () => {
    try {
      const response = await doctorApi.get(DOCTOR_API_ENDPOINTS.SCHEDULES_TODAY);
      setTodaySchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching today schedule:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchWeeklySchedule = useCallback(async (date?: string) => {
    try {
      const url = date ? `${DOCTOR_API_ENDPOINTS.SCHEDULES_WEEKLY}?date=${date}` : DOCTOR_API_ENDPOINTS.SCHEDULES_WEEKLY;
      const response = await doctorApi.get(url);
      setWeeklySchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return {
    todaySchedule,
    weeklySchedule,
    loading,
    refreshing,
    setLoading,
    setRefreshing,
    fetchTodaySchedule,
    fetchWeeklySchedule,
  };
};
