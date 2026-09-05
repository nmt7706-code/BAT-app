import { useState } from 'react';
import { Star, Flame, Trophy, CheckCircle2, Shield, Calendar, Award, MessageCircle } from 'lucide-react';
import { PlayerRecord, UserSession } from '../types';

interface PlayerEvaluationCardProps {
  session: UserSession;
  playerRecord?: PlayerRecord;
}

export function PlayerEvaluationCard({ session, playerRecord }: PlayerEvaluationCardProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  // If no specific playerRecord found, fallback
  const evalData = playerRecord?.todayEvaluation;

  const getVerdictStyle = (verdict?: string) => {
    switch (verdict) {
      case 'ممتاز جداً':
        return 'from-emerald-600/30 to-teal-600/20 border-emerald-400 text-emerald-300';
      case 'جيد جداً':
        return 'from-teal-600/30 to-cyan-600/20 border-teal-400 text-teal-300';
      case 'جيد':
        return 'from-amber-600/30 to-yellow-600/20 border-amber-400 text-amber-300';
      case 'يحتاج تركيز':
        return 'from-yellow-600/30 to-orange-600/20 border-yellow-400 text-yellow-300';
      case 'تراجع انضباطي':
        return 'from-red-600/30 to-rose-600/20 border-red-400 text-red-300';
      default:
        return 'from-amber-600/30 to-yellow-600/20 border-amber-400 text-amber-300';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#152019] via-[#101813] to-[#0A0F0C] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden mb-6">
      {/* Background glowing watermark */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-xl shadow-inner shrink-0">
            <Award className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                تقييمك الفني الصادر اليوم
              </span>
              <span className="text-xs text-gray-400">{evalData?.date || 'اليوم'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              تقرير أداء اللاعب: <span className="text-amber-400">{session.name}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>بإشراف: الكابتن زيد محمد خرشيد</span>
          </span>
        </div>
      </div>

      {evalData ? (
        <div className="space-y-3.5">
          {/* Main Verdict Box */}
          <div className={`p-4 rounded-2xl border bg-gradient-to-r ${getVerdictStyle(evalData.verdict)} flex items-center justify-between gap-3`}>
            <div>
              <span className="text-[11px] text-gray-300 block mb-0.5">التقييم العام لليوم:</span>
              <div className="text-xl sm:text-2xl font-black flex items-center gap-2">
                <span>{evalData.verdict}</span>
                <span className="text-sm font-mono opacity-90">({evalData.ratingScore} / 10)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-amber-400 font-black text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{evalData.ratingScore} / 10</span>
            </div>
          </div>

          {/* Captain's Detailed Feedback */}
          <div className="bg-[#090D0B] p-4 rounded-2xl border border-white/5 text-right">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>ملاحظة وتوجيه الكابتن زيد لك اليوم:</span>
            </span>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
              "{evalData.feedback}"
            </p>
          </div>

          {/* Acknowledgement action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>محدث لحظياً في هاتفك مباشرة من الإدارة</span>
            </span>

            <button
              onClick={() => setAcknowledged(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                acknowledged
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{acknowledged ? 'تم استلام التوجيه والعمل به ✓' : 'تأكيد استلام التوجيه الفني'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#090D0B] p-4 rounded-2xl border border-dashed border-amber-500/30 text-center">
          <p className="text-xs text-gray-300">
            أهلاً يا <strong className="text-white">{session.name}</strong>! تقييمك التراكمي في الأكاديمية هو{' '}
            <strong className="text-amber-400">{playerRecord?.performanceRating || 8.5} / 10</strong>.
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            سيظهر تقييم الحصة التدريبية القادمة وملاحظات الكابتن زيد هنا فور انتهائها مباشرة على هاتفك.
          </p>
        </div>
      )}
    </div>
  );
}
