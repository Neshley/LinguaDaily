import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { GradedStory } from '../types';
import { getStoriesForLanguage } from '../data/stories';
import { speakWord } from '../utils/speech';

interface GradedReadingLabProps {
  activeVariantId: string;
  languageName: string;
}

export const GradedReadingLab: React.FC<GradedReadingLabProps> = ({
  activeVariantId,
  languageName,
}) => {
  const stories = getStoriesForLanguage(activeVariantId);
  const [selectedStory, setSelectedStory] = useState<GradedStory | null>(null);
  const [showRomanization, setShowRomanization] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  // Quiz state for selected story
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handlePlayAudio = (text: string) => {
    const isYue = activeVariantId.includes('yue') || activeVariantId === 'zh-yue';
    const speechCode = isYue ? 'zh-HK' : activeVariantId.includes('zh') ? 'zh-CN' : activeVariantId;
    speakWord(text, speechCode, 0.85, ['zh-HK', 'zh-TW', 'zh-CN']);
  };

  const handleSelectStory = (story: GradedStory) => {
    setSelectedStory(story);
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div id="graded-reading-lab-container" className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-cyan-900 via-sky-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/20 border border-sky-400/30 text-xs font-semibold uppercase tracking-wider text-sky-300">
            <BookOpen className="w-3.5 h-3.5" /> Graded Reading & Immersion Lab
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {languageName} Comprehensive Reading
          </h2>
          <p className="text-xs text-sky-100/80 leading-relaxed">
            Read authentic, level-appropriate short stories with toggleable phonetic guides, native audio narration, and comprehension checks.
          </p>
        </div>
      </div>

      {!selectedStory ? (
        /* Stories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((story) => (
            <div
              key={story.id}
              id={`story-card-${story.id}`}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40">
                    {story.level}
                  </span>
                  <span className="text-xs text-slate-400">{story.topic}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {story.title}
                  </h3>
                  <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                    {story.titleRomanization}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                    "{story.titleTranslation}"
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {story.vocabularyHighlights.map((v, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {v.word} ({v.meaning})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-xs text-slate-400">
                  {story.paragraphs.flat().length} sentences • {story.comprehensionQuestions.length} quiz questions
                </span>
                <button
                  id={`open-story-btn-${story.id}`}
                  onClick={() => handleSelectStory(story)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Selected Story Reader View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedStory(null)}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Stories
            </button>

            {/* Reading Assistance Toggles */}
            <div className="flex items-center gap-2">
              <button
                id="toggle-pinyin-btn"
                onClick={() => setShowRomanization(!showRomanization)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  showRomanization
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                {showRomanization ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Pinyin / Jyutping Guide</span>
              </button>
              <button
                id="toggle-translation-btn"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  showTranslation
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>English Translations</span>
              </button>
            </div>
          </div>

          {/* Reader Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {selectedStory.level} • {selectedStory.topic}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {selectedStory.title}
                </h3>
                <div className="text-sm text-sky-600 dark:text-sky-400 font-medium">
                  {selectedStory.titleRomanization}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                  "{selectedStory.titleTranslation}"
                </div>
              </div>

              <button
                id="play-full-story-audio-btn"
                onClick={() => handlePlayAudio(selectedStory.audioText)}
                className="px-4 py-2 bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 text-sky-800 dark:text-sky-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen to Story</span>
              </button>
            </div>

            {/* Paragraphs and tokenized sentences */}
            <div className="space-y-6 text-slate-900 dark:text-white leading-relaxed">
              {selectedStory.paragraphs.map((paragraph, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/50 space-y-3"
                >
                  {paragraph.map((sentence, sIdx) => (
                    <div key={sIdx} className="group hover:bg-sky-50/60 dark:hover:bg-sky-950/20 p-2 rounded-lg transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-lg font-bold tracking-wide">
                            {sentence.native}
                          </p>
                          {showRomanization && (
                            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                              {sentence.romanization}
                            </p>
                          )}
                          {showTranslation && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                              {sentence.translation}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handlePlayAudio(sentence.native)}
                          className="opacity-40 group-hover:opacity-100 p-1 text-sky-600 dark:text-sky-400 hover:text-sky-800 transition-opacity"
                          title="Listen to sentence"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Vocabulary Bank */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vocabulary Highlights in this Story:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedStory.vocabularyHighlights.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">{v.word}</div>
                    <div className="text-[11px] text-sky-600 dark:text-sky-400">{v.romanization}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{v.meaning}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehension Quiz */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <HelpCircle className="w-4 h-4 text-sky-500" />
                <span>Reading Comprehension Check</span>
              </div>

              <div className="space-y-4">
                {selectedStory.comprehensionQuestions.map((q, qIdx) => {
                  const selected = userAnswers[qIdx];
                  const isCorrect = selected === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {qIdx + 1}. {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let btnClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                            } else if (isOptionSelected) {
                              btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                            }
                          } else if (isOptionSelected) {
                            btnClass = 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                              className={`p-2.5 rounded-lg border text-xs text-left transition-all ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-2.5 rounded-lg text-xs flex items-start gap-1.5 ${
                            isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted ? (
                <div className="flex justify-end">
                  <button
                    id="submit-quiz-btn"
                    disabled={Object.keys(userAnswers).length < selectedStory.comprehensionQuestions.length}
                    onClick={() => setQuizSubmitted(true)}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    Check Answers
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setUserAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
