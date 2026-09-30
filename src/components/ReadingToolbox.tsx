import React from 'react';
import { X, Type, Eye, Palette, Sliders, Volume2, RotateCcw, Check } from 'lucide-react';
import { ReadingTheme, UserPreferences } from '../types';
import { speakTeacherGreeting } from '../utils/audioCheer';

interface ReadingToolboxProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onChange: (updater: (prev: UserPreferences) => UserPreferences) => void;
  onReset: () => void;
}

export const ReadingToolbox: React.FC<ReadingToolboxProps> = ({
  isOpen,
  onClose,
  preferences,
  onChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const themes: { id: ReadingTheme; name: string; bgClass: string; desc: string }[] = [
    { id: 'ivory', name: 'عاجي دافئ', bgClass: 'bg-[#FAF4E6] text-stone-900 border-[#E8DCBF]', desc: 'الأنسب لراحة العين وتخفيف الوهج البصري' },
    { id: 'mint', name: 'نعناع هادئ', bgClass: 'bg-[#F1F8F4] text-stone-900 border-[#CDE5D5]', desc: 'يوصى به لتخفيف التشتت والتوتر القرائي' },
    { id: 'sky', name: 'سماء صافية', bgClass: 'bg-[#F0F6FC] text-stone-900 border-[#CCE0F5]', desc: 'صفاء بصري مريح للقراءة الممتدة' },
    { id: 'clean', name: 'أبيض كلاسيكي', bgClass: 'bg-white text-stone-900 border-stone-200', desc: 'تباين قياسي معتاد في الكتب المدرسية' },
    { id: 'dark', name: 'داكن عالي التباين', bgClass: 'bg-[#18191C] text-stone-100 border-stone-700', desc: 'مناسب لبيئة الإضاءة الخافتة' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">حقيبة التخصيص القرائي المريح</h2>
              <p className="text-xs text-stone-500">أدوات إمكانية الوصول والتيسير لراحة العين والتركيز البصري</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Themes */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-stone-800">
              <Palette className="w-4 h-4 text-amber-600" />
              <span>لون خلفية القراءة (تخفيف الإجهاد البصري وزيادة التركيز)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChange(p => ({ ...p, theme: t.id }))}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative ${t.bgClass} ${
                    preferences.theme === t.id
                      ? 'ring-2 ring-amber-500 ring-offset-2 font-bold shadow-sm'
                      : 'hover:border-stone-400 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{t.name}</span>
                    {preferences.theme === t.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-[10px] block opacity-70 leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Font Size & Spacing */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Type className="w-4 h-4 text-amber-600" />
              <span>حجم الخط والمسافات البصرية</span>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex justify-between text-xs text-stone-600 mb-1.5">
                <span>حجم خط النص:</span>
                <span className="font-mono font-bold text-amber-700">{preferences.fontSize} بكسل</span>
              </div>
              <input
                type="range"
                min="18"
                max="32"
                step="1"
                value={preferences.fontSize}
                onChange={(e) => onChange(p => ({ ...p, fontSize: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-400 mt-0.5">
                <span>18px (معتاد)</span>
                <span>24px (موصى به للراحة التامة)</span>
                <span>32px (كبير جداً)</span>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <div className="flex justify-between text-xs text-stone-600 mb-1.5">
                <span>تباعد الأسطر (لمنع تداخل الأسطر بالعين):</span>
                <span className="font-mono font-bold text-amber-700">{preferences.lineHeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.6"
                max="2.6"
                step="0.1"
                value={preferences.lineHeight}
                onChange={(e) => onChange(p => ({ ...p, lineHeight: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Letter Spacing */}
            <div>
              <div className="flex justify-between text-xs text-stone-600 mb-1.5">
                <span>تباعد الحروف (لتوضيح الحروف المتشابهة):</span>
                <span className="font-mono font-bold text-amber-700">+{Math.round(preferences.letterSpacing * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.12"
                step="0.02"
                value={preferences.letterSpacing}
                onChange={(e) => onChange(p => ({ ...p, letterSpacing: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Tashkeel & Diacritics */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>الحركات والتشكيل الإعرابي</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-50">
                <span className="text-xs text-stone-800 font-medium">إظهار التشكيل الكامل للنص</span>
                <input
                  type="checkbox"
                  checked={preferences.showDiacritics}
                  onChange={(e) => onChange(p => ({ ...p, showDiacritics: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-50">
                <span className="text-xs text-stone-800 font-medium">تمييز تباعد الحركات البصري</span>
                <input
                  type="checkbox"
                  checked={preferences.highlightDiacritics}
                  onChange={(e) => onChange(p => ({ ...p, highlightDiacritics: e.target.checked }))}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Reading Ruler Settings */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>مسطرة القراءة والتركيز السطري</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.rulerEnabled}
                onChange={(e) => onChange(p => ({ ...p, rulerEnabled: e.target.checked }))}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {preferences.rulerEnabled && (
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span>ارتفاع نافذة المسطرة:</span>
                  <span className="font-mono text-amber-700">{preferences.rulerHeight} بكسل</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="10"
                  value={preferences.rulerHeight}
                  onChange={(e) => onChange(p => ({ ...p, rulerHeight: Number(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Section 5: Audio Rate */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>سرعة القراءة الصوتية الموجهة (TTS)</span>
            </div>
            <div className="flex gap-2">
              {[
                { rate: 0.65, label: '0.65x (تمهل فائق)' },
                { rate: 0.8, label: '0.8x (تدريبي هادئ)' },
                { rate: 1.0, label: '1.0x (طبيعي)' },
                { rate: 1.15, label: '1.15x (متقدم)' },
              ].map((item) => (
                <button
                  key={item.rate}
                  onClick={() => onChange(p => ({ ...p, speechRate: item.rate }))}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-all cursor-pointer ${
                    preferences.speechRate === item.rate
                      ? 'bg-amber-600 text-white font-bold border-amber-600'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Female Reader Voice */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                <span className="text-base">🎙️</span>
                <span>صوت القراءة (صوت أنثى نقي وواضح)</span>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                صوت نسائي تربوي فقط ✨
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 text-right space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌸</span>
                  <div>
                    <h4 className="text-xs font-black text-stone-900 font-cairo">صوت القارئة الموجهة</h4>
                    <span className="text-[10px] text-rose-700 block font-semibold">نطق عربي تربوي سليم وواضح بالتشكيل التام</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                نبرة صوتية نسائية دافئة وواضحة، صُممت لمساعدة الطالبات على متابعة الكلمات، وتطوير الطلاقة، وضبط مخارج الحروف.
              </p>
              <button
                type="button"
                onClick={() => speakTeacherGreeting('female')}
                className="w-full py-2 px-3 bg-white hover:bg-rose-100 text-rose-800 text-xs font-black rounded-lg border border-rose-200 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                <span>استماع تجريبي لصوت القارئة 🔊</span>
              </button>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-center gap-2">
              <span className="text-base shrink-0">✨</span>
              <span>
                <strong>صوت أنثوي خالص:</strong> تم استبعاد أي صوت رجالي نهائياً، وضبط التوليف الصوتي بطبقة ناعمة ومخارج دقيقة تناسب طالباتنا.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الافتراضية</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            حفظ وتطبيق
          </button>
        </div>

      </div>
    </div>
  );
};
