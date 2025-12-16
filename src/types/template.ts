import { TaskCategory, UrgencyLevel, Subtask } from './task';

export interface TaskTemplate {
  templateId: string;
  userId?: string; // undefined for default templates
  name: string;
  description?: string;
  icon?: string;
  category: TaskCategory;
  urgency: UrgencyLevel;
  estimatedDuration?: number;
  subtasks?: Omit<Subtask, 'subtaskId' | 'completed' | 'completedAt' | 'createdAt'>[];
  tags?: string[];
  isDefault?: boolean; // System-provided templates
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  icon?: string;
  category: TaskCategory;
  urgency: UrgencyLevel;
  estimatedDuration?: number;
  subtasks?: Omit<Subtask, 'subtaskId' | 'completed' | 'completedAt' | 'createdAt'>[];
  tags?: string[];
}

// Default templates provided by the system
export const DEFAULT_TEMPLATES: Omit<TaskTemplate, 'templateId' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Morning Routine',
    description: 'Start your day right',
    icon: '🌅',
    category: 'personal',
    urgency: 'medium',
    estimatedDuration: 45,
    isDefault: true,
    subtasks: [
      { title: 'Take morning medication' },
      { title: 'Drink a glass of water' },
      { title: 'Eat breakfast' },
      { title: 'Review today\'s tasks' },
      { title: 'Quick 5-minute stretch' },
    ],
    tags: ['routine', 'health', 'morning'],
  },
  {
    name: 'Evening Wind-Down',
    description: 'End your day peacefully',
    icon: '🌙',
    category: 'personal',
    urgency: 'low',
    estimatedDuration: 30,
    isDefault: true,
    subtasks: [
      { title: 'Review completed tasks' },
      { title: 'Plan tomorrow\'s top 3 tasks' },
      { title: 'Take evening medication' },
      { title: 'Set out tomorrow\'s clothes' },
      { title: 'Wind-down activity (reading, meditation)' },
    ],
    tags: ['routine', 'evening', 'planning'],
  },
  {
    name: 'Weekly Review',
    description: 'Reflect and plan ahead',
    icon: '📊',
    category: 'personal',
    urgency: 'medium',
    estimatedDuration: 60,
    isDefault: true,
    subtasks: [
      { title: 'Review this week\'s accomplishments' },
      { title: 'Archive completed tasks' },
      { title: 'Plan next week\'s priorities' },
      { title: 'Update long-term goals' },
      { title: 'Celebrate wins (big or small!)' },
    ],
    tags: ['planning', 'review', 'weekly'],
  },
  {
    name: 'Grocery Shopping',
    description: 'Stock up on essentials',
    icon: '🛒',
    category: 'shopping',
    urgency: 'medium',
    estimatedDuration: 60,
    isDefault: true,
    subtasks: [
      { title: 'Check pantry and fridge' },
      { title: 'Make shopping list' },
      { title: 'Check for coupons/deals' },
      { title: 'Go to store' },
      { title: 'Put groceries away' },
    ],
    tags: ['shopping', 'groceries', 'errands'],
  },
  {
    name: 'Deep Work Session',
    description: 'Focus time for important work',
    icon: '💻',
    category: 'work',
    urgency: 'high',
    estimatedDuration: 90,
    isDefault: true,
    subtasks: [
      { title: 'Clear workspace' },
      { title: 'Turn off notifications' },
      { title: 'Set timer for 25 minutes' },
      { title: 'Work on single task' },
      { title: 'Take 5-minute break' },
      { title: 'Repeat 3 more times' },
      { title: 'Take longer 15-minute break' },
    ],
    tags: ['work', 'focus', 'productivity'],
  },
  {
    name: 'House Cleaning',
    description: 'Tidy up living space',
    icon: '🧹',
    category: 'personal',
    urgency: 'low',
    estimatedDuration: 90,
    isDefault: true,
    subtasks: [
      { title: 'Do dishes' },
      { title: 'Wipe down surfaces' },
      { title: 'Vacuum or sweep floors' },
      { title: 'Take out trash' },
      { title: 'Tidy up clutter' },
      { title: 'Do one load of laundry' },
    ],
    tags: ['cleaning', 'home', 'chores'],
  },
  {
    name: 'Self-Care Hour',
    description: 'Take care of yourself',
    icon: '💆',
    category: 'health',
    urgency: 'medium',
    estimatedDuration: 60,
    isDefault: true,
    subtasks: [
      { title: 'Take a relaxing shower/bath' },
      { title: 'Skincare routine' },
      { title: 'Meditation or breathing exercises' },
      { title: 'Journaling' },
      { title: 'Listen to calming music' },
    ],
    tags: ['health', 'self-care', 'wellness'],
  },
  {
    name: 'Exercise Routine',
    description: 'Move your body',
    icon: '🏃',
    category: 'health',
    urgency: 'medium',
    estimatedDuration: 45,
    isDefault: true,
    subtasks: [
      { title: 'Change into workout clothes' },
      { title: 'Warm up (5-10 minutes)' },
      { title: 'Main workout (20-30 minutes)' },
      { title: 'Cool down and stretch' },
      { title: 'Drink water and refuel' },
    ],
    tags: ['health', 'exercise', 'fitness'],
  },
];
