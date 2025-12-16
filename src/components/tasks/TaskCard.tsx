import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Task } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../constants/categories';
import { URGENCY_COLORS, URGENCY_LABELS } from '../../constants/urgencyLevels';
import { getDueDateDescription, getDueDateColor, isOverdue } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  onToggleInProgress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onComplete,
  onDelete,
  onToggleInProgress,
}) => {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in-progress';
  const urgencyColor = URGENCY_COLORS[task.urgency];
  const categoryColor = CATEGORY_COLORS[task.category];

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate on completion
  useEffect(() => {
    if (isCompleted) {
      // Bounce effect
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(checkmarkScale, {
            toValue: 1.2,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(checkmarkScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(1);
      checkmarkScale.setValue(0);
      fadeAnim.setValue(1);
    }
  }, [isCompleted, scaleAnim, checkmarkScale, fadeAnim]);

  // Visual priority styling
  const getUrgencyStyles = () => {
    if (isCompleted) return {};

    switch (task.urgency) {
      case 'critical':
        return {
          backgroundColor: '#FEF2F2', // light red background
          borderLeftWidth: 6,
          borderLeftColor: URGENCY_COLORS.critical,
        };
      case 'high':
        return {
          backgroundColor: '#FFFBEB', // light yellow background
          borderLeftWidth: 5,
          borderLeftColor: URGENCY_COLORS.high,
        };
      case 'medium':
        return {
          backgroundColor: '#EFF6FF', // light blue background
          borderLeftWidth: 4,
          borderLeftColor: URGENCY_COLORS.medium,
        };
      case 'low':
        return {
          backgroundColor: '#F9FAFB', // very light gray
          borderLeftWidth: 3,
          borderLeftColor: URGENCY_COLORS.low,
        };
      default:
        return {};
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
      <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
        <Card style={[
          styles.card,
          getUrgencyStyles(),
          isCompleted && styles.completedCard
        ]}>
        {/* Urgency Indicator Bar (top bar for extra emphasis) */}
        {!isCompleted && (task.urgency === 'critical' || task.urgency === 'high') && (
          <View style={[styles.urgencyBar, { backgroundColor: urgencyColor }]} />
        )}

        <Card.Content style={styles.content}>
          <View style={styles.header}>
            {/* Status Icons */}
            <View style={styles.statusIcons}>
              {/* In-Progress Toggle */}
              {!isCompleted && onToggleInProgress && (
                <TouchableOpacity
                  onPress={onToggleInProgress}
                  style={styles.statusButton}
                >
                  <Icon
                    name={isInProgress ? 'pause-circle' : 'play-circle-outline'}
                    size={24}
                    color={isInProgress ? COLORS.info : COLORS.textLight}
                  />
                </TouchableOpacity>
              )}

              {/* Checkbox with animation */}
              <TouchableOpacity
                onPress={onComplete}
                style={styles.checkbox}
                disabled={isCompleted}
              >
                <Animated.View style={{ transform: [{ scale: isCompleted ? checkmarkScale : 1 }] }}>
                  <Icon
                    name={isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={28}
                    color={isCompleted ? COLORS.success : urgencyColor}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Task Content */}
            <View style={styles.taskContent}>
              {/* Due Date Badge - Prominent at top */}
              {task.dueDate && !isCompleted && (
                <View style={styles.dueDateBadge}>
                  <Text
                    variant="labelLarge"
                    style={[
                      styles.dueDateBadgeText,
                      { color: getDueDateColor(task.dueDate) },
                      isOverdue(task.dueDate) && styles.overdueBadge,
                    ]}
                  >
                    {getDueDateDescription(task.dueDate)}
                  </Text>
                </View>
              )}

              {/* Title */}
              <Text
                variant="bodyLarge"
                style={[styles.title, isCompleted && styles.completedText]}
                numberOfLines={2}
              >
                {task.title}
              </Text>

              {/* Description */}
              {task.description && (
                <Text
                  variant="bodySmall"
                  style={[styles.description, isCompleted && styles.completedText]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}

              {/* Subtask Progress */}
              {task.subtasks && task.subtasks.length > 0 && (
                <View style={styles.subtaskProgress}>
                  <Icon name="checkbox-multiple-marked-outline" size={14} color={COLORS.textSecondary} />
                  <Text variant="bodySmall" style={styles.subtaskProgressText}>
                    {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} subtasks
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`,
                          backgroundColor: isCompleted ? COLORS.success : urgencyColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Metadata Row */}
              <View style={styles.metadataRow}>
                {/* Category Chip */}
                <Chip
                  icon={() => (
                    <Icon
                      name={CATEGORY_ICONS[task.category]}
                      size={14}
                      color="#fff"
                    />
                  )}
                  style={[styles.categoryChip, { backgroundColor: categoryColor }]}
                  textStyle={styles.chipText}
                  compact
                >
                  {CATEGORY_LABELS[task.category]}
                </Chip>

                {/* Urgency Chip - Filled for high visibility */}
                <Chip
                  style={[
                    styles.urgencyChip,
                    !isCompleted && { backgroundColor: urgencyColor }
                  ]}
                  textStyle={[
                    styles.urgencyChipText,
                    !isCompleted && { color: '#fff', fontWeight: '600' }
                  ]}
                  compact
                >
                  {URGENCY_LABELS[task.urgency]}
                </Chip>

                {/* In Progress Badge */}
                {isInProgress && (
                  <Chip
                    icon={() => <Icon name="play-circle" size={14} color={COLORS.info} />}
                    style={[styles.longTermChip, { borderColor: COLORS.info }]}
                    textStyle={[styles.longTermChipText, { color: COLORS.info }]}
                    compact
                    mode="outlined"
                  >
                    In Progress
                  </Chip>
                )}

                {/* Long Term Badge */}
                {task.isLongTerm && (
                  <Chip
                    icon={() => <Icon name="infinity" size={14} color={COLORS.primary} />}
                    style={styles.longTermChip}
                    textStyle={styles.longTermChipText}
                    compact
                    mode="outlined"
                  >
                    Long Term
                  </Chip>
                )}
              </View>
            </View>

            {/* Delete Button */}
            {onDelete && (
              <IconButton
                icon="delete-outline"
                size={20}
                iconColor={COLORS.textSecondary}
                onPress={onDelete}
                style={styles.deleteButton}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: COLORS.backgroundSecondary,
  },
  urgencyBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    gap: 4,
  },
  statusButton: {
    padding: 2,
  },
  checkbox: {
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  dueDateBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  dueDateBadgeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  overdueBadge: {
    fontWeight: '800',
  },
  title: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  description: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  subtaskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  subtaskProgressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  categoryChip: {
    height: 24,
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
    marginVertical: 0,
  },
  urgencyChip: {
    height: 24,
  },
  urgencyChipText: {
    fontSize: 11,
    marginVertical: 0,
  },
  longTermChip: {
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  longTermChipText: {
    fontSize: 11,
    marginVertical: 0,
    color: COLORS.primary,
  },
  deleteButton: {
    margin: 0,
  },
});
