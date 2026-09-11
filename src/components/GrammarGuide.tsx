import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  AlertTriangle,
  Lightbulb,
  Search,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { GrammarPoint } from '../types';
import { getGrammarForLanguage } from '../data/grammar';
import { speakWord } from '../utils/speech';

interface GrammarGuideProps {
  activeVariantId: string;
  languageName: string;
}

export const GrammarGuide: React.FC<GrammarGuideProps> = ({
  activeVariantId,
  languageName,
}) => {
  const grammarPoints = getGrammarForLanguage(activeVariantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(grammarPoints.map((g) => g.category)))];

  const filteredPoints = grammarPoints.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.structure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePlayAudio = (text: string) => {
    const isYue = activeVariantId.includes('yue') || activeVariantId === 'zh-yue';
    const speechCode = isYue ? 'zh-HK' : activeVariantId.includes('zh') ? 'zh-CN' : activeVariantId;
    speakWord(text, speechCode, 0.9, ['zh-HK', 'zh-TW', 'zh-CN']);
  };

  return (
    <div id="grammar-guide-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <BookOpen className="w-3.5 h-3.5" /> Grammar & Sentence Patterns
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {languageName} Structural Blueprints
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Master the core sentence formulas, question particles, negation rules, and syntactic differences that distinguish native speech.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="grammar-search-input"
            type="text"
            placeholder="Search grammar or formula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`grammar-cat-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grammar Cards Grid */}
      {filteredPoints.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-500">
          No grammar rules matched your filter. Try adjusting your search query!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPoints.map((point) => (
            <div
              key={point.id}
              id={`grammar-card-${point.id}`}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                    {point.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{point.level}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {point.title}
                  </h3>
                  {/* Structure Formula Formula pill */}
                  <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    {point.structure}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {point.explanation}
                </p>

                {/* Real Context Examples */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    High-Frequency Examples:
                  </div>
                  {point.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ex.native}
                        </span>
                        <button
                          onClick={() => handlePlayAudio(ex.native)}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 p-0.5"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {ex.phonetic}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ex.translation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Pitfall warning if present */}
              {point.commonMistakes && (
                <div className="bg-amber-50/80 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Common Pitfall: </span>
                    <span>{point.commonMistakes}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
