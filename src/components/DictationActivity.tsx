import React, { useState } from 'react';
import { Volume2, Sparkles, Eye, EyeOff, ArrowLeft, ArrowRight, Award, Star, HelpCircle, Lightbulb } from 'lucide-react';
import { DictationItem } from '../types';
import {
  cheerDictationCorrect,
  cheerDictationTryAgain,
  speakCheer,
  speakEducationalHint,
  playPopSound
} from '../utils/audioCheer';

interface DictationActivityProps {
  dictationItems: DictationItem[];
  studentName: string;
  onItemCompleted: (itemId: string) => void;
  onAllCompleted?: () => void;
  onOpenHints?: (dictationIndex: number) => void;
}

export const DictationActivity: React.FC<DictationActivityProps> = ({
  dictationItems,
  studentName,
  onItemCompleted,
  onAllCompleted,
  onOpenHints,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [starsWon, setStarsWon] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  const currentItem = dictationItems[currentIndex];

  const handleSpeak = (text: string) => {
    speakCheer(text);
  };

  const handleSpeakSlowly = (text: string) => {
    const words = text.split(/\s+/).filter(Boolean);
    const spoken = words.join(' ... ');
    speakEducationalHint(`استمعي بهدوء وتأنٍّ: ${spoken}`);
  };

  const handleSpeakHint = (hintText: string) => {
    speakEducationalHint(`تلميح إملائي: ${hintText}`);
  };

  const cleanText = (str: string) => {
    return str
      .replace(/[\u064B-\u0652\u0670]/g, '') // remove diacritics
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،"«»]/g, '') // remove punctuation
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleCheck = () => {
    if (!userInput.trim()) {
      setStatus('idle');
      return;
    }

    const sClean = cleanText(userInput);
    const tClean = cleanText(currentItem.targetWordOrSentence);

    // Sentence matching: check exact or token match
    const userTokens = sClean.split(/\s+/).filter(Boolean);
    const targetTokens = tClean.split(/\s+/).filter(Boolean);

    let matchCount = 0;
    targetTokens.forEach(token => {
      if (userTokens.some(u => u === token || u.includes(token) || token.includes(u))) {
        matchCount++;
      }
    });

    const isMatch = sClean === tClean ||
      (targetTokens.length > 0 && (matchCount / targetTokens.length) >= 0.8) ||
      sClean.includes(tClean);

    if (isMatch) {
      setStatus('correct');
      setStarsWon(prev => prev + 10);
      setIncorrectAttempts(0);
      cheerDictationCorrect();

      if (!completedIds.includes(currentItem.id)) {
        const updated = [...completedIds, currentItem.id];
        setCompletedIds(updated);
        onItemCompleted(currentItem.id);
        if (updated.length === dictationItems.length && onAllCompleted) {
          onAllCompleted();
        }
      }
    } else {
      setStatus('incorrect');
      setIncorrectAttempts(prev => prev + 1);
      cheerDictationTryAgain();
    }
  };

  const handleNext = () => {
    playPopSound();
    if (currentIndex < dictationItems.length - 1) {
      setCurrentIndex(i => i + 1);
      setUserInput('');
      setStatus('idle');
      setShowModelAnswer(false);
      setShowHint(false);
      setIncorrectAttempts(0);
    }
  };

  const handlePrev = () => {
    playPopSound();
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setUserInput('');
      setStatus('idle');
      setShowModelAnswer(false);
      setShowHint(false);
      setIncorrectAttempts(0);
    }
  };

  return (
    <section className="bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 rounded-3xl p-6 sm:p-8 border-2 border-violet-200 shadow-md space-y-6 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-200 text-violet-900 text-xs font-black">
              إملاء ٥ جمل كاملة
            </span>
            <span className="text-xs text-stone-500 font-bold">
              الجملة ({currentIndex + 1} من {dictationItems.length})
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-violet-950 font-cairo flex items-center gap-2 mt-1">
            <span>✏️ تدريب الإملاء على الجمل الكاملة</span>
          </h3>
          <p className="text-xs sm:text-sm font-bold text-stone-600 mt-1">
            اسْتَمِعِي لِلجُمْلَةِ بِتَرْكِيزٍ وَاكْتُبِيهَا كَامِلَةً، ثُمَّ اضْغَطِي عَلَى تَحَقَّقِي يَا {studentName || 'بَطَلَتِي'} 🌸
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* 5 Sentence Stepper Bubbles */}
          <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-violet-200 shadow-2xs">
            {dictationItems.map((item, idx) => {
              const isDone = completedIds.includes(item.id);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playPopSound();
                    setCurrentIndex(idx);
                    setUserInput('');
                    setStatus('idle');
                    setShowModelAnswer(false);
                    setShowHint(false);
                  }}
                  className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-300'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-violet-100'
                  }`}
                  title={`الجملة ${idx + 1}`}
                >
                  {isDone ? '✓' : idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shadow-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>+{starsWon} نُجُوم 🌟</span>
          </div>
        </div>
      </div>

      {/* Audio & Model Answer Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleSpeak(currentItem.targetWordOrSentence)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
        >
          <Volume2 className="w-5 h-5 animate-pulse" />
          <span>اسْتَمِعِي لِلجُمْلَةِ كَامِلَةً 🔊</span>
        </button>

        <button
          onClick={() => handleSpeakSlowly(currentItem.targetWordOrSentence)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
          title="قراءة هادئة كلمة كلمة للمساعدة في الكتابة"
        >
          <span>🐢 إِمْلَاءٌ بَطِيءٌ كَلِمَةً كَلِمَةً</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setShowModelAnswer(!showModelAnswer);
          }}
          className="bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 font-bold px-4 py-2.5 rounded-2xl text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
        >
          {showModelAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showModelAnswer ? 'إِخْفَاءُ النَّمُوذَجِ 🙈' : 'عَرْضُ النَّمُوذَجِ الصَّحِيحِ 👁️'}</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            setShowHint(!showHint);
          }}
          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 font-bold px-4 py-2.5 rounded-2xl text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>تَلْمِيحٌ مُسَاعِدٌ 💡</span>
        </button>
      </div>

      {/* Model Answer Preview */}
      {showModelAnswer && (
        <div className="p-4 rounded-2xl bg-white border-2 border-violet-300 text-sm font-bold text-violet-900 space-y-1 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-violet-600 font-bold">
            <span>النَّمُوذَجُ الإِمْلَائِيُّ الْمَقْرُوءُ:</span>
            <button onClick={() => handleSpeak(currentItem.diacritizedWord)} className="hover:underline flex items-center gap-1 cursor-pointer">
              <Volume2 className="w-3.5 h-3.5" /> <span>نطق</span>
            </button>
          </div>
          <span className="font-naskh text-xl text-stone-900 block font-bold">
            {currentItem.diacritizedWord}
          </span>
        </div>
      )}

      {/* Educational Hint */}
      {showHint && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 space-y-3 animate-in fade-in shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
            <span className="font-black text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>تَلْمِيحٌ إِرْشَادِيٌّ لِتَسْهِيلِ كِتَابَةِ الكَلِمَةِ:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakHint(currentItem.hint)}
                className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                <span>اسْتَمِعِي لِلتَّلْمِيحِ صَوْتِيًّا 🔊</span>
              </button>

              {onOpenHints && (
                <button
                  onClick={() => onOpenHints(currentIndex)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>دليل التلميحات 💡</span>
                </button>
              )}
            </div>
          </div>

          <p className="leading-relaxed font-bold bg-white/70 p-3 rounded-xl border border-amber-200 text-stone-800">
            {currentItem.hint}
          </p>
        </div>
      )}

      {/* Student Dictation Textarea */}
      <div className="space-y-2">
        <textarea
          rows={3}
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="اكْتُبِي مَا سَمِعْتِهِ هُنَا يَا بَطَلَتِي (مثال: حبات البرتقال)..."
          className="w-full border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 rounded-2xl p-4 text-lg font-black text-stone-800 focus:outline-none bg-white shadow-sm font-cairo transition-all"
        />
      </div>

      {/* Check & Feedback Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <button
          onClick={handleCheck}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-7 py-3 rounded-2xl text-sm cursor-pointer shadow-md flex items-center justify-center gap-2 self-start active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>تَحَقَّقِي مِنَ الإِمْلَاءِ ✨</span>
        </button>

        <div>
          {status === 'correct' && (
            <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-2xl inline-block shadow-xs animate-in fade-in">
              مُمْتَازَةٌ جِدًّا! إِمْلَاؤُكِ مُتْقَنٌ وَرَائِعٌ 🎉 ⭐ (+10 نُجُوم)
            </span>
          )}

          {status === 'incorrect' && (
            <span className="text-xs sm:text-sm font-black text-rose-800 bg-rose-100 border border-rose-300 px-4 py-2 rounded-2xl inline-block shadow-xs animate-in fade-in">
              مُحَاوَلَةٌ طَيِّبَة! اسْتَمِعِي لِلتَّلْمِيحِ الصَّوْتِيِّ أَدْنَاهُ لِمُسَاعَدَتِكِ 🌸
            </span>
          )}
        </div>
      </div>

      {/* Interactive Stumble Assistant Card when incorrect */}
      {status === 'incorrect' && (
        <div className="p-4 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-300 rounded-2xl space-y-3 animate-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                💡
              </span>
              <span className="text-xs sm:text-sm font-black text-rose-950 font-cairo">
                هل تعثرتِ في كتابة الكلمة؟ لا تقلقي يا بطلة، استعيني بالتلميح الصوتي:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakHint(currentItem.hint)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-pink-200" />
                <span>اسْتَمِعِي لِلتَّلْمِيحِ صَوْتِيًّا 🔊</span>
              </button>

              {onOpenHints && (
                <button
                  onClick={() => onOpenHints(currentIndex)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>تلميحات تفاعلية مفصلة</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-rose-200 text-xs text-stone-800 leading-relaxed font-bold">
            <span className="text-rose-900 font-black">💡 تلميح: </span>
            {currentItem.hint}
          </div>
        </div>
      )}

      {/* Spelling Rule Card after Correct Answer */}
      {status === 'correct' && (
        <div className="p-4 bg-white rounded-2xl border-2 border-emerald-300 text-xs text-stone-700 space-y-1.5 shadow-xs animate-in fade-in">
          <span className="font-black text-amber-900 block text-xs sm:text-sm">
            📚 القَاعِدَةُ الإِمْلَائِيَّةُ الْمُسْتَفَادَةُ:
          </span>
          <p className="leading-relaxed font-medium">{currentItem.spellingRule}</p>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-violet-200/80">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
            currentIndex > 0 ? 'bg-white text-violet-900 hover:bg-violet-100 border border-violet-200' : 'text-stone-300 cursor-not-allowed'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
          <span>التَّدْرِيبُ السَّابِقُ</span>
        </button>

        <div className="flex gap-2">
          {dictationItems.map((item, idx) => (
            <div
              key={item.id}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                completedIds.includes(item.id)
                  ? 'bg-emerald-500 scale-125 ring-2 ring-emerald-200'
                  : idx === currentIndex
                  ? 'bg-violet-600 scale-125 ring-2 ring-violet-200'
                  : 'bg-violet-200'
              }`}
            />
          ))}
        </div>

        {currentIndex < dictationItems.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <span>التَّدْرِيبُ التَّالِي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>أَتْمَمْتِ إِمْلَاءَ الدَّرْسِ كَامِلًا! 🏆</span>
          </div>
        )}
      </div>

    </section>
  );
};
