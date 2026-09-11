import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Layers,
  Mic,
  Compass,
} from 'lucide-react';
import {
  DailyGoalSettings,
  LanguageVariant,
  MainNavigationTab,
  VocabularyWord,
} from '../types';
import { playNativeSpeech } from '../utils/speech';

interface LearnViewProps {
  activeVariant: LanguageVariant;
  words: VocabularyWord[];
  settings: DailyGoalSettings;
  onNavigate: (tab: MainNavigationTab) => void;
  onToggleBookmark: (id: string) => void;
  onSelectWordForPractice?: (word: VocabularyWord) => void;
}

const TOPICS = [
  { id: 'all', label: 'All Topics' },
  { id: 'Daily Essentials', label: 'Daily Essentials' },
  { id: 'Food & Drink', label: 'Food & Drink' },
  { id: 'Travel & Places', label: 'Travel & Places' },
  { id: 'Social & Feelings', label: 'Social & Feelings' },
  { id: 'Time & Numbers', label: 'Time & Numbers' },
  { id: 'Work & Study', label: 'Work & Study' },
  { id: 'Culture & Customs', label: 'Culture & Customs' },
];

export const LearnView: React.FC<LearnViewProps> = ({
  activeVariant,
  words,
  settings,
  onNavigate,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((item) => {
      const matchesTopic = selectedTopic === 'all' || item.category === selectedTopic;
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
  }, [words, selectedTopic, searchQuery]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header & Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Discovery & Exploration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Learn {activeVariant.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse words and phrases freely. Pick any topic to begin studying immediately.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeVariant.name}, meaning, pronunciation...`}
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 2. Topic Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedTopic === topic.id
                  ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Word Discovery Grid & Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Words Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Showing {filteredWords.length} items</span>
            <span className="text-[11px]">Click any item for details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredWords.map((item) => {
              const isSelected = selectedWord?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedWord(item)}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          {settings.preferredWritingSystem === 'traditional' && item.traditionalWord
                            ? item.traditionalWord
                            : item.word}
                        </span>
                        {item.phonetic && (
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.phonetic}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {item.meaning}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playNativeSpeech(item.word, activeVariant.speechCode, settings.speechSpeed);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title="Pronounce"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(item.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 cursor-pointer"
                        title="Bookmark"
                      >
                        {item.isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {item.partOfSpeech}
                    </span>
                    <span className="capitalize">{item.status}</span>
                  </div>
                </div>
              );
            })}

            {filteredWords.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No words found matching "{searchQuery}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try another search or select a different topic filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Word Deep-Dive Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between sticky top-32">
          {selectedWord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Word Breakdown
                </span>
                <button
                  onClick={() => onToggleBookmark(selectedWord.id)}
                  className="text-xs flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 cursor-pointer"
                >
                  {selectedWord.isBookmarked ? (
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
                    {selectedWord.word}
                  </span>
                  <button
                    onClick={() => playNativeSpeech(selectedWord.word, activeVariant.speechCode, settings.speechSpeed)}
                    className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                {selectedWord.phonetic && (
                  <div className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    {selectedWord.phonetic}
                  </div>
                )}
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-2">
                  {selectedWord.meaning}
                </div>
              </div>

              {/* Character Details (Radicals, Strokes) if available */}
              {selectedWord.characterDetail && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  {selectedWord.characterDetail.radicals && (
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">Radical:</span>{' '}
                      {selectedWord.characterDetail.radicals}
                    </div>
                  )}
                  {selectedWord.characterDetail.strokeCount && (
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">Strokes:</span>{' '}
                      {selectedWord.characterDetail.strokeCount}
                    </div>
                  )}
                  {selectedWord.characterDetail.literalBreakdown && (
                    <div className="text-slate-500 dark:text-slate-400 italic">
                      "{selectedWord.characterDetail.literalBreakdown}"
                    </div>
                  )}
                </div>
              )}

              {/* Example Sentence */}
              {selectedWord.exampleSentence && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">In Context:</span>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedWord.exampleSentence.native}
                    </p>
                    {selectedWord.exampleSentence.phonetic && (
                      <p className="text-indigo-600 dark:text-indigo-400 text-[11px] mt-0.5">
                        {selectedWord.exampleSentence.phonetic}
                      </p>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {selectedWord.exampleSentence.translation}
                    </p>
                  </div>
                </div>
              )}

              {/* Memory Tip */}
              {selectedWord.memoryTip && (
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Memory Tip:</span> {selectedWord.memoryTip}
                </div>
              )}

              {/* Quick Jump-in Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Practice In Flashcards</span>
                </button>
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Test Pronunciation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Compass className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select a Word to Inspect
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Explore radicals, stroke counts, contextual sentences, audio, and memory mnemonics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
