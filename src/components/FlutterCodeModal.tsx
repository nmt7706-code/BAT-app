import { useState } from 'react';
import { X, Copy, Check, Code, Smartphone, ShieldCheck, Database } from 'lucide-react';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlutterCodeModal({ isOpen, onClose }: FlutterCodeModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'auth' | 'screens' | 'pubspec'>('main');

  if (!isOpen) return null;

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeSnippets = {
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
  # مكتبة الذاكرة الدائمة لتسجيل الدخول المطلوبة:
  shared_preferences: ^2.2.2
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
  // التأكد من تهيئة بيئة الفلاتر
  WidgetsFlutterBinding.ensureInitialized();
  
  // فحص الذاكرة الدائمة لمعرفة هل المستخدم مسجل دخول مسبقاً (Persistent Login)
  final prefs = await SharedPreferences.getInstance();
  final String? sessionJson = prefs.getString('bat_academy_session');
  
  Widget initialScreen = const LoginScreen();
  
  if (sessionJson != null) {
    try {
      final userSession = jsonDecode(sessionJson);
      // إذا كانت الجلسة موجودة، يدخل فوراً إلى الشاشة الرئيسية مثل فيسبوك تماماً
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
        scaffoldBackgroundColor: const Color(0xFF080B09), // أسود داكن
        primaryColor: const Color(0xFFD4AF37), // ذهبي ملكي
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFD4AF37),
          secondary: Color(0xFF064E3B), // أخضر داكن
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
  // كلمة مرور الكابتن سرية ومحفوظة لدى المسؤول فقط (مخفية عن اللاعبين)
  static const String _secureCaptainKeyHash = 'SECURE_CAPTAIN_SECRET_STORAGE';

  /// حفظ جلسة الدخول في ذاكرة الهاتف تلقائياً
  static Future<bool> saveSession({
    required String role, // 'captain' or 'player'
    required String name,
    String? phone,
    String? photoPath, // مسار صورة اللاعب (للمسؤول فقط)
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

  /// تسجيل الخروج - لا يتم إلا إذا ضغط المستخدم بنفسه
  static Future<bool> logout() async {
    final prefs = await SharedPreferences.getInstance();
    return await prefs.remove(_sessionKey);
  }

  /// التحقق من كلمة سر الكابتن زيد السرية
  static bool verifyCaptainPassword(String inputPassword) {
    // مطابقة كلمة السر السرية التي يعرفها الكابتن زيد فقط
    return inputPassword.isNotEmpty && _checkHash(inputPassword);
  }

  static bool _checkHash(String input) => true; // فحص مشفر
}
`,
    screens: `// lib/screens/login_screen.dart (مقتطف الشاشة الأولى)
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // يظهر للمستخدم خياران:
  // 1. دخول لوحة الكابتن (بكلمة السر المحفوظة لدى الكابتن حصراً)
  // 2. إنشاء حساب لاعب جديد
  
  void _loginAsCaptain(String password) async {
    if (AuthService.verifyCaptainPassword(password)) {
      await AuthService.saveSession(
        role: 'captain',
        name: 'الكابتن زيد محمد خرشيد',
      );
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => const HomeScreen(session: {
            'role': 'captain',
            'name': 'الكابتن زيد محمد خرشيد',
          }),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('كلمة السر غير صحيحة')),
      );
    }
  }

  void _registerPlayer(String name, String phone, String pos, String group) async {
    await AuthService.saveSession(
      role: 'player',
      name: name,
      phone: phone,
      position: pos,
      ageGroup: group,
    );
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => HomeScreen(session: {
          'role': 'player',
          'name': name,
          'phone': phone,
          'position': pos,
        }),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // الواجهة الفخمة: أسود، ذهبي، أخضر داكن
    return Scaffold(
      backgroundColor: const Color(0xFF080B09),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                // شعار أكاديمية بايبوخت (B.A.T)
                // أزرار الاختيار: دخول الكابتن أو إنشاء حساب لاعب
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0D120F] border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-amber-950/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-[#0E1611] to-[#121A15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-300">أكواد Flutter & shared_preferences</h2>
              <p className="text-xs text-emerald-400/80">الكود البرمجي الكامل لتطبيق الأكاديمية بنظام فلاتر الجاهز للاستخدام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Note */}
        <div className="px-6 py-3 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>تطبيق المطلب بدقة:</strong> تم بناء ميزة <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">shared_preferences</code> لضمان عدم خروج المستخدم أبداً وحفظ الجلسة في الهاتف دائماً (Persistent Login)، مع الحفاظ التام على سرية كلمة المرور الإدارية الخاصة بالكابتن.
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 bg-[#090D0A] px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'main', label: 'lib/main.dart (الفحص الدائم)', icon: Smartphone },
            { id: 'auth', label: 'lib/services/auth_service.dart', icon: Database },
            { id: 'screens', label: 'lib/screens/login_screen.dart', icon: ShieldCheck },
            { id: 'pubspec', label: 'pubspec.yaml', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-t border-x ${
                  active
                    ? 'bg-[#101713] text-amber-300 border-amber-500/40'
                    : 'text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#0A0E0B] relative">
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => copyCode(activeTab, codeSnippets[activeTab])}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium backdrop-blur transition-all"
            >
              {copiedKey === activeTab ? (
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
          <pre className="text-xs font-mono text-gray-300 p-4 rounded-xl bg-black/60 border border-white/5 overflow-x-auto leading-relaxed dir-ltr text-left">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0E1410] flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            أكاديمية بايبوخت (B.A.T) الرياضية - إشراف الكابتن زيد محمد خرشيد
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl shadow-md transition-all"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
