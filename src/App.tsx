import { useState, useEffect } from 'react';
import {
  BellRing,
  X,
  CheckCircle,
  Monitor,
  Smartphone,
  Shield,
} from 'lucide-react';
import {
  UserSession,
  Exercise,
  Announcement,
  PlayerRecord,
  MatchRecord,
  TopScorer,
  ChatMessage,
  ChatRoomState,
  SocialLink,
  MainTabType,
} from './types';
import { StorageService } from './utils/storage';
import {
  initFCM,
  subscribeToFCMNotifications,
  requestNotificationPermission,
} from './utils/fcm';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeView } from './components/HomeView';
import { MatchesView } from './components/MatchesView';
import { TopScorersView } from './components/TopScorersView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { PlayerManagementView } from './components/PlayerManagementView';
import { PlayerEvaluationCard } from './components/PlayerEvaluationCard';
import { PushNotificationToast, SimulatedPushNotification } from './components/PushNotificationToast';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [restartBanner, setRestartBanner] = useState<string | null>(null);
  const [currentPush, setCurrentPush] = useState<SimulatedPushNotification | null>(null);

  // Application Data States
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatState, setChatState] = useState<ChatRoomState>({
    isLocked: false,
    lastLockedBy: undefined,
    lockedReason: undefined,
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [showNotifPermissionBanner, setShowNotifPermissionBanner] = useState(false);

  const refreshData = () => {
    setExercises(StorageService.getExercises());
    setAnnouncements(StorageService.getAnnouncements());
    setPlayers(StorageService.getPlayers());
    setMatches(StorageService.getMatches());
    setTopScorers(StorageService.getTopScorers());
    setChatMessages(StorageService.getChatMessages());
    setChatState(StorageService.getChatState());
    setSocialLinks(StorageService.getSocialLinks());
  };

  // Initial Load - Persistent Login & Security Verification
  useEffect(() => {
    const validateAndSyncSession = () => {
      const savedSession = StorageService.getSession();
      if (savedSession && savedSession.role === 'player') {
        if (StorageService.isUserBanned(savedSession.name, savedSession.phone)) {
          StorageService.clearSession();
          setSession(null);
          setRestartBanner('❌ تم حظر هذا الحساب من قبل الكابتن زيد لعدم الانتماء للأكاديمية وإنهاء الجلسة.');
          return;
        }
        const allPlayers = StorageService.getPlayers();
        const stillExists = allPlayers.some(
          (p) =>
            p.id === savedSession.id ||
            (savedSession.phone && p.phone && p.phone.replace(/[^0-9]/g, '') === savedSession.phone.replace(/[^0-9]/g, ''))
        );
        if (!stillExists) {
          StorageService.clearSession();
          setSession(null);
          setRestartBanner('⚠️ تم حذف هذا الحساب نهائياً من قاعدة بيانات الأكاديمية وإنهاء الجلسة.');
          return;
        }
        setSession(savedSession);
      } else if (savedSession) {
        setSession(savedSession);
      } else {
        setSession(null);
      }
    };

    validateAndSyncSession();
    StorageService.applyTheme();
    refreshData();
    setIsInitializing(false);

    // Initialize FCM
    initFCM();

    // Check notification permission
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      setShowNotifPermissionBanner(true);
    }

    // Subscribe to multi-tab storage & broadcast sync
    const handleSync = () => {
      StorageService.applyTheme();
      validateAndSyncSession();
      refreshData();
    };

    window.addEventListener('bat_academy_event', handleSync);
    window.addEventListener('storage', handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('bat_academy_events');
        bc.onmessage = () => {
          handleSync();
        };
      } catch {
        // ignore
      }
    }

    // System theme change listener for 'auto'
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleMediaChange = () => {
      if (StorageService.getThemeMode() === 'auto') {
        StorageService.applyTheme('auto');
      }
    };
    mediaQuery?.addEventListener?.('change', handleMediaChange);

    // Subscribe to FCM & BroadcastChannel pushes
    const unsubscribe = subscribeToFCMNotifications((payload) => {
      setCurrentPush({
        id: payload.id || 'push-' + Date.now(),
        title: payload.title,
        body: payload.body,
        type: (payload.category as any) || 'general',
        author: 'الكابتن زيد محمد خرشيد',
        time: 'الآن',
      });
      refreshData();
    });

    return () => {
      window.removeEventListener('bat_academy_event', handleSync);
      window.removeEventListener('storage', handleSync);
      bc?.close();
      mediaQuery?.removeEventListener?.('change', handleMediaChange);
      unsubscribe();
    };
  }, []);

  // Login handler
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    refreshData();
    setRestartBanner(
      `مرحباً بك! تم حفظ جلستك في الذاكرة الدائمة كـ ${
        newSession.role === 'captain' ? 'الكابتن زيد محمد خرشيد' : newSession.name
      }`
    );
    setTimeout(() => setRestartBanner(null), 4000);
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.clearSession();
    setSession(null);
    setActiveTab('home');
  };

  // Simulate app restart / reopen
  const handleSimulateRestart = () => {
    setIsInitializing(true);
    setRestartBanner('جارٍ محاكاة إغلاق التطبيق وإعادة فتحه للتحقق من حفظ الجلسة...');
    setTimeout(() => {
      const existing = StorageService.getSession();
      setSession(existing);
      setIsInitializing(false);
      setRestartBanner(
        'تم الدخول مباشرة إلى الصفحة الرئيسية من الذاكرة الدائمة (بدون طلب تسجيل دخول)! ✅'
      );
      setTimeout(() => setRestartBanner(null), 5000);
    }, 700);
  };

  // Reinstall App / Factory Reset
  const handleReinstallApp = () => {
    StorageService.reinstallApp();
    setSession(null);
    refreshData();
    setActiveTab('home');
  };

  // Chat actions
  const handleSendMessage = (content: string) => {
    if (!session) return;
    StorageService.sendChatMessage(
      session.id,
      session.name,
      session.role,
      content,
      session.jerseyNumber
    );
    refreshData();
  };

  const handleToggleChatLock = (locked: boolean, reason?: string) => {
    if (!session || session.role !== 'captain') return;
    StorageService.setChatLock(locked, session.name, reason);
    refreshData();
  };

  const handleDeleteChatMessage = (msgId: string) => {
    if (!session || session.role !== 'captain') return;
    StorageService.deleteChatMessage(msgId);
    refreshData();
  };

  const handleClearChat = () => {
    if (!session || session.role !== 'captain') return;
    StorageService.clearChatMessages();
    refreshData();
  };

  // Matches actions
  const handleSaveMatch = (match: MatchRecord) => {
    StorageService.saveMatch(match);
    refreshData();
  };

  const handleDeleteMatch = (id: string) => {
    StorageService.deleteMatch(id);
    refreshData();
  };

  // Top Scorers actions
  const handleSaveScorer = (scorer: TopScorer) => {
    StorageService.saveTopScorer(scorer);
    refreshData();
  };

  const handleDeleteScorer = (id: string) => {
    StorageService.deleteTopScorer(id);
    refreshData();
  };

  const handleIncrementGoals = (id: string, amount: number) => {
    StorageService.incrementGoals(id, amount);
    refreshData();
  };

  // Push broadcast handler from captain
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

  // Find currently logged-in player record
  const loggedInPlayerRecord =
    session?.role === 'player'
      ? players.find((p) => p.id === session.userId || p.name === session.name)
      : undefined;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#080B09] flex flex-col items-center justify-center text-center p-4">
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#18231C] to-[#0E1611] border-2 border-amber-400/60 p-1 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/20 overflow-hidden animate-pulse">
          <img
            src="/logo.png"
            alt="شعار أكاديمية بايبوخت (B.A.T)"
            className="w-full h-full object-cover rounded-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-amber-300 font-black text-lg mb-1">أكاديمية بايبوخت (B.A.T)</div>
        <div className="text-xs text-emerald-400 font-semibold">
          جارٍ فحص الذاكرة الدائمة واستعادة البيانات...
        </div>
      </div>
    );
  }

  // Not logged in -> Show initial selection & registration screen
  if (!session) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onOpenSocialLinks={() => {}}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080B09] text-gray-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Offline PWA Status Banner */}
      <OfflineIndicator />

      {/* Notification Permission Request Banner */}
      {showNotifPermissionBanner && (
        <div className="bg-gradient-to-r from-[#17231B] via-[#1F3325] to-[#17231B] border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg z-40">
          <div className="flex items-center gap-2 text-center sm:text-right">
            <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>
              <strong>تفعيل إشعارات هاتف اللاعب (Firebase Cloud Messaging):</strong> اسمح بالإشعارات
              لاستلام تنبيهات التمارين، مواعيد المباريات، والتعليمات مباشرة على هاتفك!
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
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Frame Mode Switcher Bar */}
      <div className="bg-[#0B100C] border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-emerald-400">
              جلسة متصلة دائماً: {session.role === 'captain' ? 'الكابتن زيد محمد خرشيد' : session.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                !isMobileFrame
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>شاشة كاملة</span>
            </button>
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                isMobileFrame
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>وضع الهاتف المحمول</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area (With bottom padding for BottomNavBar) */}
      <main
        className={`flex-1 pb-28 sm:pb-32 ${
          isMobileFrame ? 'py-6 px-4 flex justify-center items-start' : 'p-4 sm:p-6 lg:p-8'
        }`}
      >
        <div
          className={
            isMobileFrame
              ? 'w-full max-w-md bg-[#090D0A] rounded-[40px] border-4 border-[#1F2923] shadow-2xl shadow-black/80 overflow-hidden flex flex-col min-h-[750px] relative ring-1 ring-amber-500/20'
              : 'max-w-7xl mx-auto w-full'
          }
        >
          {/* Mobile Status Bar in Mockup */}
          {isMobileFrame && (
            <div className="bg-[#0D1410] px-6 py-2.5 flex items-center justify-between text-[10px] text-gray-400 border-b border-white/5">
              <span>09:41</span>
              <div className="w-16 h-4 bg-black rounded-full mx-auto"></div>
              <span>BAT 5G 100%</span>
            </div>
          )}

          {/* Render Views Based on activeTab */}
          <div className="p-3 sm:p-6 flex-1">
            {/* Player Role Header Card (Shown on Players tab for players) */}
            {session.role === 'player' && activeTab === 'players' && (
              <div className="mb-5">
                <PlayerEvaluationCard session={session} playerRecord={loggedInPlayerRecord} />
              </div>
            )}

            {/* TAB 1: الرئيسية (Home) */}
            {activeTab === 'home' && (
              <HomeView
                session={session}
                announcements={announcements}
                exercises={exercises}
                matches={matches}
                topScorers={topScorers}
                players={players}
                onAnnouncementsUpdated={refreshData}
                onExercisesUpdated={refreshData}
                onPushNotificationSent={handleCaptainBroadcast}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {/* TAB 2: لاعبين الاكاديمية (Players) */}
            {activeTab === 'players' && (
              <PlayerManagementView
                session={session}
                players={players}
                onPlayersUpdated={refreshData}
              />
            )}

            {/* TAB 3: المباريات والنتائج (Matches & Results) */}
            {activeTab === 'matches' && (
              <MatchesView
                session={session}
                matches={matches}
                onMatchesUpdated={refreshData}
              />
            )}

            {/* TAB 4: هدافين الاكاديمية (Top Scorers) */}
            {activeTab === 'scorers' && (
              <TopScorersView
                session={session}
                scorers={topScorers}
                players={players}
                onScorersUpdated={refreshData}
              />
            )}

            {/* TAB 5: التبليغات والاشعارات الرسمية (Announcements) */}
            {activeTab === 'announcements' && (
              <AnnouncementsView
                session={session}
                announcements={announcements}
                onAnnouncementsUpdated={refreshData}
                onPushNotificationSent={handleCaptainBroadcast}
              />
            )}

            {/* TAB 6: الدردشه (Chat with Admin Lock/Unlock) */}
            {activeTab === 'chat' && (
              <ChatView
                session={session}
                messages={chatMessages}
                chatState={chatState}
                onSendMessage={handleSendMessage}
                onToggleChatLock={handleToggleChatLock}
                onDeleteMessage={handleDeleteChatMessage}
                onClearChat={handleClearChat}
              />
            )}

            {/* TAB 7: الاعدادات (Settings with Social Links) */}
            {activeTab === 'settings' && (
              <SettingsView
                session={session}
                socialLinks={socialLinks}
                onSocialLinksUpdated={refreshData}
                onLogout={handleLogout}
                onSimulateRelaunch={handleSimulateRestart}
                onRequestNotificationPermission={requestNotificationPermission}
              />
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        isChatLocked={chatState.isLocked}
        unreadAnnouncementsCount={announcements.filter((a) => a.isPinned).length}
      />

      {/* Push Notification Simulator Toast */}
      <PushNotificationToast
        notification={currentPush}
        onDismiss={() => setCurrentPush(null)}
      />
    </div>
  );
}
