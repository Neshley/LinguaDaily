import React, { useState } from 'react';
import { Sparkles, Send, Volume2, CheckCircle2, ChevronLeft, Loader2, BookOpen, Lightbulb } from 'lucide-react';
import { LanguageMeta, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';

interface AiSentenceStudioProps {
  words: VocabularyWord[];
  language: LanguageMeta;
  onBackToDashboard: () => void;
}

interface FeedbackResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correction: string;
  correctionPhonetic?: string;
  translation: string;
}

export const AiSentenceStudio: React.FC<AiSentenceStudioProps> = ({
  words,
  language,
  onBackToDashboard,
}) => {
  const [selectedWord, setSelectedWord] = useState<VocabularyWord>(words[0] || null);
  const [userSentence, setUserSentence] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<FeedbackResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSentence.trim() || !selectedWord) return;

    setIsLoading(true);
    setErrorMessage(null);
    setEvaluation(null);

    try {
      const res = await fetch('/api/gemini/dialogue-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: selectedWord.word,
          language: language.name,
          userSentence: userSentence.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.evaluation) {
        setEvaluation(json.evaluation);
      } else {
        setErrorMessage(json.error || 'Evaluation could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = (text: string) => {
    speakWord(text, language.speechCode, 0.85);
  };

  const handleInsertWord = () => {
    if (!selectedWord) return;
    setUserSentence((prev) => (prev ? `${prev} ${selectedWord.word}` : selectedWord.word));
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="btn-ai-studio-back"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Dashboard
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Sentence Practice Partner</span>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Sentence Construction Studio</h2>
          <p className="text-xs text-slate-500">
            Write your own original sentence in {language.name} using the target word. Our AI linguist checks grammar, tone harmony, and natural nuance.
          </p>
        </div>

        {/* Word Selector */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Target Word to Practice:
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
            {words.map((w) => {
              const isSelected = selectedWord?.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    setSelectedWord(w);
                    setEvaluation(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{w.word}</span>
                  <span className="opacity-60 text-[10px] ml-1 font-mono">({w.meaning})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Word Highlight */}
        {selectedWord && (
          <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-900 font-serif">{selectedWord.word}</span>
              <div>
                <span className="text-xs text-indigo-600 font-mono font-medium">{selectedWord.phonetic}</span>
                <span className="text-xs text-slate-500 block">{selectedWord.meaning}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInsertWord}
                className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 px-2.5 py-1 rounded-md hover:bg-indigo-50"
              >
                + Insert Word
              </button>
              <button
                onClick={() => handlePlayAudio(selectedWord.word)}
                className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-700"
                title="Listen to word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="user-sentence-input" className="block text-xs font-semibold text-slate-700">
            Your Sentence in {language.name}:
          </label>
          <textarea
            id="user-sentence-input"
            rows={3}
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder={`e.g. Try writing a sentence with ${selectedWord ? selectedWord.word : 'the word'}...`}
            className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Tip: You can use your mobile or computer's native {language.name} keyboard or pinyin!</span>
            </div>
            <button
              type="submit"
              disabled={isLoading || !userSentence.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Evaluate Sentence</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {/* Feedback Card */}
        {evaluation && (
          <div
            className={`p-5 rounded-xl border text-sm space-y-4 ${
              evaluation.score >= 85
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Linguistic Assessment
                </span>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200">
                Score: {evaluation.score}/100
              </span>
            </div>

            <div>
              <p className="text-xs font-medium leading-relaxed">{evaluation.feedback}</p>
            </div>

            {/* Polished Native Version */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Polished Native Phrasing:
                </span>
                <button
                  onClick={() => handlePlayAudio(evaluation.correction)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-700"
                  title="Listen to native pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-base font-bold text-slate-900">{evaluation.correction}</p>
              {evaluation.correctionPhonetic && (
                <p className="text-xs text-indigo-600 font-mono">{evaluation.correctionPhonetic}</p>
              )}
              <p className="text-xs text-slate-500 italic">{evaluation.translation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
