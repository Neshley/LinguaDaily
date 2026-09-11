import { LearningItem, ContentAuditReport } from '../types/vocabulary';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function normalizeString(str: string): string {
  return (str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function generateIdentityKey(item: Partial<LearningItem>): string {
  const lang = item.languageVariant || item.languageId || '';
  const word = normalizeString(item.word || '');
  const pron = normalizeString(item.pronunciation || '');
  const meaning = normalizeString(item.meaning || '');
  return `${lang}::${word}::${pron}::${meaning}`;
}

export function validateLearningItem(item: LearningItem): ValidationResult {
  const errors: string[] = [];

  if (!item.id || typeof item.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!item.languageId || !item.languageVariant) {
    errors.push('Missing languageId or languageVariant');
  }

  if (!item.word || item.word.trim().length === 0) {
    errors.push('Missing or empty word');
  }

  if (!item.meaning || item.meaning.trim().length === 0) {
    errors.push('Missing or empty meaning');
  }

  if (!item.category || item.category.trim().length === 0) {
    errors.push('Missing or empty category');
  }

  if (!['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'].includes(item.difficulty)) {
    errors.push(`Invalid difficulty: ${item.difficulty}`);
  }

  if (!['high', 'medium', 'low'].includes(item.frequencyBand)) {
    errors.push(`Invalid frequencyBand: ${item.frequencyBand}`);
  }

  if (!['word', 'phrase', 'collocation', 'question', 'response', 'idiom'].includes(item.itemType)) {
    errors.push(`Invalid itemType: ${item.itemType}`);
  }

  if (!item.pronunciation || item.pronunciation.trim().length === 0) {
    errors.push('Missing or empty pronunciation');
  }

  if (!item.pronunciationSystem || item.pronunciationSystem.trim().length === 0) {
    errors.push('Missing pronunciationSystem');
  }

  // Validate examples
  if (!Array.isArray(item.examples) || item.examples.length === 0) {
    errors.push('Examples must be a non-empty array');
  } else {
    for (let i = 0; i < item.examples.length; i++) {
      const ex = item.examples[i];
      if (!ex.native || ex.native.trim().length === 0) {
        errors.push(`Example at index ${i} has empty native sentence`);
      }
      if (!ex.translation || ex.translation.trim().length === 0) {
        errors.push(`Example at index ${i} has empty translation`);
      }
    }
  }

  // Language-specific validations
  if (item.languageVariant === 'zh-cmn' && item.languageSpecific) {
    if (item.languageSpecific.type === 'mandarin') {
      const m = item.languageSpecific.data;
      if (m.tones && Array.isArray(m.tones)) {
        for (const t of m.tones) {
          if (typeof t !== 'number' || t < 0 || t > 5) {
            errors.push(`Mandarin invalid tone number: ${t}`);
          }
        }
      }
    }
  }

  if (item.languageId === 'de' && item.partOfSpeech.toLowerCase() === 'noun' && item.languageSpecific) {
    if (item.languageSpecific.type === 'german') {
      const g = item.languageSpecific.data;
      if (g.article && !['der', 'die', 'das'].includes(g.article)) {
        errors.push(`German noun has invalid article: ${g.article}`);
      }
    }
  }

  if (['es', 'fr'].includes(item.languageId) && item.partOfSpeech.toLowerCase() === 'noun' && item.languageSpecific) {
    if (item.languageSpecific.type === 'spanish' || item.languageSpecific.type === 'french') {
      const g = (item.languageSpecific.data as any).gender;
      if (g && !['masculine', 'feminine'].includes(g)) {
        errors.push(`${item.languageId} noun has invalid gender: ${g}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
