import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  ProgressBar,
  Chip,
  Portal,
  Dialog,
  TextInput,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import {
  logWellnessCheckIn,
  getDailyWellnessSummary,
  getTodayWellnessCheckIns,
  getWeeklyWellnessTrends,
} from '../../services/wellnessService';
import { WellnessCheckInType, DailyWellnessSummary, WellnessCheckInLog } from '../../types/wellness';
import { COLORS, SPACING } from '../../constants/theme';
import { format } from 'date-fns';

export const WellnessScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DailyWellnessSummary | null>(null);
  const [todayCheckIns, setTodayCheckIns] = useState<WellnessCheckInLog[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);

  // Dialog states
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedCheckInType, setSelectedCheckInType] = useState<WellnessCheckInType>('hydration');
  const [mood, setMood] = useState<string>('3');
  const [energy, setEnergy] = useState<string>('3');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadWellnessData();
    }
  }, [user]);

  const loadWellnessData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [summaryData, checkIns, trends] = await Promise.all([
        getDailyWellnessSummary(user.userId, new Date()),
        getTodayWellnessCheckIns(user.userId),
        getWeeklyWellnessTrends(user.userId),
      ]);

      setSummary(summaryData);
      setTodayCheckIns(checkIns);
      setWeeklyTrends(trends);
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWellnessData();
    setRefreshing(false);
  };

  const handleQuickCheckIn = async (type: WellnessCheckInType) => {
    if (!user) return;

    try {
      await logWellnessCheckIn(user.userId, type);
      await loadWellnessData();
    } catch (error) {
      console.error('Error logging check-in:', error);
    }
  };

  const openDetailedCheckIn = (type: WellnessCheckInType) => {
    setSelectedCheckInType(type);
    setShowCheckInDialog(true);
  };

  const handleDetailedCheckIn = async () => {
    if (!user) return;

    try {
      await logWellnessCheckIn(user.userId, selectedCheckInType, {
        mood: parseInt(mood),
        energy: parseInt(energy),
        notes: notes.trim() || undefined,
      });

      setShowCheckInDialog(false);
      setMood('3');
      setEnergy('3');
      setNotes('');
      await loadWellnessData();
    } catch (error) {
      console.error('Error logging detailed check-in:', error);
    }
  };

  const getCheckInIcon = (type: WellnessCheckInType): string => {
    switch (type) {
      case 'hydration':
        return 'water';
      case 'meal':
        return 'food-apple';
      case 'break':
        return 'coffee';
      case 'medication':
        return 'pill';
      case 'mood':
        return 'emoticon-happy';
      case 'energy':
        return 'lightning-bolt';
      default:
        return 'checkbox-marked-circle';
    }
  };

  const getCheckInColor = (type: WellnessCheckInType): string => {
    switch (type) {
      case 'hydration':
        return '#3B82F6';
      case 'meal':
        return '#10B981';
      case 'break':
        return '#F59E0B';
      case 'medication':
        return '#EF4444';
      case 'mood':
        return '#8B5CF6';
      case 'energy':
        return '#EC4899';
      default:
        return COLORS.primary;
    }
  };

  const renderQuickCheckIn = (
    type: WellnessCheckInType,
    label: string,
    icon: string,
    color: string
  ) => (
    <Card style={styles.quickCheckInCard} mode="outlined">
      <Card.Content style={styles.quickCheckInContent}>
        <IconButton
          icon={icon}
          size={32}
          iconColor={color}
          containerColor={`${color}20`}
          onPress={() => handleQuickCheckIn(type)}
        />
        <Text variant="labelMedium" style={styles.quickCheckInLabel}>
          {label}
        </Text>
        <Button
          mode="text"
          compact
          onPress={() => openDetailedCheckIn(type)}
          textColor={COLORS.textSecondary}
        >
          + Note
        </Button>
      </Card.Content>
    </Card>
  );

  const renderProgressCard = (
    label: string,
    current: number,
    goal: number,
    icon: string,
    color: string
  ) => {
    const progress = Math.min(current / goal, 1);
    return (
      <Card style={styles.progressCard} mode="outlined">
        <Card.Content>
          <View style={styles.progressHeader}>
            <IconButton icon={icon} size={24} iconColor={color} style={styles.progressIcon} />
            <View style={styles.progressInfo}>
              <Text variant="labelMedium" style={styles.progressLabel}>
                {label}
              </Text>
              <Text variant="bodyLarge" style={styles.progressText}>
                {current} / {goal}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={progress}
            color={color}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>
    );
  };

  const getMoodEmoji = (moodValue: number): string => {
    if (moodValue >= 4.5) return '😄';
    if (moodValue >= 3.5) return '🙂';
    if (moodValue >= 2.5) return '😐';
    if (moodValue >= 1.5) return '😕';
    return '😢';
  };

  const getEnergyEmoji = (energyValue: number): string => {
    if (energyValue >= 4.5) return '⚡';
    if (energyValue >= 3.5) return '🔋';
    if (energyValue >= 2.5) return '🪫';
    if (energyValue >= 1.5) return '😴';
    return '💤';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Wellness Check-ins
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {format(new Date(), 'EEEE, MMMM d')}
          </Text>
        </View>

        {/* Quick Check-In Buttons */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Check-ins
          </Text>
          <View style={styles.quickCheckInGrid}>
            {renderQuickCheckIn('hydration', 'Water', 'water', '#3B82F6')}
            {renderQuickCheckIn('meal', 'Meal', 'food-apple', '#10B981')}
            {renderQuickCheckIn('break', 'Break', 'coffee', '#F59E0B')}
            {renderQuickCheckIn('medication', 'Meds', 'pill', '#EF4444')}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Today's Progress */}
        {summary && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Today's Progress
            </Text>
            {renderProgressCard(
              'Hydration',
              summary.hydrationCompleted,
              summary.hydrationGoal,
              'water',
              '#3B82F6'
            )}
            {renderProgressCard(
              'Meals',
              summary.mealsCompleted,
              summary.mealsGoal,
              'food-apple',
              '#10B981'
            )}
            {renderProgressCard(
              'Breaks',
              summary.breaksCompleted,
              summary.breaksGoal,
              'coffee',
              '#F59E0B'
            )}
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Mood & Energy */}
        {summary && (summary.averageMood || summary.averageEnergy) && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              How You're Feeling
            </Text>
            <View style={styles.moodEnergyRow}>
              {summary.averageMood && (
                <Card style={styles.moodCard} mode="outlined">
                  <Card.Content style={styles.moodCardContent}>
                    <Text variant="headlineLarge">
                      {getMoodEmoji(summary.averageMood)}
                    </Text>
                    <Text variant="labelMedium" style={styles.moodLabel}>
                      Mood
                    </Text>
                    <Text variant="bodyLarge" style={styles.moodValue}>
                      {summary.averageMood.toFixed(1)}/5
                    </Text>
                  </Card.Content>
                </Card>
              )}
              {summary.averageEnergy && (
                <Card style={styles.moodCard} mode="outlined">
                  <Card.Content style={styles.moodCardContent}>
                    <Text variant="headlineLarge">
                      {getEnergyEmoji(summary.averageEnergy)}
                    </Text>
                    <Text variant="labelMedium" style={styles.moodLabel}>
                      Energy
                    </Text>
                    <Text variant="bodyLarge" style={styles.moodValue}>
                      {summary.averageEnergy.toFixed(1)}/5
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </View>
          </View>
        )}

        {/* Insights */}
        {summary && summary.insights && summary.insights.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Insights
            </Text>
            <Card style={styles.insightsCard} mode="outlined">
              <Card.Content>
                {summary.insights.map((insight, index) => (
                  <View key={index} style={styles.insightRow}>
                    <IconButton
                      icon="lightbulb-on"
                      size={20}
                      iconColor={COLORS.primary}
                      style={styles.insightIcon}
                    />
                    <Text variant="bodyMedium" style={styles.insightText}>
                      {insight}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Weekly Trends */}
        {weeklyTrends && weeklyTrends.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              7-Day Trends
            </Text>
            <Card style={styles.trendsCard} mode="outlined">
              <Card.Content>
                {weeklyTrends.slice(-7).map((trend, index) => (
                  <View key={index} style={styles.trendRow}>
                    <Text variant="labelMedium" style={styles.trendDate}>
                      {format(trend.date, 'EEE')}
                    </Text>
                    <View style={styles.trendIcons}>
                      <Chip
                        icon="water"
                        compact
                        style={styles.trendChip}
                        textStyle={styles.trendChipText}
                      >
                        {trend.hydration}
                      </Chip>
                      <Chip
                        icon="food-apple"
                        compact
                        style={styles.trendChip}
                        textStyle={styles.trendChipText}
                      >
                        {trend.meals}
                      </Chip>
                      <Chip
                        icon="coffee"
                        compact
                        style={styles.trendChip}
                        textStyle={styles.trendChipText}
                      >
                        {trend.breaks}
                      </Chip>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Detailed Check-In Dialog */}
      <Portal>
        <Dialog visible={showCheckInDialog} onDismiss={() => setShowCheckInDialog(false)}>
          <Dialog.Title>
            {selectedCheckInType.charAt(0).toUpperCase() + selectedCheckInType.slice(1)} Check-in
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="labelMedium" style={styles.dialogLabel}>
              How are you feeling?
            </Text>
            <SegmentedButtons
              value={mood}
              onValueChange={setMood}
              buttons={[
                { value: '1', label: '😢' },
                { value: '2', label: '😕' },
                { value: '3', label: '😐' },
                { value: '4', label: '🙂' },
                { value: '5', label: '😄' },
              ]}
              style={styles.segmentedButtons}
            />

            <Text variant="labelMedium" style={[styles.dialogLabel, styles.dialogLabelSpaced]}>
              Energy level?
            </Text>
            <SegmentedButtons
              value={energy}
              onValueChange={setEnergy}
              buttons={[
                { value: '1', label: '💤' },
                { value: '2', label: '😴' },
                { value: '3', label: '🪫' },
                { value: '4', label: '🔋' },
                { value: '5', label: '⚡' },
              ]}
              style={styles.segmentedButtons}
            />

            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.notesInput}
              placeholder="How are you doing? Any thoughts?"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCheckInDialog(false)}>Cancel</Button>
            <Button onPress={handleDetailedCheckIn}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quickCheckInGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickCheckInCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 12,
  },
  quickCheckInContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  quickCheckInLabel: {
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  progressCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressIcon: {
    margin: 0,
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    color: COLORS.textSecondary,
  },
  progressText: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  moodEnergyRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  moodCard: {
    flex: 1,
    borderRadius: 12,
  },
  moodCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  moodLabel: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  moodValue: {
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  insightsCard: {
    borderRadius: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  insightIcon: {
    margin: 0,
    marginRight: SPACING.xs,
  },
  insightText: {
    flex: 1,
  },
  trendsCard: {
    borderRadius: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  trendDate: {
    width: 40,
    fontWeight: '600',
  },
  trendIcons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  trendChip: {
    height: 28,
  },
  trendChipText: {
    fontSize: 12,
  },
  dialogLabel: {
    marginBottom: SPACING.sm,
    color: COLORS.textSecondary,
  },
  dialogLabelSpaced: {
    marginTop: SPACING.md,
  },
  segmentedButtons: {
    marginBottom: SPACING.sm,
  },
  notesInput: {
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
});
