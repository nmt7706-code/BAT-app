import { useState, FormEvent } from 'react';
import { Trophy, Calendar, MapPin, Clock, Plus, Trash2, Edit3, CheckCircle2, ChevronDown, Award, Users, AlertCircle, ShieldAlert } from 'lucide-react';
import { MatchRecord, UserSession, MatchStatus } from '../types';
import { StorageService } from '../utils/storage';

interface MatchesViewProps {
  session: UserSession;
  matches: MatchRecord[];
  onMatchesUpdated: () => void;
}

export function MatchesView({ session, matches, onMatchesUpdated }: MatchesViewProps) {
  const isCaptain = session.role === 'captain';

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchRecord | null>(null);

  // Form State
  const [opponent, setOpponent] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [location, setLocation] = useState('ملعب بايبوخت الرئيسي (B.A.T)');
  const [ageGroup, setAgeGroup] = useState('فئة الشباب (U-19)');
  const [status, setStatus] = useState<MatchStatus>('upcoming');
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [batScorersText, setBatScorersText] = useState<string>('');
  const [captainNotes, setCaptainNotes] = useState<string>('');
  const [squadText, setSquadText] = useState<string>('');

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === 'upcoming' && m.status !== 'upcoming' && m.status !== 'ongoing') return false;
    if (activeFilter === 'finished' && m.status !== 'finished') return false;
    if (selectedAgeGroup !== 'all' && m.ageGroup !== selectedAgeGroup) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingMatch(null);
    setOpponent('');
    setMatchDate(new Date().toISOString().split('T')[0]);
    setMatchTime('05:00 م');
    setLocation('ملعب بايبوخت الرئيسي (B.A.T)');
    setAgeGroup('فئة الشباب (U-19)');
    setStatus('upcoming');
    setHomeScore('');
    setAwayScore('');
    setBatScorersText('');
    setCaptainNotes('');
    setSquadText('');
    setShowAddModal(true);
  };

  const openEditModal = (match: MatchRecord) => {
    setEditingMatch(match);
    setOpponent(match.opponent);
    setMatchDate(match.date);
    setMatchTime(match.time);
    setLocation(match.location);
    setAgeGroup(match.ageGroup);
    setStatus(match.status);
    setHomeScore(match.homeScore !== undefined ? String(match.homeScore) : '');
    setAwayScore(match.awayScore !== undefined ? String(match.awayScore) : '');
    setBatScorersText((match.batScorers || []).join('\n'));
    setCaptainNotes(match.captainNotes || '');
    setSquadText((match.squadCalledUp || []).join(', '));
    setShowAddModal(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!opponent.trim()) return;

    const scorersList = batScorersText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const squadList = squadText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const matchRecord: MatchRecord = {
      id: editingMatch ? editingMatch.id : 'mat-' + Date.now(),
      opponent: opponent.trim(),
      date: matchDate || 'اليوم',
      time: matchTime || '05:00 م',
      location: location.trim() || 'ملعب بايبوخت الرئيسي',
      ageGroup,
      status,
      homeScore: homeScore !== '' ? Number(homeScore) : undefined,
      awayScore: awayScore !== '' ? Number(awayScore) : undefined,
      batScorers: scorersList,
      captainNotes: captainNotes.trim() || undefined,
      squadCalledUp: squadList.length > 0 ? squadList : undefined,
    };

    StorageService.saveMatch(matchRecord);
    onMatchesUpdated();
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المباراة من السجل؟')) {
      StorageService.deleteMatch(id);
      onMatchesUpdated();
    }
  };

  // Stats calculation
  const totalMatches = matches.length;
  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const winsCount = finishedMatches.filter((m) => (m.homeScore ?? 0) > (m.awayScore ?? 0)).length;
  const goalsScored = finishedMatches.reduce((acc, m) => acc + (m.homeScore ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner with Crest */}
      <div className="bg-gradient-to-r from-[#141E17] via-[#1B291F] to-[#101712] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1B271F] to-[#0E1611] border-2 border-amber-400/50 p-0.5 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
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
                  <Trophy className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">جدول المباريات والنتائج الرسمية</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                متابعة مواعيد المنافسات والبطولات الودية والرسمية لأكاديمية بايبوخت (B.A.T)
              </p>
            </div>
          </div>

          {isCaptain && (
            <button
              id="btn-add-new-match"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مباراة / تثبيت نتيجة</span>
            </button>
          )}
        </div>

        {/* Quick Match Performance Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/5">
          <div className="bg-[#0B100C]/70 rounded-2xl p-3 border border-white/5 text-center">
            <div className="text-[11px] text-gray-400 font-bold mb-0.5">المباريات المسجلة</div>
            <div className="text-lg sm:text-xl font-black text-amber-300">{totalMatches}</div>
          </div>
          <div className="bg-[#0B100C]/70 rounded-2xl p-3 border border-white/5 text-center">
            <div className="text-[11px] text-gray-400 font-bold mb-0.5">الانتصارات 🏆</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400">{winsCount} فوز</div>
          </div>
          <div className="bg-[#0B100C]/70 rounded-2xl p-3 border border-white/5 text-center">
            <div className="text-[11px] text-gray-400 font-bold mb-0.5">أهداف الأكاديمية ⚽</div>
            <div className="text-lg sm:text-xl font-black text-yellow-400">{goalsScored} هدف</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-white/5">
          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'كافة المباريات' },
              { id: 'upcoming', label: 'المباريات القادمة ⏳' },
              { id: 'finished', label: 'النتائج والانتصارات 🏆' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  activeFilter === btn.id
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                    : 'bg-[#0B100C] text-gray-300 border-white/5 hover:border-amber-500/30'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Age group filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">الفئة:</span>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="bg-[#0B100C] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">كافة الفئات العمرية</option>
              <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
              <option value="فئة الناشئين (U-15)">فئة الناشئين (U-15)</option>
              <option value="فئة الأشبال والناشئين (U-15)">فئة الأشبال (U-15)</option>
              <option value="فئة البراعم (U-12)">فئة البراعم (U-12)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-[#0E1410] rounded-3xl border border-white/5 p-6">
            <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-gray-300">لا توجد مباريات مسجلة حالياً في هذا القسم</h3>
            <p className="text-xs text-gray-500 mt-1">
              {isCaptain ? 'انقر على "إضافة مباراة" لجدولة مباراة ودية جديدة' : 'تابع التبليغات لمعرفة المواعيد القادمة'}
            </p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isFinished = match.status === 'finished';
            const isWin = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
            const isDraw = isFinished && (match.homeScore ?? 0) === (match.awayScore ?? 0);

            return (
              <div
                key={match.id}
                className={`rounded-3xl p-5 sm:p-6 transition-all border ${
                  isFinished
                    ? isWin
                      ? 'bg-gradient-to-b from-[#111C14] to-[#0D150F] border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'bg-[#0E1410] border-white/5'
                    : 'bg-gradient-to-b from-[#141C15] to-[#0E1410] border-amber-500/30 shadow-md shadow-amber-950/20'
                }`}
              >
                {/* Match Status Header */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                        match.status === 'finished'
                          ? isWin
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : isDraw
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-red-500/20 border-red-500/40 text-red-300'
                          : match.status === 'ongoing'
                          ? 'bg-red-500 text-white border-red-400 animate-pulse'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {match.status === 'finished'
                        ? isWin
                          ? 'فوز بايبوخت 🏆'
                          : isDraw
                          ? 'تعادل 🤝'
                          : 'انتهاء المباراة'
                        : match.status === 'ongoing'
                        ? 'مباشر الآن ⚽'
                        : 'مباراة قادمة ⏳'}
                    </span>

                    <span className="text-[11px] bg-white/5 text-gray-300 px-2.5 py-0.5 rounded-full border border-white/10">
                      {match.ageGroup}
                    </span>
                  </div>

                  {isCaptain && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(match)}
                        className="p-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded-xl transition-all border border-white/5"
                        title="تعديل النتيجة أو التفاصيل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(match.id)}
                        className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-white/5"
                        title="حذف المباراة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Scoreboard / Teams Faceoff */}
                <div className="flex items-center justify-between gap-2 sm:gap-6 py-2">
                  {/* Home Team: B.A.T Academy */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1E2E22] to-[#0F1711] border-2 border-amber-400/60 p-0.5 shrink-0 shadow overflow-hidden">
                      <img
                        src="/logo.png"
                        alt="بايبوخت"
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-bold">المضيف</div>
                      <h4 className="text-sm sm:text-base font-black text-white">بايبوخت (B.A.T)</h4>
                    </div>
                  </div>

                  {/* Score or VS */}
                  <div className="shrink-0 px-3 sm:px-6 text-center">
                    {isFinished ? (
                      <div className="flex items-center gap-2 sm:gap-3 bg-[#080C0A] border border-amber-500/30 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-2xl shadow-inner">
                        <span className="text-xl sm:text-3xl font-black text-amber-300">
                          {match.homeScore ?? 0}
                        </span>
                        <span className="text-gray-500 font-bold">:</span>
                        <span className="text-xl sm:text-3xl font-black text-gray-300">
                          {match.awayScore ?? 0}
                        </span>
                      </div>
                    ) : (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-xs sm:text-sm">
                        ضد
                      </div>
                    )}
                  </div>

                  {/* Away Team: Opponent */}
                  <div className="flex-1 flex items-center justify-end gap-3 text-left">
                    <div>
                      <div className="text-xs text-gray-400 font-bold text-left">الخصم</div>
                      <h4 className="text-sm sm:text-base font-black text-gray-200 text-left">
                        {match.opponent}
                      </h4>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#131B16] border border-white/10 flex items-center justify-center shrink-0 text-gray-300 font-black text-sm shadow">
                      ⚽
                    </div>
                  </div>
                </div>

                {/* Match Meta: Date, Time, Location */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{match.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{match.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{match.location}</span>
                  </div>
                </div>

                {/* Scorers List (if any) */}
                {match.batScorers && match.batScorers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[11px] font-bold text-amber-300 mb-1.5 flex items-center gap-1">
                      <span>⚽ أهداف بايبوخت:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {match.batScorers.map((scorer, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-200 px-2.5 py-0.5 rounded-lg font-medium"
                        >
                          ⚽ {scorer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Squad Called Up (if any) */}
                {match.squadCalledUp && match.squadCalledUp.length > 0 && (
                  <div className="mt-3 pt-2">
                    <div className="text-[11px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>القائمة المستدعاة:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.squadCalledUp.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-md"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Captain's Technical Remarks */}
                {match.captainNotes && (
                  <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
                    <span className="font-bold text-amber-300 block mb-0.5">
                      توجيه الكابتن زيد محمد خرشيد:
                    </span>
                    {match.captainNotes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Match Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101713] border border-amber-500/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-lg font-black text-amber-300 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{editingMatch ? 'تعديل تفاصيل المباراة والنتيجة' : 'جدولة مباراة جديدة للأكاديمية'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">اسم الفريق الخصم *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أكاديمية النجوم الدولية"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">تاريخ المباراة *</label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">وقت المباراة *</label>
                  <input
                    type="text"
                    required
                    placeholder="05:30 م"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الملعب / الموقع</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">حالة المباراة</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upcoming', label: 'قادمة ⏳' },
                    { id: 'ongoing', label: 'مباشر الآن ⚽' },
                    { id: 'finished', label: 'انتهت 🏁' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatus(st.id as MatchStatus)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        status === st.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-[#080C0A] border-white/10 text-gray-400'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scores (if finished or ongoing) */}
              {(status === 'finished' || status === 'ongoing') && (
                <div className="p-4 bg-black/40 border border-amber-500/20 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-amber-300 block">النتيجة النهائية للمباراة</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">أهداف بايبوخت (B.A.T)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        className="w-full bg-[#0E1611] border border-emerald-500/40 rounded-xl px-3 py-2 text-center text-base font-black text-emerald-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-300 mb-1">أهداف الخصم</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        className="w-full bg-[#0E1611] border border-white/10 rounded-xl px-3 py-2 text-center text-base font-black text-gray-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">
                      مسجلو أهداف الأكاديمية (كل هدف بسطر)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="علي أحمد (دقيقة 18)&#10;زيدون قاسم (دقيقة 54)"
                      value={batScorersText}
                      onChange={(e) => setBatScorersText(e.target.value)}
                      className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  القائمة المستدعاة (افصل بالفاصلة)
                </label>
                <input
                  type="text"
                  placeholder="علي أحمد, يوسف مهند, مصطفى حسن"
                  value={squadText}
                  onChange={(e) => setSquadText(e.target.value)}
                  className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  توجيهات فنية من الكابتن زيد
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات حول أداء الفريق، التشكيلة، أو تعليمات للاعبين..."
                  value={captainNotes}
                  onChange={(e) => setCaptainNotes(e.target.value)}
                  className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  حفظ المباراة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
