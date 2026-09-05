import { useState } from 'react';
import { Shield, User, LogOut, RotateCcw, Trash2, Code, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  session: UserSession;
  onLogout: () => void;
  onSimulateRestart: () => void;
  onReinstallApp: () => void;
  onOpenFlutterCode: () => void;
}

export function Header({
  session,
  onLogout,
  onSimulateRestart,
  onReinstallApp,
  onOpenFlutterCode,
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const isCaptain = session.role === 'captain';

  return (
    <header className="sticky top-0 z-30 bg-[#080C0A]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Academy Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1B271F] to-[#0E1611] border border-amber-500/40 p-1 flex items-center justify-center shadow-md shadow-amber-500/10">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-800/30 flex items-center justify-center font-black text-amber-300 text-xs sm:text-sm tracking-wider">
                B.A.T
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
                  أكاديمية بايبوخت (B.A.T)
                </h1>
                <span className="hidden md:inline-flex text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                  إشراف رياضي معتمد
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span>إدارة:</span>
                <span className="text-emerald-400 font-bold">الكابتن زيد محمد خرشيد</span>
              </p>
            </div>
          </div>

          {/* Center / Status Indicator: Persistent Login */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101713] border border-emerald-500/30 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-xs font-semibold text-emerald-300">
              الذاكرة الدائمة (SharedPreferences) متصلة دائماً
            </span>
          </div>

          {/* Right Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Flutter Code Modal */}
            <button
              onClick={onOpenFlutterCode}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 hover:from-amber-500/25 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm"
              title="عرض كود فلاتر المصدري"
            >
              <Code className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">كود Flutter</span>
            </button>

            {/* Simulate App Restart Button (Verifies the user intent!) */}
            <button
              onClick={onSimulateRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
              title="محاكاة إغلاق التطبيق وفتحه للتأكد من عدم طلب تسجيل الدخول مجدداً"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">محاكاة إعادة فتح التطبيق</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isCaptain
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 ${
                    session.photoUrl
                      ? 'border border-amber-400/60'
                      : isCaptain
                      ? 'bg-amber-400 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {session.photoUrl ? (
                    <img
                      src={session.photoUrl}
                      alt={session.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : isCaptain ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold leading-tight">{session.name}</div>
                  <div className="text-[10px] text-gray-400">
                    {isCaptain ? 'مدير الأكاديمية' : session.position || 'لاعب'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-[#101713] border border-amber-500/30 rounded-2xl p-3 shadow-2xl shadow-black z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-white/10 mb-2">
                    <div className="font-bold text-sm text-gray-100">{session.name}</div>
                    <div className="text-xs text-amber-300 font-medium mt-0.5">
                      {isCaptain ? '👑 صلاحيات الكابتن الكاملة' : `⚽ قميص رقم: #${session.jerseyNumber || '10'} - ${session.ageGroup || 'الشباب'}`}
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>جلسة محفوظة في ذاكرة الهاتف تلقائياً</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Simulate App Restart */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSimulateRestart();
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-emerald-400" />
                        <span>محاكاة إغلاق التطبيق وفتحه</span>
                      </div>
                      <span className="text-[10px] text-gray-500">بدون طلب تسجيل</span>
                    </button>

                    {/* View Flutter Code */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenFlutterCode();
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/10 rounded-xl flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>عرض كود فلاتر المصدري</span>
                    </button>

                    {/* Clear Session / Logout */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowConfirmLogout(true);
                      }}
                      className="w-full text-right px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج من الحساب</span>
                    </button>

                    {/* Simulate Uninstall / Fresh Reinstall */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowConfirmReset(true);
                      }}
                      className="w-full text-right px-3 py-1.5 text-[11px] text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-xl flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>حذف التطبيق وإعادة تثبيته (مسح الذاكرة)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Logout */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121A15] border border-amber-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-right">
            <h3 className="text-base font-bold text-gray-100 mb-2">تأكيد تسجيل الخروج</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              وفقاً لقواعد النظام: لا يتم إخراج المستخدم من حسابه إلا إذا قام بالضغط على زر "تسجيل الخروج" بنفسه. هل أنت متأكد من رغبتك في تسجيل الخروج الآن؟
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-xl font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setShowConfirmLogout(false);
                  onLogout();
                }}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md"
              >
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reinstall / Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121A15] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-right">
            <h3 className="text-base font-bold text-red-300 mb-2">محاكاة حذف التطبيق وإعادة تثبيته</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              سيتم مسح جميع بيانات الذاكرة الدائمة (SharedPreferences / Storage) والعودة لشاشة الاختيار الأولى، تماماً كما لو قمت بحذف التطبيق وإعادة تنزيله.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-xl font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  onReinstallApp();
                }}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md"
              >
                مسح الذاكرة وإعادة التثبيت
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
