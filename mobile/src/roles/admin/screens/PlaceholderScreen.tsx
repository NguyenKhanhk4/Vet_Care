import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { SIZES, FONTS } from '../../../shared/constants/theme';

const PlaceholderScreen = ({ route }: any) => {
  const { colors } = useTheme();
  const screenName = route.name.replace('Admin', '');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {screenName}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        This screen is under construction.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxl,
    marginBottom: SIZES.spacing.sm,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.md,
  },
});

export default PlaceholderScreen;
