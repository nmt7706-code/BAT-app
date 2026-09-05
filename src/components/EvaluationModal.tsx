import { useState, FormEvent } from 'react';
import { Star, Flame, CheckCircle2, Shield, X, Sparkles, Award, Send } from 'lucide-react';
import { PlayerRecord, DailyEvaluation, DailyEvaluationVerdict } from '../types';
import { StorageService } from '../utils/storage';

interface EvaluationModalProps {
  player: PlayerRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedPlayer: PlayerRecord, evalVerdict: string) => void;
}

const PRESET_VERDICTS: { verdict: DailyEvaluationVerdict; score: number; text: string; color: string }[] = [
  {
    verdict: 'ممتاز جداً',
    score: 9.5,
    text: 'أداء رائع اليوم! التزام كامل بالخطة، سرعة عالية في التنفيذ، وروح قيادية عالية.',
    color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
  },
  {
    verdict: 'جيد جداً',
    score: 8.5,
    text: 'مستوى ممتاز في الحصة التدريبية. استمر بهذا الشغف مع التركيز على دقة التمرير بالقدم الضعيفة.',
    color: 'border-teal-500/50 bg-teal-950/40 text-teal-300',
  },
  {
    verdict: 'جيد',
    score: 7.5,
    text: 'أداء جيد اليوم، تم إنجاز التمارين بنجاح. عليك بزيادة الجهد البدني في الشوط الثاني.',
    color: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
  },
  {
    verdict: 'يحتاج تركيز',
    score: 6.0,
    text: 'لوحظ تشتت في بعض أوقات التمرين ونقص في سرعة الارتداد الدفاعي. ننتظر عودتك لأقوى مستوى.',
    color: 'border-yellow-500/50 bg-yellow-950/40 text-yellow-300',
  },
  {
    verdict: 'تراجع انضباطي',
    score: 5.0,
    text: 'تأخر عن موعد التمرين أو تراخي في أداء تمارين اللياقة. الالتزام بالأكاديمية خط أحمر.',
    color: 'border-red-500/50 bg-red-950/40 text-red-300',
  },
];

export function EvaluationModal({ player, isOpen, onClose, onSaved }: EvaluationModalProps) {
  const [selectedVerdict, setSelectedVerdict] = useState<DailyEvaluationVerdict>(
    player.todayEvaluation?.verdict || 'جيد'
  );
  const [ratingScore, setRatingScore] = useState<number>(
    player.todayEvaluation?.ratingScore || 7.5
  );
  const [feedback, setFeedback] = useState<string>(
    player.todayEvaluation?.feedback || 'اليوم كان أداء اللاعب جيداً جداً في التمارين والالتزام التكتيكي.'
  );

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_VERDICTS[0]) => {
    setSelectedVerdict(preset.verdict);
    setRatingScore(preset.score);
    setFeedback(preset.text);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const evaluation: DailyEvaluation = {
      id: 'eval-' + Date.now(),
      date: new Date().toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      verdict: selectedVerdict,
      ratingScore: Number(ratingScore),
      feedback: feedback.trim() || 'أداء اليوم مسجل وموثق من الكابتن زيد.',
      evaluator: 'الكابتن زيد محمد خرشيد',
      acknowledgedByPlayer: false,
    };

    const updatedHistory = player.evaluationHistory ? [...player.evaluationHistory] : [];
    // If updating today, prepend or replace
    updatedHistory.unshift(evaluation);

    const updatedPlayer: PlayerRecord = {
      ...player,
      todayEvaluation: evaluation,
      evaluationHistory: updatedHistory.slice(0, 10), // Keep last 10
      performanceRating: Number(((player.performanceRating * 3 + ratingScore) / 4).toFixed(1)),
    };

    StorageService.savePlayer(updatedPlayer);
    onSaved(updatedPlayer, selectedVerdict);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#101713] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-lg">
              #{player.jerseyNumber}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">{player.name}</h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                #{player.jerseyNumber}
              </span>
            </div>
            <p className="text-xs text-amber-300 font-semibold">{player.position} • {player.ageGroup}</p>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4 text-[11px] text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>التقييم اليومي المباشر:</strong> هذا التقييم سيظهر فوراً في هاتف اللاعب {player.name} كإشعار رسمي من الكابتن زيد!
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">اختر تقييم اليوم السريع:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_VERDICTS.map((preset) => (
                <button
                  type="button"
                  key={preset.verdict}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    selectedVerdict === preset.verdict
                      ? 'border-amber-400 bg-amber-500/25 text-white ring-2 ring-amber-400/40'
                      : 'border-white/10 bg-[#080B09] text-gray-300 hover:border-amber-500/30'
                  }`}
                >
                  <span>{preset.verdict}</span>
                  <span className="text-[10px] opacity-80">{preset.score} / 10</span>
                </button>
              ))}
            </div>
          </div>

          {/* Score Slider */}
          <div className="bg-[#080B09] p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-300 font-semibold">درجة التقييم اليومي:</span>
              <span className="text-amber-400 font-black text-sm flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{ratingScore} من 10</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={ratingScore}
              onChange={(e) => setRatingScore(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              التوجيه والتقييم الظاهر في هاتف اللاعب:
            </label>
            <textarea
              rows={3}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="اكتب التوجيه الفني أو الملاحظة الخاصة بهذا اللاعب..."
              className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال التقييم وإشعار اللاعب فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
