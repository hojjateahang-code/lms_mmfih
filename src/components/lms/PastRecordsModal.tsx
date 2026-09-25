import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Calendar, 
  User, 
  Plus, 
  Download, 
  GraduationCap, 
  Search,
  FileCheck
} from 'lucide-react';
import { AcademicRecord, Certificate } from '../../types';
import { getAcademicRecords, addAcademicRecord, getUserCertificates } from '../../services/lmsService';

interface PastRecordsModalProps {
  userId: string;
  userName: string;
  userRole?: string;
  onClose: () => void;
  onViewCertificate?: (cert: Certificate) => void;
}

export default function PastRecordsModal({
  userId,
  userName,
  userRole = 'student',
  onClose,
  onViewCertificate
}: PastRecordsModalProps) {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<'transcripts' | 'certificates' | 'add_record'>('transcripts');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // New record form state for managers/teachers
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newTerm, setNewTerm] = useState('نیم‌سال دوم ۱۴۰۳');
  const [newInstructor, setNewInstructor] = useState('');
  const [newGrade, setNewGrade] = useState('18.5');
  const [newAbsences, setNewAbsences] = useState('1');
  const [newYear, setNewYear] = useState('۱۴۰۳');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    const [recList, certList] = await Promise.all([
      getAcademicRecords(userId),
      getUserCertificates(userId)
    ]);
    setRecords(recList);
    setCertificates(certList);
    setLoading(false);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return alert('لطفاً عنوان دوره را وارد کنید');

    setIsSubmitting(true);
    const gradeNum = parseFloat(newGrade) || 0;
    await addAcademicRecord({
      user_id: userId,
      course_title: newCourseTitle,
      term: newTerm,
      instructor: newInstructor || 'استاد مدعو',
      grade: gradeNum,
      max_grade: 20,
      status: gradeNum >= 12 ? 'passed' : 'failed',
      absence_count: parseInt(newAbsences) || 0,
      max_allowed_absences: 3,
      year: newYear,
      certificate_code: gradeNum >= 12 ? `MFIH-${Math.floor(1000 + Math.random() * 9000)}` : undefined
    });

    setNewCourseTitle('');
    setNewInstructor('');
    await loadData();
    setIsSubmitting(false);
    setActiveTab('transcripts');
    alert('سابقه آموزشی با موفقیت ثبت شد!');
  };

  const filteredRecords = records.filter(r => 
    r.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate GPA
  const totalGrades = records.reduce((sum, r) => sum + r.grade, 0);
  const averageGpa = records.length > 0 ? (totalGrades / records.length).toFixed(2) : '۰';
  const passedCount = records.filter(r => r.status === 'passed').length;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-700 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <GraduationCap className="text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">سوابق گذشته و پرونده آموزشی</h3>
              <p className="text-[11px] text-indigo-200 font-medium">دانش‌پژوه: {userName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50/60 border-b border-indigo-100/60 text-center">
          <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">معدل کل نمرات</span>
            <span className="text-base font-black text-indigo-700">{averageGpa}</span>
            <span className="text-[9px] text-slate-400 mr-0.5">از ۲۰</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">دوره‌های گذرانده</span>
            <span className="text-base font-black text-emerald-600">{passedCount}</span>
            <span className="text-[9px] text-slate-400 mr-0.5">دوره</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">گواهی‌های صادره</span>
            <span className="text-base font-black text-amber-600">{certificates.length}</span>
            <span className="text-[9px] text-slate-400 mr-0.5">مدرک</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('transcripts')}
            className={`py-3 px-3 text-xs font-black transition relative ${
              activeTab === 'transcripts' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            نمرات و ریزنمرات ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-3 px-3 text-xs font-black transition relative ${
              activeTab === 'certificates' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            گواهی‌نامه‌های رسمی ({certificates.length})
          </button>
          {(userRole === 'executive_manager' || userRole === 'teacher') && (
            <button
              onClick={() => setActiveTab('add_record')}
              className={`py-3 px-3 text-xs font-black transition flex items-center gap-1 ${
                activeTab === 'add_record' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus size={14} />
              ثبت سابقه جدید
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'transcripts' && (
            <>
              {/* Search Bar */}
              <div className="relative mb-2">
                <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو در دوره‌ها، اساتید یا نیم‌سال‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">هیچ سابقه تحصیلی در این بخش یافت نشد.</p>
                </div>
              ) : (
                filteredRecords.map((r) => (
                  <div 
                    key={r.id} 
                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 transition space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-xs text-slate-800">{r.course_title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-indigo-500" />
                            {r.instructor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-amber-500" />
                            {r.term}
                          </span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                          r.grade >= 17 ? 'bg-emerald-100 text-emerald-800' : (r.grade >= 12 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800')
                        }`}>
                          نمره: {r.grade}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-0.5 text-center">
                          {r.status === 'passed' ? 'قبول' : 'مردود'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">
                        تعداد غیبت‌های ثبت‌شده: <strong className="text-slate-700">{r.absence_count} از {r.max_allowed_absences}</strong>
                      </span>
                      {r.certificate_code && (
                        <span className="bg-amber-100/70 text-amber-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Award size={11} />
                          کد گواهی: {r.certificate_code}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Award size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">هنوز گواهی‌نامه‌ای برای این دانش‌پژوه صادر نشده است.</p>
                  <p className="text-[10px] text-slate-400 mt-1">با قبولی در آزمون پایان دوره، گواهی خودکار صادر خواهد شد.</p>
                </div>
              ) : (
                certificates.map((cert) => (
                  <div 
                    key={cert.id}
                    className="p-4 bg-gradient-to-br from-amber-50/70 to-white rounded-2xl border border-amber-200/80 shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                          <Award size={18} />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-slate-900">{cert.course_title}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">شماره سریال: {cert.verification_code}</span>
                        </div>
                      </div>
                      <span className="bg-amber-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                        {cert.grade_text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-1 border-t border-amber-100">
                      <span>تاریخ صدور: {cert.issue_date}</span>
                      <span>نمره: <strong>{cert.final_score} از {cert.max_score}</strong></span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onViewCertificate && onViewCertificate(cert)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-amber-200"
                      >
                        <FileCheck size={14} />
                        مشاهده و چاپ گواهی
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'add_record' && (
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div className="bg-indigo-50 p-3 rounded-2xl text-[11px] text-indigo-800 font-medium">
                به عنوان استاد یا مدیر سامانه، می‌توانید سوابق تحصیلی گذشته دانش‌پژوه را ثبت نمایید تا در پرونده آموزشی و کارنامه او ذخیره شود.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان دوره آموزشی *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: روش تحقیق در علوم اسلامی"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نیم‌سال / دوره</label>
                  <input
                    type="text"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سال تحصیلی</label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام استاد مدرس</label>
                <input
                  type="text"
                  placeholder="مثال: استاد حسینی"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نمره نهایی (از ۲۰)</label>
                  <input
                    type="number"
                    step="0.25"
                    max="20"
                    min="0"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تعداد غیبت</label>
                  <input
                    type="number"
                    max="10"
                    min="0"
                    value={newAbsences}
                    onChange={(e) => setNewAbsences(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
              >
                <CheckCircle size={15} />
                {isSubmitting ? 'در حال ثبت...' : 'ثبت قطعی در سوابق تحصیلی'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
}
