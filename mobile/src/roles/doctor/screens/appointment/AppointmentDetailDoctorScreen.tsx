import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { doctorApi } from '../../services/doctorApi';
import { translateSpecies, translateGender, translateVaccineStatus } from '../../../../shared/utils/translate';

const AppointmentDetailDoctorScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const [appointment, setAppointment] = useState<any>(null);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointment = async () => {
    try {
      const response = await doctorApi.get(`/appointments/${id}`);
      setAppointment(response.data.data);
      
      // Try to fetch medical record if appointment is completed
      if (response.data.data.status === 'completed') {
        try {
          const recordRes = await doctorApi.get(`/medical-records?appointmentId=${id}`);
          const records = recordRes.data.records || recordRes.data.data?.records || [];
          if (records.length > 0) {
            setMedicalRecord(records[0]);
          }
        } catch (e) {
          // Ignore error if not found
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết lịch hẹn:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết lịch hẹn.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointment();
    }, [id])
  );

  const updateStatus = async (status: string, confirmMessage: string) => {
    Alert.alert('Xác nhận', confirmMessage, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          setActionLoading(true);
          try {
            await doctorApi.put(`/appointments/${id}/${status}`);
            Alert.alert('Thành công', 'Đã cập nhật trạng thái lịch hẹn.');
            fetchAppointment();
          } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật trạng thái.');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.primary;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const styles = getStyles(colors);

  if (loading || !appointment) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Lịch Hẹn</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            <Text style={styles.sectionTitle}>Trạng thái</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>{getStatusText(appointment.status)}</Text>
            </View>
          </View>
          <Text style={styles.dateInfo}>📅 {new Date(appointment.date).toLocaleDateString('vi-VN')} lúc {appointment.time}</Text>
        </View>

        {/* Pet Info */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 5 }}>
            <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0, marginRight: 12 }]} numberOfLines={1}>Thông Tin Thú Cưng</Text>
            <TouchableOpacity 
              style={{ backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
              onPress={() => navigation.navigate('MedicalHistoryDoctor', { petId: appointment.pet?._id, petName: appointment.pet?.name })}
            >
              <Text style={{ color: colors.primary, fontSize: SIZES.sm, ...FONTS.bold }}>📜 Lịch Sử Khám</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}><Text style={styles.label}>Tên:</Text><Text style={styles.value}>{appointment.pet?.name}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Loài/Giống:</Text><Text style={styles.value}>{translateSpecies(appointment.pet?.species)} - {appointment.pet?.breed || 'Không rõ'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Tuổi:</Text><Text style={styles.value}>{appointment.pet?.age} năm</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Cân nặng:</Text><Text style={styles.value}>{appointment.pet?.weight} kg</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Tình trạng tiêm:</Text><Text style={styles.value}>{translateVaccineStatus(appointment.pet?.vaccineStatus)}</Text></View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 5 }}>
            <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0, marginRight: 12 }]} numberOfLines={1}>Khách Hàng</Text>
            <TouchableOpacity 
              style={{ backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
              onPress={() => navigation.navigate('CustomerPetsDoctor', { customerId: appointment.customer?._id, customerName: appointment.customer?.name })}
            >
              <Text style={{ color: colors.primary, fontSize: SIZES.sm, ...FONTS.bold }}>🐾 Danh sách thú cưng</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}><Text style={styles.label}>Tên:</Text><Text style={styles.value}>{appointment.customer?.name}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Điện thoại:</Text><Text style={styles.value}>{appointment.customer?.phone}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{appointment.customer?.email}</Text></View>
        </View>

        {/* Service Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch Vụ & Thanh Toán</Text>
          <View style={styles.infoRow}><Text style={styles.label}>Dịch vụ:</Text><Text style={styles.value}>{appointment.services?.map((s: any) => s.name).join(', ')}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Thời lượng:</Text><Text style={styles.value}>{appointment.services?.reduce((total: number, s: any) => total + (s.duration || 0), 0)} phút</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Giá dịch vụ:</Text><Text style={styles.value}>{(appointment.totalAmount || appointment.services?.reduce((total: number, s: any) => total + (s.price || 0), 0) || 0).toLocaleString('vi-VN')} VNĐ</Text></View>
          {medicalRecord && medicalRecord.cost > 0 && (
            <View style={styles.infoRow}><Text style={styles.label}>Phát sinh:</Text><Text style={styles.value}>{medicalRecord.cost.toLocaleString('vi-VN')} VNĐ</Text></View>
          )}
          <View style={[styles.infoRow, { borderTopWidth: 1, borderColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
            <Text style={[styles.label, { ...FONTS.bold, color: colors.textPrimary }]}>Tổng tiền:</Text>
            <Text style={[styles.value, { color: colors.primary, ...FONTS.bold, fontSize: SIZES.lg }]}>
              {((appointment.totalAmount || appointment.services?.reduce((total: number, s: any) => total + (s.price || 0), 0) || 0) + (medicalRecord?.cost || 0)).toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
          {appointment.notes && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Ghi chú từ khách hàng:</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          )}
        </View>

        {/* Medical Record Info */}
        {medicalRecord && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hồ Sơ Bệnh Án</Text>
            <View style={styles.infoRow}><Text style={styles.label}>Chẩn đoán:</Text><Text style={styles.value}>{medicalRecord.diagnosis}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Triệu chứng:</Text><Text style={styles.value}>{medicalRecord.symptoms || 'Không có'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Điều trị:</Text><Text style={styles.value}>{medicalRecord.treatment || 'Không có'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Đơn thuốc:</Text><Text style={styles.value}>{medicalRecord.prescription || 'Không có'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.label}>Ghi chú bác sĩ:</Text><Text style={styles.value}>{medicalRecord.doctorNotes || 'Không có'}</Text></View>
            {medicalRecord.cost > 0 && (
              <View style={styles.infoRow}><Text style={styles.label}>Phát sinh:</Text><Text style={[styles.value, { color: colors.primary }]}>{medicalRecord.cost?.toLocaleString('vi-VN')} VNĐ</Text></View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionContainer}>
          {actionLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              {appointment.status === 'pending' && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: colors.primary }]} onPress={() => updateStatus('confirm', 'Bạn có chắc chắn muốn xác nhận lịch hẹn này?')}>
                    <Text style={styles.actionBtnText}>Xác Nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: colors.error }]} onPress={() => updateStatus('reject', 'Bạn có chắc chắn muốn từ chối lịch hẹn này?')}>
                    <Text style={styles.actionBtnText}>Từ Chối</Text>
                  </TouchableOpacity>
                </View>
              )}

              {appointment.status === 'confirmed' && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: colors.success }]} onPress={() => updateStatus('complete', 'Xác nhận hoàn thành ca khám này?')}>
                    <Text style={styles.actionBtnText}>Hoàn Thành</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: colors.error }]} onPress={() => updateStatus('reject', 'Bạn có chắc chắn muốn hủy lịch hẹn này?')}>
                    <Text style={styles.actionBtnText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              )}

              {appointment.status === 'completed' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('MedicalRecordDoctor', { appointmentId: appointment._id, existingRecord: medicalRecord })}>
                  <Text style={styles.actionBtnText}>{medicalRecord ? 'Sửa Bệnh Án' : 'Thêm Mới Bệnh Án'}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacing.lg, paddingTop: 60, backgroundColor: colors.surface, ...SHADOWS.light, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: SIZES.spacing.md },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, color: colors.textPrimary, ...FONTS.bold, marginHorizontal: 10 },
    scrollContent: { padding: SIZES.spacing.lg, paddingBottom: 100 },
    section: { backgroundColor: colors.surface, borderRadius: SIZES.radius.lg, padding: SIZES.spacing.lg, marginBottom: SIZES.spacing.lg, ...SHADOWS.medium },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: SIZES.lg, color: colors.textPrimary, ...FONTS.bold, marginBottom: SIZES.spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 5 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontSize: SIZES.sm, ...FONTS.bold },
    dateInfo: { fontSize: SIZES.md, color: colors.textSecondary, ...FONTS.medium },
    infoRow: { flexDirection: 'row', marginBottom: 8 },
    label: { width: 120, fontSize: SIZES.sm, color: colors.textSecondary },
    value: { flex: 1, fontSize: SIZES.sm, color: colors.textPrimary, ...FONTS.medium },
    notesText: { marginTop: 5, fontSize: SIZES.sm, color: colors.textPrimary, fontStyle: 'italic', backgroundColor: colors.background, padding: 10, borderRadius: 8 },
    actionContainer: { marginTop: SIZES.spacing.md },
    actionBtn: { padding: SIZES.spacing.md, borderRadius: SIZES.radius.base, alignItems: 'center', ...SHADOWS.light },
    actionBtnText: { color: colors.textWhite, fontSize: SIZES.md, ...FONTS.bold },
  });

export default AppointmentDetailDoctorScreen;
