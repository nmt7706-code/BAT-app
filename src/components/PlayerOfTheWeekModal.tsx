import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Flame,
  Award,
  X,
  User,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { PlayerRecord, PlayerOfTheWeek } from '../types';

interface PlayerOfTheWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerRecord[];
  currentPOW?: PlayerOfTheWeek;
  onSave: (pow: PlayerOfTheWeek) => void;
}

export function PlayerOfTheWeekModal({
  isOpen,
  onClose,
  players,
  currentPOW,
  onSave,
}: PlayerOfTheWeekModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [goalsThisWeek, setGoalsThisWeek] = useState<number>(2);
  const [rating, setRating] = useState<number>(9.8);
  const [error, setError] = useState<string>('');

  // Pre-fill on open or change
  useEffect(() => {
    if (currentPOW) {
      setSelectedPlayerId(currentPOW.playerId);
      setBio(currentPOW.bio || '');
      setReason(currentPOW.reason || '');
      setGoalsThisWeek(currentPOW.goalsThisWeek || 2);
      setRating(currentPOW.performanceRating || 9.8);
    } else if (players.length > 0) {
      const first = players[0];
      setSelectedPlayerId(first.id);
      setBio(first.bio || first.notes || 'لاعب متميز في أكاديمية بايبوخت.');
      setReason('انضباط تكتيكي استثنائي ومستوى بدني رائع في تدريبات ومباريات هذا الأسبوع.');
    }
  }, [currentPOW, players, isOpen]);

  // When selected player changes in dropdown, auto-fill bio
  const handlePlayerChange = (playerId: string) => {
    setSelectedPlayerId(playerId);
    const p = players.find((pl) => pl.id === playerId);
    if (p) {
      if (p.bio) setBio(p.bio);
      else if (p.notes) setBio(p.notes);
    }
  };

  if (!isOpen) return null;

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) {
      setError('يرجى اختيار أحد لاعبي الأكاديمية');
      return;
    }
    if (!reason.trim()) {
      setError('يرجى كتابة سبب اختيار اللاعب وإشادته الفنية');
      return;
    }

    const pow: PlayerOfTheWeek = {
      id: 'pow-' + Date.now(),
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      jerseyNumber: selectedPlayer.jerseyNumber,
      position: selectedPlayer.position,
      ageGroup: selectedPlayer.ageGroup,
      photoUrl: selectedPlayer.photoUrl,
      bio: bio.trim() || selectedPlayer.bio || selectedPlayer.notes || 'لاعب معتمد بأكاديمية بايبوخت (B.A.T).',
      reason: reason.trim(),
      selectedDate: 'الأسبوع الحالي',
      selectedBy: 'الكابتن زيد محمد خرشيد',
      goalsThisWeek,
      performanceRating: rating,
    };

    onSave(pow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#101713] border border-amber-500/30 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl shadow-black relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                اختيار نجم ولاعب الأسبوع
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>صلاحية الكابتن زيد</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              سيتم إرسال إشعار فوري لجميع هواتف اللاعبين وإبراز صورته وسيرته في الواجهة
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Select Player */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              اختر اللاعب الفائز بجائزة الأسبوع:
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => handlePlayerChange(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0F0C] border border-amber-500/30 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-amber-400"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  #{player.jerseyNumber} - {player.name} ({player.position} • {player.ageGroup})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Player Preview Preview Box */}
          {selectedPlayer && (
            <div className="p-3.5 bg-[#090E0B] border border-amber-500/20 rounded-2xl flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black border-2 border-amber-400/50 shrink-0">
                {selectedPlayer.photoUrl ? (
                  <img
                    src={selectedPlayer.photoUrl}
                    alt={selectedPlayer.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-400 font-black">
                    #{selectedPlayer.jerseyNumber}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white truncate">
                    {selectedPlayer.name}
                  </span>
                  <span className="text-[11px] bg-amber-400 text-black px-1.5 py-0.2 rounded-md font-extrabold">
                    #{selectedPlayer.jerseyNumber}
                  </span>
                </div>
                <div className="text-xs text-amber-300 mt-0.5">
                  {selectedPlayer.position} • {selectedPlayer.ageGroup}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  نسبة الحضور: {selectedPlayer.attendanceRate}% • الجاهزية: {selectedPlayer.readiness}
                </div>
              </div>
            </div>
          )}

          {/* 2. Reason for Selection (سبب الاختيار) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>سبب الاختيار والإشادة الفنية (تظهر في الإشعار لجميع اللاعبين):</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="مثال: تألق لافت في خط الوسط وصناعة 3 أهداف وانضباط عالي في التمارين التكتيكية..."
              className="w-full px-4 py-2.5 bg-[#0A0F0C] border border-white/10 focus:border-amber-400 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none"
              required
            />
          </div>

          {/* 3. Player Bio (سيرته المسجلة في البرنامج) */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>سيرة اللاعب وإنجازاته المسجلة في البرنامج:</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="سيرة اللاعب، مهاراته، بداياته مع الأكاديمية ونقاط قوته الفنية..."
              className="w-full px-4 py-2.5 bg-[#0A0F0C] border border-white/10 focus:border-amber-400 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* 4. Stats Row (Goals this week + Rating) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                الأهداف / المساهمات هذا الأسبوع:
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={goalsThisWeek}
                onChange={(e) => setGoalsThisWeek(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#0A0F0C] border border-white/10 focus:border-amber-400 rounded-xl text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                التقييم الفني للأسبوع (من 10):
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 9.8)}
                className="w-full px-3 py-2 bg-[#0A0F0C] border border-white/10 focus:border-amber-400 rounded-xl text-xs text-white font-bold"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>اعتماد وبث الإشعار لجميع اللاعبين 📢</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Crown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
    </svg>
  );
}
