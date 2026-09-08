import { useState, useEffect, FormEvent } from 'react';
import {
  Settings,
  KeyRound,
  Bell,
  BellRing,
  Volume2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserX,
  Send,
  MessageSquare,
  History,
  Clock,
  LogOut,
  User,
  Smartphone,
  RefreshCw,
  Info,
  Globe,
  Copy,
  ExternalLink,
  Share2,
  QrCode,
  Check,
  Sparkles,
  Edit3,
  Save,
  Radio,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Palette,
  Database,
  Download,
  Upload,
  Phone,
  Layers,
  Award,
  Ban,
  AlertTriangle
} from 'lucide-react';
import {
  UserSession,
  AcademyPasscodes,
  NotificationRingtone,
  UserNotificationSettings,
  PlayerPrivateNote,
  LoginAuditRecord,
  BannedUser,
  PlayerRecord,
  ThemeMode,
  SocialLink,
  Announcement
} from '../types';
import { StorageService, INITIAL_SOCIAL_LINKS } from '../utils/storage';
import { soundService } from '../utils/sound';

interface SettingsViewProps {
  session: UserSession;
  onLogout: () => void;
  onSimulateRelaunch: () => void;
  onRequestNotificationPermission?: () => void;
  socialLinks?: SocialLink[];
  onSocialLinksUpdated?: () => void;
}

type SettingsSection =
  | 'notifications'
  | 'announcements'
  | 'bans'
  | 'player_notes'
  | 'user_management'
  | 'permissions'
  | 'academy_info'
  | 'academy_logo'
  | 'language'
  | 'passcode_update'
  | 'appearance'
  | 'dark_mode'
  | 'backup'
  | 'about';

export function SettingsView({
  session,
  onLogout,
  onSimulateRelaunch,
  onRequestNotificationPermission,
  socialLinks = INITIAL_SOCIAL_LINKS,
}: SettingsViewProps) {
  const isCaptain = session.role === 'captain';

  // Active Subview navigation (null = Main Vertical Settings List)
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null);

  // 1. Theme State
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => StorageService.getThemeMode());
  const [themeFeedback, setThemeFeedback] = useState('');

  // 2. Passcodes State (Captain Only)
  const [passcodes, setPasscodes] = useState<AcademyPasscodes>(() => StorageService.getAcademyPasscodes());
  const [newCaptainCode, setNewCaptainCode] = useState(passcodes.captainCode);
  const [newPlayerCode, setNewPlayerCode] = useState(passcodes.playerCode);
  const [showCaptainCode, setShowCaptainCode] = useState(false);
  const [showPlayerCode, setShowPlayerCode] = useState(false);
  const [passcodeSuccessMessage, setPasscodeSuccessMessage] = useState('');

  // 3. Notification Settings State
  const [notifSettings, setNotifSettings] = useState<UserNotificationSettings>(() =>
    StorageService.getNotificationSettings()
  );
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);

  // 4. Player Note to Admin State
  const [noteContent, setNoteContent] = useState('');
  const [isNoteSubmittedToday, setIsNoteSubmittedToday] = useState(false);
  const [existingTodayNote, setExistingTodayNote] = useState<PlayerPrivateNote | null>(null);
  const [playerNotes, setPlayerNotes] = useState<PlayerPrivateNote[]>([]);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState('');

  // 5. Banned Users State (Captain Only)
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [banName, setBanName] = useState('');
  const [banPhone, setBanPhone] = useState('');
  const [banReason, setBanReason] = useState('حساب غير منتمي لأكاديمية بايبوخت الرياضية');
  const [registeredPlayers, setRegisteredPlayers] = useState<PlayerRecord[]>([]);
  const [banSuccessMsg, setBanSuccessMsg] = useState('');

  // Real Deletion & Ban in Settings States
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [playerToDeleteInSettings, setPlayerToDeleteInSettings] = useState<PlayerRecord | null>(null);
  const [playerToBanInSettings, setPlayerToBanInSettings] = useState<PlayerRecord | null>(null);
  const [realDeleteFeedback, setRealDeleteFeedback] = useState<string | null>(null);

  // 6. Login Audit Logs State (Captain Only)
  const [auditLogs, setAuditLogs] = useState<LoginAuditRecord[]>([]);

  // 7. Backup & Restore State
  const [backupFeedback, setBackupFeedback] = useState('');

  // 8. Logout modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 9. Public Web App URL & Sharing State
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [show403Troubleshoot, setShow403Troubleshoot] = useState(false);
  const [urlSuccessMsg, setUrlSuccessMsg] = useState('');

  // Live Cloud Run Public App URL
  const defaultPublicUrl =
    typeof window !== 'undefined' &&
    window.location.origin &&
    !window.location.origin.includes('localhost') &&
    !window.location.origin.includes('127.0.0.1')
      ? window.location.origin
      : 'https://ais-pre-i2pqleowajqbsdpe3k3uk3-647524489010.europe-west1.run.app';

  const savedCustomUrl = StorageService.getCustomPublicUrl();
  const publicAppUrl = savedCustomUrl || defaultPublicUrl;

  const handleSaveCustomUrl = (e: FormEvent) => {
    e.preventDefault();
    const clean = customUrlInput.trim();
    StorageService.setCustomPublicUrl(clean);
    setIsEditingUrl(false);
    setUrlSuccessMsg(
      clean
        ? 'تم حفظ وتثبيت الرابط العام المنشور بنجاح! سيتم استخدامه في رمز الـ QR وكافة أزرار المشاركة'
        : 'تمت استعادة الرابط الافتراضي للتطبيق'
    );
    setTimeout(() => setUrlSuccessMsg(''), 5000);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicAppUrl);
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = publicAppUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'أكاديمية بايبوخت الرياضية (B.A.T)',
          text: 'رابط تطبيق أكاديمية بايبوخت الرياضية الرسمي بإشراف الكابتن زيد محمد خرشيد - إدارة اللاعبين والمباريات والتمارين والتبليغات والمراسلة:',
          url: publicAppUrl,
        });
      } catch {
        // Ignored
      }
    } else {
      handleCopyLink();
    }
  };

  // Initial Load & Refresh
  const reloadData = () => {
    setPasscodes(StorageService.getAcademyPasscodes());
    setNotifSettings(StorageService.getNotificationSettings());
    setThemeMode(StorageService.getThemeMode());
    setCustomUrlInput(StorageService.getCustomPublicUrl() || defaultPublicUrl);
    setAnnouncements(StorageService.getAnnouncements());

    if (isCaptain) {
      setPlayerNotes(StorageService.getPlayerNotes());
      setBannedUsers(StorageService.getBannedUsers());
      setAuditLogs(StorageService.getLoginAuditLogs());
      setRegisteredPlayers(StorageService.getPlayers());
    } else {
      const submitted = StorageService.hasPlayerSubmittedNoteToday(session.id, session.name);
      setIsNoteSubmittedToday(submitted);
      if (submitted) {
        const todayStr = new Date().toISOString().split('T')[0];
        const allNotes = StorageService.getPlayerNotes();
        const found = allNotes.find(
          (n) =>
            (n.playerId === session.id ||
              n.playerName.trim().toLowerCase() === session.name.trim().toLowerCase()) &&
            n.dateStr === todayStr
        );
        setExistingTodayNote(found || null);
      }
    }
  };

  useEffect(() => {
    reloadData();

    const handleStorageChange = () => reloadData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bat_academy_event', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bat_academy_event', handleStorageChange);
    };
  }, [session, isCaptain]);

  // Theme switch handler
  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    StorageService.setThemeMode(mode);
    setThemeFeedback(
      mode === 'light'
        ? 'تم تفعيل الوضع الفاتح مع الحفاظ على هوية وألوان الأكاديمية'
        : mode === 'dark'
        ? 'تم تفعيل الوضع الداكن الفاخر لأكاديمية بايبوخت'
        : 'تم ضبط المظهر تلقائياً ليتوافق مع نظام جهازك'
    );
    setTimeout(() => setThemeFeedback(''), 4000);
  };

  // Update Passcodes Handler
  const handleUpdatePasscodes = (e: FormEvent) => {
    e.preventDefault();
    if (!newCaptainCode.trim() || !newPlayerCode.trim()) return;

    StorageService.setAcademyPasscodes({
      captainCode: newCaptainCode.trim(),
      playerCode: newPlayerCode.trim(),
    });
    setPasscodes({
      captainCode: newCaptainCode.trim(),
      playerCode: newPlayerCode.trim(),
    });
    setPasscodeSuccessMessage('تم تحديث كود المسؤول وكود اللاعبين بنجاح!');
    setTimeout(() => setPasscodeSuccessMessage(''), 3500);
  };

  // Notification settings change
  const handleToggleNotifications = (enabled: boolean) => {
    const updated = { ...notifSettings, enabled };
    setNotifSettings(updated);
    StorageService.saveNotificationSettings(updated);
  };

  const handleSelectRingtone = (ringtone: NotificationRingtone) => {
    const updated = { ...notifSettings, ringtone };
    setNotifSettings(updated);
    StorageService.saveNotificationSettings(updated);
    previewRingtone(ringtone);
  };

  const previewRingtone = (tone: NotificationRingtone) => {
    setIsPlayingTestSound(true);
    soundService.playRingtone(tone);
    setTimeout(() => setIsPlayingTestSound(false), 800);
  };

  // Send Note Handler (Player -> Captain)
  const handleSendPlayerNote = (e: FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newNote: PlayerPrivateNote = {
      id: 'note-' + Date.now(),
      playerId: session.id,
      playerName: session.name,
      playerPhone: session.phone,
      playerAgeGroup: session.ageGroup,
      note: noteContent.trim(),
      createdAt: Date.now(),
      dateStr: todayStr,
      readByCaptain: false,
    };

    StorageService.savePlayerNote(newNote);
    setIsNoteSubmittedToday(true);
    setExistingTodayNote(newNote);
    setNoteContent('');
    setNoteSuccessMsg('تم إرسال ملاحظتك الخاصة إلى الكابتن زيد بنجاح.');
    setTimeout(() => setNoteSuccessMsg(''), 5000);
  };

  // Delete Note Handler (Captain)
  const handleDeleteNote = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      StorageService.deletePlayerNote(id);
      setPlayerNotes(StorageService.getPlayerNotes());
    }
  };

  // Ban User Handler (Captain)
  const handleBanUser = (e: FormEvent) => {
    e.preventDefault();
    if (!banName.trim()) return;

    StorageService.banUser({
      name: banName.trim(),
      phone: banPhone.trim() || undefined,
      reason: banReason.trim() || 'حساب غير منتمي لأكاديمية بايبوخت الرياضية',
    });

    setBannedUsers(StorageService.getBannedUsers());
    setRegisteredPlayers(StorageService.getPlayers());
    setBanName('');
    setBanPhone('');
    setBanSuccessMsg('تم حظر المستخدم بنجاح ومنعه من تسجيل الدخول.');
    setTimeout(() => setBanSuccessMsg(''), 3500);
  };

  const handleUnbanUser = (id: string, name: string) => {
    if (confirm(`هل تريد إلغاء حظر "${name}" والسماح له بالدخول؟`)) {
      StorageService.unbanUser(id);
      setBannedUsers(StorageService.getBannedUsers());
    }
  };

  // Real Delete Announcement Handler
  const handleConfirmRealDeleteAnnouncement = () => {
    if (!announcementToDelete) return;
    const title = announcementToDelete.title;
    StorageService.deleteAnnouncement(announcementToDelete.id);
    setAnnouncements(StorageService.getAnnouncements());
    setAnnouncementToDelete(null);
    setRealDeleteFeedback(`تم الحذف الحقيقي والنهائي للتبليغ "${title}" فوراً من قاعدة البيانات والتطبيق.`);
    setTimeout(() => setRealDeleteFeedback(null), 5000);
  };

  // Real Delete Player Handler in Settings
  const handleConfirmRealDeletePlayerInSettings = () => {
    if (!playerToDeleteInSettings) return;
    const name = playerToDeleteInSettings.name;
    StorageService.deletePlayer(playerToDeleteInSettings.id);
    setRegisteredPlayers(StorageService.getPlayers());
    setPlayerToDeleteInSettings(null);
    setRealDeleteFeedback(`تم الحذف الفعلي والنهائي للاعب (${name}) ومسح كافة بياناته وإنهاء أي جلسة نشطة له.`);
    setTimeout(() => setRealDeleteFeedback(null), 5000);
  };

  // Real Ban Player Handler in Settings
  const handleConfirmRealBanPlayerInSettings = () => {
    if (!playerToBanInSettings) return;
    const name = playerToBanInSettings.name;
    StorageService.banUser({
      id: playerToBanInSettings.id,
      name: playerToBanInSettings.name,
      phone: playerToBanInSettings.phone,
      reason: 'حظر مباشر من إدارة المستخدمين في الإعدادات',
    });
    setRegisteredPlayers(StorageService.getPlayers());
    setBannedUsers(StorageService.getBannedUsers());
    setPlayerToBanInSettings(null);
    setRealDeleteFeedback(`تم الحظر الفعلي للمستخدم (${name}) وطرده فوراً من التطبيق وإلغاء حسابه.`);
    setTimeout(() => setRealDeleteFeedback(null), 5000);
  };

  // Clear Audit Logs Handler (Captain)
  const handleClearAuditLogs = () => {
    if (confirm('هل أنت متأكد من مسح سجل تسجيلات الدخول؟')) {
      StorageService.clearLoginAuditLogs();
      setAuditLogs([]);
    }
  };

  // Export Backup File
  const handleExportBackup = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        version: '2.5',
        passcodes: StorageService.getAcademyPasscodes(),
        players: StorageService.getPlayers(),
        exercises: StorageService.getExercises(),
        announcements: StorageService.getAnnouncements(),
        matches: StorageService.getMatches(),
        topScorers: StorageService.getTopScorers(),
        playerNotes: StorageService.getPlayerNotes(),
        bannedUsers: StorageService.getBannedUsers(),
        notificationSettings: StorageService.getNotificationSettings(),
        themeMode: StorageService.getThemeMode(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bat-academy-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupFeedback('تم تحميل ملف النسخة الاحتياطية بنجاح على جهازك!');
      setTimeout(() => setBackupFeedback(''), 4000);
    } catch {
      setBackupFeedback('حدث خطأ أثناء تصدير النسخة الاحتياطية.');
    }
  };

  const ringtonesList: { id: NotificationRingtone; label: string; desc: string }[] = [
    { id: 'whistle', label: 'صفارة الحكم ⚽', desc: 'نغمة صفارة كروية احترافية ثنائية التردد' },
    { id: 'stadium', label: 'هتاف الملعب 🏟️', desc: 'لحن تصاعدي احتفالي للأهداف والمباريات' },
    { id: 'bell', label: 'جرس الأكاديمية 🔔', desc: 'رنين معدني نقي للتبليغات والتمارين' },
    { id: 'pop', label: 'نقرة خفيفة 💬', desc: 'تنبيه هادئ وسريع للرسائل والدردشة' },
    { id: 'arena', label: 'أرينا بايبوخت 🏆', desc: 'نغمة رسمية خاصة ببطولات ومباريات الأكاديمية' },
  ];

  const getRingtoneLabel = (tone: NotificationRingtone) => {
    const found = ringtonesList.find((r) => r.id === tone);
    return found ? found.label : 'صفارة الحكم';
  };

  // -------------------------------------------------------------
  // List of Main Vertical Settings Items (Exactly as requested)
  // -------------------------------------------------------------
  const settingsItems = [
    {
      id: 'notifications' as SettingsSection,
      title: 'الإشعارات',
      description: notifSettings.enabled
        ? `مفعلة • نغمة: ${getRingtoneLabel(notifSettings.ringtone)}`
        : 'الإشعارات معطلة حالياً',
      icon: Bell,
      color: 'amber',
      badge: notifSettings.enabled ? 'مفعلة' : 'متوقفة',
    },
    {
      id: 'announcements' as SettingsSection,
      title: 'التبليغات',
      description: 'نظام التبليغات العاجلة وسياسة الـ 24 ساعة التلقائية',
      icon: Radio,
      color: 'emerald',
      badge: 'التعميمات',
    },
    {
      id: 'bans' as SettingsSection,
      title: 'الحظر',
      description: isCaptain
        ? `${bannedUsers.length} مستخدم محظور • حظر الحسابات غير المصرح بها`
        : 'سياسة حظر الحسابات غير المنتمية للأكاديمية',
      icon: UserX,
      color: 'red',
      badge: isCaptain && bannedUsers.length > 0 ? `${bannedUsers.length} محظور` : undefined,
    },
    {
      id: 'player_notes' as SettingsSection,
      title: 'ملاحظات اللاعبين',
      description: isCaptain
        ? `${playerNotes.length} ملاحظة واردة من اللاعبين`
        : isNoteSubmittedToday
        ? 'تم إرسال ملاحظتك لليوم بنجاح ✓'
        : 'إرسال ملاحظة خاصة للكابتن زيد (رسالة واحدة يومياً)',
      icon: MessageSquare,
      color: 'blue',
      badge: isCaptain && playerNotes.length > 0 ? `${playerNotes.length} جديدة` : undefined,
    },
    {
      id: 'user_management' as SettingsSection,
      title: 'إدارة المستخدمين',
      description: isCaptain
        ? `${registeredPlayers.length} لاعب مسجل • سجل الدخول والمصادقة`
        : 'بيانات حساب اللاعب الجاري وتاريخ التسجيل',
      icon: User,
      color: 'indigo',
      badge: isCaptain ? `${registeredPlayers.length} لاعب` : undefined,
    },
    {
      id: 'permissions' as SettingsSection,
      title: 'صلاحيات المستخدمين',
      description: isCaptain
        ? 'صلاحيات الكابتن (إدارة كاملة، تحكم بالأكواد والدردشة)'
        : 'صلاحيات اللاعب (استعراض، مشاركة في الدردشة، وملاحظة يومية)',
      icon: ShieldCheck,
      color: 'purple',
      badge: isCaptain ? 'المسؤول' : 'لاعب',
    },
    {
      id: 'academy_info' as SettingsSection,
      title: 'معلومات الأكاديمية',
      description: 'أكاديمية بايبوخت الرياضية • تأسست 2015 • بإشراف الكابتن زيد',
      icon: Info,
      color: 'amber',
      badge: 'B.A.T',
    },
    {
      id: 'academy_logo' as SettingsSection,
      title: 'شعار الأكاديمية',
      description: 'الشعار الرسمي وهوية الأكاديمية البصرية (الأسود والذهبي والأخضر)',
      icon: Sparkles,
      color: 'yellow',
      badge: 'الهوية',
    },
    {
      id: 'language' as SettingsSection,
      title: 'اللغة',
      description: 'اللغة العربية (العراق) • الافتراضية 🇮🇶',
      icon: Globe,
      color: 'teal',
      badge: 'العربية',
    },
    {
      id: 'passcode_update' as SettingsSection,
      title: 'تحديث الكود ( عند المسؤول فقط )',
      description: isCaptain
        ? 'تغيير كود دخول المسؤول وكود دخول اللاعبين'
        : 'خاص بالكابتن زيد محمد خرشيد فقط',
      icon: KeyRound,
      color: 'amber',
      badge: isCaptain ? 'للمسؤول' : 'مقفل 🔒',
    },
    {
      id: 'appearance' as SettingsSection,
      title: 'المظهر',
      description: 'تخصيص الهوية البصرية، وضوح الشاشة، وألوان الملعب',
      icon: Palette,
      color: 'fuchsia',
      badge: 'الألوان',
    },
    {
      id: 'dark_mode' as SettingsSection,
      title: 'الوضع الداكن',
      description:
        themeMode === 'light'
          ? 'الوضع الفاتح ☀️'
          : themeMode === 'dark'
          ? 'الوضع الداكن 🌙'
          : 'تلقائي حسب الجهاز ⚙️',
      icon: Moon,
      color: 'violet',
      badge: themeMode === 'light' ? 'فاتح' : themeMode === 'dark' ? 'داكن' : 'تلقائي',
    },
    {
      id: 'backup' as SettingsSection,
      title: 'النسخ الاحتياطي',
      description: 'تصدير وحفظ بيانات الأكاديمية في ملف آمن',
      icon: Database,
      color: 'cyan',
      badge: 'البيانات',
    },
    {
      id: 'about' as SettingsSection,
      title: 'حول التطبيق',
      description: 'الإصدار 2.5 • الرابط العام، رمز الـ QR، وتثبيت التطبيق PWA',
      icon: Smartphone,
      color: 'emerald',
      badge: 'v2.5',
    },
  ];

  // Helper color classes for icons
  const getIconColorClass = (color: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'red':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'blue':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'indigo':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'teal':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'yellow':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'fuchsia':
        return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30';
      case 'violet':
        return 'bg-violet-500/15 text-violet-400 border-violet-500/30';
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  // -------------------------------------------------------------
  // RENDER: Subview Header (Back button + Title)
  // -------------------------------------------------------------
  const renderSubViewHeader = (title: string, subtitle: string, icon: any, color: string) => {
    const IconComponent = icon;
    return (
      <div className="bg-[#0E1510] border border-amber-500/20 rounded-3xl p-4 sm:p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            type="button"
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 hover:text-amber-200 border border-white/10 text-xs font-bold transition-all group"
          >
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>العودة للإعدادات</span>
          </button>

          <span className="text-[11px] font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            أكاديمية بايبوخت (B.A.T)
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${getIconColorClass(
              color
            )}`}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto text-right" dir="rtl">
      {/* Real Deletion / Ban Feedback Toast */}
      {realDeleteFeedback && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-center gap-3 shadow-lg shadow-red-950/40 animate-in fade-in slide-in-from-top-2">
          <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-bold">{realDeleteFeedback}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. MAIN VERTICAL SETTINGS LIST (when activeSection === null) */}
      {/* ============================================================ */}
      {activeSection === null && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner with Profile Summary */}
          <div className="bg-gradient-to-r from-[#141C15] via-[#1C281F] to-[#101712] border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1F2C21] to-[#0D150E] border-2 border-amber-400/50 p-0.5 shrink-0 shadow-lg overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="شعار أكاديمية بايبوخت"
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
                      <Settings className="w-4 h-4" />
                    </span>
                    <h1 className="text-xl font-black text-white">الإعدادات</h1>
                  </div>
                  <p className="text-xs text-gray-300">
                    أكاديمية بايبوخت الرياضية • حساب:{' '}
                    <strong className="text-amber-300">{session.name}</strong>
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-black px-3 py-1 rounded-xl border shrink-0 ${
                  isCaptain
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isCaptain ? 'الكابتن المسؤول 👑' : 'لاعب معتمد ⚽'}
              </span>
            </div>
          </div>

          {/* Clean Vertical Items List */}
          <div className="space-y-2.5">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const colorClass = getIconColorClass(item.color);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className="w-full group flex items-center justify-between p-3.5 sm:p-4 bg-[#0E1510] hover:bg-[#141F17] border border-white/5 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm active:scale-[0.99] text-right"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5 group-hover:text-gray-300 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 mr-2">
                    {item.badge && (
                      <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 hidden sm:inline-block">
                        {item.badge}
                      </span>
                    )}
                    <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Profile Card & Sign Out */}
          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {session.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{session.name}</h4>
                  <span className="text-[11px] text-gray-400">
                    {session.phone || (isCaptain ? 'الكابتن المسؤول' : 'رقم القميص: ' + (session.jerseyNumber || '-'))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SUBVIEW: الإشعارات                                      */}
      {/* ============================================================ */}
      {activeSection === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'الإشعارات ونغمات التنبيه',
            'التحكم في وصول الإشعارات واختيار النغمة المناسبة لهاتفك',
            Bell,
            'amber'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-[#080C0A] rounded-2xl border border-white/5">
              <div>
                <span className="text-sm font-bold text-white block">حالة الإشعارات العامة</span>
                <span className="text-xs text-gray-400">
                  {notifSettings.enabled ? 'الإشعارات مفعلة وتستقبل التنبيهات' : 'الإشعارات متوقفة حالياً'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNotifications(!notifSettings.enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.enabled ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black shadow transform transition-transform ${
                    notifSettings.enabled ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Ringtone selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-200">
                اختر نغمة التنبيه المعتمدة الخاصة بك:
              </label>

              <div className="space-y-2.5">
                {ringtonesList.map((tone) => {
                  const isSelected = notifSettings.ringtone === tone.id;

                  return (
                    <div
                      key={tone.id}
                      onClick={() => handleSelectRingtone(tone.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 shadow-md'
                          : 'bg-[#080C0A] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-white block">{tone.label}</span>
                          <span className="text-[11px] text-gray-400">{tone.desc}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          previewRingtone(tone.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all border border-white/10 shrink-0"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>تجربة</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FCM Browser Permission Button */}
            {onRequestNotificationPermission && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080C0A] p-4 rounded-2xl border border-white/5">
                <div className="text-xs text-gray-300">
                  <strong className="text-amber-300 block mb-0.5">إشعارات هاتف اللاعب (FCM Push)</strong>
                  تأكد من تفعيل إذن الإشعارات في متصفحك لاستلام مواعيد التمارين والتبليغات حتى والتطبيق مغلق.
                </div>
                <button
                  type="button"
                  onClick={onRequestNotificationPermission}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs shadow shrink-0"
                >
                  فحص وتفعيل صلاحية الهاتف
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. SUBVIEW: التبليغات                                       */}
      {/* ============================================================ */}
      {activeSection === 'announcements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'نظام التبليغات والتعميمات',
            'إدارة التبليغات الرسمية وسياسة الإلغاء التلقائي بعد 24 ساعة',
            Radio,
            'emerald'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="bg-[#080C0A] border border-emerald-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>سياسة صلاحية التبليغ (24 ساعة):</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                وفق تعليمات الكابتن زيد محمد خرشيد، التبليغات والتعميمات العاجلة صالحة لمدة 24 ساعة فقط من وقت نشرها، وتختفي تلقائياً لضمان بقاء لوحة الإعلانات مرتبة وحديثة بدون أي معلومات قديمة أو مكررة.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-gray-300">أنواع التبليغات المعتمدة في الأكاديمية:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="text-white font-bold">عاجل:</span>
                  <span className="text-gray-400">مواعيد التجمع والبطولات الهامة</span>
                </div>
                <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-white font-bold">تمارين:</span>
                  <span className="text-gray-400">مواعيد التدريبات وجدول الحضور</span>
                </div>
                <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span className="text-white font-bold">مباريات:</span>
                  <span className="text-gray-400">التشكيلة والمباريات الودية والرسمية</span>
                </div>
                <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="text-white font-bold">استشفاء وتغذية:</span>
                  <span className="text-gray-400">تعليمات النوم والاستشفاء العضلي</span>
                </div>
              </div>
            </div>

            {/* Active Announcements List & Real Delete (Captain & Players) */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>التبليغات الحالية النشطة ({announcements.length})</span>
                </h4>
                {isCaptain && announcements.length > 0 && (
                  <span className="text-[10px] text-red-400 font-bold">
                    🗑️ الحذف هنا يحذف التبليغ نهائياً فوراً
                  </span>
                )}
              </div>

              {announcements.length === 0 ? (
                <div className="bg-[#080C0A] p-5 rounded-2xl text-center text-xs text-gray-500 border border-white/5">
                  لا توجد أي تبليغات نشطة في هذه اللحظة.
                </div>
              ) : (
                <div className="space-y-2">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-[#080C0A] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-3.5 flex items-start justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{ann.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                            {ann.type === 'urgent' ? 'عاجل' : ann.type === 'match' ? 'مباراة' : ann.type === 'training' ? 'تمرين' : 'تعميم'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{ann.content}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1">
                          <span>بواسطة: {ann.author}</span>
                          <span>•</span>
                          <span>الوقت: {ann.timestamp}</span>
                        </div>
                      </div>

                      {isCaptain && (
                        <button
                          type="button"
                          onClick={() => setAnnouncementToDelete(ann)}
                          className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                          title="حذف حقيقي نهائي للتبليغ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف حقيقي</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. SUBVIEW: الحظر                                          */}
      {/* ============================================================ */}
      {activeSection === 'bans' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'نظام الحظر والأمان',
            'منع الحسابات غير المنتمية للأكاديمية وحظر الغرباء',
            UserX,
            'red'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {isCaptain ? (
              <>
                <div className="bg-[#080C0A] border border-red-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>حظر مستخدم غير مصرح به:</span>
                  </div>

                  {banSuccessMsg && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{banSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleBanUser} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">الاسم *</label>
                        <input
                          type="text"
                          required
                          value={banName}
                          onChange={(e) => setBanName(e.target.value)}
                          placeholder="الاسم المسجل"
                          className="w-full bg-[#101713] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">الهاتف (اختياري)</label>
                        <input
                          type="text"
                          value={banPhone}
                          onChange={(e) => setBanPhone(e.target.value)}
                          placeholder="رقم الهاتف"
                          className="w-full bg-[#101713] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 dir-ltr text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">السبب</label>
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="غير منتمي للأكاديمية"
                          className="w-full bg-[#101713] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>تأكيد الحظر</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Banned Users List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-300">
                    قائمة الحسابات المحظورة ({bannedUsers.length})
                  </h4>

                  {bannedUsers.length === 0 ? (
                    <div className="bg-[#080C0A] p-6 rounded-2xl text-center text-xs text-gray-500 border border-white/5">
                      لا يوجد أي مستخدمين محظورين حالياً.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {bannedUsers.map((b) => (
                        <div
                          key={b.id}
                          className="bg-[#080C0A] border border-red-500/20 rounded-xl p-3 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-white text-xs block">{b.name}</span>
                            <span className="text-[11px] text-gray-400">{b.reason}</span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">
                              بتاريخ: {b.bannedDate}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUnbanUser(b.id, b.name)}
                            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all shrink-0"
                          >
                            إلغاء الحظر
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-6 text-center text-xs text-gray-300 space-y-2">
                <Shield className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">سياسة الأمان الصارمة لأكاديمية بايبوخت</h4>
                <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
                  التطبيق مخصص حصراً للاعبي وكادر أكاديمية بايبوخت الرياضية. في حال تسجيل أي شخص من خارج الأكاديمية أو محاولة العبث، يتم حظر الجهاز تلقائياً من قبل الكابتن زيد.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. SUBVIEW: ملاحظات اللاعبين                               */}
      {/* ============================================================ */}
      {activeSection === 'player_notes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'ملاحظات واستفسارات اللاعبين',
            isCaptain
              ? 'مراجعة الملاحظات والاستفسارات السرية المرسلة من اللاعبين'
              : 'إرسال ملاحظة أو استفسار سري إلى الكابتن زيد (رسالة واحدة يومياً)',
            MessageSquare,
            'blue'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {isCaptain ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">
                    الوارد من اللاعبين ({playerNotes.length}):
                  </span>
                </div>

                {playerNotes.length === 0 ? (
                  <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-8 text-center text-gray-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-semibold">لا توجد ملاحظات مرسلة من اللاعبين حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playerNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-[#080C0A] border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-xs sm:text-sm">{note.playerName}</span>
                            {note.playerAgeGroup && (
                              <span className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded-full border border-white/10">
                                {note.playerAgeGroup}
                              </span>
                            )}
                            {note.playerPhone && (
                              <a
                                href={`tel:${note.playerPhone}`}
                                className="text-[10px] text-emerald-400 hover:underline dir-ltr"
                              >
                                {note.playerPhone}
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>{note.dateStr}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                              title="حذف الملاحظة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line bg-[#0E1510] p-3 rounded-xl border border-white/5">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {noteSuccessMsg && (
                  <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{noteSuccessMsg}</span>
                  </div>
                )}

                {isNoteSubmittedToday ? (
                  <div className="bg-[#080C0A] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>لقد أرسلت ملاحظتك المخصصة لليوم بنجاح إلى الكابتن زيد!</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      وفق نظام الأكاديمية، يُسمح برسالة واحدة يومياً لكل لاعب. يمكنك إرسال رسالة جديدة غداً إن شاء الله.
                    </p>
                    {existingTodayNote && (
                      <div className="bg-[#101713] p-3 rounded-xl border border-white/5 text-xs text-gray-300 mt-2">
                        <span className="font-bold text-amber-400 block mb-1 text-[11px]">
                          نص رسالتك المرسلة اليوم:
                        </span>
                        <p className="whitespace-pre-line leading-relaxed">{existingTodayNote.note}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSendPlayerNote} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        اكتب ملاحظتك أو استفسارك للكابتن زيد *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="مثال: كابتن لدي استفسار بخصوص تمرين الغد، أو حالتي البدنية..."
                        className="w-full bg-[#080C0A] border border-white/10 focus:border-amber-400 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-amber-400/80 font-medium">
                        🔒 سرية ومحفوظة للكابتن زيد حصراً
                      </span>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال الملاحظة</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. SUBVIEW: إدارة المستخدمين                                */}
      {/* ============================================================ */}
      {activeSection === 'user_management' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'إدارة المستخدمين وسجل الدخول',
            'متابعة الحسابات النشطة، اللاعبين المسجلين، وسجل الحضور اليومي',
            User,
            'indigo'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-[#080C0A] p-3.5 rounded-2xl border border-white/5 text-center">
                <span className="text-xl font-black text-amber-400 block">{registeredPlayers.length}</span>
                <span className="text-[11px] text-gray-400">لاعب مسجل</span>
              </div>
              <div className="bg-[#080C0A] p-3.5 rounded-2xl border border-white/5 text-center">
                <span className="text-xl font-black text-emerald-400 block">{auditLogs.length}</span>
                <span className="text-[11px] text-gray-400">عملية دخول مسجلة</span>
              </div>
              <div className="bg-[#080C0A] p-3.5 rounded-2xl border border-white/5 text-center col-span-2 sm:col-span-1">
                <span className="text-xl font-black text-blue-400 block">100%</span>
                <span className="text-[11px] text-gray-400">أمان الجلسات الدائمة</span>
              </div>
            </div>

            {/* Registered Players List & Real Deletion/Banning (Captain Only) */}
            {isCaptain && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>قائمة اللاعبين المسجلين ({registeredPlayers.length})</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    إجراءات فورية حقيقية ⚡
                  </span>
                </div>

                {registeredPlayers.length === 0 ? (
                  <div className="bg-[#080C0A] p-5 rounded-2xl text-center text-xs text-gray-500 border border-white/5">
                    لا يوجد لاعبين مسجلين في الكشف حالياً.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {registeredPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="bg-[#080C0A] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-10 h-10 rounded-xl object-cover border border-amber-400/40 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                              #{player.jerseyNumber}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate">{player.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {player.position} • {player.phone || 'بدون هاتف'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPlayerToBanInSettings(player)}
                            className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 hover:text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="حظر حقيقي وطرد من التطبيق"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>حظر حقيقي</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlayerToDeleteInSettings(player)}
                            className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="حذف حقيقي نهائي للاعب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف حقيقي</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Login Audit Logs (Captain Only) */}
            {isCaptain && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>سجل تسجيلات الدخول الحديثة</span>
                  </span>
                  {auditLogs.length > 0 && (
                    <button
                      onClick={handleClearAuditLogs}
                      className="text-[11px] text-red-400 hover:underline"
                    >
                      مسح السجل
                    </button>
                  )}
                </div>

                {auditLogs.length === 0 ? (
                  <div className="bg-[#080C0A] p-6 rounded-2xl text-center text-xs text-gray-500 border border-white/5">
                    لا توجد تسجيلات دخول مسجلة حالياً.
                  </div>
                ) : (
                  <div className="bg-[#080C0A] border border-white/5 rounded-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-white/5">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 hover:bg-white/[0.02] flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                              log.role === 'captain'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {log.role === 'captain' ? 'C' : 'P'}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{log.userName}</span>
                            <span className="text-[10px] text-gray-400">{log.methodLabel}</span>
                          </div>
                        </div>

                        <div className="text-left text-[10px] text-gray-500 font-mono">
                          <div>{log.timeFormatted}</div>
                          <div>{log.dateFormatted}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. SUBVIEW: صلاحيات المستخدمين                             */}
      {/* ============================================================ */}
      {activeSection === 'permissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'صلاحيات المستخدمين والأمان',
            'تفاصيل أدوار الكابتن المسؤول واللاعبين المعتمدين في النظام',
            ShieldCheck,
            'purple'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
            {/* Captain Permissions */}
            <div className="bg-[#080C0A] border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>صلاحيات الكابتن (المسؤول الأعلى):</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside leading-relaxed pr-1">
                <li>إضافة وتعديل وحذف اللاعبين وبياناتهم الشخصية</li>
                <li>تحديد التقييم اليومي وتكريم لاعب الأسبوع</li>
                <li>تحديث كود دخول المسؤول وكود دخول اللاعبين</li>
                <li>قفل وفتح الدردشة وإدارة الرسائل وتثبيتها</li>
                <li>إرسال الإشعارات الفورية (Push) لهواتف اللاعبين</li>
                <li>حظر الحسابات غير المصرح بها وإدارتها</li>
              </ul>
            </div>

            {/* Player Permissions */}
            <div className="bg-[#080C0A] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <User className="w-4 h-4" />
                <span>صلاحيات اللاعبين (أعضاء الأكاديمية):</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside leading-relaxed pr-1">
                <li>تسجيل الدخول الدائم بكود الأكاديمية العام</li>
                <li>الاطلاع على جدول التمارين والمباريات وقائمة الهدافين</li>
                <li>متابعة التقييم اليومي الفردي الصادر من الكابتن</li>
                <li>المشاركة في الدردشة الجماعية عند فتحها</li>
                <li>إرسال ملاحظة خاصة وسرية واحدة يومياً للمسؤول</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. SUBVIEW: معلومات الأكاديمية                               */}
      {/* ============================================================ */}
      {activeSection === 'academy_info' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'معلومات أكاديمية بايبوخت (B.A.T)',
            'نبذة عن التأسيس، الكادر التدريبي، وأرقام وقنوات التواصل الرسمية',
            Info,
            'amber'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-4 space-y-2 text-xs text-gray-300 leading-relaxed">
              <span className="text-amber-400 font-bold block text-sm mb-1">
                أكاديمية بايبوخت الرياضية لكرة القدم (B.A.T Academy)
              </span>
              تأسست الأكاديمية عام <strong className="text-white font-mono">2015</strong> في منطقة بايبوخت بمحافظة نينوى، بإشراف وتدريب الكابتن <strong className="text-white">زيد محمد خرشيد</strong>، وتهدف لصقل المواهب الكروية الشابة وتأهيل اللاعبين على أعلى المستويات الفنية والبدنية والتربوية.
            </div>

            {/* Official Social Links */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-gray-300 block">
                قنوات التواصل والمجموعات الرسمية:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#080C0A] hover:bg-white/[0.04] border border-white/5 hover:border-amber-500/30 rounded-xl flex items-center justify-between text-xs transition-all"
                  >
                    <div>
                      <span className="font-bold text-white block">{link.title}</span>
                      <span className="text-[10px] text-gray-400">{link.description}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. SUBVIEW: شعار الأكاديمية                                  */}
      {/* ============================================================ */}
      {activeSection === 'academy_logo' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'شعار وهوية أكاديمية بايبوخت',
            'الشعار الرسمي للـ B.A.T ودلالة الألوان الرياضية المعتمدة',
            Sparkles,
            'yellow'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-6 shadow-xl text-center">
            <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-[#1F2C21] to-[#0D150E] border-2 border-amber-400 p-1 shadow-2xl shadow-black/80 overflow-hidden">
              <img
                src="/logo.png"
                alt="شعار الأكاديمية الرسمي"
                className="w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <h3 className="text-base font-black text-white">B.A.T Academy Crest</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                شعار أكاديمية بايبوخت الرياضية يرمز للشجاعة والدقة والسرعة في المستطيل الأخضر.
              </p>
            </div>

            {/* Colors Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-right pt-2">
              <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5">
                <div className="w-4 h-4 rounded-full bg-black border border-white/20 mb-1"></div>
                <span className="text-xs font-bold text-white block">الأسود الملكي</span>
                <span className="text-[10px] text-gray-400">القوة والعزيمة</span>
              </div>
              <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5">
                <div className="w-4 h-4 rounded-full bg-amber-400 mb-1"></div>
                <span className="text-xs font-bold text-white block">الذهبي الأصيل</span>
                <span className="text-[10px] text-gray-400">الكؤوس والبطولات</span>
              </div>
              <div className="p-3 bg-[#080C0A] rounded-xl border border-white/5">
                <div className="w-4 h-4 rounded-full bg-emerald-500 mb-1"></div>
                <span className="text-xs font-bold text-white block">الأخضر العشبي</span>
                <span className="text-[10px] text-gray-400">أرضية الملعب</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10. SUBVIEW: اللغة                                          */}
      {/* ============================================================ */}
      {activeSection === 'language' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'اللغة واتجاه الواجهة',
            'اختيار لغة التطبيق والمصطلحات الرياضية المعتمدة',
            Globe,
            'teal'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="p-4 rounded-2xl border border-amber-400 bg-amber-500/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇮🇶</span>
                <div>
                  <span className="text-sm font-bold text-white block">العربية (العراق)</span>
                  <span className="text-xs text-gray-300">اللغة الرسمية المعتمدة للأكاديمية</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
                الافتراضية ✓
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-white/5 bg-[#080C0A] opacity-60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <span className="text-sm font-bold text-white block">English (Global)</span>
                  <span className="text-xs text-gray-400">قريباً في التحديث القادم</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">قيد التطوير</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 11. SUBVIEW: تحديث الكود ( عند المسؤول فقط )                */}
      {/* ============================================================ */}
      {activeSection === 'passcode_update' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'تحديث أكواد الدخول',
            'تحديث كود المسؤول وكود اللاعبين (خاص بالكابتن زيد فقط)',
            KeyRound,
            'amber'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {isCaptain ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed">
                  يمكنك هنا تغيير كود الدخول الخاص بك (كود المسؤول)، وكذلك تحديث كود الأكاديمية المخصص لدخول اللاعبين الجدد والحاليين. التعديل فوري ومستمر.
                </p>

                {passcodeSuccessMessage && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passcodeSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePasscodes} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Captain Code */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-200">
                        كود دخول المسؤول (الكابتن زيد)
                      </label>
                      <div className="relative">
                        <input
                          type={showCaptainCode ? 'text' : 'password'}
                          required
                          value={newCaptainCode}
                          onChange={(e) => setNewCaptainCode(e.target.value)}
                          placeholder="أدخل كود المسؤول الجديد"
                          className="w-full bg-[#101713] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCaptainCode(!showCaptainCode)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-1"
                        >
                          {showCaptainCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        الكود الحالي المحفوظ: <strong className="text-amber-400 font-mono">{passcodes.captainCode}</strong>
                      </span>
                    </div>

                    {/* Players Academy Code */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-200">
                        كود دخول اللاعبين (كود الأكاديمية العام)
                      </label>
                      <div className="relative">
                        <input
                          type={showPlayerCode ? 'text' : 'password'}
                          required
                          value={newPlayerCode}
                          onChange={(e) => setNewPlayerCode(e.target.value)}
                          placeholder="أدخل كود اللاعبين الجديد"
                          className="w-full bg-[#101713] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPlayerCode(!showPlayerCode)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-1"
                        >
                          {showPlayerCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        الكود الحالي للاعبين: <strong className="text-amber-400 font-mono">{passcodes.playerCode}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ وتحديث الأكواد الآن</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-8 text-center text-xs text-gray-400 space-y-2">
                <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">قسم مقيد للمسؤول فقط</h4>
                <p className="text-gray-400">
                  تحديث وتعديل كود الدخول متاح حصراً للكابتن زيد محمد خرشيد عبر حساب المسؤول.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 12. SUBVIEW: المظهر                                         */}
      {/* ============================================================ */}
      {activeSection === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'المظهر والهوية البصرية',
            'تخصيص العرض وألوان وهوية أكاديمية بايبوخت الرياضية',
            Palette,
            'fuchsia'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-4 text-xs text-gray-300 leading-relaxed">
              تم تصميم التطبيق وفق الهوية الرياضية الرسمية لأكاديمية بايبوخت، مع مراعاة أعلى درجات الوضوح والتباين لقراءة التمارين والمباريات سواء في وضح النهار بالملعب أو أثناء الليل.
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">إعدادات الوضع الداكن والفاتح</span>
                <span className="text-[11px] text-gray-300">التبديل بين الوضع الفاتح والداكن وتلقائي الجهاز</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('dark_mode')}
                className="px-3.5 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-xl"
              >
                فتح خيارات الوضع الداكن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 13. SUBVIEW: الوضع الداكن (الطلب المحدد بدقة)                 */}
      {/* ============================================================ */}
      {activeSection === 'dark_mode' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'الوضع الداكن والمظهر',
            'التبديل بين الوضع الفاتح، الوضع الداكن، وتلقائي حسب الجهاز',
            Moon,
            'violet'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {themeFeedback && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{themeFeedback}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Option 1: Light Mode */}
              <div
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  themeMode === 'light'
                    ? 'bg-amber-500/15 border-amber-400 shadow-md'
                    : 'bg-[#080C0A] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">الوضع الفاتح</span>
                    <span className="text-xs text-gray-400">
                      خلفية بيضاء نقية ومريحة للعين في النهار مع الحفاظ على الألوان الذهبية والخضراء
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    themeMode === 'light' ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'
                  }`}
                >
                  {themeMode === 'light' && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Option 2: Dark Mode */}
              <div
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  themeMode === 'dark'
                    ? 'bg-amber-500/15 border-amber-400 shadow-md'
                    : 'bg-[#080C0A] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/30">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">الوضع الداكن</span>
                    <span className="text-xs text-gray-400">
                      الوضع الليلي الفاخر المعتمد لأكاديمية بايبوخت (أسود، ذهبي، وأخضر عشبي)
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    themeMode === 'dark' ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'
                  }`}
                >
                  {themeMode === 'dark' && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Option 3: Auto Mode */}
              <div
                onClick={() => handleThemeChange('auto')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  themeMode === 'auto'
                    ? 'bg-amber-500/15 border-amber-400 shadow-md'
                    : 'bg-[#080C0A] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">تلقائي حسب الجهاز</span>
                    <span className="text-xs text-gray-400">
                      يتكيف المظهر تلقائياً وفق إعدادات نظام هاتفك أو جهازك (نهاري أو ليلي)
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    themeMode === 'auto' ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'
                  }`}
                >
                  {themeMode === 'auto' && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {/* Academy Identity Guarantee Badge */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>هوية أكاديمية بايبوخت محفوظة 100%:</strong> في جميع الأوضاع (الفاتح، الداكن، والتلقائي) تظل الألوان الرسمية والشعار والعلامات الذهبية والزمردية بارزة ومطابقة لهوية الأكاديمية.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 14. SUBVIEW: النسخ الاحتياطي                                */}
      {/* ============================================================ */}
      {activeSection === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'النسخ الاحتياطي وحفظ البيانات',
            'تصدير واسترجاع بيانات الأكاديمية واللاعبين والمباريات في ملف آمن',
            Database,
            'cyan'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {backupFeedback && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{backupFeedback}</span>
              </div>
            )}

            <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>تصدير نسخة احتياطية كاملة (JSON):</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                تحميل ملف يحتوي على كافة بيانات الأكاديمية: سجل اللاعبين، التمارين، التبليغات، المباريات، الهدافين، والملاحظات لحفظها بأمان على هاتفك أو حاسوبك.
              </p>

              <button
                type="button"
                onClick={handleExportBackup}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold rounded-xl text-xs shadow flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تحميل النسخة الاحتياطية الآن</span>
              </button>
            </div>

            {/* Simulation test */}
            <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-400">
                <strong className="text-white block mb-0.5">اختبار استقرار وثبات الجلسة</strong>
                محاكاة إغلاق التطبيق وإعادة تشغيله للتأكد من حفظ الجلسة الدائمة.
              </div>
              <button
                type="button"
                onClick={onSimulateRelaunch}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>محاكاة إعادة التشغيل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 15. SUBVIEW: حول التطبيق                                    */}
      {/* ============================================================ */}
      {activeSection === 'about' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {renderSubViewHeader(
            'حول التطبيق والرابط العام (PWA)',
            'إصدار التطبيق، مشاركة الرابط العام، رمز الـ QR، وحلول النشر',
            Smartphone,
            'emerald'
          )}

          <div className="bg-[#0E1510] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
            {/* Link Display Box */}
            <div className="bg-[#080C0A] border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex-1 bg-[#101713] border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2 overflow-hidden">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono text-amber-300 truncate select-all dir-ltr text-left">
                    {publicAppUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all ${
                      copiedLink
                        ? 'bg-emerald-500 text-black'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-black" />
                        <span>تم النسخ بنجاح! ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>

                  <a
                    href={publicAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                    <span>فتح</span>
                  </a>
                </div>
              </div>

              {copiedLink && (
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم نسخ الرابط العام إلى الحافظة بنجاح!</span>
                </div>
              )}
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `⚽ رابط تطبيق أكاديمية بايبوخت الرياضية (B.A.T) الرسمي على الإنترنت:\n${publicAppUrl}\n\nأهلاً بكم أبطال الأكاديمية! يمكنكم الدخول ومتابعة التمارين والتبليغات والمراسلة مباشرة.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] rounded-2xl text-xs font-black transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة عبر واتساب</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(publicAppUrl)}&text=${encodeURIComponent(
                  'تطبيق أكاديمية بايبوخت (B.A.T) الرياضية الرسمي'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-[#229ED9] rounded-2xl text-xs font-black transition-all"
              >
                <Send className="w-4 h-4" />
                <span>مشاركة عبر تليغرام</span>
              </a>

              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 p-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-black transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>مشاركة سريعة للهاتف</span>
              </button>
            </div>

            {/* QR Code Section */}
            <div className="bg-[#080C0A] border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-[#050806] p-2.5 rounded-2xl border border-amber-400/30 shadow-inner shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    publicAppUrl
                  )}&color=f59e0b&bgcolor=080c0a`}
                  alt="رمز استجابة سريعة للرابط العام"
                  className="w-32 h-32 rounded-xl object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-400 font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>مسح الرمز المباشر (QR Code) بكاميرا الهاتف</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  يمكن لأي لاعب أو ولي أمر توجيه كاميرا الهاتف نحو الرمز ليفتح التطبيق فوراً بدون كتابة الرابط.
                </p>
                <div className="text-[10px] text-gray-400">
                  📱 يعمل على كافة أجهزة iPhone و Android مع دعم التثبيت على الشاشة الرئيسية (PWA).
                </div>
              </div>
            </div>

            {/* Captain Public URL Editor */}
            {isCaptain && (
              <div className="bg-[#080C0A] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل وحفظ الرابط المنشور المعتمد (للكابتن فقط):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(!isEditingUrl)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    {isEditingUrl ? 'إلغاء التعديل' : 'تعديل الرابط'}
                  </button>
                </div>

                {isEditingUrl && (
                  <form onSubmit={handleSaveCustomUrl} className="space-y-2 pt-1">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://your-domain.com أو رابط النشر"
                      className="w-full bg-[#101713] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr text-left"
                      required
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
                      >
                        حفظ الرابط الجديد
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          StorageService.setCustomPublicUrl('');
                          setCustomUrlInput(defaultPublicUrl);
                          setIsEditingUrl(false);
                          setUrlSuccessMsg('تمت استعادة الرابط الافتراضي');
                          setTimeout(() => setUrlSuccessMsg(''), 4000);
                        }}
                        className="text-[11px] text-red-400 hover:underline"
                      >
                        استعادة الافتراضي
                      </button>
                    </div>
                  </form>
                )}

                {urlSuccessMsg && (
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{urlSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Logout Confirm Modal                                         */}
      {/* ============================================================ */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121A14] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">تأكيد تسجيل الخروج</h3>
              <p className="text-xs text-gray-400 mt-1">
                هل أنت متأكد من رغبتك بالخروج؟ يمكنك تسجيل الدخول لاحقاً بكود الأكاديمية وبياناتك المسجلة.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-red-950/40"
              >
                نعم، خروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Delete Announcement Confirmation Modal */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-red-400">تأكيد الحذف الفعلي للتبليغ</h3>
              <p className="text-xs text-gray-300">
                أنت على وشك حذف هذا التبليغ نهائياً من قاعدة بيانات الأكاديمية:
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-right space-y-1">
                <span className="text-xs font-black text-white block">{announcementToDelete.title}</span>
                <p className="text-[11px] text-gray-400 line-clamp-2">{announcementToDelete.content}</p>
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-[11px] text-red-300 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>حذف فعلي نهائي مباشر:</span>
              </p>
              <p className="text-[10.5px] text-gray-300 leading-relaxed">
                سيتم مسح هذا التبليغ فوراً ولن يظهر لأي لاعب في الصفحة الرئيسية أو الإعدادات أو الإشعارات.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRealDeleteAnnouncement}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف حقيقي نهائي</span>
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Delete Player in Settings Confirmation Modal */}
      {playerToDeleteInSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-red-400">تأكيد الحذف الحقيقي للاعب</h3>
              <p className="text-xs text-gray-300">
                سيتم حذف ملف هذا اللاعب بشكل حقيقي ودائم من كشف الأكاديمية:
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-black text-white">{playerToDeleteInSettings.name}</p>
                  <p className="text-[10px] text-gray-400">#{playerToDeleteInSettings.jerseyNumber} • {playerToDeleteInSettings.position}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-[11px] text-red-300 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>أثر الحذف الحقيقي:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] text-gray-300 leading-relaxed pr-1">
                <li>حذف اللاعب نهائياً من قاعدة البيانات.</li>
                <li>مسحه من قائمة الهدافين والإحصائيات.</li>
                <li>إنهاء أي جلسة دخول نشطة له على الفور.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRealDeletePlayerInSettings}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف حقيقي</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerToDeleteInSettings(null)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Ban Player in Settings Confirmation Modal */}
      {playerToBanInSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Ban className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-amber-400">تأكيد الحظر الحقيقي الفوري</h3>
              <p className="text-xs text-gray-300">
                سيتم حظر وطرد المستخدم التالي ومنعه التام من الدخول للتطبيق:
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-black text-white">{playerToBanInSettings.name}</p>
                  <p className="text-[10px] text-gray-400">الهاتف: {playerToBanInSettings.phone || 'غير مسجل'}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>أثر الحظر الفوري:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[10.5px] text-gray-300 leading-relaxed pr-1">
                <li>طرد فوري وإنهاء جلسته النشطة في هذه اللحظة.</li>
                <li>مسحه من كشف اللاعبين.</li>
                <li>إضافته لقائمة الحظر الدائم ومنعه من الدخول مجدداً.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRealBanPlayerInSettings}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>تأكيد الحظر الفعلي والطرد</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerToBanInSettings(null)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
