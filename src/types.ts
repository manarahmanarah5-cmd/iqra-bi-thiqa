export type GradeLevel = 'grade-7' | 'grade-8' | 'grade-9';

export type ReadingTheme = 'clean' | 'ivory' | 'mint' | 'sky' | 'dark';

export type AppStep = 'welcome' | 'about-and-grade' | 'select-lesson' | 'lesson-workspace';

export type LessonSubStep = 'listen' | 'record' | 'dictation';

export interface DictationItem {
  id: string;
  targetWordOrSentence: string;
  diacritizedWord: string;
  audioPrompt: string;
  hint: string;
  spellingRule: string;
  category: 'تاء' | 'تنوين_ونون' | 'همزة_متطرفة' | 'ألف_لينة' | 'ألف_التفريق' | 'حروف_محذوفة';
}

export interface VocabularyWord {
  word: string;
  syllables: string;
  meaning: string;
  synonym?: string;
  antonym?: string;
  root?: string;
  exampleSentence: string;
  partOfSpeech: 'اسم' | 'فعل' | 'حرف';
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  strategyTip: string;
}

export interface SyllableBreakdown {
  word: string;
  chunks: string[];
  type: 'مد' | 'مقطع_ساكن' | 'مشدد' | 'بسيط';
  phoneticDescription: string;
}

export interface ReadingLesson {
  id: string;
  grade: GradeLevel;
  gradeNameAr: string;
  unitNameAr: string;
  title: string;
  subtitle: string;
  author?: string;
  category: 'أدبي' | 'معلوماتي' | 'قيمي' | 'تاريخي وحضاري' | 'سيرة وتراجم';
  readingTimeMinutes: number;
  wordCount: number;
  summary: string;
  diacritizedText: string;
  plainText: string;
  paragraphs: string[];
  vocabulary: VocabularyWord[];
  trickyWords: SyllableBreakdown[];
  questions: ComprehensionQuestion[];
  dictationExercises: DictationItem[];
  teacherNote: string;
  pedagogicalFocus: string;
}

export interface UserPreferences {
  theme: ReadingTheme;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  showDiacritics: boolean;
  highlightDiacritics: boolean;
  rulerEnabled: boolean;
  rulerHeight: number;
  rulerColor: string;
  speechRate: number;
}

export interface UserStats {
  studentName: string;
  totalWordsRead: number;
  completedLessons: string[];
  recordedLessons: string[];
  passedDictations: string[];
  badges: string[];
  readingStreakDays: number;
}

