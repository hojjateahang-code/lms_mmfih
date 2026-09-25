import React, { useState, useEffect } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Hand, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  ExternalLink,
  Volume2,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';
import { LiveSession } from '../../types';
import { joinLiveClassAndCheckIn } from '../../services/lmsService';

interface LiveClassModalProps {
  session: LiveSession;
  userId: string;
  userName: string;
  userRole?: string;
  onClose: () => void;
}

export default function LiveClassModal({
  session,
  userId,
  userName,
  userRole = 'student',
  onClose
}: LiveClassModalProps) {
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'participants'>('chat');
  
  const [autoAttendanceDone, setAutoAttendanceDone] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>('');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isInstructor?: boolean }>>([
    { sender: session.instructor_name, text: 'سلام به همه دوستان گرامی. کلاس آغاز شده است. سوالات خود را می‌توانید در بخش گفتگو بپرسید.', time: '۱۸:۳۰', isInstructor: true },
    { sender: 'علی محمدی', text: 'سلام استاد، صدا و تصویر با کیفیت بسیار خوب دریافت می‌شود.', time: '۱۸:۳۱' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const [onlineParticipants, setOnlineParticipants] = useState([
    { name: session.instructor_name, role: 'مدرس دوره', mic: true, cam: true },
    { name: userName, role: userRole === 'executive_manager' ? 'مدیر سامانه' : 'دانش‌پژوه (شما)', mic: false, cam: false },
    { name: 'محمد امین شمس', role: 'دانش‌پژوه', mic: false, cam: false },
    { name: 'فاطمه حسینی', role: 'دانش‌پژوه', mic: false, cam: false },
    { name: 'رضا کریمی', role: 'دانش‌پژوه', mic: false, cam: false }
  ]);

  // Automated Attendance Registration upon joining
  useEffect(() => {
    let isMounted = true;
    const registerAttendance = async () => {
      try {
        const res = await joinLiveClassAndCheckIn(session, userId, userName);
        if (res.success && isMounted) {
          setAutoAttendanceDone(true);
          setCheckInTime(new Intl.DateTimeFormat('fa-IR', { timeStyle: 'short' }).format(new Date()));
        }
      } catch (err) {
        console.warn('Auto attendance check error', err);
      }
    };

    registerAttendance();
    return () => { isMounted = false; };
  }, [session, userId, userName]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      sender: userName,
      text: inputMsg.trim(),
      time: new Intl.DateTimeFormat('fa-IR', { timeStyle: 'short' }).format(new Date()),
      isInstructor: userRole === 'teacher' || userRole === 'executive_manager'
    };

    setChatMessages([...chatMessages, newMsg]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col font-sans text-white select-none">
      
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <h3 className="text-xs sm:text-sm font-black flex items-center gap-2">
              <span>{session.title}</span>
              <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                زنده (LIVE)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">مدرس: {session.instructor_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Automatic Attendance Indicator */}
          {autoAttendanceDone && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold px-3 py-1 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>حضور خودکار ثبت شد ({checkInTime})</span>
            </div>
          )}

          <a
            href={session.room_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 bg-indigo-600/80 hover:bg-indigo-600 text-[11px] font-bold px-2.5 py-1 rounded-xl transition"
          >
            <ExternalLink size={13} />
            اتاق خارجی (Jitsi/Skyroom)
          </a>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 flex items-center justify-center transition text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Automated Attendance Banner on Mobile */}
      {autoAttendanceDone && (
        <div className="sm:hidden bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-center gap-1.5 shadow-sm">
          <CheckCircle2 size={13} />
          <span>حضور شما به صورت خودکار در ساعت {checkInTime} در کلاس ثبت شد.</span>
        </div>
      )}

      {/* Main Classroom Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Main Stage Video / Whiteboard Area */}
        <div className="flex-1 bg-slate-900/60 p-3 sm:p-5 flex flex-col items-center justify-center relative">
          
          {/* Simulated Live Video / Instructor Camera */}
          <div className="w-full max-w-3xl aspect-video bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden group">
            
            {/* Instructor Avatar & Status */}
            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="w-24 h-24 rounded-full bg-indigo-600/30 border-2 border-indigo-400/50 flex items-center justify-center text-3xl font-black text-white shadow-inner relative">
                {session.instructor_name.charAt(0)}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-100">{session.instructor_name}</h4>
                <p className="text-xs text-indigo-300 flex items-center justify-center gap-1 mt-1">
                  <Volume2 size={13} className="text-emerald-400 animate-pulse" />
                  در حال ارائه مبحث آموزشی...
                </p>
              </div>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                <span className="text-[10px] text-slate-400 mr-2 font-mono">1080p HD | 48kHz</span>
              </div>
              <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                {onlineParticipants.length} نفر حاضر
              </span>
            </div>

            {/* Student's own PIP Camera simulation */}
            {cameraOn && (
              <div className="absolute top-4 left-4 w-28 h-20 bg-slate-800 border-2 border-indigo-500 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                <div className="text-[10px] font-bold text-white mb-1">تصویر شما</div>
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-black">
                  {userName.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {/* Student Status Notifications */}
          {handRaised && (
            <div className="mt-3 bg-amber-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-bounce">
              <Hand size={14} />
              دست شما برای سوال پرسیدن بلند شده است (استاد مطلع شد)
            </div>
          )}
        </div>

        {/* Side Panel (Chat & Participants) */}
        <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex flex-col h-60 md:h-auto">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-bold text-slate-400">
            <button
              onClick={() => setActiveSideTab('chat')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'chat' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/40' : 'hover:text-white'
              }`}
            >
              <MessageSquare size={14} />
              گفتگو ({chatMessages.length})
            </button>
            <button
              onClick={() => setActiveSideTab('participants')}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition ${
                activeSideTab === 'participants' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/40' : 'hover:text-white'
              }`}
            >
              <Users size={14} />
              حاضرین ({onlineParticipants.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeSideTab === 'chat' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`p-2 rounded-xl text-right ${msg.isInstructor ? 'bg-indigo-950/70 border border-indigo-800/50' : 'bg-slate-800/70'}`}>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                      <span className={`font-black ${msg.isInstructor ? 'text-amber-400' : 'text-slate-300'}`}>
                        {msg.sender} {msg.isInstructor ? '(مدرس)' : ''}
                      </span>
                      <span className="font-mono text-[9px]">{msg.time}</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="پیام یا سوال خود را بنویسید..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition"
                >
                  ارسال
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {onlineParticipants.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold text-[11px]">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-200 text-[11px]">{p.name}</div>
                      <div className="text-[9px] text-slate-400">{p.role}</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="آنلاین و حاضر" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-center gap-3">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-full transition flex items-center justify-center ${
            micOn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={micOn ? 'قطع میکروفون' : 'اتصال میکروفون'}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-3 rounded-full transition flex items-center justify-center ${
            cameraOn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={cameraOn ? 'خاموش کردن دوربین' : 'روشن کردن دوربین'}
        >
          {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>

        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`p-3 rounded-full transition flex items-center justify-center ${
            handRaised ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="اجازه صحبت / بلند کردن دست"
        >
          <Hand size={18} />
        </button>

        <button
          onClick={onClose}
          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-5 py-2.5 rounded-full transition"
        >
          ترک کلاس
        </button>
      </div>

    </div>
  );
}
