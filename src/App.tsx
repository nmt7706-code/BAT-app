import { useState, useEffect } from 'react';
import { Dumbbell, Bell, Users, Shield, Smartphone, Monitor, CheckCircle, Sparkles, Trophy, BellRing, X } from 'lucide-react';
import { UserSession, Exercise, Announcement, PlayerRecord } from './types';
import { StorageService } from './utils/storage';
import { initFCM, subscribeToFCMNotifications, requestNotificationPermission } from './utils/fcm';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { WorkoutsView } from './components/WorkoutsView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { PlayerManagementView } from './components/PlayerManagementView';
import { FlutterCodeModal } from './components/FlutterCodeModal';
import { PushNotificationToast, SimulatedPushNotification } from './components/PushNotificationToast';
import { PlayerEvaluationCard } from './components/PlayerEvaluationCard';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'workouts' | 'announcements' | 'players'>('announcements');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [showFlutterModal, setShowFlutterModal] = useState(false);
  const [restartBanner, setRestartBanner] = useState<string | null>(null);
  const [currentPush, setCurrentPush] = useState<SimulatedPushNotification | null>(null);

  // Application Data States
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [showNotifPermissionBanner, setShowNotifPermissionBanner] = useState(false);

  // Initial Load - Persistent Login (mirroring Flutter's shared_preferences)
  useEffect(() => {
    const savedSession = StorageService.getSession();
    if (savedSession) {
      setSession(savedSession);
    }
    // Load Academy Data
    setExercises(StorageService.getExercises());
    setAnnouncements(StorageService.getAnnouncements());
    setPlayers(StorageService.getPlayers());
    setIsInitializing(false);

    // Initialize Firebase Cloud Messaging & Service Worker
    initFCM();

    // Check if notification permission is needed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      setShowNotifPermissionBanner(true);
    }

    // Subscribe to real-time FCM & BroadcastChannel pushes
    const unsubscribe = subscribeToFCMNotifications((payload) => {
      setCurrentPush({
        id: payload.id || 'push-' + Date.now(),
        title: payload.title,
        body: payload.body,
        type: (payload.category as any) || 'general',
        author: 'الكابتن زيد محمد خرشيد',
        time: 'الآن',
      });
      // Refresh announcements & players data
      setAnnouncements(StorageService.getAnnouncements());
      setPlayers(StorageService.getPlayers());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshData = () => {
    setExercises(StorageService.getExercises());
    setAnnouncements(StorageService.getAnnouncements());
    setPlayers(StorageService.getPlayers());
  };

  // Login handler
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    refreshData();
    setRestartBanner(`مرحباً بك! تم حفظ جلستك في الذاكرة الدائمة كـ ${newSession.role === 'captain' ? 'الكابتن زيد' : newSession.name}`);
    setTimeout(() => setRestartBanner(null), 4000);
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.clearSession();
    setSession(null);
  };

  // Simulate app restart / reopen
  const handleSimulateRestart = () => {
    setIsInitializing(true);
    setRestartBanner('جارٍ إعادة فتح التطبيق ومحاكاة القفل وإعادة التشغيل...');
    setTimeout(() => {
      // Fetch session from persistent storage
      const existing = StorageService.getSession();
      setSession(existing);
      setIsInitializing(false);
      setRestartBanner('تم الدخول مباشرة إلى الشاشة الرئيسية من الذاكرة الدائمة (بدون طلب تسجيل دخول)!');
      setTimeout(() => setRestartBanner(null), 5000);
    }, 800);
  };

  // Reinstall / Factory Reset
  const handleReinstallApp = () => {
    StorageService.reinstallApp();
    setSession(null);
    refreshData();
  };

  // Find currently logged-in player record if role is 'player'
  const loggedInPlayerRecord = session?.role === 'player'
    ? players.find(p => p.id === session.userId || p.name === session.name)
    : undefined;

  // Handler when Captain broadcasts an announcement or pushes a notification
  const handleCaptainBroadcast = (announcement: Announcement) => {
    setCurrentPush({
      id: announcement.id,
      title: announcement.title,
      body: announcement.content,
      type: announcement.type,
      author: announcement.author,
      time: 'الآن',
    });
  };

  // Handler when Captain evaluates a player
  const handlePlayerEvaluated = (evaluatedPlayer: PlayerRecord, verdict: string) => {
    refreshData();
    // Fire push notification
    setCurrentPush({
      id: 'eval-' + Date.now(),
      title: `⭐ تقييم جديد من الكابتن زيد: ${verdict}`,
      body: `تم تسجيل تقييمك الفني اليوم (${evaluatedPlayer.todayEvaluation?.ratingScore || 9}/10) مع توجيه خاص من الكابتن زيد محمد خرشيد.`,
      type: 'general',
      author: 'الكابتن زيد محمد خرشيد',
      time: 'الآن',
    });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#080B09] flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#18231C] to-[#0E1611] border border-amber-500/40 p-2 flex items-center justify-center mb-4 animate-pulse">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
        <div className="text-amber-300 font-bold text-base mb-1">أكاديمية بايبوخت (B.A.T)</div>
        <div className="text-xs text-emerald-400">فحص الذاكرة الدائمة (SharedPreferences)...</div>
      </div>
    );
  }

  // Not logged in -> Show initial selection screen (Captain or New Player)
  if (!session) {
    return (
      <>
        <LoginScreen
          onLogin={handleLogin}
          onOpenFlutterCode={() => setShowFlutterModal(true)}
        />
        <FlutterCodeModal
          isOpen={showFlutterModal}
          onClose={() => setShowFlutterModal(false)}
        />
      </>
    );
  }

  // Main Logged-In View
  return (
    <div className="min-h-screen bg-[#080B09] text-gray-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Offline PWA Status Banner */}
      <OfflineIndicator />

      {/* Notification Permission Request Banner */}
      {showNotifPermissionBanner && (
        <div className="bg-gradient-to-r from-[#17231B] via-[#1F3325] to-[#17231B] border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg z-40 animate-in slide-in-from-top">
          <div className="flex items-center gap-2 text-center sm:text-right">
            <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>
              <strong>تفعيل إشعارات هاتف اللاعب (Firebase Cloud Messaging):</strong> اسمح بالإشعارات لاستلام تنبيهات التمارين، مواعيد النوم، والتقييمات اليومية مباشرة على هاتفك!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={async () => {
                await requestNotificationPermission();
                setShowNotifPermissionBanner(false);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs shadow-sm transition-all"
            >
              تفعيل الإشعارات الآن
            </button>
            <button
              onClick={() => setShowNotifPermissionBanner(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              title="تخطي الآن"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Simulation Banner Notification */}
      {restartBanner && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-200 px-4 py-2.5 text-xs text-center border-b border-emerald-500/30 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{restartBanner}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        session={session}
        onLogout={handleLogout}
        onSimulateRestart={handleSimulateRestart}
        onReinstallApp={handleReinstallApp}
        onOpenFlutterCode={() => setShowFlutterModal(true)}
      />

      {/* Frame Mode Switcher Bar */}
      <div className="bg-[#0B100C] border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-emerald-400">
              جلسة متصلة دائماً: {session.role === 'captain' ? 'لوحة الكابتن زيد' : session.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                !isMobileFrame ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>شاشة كاملة</span>
            </button>
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                isMobileFrame ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>محاكي الهاتف (Flutter Mobile)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className={`flex-1 ${isMobileFrame ? 'py-6 px-4 flex justify-center items-start' : 'p-4 sm:p-6 lg:p-8'}`}>
        <div
          className={
            isMobileFrame
              ? 'w-full max-w-md bg-[#090D0A] rounded-[40px] border-4 border-[#1F2923] shadow-2xl shadow-black/80 overflow-hidden flex flex-col min-h-[750px] relative ring-1 ring-amber-500/20'
              : 'max-w-7xl mx-auto w-full'
          }
        >
          {/* Mobile Status Bar if in Mobile Mockup */}
          {isMobileFrame && (
            <div className="bg-[#0D1410] px-6 py-2.5 flex items-center justify-between text-[10px] text-gray-400 border-b border-white/5">
              <span>09:41</span>
              <div className="w-16 h-4 bg-black rounded-full mx-auto"></div>
              <span>BAT 5G 100%</span>
            </div>
          )}

          {/* Navigation Tabs (Top in Desktop, also mirrored for fast access) */}
          <div className="p-4 bg-[#0D1410]/90 backdrop-blur border-b border-amber-500/20 sticky top-16 sm:top-20 z-20">
            <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
              {/* Tab 1: Announcements (التبليغات) */}
              <button
                id="tab-announcements"
                onClick={() => setActiveTab('announcements')}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'announcements'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#121A15] text-gray-300 hover:text-white border border-white/5 hover:border-amber-500/30'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>التبليغات</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {announcements.length}
                </span>
              </button>

              {/* Tab 2: Workouts (التمارين - للاطلاع) */}
              <button
                id="tab-workouts"
                onClick={() => setActiveTab('workouts')}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'workouts'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#121A15] text-gray-300 hover:text-white border border-white/5 hover:border-amber-500/30'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>{session.role === 'captain' ? 'التمارين' : 'جدول التمارين'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {exercises.length}
                </span>
              </button>

              {/* Tab 3: Player Management (إدارة اللاعبين - خاصة بالكابتن زيد فقط) */}
              {session.role === 'captain' && (
                <button
                  id="tab-players"
                  onClick={() => setActiveTab('players')}
                  className={`flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'players'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-[#121A15] text-gray-300 hover:text-white border border-white/5 hover:border-amber-500/30'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>إدارة اللاعبين</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                    {players.length}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Player Role Restricted Banner */}
          {session.role === 'player' && (
            <div className="mx-4 mt-4 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  مرحباً بك <strong className="text-white">{session.name}</strong> • مهمتك كلاعب متابعة التبليغات والتوجيهات، والإدارة الكاملة بإشراف الكابتن زيد.
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 shrink-0">
                صفتك: لاعب
              </span>
            </div>
          )}

          {/* Section View Content */}
          <div className="p-4 sm:p-6 flex-1">
            {/* If logged in as Player, show personal evaluation card prominently at the top */}
            {session.role === 'player' && (
              <PlayerEvaluationCard
                session={session}
                playerRecord={loggedInPlayerRecord}
              />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementsView
                session={session}
                announcements={announcements}
                onAnnouncementsUpdated={refreshData}
                onPushNotificationSent={handleCaptainBroadcast}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutsView
                session={session}
                exercises={exercises}
                onExercisesUpdated={refreshData}
              />
            )}

            {activeTab === 'players' && session.role === 'captain' && (
              <PlayerManagementView
                session={session}
                players={players}
                onPlayersUpdated={refreshData}
                onPlayerEvaluated={handlePlayerEvaluated}
              />
            )}
          </div>

          {/* Bottom Persistent Bar (Notice) */}
          <div className="p-3 bg-[#0B0F0D] border-t border-white/5 text-center text-[11px] text-gray-400">
            أكاديمية بايبوخت (B.A.T) • إشراف الكابتن زيد محمد خرشيد • الذاكرة الدائمة نشطة
          </div>
        </div>
      </div>

      {/* Push Notification Simulator Toast (appears on top of device screen) */}
      <PushNotificationToast
        notification={currentPush}
        onDismiss={() => setCurrentPush(null)}
      />

      {/* Flutter Code Modal */}
      <FlutterCodeModal
        isOpen={showFlutterModal}
        onClose={() => setShowFlutterModal(false)}
      />
    </div>
  );
}
