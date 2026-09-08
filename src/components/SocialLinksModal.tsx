import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Plus, Trash2, Edit3, Check, Copy, Sparkles, 
  MessageCircle, Send, Globe, Instagram, Phone, Share2, ShieldCheck,
  Video, RefreshCw
} from 'lucide-react';
import { SocialLink, UserRole } from '../types';
import { StorageService, INITIAL_SOCIAL_LINKS } from '../utils/storage';

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

export function SocialLinksModal({ isOpen, onClose, userRole }: SocialLinksModalProps) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPlatform, setNewPlatform] = useState<SocialLink['platform']>('whatsapp');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const isCaptain = userRole === 'captain';

  useEffect(() => {
    if (isOpen) {
      setLinks(StorageService.getSocialLinks());
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newLinkItem: SocialLink = {
      id: 'soc-' + Date.now(),
      platform: newPlatform,
      title: newTitle.trim(),
      url: newUrl.trim(),
      description: newDesc.trim() || undefined,
      isOfficial: true,
    };

    StorageService.saveSocialLink(newLinkItem);
    setLinks(StorageService.getSocialLinks());
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteSocialLink(id);
    setLinks(StorageService.getSocialLinks());
  };

  const handleReset = () => {
    if (window.confirm('هل تريد استعادة الروابط الافتراضية؟')) {
      const reset = StorageService.resetSocialLinks();
      setLinks(reset);
    }
  };

  const getPlatformIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-400" />;
      case 'telegram':
        return <Send className="w-5 h-5 text-sky-400" />;
      case 'facebook':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'youtube':
      case 'tiktok':
        return <Video className="w-5 h-5 text-rose-400" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-amber-400" />;
      default:
        return <Globe className="w-5 h-5 text-amber-400" />;
    }
  };

  const getPlatformBadge = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'whatsapp':
        return { label: 'واتساب WhatsApp', bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' };
      case 'telegram':
        return { label: 'تليغرام Telegram', bg: 'bg-sky-500/15 border-sky-500/40 text-sky-300' };
      case 'facebook':
        return { label: 'فيسبوك Facebook', bg: 'bg-blue-500/15 border-blue-500/40 text-blue-300' };
      case 'tiktok':
        return { label: 'تيك توك TikTok', bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300' };
      case 'instagram':
        return { label: 'انستغرام Instagram', bg: 'bg-pink-500/15 border-pink-500/40 text-pink-300' };
      default:
        return { label: 'رابط مباشر', bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0C120E] border border-amber-500/40 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/60 overflow-hidden text-right">
        
        {/* Header with Academy Crest */}
        <div className="relative px-6 py-5 border-b border-amber-500/20 bg-gradient-to-r from-[#14221A] via-[#0E1812] to-[#14221A] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg shadow-amber-500/20 shrink-0 bg-black">
              <img 
                src="/logo.png" 
                alt="شعار أكاديمية بايبوخت" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-400">
                  حسابات ومجموعات الأكاديمية
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  رسمي
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                أكاديمية بايبوخت (B.A.T) • إشراف الكابتن زيد محمد خرشيد
              </p>
            </div>
          </div>

          <button
            id="btn-close-social-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (For Captain) */}
        {isCaptain && (
          <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>إدارة الروابط (خاص بالكابتن زيد)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEditing ? 'إلغاء الإضافة' : 'إضافة رابط / كروب جديد'}</span>
              </button>
              <button
                onClick={handleReset}
                title="استعادة الروابط الافتراضية"
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Add Link Form (Visible when Captain toggles isEditing) */}
        {isEditing && isCaptain && (
          <form onSubmit={handleAddLink} className="p-4 bg-[#101913] border-b border-amber-500/20 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة رابط جديد لحساباتك أو مجموعاتك:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">المنصة:</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-500"
                >
                  <option value="whatsapp">واتساب (WhatsApp)</option>
                  <option value="facebook">فيسبوك (Facebook)</option>
                  <option value="tiktok">تيك توك (TikTok)</option>
                  <option value="telegram">تليغرام (Telegram)</option>
                  <option value="instagram">انستغرام (Instagram)</option>
                  <option value="youtube">يوتيوب (YouTube)</option>
                  <option value="phone">هاتف مباشر (Phone)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">عنوان الرابط / اسم المجموعة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كروب واتساب فئة الناشئين"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">الرابط المباشر (URL):</label>
              <input
                type="text"
                required
                placeholder="https://chat.whatsapp.com/... أو https://t.me/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-500 dir-ltr text-left font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">وصف مختصر (اختياري):</label>
              <input
                type="text"
                placeholder="مثال: للانضمام لمجموعة التمارين اليومية"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs shadow-md transition-all"
            >
              حفظ ونشر الرابط في قائمة الأكاديمية
            </button>
          </form>
        )}

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              لا توجد روابط مضافة حالياً.
            </div>
          ) : (
            links.map((item) => {
              const badge = getPlatformBadge(item.platform);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#101713] hover:bg-[#141F18] border border-white/10 hover:border-amber-500/40 transition-all duration-200 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopy(item.id, item.url)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="نسخ الرابط"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>

                    {/* Open Direct Link */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                    >
                      <span>فتح الرابط</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Delete for Captain */}
                    {isCaptain && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                        title="حذف هذا الرابط"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0E1511] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>روابط التواصل والمجموعات الرسمية المعتمدة</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-gray-200 font-bold rounded-xl transition-all"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
