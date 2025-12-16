import { TaskCategory } from '../types';

export const CATEGORY_KEYWORDS: Record<TaskCategory, string[]> = {
  work: [
    // Meetings & Communication
    'meeting', 'email', 'call', 'conference', 'zoom', 'teams', 'slack',
    'phone call', 'interview', 'presentation', '1:1', 'standup',

    // Deliverables & Tasks
    'report', 'presentation', 'deadline', 'project', 'submit', 'deliver',
    'proposal', 'document', 'spreadsheet', 'analysis', 'review',

    // People & Places
    'client', 'boss', 'colleague', 'team', 'manager', 'coworker',
    'office', 'work', 'desk', 'cubicle',

    // Actions
    'finish', 'complete', 'prepare', 'send', 'follow up', 'schedule',
  ],

  health: [
    // Medical
    'doctor', 'appointment', 'dentist', 'therapy', 'therapist',
    'checkup', 'physical', 'medical', 'clinic', 'hospital',
    'prescription', 'medicine', 'medication', 'pharmacy', 'refill',
    'blood test', 'lab', 'xray', 'scan',

    // Mental Health
    'mental health', 'counseling', 'psychiatrist', 'psychologist',
    'meditation', 'mindfulness', 'stress', 'anxiety',

    // Fitness
    'gym', 'workout', 'exercise', 'run', 'jog', 'walk', 'hike',
    'yoga', 'pilates', 'cardio', 'weights', 'training', 'fitness',
    'bike', 'swim', 'sport',

    // Wellness
    'health', 'wellness', 'self care', 'sleep', 'rest',
  ],

  shopping: [
    // Actions
    'buy', 'purchase', 'order', 'shop', 'get', 'pick up',
    'return', 'exchange',

    // Places
    'shopping', 'store', 'mall', 'market', 'grocery', 'groceries',
    'amazon', 'target', 'walmart', 'costco', 'trader joe',
    'online', 'retail',

    // Items
    'gift', 'present', 'supplies', 'food', 'clothes', 'clothing',
    'electronics', 'furniture', 'household',
  ],

  personal: [
    // Home Tasks
    'clean', 'cleaning', 'organize', 'tidy', 'declutter',
    'laundry', 'dishes', 'vacuum', 'sweep', 'mop', 'dust',
    'chores', 'home', 'house', 'apartment', 'room',

    // Maintenance
    'fix', 'repair', 'maintenance', 'replace', 'install',
    'plumber', 'electrician', 'handyman',

    // Administrative
    'pay', 'bills', 'taxes', 'insurance', 'bank', 'banking',
    'renew', 'register', 'dmv', 'license', 'paperwork',
    'forms', 'application',

    // Errands
    'errands', 'post office', 'mail', 'drop off', 'pick up',
  ],

  social: [
    // Events
    'birthday', 'party', 'event', 'celebration', 'gathering',
    'wedding', 'anniversary', 'holiday', 'festival',

    // People
    'friend', 'friends', 'family', 'mom', 'dad', 'sister', 'brother',
    'parents', 'kids', 'children', 'partner', 'spouse',

    // Activities
    'meet', 'catch up', 'dinner', 'lunch', 'coffee', 'drinks',
    'visit', 'hangout', 'hang out', 'plans', 'date',
    'brunch', 'breakfast',
  ],

  other: [],
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  work: '#3B82F6', // blue
  health: '#10B981', // green
  shopping: '#F59E0B', // amber
  personal: '#8B5CF6', // purple
  social: '#EC4899', // pink
  other: '#6B7280', // gray
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  work: 'briefcase',
  health: 'heart',
  shopping: 'cart',
  personal: 'home',
  social: 'account-group',
  other: 'dots-horizontal',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'Work',
  health: 'Health',
  shopping: 'Shopping',
  personal: 'Personal',
  social: 'Social',
  other: 'Other',
};
