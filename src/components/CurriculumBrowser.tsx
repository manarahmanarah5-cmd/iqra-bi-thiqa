import React, { useState } from 'react';
import { BookOpen, Clock, FileText, ArrowLeft, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { GradeLevel, ReadingLesson } from '../types';

interface CurriculumBrowserProps {
  lessons: ReadingLesson[];
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onSelectLesson: (lesson: ReadingLesson) => void;
  completedLessonIds: string[];
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  lessons,
  selectedGrade,
  onSelectGrade,
  onSelectLesson,
  completedLessonIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const gradeTabs: { id: GradeLevel; title: string; subtitle: string; icon: string }[] = [
    { id: 'grade-7', title: 'الصف السابع', subtitle: 'بناء الطلاقة وتفكيك المقطع الساكن وحروف المد', icon: '🌱' },
    { id: 'grade-8', title: 'الصف الثامن', subtitle: 'نصوص علمية وتراثية معاصرة وتطوير الفهم', icon: '🌿' },
    { id: 'grade-9', title: 'الصف التاسع', subtitle: 'نصوص فكرية ونقدية واستنتاج عميق متقدم', icon: '🌳' },
  ];

  const categories = [
    { id: 'all', name: 'جميع النصوص' },
    { id: 'أدبي', name: 'أدبي وقصصي' },
    { id: 'علمي وتكنولوجي', name: 'علمي وتكنولوجي' },
    { id: 'قيمي', name: 'تربوي وقيمي' },
    { id: 'تاريخي وثقافي', name: 'تاريخي وحضاري' },
  ];

  const filteredLessons = lessons.filter((l) => {
    const matchesGrade = l.grade === selectedGrade;
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    return matchesGrade && matchesCategory;
  });

  return (
    <div className="space-y-8">
      
      {/* Grade Selector Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gradeTabs.map((tab) => {
          const isSelected = selectedGrade === tab.id;
          const gradeLessonCount = lessons.filter(l => l.grade === tab.id).length;
          const completedCount = lessons.filter(l => l.grade === tab.id && completedLessonIds.includes(l.id)).length;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectGrade(tab.id)}
              className={`p-6 rounded-3xl border text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-amber-400/40 ring-offset-2'
                  : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400 hover:shadow-xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tab.icon}</span>
                  <span className={`text-xs font-mono font-medium ${isSelected ? 'text-amber-400' : 'text-stone-400'}`}>
                    {completedCount} / {gradeLessonCount} مكتمل
                  </span>
                </div>
                <h3 className={`text-xl font-bold font-cairo ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                  {tab.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {tab.subtitle}
                </p>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                  <span>المستوى النشط حالياً</span>
                  <span>← عرض النصوص</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <Filter className="w-3.5 h-3.5 text-amber-600" />
          <span>تصنيف النصوص المنهجية:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLessons.map((lesson) => {
          const isDone = completedLessonIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              className="bg-white border border-stone-200 hover:border-amber-400/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 text-right group"
            >
              {/* Card Header & Unboxed Metadata */}
              <div className="space-y-3">
                {/* Zero-Pill Metadata Discipline */}
                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                  <span>{lesson.gradeNameAr}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lesson.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{lesson.readingTimeMinutes} دقائق</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{lesson.wordCount} كلمة</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo group-hover:text-amber-800 transition-colors">
                      {lesson.title}
                    </h3>
                    {isDone && (
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0" title="تمت القراءة بنجاح">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                    {lesson.summary}
                  </p>
                </div>
              </div>

              {/* Pedagogical Focus Strip */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 space-y-1">
                <span className="text-[11px] font-bold text-stone-700 block">التركيز العلاجي والمهاري:</span>
                <p className="text-xs text-stone-600">{lesson.pedagogicalFocus}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                <div className="text-xs text-stone-400">
                  <span>{lesson.wordCount} كلمة</span>
                </div>

                <button
                  onClick={() => onSelectLesson(lesson)}
                  className="px-5 py-2.5 bg-stone-900 group-hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>{isDone ? 'مراجعة الدرس' : 'ابدأ القراءة الموجهة'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
          <BookOpen className="w-8 h-8 mx-auto text-stone-300 mb-2" />
          <p className="text-sm font-semibold">لا توجد نصوص مطابقة لهذا التصنيف في الصف المختار.</p>
        </div>
      )}

    </div>
  );
};
