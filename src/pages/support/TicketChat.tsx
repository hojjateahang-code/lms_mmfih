import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Send, 
  User, 
  Headphones, 
  Loader2, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Filter,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { 
  getAllTickets, 
  getUserTickets, 
  createSupportTicket, 
  sendTicketReply, 
  updateTicketStatus,
  SupportTicket, 
  SupportMessage 
} from '../../services/supportService';
import { useAuth } from '../../contexts/AuthContext';

interface TicketChatProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export default function TicketChat({ onBack, isAdmin = false }: TicketChatProps) {
  const { user, role } = useAuth();
  const effectiveIsAdmin = isAdmin || role === 'executive_manager' || role === 'course_manager';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // New Ticket Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('آموزشی و دوره‌ها');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, [user, effectiveIsAdmin]);

  const loadTickets = async () => {
    setLoading(true);
    let res;
    if (effectiveIsAdmin) {
      res = await getAllTickets();
    } else if (user?.id) {
      res = await getUserTickets(user.id);
    }

    if (res && res.success && res.data) {
      setTickets(res.data);
      if (selectedTicket) {
        const updatedSelected = res.data.find(t => t.id === selectedTicket.id);
        if (updatedSelected) setSelectedTicket(updatedSelected);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  // Create new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim() || !user) {
      return alert('لطفاً عنوان و متن پیام تیکت را وارد فرمایید.');
    }

    const res = await createSupportTicket(
      user.id,
      user.full_name || 'دانش‌پژوه',
      newSubject,
      newCategory,
      newInitialMsg
    );

    if (res.success && res.data) {
      setTickets([res.data, ...tickets]);
      setSelectedTicket(res.data);
      setShowNewModal(false);
      setNewSubject('');
      setNewInitialMsg('');
    } else {
      alert(res.error || 'خطا در ثبت تیکت');
    }
  };

  // Send message reply in current ticket
  const handleSendMessage = async () => {
    if (!inputText.trim() || !user || !selectedTicket) return;
    setSending(true);

    const res = await sendTicketReply(
      selectedTicket.id,
      user.id,
      user.full_name || (effectiveIsAdmin ? 'پشتیبان سامانه' : 'دانش‌پژوه'),
      inputText,
      effectiveIsAdmin
    );

    if (res.success && res.data) {
      const updatedMessages = [...(selectedTicket.messages || []), res.data];
      const updatedTicket: SupportTicket = {
        ...selectedTicket,
        status: effectiveIsAdmin ? 'answered' : 'open',
        updated_at: new Date().toISOString(),
        messages: updatedMessages
      };

      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setInputText('');
    } else {
      alert(res.error || 'خطا در ارسال پیام');
    }
    setSending(false);
  };

  // Close or change ticket status
  const handleToggleStatus = async (newStatus: 'open' | 'answered' | 'closed') => {
    if (!selectedTicket) return;
    const res = await updateTicketStatus(selectedTicket.id, newStatus);
    if (res.success) {
      const updated = { ...selectedTicket, status: newStatus };
      setSelectedTicket(updated);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updated : t));
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col font-sans" dir="rtl">
      
      {/* Header */}
      <div className="bg-white px-4 py-3.5 flex items-center justify-between shadow-xs border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedTicket) {
                setSelectedTicket(null);
              } else {
                onBack();
              }
            }}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center shadow-xs">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="font-black text-sm text-slate-900">
                {selectedTicket ? selectedTicket.subject : (effectiveIsAdmin ? 'مدیریت و پاسخ‌گویی به تیکت‌ها' : 'پشتیبانی و تیکت آنلاین')}
              </h2>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                {selectedTicket ? (
                  <span>دسته‌بندی: {selectedTicket.category} | وضعیت: {
                    selectedTicket.status === 'answered' ? 'پاسخ داده شده' :
                    selectedTicket.status === 'closed' ? 'بسته شده' : 'در انتظار پاسخ'
                  }</span>
                ) : (
                  <span>پاسخ‌گویی رسمی توسط اساتید و مدیریت مدرسه</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {!selectedTicket && !effectiveIsAdmin && (
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus size={14} /> تیکت جدید
          </button>
        )}

        {selectedTicket && effectiveIsAdmin && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleToggleStatus(selectedTicket.status === 'closed' ? 'open' : 'closed')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                selectedTicket.status === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {selectedTicket.status === 'closed' ? 'بازگشایی تیکت' : 'بستن تیکت'}
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : selectedTicket ? (
        /* ACTIVE TICKET MESSAGES VIEW */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Ticket Information Banner */}
          <div className="bg-indigo-50/60 border-b border-indigo-100 px-4 py-2 text-xs flex items-center justify-between">
            <span className="text-indigo-950 font-bold">
              ارسال‌کننده: {selectedTicket.user_name} | تاریخ ثبت: {new Date(selectedTicket.created_at).toLocaleDateString('fa-IR')}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedTicket.status === 'answered' ? 'bg-emerald-100 text-emerald-800' :
              selectedTicket.status === 'closed' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
            }`}>
              {selectedTicket.status === 'answered' ? 'پاسخ داده شد' :
               selectedTicket.status === 'closed' ? 'بسته شد' : 'در انتظار بررسی'}
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
            {(selectedTicket.messages || []).map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const isSupportAdmin = msg.is_admin;

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 shadow-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : isSupportAdmin
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-tl-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    <div className="flex items-center justify-between gap-3 text-[10px] mb-1 font-bold">
                      <span className={isMe ? 'text-indigo-200' : isSupportAdmin ? 'text-emerald-700 flex items-center gap-1' : 'text-slate-500'}>
                        {isSupportAdmin && <ShieldCheck size={12} />}
                        {msg.sender_name}
                      </span>
                      <span className={isMe ? 'text-indigo-300' : 'text-slate-400'}>
                        {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <div className="bg-white border-t border-slate-100 p-3 shrink-0 pb-6">
            {selectedTicket.status === 'closed' ? (
              <div className="p-3 bg-slate-100 rounded-2xl text-center text-xs text-slate-500 font-bold">
                این تیکت بسته شده است. در صورت نیاز به ادامه، روی دکمه «بازگشایی تیکت» کلیک فرمایید.
              </div>
            ) : (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-inner">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={effectiveIsAdmin ? "پاسخ رسمی پشتیبانی را بنویسید..." : "پیام خود را بنویسید..."}
                  className="flex-1 bg-transparent text-xs p-3 outline-none text-slate-800"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || sending}
                  className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-95 transition disabled:opacity-50 shadow-md shadow-indigo-200 shrink-0 ml-1"
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="rotate-180 -ml-0.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TICKETS LIST VIEW */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              همه تیکت‌ها ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'open' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-amber-800'
              }`}
            >
              در انتظار پاسخ ({tickets.filter(t => t.status === 'open').length})
            </button>
            <button
              onClick={() => setStatusFilter('answered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'answered' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-emerald-800'
              }`}
            >
              پاسخ داده شده ({tickets.filter(t => t.status === 'answered').length})
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'closed' ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              بسته شده ({tickets.filter(t => t.status === 'closed').length})
            </button>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
              <MessageSquare size={40} className="mx-auto text-slate-300" />
              <h4 className="font-bold text-sm text-slate-700">هیچ تیکت پشتیبانی در این بخش یافت نشد.</h4>
              <p className="text-xs text-slate-400">
                {effectiveIsAdmin ? 'هیچ تیکت جدیدی از سمت طلاب ارسال نشده است.' : 'سوالی یا ابهامی دارید؟ با زدن دکمه «تیکت جدید» با ما در ارتباط باشید.'}
              </p>
              {!effectiveIsAdmin && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1 shadow-md"
                >
                  <Plus size={14} /> ارسال اولین تیکت
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTickets.map((ticket) => {
                const lastMsg = ticket.messages?.[ticket.messages.length - 1];

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 transition cursor-pointer shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-xs sm:text-sm text-slate-900">{ticket.subject}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            ticket.status === 'answered' ? 'bg-emerald-100 text-emerald-800' :
                            ticket.status === 'closed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ticket.status === 'answered' ? 'پاسخ داده شد' :
                             ticket.status === 'closed' ? 'بسته شد' : 'در انتظار بررسی'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>دسته‌بندی: <strong>{ticket.category}</strong></span>
                          <span>|</span>
                          <span>ثبت‌کننده: {ticket.user_name}</span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 bg-slate-50 p-2 rounded-xl">
                        <strong className="text-indigo-600">{lastMsg.sender_name}:</strong> {lastMsg.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-black text-sm text-slate-800">ارسال تیکت پشتیبانی جدید</h4>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">موضوع تیکت</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="مثال: سوال در مورد آزمون پایان ترم فقه"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">دسته‌بندی موضوعی</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="آموزشی و دوره‌ها">آموزشی و دوره‌ها</option>
                  <option value="امتحانات و نمرات">امتحانات و نمرات</option>
                  <option value="مالی و کیف پول">مالی و کیف پول</option>
                  <option value="حضور و غیاب و وبینار">حضور و غیاب و وبینار</option>
                  <option value="مسائل فنی و ایتا">مسائل فنی و ایتا</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">متن پیام و شرح درخواست</label>
                <textarea
                  rows={4}
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  placeholder="لطفاً شرح کامل سوال یا مشکل خود را به صورت شفاف توضیح دهید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md"
                >
                  ارسال تیکت به پشتیبانی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
