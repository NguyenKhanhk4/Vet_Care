/**
 * RatingStars Component
 * Displays star rating (read-only or interactive)
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  showValue = false,
}) => {
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= Math.floor(rating);
    const isHalf = !isFilled && starValue - 0.5 <= rating;

    return (
      <TouchableOpacity
        key={index}
        disabled={!interactive}
        onPress={() => onRatingChange?.(starValue)}
        activeOpacity={interactive ? 0.7 : 1}
      >
        <Text style={[styles.star, { fontSize: size }]}>
          {isFilled ? '★' : isHalf ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      {stars}
      {showValue && <Text style={styles.value}>{rating.toFixed(1)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#FFD700',
    marginRight: 2,
  },
  value: {
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default RatingStars;
