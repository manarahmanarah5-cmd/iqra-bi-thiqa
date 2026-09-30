import React, { useState, useEffect } from 'react';
import { CURRICULUM_LESSONS } from './data/curriculum';
import { GradeLevel, ReadingLesson, UserPreferences, UserStats, AppStep } from './types';
import { Header } from './components/Header';
import { ReadingRuler } from './components/ReadingRuler';
import { ReadingToolbox } from './components/ReadingToolbox';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AboutAndGradeScreen } from './components/AboutAndGradeScreen';
import { SelectLessonScreen } from './components/SelectLessonScreen';
import { LessonWorkflow } from './components/LessonWorkflow';
import { StudentProgress } from './components/StudentProgressModal';
import { CenterLogo } from './components/CenterLogo';
import { X, Heart } from 'lucide-react';
import { setActiveTeacherVoice, speakTeacherGreeting } from './utils/audioCheer';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'ivory',
  fontSize: 24,
  lineHeight: 2.1,
  letterSpacing: 0.04,
  wordSpacing: 0.12,
  showDiacritics: true,
  highlightDiacritics: true,
  rulerEnabled: false,
  rulerHeight: 65,
  rulerColor: 'rgba(254, 240, 138, 0.25)',
  speechRate: 0.85,
  teacherVoice: 'zariyah',
};

const DEFAULT_STATS: UserStats = {
  studentName: '',
  totalWordsRead: 0,
  completedLessons: [],
  recordedLessons: [],
  passedDictations: [],
  badges: ['first-step'],
  readingStreakDays: 1,
};

export default function App() {
  // Main app steps requested by the user:
  // 1: welcome (name input) -> 2: about-and-grade -> 3: select-lesson -> 4: lesson-workspace (listen -> record -> dictation)
  const [appStep, setAppStep] = useState<AppStep>('welcome');
  const [showProgressModal, setShowProgressModal] = useState(false);

  const [studentName, setStudentName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('iqra_student_name');
      return saved || '';
    } catch {
      return '';
    }
  });

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('grade-7');
  const [activeLesson, setActiveLesson] = useState<ReadingLesson | null>(null);

  // Load preferences & stats from localStorage
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('iqra_reader_prefs');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('iqra_reader_stats');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Modal state
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);

  // Save student name
  const handleSaveStudentName = (name: string) => {
    setStudentName(name);
    try {
      localStorage.setItem('iqra_student_name', name);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem('iqra_reader_prefs', JSON.stringify(preferences));
      if (preferences.teacherVoice) {
        setActiveTeacherVoice(preferences.teacherVoice);
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [preferences]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem('iqra_reader_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [stats]);

  // Reading Completed
  const handleCompleteReading = (lessonId: string) => {
    const lesson = CURRICULUM_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return;

    setStats((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;

      const newCompleted = [...prev.completedLessons, lessonId];
      const newTotalWords = prev.totalWordsRead + lesson.wordCount;
      const newBadges = [...prev.badges];

      if (newCompleted.length >= 1 && !newBadges.includes('first-step')) {
        newBadges.push('first-step');
      }
      if (newCompleted.length >= 2 && !newBadges.includes('comprehension-star')) {
        newBadges.push('comprehension-star');
      }

      return {
        ...prev,
        completedLessons: newCompleted,
        totalWordsRead: newTotalWords,
        badges: newBadges,
      };
    });
  };

  // Recording Completed
  const handleCompleteRecording = (lessonId: string) => {
    setStats((prev) => {
      if (prev.recordedLessons.includes(lessonId)) return prev;
      const newRecorded = [...prev.recordedLessons, lessonId];
      const newBadges = [...prev.badges];
      if (!newBadges.includes('audio-champion')) {
        newBadges.push('audio-champion');
      }
      return {
        ...prev,
        recordedLessons: newRecorded,
        badges: newBadges,
      };
    });
  };

  // Dictation Item Completed
  const handleCompleteDictationItem = (lessonId: string, itemId: string) => {
    setStats((prev) => {
      if (prev.passedDictations.includes(itemId)) return prev;
      const newPassed = [...prev.passedDictations, itemId];
      const newBadges = [...prev.badges];
      if (!newBadges.includes('dictation-champion')) {
        newBadges.push('dictation-champion');
      }
      return {
        ...prev,
        passedDictations: newPassed,
        badges: newBadges,
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/40 via-amber-50/20 to-pink-50/30 font-cairo selection:bg-pink-200 selection:text-rose-950">
      
      {/* Focus Reading Ruler Overlay */}
      <ReadingRuler
        enabled={preferences.rulerEnabled}
        height={preferences.rulerHeight}
        color={preferences.rulerColor}
      />

      {/* Vibrant Header with Cheering Voice Button */}
      <Header
        studentName={studentName}
        onTestVoice={() => {
          speakTeacherGreeting('female', studentName);
        }}
        onGoHome={() => setAppStep('welcome')}
        onGoGrades={() => setAppStep('about-and-grade')}
        onOpenProgress={() => setShowProgressModal(true)}
        onOpenToolbox={() => setIsToolboxOpen(true)}
        rulerActive={preferences.rulerEnabled}
        onToggleRuler={() => setPreferences(p => ({ ...p, rulerEnabled: !p.rulerEnabled }))}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* STEP 1: WELCOME SCREEN (تدخل الطالبة اسمها) */}
        {appStep === 'welcome' && (
          <WelcomeScreen
            studentName={studentName}
            setStudentName={handleSaveStudentName}
            onNext={() => setAppStep('about-and-grade')}
          />
        )}

        {/* STEP 2: ABOUT PROJECT & GRADE SELECTION (التعريف عن المشروع واختيار الصف) */}
        {appStep === 'about-and-grade' && (
          <AboutAndGradeScreen
            studentName={studentName}
            selectedGrade={selectedGrade}
            onSelectGrade={setSelectedGrade}
            onNext={() => setAppStep('select-lesson')}
            onBack={() => setAppStep('welcome')}
          />
        )}

        {/* STEP 3: SELECT LESSON (تختار الطالبة النص القرائي) */}
        {appStep === 'select-lesson' && (
          <SelectLessonScreen
            studentName={studentName}
            selectedGrade={selectedGrade}
            lessons={CURRICULUM_LESSONS}
            completedLessonIds={stats.completedLessons}
            recordedLessonIds={stats.recordedLessons}
            passedDictationIds={stats.passedDictations}
            onSelectLesson={(lesson) => {
              setActiveLesson(lesson);
              setAppStep('lesson-workspace');
            }}
            onBack={() => setAppStep('about-and-grade')}
          />
        )}

        {/* STEP 4: LESSON WORKSPACE (تستمع -> تسجل صوتها -> الإملاء) */}
        {appStep === 'lesson-workspace' && activeLesson && (
          <LessonWorkflow
            lesson={activeLesson}
            studentName={studentName}
            preferences={preferences}
            onOpenToolbox={() => setIsToolboxOpen(true)}
            onBackToLessons={() => setAppStep('select-lesson')}
            onCompleteReading={handleCompleteReading}
            onCompleteRecording={handleCompleteRecording}
            onCompleteDictationItem={handleCompleteDictationItem}
            isReadDone={stats.completedLessons.includes(activeLesson.id)}
            isRecordDone={stats.recordedLessons.includes(activeLesson.id)}
            passedDictationIds={stats.passedDictations}
          />
        )}

      </main>

      {/* Progress & Badges Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-rose-200 p-6 sm:p-8 my-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-rose-100">
              <span className="text-sm font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-xl">
                لوحة الأوسمة والإنجازات 🏆
              </span>
              <button
                onClick={() => setShowProgressModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4">
              <StudentProgress
                stats={{ ...stats, studentName }}
                lessons={CURRICULUM_LESSONS}
                onSelectLesson={(lesson) => {
                  setActiveLesson(lesson);
                  setSelectedGrade(lesson.grade);
                  setAppStep('lesson-workspace');
                  setShowProgressModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Accommodations Toolbox Modal */}
      <ReadingToolbox
        isOpen={isToolboxOpen}
        onClose={() => setIsToolboxOpen(false)}
        preferences={preferences}
        onChange={setPreferences}
        onReset={() => setPreferences(DEFAULT_PREFERENCES)}
      />

      {/* Cheerful Editorial Footer with Center Logo & Educators Credits */}
      <footer className="mt-auto border-t-2 border-rose-100 bg-white/95 backdrop-blur-md text-stone-700 py-8 text-xs shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Official Center Logo */}
          <div className="flex flex-col items-center justify-center">
            <CenterLogo size="md" />
          </div>

          {/* Project Preparation Credits Card */}
          <div className="bg-gradient-to-r from-amber-50/90 via-rose-50/70 to-pink-50/90 border-2 border-amber-200/80 rounded-3xl p-5 shadow-xs max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-black text-amber-900 bg-amber-100/80 px-4 py-1 rounded-full border border-amber-300/60 shadow-2xs font-cairo">
              <span>✨ إِعْــدَادُ وَإِشْـرَافُ الْمَشْـرُوعِ ✨</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
              {/* Specialist Huda Al-Harithiya */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-amber-200/70 shadow-2xs flex items-center gap-3 hover:border-amber-300 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  📚
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-amber-800 block">
                    أخصائية مركز مصادر التعلم
                  </span>
                  <strong className="text-sm font-black text-stone-900 font-cairo block">
                    هدى بنت حميد الحارثية
                  </strong>
                </div>
              </div>

              {/* Teacher Rahma Al-Habsia */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-rose-200/70 shadow-2xs flex items-center gap-3 hover:border-rose-300 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  🌸
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold text-rose-800 block">
                    معلمة صعوبات التعلم
                  </span>
                  <strong className="text-sm font-black text-stone-900 font-cairo block">
                    رحمة بنت سالم الحبسية
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-footer details */}
          <div className="border-t border-rose-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right text-stone-500 text-[11px]">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="font-black text-rose-600 font-cairo">أَقْرَأُ بِثِقَة 🌸</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-stone-700">مشروع إتقان القراءة والطلاقة اللغوية والإملاء</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-800 font-black">الصفوف الدراسية (7 · 8 · 9)</span>
            </div>
            <div className="flex items-center gap-3 text-stone-500 font-bold">
              {studentName && (
                <span className="text-rose-800 font-black bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                  بطلة القراءة: {studentName} 🌸
                </span>
              )}
              <span>مدرسة المنارة للتعليم الأساسي</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
