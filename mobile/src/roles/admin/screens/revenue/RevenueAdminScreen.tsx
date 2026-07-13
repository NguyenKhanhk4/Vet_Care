import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import adminApi from '../../utils/adminApi';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { FONTS, SHADOWS, SIZES } from '../../../../shared/constants/theme';
import AdminBackButton from '../../components/AdminBackButton';

type Period = 'week' | 'month' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'year', label: '12 tháng' },
];

const formatCurrency = (amount = 0) => (
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
);

const RevenueAdminScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('month');
  const [report, setReport] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRevenue = async (selectedPeriod = period) => {
    try {
      const [reportResponse, dashboardResponse] = await Promise.all([
        adminApi.get('/reports', { params: { period: selectedPeriod } }),
        adminApi.get('/dashboard'),
      ]);

      if (reportResponse.data?.success) setReport(reportResponse.data.data);
      if (dashboardResponse.data?.success) setDashboard(dashboardResponse.data.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const selectPeriod = (nextPeriod: Period) => {
    setPeriod(nextPeriod);
    setLoading(true);
    fetchRevenue(nextPeriod);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRevenue();
  }, [period]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const summary = report?.revenue?.summary || {};
  const revenueByMonth = dashboard?.charts?.revenueByMonth || [];
  const totalRevenue = dashboard?.overview?.totalRevenue || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AdminBackButton navigation={navigation} color="#fff" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Quản lý doanh thu</Text>
          <Text style={styles.headerSubtitle}>Chỉ tính các giao dịch đã thanh toán</Text>
        </View>
        <Icon name="cash-multiple" color="#fff" size={38} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <Card style={[styles.totalCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
          <Card.Content>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>TỔNG DOANH THU 6 THÁNG GẦN NHẤT</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totalRevenue)}</Text>
            <Text style={[styles.helpText, { color: colors.textLight }]}>Dữ liệu đồng bộ từ các payment có trạng thái PAID</Text>
          </Card.Content>
        </Card>

        <View style={styles.periods}>
          {PERIODS.map(item => (
            <TouchableOpacity
              key={item.key}
              onPress={() => selectPeriod(item.key)}
              style={[styles.periodButton, { borderColor: colors.primary }, period === item.key && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.periodText, { color: period === item.key ? '#fff' : colors.primary }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tổng quan kỳ đã chọn</Text>
        <View style={styles.summaryGrid}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
            <Card.Content>
              <Icon name="cash-check" size={25} color="#009688" />
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatCurrency(summary.totalRevenue || 0)}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>DOANH THU</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
            <Card.Content>
              <Icon name="receipt-text" size={25} color="#FF9800" />
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{summary.totalTransactions || 0}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>GIAO DỊCH</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
            <Card.Content>
              <Icon name="chart-line" size={25} color="#2196F3" />
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatCurrency(summary.avgTransaction || 0)}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>TRUNG BÌNH/GIAO DỊCH</Text>
            </Card.Content>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Doanh thu theo tháng</Text>
        <Card style={[styles.monthCard, { backgroundColor: colors.surface, ...SHADOWS.light }]}>
          <Card.Content>
            {revenueByMonth.length ? revenueByMonth.map((item: any) => (
              <View key={`${item.year}-${item.month}`} style={[styles.monthRow, { borderBottomColor: colors.divider }]}>
                <View>
                  <Text style={[styles.monthName, { color: colors.textPrimary }]}>Tháng {item.month}/{item.year}</Text>
                  <Text style={[styles.monthTransactions, { color: colors.textLight }]}>{item.count} giao dịch đã thanh toán</Text>
                </View>
                <Text style={[styles.monthAmount, { color: colors.primary }]}>{formatCurrency(item.total)}</Text>
              </View>
            )) : (
              <Text style={[styles.emptyText, { color: colors.textLight }]}>Chưa có giao dịch thanh toán trong 6 tháng gần nhất.</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SIZES.spacing.lg, paddingLeft: 68, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: SIZES.radius.xl, borderBottomRightRadius: SIZES.radius.xl },
  headerText: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: SIZES.xl, ...FONTS.bold },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.sm, marginTop: 4 },
  content: { padding: SIZES.spacing.lg, paddingBottom: 100 },
  totalCard: { borderRadius: SIZES.radius.lg, marginBottom: SIZES.spacing.lg },
  cardLabel: { fontSize: SIZES.xs, ...FONTS.medium },
  totalValue: { fontSize: SIZES.title, ...FONTS.bold, marginTop: 6 },
  helpText: { fontSize: SIZES.xs, marginTop: 6 },
  periods: { flexDirection: 'row', gap: 8, marginBottom: SIZES.spacing.lg },
  periodButton: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: SIZES.radius.md, paddingVertical: 9 },
  periodText: { ...FONTS.semiBold, fontSize: SIZES.sm },
  sectionTitle: { ...FONTS.bold, fontSize: SIZES.lg, marginBottom: SIZES.spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SIZES.spacing.lg },
  summaryCard: { width: '48%', borderRadius: SIZES.radius.md },
  summaryValue: { ...FONTS.bold, fontSize: SIZES.lg, marginTop: 8, marginBottom: 4 },
  monthCard: { borderRadius: SIZES.radius.md },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  monthName: { ...FONTS.semiBold, fontSize: SIZES.md },
  monthTransactions: { fontSize: SIZES.xs, marginTop: 3 },
  monthAmount: { ...FONTS.bold, fontSize: SIZES.md, textAlign: 'right' },
  emptyText: { textAlign: 'center', paddingVertical: 16, fontSize: SIZES.sm },
});

export default RevenueAdminScreen;
