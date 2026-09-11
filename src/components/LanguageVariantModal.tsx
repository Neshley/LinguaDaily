import React, { useState } from 'react';
import {
  X,
  Globe2,
  Check,
  Sliders,
} from 'lucide-react';
import { LANGUAGE_FAMILIES } from '../data/languageFamilies';
import { LanguageFamilyId, SupportedLanguageId } from '../types';

interface LanguageVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVariantId?: string;
  currentLanguageId?: string;
  onSelectVariant: (
    familyId: LanguageFamilyId,
    variantId: SupportedLanguageId,
    writingSystemId: string,
    pronunciationSystemId: string
  ) => void;
  preferredWritingSystem?: 'simplified' | 'traditional';
  onWritingSystemChange?: (system: 'simplified' | 'traditional') => void;
}

export const LanguageVariantModal: React.FC<LanguageVariantModalProps> = ({
  isOpen,
  onClose,
  activeVariantId,
  currentLanguageId,
  onSelectVariant,
  preferredWritingSystem = 'simplified',
  onWritingSystemChange,
}) => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<LanguageFamilyId>('sinitic');

  if (!isOpen) return null;

  const activeId = activeVariantId || currentLanguageId || 'zh';
  const currentFamily = LANGUAGE_FAMILIES.find((f) => f.id === selectedFamilyId) || LANGUAGE_FAMILIES[0];

  return (
    <div
      id="language-variant-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="language-variant-modal-card"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Language Families &amp; Regional Varieties
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore Sinitic varieties (Mandarin, Cantonese, Shanghainese, Hokkien) and global languages
              </p>
            </div>
          </div>
          <button
            id="close-language-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Settings Strip (Writing System & Script) */}
        {onWritingSystemChange && (
          <div className="px-6 py-3 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
              <Sliders className="w-4 h-4" />
              <span>Chinese Character Preference:</span>
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-amber-200 dark:border-amber-900/40 shadow-xs">
              <button
                id="pref-simplified-btn"
                onClick={() => onWritingSystemChange('simplified')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  preferredWritingSystem === 'simplified'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                简体字 (Simplified — China, Singapore)
              </button>
              <button
                id="pref-traditional-btn"
                onClick={() => onWritingSystemChange('traditional')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  preferredWritingSystem === 'traditional'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                繁體字 (Traditional — HK, Taiwan)
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: Left sidebar for Families, Right main pane for Varieties */}
        <div className="flex-1 flex overflow-hidden">
          {/* Family Tabs */}
          <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-4 space-y-2 bg-slate-50/30 dark:bg-slate-900/30">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Language Families
            </div>
            {LANGUAGE_FAMILIES.map((family) => {
              const isSelected = family.id === selectedFamilyId;
              const hasActive = family.varieties.some(
                (v) => v.id === activeId || (activeId === 'zh' && v.id === 'zh-cmn')
              );
              return (
                <button
                  key={family.id}
                  id={`family-tab-${family.id}`}
                  onClick={() => {
                    setSelectedFamilyId(family.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-xs text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{family.icon}</span>
                    <div>
                      <div className="text-sm">{family.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {family.varieties.length}{' '}
                        {family.varieties.length === 1 ? 'variety' : 'varieties'}
                      </div>
                    </div>
                  </div>
                  {hasActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Variants Grid */}
          <div className="w-2/3 p-6 overflow-y-auto space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentFamily.icon}</span>
                <span>{currentFamily.name}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentFamily.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentFamily.varieties.map((variant) => {
                const isActive =
                  variant.id === activeId ||
                  (activeId === 'zh' && variant.id === 'zh-cmn');

                return (
                  <div
                    key={variant.id}
                    id={`variant-card-${variant.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{variant.flag}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {variant.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              ({variant.nativeName})
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Framework: {variant.proficiencyFramework.name} • {variant.proficiencyFramework.levels.slice(0, 3).join(', ')}...
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <button
                          id={`select-variant-${variant.id}`}
                          onClick={() => {
                            const targetId: SupportedLanguageId =
                              variant.id === 'zh-cmn' ? 'zh' : (variant.id as SupportedLanguageId);
                            onSelectVariant(
                              currentFamily.id,
                              targetId,
                              variant.defaultWritingSystemId,
                              variant.defaultPronunciationSystemId
                            );
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors cursor-pointer"
                        >
                          Select Variety
                        </button>
                      )}
                    </div>

                    {/* Variant Capabilities & Tones Tag Strip */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        🗣️ {variant.capabilities.supportsTones ? (variant.id === 'zh-yue' ? '6 Lexical Tones' : '4 Lexical Tones') : 'Pitch/Stress Accent'}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        🔤 {variant.pronunciationSystems.map((p) => p.name).join(', ')}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        ✍️ {variant.writingSystems.map((w) => w.name).join(' / ')}
                      </span>
                    </div>

                    {/* Dialect Description */}
                    {variant.description && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {variant.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Active Family: <strong className="text-slate-700 dark:text-slate-300">{currentFamily.name}</strong>
          </span>
          <span>Architected for extensible Sinitic and global language families</span>
        </div>
      </div>
    </div>
  );
};
