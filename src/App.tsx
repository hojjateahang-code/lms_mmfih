import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
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
import { Smartphone, Loader2 } from 'lucide-react';

function AppRouter() {
  const { user, role, loading } = useAuth();
  
  // Local state for tabs and navigation
  const [activeTab, setActiveTab] = useState<string>(
    role === 'executive_manager' ? 'courses' : (role === 'teacher' ? 'teacher_courses' : 'home')
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [managerSelectedCourseId, setManagerSelectedCourseId] = useState<number | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(['c1']); // Mock enrollment for now

  // Common Notification Logic (can be moved to a context later)
  const handleSelectCourse = (course: Course) => setSelectedCourse(course);

  React.useEffect(() => {
    if (!loading) {
      if (role === 'executive_manager' && activeTab === 'home') setActiveTab('courses');
      if (role === 'teacher' && activeTab === 'home') setActiveTab('teacher_courses');
      if (role === 'student' && (activeTab === 'courses' || activeTab === 'teacher_courses')) setActiveTab('home');
    }
  }, [role, loading, activeTab]);

  if (window.location.pathname.startsWith('/payment/')) return <PaymentVerify />;

  // While checking Eitaa initData or Supabase Session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 text-sm font-bold animate-pulse">در حال ارتباط با سرور ایتا...</p>
      </div>
    );
  }

  // Magic switch role function for testing
  const handleSwitchRole = async () => {
    let newRole = 'student';
    if (role === 'student' || role === null) newRole = 'teacher';
    else if (role === 'teacher') newRole = 'executive_manager';
    else if (role === 'executive_manager') newRole = 'student';
    
    if (user) {
      // Attempt to update Supabase, but don't worry if it fails due to RLS
      await supabase.from('profiles').upsert({ id: user.id, role: newRole });
    }
    
    // Force role locally for testing
    localStorage.setItem('test_role', newRole);
    window.location.reload();
  };

  // Render course details (Player/Landing) if selected in student mode
  if (selectedCourse && (role === 'student' || role === null)) {
    return (
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200">
        <CourseDetailPage
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onEnroll={(c) => setEnrolledCourses([...enrolledCourses, c.id])}
          isEnrolled={enrolledCourses.includes(selectedCourse.id)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200 font-sans" dir="rtl">
      {/* Top Eitaa Indicator Bar (For Dev / Debug context) */}
      <div className="bg-slate-900 text-white px-3 py-1.5 flex justify-between items-center text-[10px] font-bold border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-amber-300">
          <Smartphone size={12} />
          <span>مینی‌اپ متصل به Supabase</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-indigo-600/80 px-2 py-0.5 rounded-full text-[9px] text-white">
            نقش: {role === 'executive_manager' ? 'مدیریت' : (role === 'teacher' ? 'استاد' : 'دانش‌پژوه')}
          </span>
        </div>
      </div>

      {/* Main Tab Views depending on actual role from Supabase */}
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
