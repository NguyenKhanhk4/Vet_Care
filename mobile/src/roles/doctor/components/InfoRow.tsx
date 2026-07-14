import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { SIZES, FONTS } from '../../../shared/constants/theme';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  labelWidth?: number;
  valueStyle?: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, labelWidth = 90, valueStyle }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { width: labelWidth, color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }, valueStyle]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: SIZES.sm,
  },
  value: {
    flex: 1,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
});

export default InfoRow;
