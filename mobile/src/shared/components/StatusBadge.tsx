/**
 * StatusBadge Component
 * Displays appointment/payment status with color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SIZES, FONTS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: '#E65100', bgColor: '#FFF3E0', label: 'Pending' },
  confirmed: { color: '#1565C0', bgColor: '#E3F2FD', label: 'Confirmed' },
  completed: { color: '#2E7D32', bgColor: '#E8F5E9', label: 'Completed' },
  cancelled: { color: '#C62828', bgColor: '#FFEBEE', label: 'Cancelled' },
  paid: { color: '#6A1B9A', bgColor: '#F3E5F5', label: 'Paid' },
  failed: { color: '#C62828', bgColor: '#FFEBEE', label: 'Failed' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const { colors } = useTheme();
  
  const config = STATUS_CONFIG[status] || {
    color: colors.textSecondary,
    bgColor: colors.divider,
    label: status,
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bgColor },
        size === 'small' && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.color },
          size === 'small' && styles.textSmall,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.round,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: SIZES.xs,
  },
});

export default StatusBadge;
