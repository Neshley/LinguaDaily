import React, { useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { MANDARIN_TONE_COLORS, CANTONESE_TONE_COLORS } from '../data/languageFamilies';
import { speakWord } from '../utils/speech';
import { ToneInfo } from '../types';

interface ToneVisualizerProps {
  tones?: ToneInfo[];
  showInteractiveGuide?: boolean;
  languageId?: string;
}

export const ToneVisualizer: React.FC<ToneVisualizerProps> = ({
  tones,
  showInteractiveGuide = false,
  languageId = 'zh',
}) => {
  const isCantonese = languageId === 'zh-yue' || languageId.includes('yue');
  const [toneSystem, setToneSystem] = useState<'mandarin' | 'cantonese'>(
    isCantonese ? 'cantonese' : 'mandarin'
  );
  const [activeTab, setActiveTab] = useState<number>(1);

  // Sample words
  const mandarinSamples: Record<number, { hanzi: string; pinyin: string; meaning: string }> = {
    1: { hanzi: '妈 (mā)', pinyin: 'mā', meaning: 'Mother' },
    2: { hanzi: '麻 (má)', pinyin: 'má', meaning: 'Hemp' },
    3: { hanzi: '马 (mǎ)', pinyin: 'mǎ', meaning: 'Horse' },
    4: { hanzi: '骂 (mà)', pinyin: 'mà', meaning: 'To scold' },
    0: { hanzi: '吗 (ma)', pinyin: 'ma', meaning: 'Question particle' },
  };

  const cantoneseSamples: Record<number, { hanzi: string; pinyin: string; meaning: string }> = {
    1: { hanzi: '詩 (si1)', pinyin: 'si1', meaning: 'Poem (High Flat 55)' },
    2: { hanzi: '史 (si2)', pinyin: 'si2', meaning: 'History (High Rising 25)' },
    3: { hanzi: '試 (si3)', pinyin: 'si3', meaning: 'To try (Mid Level 33)' },
    4: { hanzi: '時 (si4)', pinyin: 'si4', meaning: 'Time (Low Falling 21)' },
    5: { hanzi: '市 (si5)', pinyin: 'si5', meaning: 'Market (Low Rising 23)' },
    6: { hanzi: '事 (si6)', pinyin: 'si6', meaning: 'Matter (Low Level 22)' },
  };

  const handlePlaySample = (toneNumber: number) => {
    if (toneSystem === 'mandarin') {
      const sample = mandarinSamples[toneNumber];
      if (sample) speakWord(sample.hanzi.split(' ')[0], 'zh-CN', 0.85);
    } else {
      const sample = cantoneseSamples[toneNumber];
      if (sample) speakWord(sample.hanzi.split(' ')[0], 'zh-HK', 0.85, ['zh-HK', 'zh-TW']);
    }
  };

  const renderMandarinCurve = (tone: number) => {
    switch (tone) {
      case 1:
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <line x1="15" y1="18" x2="105" y2="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="15" cy="18" r="4" fill="currentColor" />
            <circle cx="105" cy="18" r="4" fill="currentColor" />
            <text x="60" y="44" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              Pitch 5 → 5 (High Flat)
            </text>
          </svg>
        );
      case 2:
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <path d="M 20,48 Q 60,40 100,18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="48" r="4" fill="currentColor" />
            <circle cx="100" cy="18" r="4" fill="currentColor" />
            <text x="60" y="62" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              Pitch 3 → 5 (Rising)
            </text>
          </svg>
        );
      case 3:
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <path d="M 20,38 Q 50,60 65,60 Q 80,60 105,25" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="38" r="4" fill="currentColor" />
            <circle cx="65" cy="60" r="3" fill="currentColor" />
            <circle cx="105" cy="25" r="4" fill="currentColor" />
            <text x="60" y="68" textAnchor="middle" fontSize="9" fill="currentColor" className="opacity-70 font-mono">
              Pitch 2 → 1 → 4 (Dipping)
            </text>
          </svg>
        );
      case 4:
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <path d="M 20,18 Q 60,35 100,56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="18" r="4" fill="currentColor" />
            <circle cx="100" cy="56" r="4" fill="currentColor" />
            <text x="60" y="38" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              Pitch 5 → 1 (Falling)
            </text>
          </svg>
        );
      default:
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <circle cx="60" cy="40" r="6" fill="currentColor" opacity="0.6" />
            <text x="60" y="60" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              Pitch 2 (Light / Quick)
            </text>
          </svg>
        );
    }
  };

  const renderCantoneseCurve = (tone: number) => {
    switch (tone) {
      case 1: // 55 High Level
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <line x1="15" y1="18" x2="105" y2="18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="15" cy="18" r="4" fill="currentColor" />
            <circle cx="105" cy="18" r="4" fill="currentColor" />
            <text x="60" y="44" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              陰平 55 (High Level)
            </text>
          </svg>
        );
      case 2: // 25 High Rising
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <path d="M 20,52 Q 60,36 100,18" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="52" r="4" fill="currentColor" />
            <circle cx="100" cy="18" r="4" fill="currentColor" />
            <text x="60" y="64" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              陰上 25 (High Rising)
            </text>
          </svg>
        );
      case 3: // 33 Mid Level
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <line x1="15" y1="36" x2="105" y2="36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="15" cy="36" r="4" fill="currentColor" />
            <circle cx="105" cy="36" r="4" fill="currentColor" />
            <text x="60" y="58" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              陰去 33 (Mid Level)
            </text>
          </svg>
        );
      case 4: // 21 Low Falling
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <path d="M 20,48 Q 60,54 100,62" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="48" r="4" fill="currentColor" />
            <circle cx="100" cy="62" r="4" fill="currentColor" />
            <text x="60" y="38" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              陽平 21 (Low Falling)
            </text>
          </svg>
        );
      case 5: // 23 Low Rising
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <path d="M 20,58 Q 60,50 100,38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="20" cy="58" r="4" fill="currentColor" />
            <circle cx="100" cy="38" r="4" fill="currentColor" />
            <text x="60" y="26" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              陽上 23 (Low Rising)
            </text>
          </svg>
        );
      case 6: // 22 Low Level
      default:
        return (
          <svg className="w-full h-16" viewBox="0 0 120 70">
            <line x1="15" y1="56" x2="105" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <circle cx="15" cy="56" r="4" fill="currentColor" />
            <circle cx="105" cy="56" r="4" fill="currentColor" />
            <text x="60" y="42" textAnchor="middle" fontSize="10" fill="currentColor" className="opacity-70 font-mono">
              陽去 22 (Low Level)
            </text>
          </svg>
        );
    }
  };

  const currentTonesMap = toneSystem === 'mandarin' ? MANDARIN_TONE_COLORS : CANTONESE_TONE_COLORS;
  const currentTabKeys = toneSystem === 'mandarin' ? [1, 2, 3, 4, 0] : [1, 2, 3, 4, 5, 6];

  return (
    <div id="tone-visualizer-container" className="space-y-4">
      {/* Visual Tone Badges if passed */}
      {tones && tones.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {tones.map((t, idx) => {
            const conf = currentTonesMap[t.tone] || currentTonesMap[1];
            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}
              >
                <span className="font-mono font-bold">{t.syllable}</span>
                <span className="opacity-70">•</span>
                <span>{conf.name} ({conf.contour})</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Interactive Pitch Guide */}
      {showInteractiveGuide && (
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Interactive Tone Master Studio
                </span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  {toneSystem === 'mandarin' ? '4 Mandarin Tones' : '6 Cantonese Tones'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch tone systems, listen to native minimal pairs, and trace pitch contours.
              </p>
            </div>

            {/* Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
              <button
                id="btn-tone-system-mandarin"
                onClick={() => {
                  setToneSystem('mandarin');
                  setActiveTab(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  toneSystem === 'mandarin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Mandarin (4 Tones)
              </button>
              <button
                id="btn-tone-system-cantonese"
                onClick={() => {
                  setToneSystem('cantonese');
                  setActiveTab(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  toneSystem === 'cantonese'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Cantonese (6 Tones)
              </button>
            </div>
          </div>

          {/* Tone Tab Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5">
            {currentTabKeys.map((t) => {
              const conf = currentTonesMap[t] || currentTonesMap[1];
              return (
                <button
                  key={t}
                  id={`btn-tone-tab-${t}`}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === t
                      ? `${conf.bg} ${conf.text} shadow-xs font-bold ring-1 ring-inset ${conf.border}`
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t === 0 ? 'Neutral' : `Tone ${t}`}
                </button>
              );
            })}
          </div>

          {/* Active Tone Breakdown Card */}
          {(() => {
            const conf = currentTonesMap[activeTab] || currentTonesMap[1];
            const sample =
              toneSystem === 'mandarin'
                ? mandarinSamples[activeTab] || mandarinSamples[1]
                : cantoneseSamples[activeTab] || cantoneseSamples[1];

            return (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${conf.bg} ${conf.text}`}>
                      {conf.contour}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{conf.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{conf.description}</p>
                </div>

                <div className={`${conf.text} flex items-center justify-center`}>
                  {toneSystem === 'mandarin' ? renderMandarinCurve(activeTab) : renderCantoneseCurve(activeTab)}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-700">
                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900 dark:text-white">{sample.hanzi}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{sample.meaning}</div>
                  </div>
                  <button
                    id="btn-play-tone-sample"
                    onClick={() => handlePlaySample(activeTab)}
                    className="p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                    title="Listen to native audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
