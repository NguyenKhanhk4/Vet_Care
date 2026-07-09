/**
 * ErrorMessage Component
 * Displays an error message with retry button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    backgroundColor: COLORS.background,
  },
  icon: {
    fontSize: 48,
    marginBottom: SIZES.spacing.base,
  },
  message: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.xl,
    borderRadius: SIZES.radius.base,
  },
  retryText: {
    color: COLORS.textWhite,
    fontSize: SIZES.base,
    ...FONTS.semiBold,
  },
});

export default ErrorMessage;
