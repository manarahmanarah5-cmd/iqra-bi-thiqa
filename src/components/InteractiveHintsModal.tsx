import React, { useState } from 'react';
import {
  Lightbulb,
  Volume2,
  X,
  Sparkles,
  BookOpen,
  PenTool,
  CheckCircle2,
  ChevronRight,
  Layers,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  VolumeX,
  Play
} from 'lucide-react';
import { ReadingLesson, LessonSubStep, DictationItem } from '../types';
import {
  speakEducationalHint,
  speakSyllablesSlowly,
  playPopSound,
  playChimeSound
} from '../utils/audioCheer';

interface InteractiveHintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ReadingLesson;
  currentStep: LessonSubStep;
  studentName?: string;
  activeDictationIndex?: number;
  highlightedText?: string;
}

export const InteractiveHintsModal: React.FC<InteractiveHintsModalProps> = ({
  isOpen,
  onClose,
  lesson,
  currentStep,
  studentName,
  activeDictationIndex = 0,
  highlightedText,
}) => {
  // Tab can be 'dictation', 'reading-words', 'reading-rules', 'word-breaker'
  const initialTab = currentStep === 'dictation' ? 'dictation' : 'reading-words';
  const [activeTab, setActiveTab] = useState<'dictation' | 'reading-words' | 'reading-rules' | 'word-breaker'>(initialTab);

  // Dictation active index
  const [selectedDictIndex, setSelectedDictIndex] = useState(
    Math.min(activeDictationIndex, Math.max(0, lesson.dictationExercises.length - 1))
  );

  // Custom word analyzer
  const [customWord, setCustomWord] = useState(highlightedText || '');
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const currentDictItem: DictationItem | undefined = lesson.dictationExercises[selectedDictIndex];

  const handleSpeakText = (text: string, title?: string) => {
    setIsSpeaking(true);
    playPopSound();
    const fullMessage = title ? `${title}: ${text}` : text;
    speakEducationalHint(fullMessage, () => {
      setIsSpeaking(false);
    });
  };

  const handleSpeakSyllables = (word: string, chunks: string[], description?: string) => {
    setIsSpeaking(true);
    speakSyllablesSlowly(word, chunks, description);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  // Heuristic syllable breaker for any custom word entered
  const breakWordIntoSyllables = (inputWord: string): string[] => {
    const clean = inputWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '').trim();
    if (!clean) return [];
    if (clean.length <= 2) return [clean];

    const chunks: string[] = [];
    if (clean.startsWith('ال')) {
      chunks.push('الْـ');
      const remainder = clean.substring(2);
      if (remainder.length > 3) {
        chunks.push(remainder.substring(0, 2) + 'ـ');
        chunks.push(remainder.substring(2));
      } else {
        chunks.push(remainder);
      }
    } else {
      for (let i = 0; i < clean.length; i += 2) {
        chunks.push(clean.substring(i, Math.min(i + 2, clean.length)));
      }
    }
    return chunks;
  };

  const analyzedSyllables = breakWordIntoSyllables(customWord);

  const readingStrategies = [
    {
      title: 'قاعدة المقطع الساكن',
      tag: 'سكون',
      explanation: 'الحرف الساكن ضعيف لا يُنطق بمفرده أبداً، بل يُنطق دائماً مع الحرف المتحرك قبله في صوت واحد متصل ودفعة صوتية واحدة.',
      exampleWord: 'يَقْـ / رَ / أُ',
      audioExample: 'في كلمة: يَقْرَأُ، المقطع الساكن هو الياء مع القاف الساكنة: يَقْ، انطقيهما معاً بصوت واحد!'
    },
    {
      title: 'قاعدة الحرف المشدّد (التضعيف)',
      tag: 'شدّة',
      explanation: 'الحرف المشدد هو في الأصل حرفان متماثلان: الأول ساكن نقف عليه قليلاً، والثاني متحرك ننطلق به.',
      exampleWord: 'فَـ / عَّـ / لَ',
      audioExample: 'عند قراءة الحرف المشدد، اضغطي على المخرج برفق كأنكِ تقرئين حرفين، ثم انطلقي بالحركة!'
    },
    {
      title: 'اللام الشمسية واللام القمرية',
      tag: 'أل التعريف',
      explanation: 'اللام القمرية نكتبها وننطقها بوضوح وعليها سكون (الْـكتاب). أما اللام الشمسية فنكتبها ولا ننطقها ونشدد الحرف الذي بعدها (الشَّـمس).',
      exampleWord: 'الْـقَمَر / الشَّـمْس',
      audioExample: 'في اللام القمرية انطقي صوت اللام واضحاً: الْـ. وفي اللام الشمسية ادمجي الألف مع الحرف المشدد مباشرة دون نطق اللام!'
    },
    {
      title: 'سر همزة الوصل وهمزة القطع',
      tag: 'همزات',
      explanation: 'ضعي قبل الكلمة حرف (الواو) أو (الفاء): إن نُطقت الهمزة بوضوح فهي همزة قطع (وَأَحْسَنَ)، وإن سقطت واختفت في النطق فهي همزة وصل (وَابْتَغِ).',
      exampleWord: 'وَ + أحْسَن = وَأَحْسَن | وَ + ابْتَغِ = وَابْتَغِ',
      audioExample: 'جربي وضع حرف الواو واقرئي: إن سمعتِ الألف فهي قطع، وإن اتصل ما قبلها بما بعدها فهي همزة وصل!'
    },
    {
      title: 'حروف المد الثلاثة (الألف والواو والياء)',
      tag: 'مدود',
      explanation: 'المد هو إطالة الصوت بحرف المد حركتين كاملتين. حرف المد لا يُشكّل، والحرف قبله يُسمّى الحرف الممدود ويكون مُمَاثِلاً لحركة المد.',
      exampleWord: 'قَـا / رُون / كَـا / نَ',
      audioExample: 'أعطي حرف المد حقه من الزمن، مدي صوتكِ حركتين هادئتين لتضفي جمالاً وطلاقة على قراءتكِ!'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/65 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-rose-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-amber-200 flex items-center justify-center text-2xl shadow-inner border border-white/30 shrink-0">
              💡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-cairo">
                  مُرْشِدُ التَّلْمِيحَاتِ التَّفَاعُلِيِّ الذَّكِيِّ
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-bold text-white border border-white/30 hidden sm:inline-block">
                  دعم صوتي فوري 🔊
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                مُسَاعِدُكِ الخاص عند التعثر في القراءة أو الإملاء يا {studentName || 'بطلة القراءة'} 🌸
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-white/20"
            title="إغلاق التلميحات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-rose-50/70 border-b border-rose-100 px-4 pt-3 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('dictation');
            }}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border-t border-x ${
              activeTab === 'dictation'
                ? 'bg-white text-rose-900 border-rose-200 font-black shadow-xs -mb-[1px] pb-3'
                : 'bg-transparent text-stone-600 hover:text-stone-900 border-transparent hover:bg-white/50'
            }`}
          >
            <PenTool className="w-4 h-4 text-rose-500" />
            <span>تلميحات الإملاء والقواعد</span>
            {lesson.dictationExercises.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black flex items-center justify-center">
                {lesson.dictationExercises.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('reading-words');
            }}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border-t border-x ${
              activeTab === 'reading-words'
                ? 'bg-white text-rose-900 border-rose-200 font-black shadow-xs -mb-[1px] pb-3'
                : 'bg-transparent text-stone-600 hover:text-stone-900 border-transparent hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>كلمات الدرس ومقاطعها الصوتية</span>
            {lesson.trickyWords.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black flex items-center justify-center">
                {lesson.trickyWords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('reading-rules');
            }}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border-t border-x ${
              activeTab === 'reading-rules'
                ? 'bg-white text-rose-900 border-rose-200 font-black shadow-xs -mb-[1px] pb-3'
                : 'bg-transparent text-stone-600 hover:text-stone-900 border-transparent hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>مفاتيح التغلب على تعثر القراءة</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('word-breaker');
            }}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border-t border-x ${
              activeTab === 'word-breaker'
                ? 'bg-white text-rose-900 border-rose-200 font-black shadow-xs -mb-[1px] pb-3'
                : 'bg-transparent text-stone-600 hover:text-stone-900 border-transparent hover:bg-white/50'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>مُفَكِّكُ مَقَاطِعِ أَيِّ كَلِمَةٍ</span>
          </button>

        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-right bg-stone-50/50">
          
          {/* TAB 1: DICTATION HINTS */}
          {activeTab === 'dictation' && (
            <div className="space-y-6">
              
              {/* Exercise Selector Chips if multiple */}
              {lesson.dictationExercises.length > 1 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-600 block">
                    اختاري التدريب الإملائي لعرض تلميحاته وقواعده:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {lesson.dictationExercises.map((ex, idx) => (
                      <button
                        key={ex.id}
                        onClick={() => {
                          playPopSound();
                          setSelectedDictIndex(idx);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedDictIndex === idx
                            ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-200'
                            : 'bg-white text-stone-700 hover:bg-rose-50 border border-stone-200'
                        }`}
                      >
                        <span>تدريب {idx + 1}</span>
                        <span className="text-[11px] opacity-80">({ex.category.replace(/_/g, ' ')})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentDictItem ? (
                <div className="space-y-5">
                  
                  {/* Main Target Word & Slow Audio Pronunciation */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-rose-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
                      <div>
                        <span className="text-[11px] font-black text-rose-600 uppercase tracking-wider block">
                          الهدف الإملائي لهذا التدريب
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black text-stone-900 font-naskh mt-0.5">
                          {currentDictItem.diacritizedWord}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeakText(currentDictItem.diacritizedWord, 'استمعي للكلمة')}
                          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>نطق الكلمة بوضوح 🔊</span>
                        </button>
                      </div>
                    </div>

                    {/* Step-by-Step Interactive Hint Card with Audio */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-sm shadow-xs">
                            💡
                          </span>
                          <span className="text-sm font-black text-amber-950 font-cairo">
                            التلميح الذكي لتجاوز التعثر في هذه الكلمة:
                          </span>
                        </div>

                        <button
                          onClick={() => handleSpeakText(currentDictItem.hint, 'تلميح إملائي')}
                          className="px-3.5 py-1.5 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-800" />
                          <span>اسْتَمِعِي لِلتَّلْمِيحِ صَوْتِيًّا 🔊</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed bg-white/80 p-3.5 rounded-xl border border-amber-200">
                        {currentDictItem.hint}
                      </p>
                    </div>

                    {/* Golden Spelling Rule Card with Audio */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                            📚
                          </span>
                          <span className="text-sm font-black text-emerald-950 font-cairo">
                            القاعدة الإملائية المستفادة:
                          </span>
                        </div>

                        <button
                          onClick={() => handleSpeakText(currentDictItem.spellingRule, 'القاعدة الإملائية')}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-800" />
                          <span>نطق القاعدة 🔊</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-emerald-950 font-bold leading-relaxed bg-white/80 p-3.5 rounded-xl border border-emerald-200">
                        {currentDictItem.spellingRule}
                      </p>
                    </div>

                    {/* Quick Practical Tip */}
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 flex items-start gap-3">
                      <span className="text-base shrink-0">🌸</span>
                      <p className="leading-relaxed font-bold">
                        <span className="font-black text-rose-900">نصيحة أخصائية ومعلمة صعوبات التعلم:</span> لا تقلقي عند كتابة حرف بصورة خاطئة، القراءة المتأنية والاستماع لمخارج الحروف هو المفتاح الذهبي للإتقان التام!
                      </p>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-stone-500 bg-white rounded-3xl border border-stone-200">
                  لا توجد تدريبات إملائية مسجلة لهذا النص.
                </div>
              )}

            </div>
          )}

          {/* TAB 2: READING WORDS & SYLLABLES */}
          {activeTab === 'reading-words' && (
            <div className="space-y-6">
              
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📖</span>
                  <div className="text-xs">
                    <span className="font-black text-amber-950 block">كلمات النص الصعبة والتقطيع المقطعي:</span>
                    <span className="text-amber-800">انقري على أي كلمة لسماع نطق مقاطعها الصوتية خطوة بخطوة 🔊</span>
                  </div>
                </div>
              </div>

              {lesson.trickyWords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.trickyWords.map((tw, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl p-5 space-y-3 shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <span className="text-2xl font-black font-naskh text-stone-900">
                          {tw.word}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
                          {tw.type === 'مد' ? 'حرف مَدّ' : tw.type === 'مقطع_ساكن' ? 'مقطع ساكن' : tw.type === 'مشدد' ? 'حرف مشدد' : 'تحليل مقطعي'}
                        </span>
                      </div>

                      {/* Syllable Chunks */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-stone-500 block">المقاطع الصوتية للكلمة:</span>
                        <div className="flex flex-wrap items-center gap-1.5" dir="rtl">
                          {tw.chunks.map((ch, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-950 font-black text-sm border border-rose-200 font-naskh shadow-2xs"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Phonetic Description */}
                      <p className="text-xs text-stone-600 font-medium leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        💡 {tw.phoneticDescription}
                      </p>

                      {/* Audio Button */}
                      <button
                        onClick={() => handleSpeakSyllables(tw.word, tw.chunks, tw.phoneticDescription)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>اسْتَمِعِي لِمَقَاطِعِ الكَلِمَةِ صَوْتِيًّا 🔊</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                  جميع كلمات هذا النص بسيطة ومباشرة.
                </div>
              )}

              {/* Lesson Vocabulary breakdown */}
              {lesson.vocabulary.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h4 className="text-sm font-black text-stone-900 font-cairo flex items-center gap-2">
                    <span>📚 مفردات النص مع المعاني والمقاطع:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.vocabulary.map((vocab, vIdx) => (
                      <div
                        key={vIdx}
                        className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 hover:border-rose-200 transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-naskh text-lg font-black text-rose-900">
                            {vocab.word}
                          </span>
                          <button
                            onClick={() => handleSpeakText(`${vocab.word}. معناها: ${vocab.meaning}`, 'المفردة')}
                            className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                            title="استمع للمفردة ومعناها"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-stone-500 font-bold">
                          المقاطع: <span className="font-naskh text-xs text-stone-800">{vocab.syllables}</span>
                        </div>
                        <div className="text-xs text-stone-700">
                          <span className="font-bold text-amber-900">المعنى:</span> {vocab.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: READING FLUENCY RULES */}
          {activeTab === 'reading-rules' && (
            <div className="space-y-4">
              
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌟</span>
                  <div className="text-xs">
                    <span className="font-black text-emerald-950 block">مفاتيح ذهبية لتخطي التعثر في القراءة الجهرية:</span>
                    <span className="text-emerald-800">كل مفتاح مزود بشرح صوتي ومثال لنطقه بوضوح تام 🔊</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {readingStrategies.map((strat, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white border-2 border-stone-200 hover:border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <h5 className="text-sm sm:text-base font-black text-stone-900 font-cairo">
                          {strat.title}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                          {strat.tag}
                        </span>
                        <button
                          onClick={() => handleSpeakText(`${strat.title}. ${strat.explanation}. ${strat.audioExample}`, 'تلميح قرائي')}
                          className="px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-800" />
                          <span>استمعي للشرح 🔊</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {strat.explanation}
                    </p>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-black text-emerald-950">مثال تطبيقي: </span>
                        <span className="font-naskh text-sm font-black text-emerald-900 mr-1">{strat.exampleWord}</span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-bold">
                        {strat.audioExample}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: CUSTOM WORD BREAKER */}
          {activeTab === 'word-breaker' && (
            <div className="space-y-6">
              
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">✨</span>
                  <div className="text-xs">
                    <span className="font-black text-purple-950 block">مفكك مقاطع أي كلمة من اختيارك:</span>
                    <span className="text-purple-800">اكتبي أي كلمة من النص تعثرتِ في قراءتها وسيقوم النظام بتفكيكها ونطقها مقطعاً بمقطع! 🔊</span>
                  </div>
                </div>
              </div>

              {/* Word Input */}
              <div className="bg-white rounded-3xl p-5 border-2 border-purple-200 shadow-sm space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-stone-700 block">
                    اكتبي الكلمة هنا:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customWord}
                      onChange={(e) => setCustomWord(e.target.value)}
                      placeholder="مثال: الْمُتَوَاضِعُ، اسْتَكْبَرَ، لَتَنُوءُ..."
                      className="flex-1 border-2 border-purple-200 focus:border-purple-500 rounded-2xl px-4 py-3 text-lg font-black text-stone-900 font-naskh focus:outline-none bg-stone-50/50"
                    />
                    {customWord && (
                      <button
                        onClick={() => setCustomWord('')}
                        className="px-3 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold cursor-pointer"
                      >
                        مسح
                      </button>
                    )}
                  </div>
                </div>

                {/* Analysis Result */}
                {customWord.trim() ? (
                  <div className="space-y-4 pt-3 border-t border-purple-100">
                    <div>
                      <span className="text-xs font-black text-purple-950 block mb-2">
                        التقطيع المقطعي المقترح للكلمة:
                      </span>
                      <div className="flex flex-wrap items-center gap-2 justify-center p-4 bg-purple-50/50 rounded-2xl border border-purple-200" dir="rtl">
                        {analyzedSyllables.map((chunk, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 rounded-2xl bg-white text-purple-950 font-black text-lg sm:text-xl border-2 border-purple-300 font-naskh shadow-xs animate-in zoom-in-95"
                          >
                            {chunk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => handleSpeakSyllables(customWord, analyzedSyllables)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                      >
                        <Volume2 className="w-5 h-5 animate-pulse" />
                        <span>اسْتَمِعِي لِنُطْقِ الكَلِمَةِ وَمَقَاطِعِهَا بِصَوْتٍ عَالٍ 🔊</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-stone-500 font-medium">
                    اكتبي أي كلمة من درس اليوم في المربع أعلاه لتشاهدي تقطيعها وتستمعي لنطقها.
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>نظام التلميحات التفاعلي متاح لكِ في جميع خطوات الدرس دائماً! 🌸</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-2xl cursor-pointer transition-colors"
          >
            العودة إلى متابعة الدرس
          </button>
        </div>

      </div>
    </div>
  );
};
