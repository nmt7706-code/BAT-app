import { useState, useEffect, useRef, FormEvent } from 'react';
import { MessageSquare, Send, Lock, Unlock, ShieldCheck, Trash2, Pin, Info, AlertCircle, Smile } from 'lucide-react';
import { ChatMessage, ChatRoomState, UserSession } from '../types';
import { StorageService } from '../utils/storage';

interface ChatViewProps {
  session: UserSession;
  messages: ChatMessage[];
  chatState: ChatRoomState;
  onSendMessage: (content: string) => void;
  onToggleChatLock: (locked: boolean, reason?: string) => void;
  onDeleteMessage?: (msgId: string) => void;
  onClearChat?: () => void;
}

export function ChatView({
  session,
  messages,
  chatState,
  onSendMessage,
  onToggleChatLock,
  onDeleteMessage,
  onClearChat,
}: ChatViewProps) {
  const isCaptain = session.role === 'captain';
  const [inputText, setInputText] = useState('');
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState('للراحة قبل موعد المباراة والتركيز على التعليمات');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // If chat is locked and user is not captain, block send
    if (chatState.isLocked && !isCaptain) {
      return;
    }

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickSend = (text: string) => {
    if (chatState.isLocked && !isCaptain) return;
    onSendMessage(text);
  };

  const executeLockToggle = () => {
    if (chatState.isLocked) {
      // Unlock
      onToggleChatLock(false);
    } else {
      // Show modal to confirm or lock directly
      setShowLockModal(true);
    }
  };

  const confirmLock = () => {
    onToggleChatLock(true, lockReason.trim() || undefined);
    setShowLockModal(false);
  };

  const pinnedMessage = messages.find((m) => m.isPinned);

  const quickPhrases = [
    'جاهز للتمرين يا كابتن ⚽',
    'تم استلام التبليغ وموافق 👍',
    'بالتوفيق لجميع أبطال الأكاديمية 🏆',
    'إن شاء الله الفوز لنا 💪',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] max-h-[780px] bg-[#0A0F0C] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Chat Room Header */}
      <div className="bg-gradient-to-r from-[#141C15] via-[#1B271E] to-[#101712] border-b border-white/5 p-3.5 sm:p-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#1E2C20] to-[#0D150F] border-2 border-amber-400/50 p-0.5 shadow overflow-hidden">
                <img
                  src="/logo.png"
                  alt="شعار بايبوخت"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#101712] ${
                  chatState.isLocked ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                title={chatState.isLocked ? 'الدردشة مقفلة' : 'الدردشة نشطة'}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  غرفة محادثة أكاديمية بايبوخت (B.A.T)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-300">
                {chatState.isLocked ? (
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <Lock className="w-3 h-3" />
                    <span>مقفلة من قبل الإدارة</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>الدردشة مفتوحة لجميع اللاعبين</span>
                  </span>
                )}
                <span>•</span>
                <span className="text-gray-400">{messages.length} رسالة</span>
              </div>
            </div>
          </div>

          {/* Captain Control for Lock/Unlock */}
          {isCaptain ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-toggle-chat-lock"
                onClick={executeLockToggle}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all ${
                  chatState.isLocked
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-400 hover:to-teal-400'
                    : 'bg-gradient-to-r from-amber-600 to-red-600 text-white hover:from-amber-500 hover:to-red-500'
                }`}
              >
                {chatState.isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">فتح الدردشة</span>
                    <span className="sm:hidden">فتح</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قفل الدردشة</span>
                    <span className="sm:hidden">قفل</span>
                  </>
                )}
              </button>

              {onClearChat && (
                <button
                  onClick={() => {
                    if (confirm('هل ترغب بتفريغ سجل الرسائل للبدء من جديد؟')) {
                      onClearChat();
                    }
                  }}
                  title="تفريغ المحادثة"
                  className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl border border-white/5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            // For regular players: show lock status badge
            chatState.isLocked && (
              <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-[11px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>مغلقة</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Lock Notice Banner (When Locked) */}
      {chatState.isLocked && (
        <div className="bg-gradient-to-r from-red-950/70 via-[#260C0C] to-red-950/70 border-b border-red-500/30 p-2.5 sm:p-3 shrink-0 flex items-center justify-between gap-3 text-xs text-red-200 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-red-300 block sm:inline">
                الدردشة مقفلة حالياً بأمر الكابتن زيد محمد خرشيد
              </span>
              {chatState.lockedReason && (
                <span className="text-red-300/80 text-[11px] sm:mr-2">
                  (السبب: {chatState.lockedReason})
                </span>
              )}
            </div>
          </div>
          {isCaptain && (
            <span className="text-[10px] bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full border border-red-500/30 shrink-0">
              أنت المسؤول (يمكنك النشر)
            </span>
          )}
        </div>
      )}

      {/* Pinned Message (if any) */}
      {pinnedMessage && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-2.5 px-4 shrink-0 flex items-start gap-2.5 text-xs text-amber-200">
          <Pin className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-amber-300 block mb-0.5">
              رسالة مثبتة من {pinnedMessage.senderName}:
            </span>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">{pinnedMessage.content}</p>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isMyMsg = msg.senderId === session.id;
          const isMsgCaptain = msg.senderRole === 'captain';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name & Role info */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                {isMsgCaptain ? (
                  <span className="flex items-center gap-1 text-amber-400 font-black">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>الكابتن زيد محمد خرشيد (إدارة الأكاديمية)</span>
                  </span>
                ) : (
                  <span className="text-gray-300 font-bold flex items-center gap-1">
                    <span>{msg.senderName}</span>
                    {msg.jerseyNumber && (
                      <span className="text-[10px] bg-white/10 text-amber-300 px-1 rounded">
                        #{msg.jerseyNumber}
                      </span>
                    )}
                  </span>
                )}
                <span className="text-gray-500 text-[9px]">
                  {new Date(msg.timestamp).toLocaleTimeString('ar-IQ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed break-words shadow-md ${
                  isMsgCaptain
                    ? 'bg-gradient-to-r from-[#202E1B] to-[#141F12] border-2 border-amber-400/50 text-amber-100 rounded-tr-none'
                    : isMyMsg
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-none shadow-amber-950/30'
                    : 'bg-[#141C16] border border-white/10 text-gray-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Captain Delete action on messages */}
                {isCaptain && onDeleteMessage && (
                  <div className="flex justify-end mt-1.5 pt-1 border-t border-white/10">
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      title="حذف الرسالة"
                      className="text-[10px] text-gray-400 hover:text-red-400 flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Bar (only if chat is unlocked or user is captain) */}
      {(!chatState.isLocked || isCaptain) && (
        <div className="bg-[#0B100C] border-t border-white/5 px-3 py-1.5 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSend(phrase)}
              className="px-2.5 py-1 bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-gray-300 hover:text-amber-200 rounded-lg text-[10px] whitespace-nowrap transition-all font-medium"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Bar */}
      <div className="bg-[#0E1510] border-t border-white/5 p-3 shrink-0">
        {chatState.isLocked && !isCaptain ? (
          <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-300 font-bold">
            <Lock className="w-4 h-4 text-red-400" />
            <span>الدردشة مقفلة حالياً من قبل الكابتن زيد (الكتابة معطلة للاعبين)</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                chatState.isLocked && isCaptain
                  ? 'الدردشة مقفلة، لكن بصفتك الكابتن يمكنك إرسال تنبيه...'
                  : 'اكتب رسالتك لزملائك والكابتن زيد...'
              }
              className="flex-1 bg-[#080C0A] border border-white/10 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 disabled:hover:from-amber-500 text-black font-extrabold rounded-2xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all text-xs"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </form>
        )}
      </div>

      {/* Captain Lock Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121A14] border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-red-500/20 text-red-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">قفل الدردشة للاعبين</h3>
                <p className="text-xs text-gray-400">
                  عند القفل، لن يتمكن اللاعبون من إرسال رسائل وستظهر رسالة التنبيه لهم.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                سبب القفل (سيظهر لجميع اللاعبين):
              </label>
              <input
                type="text"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="مثال: لوقت الراحة والنوم قبل موعد المباراة"
                className="w-full bg-[#080C0A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmLock}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-red-950/40"
              >
                تأكيد قفل الدردشة 🔒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
