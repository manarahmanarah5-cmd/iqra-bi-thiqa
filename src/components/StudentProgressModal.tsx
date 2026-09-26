import React from 'react';
import { Award, BookOpen, Star, CheckCircle, Flame, ArrowLeft, Volume2, Sparkles } from 'lucide-react';
import { UserStats, ReadingLesson } from '../types';
import { speakCheer, playFanfareSound } from '../utils/audioCheer';

interface StudentProgressProps {
  stats: UserStats;
  lessons: ReadingLesson[];
  onSelectLesson: (lesson: ReadingLesson) => void;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  stats,
  lessons,
  onSelectLesson,
}) => {
  const allBadges = [
    {
      id: 'first-step',
      name: 'وسام الانطلاقة الأولى 🌸',
      desc: 'إتمام قراءة أول نص تدريبي بنجاح',
      icon: '🚀',
      isUnlocked: stats.completedLessons.length >= 1
    },
    {
      id: 'syllable-master',
      name: 'نجمة الاستماع والتتبع 🎧',
      desc: 'الاستماع للنصوص وتتبع الكلمات الملونة بتركيز',
      icon: '🎧',
      isUnlocked: stats.completedLessons.length >= 1
    },
    {
      id: 'audio-champion',
      name: 'وسام الصوت الواثق 🎙️',
      desc: 'تسجيل القراءة الجهرية والاستماع للنفس بكل شجاعة',
      icon: '🎙️',
      isUnlocked: (stats.recordedLessons?.length || 0) >= 1 || stats.completedLessons.length >= 1
    },
    {
      id: 'comprehension-star',
      name: 'نجمة الفهم القرائي ⭐',
      desc: 'استيعاب الأفكار والكلمات الجديدة في المنهج',
      icon: '⭐',
      isUnlocked: stats.completedLessons.length >= 2
    },
    {
      id: 'dictation-champion',
      name: 'بطلة الإملاء المتقن ✍️',
      desc: 'اجتياز التمارين الإملائية بنجاح تام',
      icon: '✍️',
      isUnlocked: (stats.passedDictations?.length || 0) >= 1
    },
    {
      id: 'middle-school-hero',
      name: 'وسام التفوق والإرادة 🏆',
      desc: 'إكمال نصوص قرائية من المنهج المدرسي العماني',
      icon: '🏆',
      isUnlocked: stats.completedLessons.length >= 3
    }
  ];

  const completionPercentage = Math.round((stats.completedLessons.length / lessons.length) * 100);

  const handleCheerProgress = () => {
    playFanfareSound();
    speakCheer(
      `ما شاء الله عليكِ يا ${stats.studentName || 'بطلة القراءة'}! لقد قرأتِ ${stats.totalWordsRead} كلمة، وأنجزتِ خطوات ممتازة نحو وسام التفوق! نحن فخورون بكِ وبإبداعكِ الدائم!`
    );
  };

  return (
    <div className="space-y-8 text-right">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-300/40">
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-amber-200 bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-xs">
              سجل الإنجاز والمسار القرائي • مدرسة المنارة 🌸
            </span>

            <button
              onClick={handleCheerProgress}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-rose-700 text-xs font-extrabold shadow-sm hover:bg-rose-50 cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>استمعي لرسالة فخر وتشجيع 🔊</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-cairo">
            مرحباً بكِ يا {stats.studentName || 'بطلة القراءة'}! انظري إلى ما حققته في رحلتكِ الرائعة 🌸
          </h1>
          <p className="text-sm text-pink-100 max-w-2xl leading-relaxed font-medium">
            كل كلمة تقرئينها وكل تدريب إملائي تنجزينه هو خطوة عملاقة نحو الطلاقة والتألق والتفوق الدراسي!
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border-2 border-rose-100 rounded-3xl p-5 shadow-sm text-right space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-black text-stone-600">الكلمات المقروءة</span>
            <BookOpen className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono tabular-nums">
            {stats.totalWordsRead}
          </div>
          <span className="text-xs text-stone-500 font-bold">كلمة تم التدرب عليها</span>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-sm text-right space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-black text-stone-600">الدروس المنجزة</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono tabular-nums">
            {stats.completedLessons.length} / {lessons.length}
          </div>
          <span className="text-xs text-stone-500 font-bold">نسبة الإنجاز {completionPercentage}%</span>
        </div>

        <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 shadow-sm text-right space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-black text-stone-600">أيام التدريب</span>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-orange-500 font-mono tabular-nums">
            {stats.readingStreakDays}
          </div>
          <span className="text-xs text-stone-500 font-bold">أيام تألق وإصرار</span>
        </div>

        <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 shadow-sm text-right space-y-1">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-black text-stone-600">الأوسمة المكتسبة</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-500 font-mono tabular-nums">
            {allBadges.filter(b => b.isUnlocked).length} / {allBadges.length}
          </div>
          <span className="text-xs text-stone-500 font-bold">أوسمة فخر واعتزاز</span>
        </div>

      </div>

      {/* Badges Showcase Grid */}
      <div className="bg-white border-2 border-rose-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-black text-stone-900 font-cairo">أوسمة الإتقان والتميز القرائي 🏆</h3>
            <p className="text-xs text-stone-500 font-medium">تفتح الأوسمة تلقائياً مع استمرارك في القراءة والتدريب الصوتي والإملاء التفاعلي.</p>
          </div>
          <span className="text-xs font-black text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
            شارات التقدير
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-3xl border-2 text-right transition-all flex items-start gap-3.5 ${
                badge.isUnlocked
                  ? 'bg-gradient-to-r from-rose-50/50 to-amber-50/50 border-rose-200 shadow-sm'
                  : 'bg-stone-50 border-stone-200 opacity-60 grayscale'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {badge.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-stone-900 font-cairo">{badge.name}</h4>
                  {badge.isUnlocked && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      مكتسب ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curriculum Lessons Progression Checklist */}
      <div className="bg-white border-2 border-rose-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-xl font-black text-stone-900 font-cairo">
          قائمة دروس المنهج وحالة الإتمام 📚
        </h3>

        <div className="divide-y divide-rose-50">
          {lessons.map((lesson) => {
            const completed = stats.completedLessons.includes(lesson.id);

            return (
              <div
                key={lesson.id}
                className="py-3.5 flex items-center justify-between gap-3 text-right hover:bg-rose-50/40 px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      completed
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-stone-300 text-stone-400'
                    }`}
                  >
                    {completed ? '✓' : ''}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 font-cairo">{lesson.title}</h4>
                    <span className="text-xs text-stone-400 font-bold">{lesson.gradeNameAr} · {lesson.category}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectLesson(lesson)}
                  className="px-4 py-2 text-xs font-black text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>{completed ? 'مراجعة الدرس' : 'ابدئي القراءة'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
