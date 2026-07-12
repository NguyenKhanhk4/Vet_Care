import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../../../shared/context/ThemeContext';
import { SHADOWS } from '../../../shared/constants/theme';

interface AdminBackButtonProps {
  navigation: any;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Returns to the previous stack screen. For root screens inside a tab, it uses
 * the tab navigation history and falls back to Dashboard when no history exists.
 */
const AdminBackButton = ({ navigation, color, style }: AdminBackButtonProps) => {
  const { colors } = useTheme();

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    const parentNavigator = navigation?.getParent?.();
    if (parentNavigator?.canGoBack?.()) {
      parentNavigator.goBack();
      return;
    }

    parentNavigator?.navigate?.('Dashboard');
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      onPress={handleBack}
      style={[styles.button, { backgroundColor: colors.surface }, style]}
    >
      <Icon name="arrow-left" size={24} color={color || colors.textPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 12,
    left: 14,
    zIndex: 50,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
});

export default AdminBackButton;
