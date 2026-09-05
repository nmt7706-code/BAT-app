import { useState, FormEvent } from 'react';
import { Dumbbell, Moon, Bell, AlertTriangle, Send, Sparkles, CheckCircle2, Shield, HeartPulse, Trophy } from 'lucide-react';
import { Announcement, AnnouncementType } from '../types';
import { StorageService } from '../utils/storage';
import { sendCaptainFCMBroadcast } from '../utils/fcm';

interface QuickCaptainBroadcastProps {
  onNotificationBroadcasted: (ann: Announcement) => void;
}

export function QuickCaptainBroadcast({ onNotificationBroadcasted }: QuickCaptainBroadcastProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [targetGroup, setTargetGroup] = useState('كافة الفئات العمرية');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const QUICK_TEMPLATES: {
    id: string;
    label: string;
    title: string;
    content: string;
    type: AnnouncementType;
    icon: any;
    color: string;
  }[] = [
    {
      id: 'sleep',
      label: 'إشعار وقت النوم والراحة 🛌',
      title: 'تنبيه موعد النوم الكافي وإراحة العضلات',
      content: 'توجيه عاجل من الكابتن زيد: حان وقت إطفاء الشاشات والنوم مبكراً. النوم قبل الساعة 11 مساءً هو مفتاح بناء العضلات وسرعة البديهة في تمرين الغد. التزموا جميعاً.',
      type: 'sleep',
      icon: Moon,
      color: 'from-indigo-600 to-purple-600 border-indigo-400/40',
    },
    {
      id: 'training_soon',
      label: 'إشعار تمرين قادم ⚽',
      title: 'تذكير بالموعد: الحضور للتمرين بعد ساعتين',
      content: 'تنبيه من الكابتن زيد: بقي ساعتان على انطلاق الحصة التدريبية. يرجى شرب الماء الكافي وارتداء الزي الرسمي للأكاديمية والحضور قبل ربع ساعة من البداية.',
      type: 'training',
      icon: Dumbbell,
      color: 'from-emerald-600 to-teal-600 border-emerald-400/40',
    },
    {
      id: 'hydration',
      label: 'إشعار شرب الماء والغذاء 💧',
      title: 'إشعار صحي: الترطيب والتغذية الرياضية',
      content: 'توجيه من الكابتن زيد: حافظ على شرب السوائل بانتظام وتجنب المشروبات الغازية والوجبات السريعة قبل التمرين للحفاظ على أعلى طاقة في الملعب.',
      type: 'recovery',
      icon: HeartPulse,
      color: 'from-cyan-600 to-blue-600 border-cyan-400/40',
    },
    {
      id: 'match_alert',
      label: 'إشعار مباراة غداً 🏆',
      title: 'استنفار وتأهب: موعد المباراة الرسمية',
      content: 'تنبيه حاسم من الكابتن زيد: غداً مباراة حاسمة لفريق الأكاديمية. التركيز الذهني 100%، تجهيز الأحذية والحمايات، والنوم العميق اليوم إلزامي لكل لاعب أساسي وبديل.',
      type: 'match',
      icon: Trophy,
      color: 'from-amber-600 to-yellow-600 border-amber-400/40',
    },
  ];

  const handleSendPreset = (template: typeof QUICK_TEMPLATES[0]) => {
    const ann: Announcement = {
      id: 'ann-' + Date.now(),
      title: template.title,
      content: template.content,
      type: template.type,
      author: 'الكابتن زيد محمد خرشيد',
      date: 'اليوم، ' + new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      targetGroup,
      isPinned: true,
      sendPushNotification: true,
    };

    StorageService.saveAnnouncement(ann);
    // إرسال الإشعار الفوري عبر تقنية Firebase Cloud Messaging & Web Push
    sendCaptainFCMBroadcast({
      title: template.title,
      body: template.content,
      category: template.type === 'sleep' ? 'sleep' : template.type === 'training' ? 'training' : template.type === 'match' ? 'match' : 'general',
      targetGroup,
    });
    onNotificationBroadcasted(ann);
    setActivePreset(template.id);
    setTimeout(() => setActivePreset(null), 3000);
  };

  const handleSendCustom = (e: FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    const ann: Announcement = {
      id: 'ann-' + Date.now(),
      title: 'إشعار وتوجيه فوري من الكابتن زيد',
      content: customMsg.trim(),
      type: 'urgent',
      author: 'الكابتن زيد محمد خرشيد',
      date: 'اليوم، ' + new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      targetGroup,
      isPinned: true,
      sendPushNotification: true,
    };

    StorageService.saveAnnouncement(ann);
    // إرسال الإشعار الفوري المخصص لجميع هواتف اللاعبين
    sendCaptainFCMBroadcast({
      title: 'تنبيه مباشر من الكابتن زيد محمد خرشيد',
      body: customMsg.trim(),
      category: 'urgent',
      targetGroup,
    });
    onNotificationBroadcasted(ann);
    setCustomMsg('');
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-r from-[#17231C] via-[#1F2E25] to-[#121A15] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow">
              <Send className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              مركز بث الإشعارات الفورية لهواتف اللاعبين (تحكم الكابتن زيد)
            </h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            اضغط أي زر لبث إشعار حقيقي يصل فوراً لجميع هواتف اللاعبين (تنبيه وقت النوم، موعد التمرين، التغذية، أو أي إشعار مخصص).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <label className="text-[11px] text-gray-400">الفئة:</label>
          <select
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            className="px-3 py-1.5 bg-[#090D0B] border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold focus:outline-none"
          >
            <option value="كافة الفئات العمرية">الجميع (كافة الفئات)</option>
            <option value="فئة الشباب (U-19)">فئة الشباب (U-19)</option>
            <option value="فئة الناشئين (U-17)">فئة الناشئين (U-17)</option>
            <option value="فئة الأشبال (U-15)">فئة الأشبال (U-15)</option>
          </select>
        </div>
      </div>

      {/* Quick Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSent = activePreset === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => handleSendPreset(tmpl)}
              className={`p-3.5 rounded-2xl border transition-all text-right flex flex-col justify-between group shadow-md ${
                isSent
                  ? 'bg-emerald-900/60 border-emerald-400 text-white scale-[1.02]'
                  : 'bg-[#0A0F0C] border-white/10 hover:border-amber-400/60 text-gray-200 hover:bg-[#121A15]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-amber-300 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  بث فوري
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {tmpl.label}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                  {tmpl.content}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  {isSent ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">تم البث لهواتفهم!</span>
                    </>
                  ) : (
                    <span>إرسال الإشعار الآن ←</span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Broadcast Collapsible */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isOpen ? 'إخفاء كتابة إشعار مخصص' : 'أو كتابة إشعار مخصص وإرساله لجميع اللاعبين مباشرة'}</span>
        </button>
        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>الصلاحية: الكابتن زيد حصراً</span>
        </span>
      </div>

      {isOpen && (
        <form onSubmit={handleSendCustom} className="mt-3 p-3.5 bg-[#090D0B] rounded-2xl border border-amber-500/30 text-right space-y-2.5 animate-in slide-in-from-top-2">
          <label className="block text-xs font-bold text-gray-200">
            أدخل نص الإشعار المباشر الذي سيصل لهواتف اللاعبين:
          </label>
          <textarea
            required
            rows={2}
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="مثال: يرجى التواجد في النادي غداً الساعة 4:00 عصراً لإجراء الفحوصات الطبية..."
            className="w-full px-3.5 py-2 bg-[#050705] border border-amber-500/40 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-400"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:bg-white/5 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1 shadow"
            >
              <Send className="w-3 h-3" />
              <span>بث الإشعار لهواتفهم فوراً</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
