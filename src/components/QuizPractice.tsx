import React, { useState, useEffect } from 'react';
import { Volume2, Check, X, Award, ChevronLeft, ArrowRight, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageMeta, QuizQuestion, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';

interface QuizPracticeProps {
  words: VocabularyWord[];
  language: LanguageMeta;
  onCompleteQuiz: (score: number, total: number) => void;
  onBackToDashboard: () => void;
}

export const QuizPractice: React.FC<QuizPracticeProps> = ({
  words,
  language,
  onCompleteQuiz,
  onBackToDashboard,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Generate quiz questions from available words
  useEffect(() => {
    if (words.length === 0) return;

    const generated: QuizQuestion[] = [];
    const pool = [...words];

    // Pick up to 8 words
    const quizCandidates = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.min(8, pool.length));

    quizCandidates.forEach((targetWord, idx) => {
      // Pick 3 distractors
      const distractors = pool.filter((w) => w.id !== targetWord.id).sort(() => 0.5 - Math.random()).slice(0, 3);

      const questionType: QuizQuestion['type'] =
        language.toneSupport && targetWord.toneBreakdown && targetWord.toneBreakdown.length > 0 && idx % 3 === 2
          ? 'tone-check'
          : idx % 2 === 0
          ? 'word-to-meaning'
          : 'listening';

      if (questionType === 'word-to-meaning') {
        const options = [
          { id: 'corr', text: targetWord.meaning, isCorrect: true },
          ...distractors.map((d, i) => ({ id: `dist-${i}`, text: d.meaning, isCorrect: false })),
        ].sort(() => 0.5 - Math.random());

        generated.push({
          id: `q-${idx}`,
          word: targetWord,
          type: 'word-to-meaning',
          questionPrompt: `What is the meaning of "${targetWord.word}"?`,
          options,
          explanation: `${targetWord.word} (${targetWord.phonetic}) means "${targetWord.meaning}".`,
        });
      } else if (questionType === 'tone-check' && targetWord.toneBreakdown) {
        const firstTone = targetWord.toneBreakdown[0];
        let toneOptions = [
          { id: 't-1', text: '1st Tone (High Flat 55)', isCorrect: firstTone.tone === 1 },
          { id: 't-2', text: '2nd Tone (Rising 35)', isCorrect: firstTone.tone === 2 },
          { id: 't-3', text: '3rd Tone (Dipping 214)', isCorrect: firstTone.tone === 3 },
          { id: 't-4', text: '4th Tone (Falling 51)', isCorrect: firstTone.tone === 4 },
        ];

        if (language.id === 'zh-yue') {
          toneOptions = [
            { id: 't-1', text: 'Tone 1: High Level (55)', isCorrect: firstTone.tone === 1 },
            { id: 't-2', text: 'Tone 2: High Rising (35)', isCorrect: firstTone.tone === 2 },
            { id: 't-3', text: 'Tone 3: Mid Level (33)', isCorrect: firstTone.tone === 3 },
            { id: 't-4', text: 'Tone 4: Low Falling (21)', isCorrect: firstTone.tone === 4 },
            { id: 't-6', text: 'Tone 6: Low Level (22)', isCorrect: firstTone.tone === 6 },
          ];
        } else if (language.id === 'zh-nan') {
          toneOptions = [
            { id: 't-1', text: 'Tone 1: High Level (55)', isCorrect: firstTone.tone === 1 },
            { id: 't-2', text: 'Tone 2: High Falling (51)', isCorrect: firstTone.tone === 2 },
            { id: 't-5', text: 'Tone 5: Low Rising (24)', isCorrect: firstTone.tone === 5 },
            { id: 't-7', text: 'Tone 7: Mid Level (33)', isCorrect: firstTone.tone === 7 },
            { id: 't-8', text: 'Tone 8: Checked Stop (4)', isCorrect: firstTone.tone === 8 },
          ];
        }

        generated.push({
          id: `q-${idx}`,
          word: targetWord,
          type: 'tone-check',
          questionPrompt: `In "${targetWord.word}" (${targetWord.phonetic}), what tone is "${firstTone.syllable}"?`,
          options: toneOptions,
          explanation: `"${firstTone.syllable}" is pronounced with ${firstTone.tone === 0 ? 'a neutral tone' : `Tone ${firstTone.tone}`}.`,
        });
      } else {
        // Listening question
        const options = [
          { id: 'corr', text: targetWord.word, subText: targetWord.phonetic, isCorrect: true },
          ...distractors.map((d, i) => ({
            id: `dist-${i}`,
            text: d.word,
            subText: d.phonetic,
            isCorrect: false,
          })),
        ].sort(() => 0.5 - Math.random());

        generated.push({
          id: `q-${idx}`,
          word: targetWord,
          type: 'listening',
          questionPrompt: 'Listen to the audio. Which word did you hear?',
          audioText: targetWord.word,
          options,
          explanation: `You heard "${targetWord.word}" (${targetWord.phonetic}) which means "${targetWord.meaning}".`,
        });
      }
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setQuizFinished(false);
  }, [words, language]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);

    if (currentQ && currentQ.type === 'listening' && currentQ.audioText) {
      speakWord(currentQ.audioText, language.speechCode, 0.85);
    }
  }, [currentIndex, currentQ]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted || !currentQ) return;
    setIsAnswerSubmitted(true);

    const chosen = currentQ.options.find((o) => o.id === selectedOptionId);
    if (chosen && chosen.isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      const finalScore = score + (currentQ?.options.find((o) => o.id === selectedOptionId)?.isCorrect ? 1 : 0);
      confetti({ particleCount: 70, spread: 60 });
      onCompleteQuiz(finalScore, questions.length);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-slate-500">
        <p className="text-sm">Not enough vocabulary words to generate a quiz yet. Add more words to your deck!</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (quizFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Quiz Finished!</h2>
        <p className="text-sm text-slate-500 mb-6 font-mono">
          Final Score: {score} / {questions.length} ({accuracy}%)
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-700 max-w-sm mx-auto">
          <p className="font-semibold text-slate-900">
            {accuracy >= 80 ? 'Mastery Unlocked!' : accuracy >= 50 ? 'Solid Practice!' : 'Keep Drilling!'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Active recall stimulates long-term memory synaptic pathways.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            id="btn-quiz-retry"
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setQuizFinished(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCw className="w-4 h-4" /> Try Again
          </button>
          <button
            id="btn-quiz-dashboard"
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="btn-quiz-back"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Dashboard
        </button>

        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="text-center space-y-4 mb-6">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
            {currentQ.type === 'listening'
              ? 'Listening Comprehension'
              : currentQ.type === 'tone-check'
              ? 'Tone & Pitch Drill'
              : 'Vocabulary Recall'}
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            {currentQ.questionPrompt}
          </h3>

          {/* Audio Trigger for listening or word drill */}
          {currentQ.type === 'listening' && (
            <div className="pt-2">
              <button
                id="btn-quiz-play-audio"
                onClick={() => speakWord(currentQ.audioText || currentQ.word.word, language.speechCode, 0.8)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4" /> Listen Again
              </button>
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2.5 mb-6">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnClass = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50';

            if (isAnswerSubmitted) {
              if (opt.isCorrect) {
                btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400';
              } else if (isSelected && !opt.isCorrect) {
                btnClass = 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400';
              } else {
                btnClass = 'opacity-50 border-slate-200 text-slate-400';
              }
            } else if (isSelected) {
              btnClass = 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswerSubmitted}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm ${btnClass}`}
              >
                <div>
                  <span className="font-medium text-base">{opt.text}</span>
                  {opt.subText && (
                    <span className="block text-xs text-indigo-600 font-mono mt-0.5">{opt.subText}</span>
                  )}
                </div>
                {isAnswerSubmitted && opt.isCorrect && (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswerSubmitted && isSelected && !opt.isCorrect && (
                  <X className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Banner when answered */}
        {isAnswerSubmitted && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block mb-1">Explanation:</span>
            {currentQ.explanation}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!isAnswerSubmitted ? (
            <button
              id="btn-quiz-submit"
              onClick={handleConfirmAnswer}
              disabled={!selectedOptionId}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                selectedOptionId
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              id="btn-quiz-next"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
