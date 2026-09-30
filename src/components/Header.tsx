import React from 'react';
import { Sliders, Settings2, Award, BookOpen, Sparkles, Home } from 'lucide-react';
import { TeacherVoice } from '../types';
import { CenterLogo } from './CenterLogo';
import { getActiveTeacherVoice, getTeacherVoiceProfile } from '../utils/audioCheer';

interface HeaderProps {
  studentName: string;
  onTestVoice: () => void;
  onGoHome: () => void;
  onGoGrades: () => void;
  onOpenProgress: () => void;
  onOpenToolbox: () => void;
  rulerActive: boolean;
  onToggleRuler: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  studentName,
  onTestVoice,
  onGoHome,
  onGoGrades,
  onOpenProgress,
  onOpenToolbox,
  rulerActive,
  onToggleRuler
}) => {
  const currentVoiceProfile = getTeacherVoiceProfile(getActiveTeacherVoice());

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-md border-b border-pink-400/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Project Branding & Center Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onGoHome}
            className="text-right flex items-center gap-2.5 group cursor-pointer focus:outline-none rounded-xl"
            title="العودة للصفحة الرئيسية - مركز مصادر التعلم"
          >
            <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center border border-amber-200/80 shadow-2xs">
              <CenterLogo size="xs" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-cairo block leading-tight drop-shadow-xs">
                  أَقْرَأُ بِثِقَة 🌸
                </span>
                <span className="text-[10px] bg-amber-300/30 text-amber-100 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200/30 hidden xs:inline-block">
                  مدرسة المنارة
                </span>
              </div>
              <span className="text-[11px] text-pink-100 font-medium hidden sm:block">
                مَرْكَزُ مَصَادِرِ التَّعَلُّمِ • أَقْرَأُ لأُضِيءَ الْكَوْن
              </span>
            </div>
          </button>
        </div>

        {/* Clean, Simple Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-bold font-cairo">
          <button
            onClick={onGoHome}
            className="px-2.5 py-1.5 rounded-xl hover:bg-white/15 transition-colors flex items-center gap-1.5 cursor-pointer text-pink-50 hover:text-white"
          >
            <Home className="w-4 h-4 text-pink-200" />
            <span className="hidden md:inline">الرئيسية</span>
          </button>

          <button
            onClick={onGoGrades}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer text-white border border-white/20 shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-amber-200" />
            <span>الدروس المقررة</span>
          </button>

          <button
            onClick={onOpenProgress}
            className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-stone-900 font-extrabold hover:bg-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-900" />
            <span>الإنجازات</span>
          </button>
        </nav>

        {/* Cheering Voice & Friendly Quick Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Female Reader Voice Test Button */}
          <button
            onClick={onTestVoice}
            title={`صوت القارئة: ${currentVoiceProfile.name} (انقري للاستماع التجريبي)`}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-black rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/25 shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-sm">{currentVoiceProfile.avatar || '🎙️'}</span>
            <span className="font-cairo font-bold hidden xs:inline">{currentVoiceProfile.name}</span>
            <span className="font-cairo font-bold xs:hidden">صوت أنثى</span>
          </button>

          {/* Reading Focus Ruler Toggle */}
          <button
            onClick={onToggleRuler}
            title={rulerActive ? 'إيقاف مسطرة القراءة' : 'تفعيل مسطرة القراءة لضبط التركيز'}
            className={`p-2 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
              rulerActive
                ? 'bg-amber-300 text-stone-950 font-bold shadow-sm'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Reading Font & Color Settings */}
          <button
            onClick={onOpenToolbox}
            title="تغيير حجم الخط وتنسيق الألوان المريحة للعين وإعدادات القراءة"
            className="p-2 text-white bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Student Welcome Pill Bar if name exists */}
      {studentName.trim() && (
        <div className="bg-white/10 backdrop-blur-xs py-1 px-4 text-center text-xs font-bold text-pink-100 flex items-center justify-center gap-2 border-t border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>
            مرحباً ببطلة القراءة: <strong className="text-white underline decoration-amber-300">{studentName}</strong> 🌸 بصحبة قارئة النصوص في مركز مصادر التعلم!
          </span>
        </div>
      )}
    </header>
  );
};
