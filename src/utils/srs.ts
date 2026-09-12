import type { MasteryStatus, VocabularyWord } from '../types';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsResult {
  status: MasteryStatus;
  streak: number;
  nextReviewDate: string;
}

export function calculateNextReview(word: Pick<VocabularyWord, 'status' | 'streak'>, rating: SrsRating, now = new Date()): SrsResult {
  let status: MasteryStatus = word.status;
  let streak = word.streak || 0;
  let intervalDays = 1;

  switch (rating) {
    case 'again':
      status = 'learning';
      streak = 0;
      intervalDays = 0;
      break;
    case 'hard':
      status = 'learning';
      streak += 1;
      intervalDays = 1;
      break;
    case 'good':
      streak += 1;
      status = streak >= 3 ? 'mastered' : 'review';
      intervalDays = streak >= 3 ? 7 : 3;
      break;
    case 'easy':
      streak += 2;
      status = 'mastered';
      intervalDays = 7;
      break;
  }

  const next = new Date(now);
  if (intervalDays === 0) next.setMinutes(next.getMinutes() + 10);
  else next.setDate(next.getDate() + intervalDays);

  return { status, streak, nextReviewDate: next.toISOString() };
}

export function isDue(word: Pick<VocabularyWord, 'status' | 'nextReviewDate'>, now = Date.now()): boolean {
  return (word.status === 'learning' || word.status === 'review') &&
    (!word.nextReviewDate || new Date(word.nextReviewDate).getTime() <= now);
}
