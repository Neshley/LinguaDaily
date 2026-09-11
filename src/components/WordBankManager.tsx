import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Bookmark,
  BookmarkCheck,
  Volume2,
  Trash2,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Check,
  BookOpen,
  Globe2,
  Layers,
  Flame,
  Zap,
} from 'lucide-react';
import { CATEGORIES } from '../data/vocabulary';
import { LanguageMeta, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';
import {
  searchVocabulary,
  fetchVocabularyCategories,
  learningItemToVocabularyWord,
  VocabularySearchParams,
} from '../services/vocabularyApi';
import { LearningItem } from '../../server/types/vocabulary';

interface WordBankManagerProps {
  words: VocabularyWord[];
  language: LanguageMeta;
  onAddWord: (newWord: VocabularyWord) => void;
  onDeleteWord: (wordId: string) => void;
  onToggleBookmark: (wordId: string) => void;
  onBackToDashboard: () => void;
}

type BankTab = 'my-deck' | 'global-library';

export const WordBankManager: React.FC<WordBankManagerProps> = ({
  words,
  language,
  onAddWord,
  onDeleteWord,
  onToggleBookmark,
  onBackToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<BankTab>('global-library');

  // Local Deck State
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Global Library Server State
  const [libSearchQuery, setLibSearchQuery] = useState<string>('');
  const [libCategory, setLibCategory] = useState<string>('All Categories');
  const [libDifficulty, setLibDifficulty] = useState<string>('all');
  const [libFrequency, setLibFrequency] = useState<string>('all');
  const [libItemType, setLibItemType] = useState<string>('all');
  const [libPage, setLibPage] = useState<number>(1);
  const [libLoading, setLibLoading] = useState<boolean>(false);
  const [libItems, setLibItems] = useState<LearningItem[]>([]);
  const [libTotal, setLibTotal] = useState<number>(0);
  const [libTotalPages, setLibTotalPages] = useState<number>(1);
  const [libCategories, setLibCategories] = useState<{ name: string; count: number }[]>([]);

  // Add Word Form state
  const [inputWordOrEnglish, setInputWordOrEnglish] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [newWordData, setNewWordData] = useState<Partial<VocabularyWord>>({
    word: '',
    phonetic: '',
    meaning: '',
    partOfSpeech: 'Noun',
    category: 'Daily Essentials',
    level: language.levels[0] || 'A1',
    exampleSentence: { native: '', phonetic: '', translation: '' },
    memoryTip: '',
  });

  // Map of word IDs currently in the user's active deck
  const activeDeckIdMap = React.useMemo(() => {
    const map = new Map<string, VocabularyWord>();
    for (const w of words) {
      map.set(w.id, w);
      map.set(w.word.toLowerCase(), w);
    }
    return map;
  }, [words]);

  // Load from Global Library Server API
  const loadGlobalLibrary = useCallback(async () => {
    setLibLoading(true);
    try {
      // Map UI language ID (e.g. 'zh' -> 'zh-cmn', 'zh-yue' -> 'zh-yue')
      const targetLang = language.id === 'zh' ? 'zh-cmn' : language.id;
      const res = await searchVocabulary({
        language: targetLang,
        q: libSearchQuery.trim() || undefined,
        category: libCategory !== 'All Categories' ? libCategory : undefined,
        difficulty: libDifficulty !== 'all' ? libDifficulty : undefined,
        frequencyBand: libFrequency !== 'all' ? libFrequency : undefined,
        itemType: libItemType !== 'all' ? libItemType : undefined,
        page: libPage,
        limit: 24,
      });

      setLibItems(res.items || []);
      setLibTotal(res.total || 0);
      setLibTotalPages(res.totalPages || 1);
      if (res.filters?.categories && res.filters.categories.length > 0) {
        setLibCategories(res.filters.categories);
      }
    } catch (err) {
      console.error('Failed to load global library:', err);
    } finally {
      setLibLoading(false);
    }
  }, [
    language.id,
    libSearchQuery,
    libCategory,
    libDifficulty,
    libFrequency,
    libItemType,
    libPage,
  ]);

  useEffect(() => {
    const targetLang = language.id === 'zh' ? 'zh-cmn' : language.id;
    fetchVocabularyCategories(targetLang)
      .then((cats) => {
        if (cats && cats.length > 0) {
          setLibCategories(cats);
        }
      })
      .catch((err) => console.error('Failed to pre-fetch categories:', err));
  }, [language.id]);

  useEffect(() => {
    if (activeTab === 'global-library') {
      loadGlobalLibrary();
    }
  }, [activeTab, loadGlobalLibrary]);

  // Filter local deck words
  const filteredLocalWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      w.phonetic.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      w.meaning.toLowerCase().includes(localSearchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || w.category === selectedCategory;

    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'bookmarked'
        ? w.isBookmarked
        : w.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddFromLibrary = (item: LearningItem) => {
    const existing = activeDeckIdMap.get(item.id) || activeDeckIdMap.get(item.word.toLowerCase());
    if (existing) {
      onToggleBookmark(existing.id);
    } else {
      const newWord = learningItemToVocabularyWord(item, { isBookmarked: true });
      onAddWord(newWord);
    }
  };

  const handleAiAutoFill = async () => {
    if (!inputWordOrEnglish.trim()) return;

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-custom-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputWordOrEnglish.trim(),
          targetLanguage: language.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.card) {
        const c = data.card;
        setNewWordData({
          word: c.word || '',
          phonetic: c.phonetic || '',
          meaning: c.meaning || '',
          partOfSpeech: (c.partOfSpeech as any) || 'Noun',
          category: (c.category as any) || 'Daily Essentials',
          level: c.level || language.levels[0] || 'A1',
          exampleSentence: {
            native: c.exampleSentence?.native || '',
            phonetic: c.exampleSentence?.phonetic || '',
            translation: c.exampleSentence?.translation || '',
          },
          memoryTip: c.memoryTip || '',
        });
      }
    } catch (err) {
      console.error('Failed to auto-generate word:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSaveNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordData.word || !newWordData.meaning) return;

    const newEntry: VocabularyWord = {
      id: `${language.id}-custom-${Date.now()}`,
      languageId: language.id,
      word: newWordData.word,
      phonetic: newWordData.phonetic || '',
      meaning: newWordData.meaning,
      partOfSpeech: newWordData.partOfSpeech as any,
      category: (newWordData.category as any) || 'Daily Essentials',
      level: newWordData.level || language.levels[0] || 'A1',
      exampleSentence: newWordData.exampleSentence || { native: '', translation: '' },
      memoryTip: newWordData.memoryTip || '',
      isCustom: true,
      status: 'new',
      streak: 0,
      reviewsCount: 0,
    };

    onAddWord(newEntry);
    setShowAddModal(false);
    setInputWordOrEnglish('');
    setNewWordData({
      word: '',
      phonetic: '',
      meaning: '',
      partOfSpeech: 'Noun',
      category: 'Daily Essentials',
      level: language.levels[0] || 'A1',
      exampleSentence: { native: '', phonetic: '', translation: '' },
      memoryTip: '',
    });
  };

  const handlePlay = (text: string) => {
    speakWord(text, language.speechCode, 0.9);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6 pb-24">
      {/* Top Bar with Navigation and Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-wordbank-back"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name} Vocabulary Library</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Freely discover words, collocations, and natural phrases from our high-frequency library.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Tab Pill Switcher */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('global-library')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'global-library'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Full Library (3,000+)</span>
              </button>
              <button
                onClick={() => setActiveTab('my-deck')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'my-deck'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>My Active Deck ({words.length})</span>
              </button>
            </div>

            <button
              id="btn-open-add-word"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Custom</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== GLOBAL LIBRARY VIEW ==================== */}
      {activeTab === 'global-library' && (
        <div className="space-y-4">
          {/* Global Library Filter Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="global-library-search"
                  type="text"
                  value={libSearchQuery}
                  onChange={(e) => {
                    setLibSearchQuery(e.target.value);
                    setLibPage(1);
                  }}
                  placeholder={`Search 3,000+ words, pronunciation, or English meanings in ${language.name}...`}
                  className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Select */}
                <select
                  value={libCategory}
                  onChange={(e) => {
                    setLibCategory(e.target.value);
                    setLibPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="All Categories">All Categories</option>
                  {libCategories.length > 0
                    ? libCategories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.count})
                        </option>
                      ))
                    : CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                </select>

                {/* Frequency Band */}
                <select
                  value={libFrequency}
                  onChange={(e) => {
                    setLibFrequency(e.target.value);
                    setLibPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">All Frequency Bands</option>
                  <option value="high">Core High Frequency (1–1,000)</option>
                  <option value="medium">Mid-Frequency (1,001–3,500)</option>
                  <option value="low">Low / Specialized</option>
                </select>

                {/* Difficulty */}
                <select
                  value={libDifficulty}
                  onChange={(e) => {
                    setLibDifficulty(e.target.value);
                    setLibPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="elementary">Elementary</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="upper-intermediate">Upper-Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                {/* Item Type */}
                <select
                  value={libItemType}
                  onChange={(e) => {
                    setLibItemType(e.target.value);
                    setLibPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">All Item Types</option>
                  <option value="word">Words</option>
                  <option value="collocation">Collocations & Combos</option>
                  <option value="phrase">Phrases</option>
                  <option value="question">Questions</option>
                  <option value="response">Conversational Responses</option>
                </select>
              </div>
            </div>

            {/* Results Counter and Active Quick Filters */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span>
                  Found <strong className="text-slate-800 dark:text-white">{libTotal}</strong> items
                  in {language.name} library
                </span>
                {libLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={libPage <= 1 || libLoading}
                  onClick={() => setLibPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {libPage} of {libTotalPages}
                </span>
                <button
                  disabled={libPage >= libTotalPages || libLoading}
                  onClick={() => setLibPage((p) => Math.min(libTotalPages, p + 1))}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {libItems.map((item) => {
              const inDeck = activeDeckIdMap.get(item.id) || activeDeckIdMap.get(item.word.toLowerCase());
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          {item.partOfSpeech}
                        </span>
                        {item.contentQuality?.tier === 'generated-pattern' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-[10px] font-semibold text-amber-700 dark:text-amber-300">Generated</span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            item.difficulty === 'beginner'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : item.difficulty === 'elementary'
                              ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                              : item.difficulty === 'intermediate'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          #{item.frequencyRank}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePlay(item.word)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                        title="Pronounce"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Word and Meaning */}
                    <div className="mb-2">
                      <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {item.word}
                      </div>
                      {item.pronunciation && (
                        <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                          {item.pronunciation}
                        </div>
                      )}

                      {/* Language-Specific Metadata Chips */}
                      {item.languageSpecific && (
                        <div className="flex items-center gap-1.5 flex-wrap my-1.5">
                          {item.languageSpecific.type === 'mandarin' && (
                            <>
                              {item.languageSpecific.data.hskLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-[10px] font-semibold">
                                  {item.languageSpecific.data.hskLevel}
                                </span>
                              )}
                              {item.languageSpecific.data.tones && (
                                <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 text-[10px]">
                                  Tones {item.languageSpecific.data.tones.join('-')}
                                </span>
                              )}
                              {item.languageSpecific.data.traditional && item.languageSpecific.data.traditional !== item.word && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                                  Trad: {item.languageSpecific.data.traditional}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'japanese' && (
                            <>
                              {item.languageSpecific.data.jlptLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-[10px] font-semibold">
                                  {item.languageSpecific.data.jlptLevel}
                                </span>
                              )}
                              {item.languageSpecific.data.hiragana && item.languageSpecific.data.hiragana !== item.word && (
                                <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 text-[10px]">
                                  {item.languageSpecific.data.hiragana}
                                </span>
                              )}
                              {item.languageSpecific.data.politenessLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 capitalize">
                                  {item.languageSpecific.data.politenessLevel}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'korean' && (
                            <>
                              {item.languageSpecific.data.topikLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-semibold">
                                  {item.languageSpecific.data.topikLevel}
                                </span>
                              )}
                              {item.languageSpecific.data.speechLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[10px] capitalize">
                                  {item.languageSpecific.data.speechLevel}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'spanish' && (
                            <>
                              {item.languageSpecific.data.gender && item.languageSpecific.data.gender !== 'invariable' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] capitalize">
                                  {item.languageSpecific.data.gender}
                                </span>
                              )}
                              {item.languageSpecific.data.article && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                  {item.languageSpecific.data.article}
                                </span>
                              )}
                              {item.languageSpecific.data.verbType && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px]">
                                  -{item.languageSpecific.data.verbType}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'french' && (
                            <>
                              {item.languageSpecific.data.gender && item.languageSpecific.data.gender !== 'invariable' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] capitalize">
                                  {item.languageSpecific.data.gender}
                                </span>
                              )}
                              {item.languageSpecific.data.article && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                  {item.languageSpecific.data.article}
                                </span>
                              )}
                              {item.languageSpecific.data.liaisonHint && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px]">
                                  Liaison
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'german' && (
                            <>
                              {item.languageSpecific.data.article && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[10px] font-bold">
                                  {item.languageSpecific.data.article}
                                </span>
                              )}
                              {item.languageSpecific.data.gender && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 capitalize">
                                  {item.languageSpecific.data.gender}
                                </span>
                              )}
                              {item.languageSpecific.data.isSeparable && (
                                <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 text-[10px]">
                                  Separable
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'cantonese' && (
                            <>
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 text-[10px]">
                                Jyutping: {item.languageSpecific.data.jyutping}
                              </span>
                              {item.languageSpecific.data.tones && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px]">
                                  Tones {item.languageSpecific.data.tones.join('-')}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                        {item.meaning}
                      </p>
                    </div>

                    {/* Context Example */}
                    {item.examples && item.examples[0] && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5">
                        <div className="font-medium text-slate-900 dark:text-slate-200">
                          {item.examples[0].native}
                        </div>
                        {item.examples[0].pronunciation && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                            {item.examples[0].pronunciation}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          {item.examples[0].translation}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Add or Bookmarked Status */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {item.category}
                    </span>

                    <button
                      onClick={() => handleAddFromLibrary(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        inDeck
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-2xs'
                      }`}
                    >
                      {inDeck ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In My Deck</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Deck</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination Bar */}
          {libTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-4">
              <button
                disabled={libPage <= 1 || libLoading}
                onClick={() => setLibPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Previous Page
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {libPage} of {libTotalPages}
              </span>
              <button
                disabled={libPage >= libTotalPages || libLoading}
                onClick={() => setLibPage((p) => Math.min(libTotalPages, p + 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== MY ACTIVE DECK VIEW ==================== */}
      {activeTab === 'my-deck' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="my-deck-search"
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search your saved cards by word, phonetic, or meaning..."
                  className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="all">All Study Statuses</option>
                <option value="bookmarked">Bookmarked Only</option>
                <option value="new">New Cards</option>
                <option value="learning">Actively Learning</option>
                <option value="review">Due for Review</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredLocalWords.length} of {words.length} saved words in your deck
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocalWords.map((word) => (
              <div
                key={word.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {word.partOfSpeech}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePlay(word.word)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title="Pronounce"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleBookmark(word.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 cursor-pointer"
                        title="Bookmark"
                      >
                        {word.isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                      {word.isCustom && (
                        <button
                          onClick={() => onDeleteWord(word.id)}
                          className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Delete Custom Word"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {word.word}
                  </div>
                  {word.phonetic && (
                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                      {word.phonetic}
                    </div>
                  )}
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                    {word.meaning}
                  </p>

                  {word.exampleSentence && word.exampleSentence.native && (
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] space-y-0.5">
                      <div className="font-medium text-slate-900 dark:text-slate-200">
                        {word.exampleSentence.native}
                      </div>
                      {word.exampleSentence.translation && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                          {word.exampleSentence.translation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{word.category}</span>
                  <span
                    className={`capitalize font-semibold ${
                      word.status === 'mastered'
                        ? 'text-emerald-600'
                        : word.status === 'learning'
                        ? 'text-indigo-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {word.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Word to {language.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Type any word or English prompt, or let Gemini AI fill the details.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Auto-generate helper */}
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-4">
              <label className="block text-xs font-semibold text-indigo-950 dark:text-indigo-200 mb-1">
                AI Quick Generator
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputWordOrEnglish}
                  onChange={(e) => setInputWordOrEnglish(e.target.value)}
                  placeholder={`e.g. "coffee", "restaurant", or word in ${language.name}`}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiGenerating || !inputWordOrEnglish.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isAiGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Auto-Fill</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNewWord} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Word (Native Script) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWordData.word || ''}
                    onChange={(e) => setNewWordData({ ...newWordData, word: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phonetic / Romanization
                  </label>
                  <input
                    type="text"
                    value={newWordData.phonetic || ''}
                    onChange={(e) => setNewWordData({ ...newWordData, phonetic: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  English Meaning *
                </label>
                <input
                  type="text"
                  required
                  value={newWordData.meaning || ''}
                  onChange={(e) => setNewWordData({ ...newWordData, meaning: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newWordData.category}
                    onChange={(e) =>
                      setNewWordData({ ...newWordData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Level
                  </label>
                  <input
                    type="text"
                    value={newWordData.level || ''}
                    onChange={(e) => setNewWordData({ ...newWordData, level: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Example Sentence (Native Script)
                </label>
                <input
                  type="text"
                  value={newWordData.exampleSentence?.native || ''}
                  onChange={(e) =>
                    setNewWordData({
                      ...newWordData,
                      exampleSentence: {
                        ...newWordData.exampleSentence!,
                        native: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sentence English Translation
                </label>
                <input
                  type="text"
                  value={newWordData.exampleSentence?.translation || ''}
                  onChange={(e) =>
                    setNewWordData({
                      ...newWordData,
                      exampleSentence: {
                        ...newWordData.exampleSentence!,
                        translation: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Card to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
