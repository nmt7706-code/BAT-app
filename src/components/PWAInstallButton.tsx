import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 px-3.5 py-1.5 text-xs font-black text-black shadow-lg shadow-amber-500/20 transition-all ${
          compact ? 'px-2.5 py-1 text-[11px]' : ''
        }`}
        title="تثبيت تطبيق الأكاديمية على هاتفك كـ تطبيق PWA"
      >
        <Download className="w-4 h-4 text-black" />
        <span>تثبيت التطبيق على هاتفك</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
        >
          <Apple className="w-4 h-4 text-amber-300" />
          <span>تثبيت على iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#101713] border-2 border-amber-500/40 p-6 text-right shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Apple className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-white">تثبيت التطبيق على iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-200 leading-relaxed">
                <div className="flex items-start gap-2.5 bg-black/40 p-3 rounded-2xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>اضغط على زر <strong>المشاركة (Share ⎋)</strong> في أسفل شريط متصفح Safari.</span>
                </div>

                <div className="flex items-start gap-2.5 bg-black/40 p-3 rounded-2xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>مرر للأسفل واضغط على <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</span>
                </div>

                <div className="flex items-start gap-2.5 bg-black/40 p-3 rounded-2xl border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>اضغط <strong>إضافة (Add)</strong> في الزاوية العلوية، وسيتثبت التطبيق كأيقونة مستقلة فوراً!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-black text-black shadow-md"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback info button for desktop or pre-prompt state
  return (
    <>
      <button
        id="pwa-install-manual-btn"
        onClick={() => setShowGeneralGuide(true)}
        className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-white/5 hover:bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all"
        title="دليل تثبيت تطبيق الويب المتقدم"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
        <span>تثبيت التطبيق (PWA)</span>
      </button>

      {showGeneralGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#101713] border-2 border-amber-500/40 p-6 text-right shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">تثبيت تطبيق أكاديمية بايبوخت (PWA)</h3>
              </div>
              <button
                onClick={() => setShowGeneralGuide(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-200 leading-relaxed">
              <p>
                تم إعداد هذا التطبيق كـ <strong>تطبيق ويب تقدمي (PWA)</strong> متكامل مع ذاكرة دائمة وإشعارات فورية عبر Firebase.
              </p>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1.5">
                <div className="font-bold text-amber-300">على أجهزة أندرويد (Chrome):</div>
                <p className="text-gray-300">اضغط على قائمة المتصفح (⋮) ثم اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</p>
              </div>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1.5">
                <div className="font-bold text-amber-300">على أجهزة آيفون (Safari):</div>
                <p className="text-gray-300">اضغط زر المشاركة (Share) ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGeneralGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-black text-black shadow-md"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
