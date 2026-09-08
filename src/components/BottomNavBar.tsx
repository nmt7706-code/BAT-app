import { Home, Users, Trophy, Flame, MessageSquare, Bell, Lock } from 'lucide-react';
import { MainTabType } from '../types';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  isChatLocked?: boolean;
  unreadCount?: number;
  unreadAnnouncementsCount?: number;
}

export function BottomNavBar({
  activeTab,
  onChangeTab,
  isChatLocked = false,
  unreadCount = 0,
  unreadAnnouncementsCount = 0,
}: BottomNavBarProps) {
  const tabs: {
    id: MainTabType;
    label: string;
    icon: typeof Home;
    badge?: string | number;
    showLock?: boolean;
  }[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
    },
    {
      id: 'players',
      label: 'اللاعبين',
      icon: Users,
    },
    {
      id: 'matches',
      label: 'المباريات',
      icon: Trophy,
    },
    {
      id: 'scorers',
      label: 'الهدافين',
      icon: Flame,
    },
    {
      id: 'announcements',
      label: 'التبليغات',
      icon: Bell,
      badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
    },
    {
      id: 'chat',
      label: 'الدردشة',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
      showLock: isChatLocked,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="شريط التنقل الرئيسي"
      className="sticky bottom-0 z-40 bg-[#0A0E0B]/95 backdrop-blur-lg border-t border-amber-500/20 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] px-2 py-1 sm:py-2 safe-area-pb"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1.5 sm:px-3 rounded-2xl transition-all duration-200 min-w-[54px] sm:min-w-[68px] min-h-[50px] ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-300 shadow-sm shadow-amber-500/20 border border-amber-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Active Indicator Top Light */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-amber-400' : 'text-gray-400'
                  }`}
                />

                {/* Lock indicator for chat tab */}
                {tab.showLock && (
                  <span
                    title="الدردشة مقفلة حالياً من قبل الكابتن زيد"
                    className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-600 border border-[#0A0E0B] rounded-full flex items-center justify-center text-white"
                  >
                    <Lock className="w-2 h-2 text-white" />
                  </span>
                )}

                {/* Badge if any */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] sm:text-[11px] font-bold mt-1 tracking-tight leading-none whitespace-nowrap ${
                  isActive ? 'text-amber-300 font-extrabold' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
