import React, { useState } from 'react';
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  BookOpen,
  HelpCircle,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import { CourseLesson, LessonExercise, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';

interface LessonPlayerProps {
  lesson: CourseLesson;
  languageCode: string;
  onClose: () => void;
  onCompleteLesson: (lessonId: string, earnedXp: number) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  languageCode,
  onClose,
  onCompleteLesson,
}) => {
  // Steps: 'intro' -> 'vocab' -> 'exercises' -> 'culture' -> 'dialogue' -> 'completed'
  const [currentStep, setCurrentStep] = useState<'intro' | 'vocab' | 'exercises' | 'culture' | 'dialogue' | 'completed'>('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);

  // Exercise interaction state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [arrangedTokens, setArrangedTokens] = useState<string[]>([]);
  const [userXpEarned, setUserXpEarned] = useState(0);

  const currentVocab = lesson.vocabulary[vocabIndex];
  const currentExercise = lesson.exercises[exerciseIndex];

  const handlePlayAudio = (text: string) => {
    const isYue = languageCode.includes('yue') || languageCode === 'zh-yue';
    const speechCode = isYue ? 'zh-HK' : languageCode.includes('zh') ? 'zh-CN' : languageCode;
    speakWord(text, speechCode, 0.9, ['zh-HK', 'zh-TW', 'zh-CN']);
  };

  const handleNextVocab = () => {
    if (vocabIndex < lesson.vocabulary.length - 1) {
      setVocabIndex((prev) => prev + 1);
    } else {
      setCurrentStep('exercises');
    }
  };

  const handleCheckMultipleChoice = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
    const correct = option === currentExercise.correctAnswer;
    setIsAnswerCorrect(correct);
    setIsAnswerSubmitted(true);
    if (correct) {
      setUserXpEarned((prev) => prev + 10);
    }
  };

  const handleCheckSentenceArrange = () => {
    if (isAnswerSubmitted || arrangedTokens.length === 0) return;
    const combined = arrangedTokens.join(' ').trim();
    const correct = combined === currentExercise.correctAnswer?.trim();
    setIsAnswerCorrect(correct);
    setIsAnswerSubmitted(true);
    if (correct) {
      setUserXpEarned((prev) => prev + 15);
    }
  };

  const handleNextExercise = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(null);
    setArrangedTokens([]);

    if (exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
    } else {
      if (lesson.culturalInsight) {
        setCurrentStep('culture');
      } else if (lesson.dialogue && lesson.dialogue.length > 0) {
        setCurrentStep('dialogue');
      } else {
        finishLesson();
      }
    }
  };

  const finishLesson = () => {
    const totalXp = userXpEarned + 25; // Base XP for completing the unit
    setUserXpEarned(totalXp);
    setCurrentStep('completed');
    onCompleteLesson(lesson.id, totalXp);
  };

  return (
    <div
      id="lesson-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="lesson-player-card"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Top Header Progress Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md">
              {lesson.estimatedMinutes} min lesson
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
              {lesson.title}
            </h3>
          </div>
          <button
            id="close-lesson-player-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Progress indicator */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300"
            style={{
              width:
                currentStep === 'intro'
                  ? '15%'
                  : currentStep === 'vocab'
                  ? `${20 + (vocabIndex / lesson.vocabulary.length) * 30}%`
                  : currentStep === 'exercises'
                  ? `${50 + (exerciseIndex / lesson.exercises.length) * 25}%`
                  : currentStep === 'culture'
                  ? '85%'
                  : currentStep === 'dialogue'
                  ? '95%'
                  : '100%',
            }}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* STEP 1: INTRO */}
          {currentStep === 'intro' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                🎯
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Learning Objective
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {lesson.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {lesson.objective}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-left max-w-md mx-auto border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  In this lesson you will master:
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>{lesson.vocabulary.length} core vocabulary words with audio and tone breakdowns</li>
                  <li>{lesson.exercises.length} interactive practice drills</li>
                  {lesson.culturalInsight && <li>Authentic cultural etiquette & native nuance</li>}
                  {lesson.dialogue && <li>Real native conversation listening exercise</li>}
                </ul>
              </div>

              <button
                id="start-lesson-step-btn"
                onClick={() => setCurrentStep('vocab')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-indigo-500/20 inline-flex items-center gap-2"
              >
                <span>Begin Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: VOCABULARY PRESENTATION */}
          {currentStep === 'vocab' && currentVocab && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Core Vocabulary ({vocabIndex + 1} of {lesson.vocabulary.length})</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentVocab.level}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-wider">
                    {currentVocab.word}
                  </span>
                  <button
                    id={`play-vocab-audio-${currentVocab.id}`}
                    onClick={() => handlePlayAudio(currentVocab.word)}
                    className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors shadow-xs"
                    title="Listen to native pronunciation"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>

                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentVocab.phonetic}
                </div>

                <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                  "{currentVocab.meaning}"
                </div>

                {/* Tone Contour Pills if available */}
                {currentVocab.toneBreakdown && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {currentVocab.toneBreakdown.map((tb, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium"
                      >
                        {tb.syllable}: Tone {tb.tone === 0 ? 'Neutral' : tb.tone}
                      </span>
                    ))}
                  </div>
                )}

                {/* Character Detail / Radicals */}
                {currentVocab.characterDetail && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-xs text-left border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      Character Breakdown & Radicals:
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      {currentVocab.characterDetail.radicals} • {currentVocab.characterDetail.literalBreakdown}
                    </p>
                  </div>
                )}

                {/* Example sentence */}
                {currentVocab.exampleSentence && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl p-3 text-left border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        In Real Context:
                      </div>
                      <button
                        onClick={() => handlePlayAudio(currentVocab.exampleSentence.native)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 p-1"
                        title="Listen to example sentence"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentVocab.exampleSentence.native}
                    </div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                      {currentVocab.exampleSentence.phonetic}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {currentVocab.exampleSentence.translation}
                    </div>
                  </div>
                )}

                {/* Memory Tip */}
                {currentVocab.memoryTip && (
                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-xs text-left border border-amber-200/60 dark:border-amber-900/40">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{currentVocab.memoryTip}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  id="next-vocab-btn"
                  onClick={handleNextVocab}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-xs flex items-center gap-2"
                >
                  <span>{vocabIndex < lesson.vocabulary.length - 1 ? 'Next Word' : 'Proceed to Practice'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTERACTIVE EXERCISES */}
          {currentStep === 'exercises' && currentExercise && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Interactive Practice ({exerciseIndex + 1} of {lesson.exercises.length})
                </span>
                <span>Type: {currentExercise.type}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {currentExercise.prompt}
                </h4>

                {/* Multiple Choice & Tone Identify */}
                {(currentExercise.type === 'multiple-choice' || currentExercise.type === 'tone-identify') && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentExercise.options?.map((option, optIdx) => {
                      const isSelected = selectedOption === option;
                      let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-300';

                      if (isAnswerSubmitted) {
                        if (option === currentExercise.correctAnswer) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                        } else if (isSelected && !isAnswerCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          id={`exercise-opt-${optIdx}`}
                          disabled={isAnswerSubmitted}
                          onClick={() => handleCheckMultipleChoice(option)}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {isAnswerSubmitted && option === currentExercise.correctAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && !isAnswerCorrect && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sentence Arrange */}
                {currentExercise.type === 'sentence-arrange' && currentExercise.tokens && (
                  <div className="space-y-4">
                    {/* Arranged drop area */}
                    <div className="min-h-[52px] p-3 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 flex flex-wrap gap-2 items-center">
                      {arrangedTokens.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Click tokens below to build the sentence...</span>
                      ) : (
                        arrangedTokens.map((token, tIdx) => (
                          <button
                            key={tIdx}
                            onClick={() => {
                              if (!isAnswerSubmitted) {
                                setArrangedTokens((prev) => prev.filter((_, i) => i !== tIdx));
                              }
                            }}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-xs hover:bg-indigo-700 transition-colors"
                          >
                            {token}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Available Tokens */}
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.tokens.map((token, idx) => {
                        const countInArranged = arrangedTokens.filter((t) => t === token).length;
                        const countInOriginal = currentExercise.tokens!.filter((t) => t === token).length;
                        const isUsed = countInArranged >= countInOriginal;

                        return (
                          <button
                            key={idx}
                            disabled={isUsed || isAnswerSubmitted}
                            onClick={() => setArrangedTokens((prev) => [...prev, token])}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                              isUsed
                                ? 'opacity-30 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 shadow-xs'
                            }`}
                          >
                            {token}
                          </button>
                        );
                      })}
                    </div>

                    {!isAnswerSubmitted && (
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setArrangedTokens([])}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                        <button
                          id="check-sentence-btn"
                          disabled={arrangedTokens.length === 0}
                          onClick={handleCheckSentenceArrange}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors disabled:opacity-50"
                        >
                          Check Answer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Strip on submit */}
                {isAnswerSubmitted && (
                  <div
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      isAnswerCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {isAnswerCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Spot on! (+10 XP)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-500" />
                          <span>Not quite. Let's learn why:</span>
                        </>
                      )}
                    </div>
                    <p className="leading-relaxed">{currentExercise.explanation}</p>
                  </div>
                )}
              </div>

              {isAnswerSubmitted && (
                <div className="flex justify-end">
                  <button
                    id="next-exercise-btn"
                    onClick={handleNextExercise}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-xs flex items-center gap-2"
                  >
                    <span>{exerciseIndex < lesson.exercises.length - 1 ? 'Next Question' : 'Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CULTURAL INSIGHT */}
          {currentStep === 'culture' && lesson.culturalInsight && (
            <div className="space-y-6 animate-fade-in py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                  🏮
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Cultural Insight & Etiquette
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Linguistic Nuance in Context
                </h3>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200/80 dark:border-amber-900/40 space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.culturalInsight}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  id="culture-continue-btn"
                  onClick={() => {
                    if (lesson.dialogue && lesson.dialogue.length > 0) {
                      setCurrentStep('dialogue');
                    } else {
                      finishLesson();
                    }
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-xs flex items-center gap-2"
                >
                  <span>{lesson.dialogue ? 'Listen to Dialogue' : 'Finish Lesson'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: DIALOGUE IN ACTION */}
          {currentStep === 'dialogue' && lesson.dialogue && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Native Dialogue in Action
                </span>
                <span>Listen & Follow Along</span>
              </div>

              <div className="space-y-3">
                {lesson.dialogue.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5"
                  >
                    <span className="text-2xl">{line.avatar || '👤'}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          {line.speaker}
                        </span>
                        <button
                          onClick={() => handlePlayAudio(line.native)}
                          className="p-1 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                          title="Listen to line"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {line.native}
                      </div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {line.romanization}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {line.translation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="dialogue-finish-btn"
                  onClick={finishLesson}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs flex items-center gap-2"
                >
                  <span>Complete Lesson</span>
                  <Trophy className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: LESSON COMPLETED */}
          {currentStep === 'completed' && (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                🏆
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Lesson Mastered!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Great work! You have completed <strong>{lesson.title}</strong>.
                </p>
              </div>

              <div className="inline-flex items-center gap-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-6 py-3 rounded-2xl">
                <div className="text-center">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Earned XP</div>
                  <div className="text-xl font-black text-indigo-700 dark:text-indigo-300">+{userXpEarned} XP</div>
                </div>
                <div className="w-px h-8 bg-indigo-200 dark:bg-indigo-800" />
                <div className="text-center">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Proficiency</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
                </div>
              </div>

              <div>
                <button
                  id="finish-lesson-return-btn"
                  onClick={onClose}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                >
                  Return to Curriculum
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
