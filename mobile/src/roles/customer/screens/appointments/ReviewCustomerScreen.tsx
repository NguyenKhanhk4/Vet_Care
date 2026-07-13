import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SIZES, FONTS, SHADOWS, ThemeColors } from '../../../../shared/constants/theme';
import { useTheme } from '../../../../shared/context/ThemeContext';
import api from '../../../../shared/utils/api';

const ReviewCustomerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const styles = getStyles(colors);

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/reviews', { 
        appointmentId, 
        rating, 
        comment: comment.trim() 
      });
      
      Alert.alert('Success', 'Thank you for your feedback!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Text style={[styles.star, star <= rating ? styles.starSelected : styles.starUnselected]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>How was your experience?</Text>
        <Text style={styles.subtitle}>Please rate your appointment and leave a comment below.</Text>
        
        {renderStars()}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tell us about your experience..."
            placeholderTextColor={colors.textLight}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SIZES.spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: SIZES.xl,
    color: colors.textPrimary,
    ...FONTS.bold,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xxl,
  },
  starButton: {
    paddingHorizontal: SIZES.spacing.sm,
  },
  star: {
    fontSize: 48,
  },
  starSelected: {
    color: '#FFD700', // Gold color for selected stars
  },
  starUnselected: {
    color: colors.divider, // Gray color for unselected stars
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: SIZES.radius.base,
    padding: SIZES.spacing.base,
    marginBottom: SIZES.spacing.xxl,
    ...SHADOWS.light,
  },
  input: {
    fontSize: SIZES.base,
    color: colors.textPrimary,
    ...FONTS.regular,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: SIZES.radius.base,
    paddingVertical: SIZES.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.textWhite,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
});

export default ReviewCustomerScreen;
