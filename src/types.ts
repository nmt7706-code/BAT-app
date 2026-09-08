export type UserRole = 'captain' | 'player';

export interface UserSession {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  photoUrl?: string;
  position?: string;
  ageGroup?: string;
  jerseyNumber?: number;
  loginTimestamp: number;
  fcmToken?: string;
  notificationsEnabled?: boolean;
}

export interface PushNotificationRecord {
  id: string;
  title: string;
  body: string;
  category: 'training' | 'sleep' | 'evaluation' | 'urgent' | 'general' | 'match' | 'recovery';
  timestamp: string;
  sender: string;
  targetGroup?: string;
  targetPlayerId?: string;
}

export type ExerciseCategory = 'physical' | 'tactical' | 'skills' | 'goalkeeping' | 'recovery';
export type ExerciseIntensity = 'خفيف' | 'متوسط' | 'شديد' | 'احترافي';

export interface Exercise {
  id: string;
  title: string;
  category: ExerciseCategory;
  intensity: ExerciseIntensity;
  durationMinutes: number;
  description: string;
  instructions: string[];
  targetFocus: string;
  addedBy: string;
  date: string;
}

export type AnnouncementType = 'urgent' | 'match' | 'training' | 'general' | 'sleep' | 'recovery';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  author: string;
  date: string;
  targetGroup: string;
  isPinned?: boolean;
  sendPushNotification?: boolean; // يرسل إشعاراً فورياً لهاتف اللاعب
  createdAt?: number; // وقت النشر لحساب مدة الـ 24 ساعة والحذف التلقائي
}

export type DailyEvaluationVerdict = 'ممتاز جداً' | 'جيد جداً' | 'جيد' | 'يحتاج تركيز' | 'تراجع انضباطي';

export interface DailyEvaluation {
  id: string;
  date: string; // YYYY-MM-DD or readable
  verdict: DailyEvaluationVerdict;
  ratingScore: number; // 1 - 10
  feedback: string;
  evaluator: string; // الكابتن زيد محمد خرشيد
  acknowledgedByPlayer?: boolean;
}

export interface PlayerRecord {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  jerseyNumber: number;
  position: string;
  ageGroup: string;
  age?: number;
  attendanceRate: number; // 0 - 100
  performanceRating: number; // 1 - 10
  readiness: 'جاهز للمباريات' | 'تأهيل بدني' | 'إصابة طفيفة';
  notes: string;
  bio?: string;
  joinDate: string;
  // التقييم اليومي الصادر من الكابتن زيد
  todayEvaluation?: DailyEvaluation;
  evaluationHistory?: DailyEvaluation[];
}

export interface PlayerOfTheWeek {
  id: string;
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  position: string;
  ageGroup: string;
  photoUrl?: string;
  bio: string; // سيرته المسجلة في البرنامج
  reason: string; // سبب اختياره من الكابتن زيد
  selectedDate: string; // تاريخ الاختيار
  selectedBy: string; // الكابتن زيد محمد خرشيد
  goalsThisWeek?: number;
  performanceRating?: number;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'whatsapp' | 'telegram' | 'instagram' | 'tiktok' | 'youtube' | 'phone';
  title: string;
  url: string;
  description?: string;
  isOfficial?: boolean;
}

export type MainTabType = 'home' | 'players' | 'matches' | 'scorers' | 'announcements' | 'chat' | 'settings' | 'workouts';

export type MatchStatus = 'upcoming' | 'ongoing' | 'finished';

export interface MatchRecord {
  id: string;
  opponent: string;
  opponentLogo?: string;
  date: string;
  time: string;
  location: string;
  ageGroup: string;
  status: MatchStatus;
  homeScore?: number; // أهداف بايبوخت (B.A.T)
  awayScore?: number; // أهداف الخصم
  batScorers?: string[]; // مسجلو أهداف الأكاديمية
  captainNotes?: string;
  squadCalledUp?: string[];
}

export interface TopScorer {
  playerId: string;
  playerName: string;
  jerseyNumber: number;
  ageGroup: string;
  goals: number;
  assists: number;
  matchesPlayed: number;
  photoUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  jerseyNumber?: number;
  content: string;
  timestamp: number;
  isPinned?: boolean;
}

export interface ChatRoomState {
  isLocked: boolean;
  lockedBy?: string;
  lockedReason?: string;
  updatedAt?: number;
}

// اكواد الدخول
export interface AcademyPasscodes {
  captainCode: string; // كود المسؤول (default: ZAID2026)
  playerCode: string;  // كود اللاعبين (default: BAT2015)
}

// ملاحظة اللاعب للمسؤول (واحدة فقط في اليوم)
export interface PlayerPrivateNote {
  id: string;
  playerId: string;
  playerName: string;
  playerPhone?: string;
  playerAgeGroup?: string;
  note: string;
  createdAt: number;
  dateStr: string; // YYYY-MM-DD
  readByCaptain?: boolean;
}

// سجل تسجيل الدخول للبرنامج
export interface LoginAuditRecord {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  method: 'whatsapp' | 'google' | 'facebook' | 'registration' | 'direct_login' | 'captain_code';
  methodLabel: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  userPhone?: string;
  userAge?: number;
}

// إعدادات ونغمات الإشعارات
export type NotificationRingtone = 'whistle' | 'stadium' | 'bell' | 'pop' | 'arena';

export interface UserNotificationSettings {
  enabled: boolean;
  ringtone: NotificationRingtone;
}

// حظر المستخدمين غير المنتمين للأكاديمية
export interface BannedUser {
  id: string;
  name: string;
  phone?: string;
  reason: string;
  bannedAt: number;
  bannedDate: string;
}

// وضع المظهر (الوضع الداكن / الفاتح / تلقائي)
export type ThemeMode = 'light' | 'dark' | 'auto';
