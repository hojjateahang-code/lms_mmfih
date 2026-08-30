import React, { useEffect, useState } from 'react';
import { initAndAutoLogin } from './lib/eitaaAuth';
import { createLocalSupabaseClient } from './lib/mockSupabase';
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
import { UserProfile, Course } from './types';
import { Shield, Sparkles, UserCheck, Smartphone } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'executive_manager'>('student');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [managerSelectedCourseId, setManagerSelectedCourseId] = useState<number | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(['c1']);
  const [notification, setNotification] = useState<string | null>(null);
  const [supabaseClient] = useState(() => createLocalSupabaseClient());

  // 1. Invisible Eitaa Auto-Login initialization
  useEffect(() => {
    initAndAutoLogin(supabaseClient, (user: UserProfile, role: string) => {
      setCurrentUser(user);
      setUserRole(role === 'executive_manager' ? 'executive_manager' : 'student');
      showNotification(`ورود خودکار ایتا موفق: خوش آمدید ${user.full_name || 'کاربر گرامی'}`);
    });
  }, [supabaseClient]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleEnrollCourse = (course: Course) => {
    if (!enrolledCourses.includes(course.id)) {
      setEnrolledCourses([...enrolledCourses, course.id]);
    }
    showNotification(`ثبت‌نام در دوره "${course.title}" با موفقیت انجام شد.`);
  };

  const handleSwitchRole = (newRole: 'student' | 'executive_manager') => {
    setUserRole(newRole);
    if (newRole === 'executive_manager') {
      setActiveTab('courses');
    } else {
      setActiveTab('home');
    }
    showNotification(`نقش کاربر به "${newRole === 'executive_manager' ? 'مدیر اجرایی' : 'دانش‌پژوه'}" تغییر یافت.`);
  };

  const handleSimulateNewUser = () => {
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();
    const newUser: UserProfile = {
      id: String(Date.now()),
      eitaa_id: randomId,
      username: `student_${randomId}`,
      full_name: `دانش‌پژوه جدید ایتا (${randomId})`,
      role: 'student',
      wallet_balance: 0,
    };
    setCurrentUser(newUser);
    setUserRole('student');
    setActiveTab('home');
    showNotification(`پروفایل خام جدید برای آیدی ایتا ${randomId} ایجاد و وارد سیستم شد!`);
  };

  // Render course details if a course is selected in student mode
  if (selectedCourse) {
    return (
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200">
        <CourseDetailPage
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onEnroll={handleEnrollCourse}
          isEnrolled={enrolledCourses.includes(selectedCourse.id)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden border-x border-slate-200">
      {/* Top Simulated Eitaa App Header bar */}
      <div className="bg-slate-900 text-white px-3 py-1.5 flex justify-between items-center text-[10px] font-bold border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-amber-300">
          <Smartphone size={12} />
          <span>مینی‌اپ ایتا (Eitaa WebApp)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwitchRole(userRole === 'student' ? 'executive_manager' : 'student')}
            className="bg-indigo-600/80 hover:bg-indigo-600 px-2 py-0.5 rounded-full text-[9px] text-white flex items-center gap-1"
          >
            <UserCheck size={10} />
            نقش: {userRole === 'executive_manager' ? 'مدیر اجرایی' : 'دانش‌پژوه'}
          </button>
        </div>
      </div>

      {/* Auto-Login Notification Toast */}
      {notification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-indigo-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-indigo-500/40 text-xs font-bold flex items-center gap-2 max-w-[90%] text-center animate-bounce">
          <Sparkles size={16} className="text-amber-300 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Tab Views depending on role */}
      {userRole === 'student' ? (
        <>
          {activeTab === 'home' && (
            <StudentHome onSelectCourse={handleSelectCourse} user={currentUser} />
          )}
          {activeTab === 'search' && (
            <SearchPage onSelectCourse={handleSelectCourse} />
          )}
          {activeTab === 'my_courses' && (
            <MyCoursesPage onSelectCourse={handleSelectCourse} />
          )}
          {activeTab === 'profile' && (
            <StudentProfile
              user={currentUser}
              onSwitchRole={handleSwitchRole}
              onSimulateNewUser={handleSimulateNewUser}
            />
          )}
        </>
      ) : (
        <>
          {activeTab === 'courses' && (
            managerSelectedCourseId ? (
              <CourseDashboard
                courseId={managerSelectedCourseId}
                onBack={() => setManagerSelectedCourseId(null)}
              />
            ) : (
              <ManagerCourses
                onCourseSelect={(id) => setManagerSelectedCourseId(id)}
                onCreateCourse={() => setActiveTab('create_course')}
              />
            )
          )}
          {activeTab === 'users' && <ManagerUsersPage />}
          {activeTab === 'create_course' && (
            <CreateCoursePage onBack={() => setActiveTab('courses')} />
          )}
          {activeTab === 'financial' && <ManagerFinance />}
          {activeTab === 'profile' && (
            <StudentProfile
              user={currentUser}
              onSwitchRole={handleSwitchRole}
              onSimulateNewUser={handleSimulateNewUser}
            />
          )}
        </>
      )}

      {/* Glassmorphism Bottom Nav Bar */}
      <BottomNav role={userRole} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
