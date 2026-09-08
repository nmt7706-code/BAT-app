import { useState, useEffect } from 'react';
import { Star, ShieldCheck, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';

interface WelcomeSplashScreenProps {
  playerName: string;
  onComplete: () => void;
  seconds?: number;
}

export function WelcomeSplashScreen({
  playerName,
  onComplete,
  seconds = 5,
}: WelcomeSplashScreenProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const durationMs = seconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      const remainingSecs = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setTimeLeft(remainingSecs);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [seconds, onComplete]);

  return (
    <div
      id="welcome-splash-screen"
      className="fixed inset-0 z-50 bg-[#060907] flex flex-col items-center justify-center p-6 text-center overflow-hidden animate-in fade-in duration-700 select-none"
    >
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-emerald-600/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black mb-8 shadow-lg shadow-amber-500/10 animate-in slide-in-from-top-4 duration-1000">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>تم التحقق والاعتماد بنجاح • كود BAT2015</span>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </div>

        {/* Grand Academy Crest with Glowing Rings */}
        <div className="relative mb-8 group">
          {/* Pulsing ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-600/30 rounded-[42px] blur-xl opacity-75 group-hover:opacity-100 animate-pulse"></div>

          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[36px] bg-gradient-to-br from-[#1B291F] via-[#101712] to-[#080C0A] border-4 border-amber-400/80 p-2 shadow-2xl shadow-amber-500/30 overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="شعار أكاديمية بايبوخت (B.A.T)"
              className="w-full h-full object-cover rounded-[28px] shadow-inner"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Star Top-Right Badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-sm text-black font-black shadow-lg shadow-amber-500/50 border-2 border-black">
            ★
          </div>
        </div>

        {/* Welcome Headline as explicitly requested */}
        <div className="space-y-3 mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 leading-tight">
            أهلاً بك في أكاديمية بايبوخت
          </h1>
          <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <span className="text-amber-400">اللاعب:</span>
            <span className="underline decoration-amber-400/60 underline-offset-8">
              {playerName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 max-w-sm mx-auto leading-relaxed pt-2">
            إشراف وتدريب <span className="text-emerald-400 font-bold">الكابتن زيد محمد خرشيد</span>
            <br />
            تم ربط ملفك الرياضي وحفظ جلستك في الذاكرة الدائمة بنجاح!
          </p>
        </div>

        {/* 5-Second Progress Bar & Counter */}
        <div className="w-full max-w-xs space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1">
            <span className="flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>جارٍ الدخول للشاشة الرئيسية</span>
            </span>
            <span className="font-mono text-amber-400 font-black text-sm">
              {timeLeft} ثوانٍ
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/30 p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-75 ease-linear shadow-sm shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Fast skip button if user prefers instant entrance */}
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-300 transition-colors py-1.5 px-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <span>تخطي والدخول فوراً</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Academy Tag */}
      <div className="absolute bottom-5 text-[11px] text-gray-500 font-medium">
        B.A.T Football Academy • 2026
      </div>
    </div>
  );
}
