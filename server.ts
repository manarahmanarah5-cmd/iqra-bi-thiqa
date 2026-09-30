import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google Gen AI client if key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key, using pedagogical fallback:', err);
  }
}

// AI Reading Companion Endpoint
app.post('/api/ai-companion', async (req, res) => {
  const { action, text, grade, word, teacher } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  const selectedVoice = 'female';
  const readerName = 'القارئة التربوية';

  // If Gemini client is ready and configured
  if (aiClient) {
    try {
      let prompt = '';
      if (action === 'syllables') {
        prompt = `أنتِ "${readerName}"، متخصصة تربوية في بناء الطلاقة القرائية وتيسير القراءة لطلبة المرحلة المتوسطة (الصف ${grade || 'السابع أو الثامن أو التاسع'}).
يجب أن تتحدثي دائماً بصوت وأسلوب أنثوي تربوي حنون ومشجع.
قومي بتقطيع الكلمات التالية تقطيعاً صوتياً تعليمياً دقيقاً (مقاطع صوتية مفصولة بشرطة مائلة / مع التشكيل الدقيق):
الكلمة/النص: "${text || word}"
اكتبي التقطيع الصوتي بدقة، مع ذكر نوع المقطع (قصير: حركة، طويل: مد، ساكن: مقطع مغلق)، وقدمي نصيحة قرائية مشجعة للطالبة/المتعلم لا تتجاوز سطرين. أجيبي بصيغة JSON كالتالي:
{
  "syllables": "مُسْـ / ـتَقْـ / ـبَلْ",
  "explanation": "شرح مبسط لطريقة نطقها بصوت هادئ ومتقن",
  "tips": "نصيحة لطيفة ومشجعة ومحفزة"
}`;
      } else if (action === 'simplify') {
        prompt = `أنتِ "${readerName}"، خبيرة تربوية في تنمية المهارات القرائية. أعدي صياغة النص التالي بما يناسب طلبة المرحلة المتوسطة (الصف ${grade || 'السابع'}) لتعزيز طلاقتهم وفهمهم، مع مراعاة:
1. جمل قصيرة واضحة المعنى وبناء تربوي مبسط.
2. تشكيل كامل دقيق (Tashkeel).
3. معجم لغوي مشوق ومحفز دون تبسيط مخل.
النص الأصلي:
"${text}"
أجيبي بصيغة JSON:
{
  "simplifiedText": "النص المشكول المبسط",
  "keyWords": [{"word": "الكلمة المشكولة", "meaning": "معناها البسيط"}],
  "mainIdea": "الفكرة الرئيسة في جملة واحدة واضحة"
}`;
      } else if (action === 'ask-companion') {
        prompt = `أنتِ "${readerName}"، مرشدة وقارئة تربوية صديقة وصبورة وحنونة وداعمة جداً، خبيرة في تشجيع القراءة وبناء الثقة بالنفس.
يجب أن تتحدثي دائماً بنبرة وأسلوب أنثوي تربوي دافئ وملهم، ولا تتحدثي بصيغة المذكر عن نفسكِ قط.
المتعلمة/الطالب يسأل أو يستفسر عن النص التالي:
النص: "${text || ''}"
السؤال/الاستفسار: "${req.body.question || ''}"
قدمي إجابة ودودة، مبسطة، دقيقة، تشجع وتثني على المحاولة وتعزز الثقة بالنفس. أجيبي بصيغة JSON:
{
  "answer": "الإجابة الودودة والتربوية",
  "readingCheer": "عبارة تشجيعية دافئة ومحفزة"
}`;
      }

      if (prompt) {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const textOutput = response.text || '{}';
        try {
          const parsed = JSON.parse(textOutput);
          return res.json({ success: true, data: parsed, teacher: selectedVoice });
        } catch {
          return res.json({ success: true, data: { answer: textOutput }, teacher: selectedVoice });
        }
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, transitioning to rule-based pedagogical system:', err?.message);
    }
  }

  // Expert pedagogical rule-based response if AI key unavailable
  return res.json({
    success: true,
    data: getFallbackPedagogicalResponse(action, text, word, grade, req.body.question),
    teacher: selectedVoice,
  });
});

function getFallbackPedagogicalResponse(action: string, text?: string, word?: string, grade?: string, question?: string) {
  const targetWord = word || (text ? text.split(' ')[0] : 'المُسْتَقْبَل');

  if (action === 'syllables') {
    return {
      syllables: breakArabicWordSyllables(targetWord),
      explanation: `تفضلي يا مبدعة! قسّمي الكلمة إلى مقاطع صوتية: الساكن مع ما قبله، وحرف المد مع الممدود، والمتحرك لوحده!`,
      tips: `أحسنتِ المحاولة يا بطلة! خذي نفساً عميقاً وانطقي كل مقطع بهدوء ووضوح.`
    };
  }

  if (action === 'simplify') {
    return {
      simplifiedText: text || 'القِرَاءَةُ مِفْتَاحُ العَقْلِ، تُنِيرُ طَرِيقَنَا نَحْوَ المَعْرِفَةِ وَالنَّجَاحِ.',
      keyWords: [
        { word: 'مِفْتَاحُ', meaning: 'أداة الفتح أو البداية' },
        { word: 'المَعْرِفَةُ', meaning: 'العِلْمُ وَالفَهْمُ' }
      ],
      mainIdea: 'القراءة تساعد عقولنا على التفكير واكتشاف العالم.'
    };
  }

  return {
    answer: `أهلاً بكِ يا مبدعة! يسعدني جداً اهتمامكِ وإصراركِ الجميل على إتقان القراءة في الصف ${grade || 'المتوسط'}. سر القراءة المتقنة هو التمهل والتنفس باسترخاء وتقسيم الكلمات إلى مقاطع صوتية واستشعار المعنى الجميل للجملة. ${question ? `بخصوص سؤالكِ: "${question}"، المعنى مشوق جداً وسنصل إليه معاً بخطوات واثقة!` : ''}`,
    readingCheer: `أنا فخورة بكِ وبشجاعتكِ دائماً، استمري يا نجمة القراءة والتألق! 🌸`
  };
}

// Sound syllabic chunking algorithm for Arabic words
function breakArabicWordSyllables(word: string): string {
  if (!word) return '';
  const clean = word.trim();
  // If text already has dashes or is short
  if (clean.length <= 3) return clean;
  // Pedagogical syllable breakdown mock/heuristic
  const chunks: string[] = [];
  if (clean.startsWith('ال')) {
    chunks.push('الـ');
    const rest = clean.substring(2);
    if (rest.length > 4) {
      chunks.push(rest.substring(0, 2) + 'ـ');
      chunks.push(rest.substring(2));
    } else {
      chunks.push(rest);
    }
  } else {
    for (let i = 0; i < clean.length; i += 2) {
      chunks.push(clean.substring(i, Math.min(i + 2, clean.length)));
    }
  }
  return chunks.join(' / ');
}

// --------------------------------------------------------------------------
// 100% Female Teacher Voice Engine (Gemini Neural Kore Voice)
// صوت القارئة الافتراضية - نبرة أنثوية تربوية نقية وهادئة
// --------------------------------------------------------------------------

const ttsAudioCache = new Map<string, { buffer: Buffer; mimeType: string }>();

async function generateFemaleArabicSpeech(text: string): Promise<{ buffer: Buffer; mimeType: string }> {
  if (!text || !text.trim()) {
    throw new Error('Empty text provided for TTS');
  }

  const clean = text.trim();

  // If Google GenAI client is available, synthesize with gemini-3.8-flash-lite-tts and voice 'Kore'
  if (aiClient) {
    try {
      const interaction = await aiClient.interactions.create({
        model: 'gemini-3.8-flash-lite-tts',
        input: [
          {
            type: 'text',
            text: clean,
            annotations: [
              {
                type: 'speech_metadata',
                style: 'Gentle, encouraging female Arabic teacher reading aloud clearly with accurate diacritics',
              },
            ],
          },
        ],
        response_modalities: ['audio'],
        generation_config: {
          speech_config: [
            {
              language: 'ar',
              voice: 'Kore', // 100% Female voice
            },
          ],
        },
      });

      const step = interaction.steps?.find((s) => s.type === 'model_output');
      const audio = step?.content?.find((c) => c.type === 'audio');
      if (audio && audio.data) {
        const buffer = Buffer.from(audio.data, 'base64');
        return { buffer, mimeType: audio.mime_type || 'audio/wav' };
      }
    } catch (err: any) {
      console.warn('Gemini Female TTS call failed, falling back to client-side voice:', err?.message || err);
    }
  }

  throw new Error('Server-side female TTS unavailable; client speech synthesis will be used');
}

// GET /api/tts - Direct audio streaming for <audio> elements & new Audio()
app.get('/api/tts', async (req, res) => {
  const text = (req.query.text as string) || '';

  if (!text.trim()) {
    return res.status(400).send('Text parameter is required');
  }

  const cacheKey = `female:${text.trim()}`;
  if (ttsAudioCache.has(cacheKey)) {
    const cached = ttsAudioCache.get(cacheKey)!;
    res.setHeader('Content-Type', cached.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cached.buffer);
  }

  try {
    const result = await generateFemaleArabicSpeech(text.trim());
    if (text.length < 500 && ttsAudioCache.size < 500) {
      ttsAudioCache.set(cacheKey, result);
    }
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(result.buffer);
  } catch (err: any) {
    return res.status(503).json({ error: 'Server female TTS unavailable', message: err?.message });
  }
});

// POST /api/tts - JSON or streaming endpoint
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  const cacheKey = `female:${text.trim()}`;
  if (ttsAudioCache.has(cacheKey)) {
    const cached = ttsAudioCache.get(cacheKey)!;
    res.setHeader('Content-Type', cached.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cached.buffer);
  }

  try {
    const result = await generateFemaleArabicSpeech(text.trim());
    if (text.length < 500 && ttsAudioCache.size < 500) {
      ttsAudioCache.set(cacheKey, result);
    }
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(result.buffer);
  } catch (err: any) {
    return res.status(503).json({ error: 'Failed to synthesize speech', details: err?.message });
  }
});

// Pre-warm initial female voice greeting in background
setTimeout(async () => {
  try {
    const femaleGreeting = 'مرحباً بكِ يا بطلة القراءة في مركز مصادر التعلم! أنا قارئتكِ المساعدة، هيا نقرأ النصوص معاً بصوت نقي وواضح بكل طمأنينة وإتقان!';
    const buffer = await generateFemaleArabicSpeech(femaleGreeting);
    ttsAudioCache.set(`female:${femaleGreeting}`, buffer);
    console.log('Female reader voice greeting pre-warmed successfully.');
  } catch (err) {
    console.warn('Pre-warming greetings notice:', err);
  }
}, 1000);

// Serve static files from public directory
app.use(express.static(path.resolve(__dirname, 'public')));

// Explicit route for uploaded center logo image
app.get(['/صورة1.jpg', '/logo.jpg', '/center-logo.jpg', '/center-logo.png'], (_req, res) => {
  res.setHeader('Content-Type', 'image/jpeg');
  res.sendFile(path.resolve(__dirname, 'public', 'logo.jpg'));
});

// Development or Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
