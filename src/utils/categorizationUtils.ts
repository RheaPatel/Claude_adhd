import { TaskCategory } from '../types';
import { CATEGORY_KEYWORDS } from '../constants/categories';

/**
 * Categorize a task based on title and description keywords
 */
export const categorizeTask = (title: string, description?: string): {
  category: TaskCategory;
  confidence: number;
} => {
  const text = `${title} ${description || ''}`.toLowerCase();
  const scores: Record<TaskCategory, number> = {
    work: 0,
    health: 0,
    shopping: 0,
    personal: 0,
    social: 0,
    other: 0,
  };

  // Calculate scores for each category based on keyword matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
    scores[category as TaskCategory] = matchCount;
  }

  // Find the category with the highest score
  let bestCategory: TaskCategory = 'other';
  let maxScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as TaskCategory;
    }
  }

  // Calculate confidence (0-1) based on match strength
  const totalKeywords = Object.values(CATEGORY_KEYWORDS).flat().length;
  const confidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0; // Cap at 1.0

  return {
    category: maxScore > 0 ? bestCategory : 'other',
    confidence,
  };
};

/**
 * Get suggested categories with their confidence scores
 */
export const getSuggestedCategories = (
  title: string,
  description?: string
): Array<{ category: TaskCategory; confidence: number }> => {
  const text = `${title} ${description || ''}`.toLowerCase();
  const scores: Record<TaskCategory, number> = {
    work: 0,
    health: 0,
    shopping: 0,
    personal: 0,
    social: 0,
    other: 0,
  };

  // Calculate scores
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
    scores[category as TaskCategory] = matchCount;
  }

  // Convert to array and sort by score
  const suggestions = Object.entries(scores)
    .map(([category, score]) => ({
      category: category as TaskCategory,
      confidence: score > 0 ? Math.min(score / 3, 1) : 0,
    }))
    .filter((s) => s.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  return suggestions.slice(0, 3); // Return top 3 suggestions
};
