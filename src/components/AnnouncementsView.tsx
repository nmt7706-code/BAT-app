import { useState, FormEvent } from 'react';
import { Bell, Pin, Calendar, AlertTriangle, MessageSquare, Plus, Trash2, Edit3, CheckCircle2, Megaphone, Moon, Dumbbell, Send, Sparkles } from 'lucide-react';
import { Announcement, AnnouncementType, UserSession } from '../types';
import { StorageService } from '../utils/storage';
import { sendCaptainFCMBroadcast } from '../utils/fcm';
import { QuickCaptainBroadcast } from './QuickCaptainBroadcast';

interface AnnouncementsViewProps {
  session: UserSession;
  announcements: Announcement[];
  onAnnouncementsUpdated: () => void;
  onPushNotificationSent?: (ann: Announcement) => void;
}

export function AnnouncementsView({ session, announcements, onAnnouncementsUpdated, onPushNotificationSent }: AnnouncementsViewProps) {
  const isCaptain = session.role === 'captain';

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<AnnouncementType>('training');
  const [newTargetGroup, setNewTargetGroup] = useState('كافة الفئات العمرية');
  const [isPinned, setIsPinned] = useState(false);
  const [sendPushNotification, setSendPushNotification] = useState(true);

  const filteredList = announcements.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const openAddModal = () => {
    setEditingAnnouncement(null);
    setNewTitle('');
    setNewContent('');
    setNewType('training');
    setNewTargetGroup('كافة الفئات العمرية');
    setIsPinned(false);
    setSendPushNotification(true);
    setShowAddModal(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setNewTitle(ann.title);
    setNewContent(ann.content);
    setNewType(ann.type);
    setNewTargetGroup(ann.targetGroup || 'كافة الفئات العمرية');
    setIsPinned(Boolean(ann.isPinned));
    setSendPushNotification(false);
    setShowAddModal(true);
  };

  const handleCreateAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const announcement: Announcement = {
      id: editingAnnouncement ? editingAnnouncement.id : 'ann-' + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      author: editingAnnouncement ? editingAnnouncement.author : 'الكابتن زيد محمد خرشيد',
      date: editingAnnouncement ? editingAnnouncement.date : ('اليوم، ' + new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })),
      targetGroup: newTargetGroup,
      isPinned: isPinned,
      sendPushNotification: sendPushNotification,
    };

    StorageService.saveAnnouncement(announcement);
    onAnnouncementsUpdated();
    if (sendPushNotification && !editingAnnouncement) {
      sendCaptainFCMBroadcast({
        title: announcement.title,
        body: announcement.content,
        category: announcement.type === 'sleep' ? 'sleep' : announcement.type === 'training' ? 'training' : announcement.type === 'match' ? 'match' : 'general',
        targetGroup: announcement.targetGroup,
      });
      if (onPushNotificationSent) {
        onPushNotificationSent(announcement);
      }
    }
    setShowAddModal(false);

    // Reset Form
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
    setEditingAnnouncement(null);
  };

  const handleConfirmRealDelete = () => {
    if (!announcementToDelete) return;
    const title = announcementToDelete.title;
    StorageService.deleteAnnouncement(announcementToDelete.id);
    onAnnouncementsUpdated();
    setAnnouncementToDelete(null);
    setDeleteToast(`تم الحذف الفعلي والنهائي للتبليغ: "${title}" من كافة الأجهزة`);
    setTimeout(() => setDeleteToast(null), 4000);
  };

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'sleep':
        return { label: 'تنبيه النوم والاستشفاء 🛌', bg: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40' };
      case 'recovery':
        return { label: 'إرشاد غذائي وصحي 💧', bg: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40' };
      case 'urgent':
        return { label: 'تنبيه عاجل جداً', bg: 'bg-red-950/60 text-red-300 border-red-500/40' };
      case 'match':
        return { label: 'موعد مباراة', bg: 'bg-amber-950/60 text-amber-300 border-amber-500/40' };
      case 'training':
        return { label: 'وحدة تدريبية', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: 'تبليغ عام', bg: 'bg-blue-950/60 text-blue-300 border-blue-500/40' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Real Deletion Toast */}
      {deleteToast && (
        <div className="p-4 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-center gap-2 shadow-lg shadow-red-950/40 animate-in fade-in slide-in-from-top-2">
          <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-bold">{deleteToast}</span>
        </div>
      )}
      {/* Quick Broadcast for Captain */}
      {isCaptain && (
        <QuickCaptainBroadcast
          onNotificationBroadcasted={(ann) => {
            onAnnouncementsUpdated();
            if (onPushNotificationSent) {
              onPushNotificationSent(ann);
            }
          }}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#141C16] via-[#1A261D] to-[#101712] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1B271F] to-[#0E1611] border-2 border-amber-400/50 p-0.5 shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
              <img
                src="/logo.png"
                alt="شعار أكاديمية بايبوخت"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Megaphone className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">لوحة التبليغات والتعميمات الرسمية</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-300">
                التعليمات الفنية، مواعيد التمارين، تنبيهات النوم، والمباريات الودية الصادرة من إدارة الأكاديمية
              </p>
            </div>
          </div>

          {isCaptain && (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>نشر تبليغ جديد للأكاديمية</span>
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'كافة التبليغات' },
            { id: 'training', label: 'التمارين والمواعيد ⚽' },
            { id: 'sleep', label: 'النوم والاستشفاء 🛌' },
            { id: 'match', label: 'المباريات 🏆' },
            { id: 'urgent', label: 'تنبيهات عاجلة ⚡' },
            { id: 'general', label: 'توجيهات عامة' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                filterType === btn.id
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20'
                  : 'bg-[#0A0F0C] text-gray-300 border-white/5 hover:border-amber-500/30'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredList.map((announcement) => {
          const typeBadge = getTypeBadge(announcement.type);
          return (
            <div
              key={announcement.id}
              className={`rounded-3xl p-5 sm:p-6 transition-all border ${
                announcement.isPinned
                  ? 'bg-[#121A15] border-amber-500/40 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : 'bg-[#0E1410] border-white/5 hover:border-amber-500/20'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${typeBadge.bg}`}>
                    {typeBadge.label}
                  </span>

                  {announcement.isPinned && (
                    <span className="flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                      <Pin className="w-3 h-3 rotate-45 text-amber-400" />
                      <span>مثبت في الأعلى</span>
                    </span>
                  )}

                  <span className="text-[11px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                    الموجه إليهم: {announcement.targetGroup}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{announcement.date}</span>
                  {isCaptain && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(announcement)}
                        className="text-gray-400 hover:text-amber-300 transition-colors p-1"
                        title="تعديل التبليغ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAnnouncementToDelete(announcement)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="حذف حقيقي نهائي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-gray-100 mb-2 leading-relaxed">
                {announcement.title}
              </h3>

              {/* Content */}
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line mb-4">
                {announcement.content}
              </p>

              {/* Signature / Author */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-[10px] font-black">
                    BAT
                  </div>
                  <span className="font-semibold text-amber-300">{announcement.author}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>معتمد رسمياً من الإدارة</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Announcement Modal (Captain Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#101713] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-amber-300">
                {editingAnnouncement ? 'تعديل التبليغ الرسمي' : 'نشر تبليغ وتوجيه رسمي'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAnnouncement(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">عنوان التبليغ *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: موعد الحضور للوحدة التدريبية القادمة"
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">نوع التبليغ</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AnnouncementType)}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="training">وحدة تدريبية ⚽</option>
                    <option value="sleep">موعد النوم والراحة 🛌</option>
                    <option value="recovery">تغذية واستشفاء 💧</option>
                    <option value="match">موعد مباراة 🏆</option>
                    <option value="urgent">تنبيه عاجل ⚡</option>
                    <option value="general">توجيه عام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">الفئة المستهدفة</label>
                  <select
                    value={newTargetGroup}
                    onChange={(e) => setNewTargetGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-200 text-xs focus:outline-none"
                  >
                    <option value="كافة الفئات العمرية">كافة الفئات العمرية</option>
                    <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
                    <option value="فئة الناشئين (U-17)">فئة الناشئين (U-17)</option>
                    <option value="فئة الأشبال (U-15)">فئة الأشبال (U-15)</option>
                    <option value="حراس المرمى">حراس المرمى فقط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">نص التبليغ بالتفصيل *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="أدخل نص التعميم الصادر من الكابتن زيد..."
                  className="w-full px-3.5 py-2.5 bg-[#080B09] border border-amber-500/30 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="push-announcement"
                    checked={sendPushNotification}
                    onChange={(e) => setSendPushNotification(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="push-announcement" className="text-xs font-bold text-amber-300 cursor-pointer">
                    إرسال إشعار فوري مباشر (Push Notification) لهواتف اللاعبين
                  </label>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="pin-announcement"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <label htmlFor="pin-announcement" className="text-xs font-bold text-gray-300 cursor-pointer">
                    تثبيت هذا التبليغ في أعلى الصفحة كإشعار ذي أولوية
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs shadow-md"
                >
                  {editingAnnouncement ? 'حفظ التعديلات' : 'نشر التعميم فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Real Delete Confirmation Modal */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#101713] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-red-400">تأكيد الحذف الفعلي والنهائي للتبليغ</h3>
              <p className="text-xs text-gray-300">
                أنت على وشك حذف هذا التبليغ بشكل حقيقي ودائم:
              </p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-amber-300">
                "{announcementToDelete.title}"
              </div>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-[11px] text-red-300 space-y-1">
              <p className="font-bold">⚠️ تنبيه أمني من إدارة الأكاديمية:</p>
              <p>هذا الحذف فعلي ونهائي؛ سيتم مسح التبليغ من قاعدة البيانات فوراً ومن كافة هواتف وشاشات اللاعبين ولا يمكن التراجع عنه.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRealDelete}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف الحقيقي الآن</span>
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all border border-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
