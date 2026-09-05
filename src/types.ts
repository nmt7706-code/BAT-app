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
  attendanceRate: number; // 0 - 100
  performanceRating: number; // 1 - 10
  readiness: 'جاهز للمباريات' | 'تأهيل بدني' | 'إصابة طفيفة';
  notes: string;
  joinDate: string;
  // التقييم اليومي الصادر من الكابتن زيد
  todayEvaluation?: DailyEvaluation;
  evaluationHistory?: DailyEvaluation[];
}
