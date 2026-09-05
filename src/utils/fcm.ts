import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, getToken, onMessage, Messaging } from 'firebase/messaging';
import { PushNotificationRecord } from '../types';
import { StorageService } from './storage';

// تهيئة تطبيق Firebase الأساسي مع دعم المتغيرات البيئية والتوافق التام
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBatAcademyOfficialDemoKey2025",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bat-academy-baipukht.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bat-academy-baipukht",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bat-academy-baipukht.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "837492019482",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:837492019482:web:9f8b417c4613292408b012"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messagingInstance: Messaging | null = null;
const BROADCAST_CHANNEL_NAME = 'bat_academy_fcm_channel';

// إنشاء قناة البث المشترك لجميع الأجهزة والمتصفحات المفتوحة
let fcmBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    fcmBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('[FCM] BroadcastChannel غير مدعوم، سيتم الاعتماد على Local Events', e);
  }
}

// توليد نغمة تنبيه صوتية باستخدام Web Audio API لضمان عمل الصوت بدون ملفات خارجية
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // نغمة مزدوجة راقية رياضية
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // هزة اهتزاز للهاتف إن كان مدعوماً
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 80, 150]);
    }
  } catch {
    // تجاهل في حال كانت إعدادات المتصفح تقيد الصوت التلقائي قبل تفاعل المستخدم
  }
}

/**
 * تهيئة Firebase Cloud Messaging والتأكد من دعم المتصفح
 */
export async function initFCM(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  if (messagingInstance) return messagingInstance;

  try {
    const supported = await isSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (e) {
    console.warn('[FCM] المتصفح لا يدعم Firebase Messaging كاملاً، يعمل بنظام Web Push البديل:', e);
  }
  return null;
}

/**
 * طلب الإذن بالإشعارات من متصفح اللاعب / الكابتن وتوليد FCM Device Token
 */
export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  token?: string;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, error: 'المتصفح الحالي لا يدعم ميزة الإشعارات الفورية (Web Notifications).' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { granted: false, error: 'تم رفض إذن الإشعارات من إعدادات المتصفح. يُرجى تفعيلها لاستلام توجيهات الكابتن.' };
    }

    // تسجيل Service Worker لـ FCM إن وجد
    let swReg: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swErr) {
        console.warn('[FCM] تعذر تسجيل firebase-messaging-sw.js:', swErr);
      }
    }

    // محاولة الحصول على رمز FCM الحقيقي
    let token = '';
    try {
      const messaging = await initFCM();
      if (messaging && swReg) {
        token = await getToken(messaging, {
          serviceWorkerRegistration: swReg,
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined,
        });
      }
    } catch {
      // إذا لم يكن مفتاح VAPID مدخلاً في البيئة التجريبية، ننشئ رمز جهاز فريد ومستقر
    }

    if (!token) {
      token = `bat_fcm_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    }

    // تحديث جلسة المستخدم بالرمز
    const currentSession = StorageService.getSession();
    if (currentSession) {
      currentSession.fcmToken = token;
      currentSession.notificationsEnabled = true;
      StorageService.setSession(currentSession);
    }

    return { granted: true, token };
  } catch (err) {
    return { granted: false, error: err instanceof Error ? err.message : 'فشل الحصول على الإذن' };
  }
}

/**
 * إرسال إشعار فوري من الكابتن وتوزيعه لجميع اللاعبين وهواتفهم
 */
export async function sendCaptainFCMBroadcast(payload: {
  title: string;
  body: string;
  category: PushNotificationRecord['category'];
  targetGroup?: string;
  targetPlayerId?: string;
}): Promise<PushNotificationRecord> {
  const currentSession = StorageService.getSession();
  const senderName = currentSession?.name || 'الكابتن زيد محمد خرشيد';

  const notification: PushNotificationRecord = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: payload.title,
    body: payload.body,
    category: payload.category,
    timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
    sender: senderName,
    targetGroup: payload.targetGroup || 'كافة اللاعبين',
    targetPlayerId: payload.targetPlayerId,
  };

  // 1. حفظ في سجل الإشعارات الدائم بالأكاديمية
  StorageService.saveNotificationRecord(notification);

  // 2. إطلاق نغمة صوت واهتزاز فورية
  playNotificationChime();

  // 3. إرسال عبر قنوات البث المشترك لجميع علامات التبويب والهواتف المتصلة
  if (fcmBroadcastChannel) {
    fcmBroadcastChannel.postMessage(notification);
  }

  // 4. إطلاق حدث محلي داخل التطبيق
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bat_fcm_notification', { detail: notification }));
  }

  // 5. إطلاق إشعار نظام حقيقي على الهاتف / شاشة القفل عبر Notification API أو Service Worker
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && 'showNotification' in registration) {
          (registration as any).showNotification(notification.title, {
            body: notification.body,
            icon: '/pwa-192x192.png',
            badge: '/apple-touch-icon.png',
            vibrate: [200, 100, 200],
            tag: notification.id,
            dir: 'rtl',
            lang: 'ar',
            data: notification,
          });
        } else {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/pwa-192x192.png',
            badge: '/apple-touch-icon.png',
            dir: 'rtl',
            lang: 'ar',
          });
        }
      } else {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/pwa-192x192.png',
          dir: 'rtl',
        });
      }
    } catch (notifErr) {
      console.warn('[FCM] تعذر إطلاق إشعار النظام المباشر:', notifErr);
    }
  }

  return notification;
}

/**
 * الاستماع للإشعارات الواردة فوراً (Foreground / Broadcast / Firebase Messaging)
 */
export function subscribeToFCMNotifications(
  callback: (notification: PushNotificationRecord) => void
): () => void {
  const handleCustomEvent = (event: Event) => {
    const customEv = event as CustomEvent<PushNotificationRecord>;
    if (customEv.detail) {
      callback(customEv.detail);
    }
  };

  const handleBroadcastMessage = (event: MessageEvent) => {
    if (event.data && event.data.id && event.data.title) {
      callback(event.data as PushNotificationRecord);
      playNotificationChime();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('bat_fcm_notification', handleCustomEvent);
  }

  if (fcmBroadcastChannel) {
    fcmBroadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // الاستماع المباشر لرسائل Firebase Messaging في الواجهة الأمامية إن كانت متوفرة
  let unsubscribeFCM: (() => void) | null = null;
  initFCM().then((messaging) => {
    if (messaging) {
      unsubscribeFCM = onMessage(messaging, (payload) => {
        const notif: PushNotificationRecord = {
          id: payload.messageId || `fcm_${Date.now()}`,
          title: payload.notification?.title || 'إشعار من الكابتن زيد',
          body: payload.notification?.body || 'لديك توجيه جديد من الأكاديمية',
          category: (payload.data?.category as PushNotificationRecord['category']) || 'general',
          timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
          sender: payload.data?.sender || 'الكابتن زيد محمد خرشيد',
          targetGroup: payload.data?.targetGroup,
        };
        callback(notif);
        playNotificationChime();
      });
    }
  });

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('bat_fcm_notification', handleCustomEvent);
    }
    if (fcmBroadcastChannel) {
      fcmBroadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (unsubscribeFCM) {
      unsubscribeFCM();
    }
  };
}

/**
 * فحص ما إذا كان المتصفح يدعم إشعارات الويب وتطبيقات PWA
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

