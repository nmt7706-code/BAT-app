import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-500/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-black shadow-xl shadow-amber-950/40 border border-amber-300 animate-in slide-in-from-bottom-3"
    >
      <WifiOff className="w-4 h-4 text-black shrink-0" />
      <span>وضع عدم الاتصال — يعمل تطبيق الأكاديمية بالكامل من الذاكرة المخزنة مؤقتاً (PWA Cache).</span>
    </div>
  );
};
