import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Chip, HelperText, SegmentedButtons, Switch } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskStackParamList, TaskCategory, UrgencyLevel } from '../../types';
import { useCreateTask } from '../../hooks/useTasks';
import { categorizeTask } from '../../utils/categorizationUtils';
import { suggestUrgency } from '../../utils/urgencyCalculator';
import { formatDate } from '../../utils/dateUtils';
import { COLORS, SPACING } from '../../constants/theme';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants/categories';
import { URGENCY_LABELS, URGENCY_COLORS, URGENCY_DESCRIPTIONS } from '../../constants/urgencyLevels';

type Props = {
  navigation: NativeStackNavigationProp<TaskStackParamList, 'AddTask'>;
};

export const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [suggestedCategory, setSuggestedCategory] = useState<TaskCategory | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [suggestedUrgency, setSuggestedUrgency] = useState<UrgencyLevel | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [error, setError] = useState('');

  const { mutate: createTask, isPending } = useCreateTask();

  // Auto-categorization when title/description changes
  useEffect(() => {
    if (title.trim().length > 2) {
      const { category: suggested, confidence } = categorizeTask(title, description);
      if (confidence > 0.3) {
        setSuggestedCategory(suggested);
        setCategory(suggested);
      }
    }
  }, [title, description]);

  // Auto-urgency suggestion when title/description/dueDate changes
  useEffect(() => {
    if (title.trim().length > 2) {
      const { urgency: suggested } = suggestUrgency(title, description, dueDate);
      setSuggestedUrgency(suggested);
      setUrgency(suggested);
    }
  }, [title, description, dueDate]);

  const handleSave = () => {
    setError('');

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    createTask(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        urgency,
        dueDate,
        isLongTerm,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: (error: any) => {
          setError(error.message || 'Failed to create task');
        },
      }
    );
  };

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
            placeholder="e.g., Buy groceries"
            disabled={isPending}
            autoFocus
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
            placeholder="Add more details..."
            disabled={isPending}
          />

          {/* Category Selection */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Category
          </Text>
          {suggestedCategory && (
            <HelperText type="info" visible={true}>
              Auto-suggested: {CATEGORY_LABELS[suggestedCategory]}
            </HelperText>
          )}
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
                disabled={isPending}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          {/* Urgency Selection */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Urgency
          </Text>
          {suggestedUrgency && (
            <HelperText type="info" visible={true}>
              Suggested: {URGENCY_LABELS[suggestedUrgency]} - {URGENCY_DESCRIPTIONS[suggestedUrgency]}
            </HelperText>
          )}
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
                disabled={isPending}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          {/* Due Date */}
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Due Date (optional)
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            disabled={isPending}
            icon="calendar"
          >
            {dueDate ? formatDate(dueDate) : 'Set due date'}
          </Button>

          {dueDate && (
            <Button
              mode="text"
              onPress={() => setDueDate(undefined)}
              disabled={isPending}
              compact
            >
              Clear date
            </Button>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
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
              disabled={isPending}
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
            loading={isPending}
            disabled={isPending}
          >
            Create Task
          </Button>

          {/* Cancel Button */}
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={isPending}
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
  dateButton: {
    marginBottom: SPACING.sm,
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
});
