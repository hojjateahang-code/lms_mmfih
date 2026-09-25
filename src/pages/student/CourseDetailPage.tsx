import React, { useEffect, useState } from 'react';
import { 
  ChevronRight, 
  Star, 
  Clock, 
  User, 
  CheckCircle, 
  Play, 
  Share2, 
  Award, 
  Loader2, 
  PlayCircle, 
  BookOpen, 
  CreditCard, 
  X, 
  Radio, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  HelpCircle,
  FileCheck,
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Course, LiveSession, Certificate, Exam, CourseAttendanceSummary } from '../../types';
import { getCourseContent, Chapter, Lesson, enrollCourse, getEnrollmentStatus, markLessonCompleted, getUserProgress } from '../../services/courseService';
import { 
  getCourseLiveSessions, 
  getCourseAttendanceSummary, 
  isStudentDropped, 
  getCourseExams, 
  getUserCertificates 
} from '../../services/lmsService';
import { useAuth } from '../../contexts/AuthContext';
import LiveClassModal from '../../components/lms/LiveClassModal';
import ExamRoomModal from '../../components/lms/ExamRoomModal';
import CertificateViewerModal from '../../components/lms/CertificateViewerModal';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onEnroll: (course: Course) => void;
  isEnrolled?: boolean;
}

export default function CourseDetailPage({ course, onBack, onEnroll }: CourseDetailPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'episodes' | 'live' | 'exams' | 'attendance'>('about');
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // LMS operational states
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSession | null>(null);
  const [courseExams, setCourseExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<CourseAttendanceSummary | null>(null);
  const [isDroppedDueToAbsence, setIsDroppedDueToAbsence] = useState(false);

  const courseId = parseInt(course.id) || 1;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      
      const contentRes = await getCourseContent(courseId);
      if (contentRes.success && contentRes.data) {
        setChapters(contentRes.data);
      }

      // Load Live Sessions & Exams
      const [sessions, examsList] = await Promise.all([
        getCourseLiveSessions(courseId),
        getCourseExams(courseId)
      ]);
      setLiveSessions(sessions);
      setCourseExams(examsList);

      if (user) {
        const enrollRes = await getEnrollmentStatus(user.id, courseId);
        if (enrollRes.success && enrollRes.isEnrolled) {
          setEnrolled(true);
        }
        
        const progRes = await getUserProgress(user.id, courseId);
        if (progRes.success && progRes.data) {
          const map: Record<number, boolean> = {};
          progRes.data.forEach((p: any) => {
            map[p.lesson_id] = p.is_completed;
          });
          setProgress(map);
        }

        // Attendance & Auto-Drop status
        const summary = await getCourseAttendanceSummary(courseId, user.id, user.user_metadata?.full_name || user.full_name || 'کاربر گرامی');
        setAttendanceSummary(summary);
        setIsDroppedDueToAbsence(isStudentDropped(courseId, user.id));
      }
      
      setLoading(false);
    };
    fetchAll();
  }, [course.id, user]);

  const handleEnrollClick = async () => {
    if (!user) return alert('لطفا ابتدا وارد سیستم شوید');
    
    if (course.is_free || course.price === 0) {
      const res = await enrollCourse(user.id, courseId);
      if (res.success) {
        setEnrolled(true);
        onEnroll(course);
        alert('ثبت‌نام با موفقیت انجام شد!');
      } else {
        alert('خطا در ثبت‌نام: ' + res.error);
      }
    } else {
      setShowPaymentModal(true);
    }
  };

  const processPayment = async () => {
    if (!user) return;
    const currentBalance = parseInt(localStorage.getItem('mock_wallet_balance') || '50000');
    if (currentBalance < course.price) {
      alert('موجودی کیف پول شما کافی نیست. لطفا ابتدا کیف پول خود را شارژ کنید.');
      return;
    }
    
    setPaymentLoading(true);
    setTimeout(async () => {
      const res = await enrollCourse(user.id, courseId);
      if (res.success) {
        localStorage.setItem('mock_wallet_balance', (currentBalance - course.price).toString());
        setEnrolled(true);
        onEnroll(course);
        setShowPaymentModal(false);
        alert('پرداخت موفقیت‌آمیز بود. ثبت‌نام شما قطعی شد.');
      } else {
        alert('خطا در ثبت‌نام: ' + res.error);
      }
      setPaymentLoading(false);
    }, 1200);
  };

  const [studyModeLesson, setStudyModeLesson] = useState<Lesson | null>(null);

  const handleLessonAction = async (lesson: Lesson) => {
    if (isDroppedDueToAbsence) {
      return alert('دسترسی شما به دلیل غیبت بیش از حد مجاز مسدود گردیده است.');
    }
    if (!enrolled && !lesson.is_free) {
      return alert('برای مشاهده این درس باید در دوره ثبت‌نام کنید.');
    }
    
    setStudyModeLesson(lesson);
  };

  const handleCompleteLesson = async () => {
    if (user && studyModeLesson && !progress[studyModeLesson.id]) {
      const res = await markLessonCompleted(user.id, studyModeLesson.id);
      if (res.success) {
        setProgress(prev => ({ ...prev, [studyModeLesson.id]: true }));
      }
    }
  };

  const totalEpisodes = chapters.reduce((acc, c) => acc + (c.items?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      
      {/* Top Media / Banner */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {course.banner_url ? (
          <img src={course.banner_url} alt={course.title} className="w-full h-full object-cover opacity-85" />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
            <BookOpen size={48} className="text-indigo-400/50" />
          </div>
        )}

        <button 
          onClick={onBack}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition shadow-lg"
        >
          <ChevronRight size={20} />
        </button>

        {/* Live Badge if any live session exists */}
        {liveSessions.some(s => s.status === 'live') && (
          <div className="absolute top-4 left-4 bg-rose-600/90 text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
            <Radio size={13} />
            <span>کلاس آنلاین هم‌اکنون زنده است</span>
          </div>
        )}
      </div>

      {/* Main Course Info Header */}
      <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 text-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-700/80 text-indigo-100 text-[10px] font-black px-2.5 py-0.5 rounded-full">
            {course.category_name || 'تخصصی'}
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {course.course_type === 'online' ? 'کلاس آنلاین زنده' : 'دوره ترکیبی (آنلاین + آفلاین)'}
          </span>
        </div>

        <h1 className="text-base sm:text-lg font-black leading-snug">{course.title}</h1>

        <div className="flex items-center gap-4 text-xs text-indigo-200">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <Star size={14} className="fill-amber-300" /> {course.rating || 4.8}
          </div>
          <div className="flex items-center gap-1">
            <User size={14} /> {course.instructor}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        
        {/* DISQUALIFIED / AUTO-DROP BANNER (If student exceeded absences) */}
        {isDroppedDueToAbsence && (
          <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-3xl text-rose-950 space-y-2 shadow-sm animate-in shake">
            <div className="flex items-center gap-2 text-rose-700 font-black text-xs">
              <ShieldAlert size={18} />
              <span>محرومیت از ادامه دوره به دلیل تجاوز از سقف غیبت مجاز</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
              شما بیش از سقف مجاز (۳ جلسه) غیبت ثبت کرده‌اید. طبق آیین‌نامه انضباطی سامانه، دسترسی شما به جلسات آموزشی و آزمون پایان دوره مسدود گردیده است.
            </p>
          </div>
        )}

        {/* ATTENDANCE WARNING BANNER (If 2 or 3 absences) */}
        {!isDroppedDueToAbsence && attendanceSummary && attendanceSummary.absent_count >= 2 && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex items-start gap-2.5 text-xs">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-amber-950">اخطار آستانه غیبت:</strong>
              <span className="text-[11px] text-amber-800">
                شما <strong>{attendanceSummary.absent_count} غیبت</strong> از سقف <strong>{attendanceSummary.max_allowed_absences} جلسه مجاز</strong> دارید. در صورت ثبت غیبت بعدی، سامانه به صورت خودکار شما را محروم خواهد کرد.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-[11px] font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-[70px] py-2 rounded-xl transition-all ${
              activeTab === 'about' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            درباره دوره
          </button>
          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex-1 min-w-[70px] py-2 rounded-xl transition-all ${
              activeTab === 'episodes' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            جلسات آفلاین ({totalEpisodes})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 min-w-[70px] py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'live' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Radio size={12} className="text-rose-500" />
            کلاس آنلاین ({liveSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex-1 min-w-[70px] py-2 rounded-xl transition-all ${
              activeTab === 'exams' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            آزمون دوره ({courseExams.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 min-w-[70px] py-2 rounded-xl transition-all ${
              activeTab === 'attendance' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            حضور و غیاب
          </button>
        </div>

        {/* TAB 1: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-black text-slate-900 text-sm">توضیحات و اهداف دوره</h3>
              <p className="leading-relaxed">{course.description}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">نوع برگزاری:</span>
                  <span className="font-black text-indigo-800">ترکیبی (آنلاین + آفلاین)</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">سقف غیبت مجاز:</span>
                  <span className="font-black text-rose-700">حداکثر ۳ جلسه</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 rounded-3xl border border-amber-200 text-amber-950 flex items-start gap-3 shadow-sm">
              <Award size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-black text-xs">صدور خودکار گواهی‌نامه رسمی پایان دوره</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  با شرکت در جلسات، رعایت سقف غیبت مجاز و قبولی در آزمون جامع، گواهی رسمی با کد رهگیری اختصاصی به‌طور خودکار صادر می‌گردد.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFLINE EPISODES */}
        {activeTab === 'episodes' && (
          <div className="space-y-3">
            {chapters.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10">هیچ سرفصلی ثبت نشده است.</div>
            ) : (
              chapters.map((chapter) => (
                <div key={chapter.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                  <h3 className="font-black text-slate-800 text-xs border-b border-slate-100 pb-2">{chapter.title}</h3>
                  
                  <div className="space-y-1.5">
                    {chapter.items?.map((lesson) => {
                      const isCompleted = progress[lesson.id];
                      const canAccess = enrolled || lesson.is_free;
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonAction(lesson)}
                          className={`p-3 rounded-2xl border transition flex justify-between items-center cursor-pointer ${
                            isDroppedDueToAbsence 
                              ? 'opacity-40 pointer-events-none bg-slate-100'
                              : (selectedEpisode === lesson.id ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50/70 border-slate-200/60 hover:border-slate-300')
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isCompleted ? <CheckCircle size={14} /> : <PlayCircle size={14} />}
                            </div>
                            <div>
                              <h4 className={`font-bold text-xs ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>
                                {lesson.title}
                              </h4>
                              <span className="text-[10px] text-slate-400">{lesson.duration_minutes} دقیقه ویدیوی آفلاین</span>
                            </div>
                          </div>

                          <div>
                            {!canAccess ? (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Lock size={10} /> قفل
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">
                                مشاهده
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: LIVE ONLINE CLASSES */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed font-medium">
              💡 <strong>ویژگی حضور و غیاب خودکار:</strong> به محض کلیک روی دکمه «ورود به کلاس آنلاین»، حضور شما به همراه زمان دقیق به طور خودکار در پرونده آموزشی‌تان ثبت خواهد شد.
            </div>

            {liveSessions.map((session) => (
              <div 
                key={session.id} 
                className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h4 className="font-black text-xs text-slate-900">{session.title}</h4>
                  </div>
                  <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {session.status === 'live' ? 'هم‌اکنون زنده' : 'برنامه‌ریزی شده'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-indigo-500" />
                    {session.scheduled_time}
                  </span>
                  <span>مدرس: {session.instructor_name}</span>
                </div>

                <button
                  disabled={!enrolled || isDroppedDueToAbsence}
                  onClick={() => setActiveLiveSession(session)}
                  className="w-full bg-gradient-to-l from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 disabled:opacity-40 text-white font-black text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                >
                  <Radio size={14} />
                  ورود به کلاس آنلاین (ثبت خودکار حضور)
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: EXAMS & AUTO-GRADING */}
        {activeTab === 'exams' && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed font-medium">
              🎯 <strong>تصحیح خودکار و صدور آنی گواهی:</strong> سوالات آزمون بلافاصله پس از ارسال تصحیح شده و در صورت قبولی، مدرک معتبر با کد پیگیری اختصاصی برای شما صادر می‌گردد.
            </div>

            {courseExams.map((exam) => (
              <div key={exam.id} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                    <HelpCircle size={15} className="text-amber-500" />
                    <span>{exam.title}</span>
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    تصحیح خودکار
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">{exam.description}</p>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] py-1 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">مدت آزمون:</span>
                    <strong className="text-slate-700">{exam.duration_minutes} دقیقه</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">تعداد سوالات:</span>
                    <strong className="text-slate-700">{exam.questions.length} سوال</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">حداقل قبولی:</span>
                    <strong className="text-indigo-700">{exam.passing_score} از {exam.total_score}</strong>
                  </div>
                </div>

                <button
                  disabled={!enrolled || isDroppedDueToAbsence}
                  onClick={() => setActiveExam(exam)}
                  className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-black text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                >
                  <CheckCircle size={14} />
                  شروع آزمون با تصحیح خودکار
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: ATTENDANCE SUMMARY */}
        {activeTab === 'attendance' && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-black text-xs text-slate-900">وضعیت حضور و غیاب شما در این دوره</h4>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold block">جلسات حاضر</span>
                  <span className="text-base font-black text-emerald-700">{attendanceSummary?.present_count || 1} جلسه</span>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100">
                  <span className="text-[10px] text-rose-800 font-bold block">تعداد غیبت</span>
                  <span className="text-base font-black text-rose-700">{attendanceSummary?.absent_count || 0} جلسه</span>
                </div>
                <div className="bg-indigo-50 p-2.5 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] text-indigo-800 font-bold block">سقف مجاز</span>
                  <span className="text-base font-black text-indigo-700">۳ جلسه</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>وضعیت انضباطی:</span>
                  <span className={`font-black ${isDroppedDueToAbsence ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isDroppedDueToAbsence ? 'محروم شده به علت غیبت غیرمجاز' : 'مجاز و فعال'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>روش محاسبه:</span>
                  <span className="text-slate-500">جمع‌بندی هوشمند خودکار</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl flex justify-between items-center z-40">
        <div>
          <span className="text-[10px] text-slate-400 block">شهریه ثبت‌نام دوره:</span>
          {course.price === 0 ? (
            <span className="text-emerald-600 font-black text-base">رایگان</span>
          ) : (
            <span className="text-indigo-950 font-black text-base">
              {course.price.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </span>
          )}
        </div>

        {enrolled ? (
          <button
            onClick={() => setActiveTab('episodes')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-2 transition"
          >
            <CheckCircle size={16} /> ورود به جلسات
          </button>
        ) : (
          <button
            onClick={handleEnrollClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95 transition-transform"
          >
            {course.is_free || course.price === 0 ? 'ثبت‌نام رایگان در دوره' : 'ثبت‌نام و پرداخت با کیف پول'}
          </button>
        )}
      </div>

      {/* MODALS */}
      
      {/* 1. Live Class Room */}
      {activeLiveSession && (
        <LiveClassModal
          session={activeLiveSession}
          userId={user?.id || 'usr_current'}
          userName={user?.user_metadata?.full_name || user?.full_name || 'دانش‌پژوه گرامی'}
          userRole={user?.role || 'student'}
          onClose={() => setActiveLiveSession(null)}
        />
      )}

      {/* 2. Exam Room with Auto-Grading */}
      {activeExam && (
        <ExamRoomModal
          exam={activeExam}
          courseTitle={course.title}
          userId={user?.id || 'usr_current'}
          userName={user?.user_metadata?.full_name || user?.full_name || 'دانش‌پژوه گرامی'}
          onClose={() => setActiveExam(null)}
          onViewCertificate={(cert) => {
            setActiveExam(null);
            setViewingCertificate(cert);
          }}
        />
      )}

      {/* 3. Certificate Viewer */}
      {viewingCertificate && (
        <CertificateViewerModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}

      {/* 4. Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 text-sm">تایید پرداخت و ثبت‌نام در دوره</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={18} /></button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>شهریه دوره:</span>
                <span className="font-black text-indigo-700">{course.price.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>موجودی کیف پول شما:</span>
                <span className="font-black text-emerald-600">{(parseInt(localStorage.getItem('mock_wallet_balance') || '50000')).toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed text-center">
              با تایید پرداخت، مبلغ فوق از کیف پول شما کسر شده و ثبت‌نام شما در لیست دانشجویان دوره نهایی می‌شود.
            </p>
            
            <div className="flex gap-2">
              <button
                disabled={paymentLoading}
                onClick={processPayment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl shadow-md flex justify-center items-center gap-2 transition"
              >
                {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {paymentLoading ? 'در حال پردازش...' : 'تایید نهایی و پرداخت'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
