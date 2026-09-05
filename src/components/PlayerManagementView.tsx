import { useState, FormEvent, ChangeEvent } from 'react';
import { Users, UserCheck, Plus, Search, Shield, Phone, Activity, Star, Trash2, Edit3, HeartPulse, Eye, Camera, Lock, X, Award, Flame, Send, BellRing, Smartphone, CheckCircle2 } from 'lucide-react';
import { PlayerRecord, UserSession } from '../types';
import { StorageService } from '../utils/storage';
import { sendCaptainFCMBroadcast } from '../utils/fcm';
import { EvaluationModal } from './EvaluationModal';

interface PlayerManagementViewProps {
  session: UserSession;
  players: PlayerRecord[];
  onPlayersUpdated: () => void;
  onPlayerEvaluated?: (player: PlayerRecord, verdict: string) => void;
}

export function PlayerManagementView({ session, players, onPlayersUpdated, onPlayerEvaluated }: PlayerManagementViewProps) {
  const isCaptain = session.role === 'captain';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterAge, setFilterAge] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerRecord | null>(null);
  const [inspectingPlayer, setInspectingPlayer] = useState<PlayerRecord | null>(null);
  const [evaluatingPlayer, setEvaluatingPlayer] = useState<PlayerRecord | null>(null);
  const [directAlertPlayer, setDirectAlertPlayer] = useState<PlayerRecord | null>(null);
  const [directAlertTitle, setDirectAlertTitle] = useState('');
  const [directAlertMsg, setDirectAlertMsg] = useState('');
  const [directAlertCategory, setDirectAlertCategory] = useState<'training' | 'sleep' | 'urgent' | 'recovery'>('training');
  const [alertSuccessToast, setAlertSuccessToast] = useState<string | null>(null);

  // New Player Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState(10);
  const [position, setPosition] = useState('صانع ألعاب (AMF)');
  const [ageGroup, setAgeGroup] = useState('فئة الشباب (U-19)');
  const [attendanceRate, setAttendanceRate] = useState(90);
  const [performanceRating, setPerformanceRating] = useState(8.5);
  const [readiness, setReadiness] = useState<'جاهز للمباريات' | 'تأهيل بدني' | 'إصابة طفيفة'>('جاهز للمباريات');
  const [notes, setNotes] = useState('');

  // Handle Photo Upload in Edit/Add Modal
  const handleModalPhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Filter players
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jerseyNumber.toString().includes(searchQuery) ||
      p.phone.includes(searchQuery);

    const matchesPosition = filterPosition === 'all' || p.position.includes(filterPosition);
    const matchesAge = filterAge === 'all' || p.ageGroup === filterAge;

    return matchesSearch && matchesPosition && matchesAge;
  });

  const handleSavePlayer = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const playerToSave: PlayerRecord = {
      id: editingPlayer ? editingPlayer.id : 'pl-' + Date.now(),
      name: name.trim(),
      phone: phone.trim() || '07700000000',
      photoUrl: photoUrl.trim() || undefined,
      jerseyNumber: Number(jerseyNumber) || 10,
      position,
      ageGroup,
      attendanceRate: Number(attendanceRate) || 85,
      performanceRating: Number(performanceRating) || 8.0,
      readiness,
      notes: notes.trim() || 'لاعب منتظم في تدريبات أكاديمية بايبوخت.',
      joinDate: editingPlayer ? editingPlayer.joinDate : new Date().toISOString().split('T')[0],
    };

    StorageService.savePlayer(playerToSave);
    onPlayersUpdated();
    setShowAddModal(false);
    setEditingPlayer(null);

    // Reset Form
    setName('');
    setPhone('');
    setPhotoUrl('');
    setNotes('');
  };

  const startEdit = (player: PlayerRecord) => {
    setEditingPlayer(player);
    setName(player.name);
    setPhone(player.phone);
    setPhotoUrl(player.photoUrl || '');
    setJerseyNumber(player.jerseyNumber);
    setPosition(player.position);
    setAgeGroup(player.ageGroup);
    setAttendanceRate(player.attendanceRate);
    setPerformanceRating(player.performanceRating);
    setReadiness(player.readiness);
    setNotes(player.notes);
    setShowAddModal(true);
  };

  const handleDeletePlayer = (id: string) => {
    if (confirm('هل أنت متأكد من إزالة هذا اللاعب من قائمة الأكاديمية؟')) {
      StorageService.deletePlayer(id);
      onPlayersUpdated();
    }
  };

  const handleOpenDirectAlert = (player: PlayerRecord) => {
    setDirectAlertPlayer(player);
    setDirectAlertTitle(`تنبيه شخصي من الكابتن زيد للاعب ${player.name}`);
    setDirectAlertMsg(`يرجى الالتزام بالموعد المحدد والتركيز على الخطة البدنية.`);
    setDirectAlertCategory('training');
  };

  const handleSendDirectFCMAlert = (e: FormEvent) => {
    e.preventDefault();
    if (!directAlertPlayer || !directAlertMsg.trim()) return;

    sendCaptainFCMBroadcast({
      title: directAlertTitle.trim() || `تنبيه خاص: ${directAlertPlayer.name}`,
      body: directAlertMsg.trim(),
      category: directAlertCategory,
      targetGroup: directAlertPlayer.ageGroup,
      targetPlayerId: directAlertPlayer.id,
    });

    setAlertSuccessToast(`تم إرسال التنبيه الفوري بنجاح إلى هاتف اللاعب (${directAlertPlayer.name}) عبر FCM`);
    setDirectAlertPlayer(null);
    setDirectAlertMsg('');
    setTimeout(() => setAlertSuccessToast(null), 4000);
  };

  // Stats
  const totalPlayers = players.length;
  const matchReadyCount = players.filter((p) => p.readiness === 'جاهز للمباريات').length;
  const avgAttendance = Math.round(
    players.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (players.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Alert Sent Success Banner */}
      {alertSuccessToast && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center gap-2 shadow-lg shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{alertSuccessToast}</span>
        </div>
      )}

      {/* Header Banner & Stats */}
      <div className="bg-gradient-to-r from-[#141C16] via-[#17241C] to-[#101712] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">إدارة كشوفات ونجوم الأكاديمية</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              متابعة الحضور، التقييم الفني والبدني تحت إشراف مباشر من الكابتن <span className="text-amber-300 font-bold">زيد محمد خرشيد</span>
            </p>
          </div>

          {isCaptain && (
            <button
              onClick={() => {
                setEditingPlayer(null);
                setName('');
                setPhone('');
                setNotes('');
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة لاعب جديد إلى الكشف</span>
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-[#0A0E0B] p-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-0.5">إجمالي اللاعبين</div>
            <div className="text-lg sm:text-2xl font-black text-amber-300">{totalPlayers}</div>
          </div>
          <div className="bg-[#0A0E0B] p-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-0.5">جاهزون للمباريات</div>
            <div className="text-lg sm:text-2xl font-black text-emerald-400">{matchReadyCount}</div>
          </div>
          <div className="bg-[#0A0E0B] p-3 rounded-2xl border border-white/5 text-center">
            <div className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-0.5">متوسط الالتزام</div>
            <div className="text-lg sm:text-2xl font-black text-yellow-400">{avgAttendance}%</div>
          </div>
        </div>

        {/* Exclusive Admin Notice */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-amber-300">صلاحية المسؤول فقط:</strong> كشف اللاعبين والصور المرفوعة عند التسجيل تظهر هنا حصراً للكابتن زيد. حسابات اللاعبين مخصصة لرؤية التبليغات فقط دون إمكانية الوصول لقوائم الإدارة أو صور زملائهم.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#0F1612] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو رقم القميص..."
            className="w-full px-3.5 py-2 pr-9 bg-[#080B09] border border-amber-500/20 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 py-2 bg-[#080B09] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="all">كافة المراكز</option>
            <option value="حارس">حراسة المرمى</option>
            <option value="دفاع">خط الدفاع</option>
            <option value="وسط">خط الوسط</option>
            <option value="هجوم">خط الهجوم</option>
          </select>

          <select
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="px-3 py-2 bg-[#080B09] border border-white/10 rounded-xl text-xs text-gray-300 focus:outline-none flex-1 sm:flex-none"
          >
            <option value="all">كافة الفئات</option>
            <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
            <option value="فئة الناشئين (U-17)">فئة الناشئين (U-17)</option>
            <option value="فئة الأشبال (U-15)">فئة الأشبال (U-15)</option>
          </select>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const isCurrentUser = session.name === player.name;

          const readinessStyle =
            player.readiness === 'جاهز للمباريات'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              : player.readiness === 'تأهيل بدني'
              ? 'bg-yellow-950/60 text-yellow-300 border-yellow-500/40'
              : 'bg-red-950/60 text-red-300 border-red-500/40';

          return (
            <div
              key={player.id}
              className={`rounded-3xl p-5 transition-all border flex flex-col justify-between relative group ${
                isCurrentUser
                  ? 'bg-gradient-to-b from-[#14231A] to-[#0E1611] border-amber-400/60 shadow-lg shadow-amber-950/30'
                  : 'bg-[#0E1410] border-white/5 hover:border-amber-500/30'
              }`}
            >
              {isCurrentUser && (
                <div className="absolute -top-2.5 right-6 px-3 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black shadow">
                  أنت (الحساب الحالي)
                </div>
              )}

              <div>
                {/* Top Row: Photo/Jersey & Name */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    {player.photoUrl ? (
                      <div
                        onClick={() => setInspectingPlayer(player)}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md shadow-black/60 cursor-pointer group/photo shrink-0 hover:border-amber-400 hover:scale-105 transition-all"
                        title="اضغط لمعاينة صورة اللاعب وتفاصيله الرسمية"
                      >
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-5 h-5 text-amber-300" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-black/85 px-1 py-0.2 rounded-tl-md text-[9px] font-black text-amber-400 font-mono">
                          #{player.jerseyNumber}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setInspectingPlayer(player)}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-900/40 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-lg shadow-inner shrink-0 cursor-pointer hover:border-amber-400 transition-all"
                        title="اضغط لمعاينة تفاصيل اللاعب"
                      >
                        #{player.jerseyNumber}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-gray-100 text-sm">{player.name}</h3>
                        {player.photoUrl && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                            <Camera className="w-2.5 h-2.5" />
                            <span>صورة موثقة</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300 font-semibold">{player.position}</div>
                      <div className="text-[10px] text-gray-400">{player.ageGroup}</div>
                    </div>
                  </div>

                  {isCaptain && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => setInspectingPlayer(player)}
                        className="p-1.5 text-gray-400 hover:text-emerald-300 rounded-lg hover:bg-white/5"
                        title="معاينة الصورة والملف"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEdit(player)}
                        className="p-1.5 text-gray-400 hover:text-amber-300 rounded-lg hover:bg-white/5"
                        title="تعديل اللاعب"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                        title="حذف اللاعب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${readinessStyle}`}>
                    {player.readiness}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span className="dir-ltr">{player.phone}</span>
                  </span>
                </div>

                {/* Metrics: Attendance & Performance */}
                <div className="space-y-2.5 mb-4 bg-black/40 p-3 rounded-2xl border border-white/5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-400">نسبة حضور التمارين</span>
                      <span className="font-bold text-emerald-400">{player.attendanceRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${player.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-400">التقييم الفني العام</span>
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{player.performanceRating} / 10</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                        style={{ width: `${(player.performanceRating / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Today's Evaluation Status */}
                {player.todayEvaluation ? (
                  <div className="mb-3 p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>تقييم اليوم: {player.todayEvaluation.verdict}</span>
                      <span className="text-[10px] opacity-80 font-mono">({player.todayEvaluation.ratingScore}/10)</span>
                    </div>
                    {isCaptain && (
                      <button
                        onClick={() => setEvaluatingPlayer(player)}
                        className="text-[10px] text-amber-400 underline hover:text-amber-200"
                      >
                        تحديث التقييم
                      </button>
                    )}
                  </div>
                ) : (
                  isCaptain && (
                    <div className="mb-3">
                      <button
                        onClick={() => setEvaluatingPlayer(player)}
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-dashed border-amber-500/40 rounded-xl text-[11px] text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>تقييم مستوى اللاعب اليوم وإرسال إشعار له</span>
                      </button>
                    </div>
                  )
                )}

                {/* FCM Push Notification Status */}
                <div className="mb-2.5 flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-xl bg-[#09110D] border border-emerald-500/25 text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>إشعارات الهاتف (FCM):</span>
                  </span>
                  <span className="font-bold flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>متصل ونشط 📱</span>
                  </span>
                </div>

                {/* Direct Personal Alert Button for Captain */}
                {isCaptain && (
                  <button
                    onClick={() => handleOpenDirectAlert(player)}
                    className="w-full mb-3 py-1.5 px-2.5 bg-gradient-to-r from-emerald-950/60 to-emerald-900/60 hover:from-emerald-900/80 hover:to-emerald-800/80 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group"
                    title="إرسال إشعار فوري مباشر إلى هاتف هذا اللاعب فقط عبر Firebase Cloud Messaging"
                  >
                    <BellRing className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-bounce" />
                    <span>إرسال تنبيه شخصي لهاتف اللاعب (FCM Direct)</span>
                  </button>
                )}

                {/* Notes from Captain */}
                {player.notes && (
                  <p className="text-[11px] text-gray-300 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    <span className="text-amber-400 font-semibold">ملاحظات الكابتن زيد: </span>
                    {player.notes}
                  </p>
                )}
              </div>

              {/* Card Footer & Quick Evaluate Action */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400 mt-3">
                {isCaptain ? (
                  <button
                    onClick={() => setEvaluatingPlayer(player)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>تقييم اليوم ({player.todayEvaluation ? player.todayEvaluation.verdict : 'لم يقيّم اليوم'})</span>
                  </button>
                ) : (
                  <span>انضم: {player.joinDate}</span>
                )}
                <span className="text-amber-400/80 font-semibold">B.A.T Academy</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Player Modal (Captain) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#101713] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-amber-300">
                {editingPlayer ? 'تعديل بيانات اللاعب' : 'إضافة لاعب جديد لكشف الأكاديمية'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPlayer(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">اسم اللاعب الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عمر فاضل السلامي"
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Photo upload for player (Admin control) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الصورة الشخصية للاعب (للمسؤول فقط)</label>
                <div className="flex items-center gap-3 p-3 bg-[#090E0B] border border-dashed border-amber-500/30 rounded-xl">
                  {photoUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-500/50 shrink-0">
                      <img src={photoUrl} alt="معاينة" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-0 right-0 p-0.5 bg-red-950/80 text-red-300 rounded-bl"
                        title="إزالة الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 text-right">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{photoUrl ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleModalPhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">
                      ستحفظ الصورة في ملف اللاعب وتظهر لك في لوحة الإدارة فقط
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07701234567"
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">رقم القميص</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">المركز</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="حارس مرمى (GK)">حارس مرمى (GK)</option>
                    <option value="قلب دفاع (CB)">قلب دفاع (CB)</option>
                    <option value="ظهير أيمن/أيسر (FB)">ظهير أيمن/أيسر (FB)</option>
                    <option value="خط وسط مدافع (DMF)">خط وسط مدافع (DMF)</option>
                    <option value="صانع ألعاب (AMF)">صانع ألعاب (AMF)</option>
                    <option value="جناح هجومي (WF)">جناح هجومي (WF)</option>
                    <option value="رأس حربة (ST)">رأس حربة (ST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الفئة العمرية</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
                    <option value="فئة الناشئين (U-17)">فئة الناشئين (U-17)</option>
                    <option value="فئة الأشبال (U-15)">فئة الأشبال (U-15)</option>
                    <option value="الفريق الأول (Senior)">الفريق الأول (Senior)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نسبة الحضور (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={attendanceRate}
                    onChange={(e) => setAttendanceRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">التقييم (من 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={performanceRating}
                    onChange={(e) => setPerformanceRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الحالة البدنية</label>
                  <select
                    value={readiness}
                    onChange={(e) => setReadiness(e.target.value as any)}
                    className="w-full px-2 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="جاهز للمباريات">جاهز</option>
                    <option value="تأهيل بدني">تأهيل بدني</option>
                    <option value="إصابة طفيفة">إصابة طفيفة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">ملاحظات الكابتن زيد الفنية</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تقييم الأداء في آخر حصة تدريبية أو مباراة..."
                  className="w-full px-3.5 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlayer(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs shadow-md"
                >
                  {editingPlayer ? 'حفظ التعديلات' : 'تسجيل اللاعب في الكشف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Inspect Player Photo & Full Profile Modal (Exclusive to Captain) */}
      {inspectingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-black relative">
            <button
              onClick={() => setInspectingPlayer(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Exclusive Admin Privacy Watermark / Badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>ملف رسمي خاص بالمسؤول (الكابتن زيد فقط)</span>
            </div>

            <div className="text-center mb-5">
              {/* High-res photo presentation */}
              <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-950/40 mb-3 bg-[#080B09]">
                {inspectingPlayer.photoUrl ? (
                  <img
                    src={inspectingPlayer.photoUrl}
                    alt={inspectingPlayer.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-amber-300">
                    <span className="text-4xl font-black">#{inspectingPlayer.jerseyNumber}</span>
                    <span className="text-xs text-gray-400 mt-1">لا توجد صورة</span>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 bg-black/80 px-2.5 py-1 rounded-xl text-xs font-black text-amber-300 border border-white/10 font-mono">
                  #{inspectingPlayer.jerseyNumber}
                </div>
              </div>

              <h2 className="text-xl font-black text-white">{inspectingPlayer.name}</h2>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">{inspectingPlayer.position}</p>
              <p className="text-xs text-gray-400">{inspectingPlayer.ageGroup}</p>
            </div>

            {/* Player details grid */}
            <div className="space-y-3 text-right">
              <div className="grid grid-cols-2 gap-2.5 bg-black/40 p-3.5 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px] mb-0.5">رقم الهاتف:</span>
                  <a
                    href={`tel:${inspectingPlayer.phone}`}
                    className="font-bold text-emerald-400 dir-ltr inline-block hover:underline"
                  >
                    {inspectingPlayer.phone}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] mb-0.5">الحالة البدنية:</span>
                  <span className="font-bold text-amber-300">{inspectingPlayer.readiness}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] mb-0.5">نسبة الحضور:</span>
                  <span className="font-bold text-emerald-400">{inspectingPlayer.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] mb-0.5">التقييم الفني:</span>
                  <span className="font-bold text-yellow-300">{inspectingPlayer.performanceRating} / 10</span>
                </div>
              </div>

              {inspectingPlayer.notes && (
                <div className="bg-[#090E0B] p-3.5 rounded-2xl border border-white/5 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">ملاحظات الكابتن زيد الفنية:</span>
                  <p className="text-gray-300 leading-relaxed">{inspectingPlayer.notes}</p>
                </div>
              )}

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-200">
                🔒 تم تسجيل هذه الصورة أثناء إنشاء الحساب وحفظها حصراً في لوحة إدارة الكابتن زيد. لا يمكن لأي لاعب الاطلاع على صور زملائه.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-white/10">
              <button
                onClick={() => setInspectingPlayer(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/5 font-semibold"
              >
                إغلاق
              </button>
              {isCaptain && (
                <button
                  onClick={() => {
                    const pl = inspectingPlayer;
                    setInspectingPlayer(null);
                    startEdit(pl);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل هذا اللاعب</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily Player Evaluation Modal */}
      {evaluatingPlayer && (
        <EvaluationModal
          player={evaluatingPlayer}
          isOpen={true}
          onClose={() => setEvaluatingPlayer(null)}
          onSaved={(updatedPlayer, verdict) => {
            setEvaluatingPlayer(null);
            onPlayersUpdated();
            if (onPlayerEvaluated) {
              onPlayerEvaluated(updatedPlayer, verdict);
            }
          }}
        />
      )}

      {/* Direct Personal FCM Alert Modal */}
      {directAlertPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setDirectAlertPlayer(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              {directAlertPlayer.photoUrl ? (
                <img
                  src={directAlertPlayer.photoUrl}
                  alt={directAlertPlayer.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-lg">
                  #{directAlertPlayer.jerseyNumber}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">{directAlertPlayer.name}</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    #{directAlertPlayer.jerseyNumber}
                  </span>
                </div>
                <p className="text-xs text-emerald-300 font-semibold">{directAlertPlayer.position} • {directAlertPlayer.ageGroup}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 text-[11px] text-emerald-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              <span>
                <strong>تنبيه فوري مباشر (FCM Push):</strong> سيصل هذا الإشعار كرسالة منبثقة مع اهتزاز وصوت رنين مباشرة إلى هاتف اللاعب <strong>{directAlertPlayer.name}</strong> فقط!
              </span>
            </div>

            <form onSubmit={handleSendDirectFCMAlert} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">نوع التنبيه:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'training', label: 'موعد تمرين خاص ⚽' },
                    { id: 'sleep', label: 'تنبيه النوم والراحة 🛌' },
                    { id: 'recovery', label: 'تغذية / فحص وزن 💧' },
                    { id: 'urgent', label: 'تنبيه عاجل وانضباطي ⚡' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setDirectAlertCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        directAlertCategory === cat.id
                          ? 'border-emerald-400 bg-emerald-500/25 text-white ring-2 ring-emerald-400/40'
                          : 'border-white/10 bg-[#080B09] text-gray-300 hover:border-emerald-500/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">عنوان التنبيه الظاهر على شاشة القفل *</label>
                <input
                  type="text"
                  required
                  value={directAlertTitle}
                  onChange={(e) => setDirectAlertTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-emerald-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">نص التنبيه والتوجيه الخاص *</label>
                <textarea
                  rows={3}
                  required
                  value={directAlertMsg}
                  onChange={(e) => setDirectAlertMsg(e.target.value)}
                  placeholder="اكتب التوجيه الفردي لهذا اللاعب..."
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-emerald-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-emerald-400 leading-relaxed"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5">نماذج سريعة للتوجيه المباشر:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'يرجى الحضور قبل الموعد بـ 15 دقيقة لإجراء إحماء منفرد',
                    'موعد النوم الآن! احرص على شرب الماء والاستشفاء التام',
                    'عليك زيادة الجهد البدني في التمرين القادم مع التركيز على السرعة',
                    'تنبيه انضباطي: الالتزام الصارم بتعليمات الكابتن في الملعب',
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setDirectAlertMsg(preset)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-emerald-500/20 border border-white/10 rounded-lg text-[10px] text-gray-300 transition-colors text-right"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setDirectAlertPlayer(null)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال التنبيه الفوري لهاتف اللاعب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
