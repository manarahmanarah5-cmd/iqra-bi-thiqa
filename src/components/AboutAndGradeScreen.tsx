import React from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Headphones, Mic, PenTool, Eye, Volume2, CheckCircle2 } from 'lucide-react';
import { GradeLevel } from '../types';
import { cheerGradeSelected, speakCheer, playChimeSound } from '../utils/audioCheer';
import { CenterLogo } from './CenterLogo';

interface AboutAndGradeScreenProps {
  studentName: string;
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AboutAndGradeScreen: React.FC<AboutAndGradeScreenProps> = ({
  studentName,
  selectedGrade,
  onSelectGrade,
  onNext,
  onBack,
}) => {
  const grades: { id: GradeLevel; title: string; stage: string; desc: string; icon: string; unitsCount: string; color: string }[] = [
    {
      id: 'grade-7',
      title: 'الصف السابع',
      stage: 'المرحلة المتوسطة',
      desc: 'بناء طلاقة القراءة، تفكيك المقاطع الساكنة والمدود، والتدريب الممتع على التاء المربوطة والتنوين والألف اللينة.',
      icon: '🌱',
      unitsCount: '٤ وحدات • ١٣ نصاً',
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'grade-8',
      title: 'الصف الثامن',
      stage: 'المرحلة المتوسطة',
      desc: 'نصوص السير والتجارب الإنسانية الملهمة، والتعبير الأدبي، وتطبيقات الهمزات المتوسطة والمتطرفة وألف التفريق.',
      icon: '🌿',
      unitsCount: '٤ وحدات • ١٢ نصاً',
      color: 'from-rose-500 to-pink-500'
    },
    {
      id: 'grade-9',
      title: 'الصف التاسع',
      stage: 'المرحلة المتوسطة',
      desc: 'نصوص بلاغية وأدبية وفكرية متقدمة، الأدب العماني في عصر اليعاربة، وروائع المتنبي والبوصيري وابن سينا والرافعي.',
      icon: '🌳',
      unitsCount: '٤ وحدات • ١٢ نصاً',
      color: 'from-violet-500 to-purple-600'
    },
  ];

  const handleGradeClick = (grade: typeof grades[0]) => {
    onSelectGrade(grade.id);
    cheerGradeSelected(grade.title);
  };

  const handleListenOverview = () => {
    playChimeSound();
    speakCheer(
      `يا مرحباً بكِ يا ${studentName || 'بطلة القراءة'}! في مشروع أقرأ بثقة، رحلتنا ممتعة وسهلة بثلاث خطوات: أولاً تستمعين للقراءة وتتابعين الكلمات، ثانياً تسجلين قراءتكِ بصوتكِ الجميل بكل ثقة، وثالثاً تتدربين على الإملاء الذكي لتنالي وسام التميز! هيا اختاري صفكِ الدراسي لننطلق معاً!`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      
      {/* Personalized Welcoming Callout */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-300/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>مشروع «أقرأ بثقة» • لإتقان القراءة والطلاقة اللغوية 🌸</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-cairo">
            أهلاً وسهلاً بكِ يا بطلة القراءة: {studentName || 'المتعلمة المتميزة'} 🌟
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 leading-relaxed max-w-2xl font-medium">
            تعرفي أولاً على فكرة المشروع وكيف سيصحبكِ خطوة بخطوة، ثم اختاري صفكِ الدراسي للانتقال لنصوص المنهج المدرسي الممتعة.
          </p>

          <button
            onClick={handleListenOverview}
            className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 text-xs font-extrabold shadow-sm cursor-pointer transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>استمعي للشرح 🔊</span>
          </button>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-bold text-white/90 hover:text-white bg-black/20 hover:bg-black/30 px-3 py-2 rounded-xl flex items-center gap-1.5 self-start md:self-auto cursor-pointer border border-white/20 transition-all shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تغيير الاسم</span>
        </button>
      </div>

      {/* Part 1: Project Overview (التعريف عن المشروع) */}
      <section className="bg-white border-2 border-rose-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-right">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-2 border-b border-rose-100">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">
              الرؤية والهدف المبهج
            </span>
            <h3 className="text-2xl font-black text-stone-900 font-cairo">
              عن مشروع «أقرأ بثقة 🌸»
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              مشروع تعليمي ملهم ومبهج يهدف إلى تمكينكِ يا بطلة من إتقان القراءة الجهرية بطلاقة، وبناء ثقتكِ التامة بنفسكِ، وتطوير مهاراتكِ الإملائية عبر بيئة تفاعلية حيوية تشمل الاستماع النموذجي، التسجيل الصوتي الممتع، والتدريب الإملائي التفاعلي المدعوم بالصوت التشجيعي المستمر!
            </p>
          </div>
          <div className="shrink-0 p-2 bg-white rounded-2xl border border-stone-200">
            <CenterLogo size="sm" />
          </div>
        </div>

        {/* 3 Step Journey Explainer */}
        <div className="pt-2">
          <h4 className="text-sm font-black text-stone-900 font-cairo mb-4 flex items-center gap-2">
            <span>رحلتكِ التعليمية في كل درس تتكون من ٣ خطوات شيقة:</span>
            <span className="text-amber-500 font-bold">✨</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200/90 space-y-2.5 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold text-base shadow-xs">
                <Headphones className="w-6 h-6 text-amber-950" />
              </div>
              <h5 className="text-base font-black text-amber-900 font-cairo">
                ١. الاستماع والتتبع الملون
              </h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                تستمعين للنص المشكول مع تظليل متزامن لكل كلمة، ويمكنكِ النقر على أي كلمة للاستماع لنطقها وتفكيكها لمقاطع واضحة.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200/90 space-y-2.5 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Mic className="w-6 h-6" />
              </div>
              <h5 className="text-base font-black text-rose-900 font-cairo">
                ٢. تسجيل صوتكِ العذب
              </h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                تسجلين قراءتكِ بصوتكِ الواضح، وتستمعين لتسجيلكِ بكل فخر واعتزاز!
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200/90 space-y-2.5 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <PenTool className="w-6 h-6" />
              </div>
              <h5 className="text-base font-black text-emerald-900 font-cairo">
                ٣. الإملاء التفاعلي الذكي
              </h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                تستمعين لكلمات وجمل من الدرس وتكتبينها مع فحص فوري مشجع وتلميحات مبسطة حتى تتقني الكلمة بنسبة 100%!
              </p>
            </div>

          </div>
        </div>

        {/* Visual Comfort Feature Highlight */}
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 flex items-center gap-3 text-xs text-stone-700">
          <Eye className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>راحة بصرية تامة:</strong> يمكنكِ في أي وقت تفعيل <strong>مسطرة القراءة</strong> لضبط التركيز على السطر الحالي، وتغيير ألوان الخلفية (عاجي دافئ، نعناع هادئ) لقراءة مريحة للعينين.
          </span>
        </div>
      </section>

      {/* Part 2: Grade Selection (اختيار الصف) */}
      <section className="space-y-4 text-right">
        <div>
          <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">
            المرحلة الدراسية
          </span>
          <h3 className="text-2xl font-black text-stone-900 font-cairo mt-1">
            اختاري صفكِ الدراسي 📚
          </h3>
          <p className="text-xs text-stone-500">
            انقري على الصف المناسب لكِ لعرض النصوص القرائية المقررة في المنهج العماني:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {grades.map((grade) => {
            const isSelected = selectedGrade === grade.id;

            return (
              <button
                key={grade.id}
                onClick={() => handleGradeClick(grade)}
                className={`p-6 rounded-3xl border-3 text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 transform hover:-translate-y-1 ${
                  isSelected
                    ? 'bg-stone-900 text-white border-amber-400 shadow-xl ring-4 ring-amber-400/30'
                    : 'bg-white text-stone-900 border-rose-100 hover:border-pink-300 hover:shadow-lg'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl filter drop-shadow-xs">{grade.icon}</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      isSelected ? 'bg-amber-400 text-stone-950' : 'bg-pink-50 text-rose-700 border border-pink-200'
                    }`}>
                      {grade.unitsCount}
                    </span>
                  </div>

                  <h4 className="text-xl font-black font-cairo">
                    {grade.title}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                    {grade.desc}
                  </p>
                </div>

                <div className={`pt-3 border-t text-xs font-black flex items-center justify-between ${
                  isSelected ? 'border-stone-800 text-amber-300' : 'border-stone-100 text-rose-600'
                }`}>
                  <span className="flex items-center gap-1.5">
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    <span>{isSelected ? 'الصف المختار حالياً ✓' : 'انقري للاختيار'}</span>
                  </span>
                  <span>←</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button to Next Step */}
        <div className="pt-6 flex justify-end">
          <button
            onClick={() => {
              playChimeSound();
              onNext();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl text-base font-black font-cairo shadow-lg shadow-pink-300/40 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>التالي: اختيار النص القرائي</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </section>

    </div>
  );
};
