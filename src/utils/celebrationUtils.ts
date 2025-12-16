/**
 * Celebration messages and motivational utilities for ADHD task completion
 */

export const CELEBRATION_MESSAGES = {
  taskComplete: [
    "🎉 Awesome! You did it!",
    "✨ Great job! Keep it up!",
    "🌟 You're crushing it!",
    "💪 Way to go!",
    "🔥 On fire! One more down!",
    "⚡ Boom! Task completed!",
    "🎯 Nailed it!",
    "🚀 You're unstoppable!",
    "💯 Perfect! You got this!",
    "🌈 Amazing work!",
    "👏 Fantastic! Keep going!",
    "🏆 Champion move!",
    "💎 That's how it's done!",
    "🎊 Crushed it!",
  ],

  streakMilestones: {
    3: "🔥 3 day streak! You're building momentum!",
    7: "⭐ 1 week streak! Incredible consistency!",
    14: "💫 2 weeks strong! You're a habit-building machine!",
    30: "🏆 30 DAY STREAK! You're unstoppable!",
    100: "👑 100 DAYS! You're a productivity legend!",
  },

  progressMilestones: {
    25: "You're 25% done! Great start! 🎯",
    50: "Halfway there! Keep pushing! 💪",
    75: "75% complete! Almost done! 🔥",
    100: "🎉 ALL DONE! You finished everything! Amazing! 🎊",
  },

  focusModeComplete: [
    "🎯 Focus Mode conquered! Ready for 3 more?",
    "💪 Top 3 done! You're a machine!",
    "🔥 Crushed the essentials! What's next?",
    "⚡ Focus session complete! Feeling good?",
  ],

  morningBoost: [
    "☀️ Good morning! Let's make today count!",
    "🌅 New day, new wins! You got this!",
    "☕ Morning! Time to knock out some tasks!",
  ],

  eveningWrap: [
    "🌙 Great work today! Time to rest.",
    "✨ You did well today! Be proud.",
    "🌃 Solid day! Tomorrow will be even better.",
  ],
};

/**
 * Get random celebration message for task completion
 */
export const getRandomCelebration = (): string => {
  const messages = CELEBRATION_MESSAGES.taskComplete;
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get celebration for specific percentage progress
 */
export const getProgressCelebration = (percentage: number): string | null => {
  const milestones = CELEBRATION_MESSAGES.progressMilestones;

  if (percentage >= 100 && milestones[100]) return milestones[100];
  if (percentage >= 75 && milestones[75]) return milestones[75];
  if (percentage >= 50 && milestones[50]) return milestones[50];
  if (percentage >= 25 && milestones[25]) return milestones[25];

  return null;
};

/**
 * Get streak milestone celebration
 */
export const getStreakCelebration = (streakDays: number): string | null => {
  const milestones = CELEBRATION_MESSAGES.streakMilestones;

  if (milestones[streakDays as keyof typeof milestones]) {
    return milestones[streakDays as keyof typeof milestones];
  }

  return null;
};

/**
 * Get motivational message based on time of day
 */
export const getTimeBasedMessage = (): string | null => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    // Morning
    const messages = CELEBRATION_MESSAGES.morningBoost;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  if (hour >= 20 || hour < 5) {
    // Evening
    const messages = CELEBRATION_MESSAGES.eveningWrap;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  return null;
};

/**
 * Get focus mode completion message
 */
export const getFocusModeCelebration = (): string => {
  const messages = CELEBRATION_MESSAGES.focusModeComplete;
  return messages[Math.floor(Math.random() * messages.length)];
};
