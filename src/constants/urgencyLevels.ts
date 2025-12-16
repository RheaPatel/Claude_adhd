import { UrgencyLevel } from '../types';

// Keywords that indicate TIME URGENCY (how soon it needs to be done)
export const URGENCY_KEYWORDS: Record<UrgencyLevel, string[]> = {
  critical: [
    'urgent',
    'asap',
    'emergency',
    'critical',
    'immediately',
    'right now',
    'now',
    'today',
    'overdue',
    'late',
    'past due',
    'missed',
    'time sensitive',
  ],
  high: [
    'soon',
    'this week',
    'deadline',
    'due',
    'tomorrow',
    'next few days',
    'coming up',
    'approaching',
    'before',
  ],
  medium: [
    'upcoming',
    'next week',
    'next month',
    'eventually',
    'should',
    'plan to',
  ],
  low: [
    'someday',
    'maybe',
    'when possible',
    'if time',
    'later',
    'future',
    'whenever',
    'no rush',
    'low priority',
  ],
};

// Keywords that indicate IMPORTANCE (how much it matters) - separate from urgency
export const IMPORTANCE_KEYWORDS = {
  high: [
    'important',
    'crucial',
    'essential',
    'vital',
    'must',
    'need to',
    'priority',
    'critical',
    'key',
    'necessary',
  ],
  medium: [
    'should',
    'would like',
    'want to',
    'helpful',
    'useful',
  ],
  low: [
    'optional',
    'nice to have',
    'if possible',
    'bonus',
    'extra',
  ],
};

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  critical: '#EF4444', // red
  high: '#F59E0B', // amber
  medium: '#3B82F6', // blue
  low: '#6B7280', // gray
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const URGENCY_DESCRIPTIONS: Record<UrgencyLevel, string> = {
  critical: 'Needs immediate attention',
  high: 'Important, do soon',
  medium: 'Should be done this week',
  low: 'Can wait, no rush',
};

// Weights for urgency calculation algorithm
export const URGENCY_WEIGHTS = {
  KEYWORD: 0.4,
  DUE_DATE: 0.3,
  CATEGORY_PATTERN: 0.3,
};

// Minimum sample size needed for pattern-based suggestions
export const MIN_SAMPLE_SIZE_FOR_LEARNING = 20;

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.5,
  LOW: 0.3,
};
