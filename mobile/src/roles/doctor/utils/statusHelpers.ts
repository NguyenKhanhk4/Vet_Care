import { ThemeColors } from '../../../shared/constants/theme';

export const getStatusColor = (status: string, colors: ThemeColors) => {
  switch (status) {
    case 'pending': return colors.warning;
    case 'confirmed': return colors.primary;
    case 'completed': return colors.success;
    case 'cancelled': return colors.error;
    default: return colors.textSecondary;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};
