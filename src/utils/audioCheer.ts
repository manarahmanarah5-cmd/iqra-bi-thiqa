/**
 * Sound & Voice Cheer Engine for "أقرأ بثقة"
 * Provides instant playful sound effects via Web Audio API
 * and warm, affectionate Arabic voice encouragement via SpeechSynthesis.
 */

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

/**
 * Speaks an encouraging Arabic phrase aloud with cheerful tone
 */
export function speakCheer(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel prior speech so messages don't queue endlessly
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.96; // slightly relaxed for pleasant clarity
  utterance.pitch = 1.15; // slightly higher friendly upbeat tone

  // Attempt to select an Arabic voice
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

// -------------------------------------------------------------
// Cheerful Spoken Phrases without having to read long texts
// -------------------------------------------------------------

export function cheerWelcome(name: string) {
  playChimeSound();
  const student = name.trim() ? name.trim() : 'يا بطلة';
  const phrases = [
    `يا مرحباً بكِ يا ${student} يا بطلة القراءة والتميز! أهلاً بكِ في واحتنا التعليمية الممتعة!`,
    `أهلاً وسهلاً بصديقتنا المبدعة ${student}! هيا بنا لننطلق في رحلة القراءة الممتعة!`,
    `ما أسعدنا بوجودكِ يا ${student}! أنتِ ذكية ورائعة، هيا نكتشف نصوص اليوم معاً!`
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen);
}

export function cheerGradeSelected(gradeName: string) {
  playPopSound();
  speakCheer(`اختيار رائع! مرحباً بكِ في نصوص ${gradeName} الممتعة والشيقة!`);
}

export function cheerLessonSelected(lessonTitle: string) {
  playChimeSound();
  speakCheer(`أحسنتِ الاختيار! درس ${lessonTitle} درس مشوق جداً، استمعي وركزي بكل ثقة!`);
}

export function cheerListeningStep() {
  playChimeSound();
  speakCheer('استمعي للقراءة بتركيز، وتتبعي الكلمات الملونة، أنتِ رائعة!');
}

export function cheerRecordingStart() {
  playPopSound();
  speakCheer('هيا يا مبدعة، اقرئي بصوتكِ العذب والواضح، أنا أسمعكِ بكل محبة!');
}

export function cheerRecordingFinished() {
  playFanfareSound();
  const phrases = [
    'ما شاء الله عليكِ! صوتكِ جميل وقراءتكِ رائعة جداً! بارك الله فيكِ يا مبدعة!',
    'أحسنتِ يا بطلة! قراءة واثقة ومميزة، تزدادين تألقاً في كل مرة!',
    'يا له من صوت عذب وقراءة متقنة! أنا فخورة بكِ وبشجاعتكِ الرائعة!'
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen);
}

export function cheerDictationCorrect() {
  playFanfareSound();
  const phrases = [
    'يا لكِ من رائعة وذكية! إجابة صحيحة وإملاء متقن مئة بالمئة!',
    'ممتازة جداً! بارك الله فيكِ يا نجمة الإملاء!',
    'أحسنتِ يا بطلة! إتقان تام وخطوة رائعة نحو وسام التميز!'
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen);
}

export function cheerDictationTryAgain() {
  playChimeSound();
  const phrases = [
    'محاولة جيدة يا ذكية! استمعي للكلمة مرة أخرى وستكتبينها بشكل صحيح، أنا أثق بكِ!',
    'أنتِ قريبة جداً! انقري على رمز الصوت للاستماع مرة أخرى وجربي، ستنجحين بالتأكيد!'
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  speakCheer(chosen);
}

export function speakLessonCompleted(name: string) {
  playFanfareSound();
  const student = name.trim() ? name.trim() : 'يا بطلة';
  speakCheer(`ألف مبارك يا ${student} يا بطلة القراءة! لقد أتممتِ الدرس بنجاح باهر واستحققتِ وسام التميز والتفوق! أنتِ فخر مدرستنا!`);
}
export const cheerLessonCompleted = speakLessonCompleted;

/**
 * Speaks an educational hint slowly, clearly, and warmly with phonetic clarity
 */
export function speakEducationalHint(hintText: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  playChimeSound();
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(hintText);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.82; // deliberate slow pace for learning
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
  if (arabicVoice) {
    utterance.voice = arabicVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Pronounces a word and its syllables step-by-step
 */
export function speakSyllablesSlowly(word: string, syllables: string[], explanation?: string) {
  const chunksText = syllables.join(' ... ');
  const fullText = `الكلمة هي: ${word}. استمعي لمقاطعها: ${chunksText}.${explanation ? ` وتذكري: ${explanation}` : ''}`;
  speakEducationalHint(fullText);
}
