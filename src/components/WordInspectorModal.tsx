import React, { useState } from 'react';
import { X, Volume2, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { VocabularyWord, TeacherVoice } from '../types';
import { getTeacherVoiceProfile, getActiveTeacherVoice, speakEducationalHint } from '../utils/audioCheer';

interface WordInspectorModalProps {
  word: string;
  matchedVocab?: VocabularyWord;
  onClose: () => void;
  onAskAi: (word: string) => void;
  onSpeak: (text: string) => void;
  teacherVoice?: TeacherVoice;
}

export const WordInspectorModal: React.FC<WordInspectorModalProps> = ({
  word,
  matchedVocab,
  onClose,
  onAskAi,
  onSpeak,
  teacherVoice,
}) => {
  const [copied, setCopied] = useState(false);
  const activeTeacher = teacherVoice || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(activeTeacher);

  // Generate automated sound syllables if not in vocab
  const syllables = matchedVocab?.syllables || generateHeuristicSyllables(word);

  const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanWord);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Word Audio */}
        <div className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-stone-100 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              المحلل الصوتي والدلالي للكلمة
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-stone-900 font-naskh">
                {cleanWord}
              </h2>
              <button
                onClick={() => onSpeak(cleanWord)}
                className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                title="استمع إلى نطق الكلمة بوضوح"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Information */}
        <div className="p-6 space-y-5 text-right">
          
          {/* Syllables Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>التقطيع الصوتي للمقاطع:</span>
              </span>
              <span className="text-[11px] text-amber-700">اقرأ مقطعاً بمقطع</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 justify-center py-2" dir="rtl">
              {syllables.split(' / ').map((chunk, idx) => (
                <button
                  key={idx}
                  onClick={() => onSpeak(chunk)}
                  className="px-3 py-1.5 bg-white border-2 border-amber-300 text-stone-800 font-bold rounded-lg text-lg font-naskh shadow-xs hover:bg-amber-50 hover:border-amber-400 active:scale-95 transition-all cursor-pointer"
                  title="انقر لسماع هذا المقطع"
                >
                  {chunk}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 text-center">
              💡 كل مقطع ينطق بدفعة هواء واحدة لتسهيل التهجئة والقراءة السلسة.
            </p>
          </div>

          {/* Meaning / Context */}
          {matchedVocab ? (
            <div className="space-y-2.5 text-sm">
              <div className="border-r-2 border-amber-500 pr-3">
                <span className="text-xs font-semibold text-stone-500 block">المعنى في السياق:</span>
                <p className="text-stone-900 font-medium mt-0.5">{matchedVocab.meaning}</p>
              </div>

              {matchedVocab.root && (
                <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <span className="font-semibold text-stone-800">الجذر اللغوي الثلاثي:</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {matchedVocab.root}
                  </span>
                </div>
              )}

              {matchedVocab.synonym && (
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-semibold text-stone-700">المرادف اللغوي:</span>
                  <span className="text-emerald-700 font-medium">{matchedVocab.synonym}</span>
                </div>
              )}

              {matchedVocab.antonym && (
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-semibold text-stone-700">الضد / العكس:</span>
                  <span className="text-rose-700 font-medium">{matchedVocab.antonym}</span>
                </div>
              )}

              <div className="text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 text-stone-700">
                <span className="font-bold text-amber-900 block mb-0.5">مثال في جملة:</span>
                <p className="font-naskh text-sm text-stone-800">{matchedVocab.exampleSentence}</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <p>هذه الكلمة جزء من النص المشكول. يمكنكِ الاستماع لنطقها أو طلب شرح تربوي ميسّر من {profile.shortName}!</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                onAskAi(cleanWord);
                speakEducationalHint(`تفضلي يا بطلة، الكلمة هي: "${cleanWord}". انتبهي لمخارج حروفها وحركاتها بدقة! — ${profile.shortName}`, undefined, activeTeacher);
              }}
              className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>استفسري من {profile.shortName} عنها</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              title="نسخ الكلمة"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : 'نسخ'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

function generateHeuristicSyllables(word: string): string {
  const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '').trim();
  if (clean.length <= 3) return clean;

  const parts: string[] = [];
  if (clean.startsWith('ال')) {
    parts.push('الـ');
    const rest = clean.substring(2);
    if (rest.length > 4) {
      parts.push(rest.substring(0, 2) + 'ـ');
      parts.push(rest.substring(2));
    } else {
      parts.push(rest);
    }
  } else {
    for (let i = 0; i < clean.length; i += 2) {
      parts.push(clean.substring(i, Math.min(i + 2, clean.length)));
    }
  }
  return parts.join(' / ');
}
