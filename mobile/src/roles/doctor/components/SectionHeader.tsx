import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { SIZES, FONTS } from '../../../shared/constants/theme';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.textPrimary, borderColor: colors.border }]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    marginBottom: SIZES.spacing.sm,
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
});

export default SectionHeader;
