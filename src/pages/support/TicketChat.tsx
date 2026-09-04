import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Send, User, Headphones, Loader2 } from 'lucide-react';
import { getTicketMessages, sendTicketMessage, TicketMessage } from '../../services/supportService';
import { useAuth } from '../../contexts/AuthContext';

interface TicketChatProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export default function TicketChat({ onBack, isAdmin = false }: TicketChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchMsgs = async () => {
      const res = await getTicketMessages(user.id);
      if (res.success && res.data) {
        setMessages(res.data);
      }
      setLoading(false);
    };
    fetchMsgs();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    setSending(true);
    const res = await sendTicketMessage(user.id, user.full_name || 'کاربر', inputText, isAdmin);
    if (res.success && res.data) {
      setMessages([...messages, res.data]);
      setInputText('');
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center active:scale-95 transition"
          >
            <ChevronRight size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="font-black text-sm text-slate-800">{isAdmin ? 'پاسخ به تیکت کاربر' : 'پشتیبانی آنلاین'}</h2>
              <p className="text-[10px] text-emerald-500 font-bold">پاسخگو آنلاین است</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-indigo-600" size={30} />
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {!isMe && (
                    <div className="text-[10px] font-bold text-indigo-500 mb-1">{msg.sender_name}</div>
                  )}
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                  <div className={`text-[9px] mt-1.5 text-left ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 p-3 shrink-0 pb-6">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 bg-transparent text-xs p-3 outline-none text-slate-800"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-95 transition disabled:opacity-50 shadow-md shadow-indigo-200 shrink-0 ml-1"
          >
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="rotate-180 -ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}
