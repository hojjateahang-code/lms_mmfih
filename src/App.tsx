import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BottomNav from './components/layout/BottomNav';
import StudentHome from './pages/student/StudentHome';
import SearchPage from './pages/student/SearchPage';
import MyCoursesPage from './pages/student/MyCoursesPage';
import StudentProfile from './pages/student/StudentProfile';
import ManagerFinance from './pages/manager/ManagerFinance';
import CourseDetailPage from './pages/student/CourseDetailPage';
import ManagerCourses from './pages/manager/ManagerCourses';
import CourseDashboard from './pages/manager/CourseDashboard';
import ManagerUsersPage from './pages/manager/ManagerUsersPage';
import CreateCoursePage from './pages/manager/CreateCoursePage';
import PaymentVerify from './pages/payment/PaymentVerify';
import TicketChat from './pages/support/TicketChat';
import ExamManagerModal from './components/lms/ExamManagerModal';
import AttendanceManagerModal from './components/lms/AttendanceManagerModal';
import { Course } from './types';
import { Loader2, LogOut, AlertCircle, HelpCircle } from 'lucide-react';
import { getUserEnrollments } from './services/courseService';
import { getEitaaSdkInstance } from './services/authService';

function AppRouter() {
  const { user, role, loading } = useAuth();
  
  const getDefaultRootTab = (userRole?: string | null) => {
    if (userRole === 'teacher') return 'teacher_courses';
    if (userRole === 'course_manager' || userRole === 'executive_manager') return 'courses';
    return 'home';
  };

  // Local state for tabs and navigation
  const [activeTab, setActiveTab] = useState<string>(getDefaultRootTab(role));
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [managerSelectedCourseId, setManagerSelectedCourseId] = useState<number | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Common Navigation Logic
  const handleSelectCourse = (course: Course) => setSelectedCourse(course);

  useEffect(() => {
    if (user?.id) {
      getUserEnrollments(user.id).then((res) => {
        if (res.success && res.data) {
          setEnrolledCourses(res.data.map((e: any) => String(e.course_id)));
        }
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading) {
      const rootTab = getDefaultRootTab(role);
      if (role === 'executive_manager' && (activeTab === 'home' || activeTab === 'teacher_courses')) {
        setActiveTab('courses');
      } else if (role === 'course_manager' && (activeTab === 'home' || activeTab === 'teacher_courses')) {
        setActiveTab('courses');
      } else if (role === 'teacher' && (activeTab === 'home' || activeTab === 'courses')) {
        setActiveTab('teacher_courses');
      } else if (role === 'student' && (activeTab === 'courses' || activeTab === 'teacher_courses')) {
        setActiveTab('home');
      }
    }
  }, [role, loading]);

  // Step-by-Step Back Navigation & Exit Confirmation
  const handleStepBack = () => {
    if (selectedCourse) {
      setSelectedCourse(null);
      return;
    }
    if (managerSelectedCourseId) {
      setManagerSelectedCourseId(null);
      return;
    }
    const rootTab = getDefaultRootTab(role);
    if (activeTab !== rootTab) {
      setActiveTab(rootTab);
      return;
    }
    // Already at root dashboard! Ask for exit confirmation
    setShowExitConfirm(true);
  };

  // Eitaa SDK BackButton integration
  useEffect(() => {
    const eitaa = getEitaaSdkInstance();
    const backBtn = eitaa?.BackButton;
    if (backBtn) {
      try {
        backBtn.show();
        const onBackClick = () => {
          handleStepBack();
        };
        backBtn.onClick(onBackClick);
        return () => {
          if (typeof backBtn.offClick === 'function') {
            backBtn.offClick(onBackClick);
          }
        };
      } catch (e) {
        console.warn('Eitaa BackButton error:', e);
      }
    }
  }, [selectedCourse, managerSelectedCourseId, activeTab, role]);

  // Hardware Back Button on Mobile Webview
  useEffect(() => {
    window.history.pushState({ appNav: true, depth: Date.now() }, '');

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState({ appNav: true, depth: Date.now() }, '');
      handleStepBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedCourse, managerSelectedCourseId, activeTab, role]);

  const handleConfirmExit = () => {
    const eitaa = getEitaaSdkInstance();
    if (eitaa && typeof eitaa.close === 'function') {
      eitaa.close();
    } else {
      setShowExitConfirm(false);
      try {
        window.close();
      } catch (e) {
        // ignore
      }
    }
  };

  if (window.location.pathname.startsWith('/payment/')) return <PaymentVerify />;

  // While checking Eitaa initData or Unified Database Session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-600 text-sm font-bold animate-pulse">در حال اتصال به دیتابیس سامانه و ایتا...</p>
      </div>
    );
  }

  // Render course details (Player/Landing) if selected in student mode
  if (selectedCourse && (role === 'student' || role === null)) {
    return (
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200">
        <CourseDetailPage
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onEnroll={(c) => setEnrolledCourses((prev) => [...prev, String(c.id)])}
          isEnrolled={enrolledCourses.includes(String(selectedCourse.id))}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200 font-sans" dir="rtl">
      
      {/* 1. STUDENT PANEL (پنل دانش‌پژوه) */}
      {(role === 'student' || role === null) && (
        <>
          {activeTab === 'home' && <StudentHome onSelectCourse={handleSelectCourse} user={user as any} />}
          {activeTab === 'search' && <SearchPage onSelectCourse={handleSelectCourse} />}
          {activeTab === 'my_courses' && <MyCoursesPage onSelectCourse={handleSelectCourse} />}
          {activeTab === 'support' && <TicketChat onBack={() => setActiveTab('home')} isAdmin={false} />}
          {activeTab === 'profile' && <StudentProfile user={user as any} onSelectCourse={handleSelectCourse} />}
        </>
      )}

      {/* 2. TEACHER PANEL (پنل استاد) */}
      {role === 'teacher' && (
        <>
          {activeTab === 'teacher_courses' && (
            managerSelectedCourseId ? (
              <CourseDashboard courseId={managerSelectedCourseId} onBack={() => setManagerSelectedCourseId(null)} />
            ) : (
              <ManagerCourses onCourseSelect={(id) => setManagerSelectedCourseId(id)} onCreateCourse={() => setActiveTab('create_course')} />
            )
          )}
          {activeTab === 'create_course' && <CreateCoursePage onBack={() => setActiveTab('teacher_courses')} />}
          {activeTab === 'exams' && (
            <div className="min-h-screen bg-slate-50 pb-28">
              <ExamManagerModal
                courseId={1}
                courseTitle="دوره جامع هوش مصنوعی و پایتون"
                onClose={() => setActiveTab('teacher_courses')}
              />
            </div>
          )}
          {activeTab === 'profile' && <StudentProfile user={user as any} onSelectCourse={handleSelectCourse} />}
        </>
      )}

      {/* 3. COURSE MANAGER PANEL (پنل مسئول دوره) */}
      {role === 'course_manager' && (
        <>
          {activeTab === 'courses' && (
            managerSelectedCourseId ? (
              <CourseDashboard courseId={managerSelectedCourseId} onBack={() => setManagerSelectedCourseId(null)} />
            ) : (
              <ManagerCourses onCourseSelect={(id) => setManagerSelectedCourseId(id)} onCreateCourse={() => setActiveTab('create_course')} />
            )
          )}
          {activeTab === 'attendance' && (
            <div className="min-h-screen bg-slate-50 pb-28">
              <AttendanceManagerModal
                courseId={1}
                courseTitle="دوره جامع هوش مصنوعی و پایتون"
                onClose={() => setActiveTab('courses')}
              />
            </div>
          )}
          {activeTab === 'support' && <TicketChat onBack={() => setActiveTab('courses')} isAdmin={true} />}
          {activeTab === 'profile' && <StudentProfile user={user as any} onSelectCourse={handleSelectCourse} />}
        </>
      )}

      {/* 4. EXECUTIVE MANAGER PANEL (پنل مدیر کل) */}
      {role === 'executive_manager' && (
        <>
          {activeTab === 'courses' && (
            managerSelectedCourseId ? (
              <CourseDashboard courseId={managerSelectedCourseId} onBack={() => setManagerSelectedCourseId(null)} />
            ) : (
              <ManagerCourses onCourseSelect={(id) => setManagerSelectedCourseId(id)} onCreateCourse={() => setActiveTab('create_course')} />
            )
          )}
          {activeTab === 'users' && <ManagerUsersPage />}
          {activeTab === 'support' && <TicketChat onBack={() => setActiveTab('courses')} isAdmin={true} />}
          {activeTab === 'create_course' && <CreateCoursePage onBack={() => setActiveTab('courses')} />}
          {activeTab === 'financial' && <ManagerFinance />}
          {activeTab === 'profile' && <StudentProfile user={user as any} onSelectCourse={handleSelectCourse} />}
        </>
      )}

      {/* Exit Confirmation Dialog when at root dashboard */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut size={28} />
            </div>
            <div className="text-center">
              <h3 className="font-black text-base text-slate-800">خروج از برنامه ایتا</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                آیا می‌خواهید از برنامک مدرسه مجازی خارج شوید؟
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                انصراف و ماندن
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition"
              >
                بله، خروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <BottomNav role={role as any} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
