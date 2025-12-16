import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Checkbox, Text, IconButton, useTheme } from 'react-native-paper';
import { Subtask } from '../types/task';
import { SPACING } from '../constants/theme';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string) => void;
  onDelete: (subtaskId: string) => void;
  disabled?: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onDelete,
  disabled = false,
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    // Bounce animation on toggle
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle(subtask.subtaskId);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: subtask.completed ? 0.6 : 1,
        },
      ]}
    >
      <Checkbox.Android
        status={subtask.completed ? 'checked' : 'unchecked'}
        onPress={handleToggle}
        color={theme.colors.primary}
        disabled={disabled}
      />
      <Text
        style={[
          styles.title,
          subtask.completed && styles.completedTitle,
          { color: theme.colors.onSurface },
        ]}
        numberOfLines={2}
      >
        {subtask.title}
      </Text>
      <IconButton
        icon="delete-outline"
        size={20}
        onPress={() => onDelete(subtask.subtaskId)}
        disabled={disabled}
        iconColor={theme.colors.error}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
});
