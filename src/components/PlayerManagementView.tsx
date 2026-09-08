import { useState, FormEvent, ChangeEvent } from 'react';
import { Users, UserCheck, Plus, Search, Shield, Phone, Activity, Star, Trash2, Edit3, HeartPulse, Eye, Camera, Lock, X, Award, Flame, Send, BellRing, Smartphone, CheckCircle2, Ban, AlertTriangle } from 'lucide-react';
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

  // Real Delete & Ban States
  const [playerToDelete, setPlayerToDelete] = useState<PlayerRecord | null>(null);
  const [playerToBan, setPlayerToBan] = useState<PlayerRecord | null>(null);
  const [banReasonText, setBanReasonText] = useState('حساب غير منتمي لأكاديمية بايبوخت الرياضية');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
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

  const handleConfirmRealDeletePlayer = () => {
    if (!playerToDelete) return;
    const name = playerToDelete.name;
    StorageService.deletePlayer(playerToDelete.id);
    onPlayersUpdated();
    setPlayerToDelete(null);
    setActionFeedback(`تم الحذف الفعلي والنهائي للاعب (${name}) من قاعدة البيانات وقائمة الهدافين وإنهاء أي جلسة نشطة له.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleConfirmRealBanPlayer = () => {
    if (!playerToBan) return;
    const name = playerToBan.name;
    StorageService.banUser({
      id: playerToBan.id,
      name: playerToBan.name,
      phone: playerToBan.phone,
      reason: banReasonText.trim() || 'حساب غير منتمي لأكاديمية بايبوخت الرياضية',
    });
    onPlayersUpdated();
    setPlayerToBan(null);
    setActionFeedback(`تم الحظر الفعلي للاعب (${name}) وطرده فوراً من التطبيق وإلغاء حسابه نهائياً.`);
    setTimeout(() => setActionFeedback(null), 5000);
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
      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-4 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-center gap-3 shadow-lg shadow-red-950/40 animate-in fade-in slide-in-from-top-2">
          <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-bold">{actionFeedback}</span>
        </div>
      )}

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
                  <Users className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">إدارة كشوفات ونجوم الأكاديمية</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                متابعة الحضور، التقييم الفني والبدني تحت إشراف مباشر من الكابتن <span className="text-amber-300 font-bold">زيد محمد خرشيد</span>
              </p>
            </div>
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

      {/* Players List - Vertical, showing ONLY Name and Photo as strictly requested */}
      <div className="space-y-2.5 max-w-3xl mx-auto">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12 bg-[#0E1410] rounded-3xl border border-white/5 p-6">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-gray-300">لا يوجد لاعبين مطابقين للبحث</h3>
            <p className="text-xs text-gray-500 mt-1">
              تأكد من كتابة الاسم بشكل صحيح أو اختر فئة أخرى
            </p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isCurrentUser = session.name === player.name;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-[#14231A] via-[#101C15] to-[#0D1510] border-amber-500/50 shadow-md shadow-amber-950/20'
                    : 'bg-[#0E1410] hover:bg-[#121B14] border-white/5 hover:border-amber-500/30'
                }`}
              >
                {/* Clickable Area: Player Photo & Name ONLY */}
                <div
                  onClick={() => setInspectingPlayer(player)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer select-none group"
                  title="اضغط لمعاينة سيرة ومعلومات اللاعب الكاملة"
                >
                  {/* Photo / Avatar */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-400/50 bg-[#16221A] flex items-center justify-center shrink-0 shadow-md group-hover:border-amber-400 group-hover:scale-105 transition-all">
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-amber-300 font-black text-sm sm:text-base">
                        #{player.jerseyNumber}
                      </span>
                    )}
                  </div>

                  {/* ONLY Player Name as strictly requested */}
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {player.name}
                      </h4>
                      {isCurrentUser && (
                        <span className="text-[10px] bg-amber-400 text-black px-2 py-0.2 rounded-full font-black">
                          أنت
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right/Left Action Controls: Delete, Edit & Info Icon */}
                <div className="flex items-center gap-2">
                  {isCaptain && (
                    <>
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(player);
                        }}
                        className="p-2 text-gray-400 hover:text-amber-300 hover:bg-white/5 rounded-xl transition-all"
                        title="تعديل بيانات اللاعب"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Real Ban Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayerToBan(player);
                          setBanReasonText('حساب غير منتمي لأكاديمية بايبوخت الرياضية');
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-950/60 hover:bg-amber-900 border border-amber-500/50 text-amber-300 hover:text-white flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95"
                        title="حظر حقيقي فوري وطرده من التطبيق"
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      {/* Real Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayerToDelete(player);
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-300 hover:text-white flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95"
                        title="حذف حقيقي نهائي للاعب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* View Bio Button */}
                  <button
                    onClick={() => setInspectingPlayer(player)}
                    className="p-2 text-gray-400 hover:text-amber-300 hover:bg-white/5 rounded-xl transition-all"
                    title="معاينة السيرة والمعلومات"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
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

      {/* Real Delete Player Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-red-400">تأكيد الحذف الفعلي والنهائي للاعب</h3>
              <p className="text-xs text-gray-300">
                أنت على وشك حذف ملف هذا اللاعب بشكل حقيقي ودائم من الأكاديمية:
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                {playerToDelete.photoUrl ? (
                  <img
                    src={playerToDelete.photoUrl}
                    alt={playerToDelete.name}
                    className="w-10 h-10 rounded-xl object-cover border border-amber-400/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                    #{playerToDelete.jerseyNumber}
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-black text-white">{playerToDelete.name}</p>
                  <p className="text-[10px] text-gray-400">{playerToDelete.position} • #{playerToDelete.jerseyNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-[11px] text-red-300 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>إجراء فعلي حقيقي لا يمكن التراجع عنه:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] text-gray-300 leading-relaxed pr-1">
                <li>حذف اللاعب نهائياً من قاعدة بيانات الأكاديمية.</li>
                <li>مسح سجله وإحصائياته من قائمة الهدافين.</li>
                <li>إنهاء أي جلسة دخول نشطة له على الفور ومنعه من الاستمرار.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRealDeletePlayer}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف حقيقي نهائي</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Ban Player Confirmation Modal */}
      {playerToBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Ban className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-amber-400">تأكيد الحظر الفعلي والطرد من التطبيق</h3>
              <p className="text-xs text-gray-300">
                أنت على وشك حظر هذا المستخدم ومنعه التام من الدخول للأكاديمية:
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-black text-white">{playerToBan.name}</p>
                  <p className="text-[10px] text-gray-400">الهاتف: {playerToBan.phone || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">سبب الحظر الرسمي:</label>
              <select
                value={banReasonText}
                onChange={(e) => setBanReasonText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none focus:border-amber-400 mb-2"
              >
                <option value="حساب غير منتمي لأكاديمية بايبوخت الرياضية">حساب غير منتمي لأكاديمية بايبوخت</option>
                <option value="مخالفة انضباطية وسلوكية جسيمة">مخالفة انضباطية وسلوكية جسيمة</option>
                <option value="انتحال صفة لاعب في الأكاديمية">انتحال صفة لاعب في الأكاديمية</option>
                <option value="قرار إداري مباشر من الكابتن زيد">قرار إداري مباشر من الكابتن زيد</option>
              </select>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>نتائج الحظر الفعلي المباشر:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] text-gray-300 leading-relaxed pr-1">
                <li>طرد المستخدم فوراً وإلغاء جلسته النشطة في هذه اللحظة.</li>
                <li>مسح حسابه من قائمة اللاعبين وقاعدة البيانات.</li>
                <li>منع رقمه واسمه من تسجيل الدخول مرة أخرى مستقبلاً.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRealBanPlayer}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>تأكيد الحظر الفعلي والطرد</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerToBan(null)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Player Photo & Full Profile Modal (Accessible when clicking on any player name) */}
      {inspectingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-black relative">
            <button
              onClick={() => setInspectingPlayer(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isCaptain ? 'الملف الإداري الرسمي للاعب (لوحة المسؤول)' : 'بطاقة ومعلومات اللاعب في أكاديمية بايبوخت'}
              </span>
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

              {inspectingPlayer.bio && (
                <div className="bg-[#090E0B] p-3.5 rounded-2xl border border-white/5 text-xs">
                  <span className="font-bold text-amber-300 block mb-1">السيرة والمعلومات:</span>
                  <p className="text-gray-300 leading-relaxed">{inspectingPlayer.bio}</p>
                </div>
              )}

              {inspectingPlayer.notes && (
                <div className="bg-[#090E0B] p-3.5 rounded-2xl border border-white/5 text-xs">
                  <span className="font-bold text-emerald-300 block mb-1">ملاحظات الكابتن زيد الفنية:</span>
                  <p className="text-gray-300 leading-relaxed">{inspectingPlayer.notes}</p>
                </div>
              )}

              {inspectingPlayer.joinDate && (
                <div className="text-[11px] text-gray-400 px-1">
                  تاريخ الانضمام للأكاديمية: <span className="text-gray-200">{inspectingPlayer.joinDate}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-white/10 flex-wrap">
              <button
                onClick={() => setInspectingPlayer(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/5 font-semibold"
              >
                إغلاق
              </button>

              {isCaptain && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Edit */}
                  <button
                    onClick={() => {
                      const pl = inspectingPlayer;
                      setInspectingPlayer(null);
                      startEdit(pl);
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  {/* Real Delete */}
                  <button
                    onClick={() => {
                      const pl = inspectingPlayer;
                      setInspectingPlayer(null);
                      setPlayerToDelete(pl);
                    }}
                    className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    title="حذف هذا اللاعب نهائياً من قائمة الأكاديمية"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>حذف حقيقي</span>
                  </button>

                  {/* Real Ban */}
                  <button
                    onClick={() => {
                      const pl = inspectingPlayer;
                      setInspectingPlayer(null);
                      setPlayerToBan(pl);
                    }}
                    className="px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    title="حظر اللاعب من الدخول للأكاديمية نهائياً"
                  >
                    <Ban className="w-3.5 h-3.5 text-amber-400" />
                    <span>حظر حقيقي</span>
                  </button>
                </div>
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
