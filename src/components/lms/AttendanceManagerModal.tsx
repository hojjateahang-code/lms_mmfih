import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Radio,
  Play,
  Square,
  Plus,
  ExternalLink
} from 'lucide-react';
import { AttendanceRecord, CourseAttendanceSummary, AttendanceStatus, LiveSession } from '../../types';
import { 
  getCourseAttendanceDetails, 
  recordAttendance, 
  createCourseLiveSession, 
  startLiveSession, 
  endLiveSession 
} from '../../services/lmsService';

interface AttendanceManagerModalProps {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
}

export default function AttendanceManagerModal({
  courseId,
  courseTitle,
  onClose
}: AttendanceManagerModalProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | string | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<{ userId: string; userName: string; avatarUrl?: string }[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [summaryList, setSummaryList] = useState<CourseAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Scheduling states
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState('چهارشنبه‌ها');
  const [newTime, setNewTime] = useState('ساعت ۱۵:۰۰');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dropped' | 'warning'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    const data = await getCourseAttendanceDetails(courseId);
    setSessions(data.sessions);
    setEnrolledStudents(data.enrolledStudents);
    setAttendanceRecords(data.records);
    setSummaryList(data.summary);

    if (data.sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(data.sessions[0].id);
    }
    setLoading(false);
  };

  // Schedule a new online class
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return alert('عنوان جلسه الزامی است');

    const scheduledTime = `${newDay} ${newTime}`.trim();
    const res = await createCourseLiveSession(courseId, {
      title: newTitle.trim(),
      scheduled_time: scheduledTime,
      status: 'upcoming',
      room_type: 'internal'
    });

    if (res.success && res.data) {
      setSessions([...sessions, res.data]);
      setSelectedSessionId(res.data.id);
      setShowScheduleForm(false);
      setNewTitle('');
      setActionNotice('جلسه آنلاین جدید با موفقیت زمان‌بندی شد.');
      setTimeout(() => setActionNotice(null), 3000);
    } else {
      alert(res.error || 'خطا در زمان‌بندی جلسه');
    }
  };

  // Start live session
  const handleStartSession = async (sessionId: number | string) => {
    const res = await startLiveSession(sessionId);
    if (res.success && res.session) {
      setSessions(sessions.map(s => s.id === sessionId ? res.session! : s));
      setActionNotice('کلاس آنلاین آغاز شد! امکان ورود و حضور برای دانش‌پژوهان فعال گردید.');
      setTimeout(() => setActionNotice(null), 3500);
    } else {
      alert(res.error || 'خطا در شروع کلاس');
    }
  };

  // End live session
  const handleEndSession = async (sessionId: number | string) => {
    const res = await endLiveSession(sessionId);
    if (res.success && res.session) {
      setSessions(sessions.map(s => s.id === sessionId ? res.session! : s));
      setActionNotice('کلاس آنلاین خاتمه یافت.');
      setTimeout(() => setActionNotice(null), 3000);
    } else {
      alert(res.error || 'خطا در پایان کلاس');
    }
  };

  // Toggle student status
  const handleToggleStatus = async (userId: string, userName: string, newStatus: AttendanceStatus) => {
    const currentSession = sessions.find(s => s.id === selectedSessionId);
    const sessionTitle = currentSession ? currentSession.title : 'جلسه آنلاین';

    await recordAttendance(
      courseId,
      userId,
      userName,
      sessionTitle,
      new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date()),
      newStatus,
      false,
      60,
      selectedSessionId || undefined
    );

    // Refresh attendance records & summary
    loadData();
    setActionNotice(`وضعیت حضور ${userName} به روز شد.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Map student rows based on actual enrollments
  const studentRows = enrolledStudents.map(student => {
    const rec = attendanceRecords.find(r => 
      String(r.user_id) === String(student.userId) && 
      (selectedSessionId ? r.session_id === selectedSessionId : true)
    );
    const summary = summaryList.find(s => String(s.user_id) === String(student.userId));
    
    return {
      userId: student.userId,
      userName: student.userName,
      avatarUrl: student.avatarUrl,
      status: (rec?.status || 'absent') as AttendanceStatus,
      isAuto: rec?.is_auto ?? false,
      totalAbsences: summary?.absent_count || (rec?.status === 'absent' ? 1 : 0),
      isDropped: summary?.is_dropped || false,
    };
  });

  const filteredStudents = studentRows.filter(s => {
    const matchSearch = s.userName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (filterType === 'dropped') return s.isDropped;
    if (filterType === 'warning') return s.totalAbsences === 3 && !s.isDropped;
    return true;
  });

  const droppedCount = studentRows.filter(s => s.isDropped).length;
  const warningCount = studentRows.filter(s => s.totalAbsences === 3 && !s.isDropped).length;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Calendar className="text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">سامانه حضور و غیاب و کلاس‌های آنلاین</h3>
              <p className="text-[11px] text-indigo-200">{courseTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice alert */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-between animate-in fade-in">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-200 hover:text-white">✕</button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 1. Live Session Controller & Scheduling */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Radio size={14} className={currentSession?.status === 'live' ? 'text-rose-500 animate-pulse' : 'text-slate-400'} />
                  جلسات آنلاین دوره:
                </span>
                
                {sessions.length > 0 && (
                  <select
                    value={selectedSessionId || ''}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.scheduled_time}) {s.status === 'live' ? '● زنده' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                >
                  <Plus size={13} />
                  برنامه‌ریزی کلاس جدید
                </button>

                {currentSession && (
                  currentSession.status === 'live' ? (
                    <button
                      onClick={() => handleEndSession(currentSession.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Square size={13} />
                      پایان کلاس آنلاین
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartSession(currentSession.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition active:scale-95 animate-pulse"
                    >
                      <Play size={13} />
                      آغاز کلاس آنلاین
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Current Session Status Badge */}
            {currentSession && (
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-slate-800">{currentSession.title}</span>
                  <span className="text-slate-400 text-[11px] mr-2">زمان‌بندی: {currentSession.scheduled_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    currentSession.status === 'live' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                    currentSession.status === 'ended' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentSession.status === 'live' ? 'کلاس هم‌اکنون در حال برگزاری است' :
                     currentSession.status === 'ended' ? 'جلسه پایان یافته' : 'برنامه‌ریزی شده'}
                  </span>
                </div>
              </div>
            )}

            {/* Scheduling Form Drawer */}
            {showScheduleForm && (
              <form onSubmit={handleScheduleSubmit} className="p-3 bg-white rounded-xl border border-indigo-200 space-y-3 animate-in fade-in">
                <h5 className="font-bold text-xs text-indigo-900">برنامه‌ریزی تشکیل جلسه آنلاین جدید:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان جلسه</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="مثال: جلسه ۳ - کارگاه عملی"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">روز تشکیل</label>
                    <input
                      type="text"
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      placeholder="مثال: چهارشنبه‌ها یا ۱۸ اسفند"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ساعت تشکیل</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="مثال: ساعت ۱۵:۰۰"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black shadow-sm"
                  >
                    ثبت زمان‌بندی جلسه
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Stats bar */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-bold block">دانش‌پژوهان ثبت‌نامی</span>
              <strong className="text-base text-slate-800 font-black">{enrolledStudents.length} نفر</strong>
            </div>

            <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] text-amber-700 font-bold block">در آستانه محرومیت (۳ غیبت)</span>
              <strong className="text-base text-amber-800 font-black">{warningCount} نفر</strong>
            </div>

            <div className="bg-rose-50/70 p-2.5 rounded-2xl border border-rose-200 text-center">
              <span className="text-[10px] text-rose-700 font-bold block">محروم از آزمون (غیبت بیش از ۳)</span>
              <strong className="text-base text-rose-800 font-black">{droppedCount} نفر</strong>
            </div>
          </div>

          {/* 3. Students Attendance Sheet */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو در طلاب ثبت‌نام شده..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-8 pl-3 text-xs outline-none focus:border-indigo-500"
                />
                <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  همه ({studentRows.length})
                </button>
                <button
                  onClick={() => setFilterType('warning')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    filterType === 'warning' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  هشدار ({warningCount})
                </button>
                <button
                  onClick={() => setFilterType('dropped')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                    filterType === 'dropped' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  محروم ({droppedCount})
                </button>
              </div>
            </div>

            {/* List */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                دانش‌پژوهی در این فیلتر یافت نشد.
              </div>
            ) : (
              filteredStudents.map((st) => (
                <div 
                  key={st.userId} 
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    st.isDropped ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                      {st.avatarUrl ? (
                        <img src={st.avatarUrl} alt={st.userName} className="w-full h-full object-cover" />
                      ) : (
                        st.userName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-xs text-slate-800">{st.userName}</h5>
                        {st.isAuto && (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles size={9} /> ثبت خودکار هنگام ورود
                          </span>
                        )}
                        {st.isDropped && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                            محروم از آزمون
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        مجموع غیبت‌های ثبت شده: <strong>{st.totalAbsences} جلسه</strong> (حداکثر مجاز: ۳)
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleStatus(st.userId, st.userName, 'present')}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                        st.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle size={12} />
                      حاضر
                    </button>

                    <button
                      onClick={() => handleToggleStatus(st.userId, st.userName, 'absent')}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                        st.status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle size={12} />
                      غایب
                    </button>

                    <button
                      onClick={() => handleToggleStatus(st.userId, st.userName, 'justified')}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                        st.status === 'justified'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      موجه
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
