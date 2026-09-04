// src/components/layout/BottomNav.tsx
import React from 'react';
import { Home, Search, GraduationCap, User, Users, PlusCircle, CreditCard, BookOpen } from 'lucide-react';

interface BottomNavProps {
  role: 'student' | 'executive_manager' | 'teacher';
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ role, activeTab, setActiveTab }: BottomNavProps) {
  // تب‌های دانش‌پژوه
  const studentTabs = [
    { id: 'home', label: 'خانه', icon: Home },
    { id: 'search', label: 'جستجو', icon: Search },
    { id: 'my_courses', label: 'دوره‌های من', icon: GraduationCap },
    { id: 'profile', label: 'پروفایل', icon: User },
  ];

  // تب‌های مدیر اجرایی
  const managerTabs = [
    { id: 'courses', label: 'دوره‌ها', icon: BookOpen },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'create_course', label: 'ایجاد دوره', icon: PlusCircle },
    { id: 'financial', label: 'مالی', icon: CreditCard },
    { id: 'profile', label: 'پروفایل', icon: User },
  ];

  // تب‌های استاد
  const teacherTabs = [
    { id: 'teacher_courses', label: 'کلاس‌های من', icon: BookOpen },
    { id: 'create_course', label: 'ایجاد دوره', icon: PlusCircle },
    { id: 'exams', label: 'آزمون‌ها', icon: Users },
    { id: 'profile', label: 'پروفایل', icon: User },
  ];

  const tabs = (role === 'student' || !role) ? studentTabs : (role === 'teacher' ? teacherTabs : managerTabs);

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 px-2.5 pb-3.5 pt-1 pointer-events-none">
      <div className="pointer-events-auto bg-white/75 backdrop-blur-2xl border border-white/70 shadow-[0_12px_40px_rgba(15,23,42,0.14)] rounded-full flex justify-around items-center p-1 transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 py-1.5 px-2.5 rounded-full ${
                isActive
                  ? 'bg-indigo-100/80 text-indigo-700 font-black shadow-inner border border-indigo-200/50 scale-100'
                  : 'text-slate-600 hover:text-slate-900 font-bold opacity-80 hover:opacity-100'
              }`}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'mb-0.5 text-indigo-600 scale-110' : 'mb-0.5'}`}
              />
              <span className={`text-[9.5px] whitespace-nowrap leading-tight ${isActive ? 'text-indigo-700 font-black' : 'text-slate-600 font-bold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

