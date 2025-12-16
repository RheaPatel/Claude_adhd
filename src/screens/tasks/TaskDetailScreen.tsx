import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Chip, HelperText, ActivityIndicator, Switch, SegmentedButtons, IconButton, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { TaskCategory, UrgencyLevel, TaskStatus, Subtask } from '../../types';
import { TaskStackParamList } from '../../navigation/types';
import { useTask, useUpdateTask, useDeleteTask, useCreateTask } from '../../hooks/useTasks';
import { formatDate } from '../../utils/dateUtils';
import { COLORS, SPACING } from '../../constants/theme';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants/categories';
import { URGENCY_LABELS, URGENCY_COLORS } from '../../constants/urgencyLevels';
import { SubtaskItem } from '../../components/SubtaskItem';

type Props = {
  navigation: NativeStackNavigationProp<TaskStackParamList, 'TaskDetail'>;
  route: RouteProp<TaskStackParamList, 'TaskDetail'>;
};

export const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const { data: task, isLoading } = useTask(taskId);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: createTask } = useCreateTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      subtaskId: `subtask_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      createdAt: new Date(),
    };

    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.subtaskId === subtaskId
          ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date() : undefined }
          : st
      )
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.subtaskId !== subtaskId));
  };

  const getSubtaskProgress = () => {
    if (subtasks.length === 0) return null;
    const completed = subtasks.filter((st) => st.completed).length;
    return { completed, total: subtasks.length };
  };

  const handleSave = () => {
    setError('');

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    // Check if all subtasks are completed but task isn't marked complete
    const allSubtasksCompleted = subtasks.length > 0 && subtasks.every((st) => st.completed);
    if (allSubtasksCompleted && status !== 'completed') {
      Alert.alert(
        'All Subtasks Complete',
        'All subtasks are completed. Would you like to mark this task as complete?',
        [
          {
            text: 'Not Yet',
            onPress: () => saveTask(),
          },
          {
            text: 'Mark Complete',
            onPress: () => {
              setStatus('completed');
              setTimeout(() => saveTask('completed'), 100);
            },
          },
        ]
      );
      return;
    }

    saveTask();
  };

  const saveTask = (overrideStatus?: TaskStatus) => {
    updateTask(
      {
        taskId,
        updates: {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          urgency,
          urgencySource: 'user',
          status: overrideStatus || status,
          isLongTerm,
          subtasks,
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

  const handleDuplicate = () => {
    Alert.alert(
      'Duplicate Task',
      'Create a copy of this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: () => {
            // Create subtask copies with new IDs
            const duplicatedSubtasks: Subtask[] | undefined = subtasks.length > 0
              ? subtasks.map((st, index) => ({
                  subtaskId: `subtask_${Date.now()}_${index}`,
                  title: st.title,
                  completed: false,
                  createdAt: new Date(),
                }))
              : undefined;

            createTask(
              {
                title: `${title} (Copy)`,
                description,
                category,
                urgency,
                dueDate,
                isLongTerm,
                subtasks: duplicatedSubtasks,
              },
              {
                onSuccess: () => {
                  navigation.goBack();
                  Alert.alert('Success', 'Task duplicated successfully!');
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message || 'Failed to duplicate task');
                },
              }
            );
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
                disabled: isUpdating,
              },
              {
                value: 'in-progress',
                label: 'In Progress',
                icon: 'play-circle-outline',
                disabled: isUpdating,
              },
              {
                value: 'completed',
                label: 'Done',
                icon: 'check-circle',
                disabled: isUpdating,
              },
            ]}
            style={styles.statusButtons}
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

          {/* Subtasks Section */}
          <Divider style={styles.divider} />
          <View style={styles.subtasksHeader}>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Subtasks
            </Text>
            {getSubtaskProgress() && (
              <Text variant="bodySmall" style={styles.progressText}>
                {getSubtaskProgress()?.completed} / {getSubtaskProgress()?.total} completed
              </Text>
            )}
          </View>

          {subtasks.length > 0 && (
            <View style={styles.subtasksList}>
              {subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.subtaskId}
                  subtask={subtask}
                  onToggle={handleToggleSubtask}
                  onDelete={handleDeleteSubtask}
                  disabled={isUpdating}
                />
              ))}
            </View>
          )}

          <View style={styles.addSubtaskContainer}>
            <TextInput
              label="Add subtask"
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              mode="outlined"
              style={styles.subtaskInput}
              disabled={isUpdating}
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
              dense
            />
            <IconButton
              icon="plus"
              mode="contained"
              onPress={handleAddSubtask}
              disabled={isUpdating || !newSubtaskTitle.trim()}
              size={24}
              iconColor={COLORS.primary}
            />
          </View>

          {/* Long Term Task Toggle */}
          <Divider style={styles.divider} />
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

          {/* Duplicate Button */}
          <Button
            mode="outlined"
            icon="content-copy"
            onPress={handleDuplicate}
            style={styles.duplicateButton}
            disabled={isUpdating}
          >
            Duplicate Task
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
  divider: {
    marginVertical: SPACING.md,
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressText: {
    color: COLORS.textSecondary,
  },
  subtasksList: {
    marginBottom: SPACING.md,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  subtaskInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  duplicateButton: {
    marginBottom: SPACING.sm,
  },
  deleteButton: {
    marginBottom: SPACING.sm,
    borderColor: COLORS.error,
  },
});
