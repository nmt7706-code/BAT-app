import { UserSession, Exercise, Announcement, PlayerRecord, PushNotificationRecord } from '../types';

const STORAGE_KEYS = {
  SESSION: 'bat_academy_persistent_session',
  PLAYERS: 'bat_academy_players_db',
  EXERCISES: 'bat_academy_exercises_db',
  ANNOUNCEMENTS: 'bat_academy_announcements_db',
  NOTIFICATIONS: 'bat_academy_fcm_notifications_db',
  LAST_PLAYER_ID: 'bat_academy_last_player_id',
};

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
    attendanceRate: 96,
    performanceRating: 9.4,
    readiness: 'جاهز للمباريات',
    notes: 'رؤية ممتازة للملعب، تسديدات دقيقة بالقدم اليمنى، قائد داخل الملعب.',
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
    attendanceRate: 92,
    performanceRating: 8.8,
    readiness: 'جاهز للمباريات',
    notes: 'سرعة انطلاقة عالية جداً، يحتاج لرفع دقة العرضيات تحت الضغط.',
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
    attendanceRate: 88,
    performanceRating: 8.5,
    readiness: 'تأهيل بدني',
    notes: 'قوة بدنية وتفوق في الكرات الهوائية، يتعافى من شد عضلي خفيف.',
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
    attendanceRate: 98,
    performanceRating: 9.2,
    readiness: 'جاهز للمباريات',
    notes: 'مرونة فائقة، ممتاز في الانفرادات والتوجيه المستمر لزملائه.',
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
    attendanceRate: 90,
    performanceRating: 8.9,
    readiness: 'جاهز للمباريات',
    notes: 'حس تهديفي عالٍ، تحركات ذكية خلف المدافعين، موهبة واعدة.',
    joinDate: '2024-05-02',
  },
];

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
  getPlayers(): PlayerRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
        return INITIAL_PLAYERS;
      }
      return JSON.parse(data);
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
  },

  deletePlayer(playerId: string): void {
    const players = this.getPlayers().filter((p) => p.id !== playerId);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
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
  getAnnouncements(): Announcement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_ANNOUNCEMENTS));
        return INITIAL_ANNOUNCEMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  saveAnnouncement(announcement: Announcement): void {
    const list = this.getAnnouncements();
    const existingIndex = list.findIndex((a) => a.id === announcement.id);
    if (existingIndex >= 0) {
      list[existingIndex] = announcement;
    } else {
      list.unshift(announcement);
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
  },

  deleteAnnouncement(annId: string): void {
    const list = this.getAnnouncements().filter((a) => a.id !== annId);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
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
};
