import { format, formatDistanceToNow, isPast, isToday as isDateToday, isTomorrow, isThisWeek as isDateThisWeek } from 'date-fns';

// Re-export date-fns utilities
export { isDateToday as isToday, isDateThisWeek as isThisWeek };

/**
 * Format date for display in the UI
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Format date with time
 */
export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};

/**
 * Format time only
 */
export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

/**
 * Get relative time description (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Get human-friendly due date description with time awareness
 */
export const getDueDateDescription = (dueDate: Date): string => {
  const now = new Date();
  const diffInHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Overdue
  if (isPast(dueDate) && !isDateToday(dueDate)) {
    const overdueDays = Math.abs(diffInDays);
    if (overdueDays === 1) return '⚠️ 1 day overdue';
    if (overdueDays < 7) return `⚠️ ${overdueDays} days overdue`;
    return `⚠️ Overdue`;
  }

  // Today
  if (isDateToday(dueDate)) {
    if (diffInHours < 0) {
      return '⚠️ Overdue today';
    }
    if (diffInHours < 1) {
      const mins = Math.floor(diffInHours * 60);
      return `🔥 Due in ${mins} min`;
    }
    if (diffInHours < 3) {
      return `🔥 Due in ${Math.floor(diffInHours)} hours`;
    }
    return '📅 Due today';
  }

  // Tomorrow
  if (isTomorrow(dueDate)) {
    return '📅 Due tomorrow';
  }

  // This week
  if (isDateThisWeek(dueDate)) {
    return `📅 Due ${format(dueDate, 'EEEE')}`; // e.g., "Due Friday"
  }

  // Within 7 days
  if (diffInDays <= 7) {
    return `📅 Due in ${diffInDays} days`;
  }

  // Future
  return `📅 Due ${format(dueDate, 'MMM d')}`;
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dueDate: Date): boolean => {
  return isPast(dueDate) && !isDateToday(dueDate);
};

/**
 * Get color for due date (for UI styling)
 */
export const getDueDateColor = (dueDate: Date): string => {
  if (isOverdue(dueDate)) {
    return '#EF4444'; // red
  }

  if (isDateToday(dueDate)) {
    return '#F59E0B'; // amber
  }

  if (isTomorrow(dueDate)) {
    return '#F59E0B'; // amber
  }

  return '#6B7280'; // gray
};
