import { useState, FormEvent } from 'react';
import { Flame, Trophy, Award, Medal, Plus, Edit3, Trash2, User, ChevronUp, AlertTriangle, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import { TopScorer, UserSession, PlayerRecord } from '../types';
import { StorageService } from '../utils/storage';

interface TopScorersViewProps {
  session: UserSession;
  scorers: TopScorer[];
  players: PlayerRecord[];
  onScorersUpdated: () => void;
}

export function TopScorersView({
  session,
  scorers,
  players,
  onScorersUpdated,
}: TopScorersViewProps) {
  const isCaptain = session.role === 'captain';
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');

  // Real Delete States
  const [scorerToDelete, setScorerToDelete] = useState<TopScorer | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingScorer, setEditingScorer] = useState<TopScorer | null>(null);

  // Form State
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('10');
  const [ageGroup, setAgeGroup] = useState<string>('فئة الشباب (U-19)');
  const [goals, setGoals] = useState<string>('0');
  const [assists, setAssists] = useState<string>('0');
  const [matchesPlayed, setMatchesPlayed] = useState<string>('1');

  const filteredScorers = scorers.filter((s) => {
    if (selectedAgeGroup === 'all') return true;
    return s.ageGroup === selectedAgeGroup;
  });

  const top1 = filteredScorers[0];
  const top2 = filteredScorers[1];
  const top3 = filteredScorers[2];

  const openAddModal = () => {
    setEditingScorer(null);
    setSelectedPlayerId(players[0]?.id || '');
    setCustomName(players[0]?.name || '');
    setJerseyNumber(players[0]?.jerseyNumber?.toString() || '10');
    setAgeGroup(players[0]?.ageGroup || 'فئة الشباب (U-19)');
    setGoals('1');
    setAssists('0');
    setMatchesPlayed('1');
    setShowModal(true);
  };

  const openEditModal = (scorer: TopScorer) => {
    setEditingScorer(scorer);
    setSelectedPlayerId(scorer.playerId);
    setCustomName(scorer.playerName);
    setJerseyNumber(String(scorer.jerseyNumber));
    setAgeGroup(scorer.ageGroup);
    setGoals(String(scorer.goals));
    setAssists(String(scorer.assists));
    setMatchesPlayed(String(scorer.matchesPlayed));
    setShowModal(true);
  };

  const handlePlayerSelect = (pId: string) => {
    setSelectedPlayerId(pId);
    const pl = players.find((p) => p.id === pId);
    if (pl) {
      setCustomName(pl.name);
      setJerseyNumber(String(pl.jerseyNumber));
      setAgeGroup(pl.ageGroup);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalName = customName.trim();
    if (!finalName) return;

    const matchedPlayer = players.find((p) => p.id === selectedPlayerId);

    const record: TopScorer = {
      playerId: editingScorer ? editingScorer.playerId : selectedPlayerId || 'sc-' + Date.now(),
      playerName: finalName,
      jerseyNumber: Number(jerseyNumber) || 10,
      ageGroup,
      goals: Math.max(0, Number(goals) || 0),
      assists: Math.max(0, Number(assists) || 0),
      matchesPlayed: Math.max(1, Number(matchesPlayed) || 1),
      photoUrl: matchedPlayer?.photoUrl || editingScorer?.photoUrl,
    };

    StorageService.saveTopScorer(record);
    onScorersUpdated();
    setShowModal(false);
  };

  const handleConfirmRealDeleteScorer = () => {
    if (!scorerToDelete) return;
    const name = scorerToDelete.playerName;
    StorageService.deleteTopScorer(scorerToDelete.playerId);
    onScorersUpdated();
    setScorerToDelete(null);
    setDeleteFeedback(`تم الحذف الفعلي والنهائي للهداف (${name}) من لائحة الهدافين وقاعدة البيانات بنجاح.`);
    setTimeout(() => {
      setDeleteFeedback(null);
    }, 4500);
  };

  // Quick increment goal
  const handleQuickAddGoal = (scorer: TopScorer) => {
    if (!isCaptain) return;
    const updated: TopScorer = {
      ...scorer,
      goals: scorer.goals + 1,
    };
    StorageService.saveTopScorer(updated);
    onScorersUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Real Deletion Feedback Toast */}
      {deleteFeedback && (
        <div className="p-4 bg-gradient-to-r from-red-950/90 via-red-900/90 to-red-950/90 border-2 border-red-500/60 rounded-2xl text-xs text-red-200 flex items-center justify-between gap-3 shadow-xl shadow-red-950/50 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="font-black text-white text-xs block">تأكيد الحذف الفعلي للهداف</span>
              <span className="text-red-200 text-[11px]">{deleteFeedback}</span>
            </div>
          </div>
          <button
            onClick={() => setDeleteFeedback(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#171E14] via-[#222E1A] to-[#12180F] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#232F1D] to-[#0E150C] border-2 border-amber-400/50 p-0.5 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
              <img
                src="/logo.png"
                alt="شعار أكاديمية بايبوخت"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Flame className="w-4 h-4 text-amber-400" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  لائحة هدافي أكاديمية بايبوخت (B.A.T)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                الحذاء الذهبي وجدول صدارة التهديف وصناعة الألعاب لمواهب الأكاديمية
              </p>
            </div>
          </div>

          {isCaptain && (
            <button
              id="btn-add-scorer"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة / تعديل إحصائية هداف</span>
            </button>
          )}
        </div>

        {/* Age Filter Bar */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'كافة الفئات' },
            { id: 'فئة الشباب (U-19)', label: 'الشباب (U-19)' },
            { id: 'فئة الناشئين (U-15)', label: 'الناشئين (U-15)' },
            { id: 'فئة البراعم (U-12)', label: 'البراعم (U-12)' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setSelectedAgeGroup(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedAgeGroup === btn.id
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                  : 'bg-[#0B100C] text-gray-300 border-white/5 hover:border-amber-500/30'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Section */}
      {filteredScorers.length >= 2 && (
        <div className="bg-gradient-to-b from-[#121A13] to-[#0A0E0B] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-amber-400 tracking-wider">منصة التتويج الشرفية</span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              ثلاثي صدارة الحذاء الذهبي ⚽🏆
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4">
            {/* 2nd Place: Silver */}
            {top2 && (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-700 p-0.5 shadow-lg overflow-hidden border-2 border-slate-300">
                    {top2.photoUrl ? (
                      <img src={top2.photoUrl} alt={top2.playerName} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-black text-lg">
                        #{top2.jerseyNumber}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 bg-slate-200 text-slate-900 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-white">
                    🥈 2
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">{top2.playerName}</h4>
                <div className="text-[11px] text-gray-400 font-bold mb-2">رقم {top2.jerseyNumber}</div>
                <div className="w-full bg-gradient-to-t from-slate-900 to-slate-800 border border-slate-600/40 rounded-2xl p-2 sm:p-3 text-center shadow-inner h-24 sm:h-28 flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-black text-slate-200">{top2.goals}</span>
                  <span className="text-[10px] text-slate-400 font-bold">هدف ⚽</span>
                  <span className="text-[9px] text-slate-500 mt-1">{top2.assists} أسيست</span>
                </div>
                {isCaptain && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <button
                      onClick={() => openEditModal(top2)}
                      title="تعديل الإحصائية"
                      className="p-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded-lg text-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setScorerToDelete(top2)}
                      title="حذف حقيقي نهائي للهداف"
                      className="p-1 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 1st Place: Gold (Center Elevated) */}
            {top1 && (
              <div className="flex flex-col items-center text-center -mt-4">
                <div className="text-amber-400 text-lg mb-1 animate-bounce">👑</div>
                <div className="relative mb-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 shadow-xl shadow-amber-500/20 overflow-hidden border-2 border-yellow-200">
                    {top1.photoUrl ? (
                      <img src={top1.photoUrl} alt={top1.playerName} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-[#182314] flex items-center justify-center text-amber-300 font-black text-xl">
                        #{top1.jerseyNumber}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#101712]">
                    🥇 1
                  </span>
                </div>
                <h4 className="text-xs sm:text-base font-black text-amber-300 line-clamp-1">{top1.playerName}</h4>
                <div className="text-[11px] text-amber-400/80 font-bold mb-2">رقم {top1.jerseyNumber} • {top1.ageGroup}</div>
                <div className="w-full bg-gradient-to-t from-[#1E2916] to-[#2D3F1E] border-2 border-amber-400/60 rounded-2xl p-2 sm:p-3 text-center shadow-lg shadow-amber-500/20 h-32 sm:h-36 flex flex-col justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">{top1.goals}</span>
                  <span className="text-[11px] text-amber-400 font-black">هدف ⚽</span>
                  <span className="text-[10px] text-amber-200/70 mt-1">{top1.assists} صناعة هدف</span>
                </div>
                {isCaptain && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <button
                      onClick={() => openEditModal(top1)}
                      title="تعديل الإحصائية"
                      className="p-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded-lg text-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setScorerToDelete(top1)}
                      title="حذف حقيقي نهائي للهداف"
                      className="p-1 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3rd Place: Bronze */}
            {top3 && (
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 p-0.5 shadow-lg overflow-hidden border-2 border-amber-600/60">
                    {top3.photoUrl ? (
                      <img src={top3.photoUrl} alt={top3.playerName} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-[#181F1A] flex items-center justify-center text-amber-400 font-black text-lg">
                        #{top3.jerseyNumber}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 bg-amber-700 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-amber-500">
                    🥉 3
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">{top3.playerName}</h4>
                <div className="text-[11px] text-gray-400 font-bold mb-2">رقم {top3.jerseyNumber}</div>
                <div className="w-full bg-gradient-to-t from-[#1F1710] to-[#2B1F13] border border-amber-700/40 rounded-2xl p-2 sm:p-3 text-center shadow-inner h-20 sm:h-24 flex flex-col justify-center">
                  <span className="text-xl sm:text-2xl font-black text-amber-500">{top3.goals}</span>
                  <span className="text-[10px] text-amber-600 font-bold">هدف ⚽</span>
                  <span className="text-[9px] text-gray-400 mt-1">{top3.assists} أسيست</span>
                </div>
                {isCaptain && (
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <button
                      onClick={() => openEditModal(top3)}
                      title="تعديل الإحصائية"
                      className="p-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded-lg text-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setScorerToDelete(top3)}
                      title="حذف حقيقي نهائي للهداف"
                      className="p-1 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard Table / Cards */}
      <div className="bg-[#0E1410] border border-white/5 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>جدول ترتيب هدافي الأكاديمية الكامل</span>
          </h3>
          <span className="text-xs text-gray-400">{filteredScorers.length} لاعب</span>
        </div>

        <div className="space-y-2">
          {filteredScorers.map((scorer, index) => {
            const rank = index + 1;
            const ratio = scorer.matchesPlayed > 0 ? (scorer.goals / scorer.matchesPlayed).toFixed(2) : '0';

            return (
              <div
                key={scorer.playerId}
                className="flex items-center justify-between gap-3 p-3.5 bg-[#080C0A] hover:bg-[#121A13] border border-white/5 hover:border-amber-500/20 rounded-2xl transition-all"
              >
                {/* Rank & Player Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {rank}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#141C15] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {scorer.photoUrl ? (
                      <img src={scorer.photoUrl} alt={scorer.playerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-amber-300 font-bold text-xs">#{scorer.jerseyNumber}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-white">{scorer.playerName}</h4>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        #{scorer.jerseyNumber}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{scorer.ageGroup}</span>
                      <span>•</span>
                      <span>{scorer.matchesPlayed} مباراة</span>
                    </div>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Goals & Assists */}
                  <div className="text-center px-2">
                    <div className="text-base sm:text-lg font-black text-amber-300 flex items-center justify-center gap-1">
                      <span>{scorer.goals}</span>
                      <span className="text-[10px] text-amber-400">⚽</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {scorer.assists} أسيست • معدل {ratio}
                    </div>
                  </div>

                  {/* Captain Actions */}
                  {isCaptain && (
                    <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
                      <button
                        onClick={() => handleQuickAddGoal(scorer)}
                        title="إضافة هدف سريع ⚽"
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(scorer)}
                        title="تعديل الإحصائية"
                        className="p-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded-xl border border-white/5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setScorerToDelete(scorer)}
                        title="حذف حقيقي نهائي للهداف من السجل وقاعدة البيانات"
                        className="px-2 py-1.5 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white rounded-xl border border-red-500/30 text-[11px] font-black flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">حذف حقيقي</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Scorer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101713] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-amber-300 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>{editingScorer ? 'تعديل أهداف اللاعب' : 'تسجيل إحصائية هداف جديد'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select from existing registered players or type name */}
              {!editingScorer && players.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    اختر من لاعبي الأكاديمية المسجلين
                  </label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => handlePlayerSelect(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (رقم {p.jerseyNumber}) - {p.ageGroup}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">اسم اللاعب *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">رقم القميص</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الفئة العمرية</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
                    <option value="فئة الناشئين (U-15)">فئة الناشئين (U-15)</option>
                    <option value="فئة الأشبال والناشئين (U-15)">فئة الأشبال (U-15)</option>
                    <option value="فئة البراعم (U-12)">فئة البراعم (U-12)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">الأهداف ⚽</label>
                  <input
                    type="number"
                    min="0"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full bg-[#080C0A] border border-amber-500/40 rounded-xl px-3 py-2 text-center text-sm font-black text-amber-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">صناعة الأهداف 👟</label>
                  <input
                    type="number"
                    min="0"
                    value={assists}
                    onChange={(e) => setAssists(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">المباريات 🏟️</label>
                  <input
                    type="number"
                    min="1"
                    value={matchesPlayed}
                    onChange={(e) => setMatchesPlayed(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  حفظ في اللائحة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real Delete Scorer Confirmation Modal */}
      {scorerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120808] border-2 border-red-500/50 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-red-950/60 text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/10">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  تأكيد الحذف الفعلي والنهائي للهداف
                </h3>
                <p className="text-xs text-red-400 font-bold">
                  إجراء حذف حقيقي نهائي لا يمكن التراجع عنه
                </p>
              </div>
            </div>

            {/* Scorer details card */}
            <div className="bg-black/60 border border-red-500/30 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1C1414] border border-red-500/30 overflow-hidden shrink-0 flex items-center justify-center">
                {scorerToDelete.photoUrl ? (
                  <img
                    src={scorerToDelete.photoUrl}
                    alt={scorerToDelete.playerName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-red-400 font-bold text-sm">#{scorerToDelete.jerseyNumber}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-black text-white">{scorerToDelete.playerName}</div>
                <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                  <span className="text-amber-400">رقم {scorerToDelete.jerseyNumber}</span>
                  <span>•</span>
                  <span>{scorerToDelete.ageGroup}</span>
                </div>
                <div className="text-xs font-bold text-red-300 mt-1">
                  ⚽ {scorerToDelete.goals} أهداف • {scorerToDelete.assists} أسيست • {scorerToDelete.matchesPlayed} مباراة
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-6 bg-red-950/30 p-3.5 rounded-xl border border-red-500/20">
              هل أنت متأكد من الحذف الحقيقي لهذا اللاعب من لائحة الهدافين؟ سيتم شطب أهدافه وإحصائياته بالكامل من السجلات وقاعدة البيانات ولن يظهر اسمه مجدداً.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setScorerToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmRealDeleteScorer}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-xl text-xs shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف حقيقي نهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
