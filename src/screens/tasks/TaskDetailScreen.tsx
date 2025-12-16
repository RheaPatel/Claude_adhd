import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Chip, HelperText, ActivityIndicator, Switch, SegmentedButtons } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { TaskStackParamList, TaskCategory, UrgencyLevel, TaskStatus } from '../../types';
import { useTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { formatDate } from '../../utils/dateUtils';
import { COLORS, SPACING } from '../../constants/theme';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants/categories';
import { URGENCY_LABELS, URGENCY_COLORS } from '../../constants/urgencyLevels';

type Props = {
  navigation: NativeStackNavigationProp<TaskStackParamList, 'TaskDetail'>;
  route: RouteProp<TaskStackParamList, 'TaskDetail'>;
};

export const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const { data: task, isLoading } = useTask(taskId);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  // Load task data when it's available
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setUrgency(task.urgency);
      setStatus(task.status);
      setDueDate(task.dueDate);
      setIsLongTerm(task.isLongTerm || false);
    }
  }, [task]);

  const handleSave = () => {
    setError('');

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    updateTask(
      {
        taskId,
        updates: {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          urgency,
          urgencySource: 'user',
          status,
          isLongTerm,
        },
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: (error: any) => {
          setError(error.message || 'Failed to update task');
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(taskId, {
              onSuccess: () => {
                navigation.goBack();
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading task...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge" style={styles.errorText}>
          Task not found
        </Text>
        <Button mode="text" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  const urgencyOptions = Object.entries(URGENCY_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Title Input */}
          <TextInput
            label="Task Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            disabled={isUpdating}
          />

          {/* Description Input */}
          <TextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            disabled={isUpdating}
          />

          {/* Category Selection */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Category
          </Text>
          <View style={styles.chipContainer}>
            {categoryOptions.map((option) => (
              <Chip
                key={option.value}
                selected={category === option.value}
                onPress={() => setCategory(option.value as TaskCategory)}
                style={[
                  styles.chip,
                  category === option.value && {
                    backgroundColor: CATEGORY_COLORS[option.value as TaskCategory],
                  },
                ]}
                textStyle={category === option.value && { color: '#fff' }}
                disabled={isUpdating}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          {/* Urgency Selection */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Urgency
          </Text>
          <View style={styles.chipContainer}>
            {urgencyOptions.map((option) => (
              <Chip
                key={option.value}
                selected={urgency === option.value}
                onPress={() => setUrgency(option.value as UrgencyLevel)}
                style={[
                  styles.chip,
                  urgency === option.value && {
                    backgroundColor: URGENCY_COLORS[option.value as UrgencyLevel],
                  },
                ]}
                textStyle={urgency === option.value && { color: '#fff' }}
                disabled={isUpdating}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          {/* Status Selection */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Status
          </Text>
          <SegmentedButtons
            value={status}
            onValueChange={(value) => setStatus(value as TaskStatus)}
            buttons={[
              {
                value: 'pending',
                label: 'To Do',
                icon: 'circle-outline',
              },
              {
                value: 'in-progress',
                label: 'In Progress',
                icon: 'play-circle-outline',
              },
              {
                value: 'completed',
                label: 'Done',
                icon: 'check-circle',
              },
            ]}
            style={styles.statusButtons}
            disabled={isUpdating}
          />

          {/* Due Date */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Due Date
          </Text>
          {dueDate ? (
            <Text variant="bodyMedium" style={styles.dueDateText}>
              {formatDate(dueDate)}
            </Text>
          ) : (
            <Text variant="bodyMedium" style={styles.noDueDateText}>
              No due date set
            </Text>
          )}

          {/* Long Term Task Toggle */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Text variant="labelLarge">Long Term Task</Text>
              <Text variant="bodySmall" style={styles.switchDescription}>
                For goals or tasks with no immediate deadline
              </Text>
            </View>
            <Switch
              value={isLongTerm}
              onValueChange={setIsLongTerm}
              disabled={isUpdating}
              color={COLORS.primary}
            />
          </View>

          {/* Error Message */}
          {error && (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          )}

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={isUpdating}
            disabled={isUpdating}
          >
            Save Changes
          </Button>

          {/* Delete Button */}
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.deleteButton}
            textColor={COLORS.error}
            disabled={isUpdating}
          >
            Delete Task
          </Button>

          {/* Cancel Button */}
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  statusButtons: {
    marginBottom: SPACING.md,
  },
  dueDateText: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  noDueDateText: {
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  switchLabel: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchDescription: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  saveButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  deleteButton: {
    marginBottom: SPACING.sm,
    borderColor: COLORS.error,
  },
});
