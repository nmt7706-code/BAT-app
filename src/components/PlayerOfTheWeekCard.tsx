import { Trophy, Star, Sparkles, Award, User, Flame, Crown, CheckCircle2 } from 'lucide-react';
import { PlayerOfTheWeek, UserSession } from '../types';

interface PlayerOfTheWeekCardProps {
  playerOfTheWeek: PlayerOfTheWeek;
  session: UserSession;
  onOpenChangeModal?: () => void;
}

export function PlayerOfTheWeekCard({
  playerOfTheWeek,
  session,
  onOpenChangeModal,
}: PlayerOfTheWeekCardProps) {
  const isCaptain = session.role === 'captain';

  return (
    <div
      id="player-of-the-week-card"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B241C] via-[#101712] to-[#0A0E0B] border-2 border-amber-400/50 p-5 sm:p-7 shadow-2xl shadow-amber-500/10 mb-6"
    >
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Banner & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center text-black shadow-md shadow-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400">
                نجم ولاعب الأسبوع في الأكاديمية
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black animate-pulse">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>الأسبوع الحالي</span>
              </span>
            </div>
            <p className="text-xs text-gray-400">
              اختيار رسمي من <span className="text-amber-300 font-bold">الكابتن زيد محمد خرشيد</span> لجميع لاعبي الأكاديمية
            </p>
          </div>
        </div>

        {/* Change Button for Captain */}
        {isCaptain && onOpenChangeModal && (
          <button
            onClick={onOpenChangeModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>تغيير لاعب الأسبوع</span>
          </button>
        )}
      </div>

      {/* Card Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
        {/* Player Photo + Golden Frame */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <div className="relative group">
            {/* Ambient pulse */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-amber-600/40 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-black border-4 border-amber-400 shadow-2xl p-0.5">
              {playerOfTheWeek.photoUrl ? (
                <img
                  src={playerOfTheWeek.photoUrl}
                  alt={playerOfTheWeek.playerName}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#151D17] text-amber-400">
                  <User className="w-12 h-12 mb-1 opacity-70" />
                  <span className="text-xl font-black">#{playerOfTheWeek.jerseyNumber}</span>
                </div>
              )}

              {/* Top Jersey Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-400/80 text-amber-400 font-black text-xs">
                #{playerOfTheWeek.jerseyNumber}
              </div>

              {/* Star Badge */}
              <div className="absolute top-2 right-2 w-7 h-7 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-xs text-black font-black shadow-lg">
                ★
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-lg font-black text-white">
              {playerOfTheWeek.playerName}
            </h4>
            <div className="text-xs text-amber-300/90 font-semibold mt-0.5">
              {playerOfTheWeek.position} • {playerOfTheWeek.ageGroup}
            </div>
          </div>
        </div>

        {/* Bio, Reason, & Key Stats */}
        <div className="md:col-span-8 space-y-3.5">
          {/* Reason by Captain Zaid */}
          <div className="p-3.5 rounded-2xl bg-[#0F1612] border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>إشادة وسبب اختيار الكابتن زيد:</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
              "{playerOfTheWeek.reason}"
            </p>
          </div>

          {/* Player Registered Bio */}
          <div className="p-3.5 rounded-2xl bg-[#090D0A] border border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 mb-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>سيرة اللاعب المسجلة في البرنامج:</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {playerOfTheWeek.bio}
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">تقييم الأداء</div>
                <div className="text-xs font-black text-amber-300">
                  {playerOfTheWeek.performanceRating || 9.8} / 10
                </div>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">أهداف الأسبوع</div>
                <div className="text-xs font-black text-emerald-300">
                  {playerOfTheWeek.goalsThisWeek || 2} أهداف
                </div>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 col-span-2 sm:col-span-1">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">حالة الاعتماد</div>
                <div className="text-[11px] font-bold text-gray-200">
                  معتمد رسمياً
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
