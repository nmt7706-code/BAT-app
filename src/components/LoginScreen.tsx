import React, { useState, useRef, useEffect } from 'react';
import { Shield, UserPlus, Lock, KeyRound, User, Phone, Trophy, ChevronLeft, AlertCircle, Sparkles, CheckCircle2, Camera, Trash2, UserCheck, LogIn, Search, ArrowRight, Download, ArrowUpRight } from 'lucide-react';
import { UserSession, PlayerRecord } from '../types';
import { StorageService } from '../utils/storage';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
  onOpenFlutterCode: () => void;
}

export function LoginScreen({ onLogin, onOpenFlutterCode }: LoginScreenProps) {
  const [activeMode, setActiveMode] = useState<'selection' | 'captain' | 'player' | 'player_login'>('selection');

  // Captain Login State
  const [captainPassword, setCaptainPassword] = useState('');
  const [captainError, setCaptainError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Existing Player Login State (لديك حساب بالفعل)
  const [loginSearch, setLoginSearch] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registeredPlayers, setRegisteredPlayers] = useState<PlayerRecord[]>([]);
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);

  // Player Registration State
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerPosition, setPlayerPosition] = useState('صانع ألعاب (AMF)');
  const [playerAgeGroup, setPlayerAgeGroup] = useState('فئة الشباب (U-19)');
  const [playerJersey, setPlayerJersey] = useState('10');
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync registered players and last logged in player
  useEffect(() => {
    setRegisteredPlayers(StorageService.getPlayers());
    setLastPlayerId(StorageService.getLastPlayerId());
  }, [activeMode]);

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setPlayerError('حجم الصورة كبير، يرجى اختيار صورة أقل من 4 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPlayerPhoto(event.target?.result as string);
      setPlayerError('');
    };
    reader.onerror = () => {
      setPlayerError('فشل قراءة ملف الصورة، يرجى اختيار صورة أخرى');
    };
    reader.readAsDataURL(file);
  };

  // Handle Captain Login
  const handleCaptainLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (captainPassword === 'Aa0987654') {
      const session: UserSession = {
        id: 'captain-zaid',
        role: 'captain',
        name: 'الكابتن زيد محمد خرشيد',
        loginTimestamp: Date.now(),
      };
      StorageService.setSession(session);
      onLogin(session);
    } else {
      setCaptainError('كلمة السر غير صحيحة! يرجى إعادة المحاولة.');
    }
  };

  // Handle Login for an Existing Player (لديك حساب بالفعل)
  const handleSelectExistingPlayer = (player: PlayerRecord) => {
    const session: UserSession = {
      id: player.id,
      role: 'player',
      name: player.name,
      phone: player.phone,
      photoUrl: player.photoUrl,
      position: player.position,
      ageGroup: player.ageGroup,
      jerseyNumber: player.jerseyNumber,
      loginTimestamp: Date.now(),
    };
    StorageService.setLastPlayerId(player.id);
    StorageService.setSession(session);
    onLogin(session);
  };

  const handleExistingPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const query = loginSearch.trim();
    if (!query) {
      setLoginError('يرجى كتابة رقم الهاتف أو اسم اللاعب المسجل به');
      return;
    }

    const found = StorageService.findPlayerByPhoneOrName(query);
    if (found) {
      handleSelectExistingPlayer(found);
    } else {
      setLoginError('لم يتم العثور على حساب لاعب مسجل بهذا الرقم أو الاسم! تأكد من صحة البيانات أو أنشئ حساباً جديداً.');
    }
  };

  // Handle Player Registration
  const handlePlayerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerPhoto) {
      setPlayerError('يرجى رفع صورتك الشخصية؛ الصورة إلزامية وتظهر للمسؤول (الكابتن زيد) فقط');
      return;
    }
    if (!playerName.trim()) {
      setPlayerError('يرجى كتابة اسم اللاعب الكامل');
      return;
    }
    if (!playerPhone.trim()) {
      setPlayerError('يرجى كتابة رقم هاتف للتواصل');
      return;
    }

    const newPlayerId = 'pl-' + Date.now();
    const newPlayer: PlayerRecord = {
      id: newPlayerId,
      name: playerName.trim(),
      phone: playerPhone.trim(),
      photoUrl: playerPhoto,
      jerseyNumber: parseInt(playerJersey, 10) || 10,
      position: playerPosition,
      ageGroup: playerAgeGroup,
      attendanceRate: 100,
      performanceRating: 8.5,
      readiness: 'جاهز للمباريات',
      notes: 'لاعب مسجل حديثاً في أكاديمية بايبوخت - تم إرفاق الصورة للمسؤول.',
      joinDate: new Date().toISOString().split('T')[0],
    };

    // Save player into database & track last id
    StorageService.savePlayer(newPlayer);
    StorageService.setLastPlayerId(newPlayerId);

    // Create persistent session
    const session: UserSession = {
      id: newPlayerId,
      role: 'player',
      name: playerName.trim(),
      phone: playerPhone.trim(),
      photoUrl: playerPhoto,
      position: playerPosition,
      ageGroup: playerAgeGroup,
      jerseyNumber: parseInt(playerJersey, 10) || 10,
      loginTimestamp: Date.now(),
    };
    StorageService.setSession(session);
    onLogin(session);
  };

  return (
    <div className="min-h-screen bg-[#080B09] text-gray-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambience / Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-700/15 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      {/* Top Bar with Flutter Code Button */}
      <header className="p-4 sm:p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-emerald-400/90 tracking-wide">الذاكرة الدائمة (Persistent Login) مفعّلة</span>
        </div>
        <button
          onClick={onOpenFlutterCode}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>كود Flutter & SharedPreferences</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          {/* Academy Crest / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#18231C] via-[#0E1611] to-[#080B09] border-2 border-amber-500/40 shadow-xl shadow-amber-950/30 mb-4 relative p-1 group">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-900/30 flex flex-col items-center justify-center border border-amber-500/20">
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" />
                <span className="text-[10px] font-black tracking-widest text-amber-300 mt-0.5">B.A.T</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-black font-black shadow">
                ★
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 mb-1">
              أكاديمية بايبوخت (B.A.T)
            </h1>
            <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <span>إدارة الكابتن:</span>
              <span className="text-amber-300 font-bold underline decoration-amber-500/40 underline-offset-4">زيد محمد خرشيد</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              بوابة تسجيل الدخول الرياضية المعتمدة
            </p>
          </div>

          {/* Mode 1: Initial Selection (2 Options as strictly requested) */}
          {activeMode === 'selection' && (
            <div className="bg-[#101713]/90 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
              <div className="text-center mb-6">
                <h2 className="text-base font-bold text-gray-200">اختر طريقة الدخول للتطبيق</h2>
                <p className="text-xs text-gray-400 mt-1">
                  سيتم حفظ جلسة الدخول في الذاكرة الدائمة ولن يُطلب منك تسجيل الدخول مجدداً
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Option 1: Captain Portal */}
                <button
                  id="btn-captain-login-select"
                  onClick={() => {
                    setActiveMode('captain');
                    setCaptainError('');
                  }}
                  className="w-full group p-4 rounded-2xl bg-gradient-to-r from-[#17221B] to-[#121A15] hover:from-amber-950/40 hover:to-[#17221B] border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 text-right"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                        <span>دخول لوحة الكابتن</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">إدارة الأكاديمية</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">الكابتن زيد محمد خرشيد (دخول إداري خاص)</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Option 2: Existing Player Login (لديك حساب بالفعل) */}
                <button
                  id="btn-player-login-select"
                  onClick={() => {
                    setActiveMode('player_login');
                    setLoginError('');
                    setLoginSearch('');
                  }}
                  className="w-full group p-4 rounded-2xl bg-gradient-to-r from-[#14231B] via-[#0E1C15] to-[#14231B] hover:from-emerald-900/40 hover:to-[#14231B] border border-emerald-500/40 hover:border-emerald-400/70 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 text-right relative overflow-hidden"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-black font-black shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                        <span>تسجيل دخول لاعب مسجل</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold animate-pulse">لديك حساب بالفعل؟</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-0.5">استرجاع حسابك وجدولك التدريبي برقم الهاتف أو الاسم</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Option 3: New Player Registration */}
                <button
                  id="btn-player-register-select"
                  onClick={() => {
                    setActiveMode('player');
                    setPlayerError('');
                  }}
                  className="w-full group p-4 rounded-2xl bg-gradient-to-r from-[#0C1A14] to-[#11231B] hover:from-emerald-950/40 hover:to-[#0C1A14] border border-emerald-500/30 hover:border-emerald-400/60 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 text-right"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-emerald-400 font-black shadow-md border border-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-200 text-sm flex items-center gap-1.5">
                        <span>إنشاء حساب لاعب جديد</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">تسجيل لأول مرة</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">تسجيل لاعب جديد في جداول التمارين والتبليغات</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Notice regarding Persistent Login */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-2.5 text-[11px] text-gray-400 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  ميزة <strong>الذاكرة الدائمة (Persistent Login)</strong>: بمجرد الدخول لن يُطلب منك تسجيل الدخول مرة أخرى عند إغلاق التطبيق وفتحه، وستظل جلستك محفوظة تماماً كتطبيق فيسبوك.
                </span>
              </div>

              {/* Download APK & Store Publishing Center Button */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  type="button"
                  id="btn-login-open-apk-center"
                  onClick={onOpenFlutterCode}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-between shadow-sm hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>تنزيل التطبيق بصيغة APK والنشر على متجر Google Play و App Store</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Captain Login Form */}
          {activeMode === 'captain' && (
            <div className="bg-[#101713]/95 backdrop-blur-md border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setActiveMode('selection')}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>الرجوع للخيارات</span>
                </button>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                  لوحة الكابتن
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-100">دخول الكابتن زيد محمد خرشيد</h2>
                <p className="text-xs text-gray-400 mt-1">أدخل كلمة المرور الخاصة بإدارة الأكاديمية</p>
              </div>

              <form onSubmit={handleCaptainLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 text-right">
                    كلمة المرور الإدارية
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={captainPassword}
                      onChange={(e) => {
                        setCaptainPassword(e.target.value);
                        setCaptainError('');
                      }}
                      placeholder="أدخل كلمة السر هنا..."
                      className="w-full px-4 py-3 bg-[#080B09] border border-amber-500/30 focus:border-amber-400 rounded-xl text-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-left font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400/80 hover:text-amber-300"
                    >
                      {showPassword ? 'إخفاء' : 'إظهار'}
                    </button>
                  </div>
                </div>

                {captainError && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{captainError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-submit-captain-login"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>تسجيل الدخول والبدء الدائم</span>
                </button>
              </form>
            </div>
          )}

          {/* Mode 3: Player Registration Form */}
          {activeMode === 'player' && (
            <div className="bg-[#101713]/95 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setActiveMode('selection')}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <span>الرجوع للخيارات</span>
                </button>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  لاعب جديد
                </span>
              </div>

              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-100">تسجيل حساب لاعب في الأكاديمية</h2>
                <p className="text-xs text-gray-400 mt-0.5">ستُحفظ بياناتك وجلستك في الذاكرة الدائمة مباشرة</p>
              </div>

              {/* Already have account banner */}
              <div className="p-3 bg-gradient-to-r from-amber-500/15 via-emerald-950/40 to-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-2 mb-4 text-right">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-300">لديك حساب مسجل بالفعل؟</p>
                    <p className="text-[10px] text-gray-300">لا داعي لإنشاء حساب جديد، ادخل لحسابك مباشرة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('player_login');
                    setPlayerError('');
                    setLoginError('');
                    setLoginSearch('');
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 hover:scale-105"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>

              {/* Privacy Notice for Player */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-[11px] text-emerald-200 flex items-start gap-2.5 mb-4">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-emerald-300 block mb-0.5">خصوصية تامة للاعبين:</strong>
                  صورتك الشخصية وبياناتك تظهر حصراً للكابتن زيد (المسؤول) في لوحة الإدارة. حسابك كلاعب مخصص للاطلاع على التبليغات الرسمية وتفاصيل التدريبات.
                </div>
              </div>

              <form onSubmit={handlePlayerRegister} className="space-y-3.5 text-right">
                {/* Photo Upload Section */}
                <div className="bg-[#090E0B] p-4 rounded-2xl border border-dashed border-emerald-500/40 hover:border-emerald-400 transition-colors text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="player-photo-input"
                  />

                  {playerPhoto ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg shadow-emerald-950/50 mb-2.5">
                        <img
                          src={playerPhoto}
                          alt="صورة اللاعب"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 bg-black/70 rounded-full text-white hover:text-emerald-300"
                            title="تغيير الصورة"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم إرفاق الصورة الشخصية بنجاح</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>تغيير الصورة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlayerPhoto(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>إزالة</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center py-3 group cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 transition-all group-hover:scale-105">
                        <Camera className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-gray-200 group-hover:text-emerald-300 transition-colors">
                        اضغط لرفع صورتك الشخصية *
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1">
                        (مطلوبة للملف الرسمي - تظهر للمسؤول الكابتن زيد فقط)
                      </span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    اسم اللاعب الثلاثي *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        setPlayerError('');
                      }}
                      placeholder="مثال: حيدر كريم العبيدي"
                      className="w-full px-4 py-2.5 pr-9 bg-[#080B09] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <User className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    رقم الهاتف للتواصل *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={playerPhone}
                      onChange={(e) => {
                        setPlayerPhone(e.target.value);
                        setPlayerError('');
                      }}
                      placeholder="مثال: 07701234567"
                      className="w-full px-4 py-2.5 pr-9 bg-[#080B09] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dir-ltr text-right"
                    />
                    <Phone className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      المركز المفضل
                    </label>
                    <select
                      value={playerPosition}
                      onChange={(e) => setPlayerPosition(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#080B09] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-gray-200 text-xs focus:outline-none"
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
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      الفئة العمرية
                    </label>
                    <select
                      value={playerAgeGroup}
                      onChange={(e) => setPlayerAgeGroup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#080B09] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-gray-200 text-xs focus:outline-none"
                    >
                      <option value="فئة الأشبال (U-15)">فئة الأشبال (U-15)</option>
                      <option value="فئة الناشئين (U-17)">فئة الناشئين (U-17)</option>
                      <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
                      <option value="الفريق الأول (Senior)">الفريق الأول (Senior)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    رقم القميص المفضل
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={playerJersey}
                    onChange={(e) => setPlayerJersey(e.target.value)}
                    className="w-full px-4 py-2 bg-[#080B09] border border-emerald-500/30 focus:border-emerald-400 rounded-xl text-gray-100 text-sm focus:outline-none"
                  />
                </div>

                {playerError && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{playerError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-submit-player-register"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد التسجيل والدخول الدائم</span>
                </button>

                <div className="pt-3 text-center border-t border-white/5 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('player_login');
                      setPlayerError('');
                      setLoginError('');
                      setLoginSearch('');
                    }}
                    className="text-xs text-amber-300 hover:text-amber-200 font-bold transition-colors inline-flex items-center gap-1.5 hover:underline"
                  >
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>لديك حساب بالفعل في الأكاديمية؟ اضغط هنا لتسجيل الدخول</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mode 4: Existing Player Login (لديك حساب بالفعل) */}
          {activeMode === 'player_login' && (
            <div className="bg-[#101713]/95 backdrop-blur-md border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setActiveMode('selection')}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>الرجوع للخيارات</span>
                </button>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>لديك حساب بالفعل</span>
                </span>
              </div>

              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                  <LogIn className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-100">تسجيل دخول لاعب مسجل</h2>
                <p className="text-xs text-gray-300 mt-0.5">استرجع حسابك وجدول تمارينك وتقييماتك في الذاكرة الدائمة</p>
              </div>

              {/* Quick search / login form by phone or name */}
              <form onSubmit={handleExistingPlayerSubmit} className="space-y-3.5 text-right mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    رقم الهاتف أو اسم اللاعب المسجل به *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginSearch}
                      onChange={(e) => {
                        setLoginSearch(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="مثال: 07701234567 أو مصطفى قاسم..."
                      className="w-full px-4 py-3 pr-10 bg-[#080B09] border border-amber-500/40 focus:border-amber-400 rounded-xl text-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-right"
                      autoFocus
                    />
                    <Search className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p>{loginError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode('player');
                          setPlayerError('');
                        }}
                        className="text-amber-300 hover:text-amber-200 font-bold underline mt-1 block"
                      >
                        اضغط هنا لإنشاء حساب لاعب جديد
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-submit-player-login"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول واسترجاع الحساب</span>
                </button>
              </form>

              {/* Direct 1-Click Fast Profile Switcher */}
              {registeredPlayers.length > 0 && (
                <div className="pt-4 border-t border-white/10 text-right">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>أو اختر حسابك المسجل مباشرة بنقرة واحدة:</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {registeredPlayers.length} لاعب مسجل
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {registeredPlayers.map((player) => {
                      const isLastAccount = player.id === lastPlayerId;
                      return (
                        <div
                          key={player.id}
                          onClick={() => handleSelectExistingPlayer(player)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group text-right ${
                            isLastAccount
                              ? 'bg-gradient-to-r from-amber-500/20 via-emerald-900/20 to-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                              : 'bg-[#0A110D] hover:bg-[#121E17] border-white/10 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 border border-amber-500/30 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {player.photoUrl ? (
                                <img
                                  src={player.photoUrl}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span>#{player.jerseyNumber || '10'}</span>
                              )}
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 rounded-tl-md flex items-center justify-center text-[8px] text-black font-black">
                                {player.jerseyNumber || '★'}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-gray-100 group-hover:text-amber-300 transition-colors">
                                  {player.name}
                                </span>
                                {isLastAccount && (
                                  <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-md">
                                    آخر حساب مسجل 📱
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                                <span className="text-emerald-400">{player.position}</span>
                                <span>•</span>
                                <span>{player.ageGroup}</span>
                                {player.phone && (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-400 dir-ltr">{player.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-3 py-1.5 bg-amber-500/15 group-hover:bg-amber-400 group-hover:text-black border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                          >
                            <span>دخول</span>
                            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggle to Registration */}
              <div className="pt-4 border-t border-white/5 text-center mt-4">
                <p className="text-xs text-gray-400 mb-1">لاعب جديد ولم تسجل بعد في الأكاديمية؟</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('player');
                    setPlayerError('');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-colors inline-flex items-center gap-1 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اضغط هنا لإنشاء حساب لاعب جديد لأول مرة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-4 text-center text-xs text-gray-500 z-10">
        أكاديمية بايبوخت (B.A.T) الرياضية • بإدارة الكابتن زيد محمد خرشيد • نظام تسجيل الدخول الدائم (Persistent Login)
      </footer>
    </div>
  );
}
