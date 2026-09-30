import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { cheerWelcome, playPopSound } from '../utils/audioCheer';
import { CenterLogo } from './CenterLogo';

interface WelcomeScreenProps {
  studentName: string;
  setStudentName: (name: string) => void;
  onNext: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  studentName,
  setStudentName,
  onNext,
}) => {
  const [error, setError] = useState(false);

  const handleNextClick = () => {
    if (!studentName.trim()) {
      setError(true);
      return;
    }
    setError(false);
    // Spoken cheer for the student automatically
    cheerWelcome(studentName);
    onNext();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-xl bg-gradient-to-b from-white via-rose-50/30 to-amber-50/40 rounded-3xl shadow-2xl border-2 border-rose-100 p-6 sm:p-10 text-center space-y-7 relative overflow-hidden">
        
        {/* Playful Floating Glow Effects */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-pink-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Project Branding & Joyful Visual with Official Center Logo */}
        <div className="space-y-4 relative z-10">
          <div className="flex justify-center pb-1">
            <CenterLogo size="lg" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-rose-600 font-cairo tracking-tight drop-shadow-xs">
              مَشْرُوعُ: أَقْرَأُ بِثِقَة 🌸
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>رِحْلَةُ الإِبْدَاعِ وَإِتْقَانِ الْقِرَاءِةِ وَالإِمْلَاءِ</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-[11px] font-bold">
              <span>🎙️</span>
              <span>بصوت المعلمة (صوت أنثوي فصيح ومشكول)</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            أهلاً وسهلاً بكِ يا مبدعة! هنا نستمع للقراءة العذبة، ونسجل أصواتنا الجميلة، ونتقن الإملاء بألعاب وتحديات مسلية تزيدكِ ثقة وتألقاً!
          </p>
        </div>

        {/* Name Input Form */}
        <div className="space-y-4 max-w-md mx-auto text-right relative z-10">
          <label className="block text-xs sm:text-sm font-black text-stone-800 font-cairo">
            اكتبي اسمكِ الكريم يا بطلة لنبدأ الرحلة:
          </label>

          <div className="relative">
            <input
              type="text"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                if (error) setError(false);
              }}
              onFocus={() => playPopSound()}
              onKeyDown={(e) => e.key === 'Enter' && handleNextClick()}
              placeholder="اكتبي اسمكِ هنا (مثال: مريم، فاطمة، سارة...)"
              className={`w-full px-5 py-4 rounded-2xl text-lg font-cairo text-right border-2 focus:outline-none transition-all shadow-sm ${
                error
                  ? 'border-rose-400 bg-rose-50/50 text-stone-900 focus:border-rose-500 ring-2 ring-rose-200'
                  : 'border-pink-200 bg-white hover:border-pink-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
              }`}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-bold animate-in fade-in">
              يرجى كتابة اسمكِ أولاً لنناديكِ به ونمنحكِ أوسمة التميز 🌸
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={handleNextClick}
              className="w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl text-base font-black font-cairo shadow-lg shadow-pink-300/40 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-98"
            >
              <span>التالي</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
