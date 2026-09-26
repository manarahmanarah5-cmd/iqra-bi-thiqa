import React, { useState } from 'react';
import { BookOpen, Clock, ArrowLeft, ArrowRight, Sparkles, Headphones, Mic, PenTool, Volume2, CheckCircle2 } from 'lucide-react';
import { GradeLevel, ReadingLesson } from '../types';
import { cheerLessonSelected, speakCheer, playPopSound } from '../utils/audioCheer';

interface SelectLessonScreenProps {
  studentName: string;
  selectedGrade: GradeLevel;
  lessons: ReadingLesson[];
  completedLessonIds: string[];
  recordedLessonIds: string[];
  passedDictationIds: string[];
  onSelectLesson: (lesson: ReadingLesson) => void;
  onBack: () => void;
}

export const SelectLessonScreen: React.FC<SelectLessonScreenProps> = ({
  studentName,
  selectedGrade,
  lessons,
  completedLessonIds,
  recordedLessonIds,
  passedDictationIds,
  onSelectLesson,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const gradeNameMap: Record<GradeLevel, string> = {
    'grade-7': 'الصف السابع',
    'grade-8': 'الصف الثامن',
    'grade-9': 'الصف التاسع',
  };

  const filteredLessons = lessons.filter(l => {
    const matchesGrade = l.grade === selectedGrade;
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    return matchesGrade && matchesCategory;
  });

  const handleLessonChosen = (lesson: ReadingLesson) => {
    cheerLessonSelected(lesson.title);
    onSelectLesson(lesson);
  };

  const handleCheerPrompt = () => {
    speakCheer(
      `أنتِ بطلة متميزة يا ${studentName || 'غاليتنا'}! اختاري أي نص يعجبكِ لتبدئي بالاستماع ثم تسجيل صوتكِ العذب والتدرب على الإملاء الشيق!`
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 text-right">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-950 py-2.5 px-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 transition-all cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
        >
          <ArrowRight className="w-4 h-4 text-rose-500" />
          <span>الرجوع لاختيار صف آخر</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-stone-500 font-bold">بطلة القراءة:</span>
          <span className="text-xs font-black text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 font-cairo shadow-2xs">
            🌸 {studentName || 'المتعلمة المبدعة'}
          </span>
          <span className="text-xs font-black text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
            {gradeNameMap[selectedGrade]}
          </span>

          <button
            onClick={handleCheerPrompt}
            className="p-1.5 rounded-xl bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors cursor-pointer"
            title="استمعي للتشجيع الصوتي"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Title & Motivation */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          <BookOpen className="w-4 h-4 text-rose-500" />
          <span>المنهج الدراسي المعتمد • سلطنة عُمان</span>
        </div>
        <h2 className="text-3xl font-black text-stone-900 font-cairo">
          اختاري النص القرائي لبدء رحلة التميز 🌸
        </h2>
        <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
          ستمرّين في كل نص بثلاث خطوات ممتعة: <strong>الاستماع الملون</strong>، ثم <strong>تسجيل صوتكِ المبدع</strong>، ثم <strong>تدريب الإملاء التفاعلي</strong> لنيل وسام التفوق!
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-rose-50/70 border border-rose-100 rounded-2xl w-fit">
        {[
          { id: 'all', name: 'جميع النصوص' },
          { id: 'أدبي', name: 'نصوص أدبية' },
          { id: 'معلوماتي', name: 'نصوص علمية وتفسيرية' },
          { id: 'سيرة وتراجم', name: 'سير وتراجم' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playPopSound();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const isReadDone = completedLessonIds.includes(lesson.id);
          const isRecorded = recordedLessonIds.includes(lesson.id);
          const isDictationDone = lesson.dictationExercises.every(d => passedDictationIds.includes(d.id));
          const isFullyDone = isReadDone && isRecorded && isDictationDone;

          return (
            <div
              key={lesson.id}
              className={`bg-white border-2 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group text-right transform hover:-translate-y-1 relative overflow-hidden ${
                isFullyDone ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-rose-100 hover:border-pink-300'
              }`}
            >
              {isFullyDone && (
                <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-br-2xl flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>مُتقن بالكامل 🏆</span>
                </div>
              )}

              {/* Card Meta & Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
                    {lesson.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{lesson.readingTimeMinutes} د</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-cairo group-hover:text-rose-600 transition-colors">
                    {lesson.title}
                  </h3>
                  {lesson.author && (
                    <span className="text-xs text-stone-400 block mt-0.5 font-medium">
                      بقلم: {lesson.author}
                    </span>
                  )}
                  <p className="text-xs text-stone-600 leading-relaxed mt-2 line-clamp-3">
                    {lesson.summary}
                  </p>
                </div>
              </div>

              {/* 3 Step Badge Indicators */}
              <div className="pt-3 border-t border-rose-100 space-y-2">
                <span className="text-[11px] font-black text-stone-500 block">
                  مراحل إتقان النص:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center font-black">
                  <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                    isReadDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-50/60 text-stone-600'
                  }`}>
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>١. استماع</span>
                  </div>

                  <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                    isRecorded ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-50/60 text-stone-600'
                  }`}>
                    <Mic className="w-4 h-4 text-emerald-600" />
                    <span>٢. تسجيل</span>
                  </div>

                  <div className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                    isDictationDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-50/60 text-stone-600'
                  }`}>
                    <PenTool className="w-4 h-4 text-emerald-600" />
                    <span>٣. إملاء</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleLessonChosen(lesson)}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl text-xs font-black font-cairo shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>ابدئي التدريب القرائي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
