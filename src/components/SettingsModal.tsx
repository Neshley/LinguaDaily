import React from 'react';
import { X, Sliders, Volume2, Target, RotateCcw } from 'lucide-react';
import { OfflineLearningPanel } from './OfflineLearningPanel';
import { DailyGoalSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DailyGoalSettings;
  onUpdateSettings: (newSettings: Partial<DailyGoalSettings>) => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-slate-900 text-base">Practice Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Goal Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              Daily Vocabulary Target
            </span>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {settings.targetWordsPerDay} words/day
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((count) => (
              <button
                key={count}
                onClick={() => onUpdateSettings({ targetWordsPerDay: count })}
                className={`py-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                  settings.targetWordsPerDay === count
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {count} words
              </button>
            ))}
          </div>
        </div>

        {/* Default Pronunciation Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-slate-600" />
              Audio Speed
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {settings.speechSpeed}x
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 0.75, label: 'Slow (0.75x)' },
              { val: 0.9, label: 'Standard (0.9x)' },
              { val: 1.0, label: 'Natural (1.0x)' },
            ].map((sp) => (
              <button
                key={sp.val}
                onClick={() => onUpdateSettings({ speechSpeed: sp.val })}
                className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                  settings.speechSpeed === sp.val
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-800 block">Auto-Play Audio</span>
              <span className="text-[11px] text-slate-500">Play pronunciation automatically on card view</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlayAudio}
              onChange={(e) => onUpdateSettings({ autoPlayAudio: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-medium text-slate-800 block">Show Phonetics by Default</span>
              <span className="text-[11px] text-slate-500">Display pinyin / romaji reading on initial card side</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showPhoneticByDefault}
              onChange={(e) => onUpdateSettings({ showPhoneticByDefault: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
          </label>
        </div>

        {/* Offline learning */}
        <div className="border-t border-slate-100 pt-4">
          <OfflineLearningPanel embedded />
        </div>

        {/* Danger zone / reset */}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
          <button
            onClick={onResetStats}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Practice History
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
