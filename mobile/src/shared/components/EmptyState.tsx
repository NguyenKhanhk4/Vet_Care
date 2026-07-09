/**
 * EmptyState Component
 * Displays when a list has no data
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SIZES, FONTS, ThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📋',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xxl,
    minHeight: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.base,
  },
  title: {
    fontSize: SIZES.lg,
    color: colors.textPrimary,
    ...FONTS.semiBold,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: SIZES.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.xl,
    borderRadius: SIZES.radius.base,
  },
  actionText: {
    color: colors.textWhite,
    fontSize: SIZES.base,
    ...FONTS.semiBold,
  },
});

export default EmptyState;
