import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Award,
  Layers,
  CheckCircle2,
  Bookmark,
  Share2,
  BookOpen,
  Check
} from 'lucide-react';
import { ReadingLesson, UserPreferences, VocabularyWord, TeacherVoice } from '../types';
import { WordInspectorModal } from './WordInspectorModal';
import { AudioRecorder } from './AudioRecorder';
import {
  getTeacherVoiceProfile,
  playFemaleTeacherAudio,
  stopAllSpeech,
  TEACHER_VOICES,
  speakTeacherGreeting,
  setActiveTeacherVoice
} from '../utils/audioCheer';

interface InteractiveReaderProps {
  lesson: ReadingLesson;
  preferences: UserPreferences;
  onOpenToolbox: () => void;
  onAskAi: (prompt: string) => void;
  onCompleteLesson: (lessonId: string) => void;
  isCompleted: boolean;
  onOpenHints?: (word?: string) => void;
}

export const InteractiveReader: React.FC<InteractiveReaderProps> = ({
  lesson,
  preferences,
  onOpenToolbox,
  onAskAi,
  onCompleteLesson,
  isCompleted,
  onOpenHints,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [playingParagraphIndex, setPlayingParagraphIndex] = useState<number | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyWord | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'reading' | 'vocab' | 'tricky' | 'quiz'>('reading');

  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // Audio / Speech Synthesis refs
  const highlightTimerRef = useRef<number | null>(null);

  // Split text into words with continuous global indices across all paragraphs
  const paragraphWordList = React.useMemo(() => {
    let counter = 0;
    return lesson.paragraphs.map(p => {
      const pText = preferences.showDiacritics ? p : p.replace(/[ًٌٍَُِّْ]/g, '');
      const pWords = pText.split(/\s+/).filter(w => w.trim().length > 0);
      return pWords.map(w => {
        const item = { word: w, globalIndex: counter };
        counter++;
        return item;
      });
    });
  }, [lesson.paragraphs, preferences.showDiacritics]);

  const totalWords = React.useMemo(() => {
    return paragraphWordList.reduce((acc, p) => acc + p.length, 0);
  }, [paragraphWordList]);

  // Cleanup speech and highlight timer on unmount or lesson change
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearInterval(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
      stopAllSpeech();
    };
  }, [lesson.id]);

  const handleStopTTS = () => {
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    stopAllSpeech();
    setIsPlaying(false);
    setCurrentWordIndex(null);
    setPlayingParagraphIndex(null);
  };

  // Play a specific paragraph (or sequentially chain all paragraphs)
  const playParagraph = (pIdx: number, autoAdvance: boolean) => {
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    stopAllSpeech();

    const paras = lesson.paragraphs && lesson.paragraphs.length > 0 ? lesson.paragraphs : [lesson.diacritizedText || lesson.plainText];
    if (pIdx >= paras.length) {
      handleStopTTS();
      return;
    }

    const paraText = paras[pIdx];
    const paraWords = paragraphWordList[pIdx] || [];
    const startWordIdx = paraWords[0]?.globalIndex ?? 0;

    setIsPlaying(true);
    setPlayingParagraphIndex(pIdx);
    setCurrentWordIndex(startWordIdx);

    const activeVoice = preferences.teacherVoice || 'zariyah';
    const profile = getTeacherVoiceProfile(activeVoice);
    const speed = preferences.speechRate || profile.rate || 1.0;

    // Timed word highlighting advancing with audio within this paragraph
    const wordCountInPara = Math.max(1, paraWords.length);
    const msPerWord = Math.round(500 / speed);
    let currentInPara = 0;

    highlightTimerRef.current = window.setInterval(() => {
      currentInPara++;
      if (currentInPara < wordCountInPara) {
        setCurrentWordIndex(startWordIdx + currentInPara);
      }
    }, msPerWord);

    playFemaleTeacherAudio(paraText, {
      teacher: activeVoice,
      playbackRate: speed,
      onStart: () => {
        setIsPlaying(true);
        setPlayingParagraphIndex(pIdx);
      },
      onEnd: () => {
        if (highlightTimerRef.current) {
          clearInterval(highlightTimerRef.current);
          highlightTimerRef.current = null;
        }
        if (autoAdvance && pIdx + 1 < paras.length) {
          playParagraph(pIdx + 1, true);
        } else {
          setIsPlaying(false);
          setCurrentWordIndex(null);
          setPlayingParagraphIndex(null);
        }
      },
      onError: () => {
        if (highlightTimerRef.current) {
          clearInterval(highlightTimerRef.current);
          highlightTimerRef.current = null;
        }
        setIsPlaying(false);
        setCurrentWordIndex(null);
        setPlayingParagraphIndex(null);
      },
    });
  };

  // Toggle playback of the full lesson (starting from paragraph 0 and auto advancing)
  const handlePlayTTS = () => {
    if (isPlaying) {
      handleStopTTS();
    } else {
      playParagraph(0, true);
    }
  };

  // Play just a single paragraph without auto advancing
  const playSingleParagraph = (pIdx: number) => {
    if (isPlaying && playingParagraphIndex === pIdx) {
      handleStopTTS();
    } else {
      playParagraph(pIdx, false);
    }
  };

  // Speak individual word with female teacher voice
  const speakWord = (word: string) => {
    const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '').trim();
    if (!clean) return;
    const activeVoice = preferences.teacherVoice || 'zariyah';
    const profile = getTeacherVoiceProfile(activeVoice);
    playFemaleTeacherAudio(clean, {
      teacher: activeVoice,
      playbackRate: Math.max(0.75, (preferences.speechRate || profile.rate) - 0.1),
    });
  };

  // Click on any word in the text
  const handleWordClick = (word: string) => {
    const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '');
    const match = lesson.vocabulary.find(
      v => v.word.replace(/[ًٌٍَُِّْ]/g, '') === clean.replace(/[ًٌٍَُِّْ]/g, '')
    );
    setSelectedWord(clean);
    setSelectedVocab(match);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    lesson.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const getThemeClass = () => {
    switch (preferences.theme) {
      case 'ivory': return 'theme-ivory';
      case 'mint': return 'theme-mint';
      case 'sky': return 'theme-sky';
      case 'dark': return 'theme-dark';
      default: return 'bg-white text-stone-900';
    }
  };

  const currentVoiceProfile = getTeacherVoiceProfile(preferences.teacherVoice);

  return (
    <div className="space-y-6">
      
      {/* Lesson Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>{lesson.gradeNameAr}</span>
              <span aria-hidden="true">·</span>
              <span className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md">{lesson.category}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.readingTimeMinutes} دقائق قراءة</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.wordCount} كلمة</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-cairo">
              {lesson.title}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
              {lesson.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>أتممت هذا الدرس</span>
              </div>
            ) : (
              <button
                onClick={() => onCompleteLesson(lesson.id)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>تسجيل إتمام القراءة</span>
              </button>
            )}
          </div>
        </div>

        {/* Pedagogical Focus Callout */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-300">الهدف القرائي لهذا النص:</span>
            <span>{lesson.pedagogicalFocus}</span>
          </div>
          <span className="text-stone-400">وقت القراءة المقدر: {lesson.readingTimeMinutes} دقائق</span>
        </div>
      </div>

      {/* Reader Control Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayTTS}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current text-amber-400" />}
            <span>{isPlaying ? 'إيقاف الاستماع' : 'استمع مع التظليل الذكي'}</span>
          </button>

          {isPlaying && (
            <button
              onClick={handleStopTTS}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="إعادة ضبط القراءة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <span className="text-xs text-stone-400 hidden sm:inline mr-2">
            (سرعة النطق: {preferences.speechRate}x)
          </span>

          {/* Female Reader Voice Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowVoiceModal(prev => !prev)}
              title="تغيير صوت المعلمة (اختيار بين أصوات نسائية معتمدة)"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span>{currentVoiceProfile.avatar || '🎙️'}</span>
              <span className="font-cairo font-bold">{currentVoiceProfile.name} (أنثى)</span>
              <span className="text-[10px] text-rose-500">▼</span>
            </button>

            {/* Quick Voice Picker Popover */}
            {showVoiceModal && (
              <div className="absolute top-full mt-2 right-0 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-rose-200 p-3 text-right space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🎙️</span>
                    <span className="text-xs font-black text-stone-900 font-cairo">صوت المعلمة (أنثى فصيحة فقط)</span>
                  </div>
                  <button
                    onClick={() => setShowVoiceModal(false)}
                    className="text-stone-400 hover:text-stone-700 p-1 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">
                  جميع الخيارات هي أصوات نسائية تربوية فصيحة، ومستبعد منها أي صوت رجالي نهائياً:
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {TEACHER_VOICES.map((v) => {
                    const isSelected = (preferences.teacherVoice === v.id) || (preferences.teacherVoice === 'female' && v.id === 'zariyah');
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          preferences.teacherVoice = v.id;
                          setActiveTeacherVoice(v.id);
                          setShowVoiceModal(false);
                          speakTeacherGreeting(v.id);
                        }}
                        className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-rose-50 border-rose-400 font-bold'
                            : 'hover:bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{v.avatar}</span>
                          <div>
                            <div className="text-xs font-black text-stone-900">{v.name}</div>
                            <div className="text-[10px] text-stone-500">{v.accent}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakTeacherGreeting(v.id);
                            }}
                            className="p-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs cursor-pointer"
                            title="استماع تجريبي لصوت المعلمة"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {isSelected && <Check className="w-4 h-4 text-rose-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Segment Tabs & Hints */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenHints && (
            <button
              onClick={() => onOpenHints()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-stone-900 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="تلميحات القراءة ومقاطع الكلمات الصعبة"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-900" />
              <span>تلميحات القراءة 💡</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setActiveTab('reading')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'reading'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              النص والتظليل
            </button>
            <button
              onClick={() => setActiveTab('vocab')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'vocab'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              المعجم والمفردات ({lesson.vocabulary.length})
            </button>
            <button
              onClick={() => setActiveTab('tricky')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tricky'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              المقاطع الصعبة ({lesson.trickyWords.length})
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الفهم القرائي ({lesson.questions.length})
            </button>
          </div>
        </div>

      </div>

      {/* Main Content Pane */}
      {activeTab === 'reading' && (
        <div className="space-y-6">
          
          {/* Interactive Text Display Card */}
          <div
            className={`p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs transition-all ${getThemeClass()}`}
            style={{
              fontSize: `${preferences.fontSize}px`,
              lineHeight: preferences.lineHeight,
              letterSpacing: `${preferences.letterSpacing}em`,
              wordSpacing: `${preferences.wordSpacing}em`,
            }}
          >
            <div className="space-y-6 text-right font-naskh">
              {paragraphWordList.map((paraWords, pIdx) => {
                const isThisParaPlaying = isPlaying && playingParagraphIndex === pIdx;

                return (
                  <div
                    key={pIdx}
                    className={`relative p-3.5 sm:p-5 rounded-2xl transition-all border ${
                      isThisParaPlaying
                        ? 'bg-amber-500/10 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-transparent hover:border-stone-200/80 hover:bg-stone-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-stone-200/50 pb-2">
                      <span className="text-[11px] font-bold text-stone-600 bg-stone-200/70 px-2.5 py-0.5 rounded-md font-sans">
                        الفقرة {pIdx + 1}
                      </span>
                      <button
                        onClick={() => playSingleParagraph(pIdx)}
                        title="استمع لقراءة هذه الفقرة بصوت المعلمة"
                        className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs font-sans active:scale-95 ${
                          isThisParaPlaying
                            ? 'bg-amber-600 text-white border-amber-600 font-black'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isThisParaPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{isThisParaPlaying ? 'إيقاف الفقرة' : 'استمع لهذه الفقرة 🔊'}</span>
                      </button>
                    </div>

                    <p className="leading-relaxed">
                      {paraWords.map(({ word: w, globalIndex }) => {
                        const isHighlighted = isPlaying && currentWordIndex === globalIndex;
                        
                        return (
                          <span
                            key={globalIndex}
                            onClick={() => handleWordClick(w)}
                            title="انقر لفحص الكلمة ونطقها وتقطيعها صوتياً"
                            className={`inline-block mx-1 my-0.5 px-1.5 py-0.5 rounded-lg cursor-pointer select-text transition-all reading-word ${
                              isHighlighted
                                ? 'bg-amber-400 text-stone-950 font-black shadow-sm scale-105 ring-2 ring-amber-500'
                                : 'hover:bg-amber-100 hover:text-amber-900'
                            } ${preferences.highlightDiacritics ? 'highlight-diacritics' : ''}`}
                          >
                            {w}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Instruction Tip */}
            <div className="mt-8 pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 font-sans">
              <span className="flex items-center gap-2">
                <span>💡</span>
                <span>تعثرتِ في قراءة أي كلمة؟ انقري عليها أو استعيني بمرشد التلميحات الصوتية لمساعدتكِ فوراً!</span>
              </span>
              <div className="flex items-center gap-3">
                {onOpenHints && (
                  <button
                    onClick={() => onOpenHints()}
                    className="text-rose-700 hover:text-rose-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>مرشد التلميحات الصوتية 🔊</span>
                  </button>
                )}
                <button
                  onClick={onOpenToolbox}
                  className="text-amber-700 hover:underline font-bold"
                >
                  تعديل الخط والألوان
                </button>
              </div>
            </div>
          </div>

          {/* Student Audio Practice & Self-Recording */}
          <AudioRecorder lessonTitle={lesson.title} />

          {/* Pedagogical Note for Teacher / Student */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 text-right space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>إضاءة تربوية لبناء الطلاقة والتميز القرائي:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {lesson.teacherNote}
            </p>
          </div>

        </div>
      )}

      {/* Tab: Vocabulary Bank */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="bg-stone-100 rounded-2xl p-4 text-right">
            <h3 className="text-sm font-bold text-stone-900 mb-1">المعجم المصور وبنك المفردات المفتاحية</h3>
            <p className="text-xs text-stone-500">تم اختيار هذه المفردات لتعزيز الحصيلة اللغوية ومساعدتك على فهم النص بعمق وبناء الجمل.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.vocabulary.map((vocab, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 text-right hover:border-amber-400 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-stone-900 font-naskh">{vocab.word}</h4>
                    <span className="text-xs text-amber-700 font-mono mt-0.5 block">{vocab.syllables}</span>
                  </div>
                  <button
                    onClick={() => speakWord(vocab.word)}
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                    title="استمع للكلمة"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-xs font-semibold text-stone-500 block mb-0.5">المعنى:</span>
                  <p className="font-medium text-stone-900">{vocab.meaning}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {vocab.root && (
                    <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                      الجذر: {vocab.root}
                    </span>
                  )}
                  {vocab.synonym && (
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200">
                      المرادف: {vocab.synonym}
                    </span>
                  )}
                  {vocab.antonym && (
                    <span className="bg-rose-50 text-rose-800 px-2 py-1 rounded-md border border-rose-200">
                      الضد: {vocab.antonym}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 italic bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60 font-naskh">
                  "{vocab.exampleSentence}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Tricky Words Syllabication Cards */}
      {activeTab === 'tricky' && (
        <div className="space-y-4">
          <div className="bg-stone-100 rounded-2xl p-4 text-right">
            <h3 className="text-sm font-bold text-stone-900 mb-1">بطاقات التقطيع الصوتي للكلمات المركبة والصعبة</h3>
            <p className="text-xs text-stone-500">
              انقر على كل مقطع صوتي في البطاقة لقراءته والاستماع إليه منفرداً لكسر الرهبة من الكلمات الطويلة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lesson.trickyWords.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs text-right space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-stone-900 font-naskh">{item.word}</h4>
                  <button
                    onClick={() => speakWord(item.word)}
                    className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Syllables chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 py-2 bg-stone-50 rounded-xl border border-stone-100" dir="rtl">
                  {item.chunks.map((chunk, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => speakWord(chunk)}
                      className="px-3 py-1.5 bg-white border border-amber-300 text-stone-800 font-bold rounded-lg text-base font-naskh hover:bg-amber-50 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-2xs"
                      title="انقر لنطق هذا المقطع"
                    >
                      {chunk}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-stone-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block mb-0.5">التحليل الصوتي:</span>
                  <p>{item.phoneticDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reading Comprehension Check */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-stone-100 rounded-2xl p-4 text-right">
            <h3 className="text-sm font-bold text-stone-900 mb-1">اختبار الفهم القرائي والاستنتاج</h3>
            <p className="text-xs text-stone-500">
              أسئلة هادفة تقيس فهم الفكرة العامة، واستخراج التفاصيل، والتفكير الاستنتاجي دون توتر زمني.
            </p>
          </div>

          <div className="space-y-6">
            {lesson.questions.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-right space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-base font-bold text-stone-900 font-cairo">
                      {q.question}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pr-9">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      let optClass = 'bg-stone-50 border-stone-200 hover:border-amber-400 hover:bg-stone-100/80 text-stone-800';

                      if (submittedQuiz) {
                        if (optIdx === q.correctIndex) {
                          optClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isThisSelected && !isCorrect) {
                          optClass = 'bg-rose-50 border-rose-400 text-rose-900';
                        }
                      } else if (isThisSelected) {
                        optClass = 'bg-amber-50 border-amber-500 text-amber-900 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswerSelect(q.id, optIdx)}
                          disabled={submittedQuiz}
                          className={`w-full p-3 text-right rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${optClass}`}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Strategy Tip before submit */}
                  {!submittedQuiz && (
                    <div className="pr-9 text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100">
                      <span className="font-bold">استراتيجية الحل: </span>
                      <span>{q.strategyTip}</span>
                    </div>
                  )}

                  {/* Explanation after submit */}
                  {submittedQuiz && (
                    <div
                      className={`pr-9 text-xs p-3 rounded-xl border ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <span className="font-bold block mb-1">
                        {isCorrect ? 'إجابة متميزة يا بطل! 🌟' : 'توضيح تربوي للإجابة الصحيحة:'}
                      </span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Results Card */}
          <div className="p-6 bg-stone-900 text-stone-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-white">
                {submittedQuiz
                  ? `أحسنت! نتيجتك: ${calculateScore()} من ${lesson.questions.length}`
                  : 'هل أنت جاهز لتأكيد إجاباتك؟'}
              </h4>
              <p className="text-xs text-stone-400">
                {submittedQuiz
                  ? 'كل خطوة تقطعها في فهم النص تعزز مهاراتك القرائية للمراحل القادمة.'
                  : 'تأكد من اختيارك ثم انقر لعرض التحليل التربوي.'}
              </p>
            </div>

            {!submittedQuiz ? (
              <button
                onClick={() => setSubmittedQuiz(true)}
                disabled={Object.keys(selectedAnswers).length < lesson.questions.length}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  Object.keys(selectedAnswers).length === lesson.questions.length
                    ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                تحقق من الإجابات
              </button>
            ) : (
              <button
                onClick={() => {
                  setSubmittedQuiz(false);
                  setSelectedAnswers({});
                }}
                className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>
      )}

      {/* Word Inspector Modal */}
      {selectedWord && (
        <WordInspectorModal
          word={selectedWord}
          matchedVocab={selectedVocab}
          onClose={() => setSelectedWord(null)}
          onAskAi={(w) => onAskAi(`اشرح لي بالتفصيل وبأسلوب مبسط كلمة "${w}" وكيف أقرؤها جيداً.`)}
          onSpeak={speakWord}
          teacherVoice={preferences.teacherVoice}
        />
      )}

    </div>
  );
};
