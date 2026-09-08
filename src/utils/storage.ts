import {
  UserSession,
  Exercise,
  Announcement,
  PlayerRecord,
  PushNotificationRecord,
  SocialLink,
  MatchRecord,
  TopScorer,
  ChatMessage,
  ChatRoomState,
  PlayerOfTheWeek,
  AcademyPasscodes,
  PlayerPrivateNote,
  LoginAuditRecord,
  UserNotificationSettings,
  BannedUser,
  ThemeMode,
} from '../types';

const STORAGE_KEYS = {
  SESSION: 'bat_academy_persistent_session',
  PLAYERS: 'bat_academy_players_db',
  EXERCISES: 'bat_academy_exercises_db',
  ANNOUNCEMENTS: 'bat_academy_announcements_db',
  NOTIFICATIONS: 'bat_academy_fcm_notifications_db',
  LAST_PLAYER_ID: 'bat_academy_last_player_id',
  SOCIAL_LINKS: 'bat_academy_social_links_db',
  MATCHES: 'bat_academy_matches_db',
  TOP_SCORERS: 'bat_academy_top_scorers_db',
  CHAT_MESSAGES: 'bat_academy_chat_messages_db',
  CHAT_STATE: 'bat_academy_chat_state_db',
  PLAYER_OF_THE_WEEK: 'bat_academy_player_of_the_week_db',
  PASSCODES: 'bat_academy_passcodes_db',
  PLAYER_NOTES: 'bat_academy_player_notes_db',
  LOGIN_AUDIT_LOGS: 'bat_academy_login_audit_logs_db',
  NOTIFICATION_SETTINGS: 'bat_academy_notification_settings_db',
  BANNED_USERS: 'bat_academy_banned_users_db',
  PUBLIC_APP_URL: 'bat_academy_public_app_url',
  THEME_MODE: 'bat_academy_theme_mode',
  DELETED_PLAYER_IDS: 'bat_academy_deleted_players_db',
  DELETED_ANNOUNCEMENT_IDS: 'bat_academy_deleted_announcements_db',
  DELETED_TOP_SCORER_IDS: 'bat_academy_deleted_scorers_db',
};

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'soc-facebook',
    platform: 'facebook',
    title: 'صفحة فيسبوك الرسمية - أكاديمية بايبوخت',
    url: 'https://www.facebook.com/share/19JQN6BWW5/',
    description: 'الصفحة الرسمية المعتمدة لأكاديمية بايبوخت الرياضية على فيسبوك',
    isOfficial: true,
  },
  {
    id: 'soc-whatsapp',
    platform: 'whatsapp',
    title: 'كروب واتساب الأكاديمية الرسمي',
    url: 'https://chat.whatsapp.com/FcCnEhAiey0IQqB1nhgIAJ?mode=gi_t',
    description: 'المجموعة المخصصة لتبليغات التمارين ومواعيد المباريات اليومية',
    isOfficial: true,
  },
  {
    id: 'soc-tiktok',
    platform: 'tiktok',
    title: 'حساب تيك توك الرسمي (@batt_2025)',
    url: 'https://www.tiktok.com/@batt_2025',
    description: 'الحساب الرسمي لأكاديمية بايبوخت على تيك توك - لقطات وأهداف التمارين والمباريات',
    isOfficial: true,
  },
];

// Initial Seed Data for B.A.T Academy (بايبوخت)
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'تجمع تدريبي استثنائي - الاستعداد للبطولة الودية',
    content: 'يُرجى من جميع اللاعبين الحضور بالزي الرسمي الكامل للأكاديمية (الأسود والذهبي) يوم غد في تمام الساعة 5:00 مساءً. التركيز على الإحماء التكتيكي وتوزيع التشكيلة.',
    type: 'training',
    author: 'الكابتن زيد محمد خرشيد',
    date: 'اليوم، 04:30 م',
    targetGroup: 'كافة الفئات العمرية',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 2, // قبل ساعتين (ساري المفعول لـ 24 ساعة)
  },
  {
    id: 'ann-2',
    title: 'مباراة ودية هامة ضد أكاديمية الأمل الرياضية',
    content: 'تم تثبيت موعد المباراة الودية يوم الجمعة القادمة الساعة 6:30 مساءً على ملعب الأكاديمية الرئيسي. قائمة اللاعبين الأساسيين ستُعلن بعد تمرين الخميس.',
    type: 'match',
    author: 'الكابتن زيد محمد خرشيد',
    date: 'أمس، 08:15 م',
    targetGroup: 'فئة الشباب والناشئين',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 8, // قبل 8 ساعات
  },
  {
    id: 'ann-3',
    title: 'توجيهات غذائية وصحية خاصة بالاستشفاء العضلي',
    content: 'يُشدد الكابتن زيد على شرب ما لا يقل عن 3 لترات ماء يومياً والالتزام بساعات النوم الكافية (8 ساعات) لضمان أعلى جاهزية بدنية وتقليل الإصابات العضلية.',
    type: 'general',
    author: 'الكابتن زيد محمد خرشيد',
    date: 'منذ يومين',
    targetGroup: 'جميع اللاعبين',
    isPinned: false,
    createdAt: Date.now() - 3600000 * 30, // أكثر من 24 ساعة (لا يظهر في الشاشة الرئيسية)
  },
];

const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    title: 'بناء الهجمة السريعة والتحول الهجومي (B.A.T Transition)',
    category: 'tactical',
    intensity: 'احترافي',
    durationMinutes: 45,
    targetFocus: 'سرعة اتخاذ القرار، التمرير المباشر، استغلال المساحات',
    description: 'تمرين تكتيكي لكسر الضغط العالي والانتقال السريع من الثلث الدفاعي إلى الثلث الهجومي بأقل من 4 لمسات.',
    instructions: [
      'تقسيم الفريق إلى مجموعتين (6 ضد 4)',
      'اللعب بلمستين إجبارياً في وسط الملعب',
      'الانطلاق بالكرة على الأطراف فور استرجاعها',
      'إنهاء الهجمة خلال 10 ثوانٍ كحد أقصى',
    ],
    addedBy: 'الكابتن زيد محمد خرشيد',
    date: '2025-05-10',
  },
  {
    id: 'ex-2',
    title: 'رفع الكفاءة الهوائية والسرعة الانفجارية (HIIT Conditioning)',
    category: 'physical',
    intensity: 'شديد',
    durationMinutes: 30,
    targetFocus: 'القدرة العضلية، تسارع الخطوة، التحمل الدوري التنفسي',
    description: 'تمارين الرشاقة بين الأقماع مع سبرنتات متقطعة (Interval Sprints) بزوايا مختلفة ومحاكاة مواقف اللعب الحقيقي.',
    instructions: [
      'إحماء ديناميكي لمدة 8 دقائق',
      'ركض متعرج بين الأقماع 20 متراً بأقصى سرعة',
      'القفز فوق الحواجز المنخفضة والعودة للركض الخلفي',
      'فترة راحة إيجابية 45 ثانية بين كل 4 تكرارات',
    ],
    addedBy: 'الكابتن زيد محمد خرشيد',
    date: '2025-05-12',
  },
  {
    id: 'ex-3',
    title: 'التحكم بالكرة تحت الضغط والمراوغة الضيقة',
    category: 'skills',
    intensity: 'متوسط',
    durationMinutes: 35,
    targetFocus: 'حماية الكرة بالجسد، اللمسة الأولى الدقيقة، التمويه',
    description: 'تمرين في مساحات مربعة صغيرة (Rondo 4v2) مع قيود زمنية وتكثيف الضغط الدفاعي.',
    instructions: [
      'اللعب في مربع 10x10 متر',
      'المحافظة على الاستحواذ بالقدم الأضعف بالتناوب',
      'تغيير اتجاه اللعب عند اقتراب المدافع مباشرة',
    ],
    addedBy: 'الكابتن زيد محمد خرشيد',
    date: '2025-05-13',
  },
  {
    id: 'ex-4',
    title: 'رد الفعل والتعامل مع الكرات العرضية والانفرادات',
    category: 'goalkeeping',
    intensity: 'احترافي',
    durationMinutes: 40,
    targetFocus: 'حراس المرمى: التمركز، خروج الكرات العالية، زوايا الصد',
    description: 'تدريب مخصص لحراس المرمى في الأكاديمية تحت إشراف وتوجيه الكابتن زيد لرفع سرعة الاستجابة.',
    instructions: [
      'كرات موجهة من زوايا حادة وسرعات متغيرة',
      'التدريب على النهوض الفوري بعد الصدة الأولى',
      'التواصل الصوتي الصريح مع خط الدفاع',
    ],
    addedBy: 'الكابتن زيد محمد خرشيد',
    date: '2025-05-14',
  },
];

const INITIAL_PLAYERS: PlayerRecord[] = [
  {
    id: 'pl-1',
    name: 'علي حسين باقر',
    phone: '07701234567',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    jerseyNumber: 10,
    position: 'صانع ألعاب (AMF)',
    ageGroup: 'فئة الشباب (U-19)',
    age: 18,
    attendanceRate: 96,
    performanceRating: 9.4,
    readiness: 'جاهز للمباريات',
    notes: 'رؤية ممتازة للملعب، تسديدات دقيقة بالقدم اليمنى، قائد داخل الملعب.',
    bio: 'صانع ألعاب متميز في أكاديمية بايبوخت، يتمتع بمهارات تمرير استثنائية ورؤية تكتيكية عميقة. ساهم في صناعة 8 أهداف هذا الموسم والتزام تام بالتدريبات البدنية.',
    joinDate: '2024-02-15',
  },
  {
    id: 'pl-2',
    name: 'مصطفى قاسم الجبوري',
    phone: '07809876543',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    jerseyNumber: 7,
    position: 'جناح أيمن (RWF)',
    ageGroup: 'فئة الشباب (U-19)',
    age: 18,
    attendanceRate: 92,
    performanceRating: 8.8,
    readiness: 'جاهز للمباريات',
    notes: 'سرعة انطلاقة عالية جداً، يحتاج لرفع دقة العرضيات تحت الضغط.',
    bio: 'جناح سريع وهجومي بارز في الأكاديمية، يتميز بالمراوغة في المواجهات الفردية (1 ضد 1) والتحول الهجومي السريع.',
    joinDate: '2024-03-01',
  },
  {
    id: 'pl-3',
    name: 'أحمد حيدر الركابي',
    phone: '07715554321',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    jerseyNumber: 4,
    position: 'قلب دفاع (CB)',
    ageGroup: 'فئة الناشئين (U-17)',
    age: 16,
    attendanceRate: 88,
    performanceRating: 8.5,
    readiness: 'تأهيل بدني',
    notes: 'قوة بدنية وتفوق في الكرات الهوائية، يتعافى من شد عضلي خفيف.',
    bio: 'صخرة دفاع الأكاديمية في فئة الناشئين، يمتلك قوة ارتقاء عالية وافتكاك نظيف للكرات الهوائية والأرضية.',
    joinDate: '2024-04-10',
  },
  {
    id: 'pl-4',
    name: 'حسين علاء التميمي',
    phone: '07504443322',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    jerseyNumber: 1,
    position: 'حارس مرمى (GK)',
    ageGroup: 'فئة الشباب (U-19)',
    age: 19,
    attendanceRate: 98,
    performanceRating: 9.2,
    readiness: 'جاهز للمباريات',
    notes: 'مرونة فائقة، ممتاز في الانفرادات والتوجيه المستمر لزملائه.',
    bio: 'حارس المرمى الأساسي، حقق 6 مباريات بشباك نظيفة وتألق ملفت في التصدي لركلات الجزاء والانفرادات المباشرة.',
    joinDate: '2024-01-20',
  },
  {
    id: 'pl-5',
    name: 'يوسف مهند كمال',
    phone: '07728889900',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    jerseyNumber: 9,
    position: 'رأس حربة (ST)',
    ageGroup: 'فئة الأشبال (U-15)',
    age: 14,
    attendanceRate: 90,
    performanceRating: 8.9,
    readiness: 'جاهز للمباريات',
    notes: 'حس تهديفي عالٍ، تحركات ذكية خلف المدافعين، موهبة واعدة.',
    bio: 'هداف واعد في فئة الأشبال، يتمتع بحس تهديفي عالٍ وسرعة في إنهاء الهجمات داخل منطقة الجزاء.',
    joinDate: '2024-05-02',
  },
];

export const INITIAL_PLAYER_OF_THE_WEEK: PlayerOfTheWeek = {
  id: 'pow-1',
  playerId: 'pl-1',
  playerName: 'علي حسين باقر',
  jerseyNumber: 10,
  position: 'صانع ألعاب (AMF)',
  ageGroup: 'فئة الشباب (U-19)',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  bio: 'صانع ألعاب متميز في أكاديمية بايبوخت، يتمتع بمهارات تمرير استثنائية ورؤية تكتيكية عميقة. ساهم في صناعة 8 أهداف هذا الموسم والتزام تام بالتدريبات البدنية.',
  reason: 'انضباط تكتيكي استثنائي وصناعة 3 أهداف في المباراة الودية الأخيرة، مع تحقيق المركز الأول في اختبار اللياقة والسرعة البدنية بإشراف الكابتن زيد.',
  selectedDate: 'الأسبوع الحالي',
  selectedBy: 'الكابتن زيد محمد خرشيد',
  goalsThisWeek: 2,
  performanceRating: 9.8,
};

export const INITIAL_MATCHES: MatchRecord[] = [
  {
    id: 'mat-1',
    opponent: 'أكاديمية النجوم الدولية',
    date: '2026-09-12',
    time: '05:30 م',
    location: 'ملعب بايبوخت الرئيسي (B.A.T Arena)',
    ageGroup: 'فئة الشباب (U-19)',
    status: 'upcoming',
    captainNotes: 'مباراة حاسمة لتحديد المتصدر، الحضور الساعة 4:30 بالزي الرسمي المعتمد. التركيز على الضغط العالي.',
    squadCalledUp: ['علي أحمد كريم', 'زيدون قاسم', 'محمد يوسف', 'حيدر كرار', 'مصطفى حسن', 'ياسين طارق'],
  },
  {
    id: 'mat-2',
    opponent: 'نادي شباب الموصل الرياضي',
    date: '2026-09-18',
    time: '04:45 م',
    location: 'ملعب الموصل الأولمبي',
    ageGroup: 'فئة الناشئين (U-15)',
    status: 'upcoming',
    captainNotes: 'مباراة ودية للاحتكاك وتطبيق الخطة الهجومية 4-3-3 مع الاعتماد على الأطراف.',
    squadCalledUp: ['يوسف مهند كمال', 'عمر رياض', 'ياسين طارق', 'أحمد محمود', 'بلال سامي'],
  },
  {
    id: 'mat-3',
    opponent: 'أكاديمية الفتوة الرياضية',
    date: '2026-09-02',
    time: '05:00 م',
    location: 'ملعب بايبوخت الرئيسي',
    ageGroup: 'فئة الشباب (U-19)',
    status: 'finished',
    homeScore: 3,
    awayScore: 1,
    batScorers: ['علي أحمد (18\')', 'زيدون قاسم (54\')', 'علي أحمد (82\')'],
    captainNotes: 'أداء بطولي وانضباط تكتيكي استثنائي. تميز خط الوسط في بناء الهجمات المرتدة وتألق الحارس مصطفى حسن.',
  },
  {
    id: 'mat-4',
    opponent: 'نادي الرافدين الرياضي',
    date: '2026-08-25',
    time: '06:00 م',
    location: 'ملعب بايبوخت الرئيسي',
    ageGroup: 'فئة الأشبال والناشئين (U-15)',
    status: 'finished',
    homeScore: 4,
    awayScore: 2,
    batScorers: ['يوسف مهند (12\')', 'علي أحمد (39\')', 'عمر رياض (67\')', 'يوسف مهند (79\')'],
    captainNotes: 'فوز مستحق وتألق لافت للمهاجمين. معالجة بعض الثغرات الدفاعية في تمرين الغد.',
  },
];

export const INITIAL_TOP_SCORERS: TopScorer[] = [
  {
    playerId: 'pl-1',
    playerName: 'علي أحمد كريم',
    jerseyNumber: 10,
    ageGroup: 'فئة الشباب (U-19)',
    goals: 12,
    assists: 6,
    matchesPlayed: 8,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    playerId: 'pl-5',
    playerName: 'يوسف مهند كمال',
    jerseyNumber: 9,
    ageGroup: 'فئة الأشبال (U-15)',
    goals: 9,
    assists: 4,
    matchesPlayed: 7,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
  {
    playerId: 'pl-2',
    playerName: 'محمد جاسم محمد',
    jerseyNumber: 4,
    ageGroup: 'فئة الناشئين (U-17)',
    goals: 6,
    assists: 8,
    matchesPlayed: 8,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    playerId: 'pl-3',
    playerName: 'كرار حيدر علي',
    jerseyNumber: 8,
    ageGroup: 'فئة البراعم (U-12)',
    goals: 5,
    assists: 5,
    matchesPlayed: 6,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    playerId: 'pl-ext-1',
    playerName: 'عمر رياض السامرائي',
    jerseyNumber: 7,
    ageGroup: 'فئة الناشئين (U-15)',
    goals: 4,
    assists: 7,
    matchesPlayed: 7,
  },
  {
    playerId: 'pl-ext-2',
    playerName: 'زيدون قاسم الدوري',
    jerseyNumber: 11,
    ageGroup: 'فئة الشباب (U-19)',
    goals: 3,
    assists: 6,
    matchesPlayed: 6,
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    senderId: 'captain-zaid',
    senderName: 'الكابتن زيد محمد خرشيد (الإدارة)',
    senderRole: 'captain',
    content: 'أهلاً وسهلاً بجميع أبطال ونجوم أكاديمية بايبوخت (B.A.T). هذه غرفة الدردشة الرسمية المعتمدة للتواصل الرياضي، الاستفسارات الفنية، وتنسيق التمارين. يرجى من الجميع التحلي بالروح الرياضية والالتزام بالمواعيد.',
    timestamp: Date.now() - 3600000 * 5,
    isPinned: true,
  },
  {
    id: 'chat-2',
    senderId: 'pl-1',
    senderName: 'علي أحمد كريم',
    senderRole: 'player',
    jerseyNumber: 10,
    content: 'السلام عليكم كابتن زيد، تمرين الأمس كان عالي التركيز واستفدنا جداً من خطة الضغط، جاهزون للمباراة القادمة بعون الله! ⚽💪',
    timestamp: Date.now() - 3600000 * 3,
  },
  {
    id: 'chat-3',
    senderId: 'pl-5',
    senderName: 'يوسف مهند كمال',
    senderRole: 'player',
    jerseyNumber: 9,
    content: 'يعطيك الصحة والعافية كابتن، بخصوص مواعيد باص الأكاديمية يوم الجمعة هل التحرك الساعة 4:00 تماماً؟',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'chat-4',
    senderId: 'captain-zaid',
    senderName: 'الكابتن زيد محمد خرشيد (الإدارة)',
    senderRole: 'captain',
    content: 'وعليكم السلام يا أبطال، نعم تماماً الباص يتحرك 04:00 عصراً من أمام مقر الأكاديمية، والالتزام بالزي الرسمي الموحد إلزامي للجميع.',
    timestamp: Date.now() - 3600000 * 1,
  },
];

export const INITIAL_CHAT_STATE: ChatRoomState = {
  isLocked: false,
  lockedBy: undefined,
  lockedReason: undefined,
  updatedAt: Date.now(),
};

export const StorageService = {
  // Persistent Session (Equivalent to SharedPreferences in Flutter)
  getSession(): UserSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      return JSON.parse(data) as UserSession;
    } catch {
      return null;
    }
  },

  setSession(session: UserSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Reset all application data (simulates uninstall and reinstall)
  reinstallApp(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
  },

  // Players Management
  getDeletedPlayerIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_PLAYER_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getPlayers(): PlayerRecord[] {
    try {
      const deletedIds = this.getDeletedPlayerIds();
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (!data) {
        const initial = INITIAL_PLAYERS.filter((p) => !deletedIds.includes(p.id));
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(initial));
        return initial;
      }
      const parsed: PlayerRecord[] = JSON.parse(data);
      return parsed.filter((p) => !deletedIds.includes(p.id));
    } catch {
      return INITIAL_PLAYERS;
    }
  },

  savePlayer(player: PlayerRecord): void {
    const players = this.getPlayers();
    const existingIndex = players.findIndex((p) => p.id === player.id);
    if (existingIndex >= 0) {
      players[existingIndex] = player;
    } else {
      players.unshift(player);
    }
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    this.notifyChannel('PLAYERS_UPDATED', player);
  },

  deletePlayer(playerId: string): void {
    // 1. Record in permanently deleted IDs list
    const deletedIds = this.getDeletedPlayerIds();
    if (!deletedIds.includes(playerId)) {
      deletedIds.push(playerId);
      localStorage.setItem(STORAGE_KEYS.DELETED_PLAYER_IDS, JSON.stringify(deletedIds));
    }

    // 2. Remove from players list
    const players = this.getPlayers().filter((p) => p.id !== playerId);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    // 3. Remove from Top Scorers
    this.deleteTopScorer(playerId);

    // 4. Remove from Player Notes
    try {
      const notes = this.getPlayerNotes().filter((n) => n.playerId !== playerId);
      localStorage.setItem(STORAGE_KEYS.PLAYER_NOTES, JSON.stringify(notes));
    } catch {
      // ignore
    }

    // 5. Invalidate active session immediately if it belongs to this player
    const currentSession = this.getSession();
    if (currentSession && (currentSession.id === playerId || currentSession.phone && players.every(p => p.phone !== currentSession.phone))) {
      this.clearSession();
    }

    // 6. Broadcast real-time deletion and revocation across all windows/tabs
    this.notifyChannel('PLAYERS_UPDATED', { deletedId: playerId });
    this.notifyChannel('SESSION_REVOKED', { revokedPlayerId: playerId });
  },

  getLastPlayerId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_PLAYER_ID);
    } catch {
      return null;
    }
  },

  setLastPlayerId(playerId: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYER_ID, playerId);
    } catch {
      // ignore
    }
  },

  findPlayerByPhoneOrName(query: string): PlayerRecord | null {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return null;
    const cleanDigits = cleanQuery.replace(/[^0-9]/g, '');
    const players = this.getPlayers();

    return players.find((p) => {
      const pCleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
      if (cleanDigits.length >= 4 && pCleanPhone.length >= 4) {
        if (pCleanPhone === cleanDigits || pCleanPhone.endsWith(cleanDigits) || cleanDigits.endsWith(pCleanPhone)) {
          return true;
        }
      }
      return p.name.trim().toLowerCase() === cleanQuery || p.name.trim().toLowerCase().includes(cleanQuery);
    }) || null;
  },

  // Exercises
  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES));
        return INITIAL_EXERCISES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EXERCISES;
    }
  },

  saveExercise(exercise: Exercise): void {
    const exercises = this.getExercises();
    const existingIndex = exercises.findIndex((e) => e.id === exercise.id);
    if (existingIndex >= 0) {
      exercises[existingIndex] = exercise;
    } else {
      exercises.unshift(exercise);
    }
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  deleteExercise(exerciseId: string): void {
    const exercises = this.getExercises().filter((e) => e.id !== exerciseId);
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  // Announcements
  getDeletedAnnouncementIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_ANNOUNCEMENT_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getAnnouncements(): Announcement[] {
    try {
      const deletedIds = this.getDeletedAnnouncementIds();
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (!data) {
        const initial = INITIAL_ANNOUNCEMENTS.filter((a) => !deletedIds.includes(a.id));
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initial));
        return initial;
      }
      const parsed: Announcement[] = JSON.parse(data);
      // Filter out any permanently deleted IDs
      const filtered = parsed.filter((a) => !deletedIds.includes(a.id));

      // Guarantee each has a createdAt timestamp
      let modified = false;
      const normalized = filtered.map((a, idx) => {
        if (!a.createdAt) {
          modified = true;
          return {
            ...a,
            createdAt: Date.now() - (idx + 1) * 3600000 * 3,
          };
        }
        return a;
      });
      if (modified || filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  // آخر تبليغ منشور خلال آخر 24 ساعة وينحذف تلقائياً عند الكل
  getLatest24HourAnnouncement(): Announcement | null {
    const list = this.getAnnouncements();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    // Filter announcements within 24h
    const valid24h = list.filter((a) => {
      const created = a.createdAt || now;
      return now - created <= TWENTY_FOUR_HOURS;
    });

    if (valid24h.length === 0) return null;
    // Sort newest first
    valid24h.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return valid24h[0];
  },

  // تنظيف التبليغات المنتهية (أكثر من 24 ساعة) تلقائياً عند الكل إذا كانت تبليغات مؤقتة
  cleanupExpired24HourAnnouncements(): void {
    const list = this.getAnnouncements();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    // Keep category-based announcements (match, training), but clean up generic expired temporary broadcasts
    const updated = list.filter((a) => {
      const created = a.createdAt || now;
      const isWithin24h = now - created <= TWENTY_FOUR_HOURS;
      if (a.type === 'urgent') {
        return isWithin24h; // Urgent temporary announcements expire after 24h
      }
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
  },

  saveAnnouncement(announcement: Announcement): void {
    const list = this.getAnnouncements();
    const annToSave: Announcement = {
      ...announcement,
      createdAt: announcement.createdAt || Date.now(),
    };
    const existingIndex = list.findIndex((a) => a.id === annToSave.id);
    if (existingIndex >= 0) {
      list[existingIndex] = annToSave;
    } else {
      list.unshift(annToSave);
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    this.notifyChannel('ANNOUNCEMENTS_UPDATED', annToSave);
  },

  deleteAnnouncement(annId: string): void {
    // 1. Record in permanently deleted IDs list
    const deletedIds = this.getDeletedAnnouncementIds();
    if (!deletedIds.includes(annId)) {
      deletedIds.push(annId);
      localStorage.setItem(STORAGE_KEYS.DELETED_ANNOUNCEMENT_IDS, JSON.stringify(deletedIds));
    }

    // 2. Remove from announcements list
    const list = this.getAnnouncements().filter((a) => a.id !== annId);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));

    // 3. Broadcast real-time deletion to all windows and devices
    this.notifyChannel('ANNOUNCEMENTS_UPDATED', { deletedId: annId });
  },

  // FCM Notifications Inbox / Logs
  getNotificationsHistory(): PushNotificationRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotificationRecord(notification: PushNotificationRecord): void {
    const list = this.getNotificationsHistory();
    list.unshift(notification);
    // Keep last 40 notifications
    if (list.length > 40) list.length = 40;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  clearNotificationsHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  },

  // Social Links & Community Groups (فيسبوك، واتساب، تيك توك)
  getSocialLinks(): SocialLink[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(INITIAL_SOCIAL_LINKS));
        return INITIAL_SOCIAL_LINKS;
      }
      const parsed: SocialLink[] = JSON.parse(data);
      // Auto-migrate if stored links contain deleted platforms (instagram/telegram) or old URLs
      const hasOutdatedLinks = parsed.some(
        (l) =>
          l.platform === 'instagram' ||
          l.platform === 'telegram' ||
          l.url.includes('bat.academy') ||
          l.url.includes('invite/bat-academy')
      );
      if (hasOutdatedLinks || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(INITIAL_SOCIAL_LINKS));
        return INITIAL_SOCIAL_LINKS;
      }
      return parsed;
    } catch {
      return INITIAL_SOCIAL_LINKS;
    }
  },

  saveSocialLink(link: SocialLink): void {
    const list = this.getSocialLinks();
    const existingIndex = list.findIndex((l) => l.id === link.id);
    if (existingIndex >= 0) {
      list[existingIndex] = link;
    } else {
      list.push(link);
    }
    localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(list));
  },

  deleteSocialLink(linkId: string): void {
    const list = this.getSocialLinks().filter((l) => l.id !== linkId);
    localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(list));
  },

  resetSocialLinks(): SocialLink[] {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(INITIAL_SOCIAL_LINKS));
    return INITIAL_SOCIAL_LINKS;
  },

  // ==================== Matches & Results ====================
  getMatches(): MatchRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
        return INITIAL_MATCHES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MATCHES;
    }
  },

  saveMatch(match: MatchRecord): void {
    const list = this.getMatches();
    const existingIndex = list.findIndex((m) => m.id === match.id);
    if (existingIndex >= 0) {
      list[existingIndex] = match;
    } else {
      list.unshift(match);
    }
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(list));
    this.notifyChannel('MATCHES_UPDATED');
  },

  deleteMatch(matchId: string): void {
    const list = this.getMatches().filter((m) => m.id !== matchId);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(list));
    this.notifyChannel('MATCHES_UPDATED');
  },

  // ==================== Top Scorers ====================
  getDeletedScorerIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_TOP_SCORER_IDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addDeletedScorerId(playerId: string): void {
    try {
      const list = this.getDeletedScorerIds();
      if (!list.includes(playerId)) {
        list.push(playerId);
        localStorage.setItem(STORAGE_KEYS.DELETED_TOP_SCORER_IDS, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  },

  getTopScorers(): TopScorer[] {
    const deletedIds = this.getDeletedScorerIds();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOP_SCORERS);
      if (!data) {
        const seeded = INITIAL_TOP_SCORERS.filter((s) => !deletedIds.includes(s.playerId));
        localStorage.setItem(STORAGE_KEYS.TOP_SCORERS, JSON.stringify(seeded));
        return seeded;
      }
      const parsed: TopScorer[] = JSON.parse(data);
      const filtered = parsed.filter((s) => !deletedIds.includes(s.playerId));
      // Sort descending by goals, then assists
      return filtered.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
    } catch {
      return INITIAL_TOP_SCORERS.filter((s) => !deletedIds.includes(s.playerId));
    }
  },

  saveTopScorer(scorer: TopScorer): void {
    const list = this.getTopScorers();
    const existingIndex = list.findIndex((s) => s.playerId === scorer.playerId);
    if (existingIndex >= 0) {
      list[existingIndex] = scorer;
    } else {
      list.push(scorer);
    }
    list.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
    localStorage.setItem(STORAGE_KEYS.TOP_SCORERS, JSON.stringify(list));
    this.notifyChannel('SCORERS_UPDATED');
  },

  deleteTopScorer(playerId: string): void {
    // Record in deleted scorers list to permanently prevent re-seeding
    this.addDeletedScorerId(playerId);
    const list = this.getTopScorers().filter((s) => s.playerId !== playerId);
    localStorage.setItem(STORAGE_KEYS.TOP_SCORERS, JSON.stringify(list));
    this.notifyChannel('SCORERS_UPDATED');
  },

  incrementGoals(playerId: string, amount: number = 1): void {
    const list = this.getTopScorers();
    const item = list.find((s) => s.playerId === playerId);
    if (item) {
      item.goals = Math.max(0, item.goals + amount);
      list.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
      localStorage.setItem(STORAGE_KEYS.TOP_SCORERS, JSON.stringify(list));
      this.notifyChannel('SCORERS_UPDATED');
    }
  },

  // ==================== Academy Group Chat & Lock ====================
  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(INITIAL_CHAT_MESSAGES));
        return INITIAL_CHAT_MESSAGES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  },

  saveChatMessage(msg: ChatMessage): void {
    const list = this.getChatMessages();
    list.push(msg);
    // Keep last 150 messages for fast rendering
    if (list.length > 150) {
      list.splice(0, list.length - 150);
    }
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(list));
    this.notifyChannel('CHAT_MESSAGE_ADDED', msg);
  },

  sendChatMessage(
    senderId: string,
    senderName: string,
    senderRole: 'captain' | 'player',
    content: string,
    jerseyNumber?: number
  ): ChatMessage {
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      senderId,
      senderName,
      senderRole,
      content,
      jerseyNumber,
      timestamp: Date.now(),
    };
    this.saveChatMessage(msg);
    return msg;
  },

  deleteChatMessage(msgId: string): void {
    const list = this.getChatMessages().filter((m) => m.id !== msgId);
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(list));
    this.notifyChannel('CHAT_UPDATED');
  },

  clearChatMessages(): void {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([]));
    this.notifyChannel('CHAT_UPDATED');
  },

  getChatState(): ChatRoomState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_STATE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CHAT_STATE, JSON.stringify(INITIAL_CHAT_STATE));
        return INITIAL_CHAT_STATE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHAT_STATE;
    }
  },

  setChatLock(isLocked: boolean, lockedBy: string = 'الكابتن زيد محمد خرشيد', lockedReason?: string): void {
    const newState: ChatRoomState = {
      isLocked,
      lockedBy: isLocked ? lockedBy : undefined,
      lockedReason: isLocked ? lockedReason || 'بأمر الكابتن زيد للحفاظ على راحة اللاعبين والتركيز على المواعيد الرياضية' : undefined,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.CHAT_STATE, JSON.stringify(newState));
    this.notifyChannel('CHAT_LOCK_CHANGED', newState);
  },

  // ==================== Player of the Week (لاعب الأسبوع) ====================
  getPlayerOfTheWeek(): PlayerOfTheWeek {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER_OF_THE_WEEK);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLAYER_OF_THE_WEEK, JSON.stringify(INITIAL_PLAYER_OF_THE_WEEK));
        return INITIAL_PLAYER_OF_THE_WEEK;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PLAYER_OF_THE_WEEK;
    }
  },

  setPlayerOfTheWeek(pow: PlayerOfTheWeek): void {
    localStorage.setItem(STORAGE_KEYS.PLAYER_OF_THE_WEEK, JSON.stringify(pow));

    // Automatically create an announcement from Captain Zaid
    this.saveAnnouncement({
      id: 'ann-pow-' + Date.now(),
      title: `⭐ نجم الأسبوع في الأكاديمية: ${pow.playerName} (#${pow.jerseyNumber})`,
      content: `قرر الكابتن زيد محمد خرشيد اختيار ${pow.playerName} كلاعب الأسبوع!\n\nسبب الاختيار: ${pow.reason}\n\nسيرة اللاعب: ${pow.bio}`,
      type: 'general',
      author: 'الكابتن زيد محمد خرشيد',
      date: 'الآن',
      targetGroup: 'جميع اللاعبين',
      isPinned: true,
      sendPushNotification: true,
    });

    // Automatically register a push notification record
    this.saveNotificationRecord({
      id: 'push-pow-' + Date.now(),
      title: `⭐ لاعب الأسبوع: ${pow.playerName} (#${pow.jerseyNumber})`,
      body: `اختيار الكابتن زيد: ${pow.reason}`,
      category: 'evaluation',
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      sender: 'الكابتن زيد محمد خرشيد',
    });

    this.notifyChannel('PLAYER_OF_THE_WEEK_UPDATED', pow);
  },

  // ==================== Academy Passcodes (أكواد الدخول) ====================
  getAcademyPasscodes(): AcademyPasscodes {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PASSCODES);
      if (!data) {
        const defaults: AcademyPasscodes = {
          captainCode: 'ZAID2026',
          playerCode: 'BAT2015',
        };
        localStorage.setItem(STORAGE_KEYS.PASSCODES, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(data);
    } catch {
      return { captainCode: 'ZAID2026', playerCode: 'BAT2015' };
    }
  },

  setAcademyPasscodes(codes: AcademyPasscodes): void {
    localStorage.setItem(STORAGE_KEYS.PASSCODES, JSON.stringify(codes));
    this.notifyChannel('PASSCODES_UPDATED', codes);
  },

  // ==================== Player Private Notes to Captain (الملاحظات الخاصة) ====================
  getPlayerNotes(): PlayerPrivateNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER_NOTES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePlayerNote(note: PlayerPrivateNote): void {
    const list = this.getPlayerNotes();
    list.unshift(note);
    localStorage.setItem(STORAGE_KEYS.PLAYER_NOTES, JSON.stringify(list));
    this.notifyChannel('PLAYER_NOTE_ADDED', note);
  },

  deletePlayerNote(id: string): void {
    const list = this.getPlayerNotes().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYER_NOTES, JSON.stringify(list));
    this.notifyChannel('PLAYER_NOTE_DELETED', id);
  },

  hasPlayerSubmittedNoteToday(playerId: string, playerName: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const notes = this.getPlayerNotes();
    return notes.some(
      (n) =>
        (n.playerId === playerId || n.playerName.trim().toLowerCase() === playerName.trim().toLowerCase()) &&
        n.dateStr === today
    );
  },

  getPlayerNoteSubmittedToday(playerId: string, playerName: string): PlayerPrivateNote | undefined {
    const today = new Date().toISOString().split('T')[0];
    const notes = this.getPlayerNotes();
    return notes.find(
      (n) =>
        (n.playerId === playerId || n.playerName.trim().toLowerCase() === playerName.trim().toLowerCase()) &&
        n.dateStr === today
    );
  },

  // ==================== Login Audit Logs (سجل تسجيل الدخول) ====================
  getLoginAuditLogs(): LoginAuditRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGIN_AUDIT_LOGS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  logLoginEvent(record: LoginAuditRecord): void {
    const list = this.getLoginAuditLogs();
    list.unshift(record);
    if (list.length > 100) list.length = 100;
    localStorage.setItem(STORAGE_KEYS.LOGIN_AUDIT_LOGS, JSON.stringify(list));
    this.notifyChannel('LOGIN_AUDIT_LOGGED', record);
  },

  clearLoginAuditLogs(): void {
    localStorage.removeItem(STORAGE_KEYS.LOGIN_AUDIT_LOGS);
    this.notifyChannel('LOGIN_AUDIT_CLEARED');
  },

  // ==================== Notification Settings (إعدادات ونغمات الإشعارات) ====================
  getNotificationSettings(): UserNotificationSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (!data) {
        const defaults: UserNotificationSettings = { enabled: true, ringtone: 'whistle' };
        localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(data);
    } catch {
      return { enabled: true, ringtone: 'whistle' };
    }
  },

  saveNotificationSettings(settings: UserNotificationSettings): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    this.notifyChannel('NOTIFICATION_SETTINGS_UPDATED', settings);
  },

  // ==================== Banned Users (حظر المستخدمين غير المنتمين للأكاديمية) ====================
  getBannedUsers(): BannedUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANNED_USERS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  banUser(user: { id?: string; name: string; phone?: string; reason?: string }): void {
    const list = this.getBannedUsers();
    const cleanName = user.name.trim();
    if (!cleanName) return;

    // Check if already banned
    const exists = list.some(
      (b) =>
        b.name.toLowerCase() === cleanName.toLowerCase() ||
        (user.phone && b.phone && b.phone.replace(/[^0-9]/g, '') === user.phone.replace(/[^0-9]/g, ''))
    );
    if (exists) return;

    const newBan: BannedUser = {
      id: user.id || 'ban-' + Date.now(),
      name: cleanName,
      phone: user.phone?.trim(),
      reason: user.reason?.trim() || 'حساب غير منتمي لأكاديمية بايبوخت الرياضية',
      bannedAt: Date.now(),
      bannedDate: new Date().toLocaleDateString('ar-IQ'),
    };

    list.unshift(newBan);
    localStorage.setItem(STORAGE_KEYS.BANNED_USERS, JSON.stringify(list));

    // 1. Remove player completely from registered players
    if (user.id) {
      this.deletePlayer(user.id);
    } else {
      const players = this.getPlayers();
      const matched = players.find(
        (p) =>
          p.name.trim().toLowerCase() === cleanName.toLowerCase() ||
          (user.phone && p.phone.replace(/[^0-9]/g, '') === user.phone.replace(/[^0-9]/g, ''))
      );
      if (matched) {
        this.deletePlayer(matched.id);
      }
    }

    // 2. Invalidate active session immediately if matches banned user
    const currentSession = this.getSession();
    if (currentSession && currentSession.role === 'player') {
      const isCurrentBanned =
        currentSession.name.trim().toLowerCase() === cleanName.toLowerCase() ||
        (user.phone && currentSession.phone && currentSession.phone.replace(/[^0-9]/g, '') === user.phone.replace(/[^0-9]/g, '')) ||
        (user.id && currentSession.id === user.id);

      if (isCurrentBanned) {
        this.clearSession();
      }
    }

    // 3. Broadcast real-time ban and revocation event
    this.notifyChannel('USER_BANNED', newBan);
    this.notifyChannel('SESSION_REVOKED', { bannedName: newBan.name, bannedPhone: newBan.phone });
  },

  unbanUser(userIdOrName: string): void {
    const list = this.getBannedUsers().filter(
      (b) => b.id !== userIdOrName && b.name.toLowerCase() !== userIdOrName.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEYS.BANNED_USERS, JSON.stringify(list));
    this.notifyChannel('USER_UNBANNED', userIdOrName);
  },

  isUserBanned(name: string, phone?: string): boolean {
    const list = this.getBannedUsers();
    const cleanName = name.trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    return list.some((b) => {
      if (b.name.trim().toLowerCase() === cleanName) return true;
      if (cleanPhone && b.phone) {
        const bPhone = b.phone.replace(/[^0-9]/g, '');
        if (bPhone && bPhone.length >= 7 && cleanPhone.length >= 7 && (bPhone === cleanPhone || cleanPhone.endsWith(bPhone) || bPhone.endsWith(cleanPhone))) {
          return true;
        }
      }
      return false;
    });
  },

  getCustomPublicUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.PUBLIC_APP_URL) || '';
  },

  setCustomPublicUrl(url: string): void {
    localStorage.setItem(STORAGE_KEYS.PUBLIC_APP_URL, url.trim());
    this.notifyChannel('PUBLIC_URL_UPDATED', url.trim());
  },

  getThemeMode(): ThemeMode {
    const mode = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (mode === 'light' || mode === 'dark' || mode === 'auto') {
      return mode;
    }
    return 'dark'; // Default academy theme
  },

  setThemeMode(mode: ThemeMode): void {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    this.applyTheme(mode);
    this.notifyChannel('THEME_UPDATED', mode);
  },

  applyTheme(mode?: ThemeMode): void {
    if (typeof window === 'undefined') return;
    const currentMode = mode || this.getThemeMode();
    let isDark = true;
    if (currentMode === 'light') {
      isDark = false;
    } else if (currentMode === 'auto') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = true;
    }

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  },

  // Internal Broadcast Channel notification helper
  notifyChannel(eventType: string, payload?: any): void {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bat_academy_event', { detail: { eventType, payload } }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('bat_academy_events');
          bc.postMessage({ eventType, payload });
          bc.close();
        }
      }
    } catch {
      // ignore
    }
  },
};
