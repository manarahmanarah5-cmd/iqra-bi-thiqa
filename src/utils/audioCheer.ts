/**
 * Sound & Voice Cheer Engine for "أقرأ بثقة"
 * صوت المعلمة الافتراضية للذكاء الاصطناعي والقراءة:
 * 1. المعلمة هدى بنت حميد الحارثية (أخصائية صعوبات التعلم)
 * 2. المعلمة رحمة بنت سالم الحبسية (معلمة صعوبات التعلم)
 *
 * يضمن هذا المحرك اختيار الأصوات الأنثوية التربوية (صوت المعلمة)
 * مع استبعاد قطعي لأي صوت رجالي، وضبط طبقة الصوت (Pitch) لتكون نبرة أنثوية دافئة ومشجعة.
 */

import { TeacherVoice } from '../types';

// Web Audio Context for zero-latency chimes and fanfare
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Play a bright cheerful bell chime */
export function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(587.33, now); // D5
  osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(880, now);
  osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now + 0.08);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.5);
}

/** Play a celebratory fanfare for completing exercises or lessons */
export function playFanfareSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = ctx.currentTime + idx * 0.12;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.28, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === 3 ? 0.8 : 0.4));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + (idx === 3 ? 0.8 : 0.4));
  });
}

/** Play playful soft pop */
export function playPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

// --------------------------------------------------------------------------
// Female Teacher Voice Engine (Strictly No Male Voice)
// --------------------------------------------------------------------------

export interface TeacherVoiceOption {
  id: TeacherVoice;
  name: string;
  badge: string;
  role: string;
  icon: string;
  avatar: string;
  accent: string;
  description: string;
  samplePhrase: string;
}

export const TEACHER_VOICES: TeacherVoiceOption[] = [
  {
    id: 'zariyah',
    name: 'المعلمة زارية',
    badge: 'الأفصح بالتشكيل الكامل ✨',
    role: 'قارئة فصيحة متقنة لمخارج الحروف',
    icon: '🎙️',
    avatar: '👩‍🏫',
    accent: 'فصحى معيارية مشكولة',
    description: 'نبرة نسائية صافية ومخارج حروف واضحة جداً، متقنة للتشكيل الإعرابي والتنوين والمدود، مثالية لطلاب صعوبات التعلم.',
    samplePhrase: 'مرحباً بكِ يا مبدعة! أنا المعلمة زارية، هيا نقرأ معاً بصوت نقي وفصيح بالتشكيل التام!'
  },
  {
    id: 'aysha',
    name: 'المعلمة عائشة',
    badge: 'الصوت العُماني الأصيل 🇴🇲',
    role: 'قارئة نصوص المنهج العُماني',
    icon: '🇴🇲',
    avatar: '🧕',
    accent: 'عُمانية أصيلة دافئة',
    description: 'نبرة صوتية أنثوية عُمانية دافئة وهادئة، تمنح الطالبات الألفة والتشجيع أثناء قراءة نصوص كتاب مهاراتي في القراءة.',
    samplePhrase: 'أهلاً بكِ في سلطنة عُمان، أنا المعلمة عائشة، يسعدني أن أرافقكِ في دروس القراءة الممتعة!'
  },
  {
    id: 'salma',
    name: 'المعلمة سلمى',
    badge: 'النبرة التربوية الودودة 🌸',
    role: 'أخصائية التوجيه والتشجيع القرائي',
    icon: '🌸',
    avatar: '👩‍🏫',
    accent: 'تربوية هادئة ومشجعة',
    description: 'صوت نسائي دافئ ولطيف مفعم بالتشجيع والهدوء لتعزيز الطمأنينة والثقة بالنفس.',
    samplePhrase: 'أهلاً يا ذكية، أنا المعلمة سلمى، أنتِ قادرة على القراءة بكل ثقة وبراعة، هيا ننطلق!'
  },
  {
    id: 'kore',
    name: 'القارئة الذكية كوري',
    badge: 'ذكاء اصطناعي فائق النقاء 🤖',
    role: 'القارئة التوليدية المتطورة',
    icon: '✨',
    avatar: '🎧',
    accent: 'عربية فصحى رقمية نقية',
    description: 'صوت أنثوي عصري نقي وعالي الجودة تم توليده بأحدث تقنيات الصوت العصبي الذكي.',
    samplePhrase: 'أهلاً وسهلاً بكِ، أنا القارئة الذكية، يسعدني التدرب معكِ على القراءة المتقنة خطوة بخطوة!'
  }
];

const MALE_VOICE_KEYWORDS = [
  'naayf', 'nayf', 'نايف', 'tariq', 'tarik', 'طارق', 'maged', 'majed', 'ماجد',
  'shakir', 'شاكر', 'hamed', 'حامد', 'bilal', 'بلال', 'salim', 'سالم',
  'ahmed', 'أحمد', 'mohammed', 'محمد', 'youssef', 'يوسف', 'omar', 'عمر',
  'bassam', 'بسام', 'ali', 'علي', 'khalid', 'خالد',
  'male', 'ذكر', 'man', 'boy', 'david', 'george', 'mark', 'richard', 'john',
  'ar-xa-standard-b', 'ar-xa-standard-c', 'ar-xa-wavenet-b', 'ar-xa-wavenet-c'
];

const FEMALE_VOICE_KEYWORDS = [
  'hoda', 'huda', 'هدى', 'salma', 'سلمى', 'zariyah', 'زارية', 'fatima', 'fatimah', 'فاطمة',
  'sana', 'سناء', 'amina', 'أمينة', 'laila', 'layla', 'ليلى', 'mariam', 'marium', 'مريم',
  'zeina', 'زينة', 'yasmin', 'ياسمين', 'female', 'woman', 'girl', 'أنثى', 'سيدة', 'معلمة',
  'siri', 'kore', 'ar-xa-standard-a', 'ar-xa-wavenet-a', 'arz', 'ard'
];

export function getActiveTeacherVoice(): TeacherVoice {
  if (typeof window === 'undefined') return 'zariyah';
  try {
    const saved = localStorage.getItem('iqra_teacher_voice') as TeacherVoice;
    if (saved && ['zariyah', 'aysha', 'salma', 'kore'].includes(saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'zariyah';
}

export function setActiveTeacherVoice(voice: TeacherVoice) {
  if (typeof window === 'undefined') return;
  try {
    const val = voice === 'female' ? 'zariyah' : voice;
    localStorage.setItem('iqra_teacher_voice', val);
  } catch {
    // ignore
  }
}

/**
 * Searches for an authentic Arabic female voice from the browser's speech synthesis engine.
 * Strictly eliminates male voices.
 */
export function getArabicFemaleVoice(_preferredTeacher?: TeacherVoice): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filter for Arabic voices
  let arVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
  if (arVoices.length === 0) {
    arVoices = voices.filter(v => v.name.toLowerCase().includes('arabic') || v.name.includes('عربي'));
  }

  // 1. Look for confirmed female voice
  const explicitFemale = arVoices.find(v => {
    const name = v.name.toLowerCase();
    const isMale = MALE_VOICE_KEYWORDS.some(k => name.includes(k));
    if (isMale) return false;
    return FEMALE_VOICE_KEYWORDS.some(k => name.includes(k));
  });
  if (explicitFemale) return explicitFemale;

  // 2. Strict check: NEVER return generic Arabic voice if it might be male!
  return null;
}

/**
 * Returns phonetic and acoustic parameters for the female reader voice.
 */
export function getTeacherVoiceProfile(teacher?: TeacherVoice) {
  const activeId = (!teacher || teacher === 'female') ? getActiveTeacherVoice() : teacher;
  const match = TEACHER_VOICES.find(v => v.id === activeId) || TEACHER_VOICES[0];

  return {
    id: match.id,
    name: match.name,
    shortName: match.name.replace('المعلمة ', ''),
    role: match.role,
    pitch: 1.0,
    rate: 0.92,
    icon: match.icon,
    avatar: match.avatar,
    description: match.description,
    samplePhrase: match.samplePhrase,
    badge: match.badge,
    accent: match.accent
  };
}

// Global reference to active audio element to allow instant stopping
let currentTeacherAudio: HTMLAudioElement | null = null;
const blobAudioCache = new Map<string, string>();

/**
 * Pre-fetches female audio blob from the server
 */
export async function preloadFemaleAudio(text: string, teacher?: TeacherVoice): Promise<string | null> {
  const activeTeacher = teacher || getActiveTeacherVoice();
  const voiceKey = activeTeacher === 'female' ? 'zariyah' : activeTeacher;
  const clean = text.trim();
  const cacheKey = `${voiceKey}:${clean}`;

  if (blobAudioCache.has(cacheKey)) {
    return blobAudioCache.get(cacheKey)!;
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, voice: voiceKey }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    blobAudioCache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
}

/**
 * Stops any speech currently playing (both Audio element and SpeechSynthesis)
 */
export function stopAllSpeech() {
  if (currentTeacherAudio) {
    try {
      currentTeacherAudio.pause();
      currentTeacherAudio.currentTime = 0;
      currentTeacherAudio.src = '';
    } catch {
      // ignore
    }
    currentTeacherAudio = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Speaks Arabic text with the authentic Female Teacher Voice
 * Uses server-side high quality female TTS endpoint first with Blob caching, with strict client female-only fallback.
 */
export async function playFemaleTeacherAudio(
  text: string,
  options?: {
    teacher?: TeacherVoice;
    playbackRate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) {
  stopAllSpeech();

  if (!text || !text.trim()) {
    if (options?.onEnd) options.onEnd();
    return;
  }

  const cleanText = text.trim();
  const teacher = options?.teacher || getActiveTeacherVoice();
  const voiceKey = teacher === 'female' ? 'zariyah' : teacher;
  const profile = getTeacherVoiceProfile(teacher);

  try {
    let blobUrl = await preloadFemaleAudio(cleanText, teacher);

    // If first attempt failed, retry once with zariyah standard female
    if (!blobUrl && voiceKey !== 'zariyah') {
      blobUrl = await preloadFemaleAudio(cleanText, 'zariyah');
    }

    if (blobUrl) {
      const audio = new Audio(blobUrl);
      currentTeacherAudio = audio;
      audio.playbackRate = options?.playbackRate || profile.rate;

      audio.onplay = () => {
        if (options?.onStart) options.onStart();
      };

      audio.onended = () => {
        if (currentTeacherAudio === audio) {
          currentTeacherAudio = null;
        }
        if (options?.onEnd) options.onEnd();
      };

      audio.onerror = () => {
        if (currentTeacherAudio === audio) {
          currentTeacherAudio = null;
        }
        fallbackToStrictFemaleVoiceOnly(cleanText, teacher, options);
      };

      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Audio play error, checking female browser fallback:', err);
  }

  fallbackToStrictFemaleVoiceOnly(cleanText, teacher, options);
}

function fallbackToStrictFemaleVoiceOnly(
  text: string,
  teacher: TeacherVoice,
  options?: {
    playbackRate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    playChimeSound();
    if (options?.onEnd) options.onEnd();
    return;
  }

  const femaleVoice = getArabicFemaleVoice(teacher);
  // STRICT RULE: If no confirmed female voice exists, NEVER play speech!
  if (!femaleVoice) {
    console.warn('No confirmed female voice in browser speech synthesis; suppressing male voice fallback per user policy.');
    playChimeSound();
    if (options?.onEnd) options.onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const profile = getTeacherVoiceProfile(teacher);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = femaleVoice;
    utterance.lang = 'ar-SA';
    utterance.rate = options?.playbackRate || profile.rate;
    utterance.pitch = 1.35;

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    if (options?.onEnd) options.onEnd();
  }
}

/**
 * Speaks an encouraging Arabic phrase aloud with the active teacher's voice
 */
export function speakCheer(text: string, onEnd?: () => void, customTeacher?: TeacherVoice) {
  const teacher = customTeacher || getActiveTeacherVoice();
  playFemaleTeacherAudio(text, { teacher, onEnd });
}

/**
 * Speaks an educational hint slowly, clearly, and warmly with feminine phonetic clarity
 */
export function speakEducationalHint(hintText: string, onEnd?: () => void, customTeacher?: TeacherVoice) {
  playChimeSound();
  const teacher = customTeacher || getActiveTeacherVoice();
  playFemaleTeacherAudio(hintText, { teacher, onEnd, playbackRate: 0.85 });
}

/**
 * Pronounces a word and its syllables step-by-step
 */
export function speakSyllablesSlowly(word: string, syllables: string[], explanation?: string, customTeacher?: TeacherVoice) {
  const teacher = customTeacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(teacher);
  const chunksText = syllables.join(' ... ');
  const fullText = `معكِ ${profile.name}. الكلمة هي: ${word}. استمعي لمقاطعها بروية: ${chunksText}.${explanation ? ` وتذكري: ${explanation}` : ''}`;
  speakEducationalHint(fullText, undefined, teacher);
}

/**
 * Test & Preview the Female Reader's Voice for instant confirmation in UI
 */
export function speakTeacherGreeting(teacher?: TeacherVoice, studentName?: string) {
  playChimeSound();
  const activeTeacher = teacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(activeTeacher);
  const name = studentName && studentName.trim() ? studentName.trim() : 'يا بطلة القراءة';
  const greeting = profile.samplePhrase.replace('يا مبدعة', `يا ${name}`);
  playFemaleTeacherAudio(greeting, { teacher: activeTeacher });
}

// -------------------------------------------------------------
// Cheerful Spoken Phrases with Female Reader Voice
// -------------------------------------------------------------

export function cheerWelcome(name: string, customTeacher?: TeacherVoice) {
  playChimeSound();
  const student = name.trim() ? name.trim() : 'يا بطلة';

  const phrases = [
    `يا مرحباً بكِ يا ${student}! أهلاً بكِ في واحتنا التعليمية الممتعة! هيا ننطلق معاً نحو القراءة الواثقة المتميزة!`,
    `أهلاً وسهلاً بصديقتنا المبدعة ${student}! تسعدني مرافقتكِ في رحلة القراءة والتميز والإتقان!`,
    `ما أسعدنا بوجودكِ يا ${student}! أنتِ ذكية ورائعة، هيا نكتشف نصوص اليوم معاً ونقرأ بكل شغف!`
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen, undefined, customTeacher);
}

export function cheerGradeSelected(gradeName: string, customTeacher?: TeacherVoice) {
  playPopSound();
  speakCheer(`اختيار رائع! مرحباً بكِ في نصوص ${gradeName} الممتعة والشيقة!`, undefined, customTeacher);
}

export function cheerLessonSelected(lessonTitle: string, customTeacher?: TeacherVoice) {
  playChimeSound();
  speakCheer(`أحسنتِ الاختيار! درس ${lessonTitle} درس مشوق جداً، استمعي وركزي بكل ثقة!`, undefined, customTeacher);
}

export function cheerListeningStep(customTeacher?: TeacherVoice) {
  playChimeSound();
  speakCheer(`استمعي للقراءة النموذجية بتركيز، وتتبعي الكلمات الملونة، أنتِ رائعة!`, undefined, customTeacher);
}

export function cheerRecordingStart(customTeacher?: TeacherVoice) {
  playPopSound();
  speakCheer(`هيا يا مبدعة، اقرئي بصوتكِ العذب والواضح، أنا أسمعكِ بكل محبة وتشجيع!`, undefined, customTeacher);
}

export function cheerRecordingFinished(customTeacher?: TeacherVoice) {
  playFanfareSound();
  const phrases = [
    `ما شاء الله عليكِ! صوتكِ جميل وقراءتكِ رائعة جداً ومتقنة! فخورة بكِ وبشجاعتكِ!`,
    `أحسنتِ يا بطلة! قراءة واثقة ومميزة، تزدادين تألقاً في كل مرة!`,
    `يا له من صوت عذب وقراءة متقنة! بارك الله فيكِ وفي هذا الإنجاز الباهر!`
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen, undefined, customTeacher);
}

export function cheerDictationCorrect(customTeacher?: TeacherVoice) {
  playFanfareSound();
  const teacher = customTeacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(teacher);
  const phrases = [
    `يا لكِ من رائعة وذكية! ${profile.shortName} تهنئكِ: إجابة صحيحة وإملاء متقن مئة بالمئة!`,
    `ممتازة جداً يا نجمة الإملاء! بارك الله في إتقانكِ الرائع!`,
    `أحسنتِ يا بطلة! إتقان تام وخطوة مباركة نحو وسام التميز!`
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen, undefined, teacher);
}

export function cheerDictationTryAgain(customTeacher?: TeacherVoice) {
  playChimeSound();
  const teacher = customTeacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(teacher);
  const phrases = [
    `محاولة جيدة يا ذكية! ${profile.shortName} تقول لكِ: استمعي للكلمة مرة أخرى وستكتبينها بشكل صحيح، أنا أثق بكِ!`,
    `أنتِ قريبة جداً! انقري على رمز الصوت للاستماع مرة ثانية، ستنجحين بالتأكيد!`
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen, undefined, teacher);
}

export function speakLessonCompleted(name: string, customTeacher?: TeacherVoice) {
  playFanfareSound();
  const teacher = customTeacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(teacher);
  const student = name.trim() ? name.trim() : 'يا بطلة';
  speakCheer(`ألف مبارك يا ${student} يا بطلة القراءة! ${profile.shortName} تفتخر بكِ: لقد أتممتِ الدرس بنجاح باهر واستحققتِ وسام التميز والتفوق! أنتِ فخر مدرستنا!`, undefined, teacher);
}
export const cheerLessonCompleted = speakLessonCompleted;
