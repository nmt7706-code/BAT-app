// firebase-messaging-sw.js
// أكاديمية بايبوخت (B.A.T) - خدمة معالجة إشعارات الخلفية Firebase Cloud Messaging & Web Push

// تحميل مكتبات Firebase المتوافقة مع Service Worker
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

  // يتم قراءة التهيئة في حال توفرها
  const defaultConfig = {
    apiKey: "AIzaSyDummyKeyForOfflineSafeInit",
    projectId: "bat-academy",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:batacademy"
  };

  firebase.initializeApp(defaultConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] تلقي إشعار خلفي من الكابتن زيد:', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار من الكابتن زيد • أكاديمية بايبوخت';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'لديك توجيه تدريبي جديد من إدارة الأكاديمية.',
      icon: payload.notification?.icon || '/pwa-192x192.png',
      badge: '/apple-touch-icon.png',
      vibrate: [200, 100, 200],
      dir: 'rtl',
      lang: 'ar',
      data: payload.data || {},
      actions: [
        { action: 'open_app', title: 'فتح التطبيق والمشاهدة' }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('[firebase-messaging-sw.js] ملاحظة تهيئة Firebase في وضع عدم الاتصال:', e);
}

// الاستماع المباشر لأحداث Push في متصفح الهاتف والأجهزة الذكية
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || data.notification?.title || 'تنبيه من الكابتن زيد محمد خرشيد';
    const options = {
      body: data.body || data.notification?.body || 'توجيه تدريبي رسمي',
      icon: '/pwa-192x192.png',
      badge: '/apple-touch-icon.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'bat-notification',
      dir: 'rtl',
      lang: 'ar',
      data: data
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('أكاديمية بايبوخت (B.A.T)', {
        body: text,
        icon: '/pwa-192x192.png',
        dir: 'rtl',
      })
    );
  }
});

// عند نقر اللاعب على الإشعار في هاتفه
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إذا كان التطبيق مفتوحاً، ركز عليه
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // وإلا افتح نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
