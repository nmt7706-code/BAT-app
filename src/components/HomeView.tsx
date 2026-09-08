import { useState, useEffect, FormEvent } from 'react';
import {
  Star,
  Crown,
  X,
  Sparkles,
  ShieldCheck,
  Megaphone,
  Clock,
  Trash2,
  Edit3,
  Plus,
  Award,
  Activity,
  HeartPulse,
  User,
  CheckCircle2,
  Flame,
  Zap,
} from 'lucide-react';
import {
  Announcement,
  UserSession,
  PlayerOfTheWeek,
  PlayerRecord,
  MainTabType,
} from '../types';
import { PlayerOfTheWeekCard } from './PlayerOfTheWeekCard';
import { StorageService } from '../utils/storage';
import { sendCaptainFCMBroadcast } from '../utils/fcm';

interface HomeViewProps {
  session: UserSession;
  announcements?: Announcement[];
  exercises?: any[];
  matches?: any[];
  topScorers?: any[];
  players?: PlayerRecord[];
  onAnnouncementsUpdated: () => void;
  onExercisesUpdated?: () => void;
  onPushNotificationSent?: (ann: Announcement) => void;
  onNavigateToTab?: (tab: MainTabType) => void;
}

export function HomeView({
  session,
  players = [],
  onAnnouncementsUpdated,
  onPushNotificationSent,
  onNavigateToTab,
}: HomeViewProps) {
  const isCaptain = session.role === 'captain';

  // 1. 24-Hour Latest Announcement State
  const [latest24hAnnouncement, setLatest24hAnnouncement] = useState<Announcement | null>(() =>
    StorageService.getLatest24HourAnnouncement()
  );
  const [showAdd24hModal, setShowAdd24hModal] = useState(false);
  const [editing24h, setEditing24h] = useState<Announcement | null>(null);
  const [new24hTitle, setNew24hTitle] = useState('');
  const [new24hContent, setNew24hContent] = useState('');
  const [new24hTarget, setNew24hTarget] = useState('كافة لاعبي الأكاديمية');

  const openAdd24hModal = () => {
    setEditing24h(null);
    setNew24hTitle('');
    setNew24hContent('');
    setNew24hTarget('كافة لاعبي الأكاديمية');
    setShowAdd24hModal(true);
  };

  const openEdit24hModal = (ann: Announcement) => {
    setEditing24h(ann);
    setNew24hTitle(ann.title);
    setNew24hContent(ann.content);
    setNew24hTarget(ann.targetGroup || 'كافة لاعبي الأكاديمية');
    setShowAdd24hModal(true);
  };

  // 2. Player of the Week state
  const [playerOfTheWeek, setPlayerOfTheWeek] = useState<PlayerOfTheWeek>(() =>
    StorageService.getPlayerOfTheWeek()
  );
  const [showPowModal, setShowPowModal] = useState(false);

  // POW Form state
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [powName, setPowName] = useState(playerOfTheWeek.playerName);
  const [powPosition, setPowPosition] = useState(playerOfTheWeek.position);
  const [powAgeGroup, setPowAgeGroup] = useState(playerOfTheWeek.ageGroup);
  const [powJersey, setPowJersey] = useState(playerOfTheWeek.jerseyNumber?.toString() || '10');
  const [powPhoto, setPowPhoto] = useState(playerOfTheWeek.photoUrl || '');
  const [powReason, setPowReason] = useState(playerOfTheWeek.reason);
  const [powBio, setPowBio] = useState(playerOfTheWeek.bio);
  const [powRating, setPowRating] = useState(playerOfTheWeek.performanceRating?.toString() || '9.8');
  const [powGoals, setPowGoals] = useState(playerOfTheWeek.goalsThisWeek?.toString() || '2');

  const allPlayers = players.length > 0 ? players : StorageService.getPlayers();

  // Find the logged-in player profile if role is 'player'
  const loggedPlayer: PlayerRecord | undefined =
    session.role === 'player'
      ? allPlayers.find(
          (p) =>
            p.name.trim().toLowerCase() === session.name.trim().toLowerCase() ||
            (session.id && p.id === session.id)
        ) || allPlayers[0]
      : undefined;

  // Refresh 24h announcement periodically & clean up expired
  useEffect(() => {
    StorageService.cleanupExpired24HourAnnouncements();
    setLatest24hAnnouncement(StorageService.getLatest24HourAnnouncement());

    const interval = setInterval(() => {
      StorageService.cleanupExpired24HourAnnouncements();
      setLatest24hAnnouncement(StorageService.getLatest24HourAnnouncement());
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);

  // Handle Publishing a 24-Hour Announcement
  const handlePublish24hAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!new24hTitle.trim() || !new24hContent.trim()) return;

    const ann: Announcement = {
      id: editing24h ? editing24h.id : 'ann-24h-' + Date.now(),
      title: new24hTitle.trim(),
      content: new24hContent.trim(),
      type: 'urgent',
      author: editing24h ? editing24h.author : 'الكابتن زيد محمد خرشيد',
      date: editing24h ? editing24h.date : ('اليوم، ' + new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })),
      targetGroup: new24hTarget,
      isPinned: true,
      createdAt: editing24h ? editing24h.createdAt : Date.now(),
      sendPushNotification: true,
    };

    StorageService.saveAnnouncement(ann);
    setLatest24hAnnouncement(ann);
    onAnnouncementsUpdated();

    if (!editing24h) {
      sendCaptainFCMBroadcast({
        title: `⚡ تبليغ رسمي عاجل (24 ساعة): ${ann.title}`,
        body: ann.content,
        category: 'urgent',
        targetGroup: ann.targetGroup,
      });

      if (onPushNotificationSent) {
        onPushNotificationSent(ann);
      }
    }

    setShowAdd24hModal(false);
    setEditing24h(null);
    setNew24hTitle('');
    setNew24hContent('');
  };

  // Handle Deleting the 24h Announcement early
  const handleDelete24hAnnouncement = () => {
    if (!latest24hAnnouncement) return;
    if (confirm('هل تريد حذف هذا التبليغ الآن؟')) {
      StorageService.deleteAnnouncement(latest24hAnnouncement.id);
      setLatest24hAnnouncement(null);
      onAnnouncementsUpdated();
    }
  };

  // Calculate remaining hours for 24h announcement
  const getRemainingHoursText = (createdAt?: number) => {
    if (!createdAt) return 'متبقي أقل من 24 ساعة';
    const elapsedMs = Date.now() - createdAt;
    const remainingMs = 24 * 60 * 60 * 1000 - elapsedMs;
    if (remainingMs <= 0) return 'انتهت مدة العرض';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `متبقي ${hours} ساعة و ${minutes} دقيقة حتى الحذف التلقائي`;
    }
    return `متبقي ${minutes} دقيقة حتى الحذف التلقائي`;
  };

  // Select Player in POW Modal
  const handleSelectPlayerChange = (playerId: string) => {
    setSelectedPlayerId(playerId);
    const found = allPlayers.find((p) => p.id === playerId);
    if (found) {
      setPowName(found.name);
      setPowPosition(found.position);
      setPowAgeGroup(found.ageGroup);
      setPowJersey(found.jerseyNumber?.toString() || '10');
      setPowPhoto(found.photoUrl || '');
      setPowBio(
        `لاعب متميز في أكاديمية بايبوخت (B.A.T)، يشغل مركز ${found.position} في ${found.ageGroup}. مسجل برقم قميص #${found.jerseyNumber || 10}. أظهر التزاماً واحترافية عالية في جميع الحصص التدريبية والمباريات الودية.`
      );
    }
  };

  // Save Player of the Week
  const handleSavePOW = (e: FormEvent) => {
    e.preventDefault();
    if (!powName.trim() || !powReason.trim()) return;

    const updatedPOW: PlayerOfTheWeek = {
      id: 'pow-' + Date.now(),
      playerId: selectedPlayerId || playerOfTheWeek.playerId || 'custom-' + Date.now(),
      playerName: powName.trim(),
      position: powPosition,
      jerseyNumber: parseInt(powJersey, 10) || 10,
      ageGroup: powAgeGroup,
      photoUrl: powPhoto || undefined,
      selectedDate: new Date().toLocaleDateString('ar-IQ'),
      reason: powReason.trim(),
      bio: powBio.trim() || 'لاعب متألق في صفوف أكاديمية بايبوخت الرياضية تحت إشراف الكابتن زيد محمد خرشيد.',
      goalsThisWeek: parseInt(powGoals, 10) || 0,
      performanceRating: parseFloat(powRating) || 9.5,
      selectedBy: 'الكابتن زيد محمد خرشيد',
    };

    StorageService.setPlayerOfTheWeek(updatedPOW);
    setPlayerOfTheWeek(updatedPOW);
    setShowPowModal(false);
    onAnnouncementsUpdated();

    if (onPushNotificationSent) {
      onPushNotificationSent({
        id: 'ann-pow-' + Date.now(),
        title: `⭐ نجم الأسبوع في الأكاديمية: ${updatedPOW.playerName} (#${updatedPOW.jerseyNumber})`,
        content: `قرر الكابتن زيد محمد خرشيد اختيار ${updatedPOW.playerName} كلاعب الأسبوع!\n\nسبب الاختيار: ${updatedPOW.reason}`,
        type: 'general',
        author: 'الكابتن زيد محمد خرشيد',
        date: 'الآن',
        targetGroup: 'جميع اللاعبين',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. ترحيب وسيرة اللاعب المسجل (أو سيرة الكابتن زيد للمسؤول)                 */}
      {/* ========================================================================= */}
      {isCaptain ? (
        // بطاقة السيرة الإدارية والفنية للكابتن زيد محمد خرشيد
        <div className="bg-gradient-to-r from-[#141E17] via-[#1B291F] to-[#101712] border-2 border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#202E23] to-[#0E1611] border-2 border-amber-400 p-0.5 shrink-0 shadow-xl shadow-amber-500/20 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="شعار أكاديمية بايبوخت"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>الإدارة الفنية والإشراف العام</span>
                  </span>
                  <span className="text-xs text-gray-400">B.A.T Football Academy</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  أهلاً بك، الكابتن زيد محمد خرشيد 👑
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  المشرف العام ومؤسس أكاديمية بايبوخت الرياضية لكرة القدم
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs bg-[#090E0A] border border-amber-500/40 text-amber-300 font-extrabold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>صلاحيات المسؤول المطلقة</span>
              </span>
            </div>
          </div>

          {/* Captain Bio */}
          <div className="bg-[#0A100C] border border-amber-500/20 rounded-2xl p-4 sm:p-5 mb-4">
            <h3 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>السيرة المهنية والإدارية للمسؤول</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              يقود الكابتن زيد محمد خرشيد المنظومة الفنية والتطويرية في أكاديمية بايبوخت، مع التركيز على صقل المواهب الشابة، وتأهيل اللاعبين بدنياً وفنياً للمنافسات والبطولات الودية والرسمية في العراق.
            </p>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={openAdd24hModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Megaphone className="w-4 h-4" />
              <span>نشر تبليغ عاجل (24 ساعة)</span>
            </button>

            <button
              onClick={() => setShowPowModal(true)}
              className="px-4 py-2 bg-[#121A15] hover:bg-[#18241C] text-amber-300 border border-amber-500/40 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>تتويج / تغيير لاعب الأسبوع</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('players')}
                className="px-4 py-2 bg-[#121A15] hover:bg-[#18241C] text-gray-200 border border-white/10 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
              >
                <User className="w-4 h-4 text-gray-400" />
                <span>إدارة قائمة اللاعبين</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        // بطاقة ترحيب وسيرة اللاعب المسجل
        <div className="bg-gradient-to-r from-[#141E17] via-[#1B291F] to-[#101712] border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#16221B] border-2 border-amber-400 p-0.5 shrink-0 shadow-xl shadow-amber-500/10 overflow-hidden flex items-center justify-center">
                {loggedPlayer?.photoUrl || session.photoUrl ? (
                  <img
                    src={loggedPlayer?.photoUrl || session.photoUrl}
                    alt={session.name}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-2xl font-black text-amber-300">
                    #{loggedPlayer?.jerseyNumber || '10'}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>لاعب مسجل ومعتمد في الكشف</span>
                  </span>
                  <span className="text-xs text-gray-400">B.A.T Academy</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  أهلاً بك يا بطل، {session.name} ⚽
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  رقم القميص: <span className="text-amber-400 font-bold">#{loggedPlayer?.jerseyNumber || '10'}</span> • المركز: <span className="text-amber-300 font-bold">{loggedPlayer?.position || 'لاعب وسط'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{loggedPlayer?.readiness || 'جاهز للمباريات والتمارين'}</span>
              </span>
            </div>
          </div>

          {/* Registered Player Full Bio */}
          <div className="bg-[#0A100C] border border-white/10 rounded-2xl p-4 sm:p-5 mb-4">
            <h3 className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>السيرة الذاتية والمعلومات الكروية المسجلة</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {loggedPlayer?.notes ||
                `اللاعب ${session.name} منتظم في صفوف أكاديمية بايبوخت لكرة القدم تحت إشراف وتوجيه الكابتن زيد محمد خرشيد. يلتزم بالبرنامج التدريبي والخطط التكتيكية المعتمدة لتطوير الأداء والجاهزية.`}
            </p>
          </div>

          {/* Quick Player Stats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#080D0A] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[10px] text-gray-400 block font-semibold">الفئة العمرية</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">
                {loggedPlayer?.ageGroup || 'فئة الشباب (U-19)'}
              </span>
            </div>

            <div className="bg-[#080D0A] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[10px] text-gray-400 block font-semibold">نسبة الحضور والالتزام</span>
              <span className="text-xs sm:text-sm font-black text-emerald-300">
                {loggedPlayer?.attendanceRate || 92}%
              </span>
            </div>

            <div className="bg-[#080D0A] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[10px] text-gray-400 block font-semibold">تقييم الكابتن زيد</span>
              <span className="text-xs sm:text-sm font-black text-yellow-300">
                ⭐ {loggedPlayer?.performanceRating || 8.8} / 10
              </span>
            </div>

            <div className="bg-[#080D0A] border border-white/5 rounded-xl p-3 text-center">
              <span className="text-[10px] text-gray-400 block font-semibold">الحالة البدنية</span>
              <span className="text-xs sm:text-sm font-black text-white">
                {loggedPlayer?.readiness || 'جاهز'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. لاعب الأسبوع (يظهر عند الكل)                                           */}
      {/* ========================================================================= */}
      <PlayerOfTheWeekCard
        playerOfTheWeek={playerOfTheWeek}
        session={session}
        onOpenChangeModal={() => setShowPowModal(true)}
      />

      {/* ========================================================================= */}
      {/* 3. آخر تبليغ نزله المسؤول وينحذف بعد 24 ساعة تلقائياً (فقط في الرئيسية) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-[#151D17] to-[#0E1510] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <Megaphone className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  آخر تبليغ رسمي من الكابتن زيد
                </h3>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                  ينحذف تلقائياً بعد 24 ساعة ⏳
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                يظهر هذا التبليغ حصرياً في الواجهة الرئيسية لمدة 24 ساعة فقط ثم ينحذف تلقائياً عند الجميع
              </p>
            </div>
          </div>

          {isCaptain && (
            <button
              onClick={openAdd24hModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>نشر تبليغ 24 ساعة</span>
            </button>
          )}
        </div>

        {latest24hAnnouncement ? (
          <div className="bg-[#0B100C] border border-amber-500/30 rounded-2xl p-5 shadow-inner">
            {/* Countdown Badge & Target */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{getRemainingHoursText(latest24hAnnouncement.createdAt)}</span>
                </span>

                <span className="text-[11px] bg-white/5 text-gray-300 px-2.5 py-0.5 rounded-full">
                  الموجه إليهم: {latest24hAnnouncement.targetGroup}
                </span>

                <span className="text-[11px] text-gray-400">
                  {latest24hAnnouncement.date}
                </span>
              </div>

              {isCaptain && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit24hModal(latest24hAnnouncement)}
                    className="p-1.5 bg-white/5 hover:bg-amber-500/20 border border-white/10 text-gray-300 hover:text-amber-300 rounded-xl transition-all"
                    title="تعديل هذا التبليغ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete24hAnnouncement}
                    className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 rounded-xl transition-all"
                    title="حذف هذا التبليغ فوراً"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <h4 className="text-base sm:text-lg font-black text-amber-300 mb-2 leading-relaxed">
              {latest24hAnnouncement.title}
            </h4>

            {/* Content */}
            <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-line leading-relaxed">
              {latest24hAnnouncement.content}
            </p>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
              <span>صادر عن: <strong className="text-amber-400">{latest24hAnnouncement.author}</strong></span>
              <span className="text-emerald-400 font-semibold">ساري المفعول حالياً ✓</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0F0C] border border-white/5 rounded-2xl p-6 text-center">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-gray-300">
              لا يوجد تبليغ عاجل حالياً خلال الـ 24 ساعة الماضية
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              تم حذف التبليغات السابقة تلقائياً بعد انقضاء مدة الـ 24 ساعة المقررة.
            </p>
            {isCaptain && (
              <button
                onClick={openAdd24hModal}
                className="mt-4 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>نشر تبليغ عاجل جديد للواجهة الرئيسية (24 ساعة)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Modal: Captain Publish 24h Announcement                                    */}
      {/* ========================================================================= */}
      {showAdd24hModal && isCaptain && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg bg-[#111A14] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowAdd24hModal(false);
                  setEditing24h(null);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-black text-amber-300 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>{editing24h ? 'تعديل التبليغ العاجل (24 ساعة)' : 'نشر تبليغ رسمي يظهر 24 ساعة فقط في الرئيسية'}</span>
              </h3>
            </div>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              {editing24h
                ? 'يمكنك تعديل تفاصيل التبليغ الحالي وسينعكس التعديل فوراً لدى جميع اللاعبين.'
                : 'هذا التبليغ سيظهر في أعلى الواجهة الرئيسية لجميع اللاعبين، وينحذف تلقائياً عند الكل بعد مرور 24 ساعة من لحظة نشره.'}
            </p>

            <form onSubmit={handlePublish24hAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  عنوان التبليغ العاجل *
                </label>
                <input
                  type="text"
                  value={new24hTitle}
                  onChange={(e) => setNew24hTitle(e.target.value)}
                  placeholder="مثال: موعد تجمع اللاعبين لمباراة الغد الودية"
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/40 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  الموجه إليهم
                </label>
                <select
                  value={new24hTarget}
                  onChange={(e) => setNew24hTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/40 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="كافة لاعبي الأكاديمية">كافة لاعبي الأكاديمية</option>
                  <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
                  <option value="فئة الناشئين (U-17)">فئة الناشئين (U-17)</option>
                  <option value="فئة الأشبال (U-15)">فئة الأشبال (U-15)</option>
                  <option value="الفريق الأول (Senior)">الفريق الأول (Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  نص التبليغ والتعليمات *
                </label>
                <textarea
                  rows={4}
                  value={new24hContent}
                  onChange={(e) => setNew24hContent(e.target.value)}
                  placeholder="اكتب التوجيهات أو الموعد المحدد..."
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/40 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd24hModal(false);
                    setEditing24h(null);
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  {editing24h ? 'حفظ التعديلات' : 'نشر الآن وتفعيل الـ 24 ساعة 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal: Captain Change / Crown Player of the Week                           */}
      {/* ========================================================================= */}
      {showPowModal && isCaptain && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#101713] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-right animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setShowPowModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>اختيار وتتويج لاعب الأسبوع (إدارة الكابتن زيد)</span>
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              عند اعتماد لاعب الأسبوع سيتم إرسال إشعار فوري لجميع لاعبي الأكاديمية، وعرض صورته وسيرته المسجلة وإشادة الكابتن به في الواجهة الرئيسية.
            </p>

            <form onSubmit={handleSavePOW} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  اختر من لاعبي الأكاديمية المسجلين (للتعبئة التلقائية)
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => handleSelectPlayerChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-gray-100 text-sm focus:outline-none"
                >
                  <option value="">-- اختر لاعباً من القائمة أو املأ يدوياً --</option>
                  {allPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.jerseyNumber || '10'} - {p.position} - {p.ageGroup})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    اسم اللاعب *
                  </label>
                  <input
                    type="text"
                    value={powName}
                    onChange={(e) => setPowName(e.target.value)}
                    placeholder="مثال: يوسف أحمد العبيدي"
                    className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-gray-100 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    المركز في الملعب
                  </label>
                  <input
                    type="text"
                    value={powPosition}
                    onChange={(e) => setPowPosition(e.target.value)}
                    placeholder="مثال: صانع ألعاب (AMF)"
                    className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-gray-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    الفئة العمرية
                  </label>
                  <input
                    type="text"
                    value={powAgeGroup}
                    onChange={(e) => setPowAgeGroup(e.target.value)}
                    placeholder="مثال: فئة الشباب (U-19)"
                    className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-gray-100 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    رقم القميص
                  </label>
                  <input
                    type="number"
                    value={powJersey}
                    onChange={(e) => setPowJersey(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-gray-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  رابط صورة اللاعب الشخصية
                </label>
                <input
                  type="text"
                  value={powPhoto}
                  onChange={(e) => setPowPhoto(e.target.value)}
                  placeholder="https://... أو مسار الصورة"
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-gray-100 text-xs focus:outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-amber-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>سبب اختيار الكابتن زيد (يظهر كإشادة لجميع اللاعبين) *</span>
                </label>
                <textarea
                  value={powReason}
                  onChange={(e) => setPowReason(e.target.value)}
                  rows={2}
                  placeholder="مثال: التزام وانضباط تكتيكي استثنائي في التدريبات، وتسجيل هدف الفوز الحاسم في اللقاء الودي الأخير."
                  className="w-full px-3.5 py-2 bg-[#080B09] border border-amber-500/40 focus:border-amber-400 rounded-xl text-gray-100 text-xs focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  سيرة اللاعب المسجلة في البرنامج *
                </label>
                <textarea
                  value={powBio}
                  onChange={(e) => setPowBio(e.target.value)}
                  rows={3}
                  placeholder="اكتب نبذة عن مسيرة اللاعب ومستواه الرياضي في الأكاديمية..."
                  className="w-full px-3.5 py-2 bg-[#080B09] border border-white/10 focus:border-emerald-400 rounded-xl text-gray-100 text-xs focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    تقييم الأداء (من 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={powRating}
                    onChange={(e) => setPowRating(e.target.value)}
                    placeholder="9.8"
                    className="w-full px-3.5 py-2 bg-[#080B09] border border-white/10 rounded-xl text-gray-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    أهداف هذا الأسبوع
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={powGoals}
                    onChange={(e) => setPowGoals(e.target.value)}
                    placeholder="2"
                    className="w-full px-3.5 py-2 bg-[#080B09] border border-white/10 rounded-xl text-gray-100 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  <span>تتويج وإرسال الإشعار للجميع ⭐</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
