import assert from 'node:assert/strict';
import { calculateNextReview, isDue } from '../src/utils/srs';
import { matchesLanguageVariant } from '../src/utils/language';
import type { VocabularyWord } from '../src/types';

const base = {
  status: 'new' as const,
  streak: 0,
};

const again = calculateNextReview(base, 'again', new Date('2026-09-12T10:00:00Z'));
assert.equal(again.status, 'learning');
assert.equal(again.streak, 0);
assert.equal(again.nextReviewDate, '2026-09-12T10:10:00.000Z');

const good1 = calculateNextReview(base, 'good', new Date('2026-09-12T10:00:00Z'));
assert.equal(good1.status, 'review');
assert.equal(good1.streak, 1);

const good3 = calculateNextReview({ status: 'review', streak: 2 }, 'good', new Date('2026-09-12T10:00:00Z'));
assert.equal(good3.status, 'mastered');
assert.equal(good3.streak, 3);

const easy = calculateNextReview(base, 'easy', new Date('2026-09-12T10:00:00Z'));
assert.equal(easy.status, 'mastered');
assert.equal(easy.streak, 2);

assert.equal(isDue({ status: 'review', nextReviewDate: '2026-09-12T09:00:00Z' }, Date.parse('2026-09-12T10:00:00Z')), true);
assert.equal(isDue({ status: 'review', nextReviewDate: '2026-09-12T11:00:00Z' }, Date.parse('2026-09-12T10:00:00Z')), false);
assert.equal(isDue({ status: 'new', nextReviewDate: undefined }, Date.parse('2026-09-12T10:00:00Z')), false);

const mandarin: VocabularyWord = { id: 'm', languageId: 'zh-cmn', variantId: 'zh-cmn', word: '你好', phonetic: 'nǐ hǎo', meaning: 'hello', partOfSpeech: 'Greeting', category: 'Daily Essentials', level: 'beginner', exampleSentence: { native: '你好。', phonetic: 'nǐ hǎo', translation: 'Hello.' }, status: 'new', streak: 0, reviewsCount: 0 };
const cantonese: VocabularyWord = { ...mandarin, id: 'c', languageId: 'zh-yue', variantId: 'zh-yue' };
assert.equal(matchesLanguageVariant(mandarin, 'zh-cmn'), true);
assert.equal(matchesLanguageVariant(mandarin, 'zh-yue'), false);
assert.equal(matchesLanguageVariant(cantonese, 'zh-yue'), true);
assert.equal(matchesLanguageVariant(cantonese, 'zh-cmn'), false);

console.log('Logic checks passed.');
