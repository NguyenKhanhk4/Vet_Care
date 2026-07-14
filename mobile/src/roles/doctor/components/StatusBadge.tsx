import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusText, getStatusColor } from '../utils/statusHelpers';
import { useTheme } from '../../../shared/context/ThemeContext';
import { FONTS } from '../../../shared/constants/theme';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { colors } = useTheme();
  const color = getStatusColor(status, colors);
  const text = getStatusText(status);

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 10,
    ...FONTS.bold,
  },
});

export default StatusBadge;
