import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Layers,
  Mic,
  Compass,
  Check,
  Plus,
  Loader2,
  Sparkles,
  BookOpen,
  Filter,
  X,
} from 'lucide-react';
import {
  DailyGoalSettings,
  LanguageVariant,
  MainNavigationTab,
  VocabularyWord,
} from '../types';
import { playNativeSpeech } from '../utils/speech';
import {
  searchVocabulary,
  fetchVocabularyCategories,
  learningItemToVocabularyWord,
} from '../services/vocabularyApi';
import { LearningItem } from '../../server/types/vocabulary';

interface LearnViewProps {
  activeVariant: LanguageVariant;
  words: VocabularyWord[];
  settings: DailyGoalSettings;
  onNavigate: (tab: MainNavigationTab) => void;
  onToggleBookmark: (id: string) => void;
  onSelectWordForPractice?: (word: VocabularyWord) => void;
  onAddWordToDeck?: (word: VocabularyWord) => void;
}

type LearnMode = 'library' | 'deck';

export const LearnView: React.FC<LearnViewProps> = ({
  activeVariant,
  words,
  settings,
  onNavigate,
  onToggleBookmark,
  onSelectWordForPractice,
  onAddWordToDeck,
}) => {
  const [mode, setMode] = useState<LearnMode>('library');
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);

  // Discovery Library server-side state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedItemType, setSelectedItemType] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LearningItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableCategories, setAvailableCategories] = useState<{ name: string; count: number }[]>([]);

  // Map of active deck words for fast lookup
  const deckWordMap = useMemo(() => {
    const map = new Map<string, VocabularyWord>();
    for (const w of words) {
      map.set(w.id, w);
      map.set(w.word.toLowerCase(), w);
    }
    return map;
  }, [words]);

  // Determine server target language
  const targetLanguageId = useMemo(() => {
    if (activeVariant.id === 'zh-cmn' || activeVariant.id === 'zh') return 'zh-cmn';
    if (activeVariant.id === 'zh-yue') return 'zh-yue';
    if (activeVariant.id.startsWith('es-')) return 'es';
    if (activeVariant.id.startsWith('fr-')) return 'fr';
    if (activeVariant.id.startsWith('de-')) return 'de';
    if (activeVariant.id.startsWith('ja-')) return 'ja';
    if (activeVariant.id.startsWith('ko-')) return 'ko';
    return activeVariant.id;
  }, [activeVariant.id]);

  // Load distinct categories for active language
  useEffect(() => {
    fetchVocabularyCategories(
      targetLanguageId,
      (activeVariant.id === 'zh-cmn' || activeVariant.id === 'zh-yue') ? activeVariant.id : undefined
    )
      .then((cats) => {
        if (cats && cats.length > 0) {
          setAvailableCategories(cats);
        }
      })
      .catch((err) => console.error('Failed to load categories for', targetLanguageId, err));
  }, [targetLanguageId, activeVariant.id]);

  // Query server library
  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await searchVocabulary({
        language: targetLanguageId,
        languageVariant: (activeVariant.id === 'zh-cmn' || activeVariant.id === 'zh-yue') ? activeVariant.id : undefined,
        q: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        frequencyBand: selectedFrequency !== 'all' ? selectedFrequency : undefined,
        itemType: selectedItemType !== 'all' ? selectedItemType : undefined,
        page,
        limit: 20,
      });

      // Final UI-layer guard. Chinese varieties share zh.json, so never trust
      // a broad "Chinese" result to be variant-safe. This keeps the Learn screen
      // correct even when an old cached response or legacy record slips through.
      const requestedVariant =
        activeVariant.id === 'zh' ? 'zh-cmn' : activeVariant.id;

      const variantSafeItems = (res.items || []).filter((item) => {
        if (!requestedVariant.startsWith('zh-')) return true;
        const itemVariant =
          item.languageVariant ||
          ((item.languageSpecific as any)?.type === 'mandarin' ? 'zh-cmn' :
           (item.languageSpecific as any)?.type === 'cantonese' ? 'zh-yue' : undefined);
        return itemVariant === requestedVariant;
      });

      setLibraryItems(variantSafeItems);
      setTotalCount(res.total || variantSafeItems.length);
      setTotalPages(Math.max(1, Math.ceil((res.total || variantSafeItems.length) / 20)));
      if (res.filters?.categories && res.filters.categories.length > 0) {
        setAvailableCategories(res.filters.categories);
      }
    } catch (err) {
      console.error('Failed to query vocabulary library:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    targetLanguageId,
    activeVariant.id,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedFrequency,
    selectedItemType,
    page,
  ]);

  // Debounced search trigger or parameter change
  useEffect(() => {
    if (mode === 'library') {
      const timer = setTimeout(() => {
        loadLibrary();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [mode, loadLibrary]);

  // Filter words in "My Deck" mode
  const filteredDeckWords = useMemo(() => {
    return words.filter((item) => {
      const matchesTopic = selectedCategory === 'All Categories' || item.category === selectedCategory;
      if (!matchesTopic) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        item.word.toLowerCase().includes(query) ||
        (item.phonetic && item.phonetic.toLowerCase().includes(query)) ||
        item.meaning.toLowerCase().includes(query) ||
        (item.exampleSentence && item.exampleSentence.native.toLowerCase().includes(query))
      );
    });
  }, [words, selectedCategory, searchQuery]);

  const handleAddOrToggleDeck = (item: LearningItem) => {
    const existing = deckWordMap.get(item.id) || deckWordMap.get(item.word.toLowerCase());
    if (existing) {
      onToggleBookmark(existing.id);
    } else if (onAddWordToDeck) {
      const newWord = learningItemToVocabularyWord(item, { isBookmarked: true });
      onAddWordToDeck(newWord);
    }
  };

  const handleSelectLearningItem = (item: LearningItem) => {
    const existing = deckWordMap.get(item.id) || deckWordMap.get(item.word.toLowerCase());
    const vocabWord = learningItemToVocabularyWord(item, existing || undefined);
    setSelectedWord(vocabWord);
  };

  const currentDisplayWord = selectedWord || (mode === 'deck' ? filteredDeckWords[0] : null);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Banner with Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Free Discovery & Multilingual Library</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Explore {activeVariant.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Freely discover, learn, and practice vocabulary. No mandatory courses or progression locks.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            <button
              id="tab-mode-library"
              onClick={() => {
                setMode('library');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'library'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Library ({totalCount > 0 ? totalCount.toLocaleString() : '3,000+'})</span>
            </button>
            <button
              id="tab-mode-deck"
              onClick={() => setMode('deck')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'deck'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>My Active Deck ({words.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-vocabulary-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={`Search word, pronunciation, or English meaning in ${activeVariant.name}...`}
                className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="All Categories">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>

            {mode === 'library' && (
              <>
                {/* Difficulty */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="elementary">Elementary</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="upper-intermediate">Upper-Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                {/* Item Type */}
                <select
                  value={selectedItemType}
                  onChange={(e) => {
                    setSelectedItemType(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">All Types</option>
                  <option value="word">Words</option>
                  <option value="collocation">Collocations</option>
                  <option value="phrase">Phrases</option>
                  <option value="question">Questions</option>
                  <option value="response">Responses</option>
                </select>
              </>
            )}
          </div>

          {/* Quick topic pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory('All Categories');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategory === 'All Categories'
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {availableCategories.slice(0, 10).map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat.name
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Discovery Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cards List & Pagination */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span>
                {mode === 'library'
                  ? `Showing ${(page - 1) * 20 + 1}–${Math.min(page * 20, totalCount)} of ${totalCount.toLocaleString()} library items`
                  : `Showing ${filteredDeckWords.length} items in active deck`}
              </span>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
            </div>

            {mode === 'library' && (
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[680px] overflow-y-auto pr-1">
            {mode === 'library' ? (
              libraryItems.map((item) => {
                const inDeck = deckWordMap.has(item.id) || deckWordMap.has(item.word.toLowerCase());
                const isSelected = selectedWord?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLearningItem(item)}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
                            {item.partOfSpeech || item.itemType}
                          </span>
                          {item.contentQuality?.tier === 'generated-pattern' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                              Generated pattern
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            #{item.frequencyRank}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playNativeSpeech(item.word, activeVariant.speechCode, settings.speechSpeed);
                            }}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Pronounce"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddOrToggleDeck(item);
                            }}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              inDeck
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 hover:text-indigo-600'
                            }`}
                            title={inDeck ? 'In My Deck' : 'Add to My Deck'}
                          >
                            {inDeck ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Word & Pronunciation */}
                      <div className="mt-2">
                        <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {settings.preferredWritingSystem === 'traditional' &&
                          (item.languageSpecific as any)?.traditional
                            ? (item.languageSpecific as any).traditional
                            : item.word}
                        </div>
                        {item.pronunciation && (
                          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                            {item.pronunciation}
                          </div>
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {item.meaning}
                        </p>
                      </div>

                      {/* Language-Specific Chips */}
                      {item.languageSpecific && (
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          {item.languageSpecific.type === 'mandarin' && (
                            <>
                              {item.languageSpecific.data.hskLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-[9px] font-semibold">
                                  {item.languageSpecific.data.hskLevel}
                                </span>
                              )}
                              {item.languageSpecific.data.tones && (
                                <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 text-[9px]">
                                  Tones {item.languageSpecific.data.tones.join('-')}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'japanese' && (
                            <>
                              {item.languageSpecific.data.jlptLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-[9px] font-semibold">
                                  {item.languageSpecific.data.jlptLevel}
                                </span>
                              )}
                              {item.languageSpecific.data.hiragana && (
                                <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 text-[9px]">
                                  {item.languageSpecific.data.hiragana}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'korean' && (
                            <>
                              {item.languageSpecific.data.topikLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[9px] font-semibold">
                                  {item.languageSpecific.data.topikLevel}
                                </span>
                              )}
                              {item.languageSpecific.data.speechLevel && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[9px] capitalize">
                                  {item.languageSpecific.data.speechLevel}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'spanish' && (
                            <>
                              {item.languageSpecific.data.gender && item.languageSpecific.data.gender !== 'invariable' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[9px] capitalize">
                                  {item.languageSpecific.data.gender}
                                </span>
                              )}
                              {item.languageSpecific.data.article && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono">
                                  {item.languageSpecific.data.article}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'french' && (
                            <>
                              {item.languageSpecific.data.gender && item.languageSpecific.data.gender !== 'invariable' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[9px] capitalize">
                                  {item.languageSpecific.data.gender}
                                </span>
                              )}
                              {item.languageSpecific.data.article && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono">
                                  {item.languageSpecific.data.article}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'german' && (
                            <>
                              {item.languageSpecific.data.article && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[9px] font-bold">
                                  {item.languageSpecific.data.article}
                                </span>
                              )}
                            </>
                          )}
                          {item.languageSpecific.type === 'cantonese' && (
                            <>
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 text-[9px]">
                                {item.languageSpecific.data.jyutping}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate max-w-[120px]">{item.category}</span>
                      <span className="capitalize">{item.difficulty}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredDeckWords.map((item) => {
                const isSelected = selectedWord?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedWord(item)}
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {settings.preferredWritingSystem === 'traditional' && item.traditionalWord
                              ? item.traditionalWord
                              : item.word}
                          </div>
                          {item.phonetic && (
                            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                              {item.phonetic}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playNativeSpeech(item.word, activeVariant.speechCode, settings.speechSpeed);
                            }}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(item.id);
                            }}
                            className="p-1 rounded-md text-amber-500 hover:text-amber-600 cursor-pointer"
                          >
                            {item.isBookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                        {item.meaning}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.category}</span>
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </div>
                );
              })
            )}

            {((mode === 'library' && libraryItems.length === 0 && !isLoading) ||
              (mode === 'deck' && filteredDeckWords.length === 0)) && (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No items found matching "{searchQuery}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search terms or selecting a different category filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Deep Dive Word Breakdown Inspector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between sticky top-28 h-fit">
          {currentDisplayWord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Item Details
                </span>
                <button
                  onClick={() => onToggleBookmark(currentDisplayWord.id)}
                  className="text-xs flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 cursor-pointer"
                >
                  {currentDisplayWord.isBookmarked ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>Bookmarked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Bookmark</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {currentDisplayWord.word}
                  </span>
                  <button
                    onClick={() =>
                      playNativeSpeech(currentDisplayWord.word, activeVariant.speechCode, settings.speechSpeed)
                    }
                    className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                {currentDisplayWord.phonetic && (
                  <div className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                    {currentDisplayWord.phonetic}
                  </div>
                )}
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-2">
                  {currentDisplayWord.meaning}
                </div>
              </div>

              {/* Contextual Example Sentence */}
              {currentDisplayWord.exampleSentence && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">In Context:</span>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentDisplayWord.exampleSentence.native}
                    </p>
                    {currentDisplayWord.exampleSentence.phonetic && (
                      <p className="text-indigo-600 dark:text-indigo-400 text-[11px] font-mono">
                        {currentDisplayWord.exampleSentence.phonetic}
                      </p>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                      {currentDisplayWord.exampleSentence.translation}
                    </p>
                  </div>
                </div>
              )}

              {/* Memory Tip or Cultural Context */}
              {currentDisplayWord.memoryTip && (
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Memory Mnemonic:</span> {currentDisplayWord.memoryTip}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (onSelectWordForPractice) {
                      onSelectWordForPractice(currentDisplayWord);
                    }
                    onNavigate('practice');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Layers className="w-4 h-4" />
                  <span>Practice In Flashcards</span>
                </button>

                <button
                  onClick={() =>
                    playNativeSpeech(currentDisplayWord.word, activeVariant.speechCode, settings.speechSpeed)
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Listen Pronunciation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Compass className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select an Item to Inspect
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Explore authentic collocations, real-world context sentences, pronunciation audio, and grammar notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
