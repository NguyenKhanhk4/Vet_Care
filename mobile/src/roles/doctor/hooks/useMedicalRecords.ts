import { useState, useCallback } from 'react';
import { doctorApi } from '../services/doctorApi';
import { DOCTOR_API_ENDPOINTS } from '../constants';
import { MedicalRecord } from '../types';

export const useMedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async (appointmentId?: string) => {
    try {
      setLoading(true);
      const url = appointmentId 
        ? `${DOCTOR_API_ENDPOINTS.MEDICAL_RECORDS}?appointmentId=${appointmentId}` 
        : DOCTOR_API_ENDPOINTS.MEDICAL_RECORDS;
      const response = await doctorApi.get(url);
      setRecords(response.data.records || response.data.data?.records || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    refreshing,
    fetchRecords,
    onRefresh,
  };
};
