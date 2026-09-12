import React, { useEffect, useState } from 'react';
import { Sparkles, Send, Volume2, CheckCircle2, ChevronLeft, Loader2, Lightbulb, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { LanguageMeta, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';
import { aiApi, AiError } from '../services/aiApi';

interface AiSentenceStudioProps { words: VocabularyWord[]; language: LanguageMeta; onBackToDashboard: () => void; }
interface FeedbackResult { isCorrect: boolean; score: number; feedback: string; correction: string; correctionPhonetic?: string; translation: string; }

export const AiSentenceStudio: React.FC<AiSentenceStudioProps> = ({ words, language, onBackToDashboard }) => {
  const [selectedWord, setSelectedWord] = useState<VocabularyWord>(words[0] || null);
  const [userSentence, setUserSentence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<FeedbackResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSentence.trim() || !selectedWord || !online) return;
    setIsLoading(true); setErrorMessage(null); setEvaluation(null);
    try {
      const json = await aiApi.dialogueCheck({ word: selectedWord.word, language: language.name, userSentence: userSentence.trim(), variety: language.name });
      if (json.evaluation) setEvaluation(json.evaluation);
      else setErrorMessage('The AI returned no evaluation. Please try again.');
    } catch (err) {
      const error = err as AiError;
      setErrorMessage(error.isApiKeyMissing ? 'AI is not configured on the server yet. Add GEMINI_API_KEY to your Vercel environment variables.' : error.message);
    } finally { setIsLoading(false); }
  };

  const handlePlayAudio = (text: string) => speakWord(text, language.speechCode, 0.85);
  const handleInsertWord = () => { if (selectedWord) setUserSentence((prev) => prev ? `${prev} ${selectedWord.word}` : selectedWord.word); };

  return <div className="max-w-4xl mx-auto py-5 sm:py-8 px-3 sm:px-5">
    <div className="flex items-center justify-between gap-3 mb-5">
      <button onClick={onBackToDashboard} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /> Dashboard</button>
      <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-700"><Sparkles className="w-3.5 h-3.5" /> AI SENTENCE STUDIO</div>
    </div>

    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
      <div className="bg-slate-950 px-5 py-6 sm:px-8 sm:py-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Practice partner</p><h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">Build a sentence. Get real feedback.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Write naturally in {language.name}. AI checks grammar, word choice, register and natural phrasing.</p></div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${online ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>{online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}{online ? 'AI online' : 'AI needs internet'}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-0">
        <div className="border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-4 sm:p-6 space-y-5">
          <div><label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Choose a target word</label><div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">{words.map(w => <button key={w.id} onClick={() => { setSelectedWord(w); setEvaluation(null); }} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${selectedWord?.id === w.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}><span>{w.word}</span><span className="ml-1 text-[9px] opacity-60">{w.meaning}</span></button>)}</div></div>
          {selectedWord && <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-3xl font-black font-serif text-slate-950">{selectedWord.word}</p><p className="mt-1 font-mono text-xs font-semibold text-indigo-600">{selectedWord.phonetic}</p><p className="mt-1 text-xs text-slate-500">{selectedWord.meaning}</p></div><button onClick={() => handlePlayAudio(selectedWord.word)} className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700 hover:bg-indigo-100"><Volume2 className="w-4 h-4" /></button></div><button onClick={handleInsertWord} className="mt-4 w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100">+ Insert target word</button></div>}
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px] leading-5 text-slate-500"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>Use the native script when you can. For Mandarin use pinyin; for Cantonese use Jyutping.</span></div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between"><label htmlFor="user-sentence-input" className="text-sm font-bold text-slate-900">Your sentence</label><span className="text-[10px] font-medium text-slate-400">AI-powered · online</span></div>
            <textarea id="user-sentence-input" rows={7} value={userSentence} onChange={e => setUserSentence(e.target.value)} disabled={!online} placeholder={online ? `Write a natural sentence with ${selectedWord?.word || 'your target word'}…` : 'Reconnect to use AI sentence feedback.'} className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60" />
            <button type="submit" disabled={isLoading || !userSentence.trim() || !online || !selectedWord} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">{isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating your sentence…</> : <><Send className="w-4 h-4" /> Evaluate with AI</>}</button>
          </form>

          {!online && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800"><WifiOff className="h-4 w-4 shrink-0" /><div><b>You're offline.</b><p className="mt-1 leading-5">Downloaded language packs still work. AI evaluation will resume automatically when you reconnect.</p></div></div>}
          {errorMessage && <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}

          {evaluation && <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 space-y-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">AI assessment</p><p className="text-xs font-semibold text-slate-700">{evaluation.isCorrect ? 'Natural and correct' : 'A better version is available'}</p></div></div><span className="rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm">{evaluation.score}<small className="text-[9px] text-slate-400"> / 100</small></span></div><p className="text-sm leading-6 text-slate-700">{evaluation.feedback}</p><div className="rounded-2xl border border-white bg-white p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Natural phrasing</span><button onClick={() => handlePlayAudio(evaluation.correction)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"><Volume2 className="h-4 w-4" /></button></div><p className="mt-2 text-lg font-bold text-slate-950">{evaluation.correction}</p>{evaluation.correctionPhonetic && <p className="mt-1 font-mono text-xs text-indigo-600">{evaluation.correctionPhonetic}</p>}<p className="mt-2 text-xs italic text-slate-500">{evaluation.translation}</p></div></div>}
        </div>
      </div>
    </div>
  </div>;
};
