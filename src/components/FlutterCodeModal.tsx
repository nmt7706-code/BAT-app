import { useState } from 'react';
import { 
  X, Copy, Check, Code, Smartphone, ShieldCheck, Database, 
  Download, ExternalLink, Sparkles, CheckCircle2, FileCode, 
  Layers, Info, ArrowUpRight, Globe, Play, HelpCircle
} from 'lucide-react';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlutterCodeModal({ isOpen, onClose }: FlutterCodeModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'apk_builder' | 'play_store' | 'app_store' | 'instant_pwa' | 'flutter_code' | 'android_studio'>('apk_builder');
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<'pubspec' | 'main' | 'auth' | 'screens'>('main');

  if (!isOpen) return null;

  // الرابط الرسمي المباشر للتطبيق
  const appPublishedUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ais-pre-i2pqleowajqbsdpe3k3uk3-647524489010.europe-west1.run.app';

  // رابط التوليد التلقائي لـ APK و AAB عبر أداة PWABuilder الرسمية
  const pwaBuilderDirectUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appPublishedUrl)}`;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const flutterSnippets = {
    pubspec: `# pubspec.yaml
name: bat_academy_app
description: "تطبيق أكاديمية بايبوخت (B.A.T) بإدارة الكابتن زيد محمد خرشيد"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  # مكتبة الذاكرة الدائمة لتسجيل الدخول:
  shared_preferences: ^2.2.2
  firebase_core: ^2.27.0
  firebase_messaging: ^14.7.19
  google_fonts: ^6.1.0
  flutter_staggered_animations: ^1.1.1
  lucide_icons: ^0.257.0

flutter:
  uses-material-design: true
`,
    main: `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // فحص الذاكرة الدائمة لمعرفة هل المستخدم مسجل دخول مسبقاً (Persistent Login)
  final prefs = await SharedPreferences.getInstance();
  final String? sessionJson = prefs.getString('bat_academy_session');
  
  Widget initialScreen = const LoginScreen();
  
  if (sessionJson != null) {
    try {
      final userSession = jsonDecode(sessionJson);
      // إذا كانت الجلسة موجودة، يدخل فوراً للشاشة الرئيسية دون طلب تسجيل الدخول مجدداً
      initialScreen = HomeScreen(session: userSession);
    } catch (e) {
      initialScreen = const LoginScreen();
    }
  }

  runApp(BatAcademyApp(initialScreen: initialScreen));
}

class BatAcademyApp extends StatelessWidget {
  final Widget initialScreen;
  const BatAcademyApp({super.key, required this.initialScreen});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'أكاديمية بايبوخت B.A.T',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar', 'IQ'),
      supportedLocales: const [Locale('ar', 'IQ')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF080B09),
        primaryColor: const Color(0xFFD4AF37),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFD4AF37),
          secondary: Color(0xFF064E3B),
          surface: Color(0xFF101713),
        ),
      ),
      home: initialScreen,
    );
  }
}
`,
    auth: `// lib/services/auth_service.dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _sessionKey = 'bat_academy_session';

  /// حفظ جلسة الدخول في ذاكرة الهاتف تلقائياً
  static Future<bool> saveSession({
    required String role, // 'captain' or 'player'
    required String name,
    String? phone,
    String? photoPath,
    String? position,
    String? ageGroup,
    int? jerseyNumber,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final sessionData = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'role': role,
      'name': name,
      'phone': phone ?? '',
      'photoPath': photoPath ?? '',
      'position': position ?? '',
      'ageGroup': ageGroup ?? '',
      'jerseyNumber': jerseyNumber ?? 0,
      'timestamp': DateTime.now().toIso8601String(),
    };
    return await prefs.setString(_sessionKey, jsonEncode(sessionData));
  }

  /// التحقق من تسجيل الدخول الدائم
  static Future<Map<String, dynamic>?> getSession() async {
    final prefs = await SharedPreferences.getInstance();
    final String? sessionJson = prefs.getString(_sessionKey);
    if (sessionJson == null) return null;
    return jsonDecode(sessionJson) as Map<String, dynamic>;
  }

  /// تسجيل الخروج
  static Future<bool> logout() async {
    final prefs = await SharedPreferences.getInstance();
    return await prefs.remove(_sessionKey);
  }
}
`,
    screens: `// بناء APK عبر سطر الأوامر (Flutter Terminal Command):
// 1. لبناء ملف APK مباشر للتثبيت على الهواتف:
flutter build apk --release
// ستجد الملف الجاهز في:
// build/app/outputs/flutter-apk/app-release.apk

// 2. لبناء حزمة AAB لمتجر Google Play Console:
flutter build appbundle
// ستجد الملف في:
// build/app/outputs/bundle/release/app-release.aab
`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0C120E] border border-amber-500/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/60 overflow-hidden text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-amber-500/25 bg-gradient-to-r from-[#14221A] via-[#0E1812] to-[#14221A]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/30 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400">
                  مركز استخراج APK ورفع التطبيق للمتاجر
                </h2>
                <span className="hidden sm:inline-flex text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  جاهز للتحميل 100%
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                تنزيل ملف APK لهواتف الأندرويد، ورفع التطبيق على متجر Google Play ومتجر Apple App Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#080D0A] px-3 sm:px-6 pt-2 gap-1.5 sm:gap-2 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'apk_builder', label: '🚀 توليد APK فوري (1-Click)', badge: 'أسهل طريقة' },
            { id: 'play_store', label: '🛍️ النشر على Google Play', badge: 'متجر بلي' },
            { id: 'app_store', label: '🍏 النشر على App Store', badge: 'آبل للايفون' },
            { id: 'instant_pwa', label: '⚡ تثبيت مباشر للاعبين الآن', badge: 'بدون متجر' },
            { id: 'flutter_code', label: '📱 كود Flutter الأصلي', badge: 'مشروع كامل' },
            { id: 'android_studio', label: '🛠️ Android Studio / Capacitor', badge: 'للمطورين' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl font-bold whitespace-nowrap transition-all border-t border-x ${
                  active
                    ? 'bg-[#101713] text-amber-300 border-amber-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                    active ? 'bg-amber-400 text-black' : 'bg-white/10 text-gray-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A0F0C] space-y-5">
          
          {/* TAB 1: 1-Click APK & AAB Builder (PWABuilder) */}
          {activeTab === 'apk_builder' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Highlight Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#102016] to-[#0D1811] border border-emerald-500/40 shadow-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-black text-emerald-200">
                        التطبيق مهيأ بنسبة 100% لتوليد ملف الـ APK والـ AAB فوراً
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                      تم تضمين جميع الأيقونات الرسمية بدقة عالية (<code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">192x192</code> و <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">512x512 Maskable</code>) وملف <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">manifest.json</code> ونظام الإشعارات الفورية <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">FCM</code> والعمل بدون إنترنت.
                    </p>
                  </div>

                  <a
                    href={pwaBuilderDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all shrink-0"
                  >
                    <span>فتح أداة التحميل PWABuilder</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Step-by-Step Guide */}
              <div className="bg-[#101713] border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>خطوات استخراج ملف الـ APK بدقيقة واحدة:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">1</div>
                    <p className="text-xs font-bold text-gray-200">افتح أداة PWABuilder</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      اضغط على الزر الذهبي بالأعلى، أو افتح <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-amber-300 underline">pwabuilder.com</a> والصق رابط تطبيق الأكاديمية.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">2</div>
                    <p className="text-xs font-bold text-gray-200">اختر Package for Stores</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      بعد فحص الرابط وظهور النتيجة الخضراء الممتازة، اضغط على زر <strong>Package for Stores</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold text-xs flex items-center justify-center">3</div>
                    <p className="text-xs font-bold text-gray-200">تنزيل APK و AAB</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      اختر <strong>Android</strong> لتحميل ملف <code className="text-amber-300">app-release.apk</code> و <code className="text-amber-300">app-release.aab</code> بضغطة زر واحدة!
                    </p>
                  </div>
                </div>

                {/* App URL Copy Box */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    رابط تطبيق الأكاديمية المفحوص والجاهز:
                  </label>
                  <div className="flex items-center gap-2 bg-black/60 border border-amber-500/30 rounded-xl p-2 dir-ltr">
                    <input
                      type="text"
                      readOnly
                      value={appPublishedUrl}
                      className="bg-transparent text-xs text-amber-300 font-mono flex-1 outline-none px-2"
                    />
                    <button
                      onClick={() => copyText('app-url', appPublishedUrl)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === 'app-url' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الرابط</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Difference Box between APK and AAB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#0D1611] border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>ملف APK (للتثبيت المباشر على الهواتف):</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    ملف بصيغة <code className="text-amber-300 font-bold">.apk</code> يمكنك إرساله بالواتساب أو التليغرام لجميع لاعبي الأكاديمية وأولياء الأمور ليقوموا بتثبيته فوراً على أي هاتف سامسونج أو شاومي بدون المرور بالمتجر.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1611] border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1.5">
                    <Play className="w-4 h-4" />
                    <span>ملف AAB (لمتجر Google Play):</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    ملف بصيغة <code className="text-emerald-300 font-bold">.aab</code> وهو الصيغة الرسمية الإلزامية التي يطلبها متجر Google Play عند رفع أي تطبيق جديد في لوحة Google Play Console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Google Play Store Release */}
          {activeTab === 'play_store' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17221A] to-[#101A14] border border-amber-500/40">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>دليل رفع تطبيق أكاديمية بايبوخت (B.A.T) على متجر Google Play:</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  متجر Google Play هو أكبر متجر لتطبيقات الأندرويد في العالم. إليك الخطوات الرسمية الواضحة لرفع التطبيق ليكون متاحاً لجميع الناس لتحميله:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-gray-100">إنشاء حساب مطور في Google Play Console</h5>
                    <p className="text-gray-400 leading-relaxed">
                      ادخل على <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-amber-300 underline font-bold">play.google.com/console</a> وقم بالتسجيل بواسطة حساب جيميل. رسوم تفعيل حساب المطور هي <strong>25 دولار فقط لمرة واحدة في العمر</strong> (تدفع لشركة Google).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-gray-100">إنشاء تطبيق جديد (Create App)</h5>
                    <p className="text-gray-400 leading-relaxed">
                      اضغط على زر <strong>Create app</strong>، اكتب الاسم: <span className="text-amber-300 font-bold">أكاديمية بايبوخت (B.A.T)</span>، اختر اللغة الافتراضية <strong>العربية</strong>، ونوع التطبيق <strong>App</strong> ومجاني <strong>Free</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 font-black text-sm flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-gray-100">رفع ملف الـ AAB (App Bundle)</h5>
                    <p className="text-gray-400 leading-relaxed">
                      من القائمة الجانبية اختر <strong>Production</strong> ثم <strong>Create new release</strong>، وارفع ملف <code className="text-amber-300">app-release.aab</code> الذي قمت بتنزيله من التبويب الأول (PWABuilder).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-black text-sm flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-gray-100">إضافة صور التطبيق والوصف (Store Listing)</h5>
                    <p className="text-gray-400 leading-relaxed">
                      أضف وصف التطبيق: <em>"التطبيق الرسمي لأكاديمية بايبوخت (B.A.T) الرياضية بإشراف الكابتن زيد محمد خرشيد لمتابعة التمارين والتبليغات والتقييمات"</em>، وارفع لقطات شاشة للتطبيق وأيقونة الأكاديمية.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-emerald-500/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">5</div>
                  <div className="space-y-1 text-xs">
                    <h5 className="font-bold text-emerald-200">إرسال التطبيق للمراجعة والنشر</h5>
                    <p className="text-gray-300 leading-relaxed">
                      اضغط على <strong>Send for review</strong>. تقوم شركة Google بمراجعة التطبيق خلال 24 إلى 72 ساعة، ثم يصبح التطبيق متاحاً لجميع الناس على متجر Play Store مع التحديثات التلقائية!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Apple App Store Release */}
          {activeTab === 'app_store' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17221A] to-[#101A14] border border-amber-500/40">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>معلومة مهمة جداً بخصوص متجر آبل ستور (Apple App Store للايفون):</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  هواتف الآيفون (iOS) <strong className="text-amber-300">لا تدعم صيغة APK نهائياً</strong> لأن ملفات APK مخصصة فقط لنظام أندرويد.
                  لنشر التطبيق على متجر آبل ستور للايفون، يتم استخدام حزمة <strong>iOS (.ipa / Xcode Project)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 space-y-2 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center">1</div>
                  <h5 className="font-bold text-gray-100">حساب Apple Developer</h5>
                  <p className="text-gray-400 leading-relaxed">
                    يتطلب إنشاء حساب مطور في <a href="https://developer.apple.com" target="_blank" rel="noreferrer" className="text-amber-300 underline">developer.apple.com</a> باشتراك سنوي قيمته 99 دولار سنوياً لشركة آبل.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 space-y-2 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center">2</div>
                  <h5 className="font-bold text-gray-100">تنزيل حزمة iOS</h5>
                  <p className="text-gray-400 leading-relaxed">
                    من خلال موقع <strong>PWABuilder</strong> اختر خيار <strong>iOS</strong> وسيقوم بتوليد مشروع Xcode كامل جاهز للتوقيع والنشر.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 space-y-2 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 font-black text-sm flex items-center justify-center">3</div>
                  <h5 className="font-bold text-gray-100">الرفع عبر App Store Connect</h5>
                  <p className="text-gray-400 leading-relaxed">
                    يتم رفع الحزمة بواسطة برنامج <strong>Transporter</strong> أو <strong>Xcode</strong> على متجر <a href="https://appstoreconnect.apple.com" target="_blank" rel="noreferrer" className="text-amber-300 underline">appstoreconnect.apple.com</a>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101713] border border-emerald-500/30 space-y-2 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-sm flex items-center justify-center">4</div>
                  <h5 className="font-bold text-emerald-200">حل بديل فوري للايفون (بدون 99$)</h5>
                  <p className="text-gray-300 leading-relaxed">
                    يمكن للاعبي الآيفون فتح رابط التطبيق في متصفح Safari واختيار <strong>"إضافة إلى الصفحة الرئيسية"</strong> ليظهر فوراً كأيقونة تطبيق كامل بدون الحاجة لدفع أي رسوم لشركة آبل!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Instant PWA Install for Players */}
          {activeTab === 'instant_pwa' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#112419] to-[#0A1A11] border border-emerald-500/40 text-xs text-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h4 className="text-sm font-black text-emerald-300">
                    أسرع حل: التثبيت المباشر على هواتف اللاعبين فوراً بنقرة واحدة
                  </h4>
                </div>
                <p className="leading-relaxed text-gray-300">
                  هل تعلم أنه ليس عليك الانتظار لحين مراجعة المتاجر؟ تطبيق أكاديمية بايبوخت (B.A.T) مبني بتقنية <strong>Progressive Web App (PWA)</strong> العالمية، مما يعني أن أي شخص في العالم يفتح الرابط يستطيع تثبيته فوراً على هاتفه كأيقونة أصلية!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                    <p className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      <span>على هواتف الأندرويد (سامسونج، شاومي، إلخ):</span>
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      بمجرد فتح الرابط في متصفح Chrome، يظهر شريط تلقائي <strong>"تثبيت التطبيق على الهاتف"</strong>، أو الضغط على زر التثبيت الموجود بأعلى شاشة التطبيق.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                    <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      <span>على هواتف الآيفون (iPhone):</span>
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      يفتح اللاعب الرابط في متصفح <strong>Safari</strong>، ثم يضغط زر المشاركة (المربع ذو السهم للأعلى) ويختار <strong>"إضافة إلى الصفحة الرئيسية (Add to Home Screen)"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Share Message Template */}
              <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">نص رسالة جاهزة لإرسالها للاعبين وأولياء الأمور بالواتساب:</span>
                  <button
                    onClick={() => copyText('whatsapp-msg', `أهلاً بكم في تطبيق أكاديمية بايبوخت (B.A.T) الرياضية بإشراف الكابتن زيد محمد خرشيد ⚽🏆
يمكنكم تثبيت التطبيق مباشرة على هواتفكم لمتابعة مواعيد التمارين والتبليغات وتنبيهات النوم والتقييمات اليومية عبر الرابط التالي:
${appPublishedUrl}`)}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {copiedKey === 'whatsapp-msg' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم نسخ الرسالة!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ نص الرسالة</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
{`أهلاً بكم في تطبيق أكاديمية بايبوخت (B.A.T) الرياضية بإشراف الكابتن زيد محمد خرشيد ⚽🏆
يمكنكم تثبيت التطبيق مباشرة على هواتفكم لمتابعة مواعيد التمارين والتبليغات وتنبيهات النوم والتقييمات اليومية عبر الرابط التالي:
${appPublishedUrl}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: Flutter Original Project Code */}
          {activeTab === 'flutter_code' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#101713] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-amber-300 mb-0.5">مشروع Flutter الكامل مع نظام shared_preferences</h4>
                  <p className="text-gray-400">كود فلاتر الأصلي المكتوب بلغة Dart، جاهز للبناء عبر Flutter SDK.</p>
                </div>
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10">
                  {(['main', 'auth', 'pubspec', 'screens'] as const).map((snip) => (
                    <button
                      key={snip}
                      onClick={() => setActiveCodeSnippet(snip)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeCodeSnippet === snip
                          ? 'bg-amber-400 text-black shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {snip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Box with Copy */}
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={() => copyText(activeCodeSnippet, flutterSnippets[activeCodeSnippet])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold backdrop-blur transition-all shadow-md"
                  >
                    {copiedKey === activeCodeSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="text-xs font-mono text-gray-300 p-5 rounded-2xl bg-black/80 border border-white/10 overflow-x-auto leading-relaxed dir-ltr text-left max-h-[50vh]">
                  <code>{flutterSnippets[activeCodeSnippet]}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: Android Studio / Capacitor */}
          {activeTab === 'android_studio' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#101713] border border-white/10 text-xs text-gray-300 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>تصدير وبناء التطبيق عبر Android Studio بواسطة Capacitor:</span>
                </h4>
                <p className="leading-relaxed text-gray-400">
                  تم تضمين ملف <code className="text-amber-300 font-mono">capacitor.config.json</code> بهوية <code className="text-amber-300 font-mono">com.batacademy.app</code> في جذر المشروع. لبناء ملف APK في جهازك:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/80 border border-white/10 space-y-3 dir-ltr text-left">
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
                  <span className="font-mono text-amber-300">أوامر سطر الأوامر (Terminal Commands):</span>
                  <button
                    onClick={() => copyText('cap-commands', `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap copy
npx cap open android`)}
                    className="text-amber-300 hover:text-amber-200 text-xs flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Commands</span>
                  </button>
                </div>

                <pre className="text-xs font-mono text-emerald-400 leading-loose">
                  <code>
{`# 1. تثبيت كاباسيتور لنظام أندرويد
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. إنشاء مجلد الأندرويد الأصلي
npx cap add android

# 3. مزامنة ملفات الويب والأيقونات
npm run build && npx cap copy

# 4. فتح المشروع في برنامج Android Studio
npx cap open android`}
                  </code>
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  داخل <strong>Android Studio</strong> اضغط على القائمة العلوية: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> لإنشاء ملف الـ APK النهائي.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-white/10 bg-[#0E1511] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 text-center sm:text-right">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>أكاديمية بايبوخت (B.A.T) • إشراف الكابتن زيد محمد خرشيد • جاهز للنشر والمتاجر</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <a
              href={pwaBuilderDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>توليد APK الآن (PWABuilder)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-gray-200 font-bold rounded-xl transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

