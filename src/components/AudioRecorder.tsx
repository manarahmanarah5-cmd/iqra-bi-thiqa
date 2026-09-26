import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { cheerRecordingStart, cheerRecordingFinished, playPopSound } from '../utils/audioCheer';

interface AudioRecorderProps {
  lessonTitle: string;
  onRecordCompleted?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  lessonTitle,
  onRecordCompleted,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stars, setStars] = useState<number>(5);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      cheerRecordingStart();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        cheerRecordingFinished();
        if (onRecordCompleted) onRecordCompleted();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setFeedbackSaved(false);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لتسجيل صوتكِ العذب.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    playPopSound();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setFeedbackSaved(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm text-right">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-black text-rose-950 font-cairo">
              تسجيل صوتكِ العذب والتقييم الذاتي 🎙️
            </h4>
            <p className="text-xs text-rose-700">
              سجلي قراءتكِ بصوتكِ واطمئني، لا أحد يسمعكِ غيركِ لتعزيز ثقتكِ بنفسكِ!
            </p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-600 text-white rounded-full animate-pulse shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="text-xs font-mono font-black">{formatTime(recordingTime)}</span>
            <span className="text-[11px] font-bold">جارٍ الاستماع إليكِ...</span>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-pink-200 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-5 h-5" />
            <span>ابدئي تسجيل قراءتكِ الآن 🌸</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Square className="w-5 h-5 fill-rose-500 text-rose-500" />
            <span>إنهاء التسجيل وحفظ القراءة</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <button
              onClick={togglePlayback}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'إيقاف مؤقت' : 'استمعي لتسجيلكِ العذب 🎧'}</span>
            </button>

            <button
              onClick={resetRecording}
              className="p-3 text-stone-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-stone-200 rounded-2xl transition-colors cursor-pointer shadow-2xs"
              title="إعادة التسجيل من جديد"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Self Assessment Rating when audio is recorded */}
      {audioUrl && (
        <div className="mt-4 pt-4 border-t border-rose-200/70 bg-white/80 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs sm:text-sm font-black text-rose-950 font-cairo">
              كيف تقيمين قراءتكِ لهذا المقطع اليوم؟
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    playPopSound();
                    setStars(star);
                    setFeedbackSaved(true);
                  }}
                  className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                    star <= stars ? 'text-amber-400 drop-shadow-xs' : 'text-stone-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl font-bold font-cairo">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              ما شاء الله يا بطلة! صوتكِ جميل وثقتكِ تزداد مع كل تدريب. أحسنتِ وأبدعتِ! 🌸
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
