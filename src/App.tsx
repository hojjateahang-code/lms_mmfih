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
import { Course } from './types';
import { Loader2 } from 'lucide-react';
import { getUserEnrollments } from './services/courseService';

function AppRouter() {
  const { user, role, loading } = useAuth();
  
  // Local state for tabs and navigation
  const [activeTab, setActiveTab] = useState<string>(
    role === 'executive_manager' ? 'courses' : (role === 'teacher' ? 'teacher_courses' : 'home')
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [managerSelectedCourseId, setManagerSelectedCourseId] = useState<number | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  // Common Notification Logic
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
      if (role === 'executive_manager' && activeTab === 'home') setActiveTab('courses');
      if (role === 'teacher' && activeTab === 'home') setActiveTab('teacher_courses');
      if (role === 'student' && (activeTab === 'courses' || activeTab === 'teacher_courses')) setActiveTab('home');
    }
  }, [role, loading, activeTab]);

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
      {/* Main Tab Views */}
      {(role === 'student' || role === null) && (
        <>
          {activeTab === 'home' && <StudentHome onSelectCourse={handleSelectCourse} user={user as any} />}
          {activeTab === 'search' && <SearchPage onSelectCourse={handleSelectCourse} />}
          {activeTab === 'my_courses' && <MyCoursesPage onSelectCourse={handleSelectCourse} />}
          {activeTab === 'profile' && <StudentProfile user={user as any}  />}
        </>
      )}

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
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-black text-slate-800 mb-2">مدیریت آزمون‌ها</h2>
              <p className="text-slate-500 text-sm">این بخش به زودی برای اساتید فعال خواهد شد.</p>
            </div>
          )}
          {activeTab === 'profile' && <StudentProfile user={user as any}  />}
        </>
      )}

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
          {activeTab === 'create_course' && <CreateCoursePage onBack={() => setActiveTab('courses')} />}
          {activeTab === 'financial' && <ManagerFinance />}
          {activeTab === 'profile' && <StudentProfile user={user as any}  />}
        </>
      )}

      {/* Glassmorphism Bottom Nav Bar */}
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
