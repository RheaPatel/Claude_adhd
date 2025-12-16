export const COLORS = {
  // Primary brand colors
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundDark: '#1F2937',

  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Border colors
  border: '#E5E7EB',
  borderDark: '#D1D5DB',

  // Category colors (from categories.ts)
  work: '#3B82F6',
  health: '#10B981',
  shopping: '#F59E0B',
  personal: '#8B5CF6',
  social: '#EC4899',
  other: '#6B7280',

  // Urgency colors (from urgencyLevels.ts)
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#6B7280',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ADHD-friendly design tokens
export const ADHD_DESIGN = {
  // High contrast for better focus
  highContrast: true,

  // Large touch targets (minimum 44x44 as per accessibility guidelines)
  minTouchTarget: 44,

  // Reduced motion for users who prefer it
  reducedMotion: false,

  // Clear visual hierarchy
  cardElevation: 2,
  shadowColor: 'rgba(0, 0, 0, 0.1)',

  // Focus indicators
  focusColor: COLORS.primary,
  focusWidth: 3,
};
