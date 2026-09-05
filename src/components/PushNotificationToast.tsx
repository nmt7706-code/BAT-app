import { useState, useEffect } from 'react';
import { Bell, X, Sparkles, Clock, CheckCircle2, Shield, Flame, Moon, Dumbbell } from 'lucide-react';
import { Announcement, DailyEvaluation } from '../types';

export interface SimulatedPushNotification {
  id: string;
  title: string;
  body: string;
  category: 'training' | 'sleep' | 'evaluation' | 'urgent' | 'general';
  timestamp: string;
  sender: string;
}

interface PushNotificationToastProps {
  notification: SimulatedPushNotification | null;
  onDismiss: () => void;
  onOpenAppAction?: () => void;
}

export function PushNotificationToast({ notification, onDismiss, onOpenAppAction }: PushNotificationToastProps) {
  useEffect(() => {
    if (!notification) return;

    // Optional audio chirp if browser allows
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.category) {
      case 'sleep':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'training':
        return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'evaluation':
        return <Flame className="w-5 h-5 text-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in slide-in-from-top-6 duration-300">
      <div className="bg-[#0C130F]/95 backdrop-blur-xl border-2 border-amber-500/60 rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-black/90 text-right">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
              {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide">
                    إشعار هاتف رسمي • أكاديمية B.A.T
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">{notification.timestamp}</span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                {notification.body}
              </p>

              <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 border-t border-white/5 pt-1.5">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>المرسل: {notification.sender}</span>
                </span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  وصل إلى جهازك الآن
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
