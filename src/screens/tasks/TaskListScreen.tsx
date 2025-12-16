import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, SectionList, RefreshControl } from 'react-native';
import { Text, FAB, Chip, Menu, Button, ActivityIndicator, Searchbar, SegmentedButtons, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskStackParamList } from '../../navigation/types';
import { Task, TaskCategory, TaskStatus, UrgencyLevel } from '../../types';
import { useTasks, useCompleteTask, useDeleteTask, useToggleInProgress } from '../../hooks/useTasks';
import { TaskCard } from '../../components/tasks/TaskCard';
import { COLORS, SPACING } from '../../constants/theme';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../constants/categories';
import { URGENCY_LABELS, URGENCY_COLORS } from '../../constants/urgencyLevels';
import { isOverdue, isToday, isThisWeek } from '../../utils/dateUtils';
import { getRandomCelebration, getProgressCelebration, getFocusModeCelebration } from '../../utils/celebrationUtils';

type Props = {
  navigation: NativeStackNavigationProp<TaskStackParamList, 'TaskList'>;
};

type FilterType = 'all' | TaskCategory;
type SortType = 'createdAt' | 'dueDate' | 'urgency';
type GroupByType = 'none' | 'category' | 'urgency' | 'dueDate' | 'longTerm';
type ViewMode = 'all' | 'today' | 'focus';

interface TaskSection {
  title: string;
  data: Task[];
  color?: string;
}

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [filterCategory, setFilterCategory] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('pending');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showLongTermOnly, setShowLongTermOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('urgency');
  const [groupBy, setGroupBy] = useState<GroupByType>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: allTasks = [], isLoading, refetch } = useTasks();
  const { mutate: completeTask } = useCompleteTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: toggleInProgress } = useToggleInProgress();

  // Filter and sort tasks
  const filteredTasks = allTasks
    .filter((task) => {
      // Auto-hide completed tasks unless showCompleted is true
      if (!showCompleted && task.status === 'completed') return false;

      // If showing only completed
      if (statusFilter === 'completed' && task.status !== 'completed') return false;

      // If showing only in-progress
      if (statusFilter === 'in-progress' && task.status !== 'in-progress') return false;

      // If showing only active (pending + in-progress)
      if (statusFilter === 'pending' && task.status === 'completed') return false;

      // View Mode Filters
      if (viewMode === 'today') {
        // Do Today: Hide long-term tasks, show urgent + due today/soon
        if (task.isLongTerm) return false;

        const isDueSoon = task.dueDate && (
          isToday(task.dueDate) ||
          isOverdue(task.dueDate) ||
          (task.dueDate.getTime() - Date.now()) < 48 * 60 * 60 * 1000 // within 48 hours
        );
        const isHighPriority = task.urgency === 'critical' || task.urgency === 'high';

        if (!isDueSoon && !isHighPriority) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;

      // Long-term filter
      if (showLongTermOnly && !task.isLongTerm) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();

        case 'urgency':
          const urgencyOrder: Record<UrgencyLevel, number> = {
            critical: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];

        case 'createdAt':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  // Apply Focus Mode limit (top 3 tasks)
  const displayTasks = viewMode === 'focus' ? filteredTasks.slice(0, 3) : filteredTasks;

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId, {
      onSuccess: () => {
        // Get celebration message
        let message = getRandomCelebration();

        // Calculate progress percentage
        const completed = allTasks.filter(t => t.status === 'completed').length + 1;
        const total = allTasks.length;
        const percentage = Math.round((completed / total) * 100);

        // Check for progress milestones
        const progressMessage = getProgressCelebration(percentage);
        if (progressMessage) {
          message = progressMessage;
        }

        // Check if Focus Mode just completed
        if (viewMode === 'focus' && displayTasks.length === 1) {
          message = getFocusModeCelebration();
        }

        // Show celebration
        setCelebrationMessage(message);
        setShowCelebration(true);
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleToggleInProgress = (taskId: string, currentStatus: TaskStatus) => {
    if (currentStatus === 'pending' || currentStatus === 'in-progress') {
      toggleInProgress({ taskId, currentStatus });
    }
  };

  // Group tasks into sections
  const groupedTasks = useMemo((): TaskSection[] => {
    if (groupBy === 'none') {
      return [{ title: '', data: displayTasks }];
    }

    const groups: Record<string, Task[]> = {};

    displayTasks.forEach((task) => {
      let key: string;

      switch (groupBy) {
        case 'category':
          key = task.category;
          break;
        case 'urgency':
          key = task.urgency;
          break;
        case 'dueDate':
          if (!task.dueDate) {
            key = 'No Due Date';
          } else if (isOverdue(task.dueDate)) {
            key = 'Overdue';
          } else if (isToday(task.dueDate)) {
            key = 'Today';
          } else if (isThisWeek(task.dueDate)) {
            key = 'This Week';
          } else {
            key = 'Later';
          }
          break;
        case 'longTerm':
          key = task.isLongTerm ? 'Long Term' : 'Short Term';
          break;
        default:
          key = 'Other';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });

    // Convert to sections array
    const sections: TaskSection[] = Object.entries(groups).map(([key, tasks]) => {
      let color: string | undefined;
      let title = key;

      if (groupBy === 'category') {
        color = CATEGORY_COLORS[key as TaskCategory];
        title = CATEGORY_LABELS[key as TaskCategory];
      } else if (groupBy === 'urgency') {
        color = URGENCY_COLORS[key as UrgencyLevel];
        title = URGENCY_LABELS[key as UrgencyLevel];
      }

      return { title, data: tasks, color };
    });

    // Sort sections by priority
    if (groupBy === 'urgency') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      sections.sort((a, b) => order[a.title.toLowerCase() as UrgencyLevel] - order[b.title.toLowerCase() as UrgencyLevel]);
    } else if (groupBy === 'dueDate') {
      const order = { 'Overdue': 0, 'Today': 1, 'This Week': 2, 'Later': 3, 'No Due Date': 4 };
      sections.sort((a, b) => (order[a.title as keyof typeof order] || 999) - (order[b.title as keyof typeof order] || 999));
    } else if (groupBy === 'longTerm') {
      sections.sort((a, b) => (a.title === 'Short Term' ? -1 : 1));
    }

    return sections;
  }, [displayTasks, groupBy]);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="headlineMedium" style={styles.title}>
        My Tasks
      </Text>

      {/* View Mode Switcher */}
      <SegmentedButtons
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
        buttons={[
          {
            value: 'today',
            label: 'Do Today',
            icon: 'lightning-bolt',
          },
          {
            value: 'focus',
            label: 'Focus',
            icon: 'target',
          },
          {
            value: 'all',
            label: 'All',
            icon: 'view-list',
          },
        ]}
        style={styles.viewModeSwitcher}
      />

      {viewMode === 'focus' && (
        <Text variant="bodySmall" style={styles.focusModeHint}>
          🎯 Showing top 3 most urgent tasks. Complete these first!
        </Text>
      )}

      {viewMode === 'today' && (
        <Text variant="bodySmall" style={styles.focusModeHint}>
          ⚡ Showing urgent tasks and items due soon
        </Text>
      )}

      {/* Search Bar */}
      <Searchbar
        placeholder="Search tasks..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />

      {/* Quick Filter Chips */}
      <View style={styles.quickFilters}>
        <Chip
          selected={showCompleted}
          onPress={() => setShowCompleted(!showCompleted)}
          icon={showCompleted ? 'eye' : 'eye-off'}
          style={styles.quickFilterChip}
        >
          {showCompleted ? 'Hide' : 'Show'} Completed
        </Chip>

        {showLongTermOnly && (
          <Chip
            selected={true}
            onPress={() => setShowLongTermOnly(false)}
            icon="close"
            style={styles.quickFilterChip}
          >
            Long Term Only
          </Chip>
        )}

        {filterCategory !== 'all' && (
          <Chip
            selected={true}
            onPress={() => setFilterCategory('all')}
            icon="close"
            style={styles.quickFilterChip}
          >
            {CATEGORY_LABELS[filterCategory]}
          </Chip>
        )}
      </View>

      {/* Consolidated View Options Menu */}
      <View style={styles.viewOptionsRow}>
        <Menu
          visible={showViewMenu}
          onDismiss={() => setShowViewMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowViewMenu(true)}
              icon="tune"
              style={styles.viewOptionsButton}
            >
              View Options
            </Button>
          }
        >
          <Menu.Item title="SORT BY" disabled />
          <Menu.Item
            onPress={() => { setSortBy('urgency'); setShowViewMenu(false); }}
            title="Urgency"
            leadingIcon={sortBy === 'urgency' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => { setSortBy('dueDate'); setShowViewMenu(false); }}
            title="Due Date"
            leadingIcon={sortBy === 'dueDate' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => { setSortBy('createdAt'); setShowViewMenu(false); }}
            title="Recent"
            leadingIcon={sortBy === 'createdAt' ? 'check' : undefined}
          />

          <Menu.Item title="" disabled style={{ height: 1, backgroundColor: COLORS.border }} />

          <Menu.Item title="FILTER BY CATEGORY" disabled />
          <Menu.Item
            onPress={() => { setFilterCategory('all'); setShowViewMenu(false); }}
            title="All Categories"
            leadingIcon={filterCategory === 'all' ? 'check' : undefined}
          />
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Menu.Item
              key={key}
              onPress={() => { setFilterCategory(key as TaskCategory); setShowViewMenu(false); }}
              title={label}
              leadingIcon={filterCategory === key ? 'check' : undefined}
            />
          ))}

          <Menu.Item title="" disabled style={{ height: 1, backgroundColor: COLORS.border }} />

          <Menu.Item title="GROUP BY" disabled />
          <Menu.Item
            onPress={() => { setGroupBy('none'); setShowViewMenu(false); }}
            title="No Grouping"
            leadingIcon={groupBy === 'none' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => { setGroupBy('urgency'); setShowViewMenu(false); }}
            title="By Urgency"
            leadingIcon={groupBy === 'urgency' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => { setGroupBy('category'); setShowViewMenu(false); }}
            title="By Category"
            leadingIcon={groupBy === 'category' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => { setGroupBy('dueDate'); setShowViewMenu(false); }}
            title="By Due Date"
            leadingIcon={groupBy === 'dueDate' ? 'check' : undefined}
          />

          <Menu.Item title="" disabled style={{ height: 1, backgroundColor: COLORS.border }} />

          <Menu.Item title="SPECIAL FILTERS" disabled />
          <Menu.Item
            onPress={() => { setShowLongTermOnly(!showLongTermOnly); setShowViewMenu(false); }}
            title="Long Term Only"
            leadingIcon={showLongTermOnly ? 'check' : undefined}
          />
        </Menu>
      </View>

      {/* Task Count with Progress */}
      <View style={styles.progressContainer}>
        {(() => {
          const active = allTasks.filter(t => t.status !== 'completed').length;
          const completed = allTasks.filter(t => t.status === 'completed').length;
          const total = allTasks.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

          let emoji = '📝';
          let motivationalText = '';

          if (total === 0) {
            return <Text variant="bodyMedium" style={styles.taskCount}>No tasks yet - tap the green button to add one!</Text>;
          }

          if (completed === 0) {
            emoji = '💪';
            motivationalText = "Let's get started!";
          } else if (percentage >= 100) {
            emoji = '🎉';
            motivationalText = "All done! You're amazing!";
          } else if (percentage >= 75) {
            emoji = '🔥';
            motivationalText = "Almost there! Keep going!";
          } else if (percentage >= 50) {
            emoji = '⚡';
            motivationalText = "Halfway done! You got this!";
          } else if (percentage >= 25) {
            emoji = '🌟';
            motivationalText = "Great progress! Keep it up!";
          } else {
            emoji = '✨';
            motivationalText = "Good start! One step at a time!";
          }

          return (
            <>
              <View style={styles.progressHeader}>
                <Text variant="bodyLarge" style={styles.taskCount}>
                  {emoji} {completed}/{total} done
                </Text>
                <Text variant="bodySmall" style={styles.motivationalText}>
                  {motivationalText}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: percentage >= 75 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#6366F1'
                    }
                  ]}
                />
              </View>
              {active > 0 && (
                <Text variant="bodySmall" style={styles.remainingTasks}>
                  {active} more to go {viewMode === 'focus' ? `(showing top ${displayTasks.length})` : ''}
                </Text>
              )}
            </>
          );
        })()}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="checkbox-marked-circle-outline" size={64} color={COLORS.textLight} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        {searchQuery ? 'No tasks found' : statusFilter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search or filters'
          : statusFilter === 'completed'
          ? 'Completed tasks will appear here'
          : 'Tap the + button to create your first task!'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.taskId })}
      onComplete={() => handleCompleteTask(item.taskId)}
      onDelete={() => handleDeleteTask(item.taskId)}
      onToggleInProgress={() => handleToggleInProgress(item.taskId, item.status)}
    />
  );

  const renderSectionHeader = ({ section }: { section: TaskSection }) => {
    if (!section.title) return null;

    return (
      <View style={[styles.sectionHeader, section.color && { borderLeftColor: section.color }]}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {section.title}
        </Text>
        <Text variant="bodySmall" style={styles.sectionCount}>
          {section.data.length} {section.data.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {groupBy === 'none' ? (
        <FlatList
          data={displayTasks}
          keyExtractor={(item) => item.taskId}
          renderItem={renderTaskItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={displayTasks.length === 0 && styles.emptyListContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[COLORS.primary]} />
          }
        />
      ) : (
        <SectionList
          sections={groupedTasks}
          keyExtractor={(item) => item.taskId}
          renderItem={renderTaskItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={displayTasks.length === 0 && styles.emptyListContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          stickySectionHeadersEnabled={true}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        label="Add Task"
        size="large"
        color="#fff"
      />

      {/* Celebration Snackbar */}
      <Snackbar
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
        duration={3000}
        style={styles.celebration}
        action={{
          label: '🎉',
          onPress: () => setShowCelebration(false),
        }}
      >
        {celebrationMessage}
      </Snackbar>
    </View>
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
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  viewModeSwitcher: {
    marginBottom: SPACING.md,
  },
  focusModeHint: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.backgroundSecondary,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickFilterChip: {
    marginRight: SPACING.xs,
  },
  viewOptionsRow: {
    marginBottom: SPACING.md,
  },
  viewOptionsButton: {
    width: '100%',
  },
  sectionHeader: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginTop: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionCount: {
    color: COLORS.textSecondary,
  },
  progressContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  taskCount: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  motivationalText: {
    color: COLORS.primary,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  remainingTasks: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981', // Bright green for high visibility
    borderRadius: 16,
  },
  celebration: {
    backgroundColor: '#10B981',
    marginBottom: 80,
  },
});
