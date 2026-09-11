import React, { useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Globe2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { LanguageVariant, VocabularyWord } from '../types';
import { GrammarGuide } from '../components/GrammarGuide';
import { GradedReadingLab } from '../components/GradedReadingLab';

interface ExploreViewProps {
  activeVariant: LanguageVariant;
  words: VocabularyWord[];
}

type ExploreTab = 'grammar' | 'reading' | 'culture';

export const ExploreView: React.FC<ExploreViewProps> = ({
  activeVariant,
  words,
}) => {
  const [activeTab, setActiveTab] = useState<ExploreTab>('grammar');

  // Words that have cultural or regional notes
  const culturalWords = words.filter(
    (w) => w.culturalNote || w.regionalUsage || w.memoryTip
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-1">
              <BookMarked className="w-3.5 h-3.5" />
              <span>Language Insights</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Explore {activeVariant.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grammar structures, graded reading immersion, and authentic cultural context.
            </p>
          </div>

          {/* Tab Pill Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('grammar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'grammar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Grammar</span>
            </button>

            <button
              onClick={() => setActiveTab('reading')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'reading'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Graded Reading</span>
            </button>

            <button
              onClick={() => setActiveTab('culture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'culture'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Culture & Context</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-views */}
      {activeTab === 'grammar' && (
        <GrammarGuide activeVariantId={activeVariant.id} languageName={activeVariant.name} />
      )}

      {activeTab === 'reading' && (
        <GradedReadingLab activeVariantId={activeVariant.id} languageName={activeVariant.name} />
      )}

      {activeTab === 'culture' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {culturalWords.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {item.word}
                    </span>
                    {item.phonetic && (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.phonetic}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {item.meaning}
                  </div>

                  {item.culturalNote && (
                    <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 mb-2">
                      <span className="font-semibold block mb-0.5">Cultural Note:</span>
                      {item.culturalNote}
                    </div>
                  )}

                  {item.regionalUsage && (
                    <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold block mb-0.5">Regional Context:</span>
                      {item.regionalUsage}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{activeVariant.name}</span>
                  <span>{item.category}</span>
                </div>
              </div>
            ))}
          </div>

          {culturalWords.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No cultural notes available for this specific view yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Explore grammar blueprints or graded reading stories above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
