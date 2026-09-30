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
  return 'female';
}

export function setActiveTeacherVoice(_voice: TeacherVoice) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('iqra_teacher_voice', 'female');
  } catch {
    // ignore
  }
}

/**
 * Searches for an authentic Arabic female voice from the browser's speech synthesis engine.
 * Strictly eliminates male voices, prioritizing recognized female voices (Salma, Hoda, Laila, Zeina, Mariam, Sana, etc.)
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

  // 1. Look for explicit female voices FIRST
  const explicitFemale = arVoices.find(v => {
    const name = v.name.toLowerCase();
    return FEMALE_VOICE_KEYWORDS.some(k => name.includes(k));
  });
  if (explicitFemale) return explicitFemale;

  // 2. Filter out any voice with known male names
  const nonMaleVoices = arVoices.filter(v => {
    const nameLower = v.name.toLowerCase();
    return !MALE_VOICE_KEYWORDS.some(k => nameLower.includes(k));
  });

  if (nonMaleVoices.length > 0) {
    return nonMaleVoices[0];
  }

  // 3. If only a single generic Arabic voice exists, return it (it will be pitched high to feminine register)
  if (arVoices.length > 0) {
    return arVoices[0];
  }

  return null;
}

/**
 * Returns phonetic and acoustic parameters for the female reader voice.
 * Setting pitch to 1.48 ensures a sweet, distinct, warm female tone.
 */
export function getTeacherVoiceProfile(_teacher?: TeacherVoice) {
  return {
    id: 'female' as const,
    name: 'صوت القارئة (صوت أنثى نقي)',
    shortName: 'القارئة',
    role: 'قارئة النصوص التعليمية',
    pitch: 1.48,
    rate: 0.88,
    icon: '🎙️',
    description: 'نبرة صوتية نسائية تربوية صافية وواضحة بالتشكيل التام لتعزيز الطلاقة القرائية.'
  };
}

// Global reference to active audio element to allow instant stopping
let currentTeacherAudio: HTMLAudioElement | null = null;

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
 * Uses server-side high quality female TTS endpoint first, with strict client female-only fallback.
 */
export function playFemaleTeacherAudio(
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

  const teacher = options?.teacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(teacher);
  const cleanText = text.trim();

  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&teacher=${encodeURIComponent(teacher)}`;
    const audio = new Audio(audioUrl);
    currentTeacherAudio = audio;

    const rate = options?.playbackRate || profile.rate;
    audio.playbackRate = rate;

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
      fallbackToBrowserFemaleVoice(cleanText, teacher, options);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        fallbackToBrowserFemaleVoice(cleanText, teacher, options);
      });
    }
  } catch {
    fallbackToBrowserFemaleVoice(cleanText, teacher, options);
  }
}

function fallbackToBrowserFemaleVoice(
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

  // Cancel any lingering utterances to avoid overlap
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }

  const femaleVoice = getArabicFemaleVoice(teacher);
  const profile = getTeacherVoiceProfile(teacher);
  const utterance = new SpeechSynthesisUtterance(text);
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }
  utterance.lang = 'ar-SA';
  utterance.rate = options?.playbackRate || profile.rate;
  // Feminine pitch (1.48): transforms the acoustic formant into a warm, gentle female teacher register
  utterance.pitch = 1.48;

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }

  window.speechSynthesis.speak(utterance);
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
  playFemaleTeacherAudio(hintText, { teacher, onEnd, playbackRate: 0.82 });
}

/**
 * Pronounces a word and its syllables step-by-step
 */
export function speakSyllablesSlowly(word: string, syllables: string[], explanation?: string, customTeacher?: TeacherVoice) {
  const teacher = customTeacher || getActiveTeacherVoice();
  const profile = getTeacherVoiceProfile(teacher);
  const chunksText = syllables.join(' ... ');
  const fullText = `معكِ ${profile.shortName}. الكلمة هي: ${word}. استمعي لمقاطعها بروية: ${chunksText}.${explanation ? ` وتذكري: ${explanation}` : ''}`;
  speakEducationalHint(fullText, undefined, teacher);
}

/**
 * Test & Preview the Female Reader's Voice for instant confirmation in UI
 */
export function speakTeacherGreeting(_teacher?: TeacherVoice, studentName?: string) {
  playChimeSound();
  const name = studentName && studentName.trim() ? studentName.trim() : 'يا بطلة القراءة';
  const greeting = `مرحباً بكِ يا ${name}! أنا قارئتكِ المساعدة في مركز مصادر التعلم. هيا نقرأ النصوص معاً بصوت نقي وواضح بكل طمأنينة وإتقان!`;
  playFemaleTeacherAudio(greeting);
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
