import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

export const WellnessScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Wellness Check-ins
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Coming soon...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
});
