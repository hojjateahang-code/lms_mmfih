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
  Sparkles
} from 'lucide-react';
import { AttendanceRecord, CourseAttendanceSummary, AttendanceStatus } from '../../types';
import { getAttendanceRecords, recordAttendance, getCourseAttendanceSummary } from '../../services/lmsService';

interface AttendanceManagerModalProps {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
}

interface StudentAttendanceRow {
  userId: string;
  userName: string;
  status: AttendanceStatus;
  isAuto: boolean;
  totalAbsences: number;
  isDropped: boolean;
}

export default function AttendanceManagerModal({
  courseId,
  courseTitle,
  onClose
}: AttendanceManagerModalProps) {
  const [sessions, setSessions] = useState<string[]>([
    'جلسه ۱: معارفه و سرفصل‌ها',
    'جلسه ۲: مفاهیم پایه و اصول بنیادین',
    'جلسه ۳: کارگاه آنلاین و بررسی نمونه‌ها',
    'جلسه ۴: مباحث تکمیلی و پرسش و پاسخ'
  ]);
  const [selectedSession, setSelectedSession] = useState<string>('جلسه ۳: کارگاه آنلاین و بررسی نمونه‌ها');
  
  const [students, setStudents] = useState<StudentAttendanceRow[]>([
    { userId: 'usr_current', userName: 'حجت‌الله آهنگ (دانش‌پژوه نمونه)', status: 'present', isAuto: true, totalAbsences: 1, isDropped: false },
    { userId: 'usr_2', userName: 'محمدامین شمس', status: 'absent', isAuto: false, totalAbsences: 4, isDropped: true },
    { userId: 'usr_3', userName: 'فاطمه حسینی', status: 'present', isAuto: true, totalAbsences: 0, isDropped: false },
    { userId: 'usr_4', userName: 'علی رضایی', status: 'absent', isAuto: false, totalAbsences: 3, isDropped: false },
    { userId: 'usr_5', userName: 'سجاد موسوی', status: 'justified', isAuto: false, totalAbsences: 2, isDropped: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dropped' | 'warning'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Toggle student status
  const handleToggleStatus = async (userId: string, newStatus: AttendanceStatus) => {
    const targetStudent = students.find(s => s.userId === userId);
    if (!targetStudent) return;

    // Record attendance in service
    await recordAttendance({
      course_id: courseId,
      user_id: userId,
      user_name: targetStudent.userName,
      session_title: selectedSession,
      session_date: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date()),
      status: newStatus,
      is_auto: false
    });

    // Update state & calculate absences
    setStudents(prev => prev.map(s => {
      if (s.userId === userId) {
        const diff = (newStatus === 'absent' && s.status !== 'absent') ? 1 : ((s.status === 'absent' && newStatus !== 'absent') ? -1 : 0);
        const updatedAbsences = Math.max(0, s.totalAbsences + diff);
        const isDropped = updatedAbsences > 3;
        return {
          ...s,
          status: newStatus,
          isAuto: false,
          totalAbsences: updatedAbsences,
          isDropped
        };
      }
      return s;
    }));

    setActionNotice(`وضعیت حضور ${targetStudent.userName} به روز شد.`);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Re-instate a dropped student
  const handleReinstateStudent = (userId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.userId === userId) {
        return {
          ...s,
          totalAbsences: 2, // reduce below limit
          isDropped: false
        };
      }
      return s;
    }));
    setActionNotice('محرومیت دانش‌پژوه لغو و وضعیت به حالت فعال بازگردانده شد.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.userName.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (filterType === 'dropped') return s.isDropped;
    if (filterType === 'warning') return s.totalAbsences === 3 && !s.isDropped;
    return true;
  });

  const droppedCount = students.filter(s => s.isDropped).length;
  const warningCount = students.filter(s => s.totalAbsences === 3 && !s.isDropped).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Users className="text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">سامانه مدیریت حضور و غیاب دوره</h3>
              <p className="text-[11px] text-indigo-200 font-medium">{courseTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Absence Regulation Alert & Rule Summary */}
        <div className="p-3 bg-amber-50 border-b border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-amber-950">قانون جمع‌بندی خودکار غیبت‌ها:</strong>
            <span className="text-[11px] leading-relaxed text-amber-800">
              سقف غیبت مجاز در این دوره <strong>۳ جلسه</strong> است. در صورت ثبت غیبت چهارم، سامانه به‌طور خودکار دانش‌پژوه را <strong>محروم و از دوره حذف می‌کند</strong>.
            </span>
          </div>
        </div>

        {/* Statistical Badges */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-center">
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">کل دانشجویان</span>
            <span className="text-base font-black text-slate-800">{students.length} نفر</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-[10px] text-amber-700 font-bold block">در آستانه محرومیت (۳ غیبت)</span>
            <span className="text-base font-black text-amber-600">{warningCount} نفر</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-rose-200 shadow-sm">
            <span className="text-[10px] text-rose-700 font-bold block">حذف شده به علت غیبت</span>
            <span className="text-base font-black text-rose-600">{droppedCount} نفر</span>
          </div>
        </div>

        {/* Session Selector & Search */}
        <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">انتخاب جلسه جهت ثبت حضور و غیاب:</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
            >
              {sessions.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="جستجوی نام دانش‌پژوه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 rounded-xl pr-8 pl-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
              />
            </div>
            
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition ${filterType === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
              >
                همه
              </button>
              <button
                onClick={() => setFilterType('warning')}
                className={`px-2.5 py-1 rounded-lg transition ${filterType === 'warning' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
              >
                اخطار ({warningCount})
              </button>
              <button
                onClick={() => setFilterType('dropped')}
                className={`px-2.5 py-1 rounded-lg transition ${filterType === 'dropped' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500'}`}
              >
                محروم ({droppedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="bg-indigo-600 text-white text-xs font-bold py-1.5 px-4 text-center transition animate-in fade-in">
            {actionNotice}
          </div>
        )}

        {/* Student Attendance List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold">دانش‌پژوهی با این مشخصات یافت نشد.</p>
            </div>
          ) : (
            filteredStudents.map((s) => (
              <div 
                key={s.userId} 
                className={`p-3 rounded-2xl border transition space-y-2 ${
                  s.isDropped 
                    ? 'bg-rose-50/70 border-rose-200' 
                    : (s.totalAbsences === 3 ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/70 border-slate-200')
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                      <span>{s.userName}</span>
                      {s.isAuto && (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                          ثبت خودکار ورود
                        </span>
                      )}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">
                        مجموع غیبت‌ها: <strong className="text-slate-800">{s.totalAbsences} از ۳</strong>
                      </span>
                      
                      {s.isDropped ? (
                        <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserX size={10} />
                          محروم شده به علت غیبت غیرمجاز
                        </span>
                      ) : (s.totalAbsences === 3 && (
                        <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={10} />
                          اخطار آخر (حذف با ۱ غیبت دیگر)
                        </span>
                      ))}
                    </div>
                  </div>

                  {s.isDropped && (
                    <button
                      onClick={() => handleReinstateStudent(s.userId)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-xl transition flex items-center gap-1 shadow-sm"
                      title="بخشش غیبت و بازگرداندن دانش‌پژوه به دوره"
                    >
                      <UserCheck size={12} />
                      لغو محرومیت
                    </button>
                  )}
                </div>

                {/* Quick Toggle Buttons for Attendance */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">وضعیت این جلسه:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(s.userId, 'present')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${
                        s.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
                      }`}
                    >
                      <CheckCircle size={11} />
                      حاضر
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s.userId, 'absent')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${
                        s.status === 'absent'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
                      }`}
                    >
                      <XCircle size={11} />
                      غایب
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s.userId, 'justified')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${
                        s.status === 'justified'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
                      }`}
                    >
                      موجه
                    </button>
                    <button
                      onClick={() => handleToggleStatus(s.userId, 'tardy')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${
                        s.status === 'tardy'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
                      }`}
                    >
                      تاخیر
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            تغییرات بلافاصله در پرونده آموزشی و کارنامه دانشجویان ذخیره می‌شود.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
          >
            تایید و ذخیره
          </button>
        </div>

      </div>
    </div>
  );
}
