import React, { useState, useEffect, useMemo } from 'react';
import {
  Headphones,
  Mic,
  PenTool,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Volume2,
  Settings2,
  Printer,
  Star,
  Lightbulb,
  Gauge,
  RotateCcw
} from 'lucide-react';
import { ReadingLesson, UserPreferences, LessonSubStep } from '../types';
import { InteractiveReader } from './InteractiveReader';
import { AudioRecorder } from './AudioRecorder';
import { DictationActivity } from './DictationActivity';
import { CenterLogo } from './CenterLogo';
import { InteractiveHintsModal } from './InteractiveHintsModal';
import {
  cheerListeningStep,
  cheerRecordingStart,
  cheerLessonCompleted,
  playFanfareSound,
  playChimeSound,
  speakCheer
} from '../utils/audioCheer';

interface LessonWorkflowProps {
  lesson: ReadingLesson;
  studentName: string;
  preferences: UserPreferences;
  onOpenToolbox: () => void;
  onBackToLessons: () => void;
  onCompleteReading: (lessonId: string) => void;
  onCompleteRecording: (lessonId: string) => void;
  onCompleteDictationItem: (lessonId: string, itemId: string) => void;
  isReadDone: boolean;
  isRecordDone: boolean;
  passedDictationIds: string[];
}

export const LessonWorkflow: React.FC<LessonWorkflowProps> = ({
  lesson,
  studentName,
  preferences,
  onOpenToolbox,
  onBackToLessons,
  onCompleteReading,
  onCompleteRecording,
  onCompleteDictationItem,
  isReadDone,
  isRecordDone,
  passedDictationIds,
}) => {
  const [subStep, setSubStep] = useState<LessonSubStep>('listen');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showHintsModal, setShowHintsModal] = useState(false);
  const [hintsTargetDictIndex, setHintsTargetDictIndex] = useState(0);
  const [hintsHighlightedWord, setHintsHighlightedWord] = useState('');

  // Live real-time word tracking state while recording voice
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [currentRecordingWordIndex, setCurrentRecordingWordIndex] = useState(0);
  const [paceSpeed, setPaceSpeed] = useState<'calm' | 'normal' | 'fast'>('normal');

  // Breakdown text into paragraph words with global indices
  const paragraphWordList = useMemo(() => {
    let counter = 0;
    return lesson.paragraphs.map(p => {
      const pText = preferences.showDiacritics ? p : p.replace(/[ًٌٍَُِّْ]/g, '');
      const pWords = pText.split(/\s+/).filter(w => w.trim().length > 0);
      const mapped = pWords.map(w => {
        const idx = counter;
        counter++;
        return { word: w, globalIndex: idx };
      });
      return mapped;
    });
  }, [lesson.paragraphs, preferences.showDiacritics]);

  const allWordsFlattened = useMemo(() => {
    return paragraphWordList.flat();
  }, [paragraphWordList]);

  // Word-by-word active auto-pacing tracker while recording
  useEffect(() => {
    if (!isRecordingVoice) return;
    const intervalMs = paceSpeed === 'calm' ? 1400 : paceSpeed === 'fast' ? 700 : 950;
    const timer = setInterval(() => {
      setCurrentRecordingWordIndex(prev => {
        if (prev < allWordsFlattened.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isRecordingVoice, paceSpeed, allWordsFlattened.length]);

  // Handle Speech Recognition transcript to sync reading word
  const handleSpeechWordRecognized = (transcript: string) => {
    const cleanTokens = transcript
      .replace(/[ًٌٍَُِّْ.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (cleanTokens.length === 0) return;
    const lastSpokenWord = cleanTokens[cleanTokens.length - 1];

    const startSearch = Math.max(0, currentRecordingWordIndex - 2);
    const endSearch = Math.min(allWordsFlattened.length, currentRecordingWordIndex + 10);

    for (let i = startSearch; i < endSearch; i++) {
      const targetClean = allWordsFlattened[i].word
        .replace(/[ًٌٍَُِّْ.,\/#!$%\^&\*;:{}=\-_`~()؟،]/g, '')
        .trim();

      if (targetClean === lastSpokenWord || targetClean.startsWith(lastSpokenWord) || lastSpokenWord.startsWith(targetClean)) {
        setCurrentRecordingWordIndex(i);
        break;
      }
    }
  };

  // Check if dictation is fully completed for this lesson
  const isDictationFullyDone = lesson.dictationExercises.length > 0 &&
    lesson.dictationExercises.every(d => passedDictationIds.includes(d.id));

  const allThreeDone = isReadDone && isRecordDone && isDictationFullyDone;

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleOpenHints = (dictIndex?: number, word?: string) => {
    if (typeof dictIndex === 'number') {
      setHintsTargetDictIndex(dictIndex);
    }
    if (word) {
      setHintsHighlightedWord(word);
    }
    playChimeSound();
    setShowHintsModal(true);
  };

  const handleSwitchStep = (step: LessonSubStep) => {
    setSubStep(step);
    if (step === 'listen') {
      cheerListeningStep();
    } else if (step === 'record') {
      cheerRecordingStart();
    } else if (step === 'dictation') {
      playChimeSound();
      speakCheer('والآن مع تدريب الإملاء الشيق! استمعي للكلمات واكتبيها، أنتِ قادرة على التميز!');
    }
  };

  const handleOpenCertificate = () => {
    playFanfareSound();
    cheerLessonCompleted(studentName);
    setShowCertificate(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-rose-100">
        <button
          onClick={onBackToLessons}
          className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-stone-950 py-2.5 px-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 transition-all cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
        >
          <ArrowRight className="w-4 h-4 text-rose-500" />
          <span>الرجوع إلى قائمة نصوص {lesson.gradeNameAr}</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Interactive Hints Button */}
          <button
            onClick={() => handleOpenHints()}
            className="text-xs text-rose-950 font-black bg-gradient-to-r from-amber-300 via-rose-200 to-pink-300 hover:from-amber-400 hover:to-pink-400 border border-rose-300 px-3.5 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 group"
            title="مرشد التلميحات التفاعلي الذكي للقراءة والإملاء مع الدعم الصوتي"
          >
            <Lightbulb className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>تلميحات مساعدة (قراءة وإملاء) 💡</span>
          </button>

          <button
            onClick={onOpenToolbox}
            className="text-xs text-stone-700 font-bold bg-white hover:bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Settings2 className="w-4 h-4 text-amber-500" />
            <span>تخصيص الخط والألوان</span>
          </button>

          {allThreeDone && (
            <button
              onClick={handleOpenCertificate}
              className="text-xs text-stone-900 font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 px-4 py-2 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 animate-bounce"
            >
              <Award className="w-4 h-4 text-stone-900" />
              <span>وسام الإتقان والشهادة 🏆</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Step Guided Workflow Navigation Bar */}
      <div className="bg-white border-2 border-rose-100 rounded-3xl p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center" dir="rtl">
          
          {/* Step 1: Listen & Read */}
          <button
            onClick={() => handleSwitchStep('listen')}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all cursor-pointer ${
              subStep === 'listen'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-md ring-4 ring-rose-200'
                : isReadDone
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-rose-50/50 text-stone-600 hover:bg-rose-100/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              subStep === 'listen' ? 'bg-white text-rose-600' : isReadDone ? 'bg-emerald-600 text-white' : 'bg-rose-200 text-rose-800'
            }`}>
              {isReadDone ? '✓' : '١'}
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black block font-cairo">
                أولاً: استمعي واقرئي
              </span>
              <span className="text-[11px] opacity-90 hidden md:block">
                تظليل متزامن ونطق نقي
              </span>
            </div>
          </button>

          {/* Step 2: Record Voice */}
          <button
            onClick={() => handleSwitchStep('record')}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all cursor-pointer ${
              subStep === 'record'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-md ring-4 ring-rose-200'
                : isRecordDone
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-rose-50/50 text-stone-600 hover:bg-rose-100/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              subStep === 'record' ? 'bg-white text-rose-600' : isRecordDone ? 'bg-emerald-600 text-white' : 'bg-rose-200 text-rose-800'
            }`}>
              {isRecordDone ? '✓' : '٢'}
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black block font-cairo">
                ثانياً: سجلي صوتكِ
              </span>
              <span className="text-[11px] opacity-90 hidden md:block">
                قراءة جهرية وتقييم ذاتي
              </span>
            </div>
          </button>

          {/* Step 3: Dictation */}
          <button
            onClick={() => handleSwitchStep('dictation')}
            className={`p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition-all cursor-pointer ${
              subStep === 'dictation'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-md ring-4 ring-rose-200'
                : isDictationFullyDone
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-rose-50/50 text-stone-600 hover:bg-rose-100/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              subStep === 'dictation' ? 'bg-white text-rose-600' : isDictationFullyDone ? 'bg-emerald-600 text-white' : 'bg-rose-200 text-rose-800'
            }`}>
              {isDictationFullyDone ? '✓' : '٣'}
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black block font-cairo">
                ثالثاً: الإملاء التفاعلي
              </span>
              <span className="text-[11px] opacity-90 hidden md:block">
                تدريب ذكي وتطبيق للقواعد
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Main SubStep Content */}
      <div className="space-y-6">
        
        {/* SUBSTEP 1: LISTEN & READ */}
        {subStep === 'listen' && (
          <div className="space-y-6">
            <InteractiveReader
              lesson={lesson}
              preferences={preferences}
              onOpenToolbox={onOpenToolbox}
              onAskAi={() => {}}
              onCompleteLesson={(id) => {
                onCompleteReading(id);
                handleSwitchStep('record'); // Automatically guide to step 2!
              }}
              isCompleted={isReadDone}
              onOpenHints={(word) => handleOpenHints(undefined, word)}
            />

            {/* Next Prompt Bar */}
            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-right shadow-sm">
              <div className="space-y-1">
                <span className="text-sm font-black text-rose-950 font-cairo block">
                  هل انتهيتِ من الاستماع والتدرب على قراءة النص؟
                </span>
                <p className="text-xs text-stone-600 font-medium">
                  انتقلي للخطوة الثانية: تسجيل صوتكِ العذب وقراءتكِ الجهرية بطلاقة وثقة!
                </p>
              </div>

              <button
                onClick={() => {
                  onCompleteReading(lesson.id);
                  handleSwitchStep('record');
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-black font-cairo shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <span>الانتقال للمرحلة ٢: تسجيل الصوت</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SUBSTEP 2: RECORD VOICE */}
        {subStep === 'record' && (
          <div className="space-y-6 text-right">
            
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-pink-300/40">
              <span className="text-xs font-black text-amber-200 uppercase tracking-wider block">
                المرحلة الثانية من مشروع «أقرأ بثقة 🌸»
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-cairo mt-1">
                سجلي صوتكِ وقراءتكِ الجهرية يا بطلة 🎙️
              </h3>
              <p className="text-xs sm:text-sm text-pink-100 max-w-2xl leading-relaxed mt-2 font-medium">
                اقرئي النص بصوت واضح وهادئ، واستمعي لتسجيلكِ بعد الانتهاء وقيمي نفسكِ بالنجوم. تذكري أن صوتكِ جميل وأن القراءة تزداد طلاقة مع كل محاولة!
              </p>
            </div>

            {/* Reading Stumble & Hints Prompt Card */}
            <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                  💡
                </span>
                <div>
                  <span className="text-xs sm:text-sm font-black text-amber-950 font-cairo block">
                    هل تعثرتِ في نطق أي كلمة أثناء التسجيل الجهرِي؟
                  </span>
                  <p className="text-[11px] sm:text-xs text-stone-600 font-medium mt-0.5">
                    افتحي مرشد التلميحات للاستماع لمقاطع الكلمات الصعبة والمدود ونطقها خطوة بخطوة 🔊
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenHints()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl text-xs font-black font-cairo shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
              >
                <Lightbulb className="w-4 h-4 text-amber-200" />
                <span>تلميحات القراءة ومقاطع الكلمات 🔊</span>
              </button>
            </div>

            {/* Voice Recorder Component */}
            <AudioRecorder
              lessonTitle={lesson.title}
              onRecordCompleted={() => {
                onCompleteRecording(lesson.id);
              }}
              onRecordingStateChange={(rec) => {
                setIsRecordingVoice(rec);
                if (rec) {
                  // If starting, keep or reset word index
                }
              }}
              onSpeechWordRecognized={handleSpeechWordRecognized}
              onResetRecording={() => {
                setCurrentRecordingWordIndex(0);
              }}
            />

            {/* Live Reading Word Tracker Banner while recording */}
            {isRecordingVoice && (
              <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white p-4 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-3 text-right">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black animate-pulse shadow-sm">
                    🎙️
                  </div>
                  <div>
                    <span className="text-xs font-black block text-amber-200">
                      تلوين الكلمات المباشر أثناء التسجيل الصوتي 🌸
                    </span>
                    <span className="text-sm font-bold font-cairo">
                      الكلمة الحالية: «{allWordsFlattened[currentRecordingWordIndex]?.word || ''}»
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pace Speed Selector */}
                  <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl text-xs font-bold">
                    <span className="text-[11px] px-2 text-pink-100 hidden sm:inline">سرعة التتبع:</span>
                    <button
                      onClick={() => setPaceSpeed('calm')}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        paceSpeed === 'calm' ? 'bg-white text-stone-900 shadow-xs' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      هادئة
                    </button>
                    <button
                      onClick={() => setPaceSpeed('normal')}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        paceSpeed === 'normal' ? 'bg-white text-stone-900 shadow-xs' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      معتدلة
                    </button>
                    <button
                      onClick={() => setPaceSpeed('fast')}
                      className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                        paceSpeed === 'fast' ? 'bg-white text-stone-900 shadow-xs' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      سريعة
                    </button>
                  </div>

                  {/* Manual Step buttons */}
                  <button
                    onClick={() => setCurrentRecordingWordIndex(prev => Math.max(0, prev - 1))}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="الكلمة السابقة"
                  >
                    السابقة ◀
                  </button>
                  <button
                    onClick={() => setCurrentRecordingWordIndex(prev => Math.min(allWordsFlattened.length - 1, prev + 1))}
                    className="px-3 py-1.5 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                    title="الكلمة التالية"
                  >
                    التالية ▶
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Reading Text Display with Real-time Word Highlighting */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border-2 shadow-sm space-y-5 font-naskh transition-colors ${
                isRecordingVoice ? 'border-amber-300 bg-amber-50/20 ring-4 ring-amber-100' : 'border-rose-100 bg-white'
              }`}
              style={{
                fontSize: `${preferences.fontSize}px`,
                lineHeight: preferences.lineHeight,
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 text-xs text-stone-500 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-900">نص الدرس للقراءة الجهرية والتسجيل:</span>
                  <span className="font-bold">{lesson.title}</span>
                </div>
                {isRecordingVoice ? (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold animate-pulse text-[11px]">
                    ● جارٍ تلوين الكلمة المقروءة ({currentRecordingWordIndex + 1} من {allWordsFlattened.length})
                  </span>
                ) : (
                  <span className="text-stone-400 text-[11px]">
                    (اضغطي على الميكروفون لبدء التسجيل وتلوين الكلمات تلقائياً)
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {paragraphWordList.map((words, pIdx) => (
                  <p key={pIdx} className="leading-relaxed text-stone-800">
                    {words.map((item) => {
                      const isCurrentWord = isRecordingVoice && currentRecordingWordIndex === item.globalIndex;
                      const isReadWord = isRecordingVoice ? item.globalIndex < currentRecordingWordIndex : isRecordDone;

                      if (isCurrentWord) {
                        return (
                          <span
                            key={item.globalIndex}
                            onClick={() => setCurrentRecordingWordIndex(item.globalIndex)}
                            title="الكلمة التي تقرئينها حالياً"
                            className="relative inline-block mx-1 my-0.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 text-stone-950 font-black shadow-md ring-4 ring-amber-400 scale-110 cursor-pointer animate-pulse transition-all duration-150 z-10"
                          >
                            {item.word}
                            <span className="absolute -top-7 right-1/2 translate-x-1/2 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-black rounded-full shadow-sm whitespace-nowrap pointer-events-none">
                              🎙️ تقرأين الآن
                            </span>
                          </span>
                        );
                      }

                      if (isReadWord) {
                        return (
                          <span
                            key={item.globalIndex}
                            onClick={() => setCurrentRecordingWordIndex(item.globalIndex)}
                            title="تمت قراءتها - انقري للعودة إليها"
                            className="inline-block mx-1 my-0.5 px-1.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300/60 cursor-pointer hover:bg-emerald-200 transition-colors"
                          >
                            {item.word}
                          </span>
                        );
                      }

                      return (
                        <span
                          key={item.globalIndex}
                          onClick={() => setCurrentRecordingWordIndex(item.globalIndex)}
                          title="انقري لجعل المؤشر عند هذه الكلمة"
                          className="inline-block mx-1 my-0.5 px-1 py-0.5 rounded-lg text-stone-800 hover:bg-rose-100/60 cursor-pointer transition-colors"
                        >
                          {item.word}
                        </span>
                      );
                    })}
                  </p>
                ))}
              </div>

              {/* Helpful Hint footer */}
              <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-stone-500 font-sans">
                <span>💡 يمكنكِ النقر على أي كلمة لتحديد مؤشر القراءة إليها مباشرة.</span>
                <span className="font-bold text-rose-800">إجمالي الكلمات: {allWordsFlattened.length} كلمة</span>
              </div>
            </div>

            {/* Next Step to Dictation */}
            <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border-2 border-pink-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-black text-rose-950 font-cairo block">
                  رائع! هل انتهيتِ من تسجيل صوتكِ وتقييم قراءتكِ؟
                </span>
                <p className="text-xs text-stone-600 font-medium">
                  حان الآن وقت المرحلة الثالثة والنهائية: التدريب الإملائي التفاعلي الممتع!
                </p>
              </div>

              <button
                onClick={() => {
                  onCompleteRecording(lesson.id);
                  handleSwitchStep('dictation');
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-black font-cairo shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <span>الانتقال للمرحلة ٣: الإملاء التفاعلي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* SUBSTEP 3: DICTATION */}
        {subStep === 'dictation' && (
          <div className="space-y-6">
            <DictationActivity
              dictationItems={lesson.dictationExercises}
              studentName={studentName}
              onItemCompleted={(itemId) => {
                onCompleteDictationItem(lesson.id, itemId);
              }}
              onAllCompleted={() => {
                handleOpenCertificate();
              }}
              onOpenHints={(dictIndex) => {
                handleOpenHints(dictIndex);
              }}
            />

            {/* Completion Congratulation Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-right space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                  🏆
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-emerald-950 font-cairo">
                    مبارك يا {studentName || 'بطلة القراءة'}! أتممتِ مراحل الدرس بنجاح
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                    استمعتِ للنص، وسجلتِ صوتكِ، وأتقنتِ القواعد الإملائية بجدارة وتفوق!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleOpenCertificate}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black font-cairo shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Award className="w-5 h-5 text-amber-300" />
                  <span>عرض وطباعة شهادة الإتقان 🌸</span>
                </button>

                <button
                  onClick={onBackToLessons}
                  className="px-5 py-3.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-bold font-cairo transition-colors cursor-pointer shadow-xs"
                >
                  اختيار نص قرائي آخر
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Achievement Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-gradient-to-b from-white via-rose-50/30 to-amber-50/40 rounded-3xl shadow-2xl border-4 border-rose-300 p-6 sm:p-10 text-center space-y-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Center Logo on Certificate */}
            <div className="flex justify-center pb-1">
              <CenterLogo size="sm" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-rose-700 bg-rose-100 px-4 py-1 rounded-full border border-rose-200 inline-block font-cairo">
                مَدْرَسَةُ الْمَنَارَةِ لِلتَّعْلِيمِ الأَسَاسِيِّ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-cairo">
                شَهَادَةُ إِتْقَانٍ وَوَسَامُ تَمَيُّزٍ 🏆
              </h2>
              <p className="text-xs font-bold text-amber-800">
                مَشْرُوعُ: أَقْرَأُ بِثِقَة لإِتْقَانِ الْقِرَاءِةِ وَالإِمْلَاءِ 🌟
              </p>
            </div>

            <div className="py-5 px-6 sm:px-8 bg-white/95 rounded-3xl border-2 border-rose-200 space-y-3 shadow-inner">
              <p className="text-sm font-bold text-stone-600 font-cairo">
                تُهْدَى هَذِهِ الشَّهَادَةُ بِكُلِّ فَخْرٍ وَاعْتِزَازٍ لِلطَّالِبَةِ الْمُتَأَلِّقَةِ:
              </p>
              <div className="text-3xl sm:text-4xl font-black text-rose-600 font-cairo underline decoration-amber-400 decoration-wavy">
                {studentName || 'بَطَلَةُ القِرَاءَة'}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pt-2">
                تَقْدِيرًا لِعَزِيمَتِهَا الصَّادِقَةِ فِي إِتْمَامِ مَرَاحِلِ القِرَاءِةِ، وَتَسْجِيلِ الصَّوْتِ الجَهْرِيِّ،
                وَإِتْقَانِ النَّصِّ الإِمْلَائِيِّ لِدَرْسِ:
                <br />
                <strong className="text-rose-950 font-cairo text-base">«{lesson.title}»</strong> ({lesson.gradeNameAr})
              </p>
            </div>

            {/* Official Signatures & Supervision */}
            <div className="pt-3 border-t border-rose-200 text-xs">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-stone-500 block font-bold">أخصائية مركز مصادر التعلم</span>
                  <strong className="text-xs text-stone-900 font-black font-cairo block mt-0.5">هدى بنت حميد الحارثية</strong>
                </div>
                <div className="p-2 bg-rose-50/70 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-stone-500 block font-bold">معلمة صعوبات التعلم</span>
                  <strong className="text-xs text-stone-900 font-black font-cairo block mt-0.5">رحمة بنت سالم الحبسية</strong>
                </div>
              </div>
              <div className="text-center pt-2 text-[10px] text-stone-400 font-mono">
                {new Date().toLocaleDateString('ar-EG')} • مدرسة المنارة للتعليم الأساسي
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 no-print">
              <button
                onClick={handlePrintCertificate}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>طباعة الشهادة</span>
              </button>

              <button
                onClick={() => setShowCertificate(false)}
                className="px-5 py-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl text-xs font-black cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Hints Modal with Audio Support */}
      <InteractiveHintsModal
        isOpen={showHintsModal}
        onClose={() => setShowHintsModal(false)}
        lesson={lesson}
        currentStep={subStep}
        studentName={studentName}
        activeDictationIndex={hintsTargetDictIndex}
        highlightedText={hintsHighlightedWord}
      />

    </div>
  );
};
