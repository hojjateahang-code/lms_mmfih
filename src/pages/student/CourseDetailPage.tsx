import React, { useEffect, useState } from 'react';
import { ChevronRight, Star, Clock, User, CheckCircle, Play, Share2, Award, Loader2, PlayCircle, BookOpen, CreditCard, X, Printer, Download } from 'lucide-react';
import { Course } from '../../types';
import { getCourseContent, Chapter, Lesson, enrollCourse, getEnrollmentStatus, markLessonCompleted, getUserProgress } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onEnroll: (course: Course) => void;
  isEnrolled?: boolean; // legacy
}

export default function CourseDetailPage({ course, onBack, onEnroll }: CourseDetailPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'episodes' | 'instructor'>('about');
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState<Record<number, boolean>>({}); // lesson_id -> is_completed
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const courseId = parseInt(course.id);
      
      const contentRes = await getCourseContent(courseId);
      if (contentRes.success && contentRes.data) {
        setChapters(contentRes.data);
      }

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
      }
      
      setLoading(false);
    };
    fetchAll();
  }, [course.id, user]);

    const handleEnrollClick = async () => {
    if (!user) return alert('لطفا ابتدا وارد سیستم شوید');
    
    if (course.is_free || course.price === 0) {
      const res = await enrollCourse(user.id, parseInt(course.id));
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
      const res = await enrollCourse(user.id, parseInt(course.id));
      if (res.success) {
        localStorage.setItem('mock_wallet_balance', (currentBalance - course.price).toString());
        setEnrolled(true);
        onEnroll(course);
        setShowPaymentModal(false);
        alert('پرداخت موفقیت‌آمیز بود. شما به دوره اضافه شدید.');
      } else {
        alert('خطا در ثبت‌نام: ' + res.error);
      }
      setPaymentLoading(false);
    }, 1500);
  };

  const [studyModeLesson, setStudyModeLesson] = useState<Lesson | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{score: number, passed: boolean} | null>(null);

  const MOCK_QUIZ_QUESTIONS = [
    { id: 1, text: 'کدام گزینه درباره این مبحث صحیح است؟', options: ['گزینه الف', 'گزینه ب', 'گزینه ج', 'گزینه د'], correct: 1 },
    { id: 2, text: 'معنی لغوی واژه مورد بحث چیست؟', options: ['معنی ۱', 'معنی ۲', 'معنی ۳', 'معنی ۴'], correct: 2 },
    { id: 3, text: 'استاد در جلسه دوم به کدام موضوع اشاره کردند؟', options: ['موضوع اول', 'موضوع دوم', 'موضوع سوم', 'موضوع چهارم'], correct: 1 },
  ];

  const handleLessonAction = async (lesson: Lesson) => {
    if (!enrolled && !lesson.is_free) {
      return alert('برای مشاهده این درس باید در دوره ثبت‌نام کنید.');
    }
    
    if (lesson.type === 'certificate') {
      const allLessons = chapters.flatMap(c => c.items || []);
      const totalRequired = allLessons.filter(l => l.type !== 'certificate').length;
      // Note: progress holds entries for completed lessons only usually, but let's count only true values
      const completed = Object.values(progress).filter(Boolean).length;
      if (completed < totalRequired) {
        return alert(`برای صدور گواهینامه باید تمامی درس‌ها و آزمون‌های دوره را با موفقیت بگذرانید. (پیشرفت فعلی: ${completed} از ${totalRequired})`);
      }
    }
    
    setStudyModeLesson(lesson);
    setQuizResult(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
  };

    const handleCompleteLesson = async () => {
    if (user && studyModeLesson && !progress[studyModeLesson.id]) {
      const res = await markLessonCompleted(user.id, studyModeLesson.id);
      if (res.success) {
        setProgress(prev => ({ ...prev, [studyModeLesson.id]: true }));
      }
    }
    // We do NOT close the view here, let the user stay on the page.
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      </div>
    );
  }

  // Study Workspace View
  if (studyModeLesson) {
    return (
      <div className="min-h-screen bg-black flex flex-col font-sans text-white dir-rtl" dir="rtl">
        {/* Top Navbar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <button onClick={() => {
            setStudyModeLesson(null);
            setQuizResult(null);
            setCurrentQuestion(0);
            setSelectedAnswers({});
          }} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">
            <ChevronRight size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold truncate max-w-[200px]">{course.title}</h2>
            <p className="text-[10px] text-slate-400">{studyModeLesson.title}</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>

        {/* Player Area */}
        <div className="flex-1 flex flex-col relative">
          {studyModeLesson.type === 'quiz' ? (
            <div className="flex-1 bg-slate-900 flex flex-col p-6 overflow-y-auto">
              {!quizResult ? (
                <div className="max-w-md mx-auto w-full">
                  <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl mb-4">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                      <h3 className="text-lg font-bold">آزمون: {studyModeLesson.title}</h3>
                      <span className="text-indigo-400 font-bold bg-indigo-900/50 px-3 py-1 rounded-lg text-sm">
                        {currentQuestion + 1} از {MOCK_QUIZ_QUESTIONS.length}
                      </span>
                    </div>
                    
                    <h4 className="text-base font-medium mb-6 leading-relaxed">
                      {MOCK_QUIZ_QUESTIONS[currentQuestion].text}
                    </h4>

                    <div className="space-y-3">
                      {MOCK_QUIZ_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: idx }))}
                          className={`w-full text-right p-4 rounded-2xl border transition-all ${
                            selectedAnswers[currentQuestion] === idx
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {currentQuestion > 0 && (
                      <button
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition text-slate-300"
                      >
                        قبلی
                      </button>
                    )}
                    {currentQuestion < MOCK_QUIZ_QUESTIONS.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                        className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-bold transition"
                      >
                        بعدی
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          let correctCount = 0;
                          MOCK_QUIZ_QUESTIONS.forEach((q, idx) => {
                            if (selectedAnswers[idx] === q.correct) correctCount++;
                          });
                          const score = Math.round((correctCount / MOCK_QUIZ_QUESTIONS.length) * 100);
                          const passed = score >= 60;
                          setQuizResult({ score, passed });
                          if (passed) {
                            handleCompleteLesson(); // Auto mark complete if passed
                          }
                        }}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                        className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-bold transition"
                      >
                        ثبت نهایی و مشاهده نتیجه
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto w-full text-center">
                  <div className={`p-8 rounded-3xl border shadow-xl mb-4 ${
                    quizResult.passed ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-rose-900/20 border-rose-800/50'
                  }`}>
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                      quizResult.passed ? 'bg-emerald-800/50 text-emerald-400' : 'bg-rose-800/50 text-rose-400'
                    }`}>
                      {quizResult.passed ? <Award size={40} /> : <BookOpen size={40} />}
                    </div>
                    <h3 className="text-2xl font-black mb-2">
                      {quizResult.passed ? 'تبریک! آزمون را با موفقیت گذراندید.' : 'متاسفانه نمره قبولی کسب نکردید.'}
                    </h3>
                    <p className="text-slate-400 mb-6">نمره شما: <span className="font-bold text-white">{quizResult.score}٪</span></p>
                    
                    {!quizResult.passed && (
                      <button
                        onClick={() => {
                          setQuizResult(null);
                          setCurrentQuestion(0);
                          setSelectedAnswers({});
                        }}
                        className="py-3 px-6 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition"
                      >
                        تلاش مجدد
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : studyModeLesson.type === 'certificate' ? (
                        <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
              <div className="print:hidden mb-6 text-center">
                <h3 className="text-2xl font-black mb-2 text-white">صدور گواهینامه</h3>
                <p className="text-sm text-slate-400">گواهینامه پایان دوره با موفقیت صادر شد.</p>
              </div>
              <div id="certificate-preview" className="bg-white text-slate-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-3xl w-full aspect-[1.414/1] flex flex-col items-center justify-center relative overflow-hidden mb-6 border-8 border-double border-amber-200 print:shadow-none print:border-none print:aspect-auto">
                <div className="absolute inset-0 bg-slate-50 opacity-50"></div>
                
                <Award size={64} className="text-amber-500 mb-4 relative z-10" />
                <h2 className="text-3xl font-black text-slate-900 mb-2 relative z-10">گواهینامه پایان دوره</h2>
                <h3 className="text-xl font-bold text-slate-600 mb-10 relative z-10">{course.title}</h3>
                
                <p className="text-sm text-slate-500 mb-3 relative z-10">این گواهی به پاس قدردانی از تلاش و پشتکار به:</p>
                <p className="text-3xl font-black text-indigo-900 mb-8 relative z-10 border-b-2 border-indigo-200 pb-3 px-12">{user?.full_name || 'دانش‌پژوه محترم'}</p>
                
                <p className="text-sm text-slate-500 relative z-10 max-w-lg text-center leading-relaxed">
                  اعطا می‌گردد که با موفقیت دوره آموزشی و آزمون‌های مربوطه را تحت نظارت مرکز آموزش و ارزیابی به پایان رسانده است.
                </p>
                
                <div className="flex justify-between w-full mt-16 px-8 md:px-16 relative z-10">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 border-b border-slate-300 pb-1 mb-1 w-24 mx-auto">مدرس دوره</div>
                    <div className="text-sm font-black text-slate-800">{course.instructor}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-300 flex items-center justify-center text-red-500/50 transform -rotate-12 font-bold text-xs">مهر رسمی</div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 border-b border-slate-300 pb-1 mb-1 w-24 mx-auto">تاریخ صدور</div>
                    <div className="text-sm font-black text-slate-800">{new Date().toLocaleDateString('fa-IR')}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 w-full max-w-3xl print:hidden">
                <button onClick={() => window.print()} className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-2xl font-black text-sm transition shadow-lg flex justify-center gap-2 items-center">
                  <Download size={20} /> دانلود و چاپ گواهینامه (PDF)
                </button>
                <button onClick={() => setStudyModeLesson(null)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition border border-slate-700">
                  بازگشت به دوره
                </button>
              </div>
            </div>
          ) : studyModeLesson.type === 'video' || studyModeLesson.type === 'audio' ? (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-black flex items-center justify-center relative shadow-2xl rounded-3xl overflow-hidden mt-6 border border-slate-800">
              <video src={studyModeLesson.media_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'} controls className="w-full h-full object-cover" autoPlay />
            </div>
          ) : (
            <div className="flex-1 bg-slate-900 flex items-center justify-center p-6">
              <div className="bg-slate-800 p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-slate-700">
                <BookOpen size={48} className="mx-auto mb-4 text-indigo-400" />
                <h3 className="text-lg font-bold mb-2">{studyModeLesson.title}</h3>
                <p className="text-sm text-slate-400 mb-6">این محتوا به صورت متن/پی‌دی‌اف ارائه شده است.</p>
                <button className="w-full py-3 bg-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition">
                  دانلود محتوا
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-slate-900 flex-1">
            <h3 className="font-bold text-lg mb-2">{studyModeLesson.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{studyModeLesson.description || 'توضیحاتی برای این جلسه ثبت نشده است.'}</p>
          </div>
        </div>

        {/* Bottom Actions */}
        {studyModeLesson.type !== 'quiz' && studyModeLesson.type !== 'certificate' && (
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <button
              onClick={handleCompleteLesson}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition ${
                progress[studyModeLesson.id] 
                  ? 'bg-emerald-600/20 text-emerald-400 cursor-default border border-emerald-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/50'
              }`}
            >
              {progress[studyModeLesson.id] ? (
                <>
                  <CheckCircle size={18} /> درس به پایان رسیده
                </>
              ) : (
                'علامت‌گذاری به عنوان تکمیل‌شده'
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Count total episodes
  const totalEpisodes = chapters.reduce((acc, ch) => acc + (ch.items?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="relative bg-indigo-950 text-white pb-6 pt-4 px-4 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <ChevronRight size={20} />
          </button>
          <span className="text-xs font-bold text-indigo-200">{course.category_name}</span>
          <button className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition">
            <Share2 size={16} />
          </button>
        </div>

        {/* Video / Banner Preview */}
        <div className="w-full h-44 rounded-2xl overflow-hidden relative shadow-lg mb-4 bg-slate-800">
          <img
            src={course.banner_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'}
            alt={course.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent flex items-center justify-center">
            <button className="w-14 h-14 bg-white/90 text-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
              <Play size={24} className="mr-1 fill-indigo-600" />
            </button>
          </div>
        </div>

        <h1 className="font-black text-lg leading-snug mb-2">{course.title}</h1>
        
        <div className="flex items-center gap-4 text-xs text-indigo-200">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <Star size={14} className="fill-amber-300" /> {course.rating}
          </div>
          <div className="flex items-center gap-1">
            <User size={14} /> {course.instructor}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'about' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            درباره دوره
          </button>
          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'episodes' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            سرفصل‌ها ({totalEpisodes})
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'instructor' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            استاد دوره
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-700">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-slate-900 text-sm">توضیحات جامع دوره</h3>
              <p>{course.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">سطح آموزشی:</span>
                  <span className="font-bold text-slate-800">{course.level}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">وضعیت:</span>
                  <span className="font-bold text-slate-800">{enrolled ? 'ثبت‌نام شده' : 'ثبت‌نام نشده'}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-3xl border border-amber-200 text-amber-950 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3">
              <Award size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">گواهی‌پایان دوره معتبر</h4>
                <p className="text-[11px] text-amber-800 mt-1">
                  پس از مشاهده جلسات و شرکت در آزمون نهایی، گواهی رسمی صادر می‌گردد.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {chapters.length === 0 && (
              <div className="text-center text-slate-400 text-xs py-10">هیچ سرفصلی برای این دوره ثبت نشده است.</div>
            )}
            {chapters.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm mb-3 text-indigo-950 border-b border-slate-100 pb-2">{chapter.title}</h3>
                
                <div className="space-y-2">
                  {chapter.items?.map((lesson) => {
                    const isCompleted = progress[lesson.id];
                    const canAccess = enrolled || lesson.is_free;
                    
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonAction(lesson)}
                        className={`p-3 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                          selectedEpisode === lesson.id
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                            : 'bg-slate-50 border-transparent hover:border-slate-200'
                        } ${!canAccess ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isCompleted ? <CheckCircle size={14} /> : lesson.type === 'certificate' ? <Award size={14} /> : lesson.type === 'text' ? <BookOpen size={14} /> : <PlayCircle size={14} />}
                          </div>
                          <div>
                            <h4 className={`font-bold text-xs mb-0.5 ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {lesson.title}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {lesson.type === 'quiz' ? 'آزمون' : lesson.type === 'certificate' ? 'گواهینامه' : `${lesson.duration_minutes} دقیقه`}
                            </span>
                          </div>
                        </div>

                        <div>
                          {!canAccess ? (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-lg">
                              قفل
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg flex items-center gap-1">
                              {lesson.type === 'quiz' ? 'شروع' : lesson.type === 'certificate' ? 'دریافت' : 'مشاهده'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'instructor' && (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center">
                {course.instructor.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{course.instructor}</h3>
                <p className="text-[11px] text-slate-500">مدرس دوره</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl flex justify-between items-center z-50">
        <div>
          <span className="text-[10px] text-slate-400 block">شهریه دوره:</span>
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
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 text-sm">تایید پرداخت</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={18} /></button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>مبلغ قابل پرداخت:</span>
                <span className="font-black text-indigo-700">{course.price.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>موجودی کیف پول شما:</span>
                <span className="font-black text-emerald-600">{(parseInt(localStorage.getItem('mock_wallet_balance') || '50000')).toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed text-center">
              با تایید پرداخت، مبلغ فوق از کیف پول شما کسر شده و بلافاصله به محتوای دوره دسترسی خواهید داشت.
            </p>
            
            <div className="flex gap-2">
              <button
                disabled={paymentLoading}
                onClick={processPayment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl shadow-md flex justify-center items-center gap-2 transition"
              >
                {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {paymentLoading ? 'در حال پردازش...' : 'تایید و پرداخت'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
