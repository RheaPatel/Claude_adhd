import { UrgencyLevel } from '../types';
import { URGENCY_KEYWORDS, IMPORTANCE_KEYWORDS } from '../constants/urgencyLevels';
import { differenceInDays, differenceInHours } from 'date-fns';

/**
 * Suggest urgency level based on title, description, and due date
 *
 * KEY DISTINCTION:
 * - URGENCY = How time-sensitive it is (when it needs to be done)
 * - IMPORTANCE = How much it matters (consequences if not done)
 *
 * This function focuses on URGENCY, using:
 * 1. Due date proximity (primary factor - 60% weight)
 * 2. Time-related keywords (secondary - 30% weight)
 * 3. Importance keywords only boost if time-sensitive (10% weight)
 */
export const suggestUrgency = (
  title: string,
  description?: string,
  dueDate?: Date
): {
  urgency: UrgencyLevel;
  confidence: number;
  reasoning: string;
  detectedKeywords?: string[];
} => {
  const text = `${title} ${description || ''}`.toLowerCase();
  let reasoning = '';
  const detectedKeywords: string[] = [];

  // 1. DUE DATE ANALYSIS (Primary factor - most reliable)
  let dueDateUrgency: UrgencyLevel = 'medium';
  let dueDateConfidence = 0;

  if (dueDate) {
    const now = new Date();
    const hoursUntilDue = differenceInHours(dueDate, now);
    const daysUntilDue = differenceInDays(dueDate, now);

    if (hoursUntilDue < 0) {
      dueDateUrgency = 'critical';
      dueDateConfidence = 1.0;
      reasoning = '⚠️ Overdue';
    } else if (hoursUntilDue < 3) {
      dueDateUrgency = 'critical';
      dueDateConfidence = 1.0;
      reasoning = '🔥 Due in less than 3 hours';
    } else if (hoursUntilDue < 24) {
      dueDateUrgency = 'critical';
      dueDateConfidence = 0.95;
      reasoning = '📅 Due today';
    } else if (daysUntilDue === 1) {
      dueDateUrgency = 'high';
      dueDateConfidence = 0.9;
      reasoning = '📅 Due tomorrow';
    } else if (daysUntilDue <= 2) {
      dueDateUrgency = 'high';
      dueDateConfidence = 0.85;
      reasoning = `📅 Due in ${daysUntilDue} days`;
    } else if (daysUntilDue <= 5) {
      dueDateUrgency = 'medium';
      dueDateConfidence = 0.75;
      reasoning = `📅 Due in ${daysUntilDue} days`;
    } else if (daysUntilDue <= 14) {
      dueDateUrgency = 'low';
      dueDateConfidence = 0.7;
      reasoning = `📅 Due in ${daysUntilDue} days`;
    } else {
      dueDateUrgency = 'low';
      dueDateConfidence = 0.6;
      reasoning = `📅 Due in ${Math.ceil(daysUntilDue / 7)} week(s)`;
    }
  }

  // 2. TIME URGENCY KEYWORDS (Secondary factor)
  const urgencyKeywordScores: Record<UrgencyLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        urgencyKeywordScores[level as UrgencyLevel]++;
        detectedKeywords.push(keyword);
      }
    }
  }

  // Find highest scoring urgency level from keywords
  let keywordUrgency: UrgencyLevel = 'medium';
  let maxUrgencyKeywordScore = 0;

  for (const [level, score] of Object.entries(urgencyKeywordScores)) {
    if (score > maxUrgencyKeywordScore) {
      maxUrgencyKeywordScore = score;
      keywordUrgency = level as UrgencyLevel;
    }
  }

  // 3. IMPORTANCE KEYWORDS (Tertiary - only matters if something is time-sensitive)
  let importanceBoost = 0;
  for (const keyword of IMPORTANCE_KEYWORDS.high) {
    if (text.includes(keyword.toLowerCase())) {
      importanceBoost = 1;
      detectedKeywords.push(`${keyword} (important)`);
      break;
    }
  }

  // COMBINE FACTORS
  const urgencyLevels: UrgencyLevel[] = ['low', 'medium', 'high', 'critical'];

  let finalUrgency: UrgencyLevel;
  let confidence: number;

  if (dueDate) {
    // Due date is PRIMARY - use it as the baseline
    const dueDateIndex = urgencyLevels.indexOf(dueDateUrgency);
    const keywordIndex = urgencyLevels.indexOf(keywordUrgency);

    // If keywords suggest HIGHER urgency than due date, boost by one level max
    if (maxUrgencyKeywordScore > 0 && keywordIndex > dueDateIndex) {
      const boostedIndex = Math.min(dueDateIndex + 1, keywordIndex);
      finalUrgency = urgencyLevels[boostedIndex];
      reasoning += ` + urgency keywords detected`;
      confidence = Math.min(dueDateConfidence + 0.1, 1.0);
    } else {
      finalUrgency = dueDateUrgency;
      confidence = dueDateConfidence;
    }

    // Importance can only boost if already medium+ urgency
    if (importanceBoost && dueDateIndex >= 1) {
      const currentIndex = urgencyLevels.indexOf(finalUrgency);
      if (currentIndex < 3) {
        finalUrgency = urgencyLevels[currentIndex + 1];
        reasoning += ` + marked as important`;
        confidence = Math.min(confidence + 0.05, 1.0);
      }
    }
  } else {
    // NO DUE DATE - rely on keywords only (lower confidence)
    if (maxUrgencyKeywordScore > 0) {
      finalUrgency = keywordUrgency;
      confidence = 0.5; // Lower confidence without due date
      reasoning = `Time keywords: "${keywordUrgency}"`;

      if (importanceBoost) {
        reasoning += ` + important`;
        confidence = 0.6;
      }
    } else {
      // No due date, no urgency keywords - default to medium
      finalUrgency = 'medium';
      confidence = 0.3;
      reasoning = 'No due date or urgency indicators';

      if (importanceBoost) {
        reasoning = 'Marked as important but no time constraint';
        finalUrgency = 'medium'; // Important but not urgent = still medium
      }
    }
  }

  return {
    urgency: finalUrgency,
    confidence,
    reasoning,
    detectedKeywords: detectedKeywords.length > 0 ? detectedKeywords : undefined,
  };
};
