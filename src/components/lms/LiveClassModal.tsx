// src/components/lms/LiveClassModal.tsx
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
  Sparkles,
  Maximize2,
  MonitorPlay
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
  const [viewMode, setViewMode] = useState<'webrtc' | 'interactive'>('webrtc');
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'participants'>('chat');
  
  const [autoAttendanceDone, setAutoAttendanceDone] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>('');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isInstructor?: boolean }>>([
    { sender: 'سیستم هوشمند کلاس', text: `به کلاس زنده «${session.title}» خوش آمدید. صدا و تصویر با کیفیت بالا از طریق وبینار اختصاصی در دسترس است.`, time: new Intl.DateTimeFormat('fa-IR', { timeStyle: 'short' }).format(new Date()), isInstructor: true }
  ]);
  const [inputMsg, setInputMsg] = useState('');

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

    setChatMessages(prev => [...prev, newMsg]);
    setInputMsg('');
  };

  // Generate standardized real room URL for multi-user live interaction
  const liveRoomUrl = session.room_url && session.room_url.startsWith('http')
    ? session.room_url
    : `https://meet.jit.si/LMS_MFIH_Course_${session.course_id}_Room_${session.id || 'Live'}`;

  const iframeSrc = `${liveRoomUrl}#userInfo.displayName="${encodeURIComponent(userName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=true`;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-md flex flex-col font-sans text-white select-none shadow-2xl" dir="rtl">
      
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black flex items-center gap-2 truncate">
              <span>{session.title}</span>
              <span className="bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0">
                پخش زنده (LIVE)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 truncate">مدرس: {session.instructor_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Automatic Attendance Indicator */}
          {autoAttendanceDone && (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold px-3 py-1 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>حضور خودکار ثبت شد ({checkInTime})</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-0.5 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setViewMode('webrtc')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'webrtc' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="اتاق ویدیویی آنلاین دوطرفه"
            >
              اتاق ویدیویی
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'interactive' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="تخته و چت ساده"
            >
              گفتگو
            </button>
          </div>

          <a
            href={liveRoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
            title="باز کردن اتاق زنده در تب جدید یا برنامه اختصاصی"
          >
            <ExternalLink size={12} />
            <span>لینک مستقیم کلاس</span>
          </a>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 flex items-center justify-center transition text-slate-300 hover:text-white cursor-pointer"
            title="خروج و بستن"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Auto Attendance Notification for Mobile */}
      {autoAttendanceDone && (
        <div className="sm:hidden bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-center gap-1.5 shadow-xs">
          <CheckCircle2 size={13} />
          <span>حضور شما به صورت خودکار در ساعت {checkInTime} در سیستم ثبت شد.</span>
        </div>
      )}

      {/* Main Classroom Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* WEBRTC REAL VIDEO ROOM */}
        {viewMode === 'webrtc' ? (
          <div className="flex-1 w-full h-full bg-slate-950 flex flex-col p-2">
            <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-slate-800 relative bg-black shadow-inner">
              <iframe
                src={iframeSrc}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
                title="اتاق ویدیویی زنده کلاس آنلاین LMS MFIH"
              />
            </div>
          </div>
        ) : (
          /* INTERACTIVE LECTURE STAGE */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="flex-1 bg-slate-900/60 p-4 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-2xl aspect-video bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                <div className="flex flex-col items-center text-center p-6 space-y-3">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/30 border-2 border-indigo-400/50 flex items-center justify-center text-2xl font-black text-white shadow-inner relative">
                    {session.instructor_name.charAt(0)}
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-100">{session.instructor_name}</h4>
                    <p className="text-xs text-indigo-300 flex items-center justify-center gap-1 mt-1">
                      <Volume2 size={13} className="text-emerald-400 animate-pulse" />
                      کلاس در جریان است - برای مشاهده تصویر زنده بر روی «اتاق ویدیویی زنده» کلیک کنید.
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">پخش آنلاین فعال</span>
                  <button
                    onClick={() => setViewMode('webrtc')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1 rounded-xl transition flex items-center gap-1"
                  >
                    <MonitorPlay size={12} />
                    ورود به اتاق ویدیویی زنده
                  </button>
                </div>
              </div>
            </div>

            {/* Side Chat */}
            <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex flex-col h-60 md:h-auto">
              <div className="p-2.5 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-indigo-400" />
                گفتگوی متنی کلاس
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
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
              <form onSubmit={handleSendMessage} className="p-2 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="پیام یا سوال خود را بنویسید..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl">
                  ارسال
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Controls Bar (Fully Elevated with Safe Bottom Padding) */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 pb-8 sm:pb-4 flex items-center justify-center gap-3 z-30 shrink-0 shadow-2xl">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-full transition flex items-center justify-center cursor-pointer active:scale-95 ${
            micOn ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={micOn ? 'قطع میکروفون' : 'اتصال میکروفون'}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-3 rounded-full transition flex items-center justify-center cursor-pointer active:scale-95 ${
            cameraOn ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={cameraOn ? 'خاموش کردن دوربین' : 'روشن کردن دوربین'}
        >
          {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>

        <button
          onClick={() => setHandRaised(!handRaised)}
          className={`p-3 rounded-full transition flex items-center justify-center cursor-pointer active:scale-95 ${
            handRaised ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="اجازه صحبت / بلند کردن دست"
        >
          <Hand size={18} />
        </button>

        <button
          onClick={onClose}
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black px-6 py-2.5 rounded-full transition shadow-lg shadow-rose-900/40 cursor-pointer"
        >
          ترک کلاس و بازگشت
        </button>
      </div>

    </div>
  );
}
