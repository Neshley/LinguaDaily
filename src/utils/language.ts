import type { SupportedLanguageId, VocabularyWord } from '../types';

export function normalizeLanguageId(language?: string): SupportedLanguageId | undefined {
  if (!language) return undefined;
  if (language === 'zh') return 'zh-cmn';
  return language as SupportedLanguageId;
}

export function getVariantId(word: Pick<VocabularyWord, 'languageId' | 'variantId'>): SupportedLanguageId {
  return word.variantId || normalizeLanguageId(word.languageId) || 'zh-cmn';
}

export function matchesLanguageVariant(word: Pick<VocabularyWord, 'languageId' | 'variantId'>, activeLanguage: SupportedLanguageId): boolean {
  const active = normalizeLanguageId(activeLanguage) || 'zh-cmn';
  const variant = getVariantId(word);
  return variant === active || normalizeLanguageId(word.languageId) === active;
}
