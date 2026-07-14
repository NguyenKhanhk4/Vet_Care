import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { SIZES, FONTS } from '../../../shared/constants/theme';

interface EmptyStateProps {
  icon: string;
  text: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, text }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  text: {
    fontSize: SIZES.md,
    ...FONTS.medium,
    textAlign: 'center',
  },
});

export default EmptyState;
