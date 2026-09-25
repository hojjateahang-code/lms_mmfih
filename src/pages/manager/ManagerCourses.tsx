// src/pages/manager/ManagerCourses.tsx
import React, { useEffect, useState } from 'react';
import { Plus, MoreVertical, Users, Edit3, Trash2, BookOpen, Clock, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { getManagerCourses, deleteCourse, CourseData } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';

interface ManagerCoursesProps {
  onCourseSelect: (id: number) => void;
  onCreateCourse?: () => void;
}

export default function ManagerCourses({ onCourseSelect, onCreateCourse }: ManagerCoursesProps) {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      setLoading(true);
      const res = await getManagerCourses(user.id);
      if (res.success && res.data) {
        setCourses(res.data);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [user]);

  const handleDeleteCourse = async (id: number) => {
    if (confirm('آیا از حذف این دوره اطمینان دارید؟')) {
      const res = await deleteCourse(id);
      if (res.success) {
        setCourses(courses.filter((c) => c.id !== id));
      } else {
        alert('خطا در حذف دوره');
      }
    }
    setActiveMenu(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Header & Create Button */}
      <div className="bg-white px-4 py-5 rounded-b-3xl shadow-sm mb-5 flex justify-between items-center sticky top-0 z-20 border-b border-slate-100">
        <div>
          <h1 className="font-black text-slate-800 text-base">مدیریت دوره‌ها</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">لیست تمامی دوره‌های شما</p>
        </div>
        <button
          onClick={onCreateCourse}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center shadow-lg shadow-indigo-200 transition-all gap-1"
        >
          <Plus size={16} /> ایجاد دوره
        </button>
      </div>

      {/* Course List */}
      <div className="px-4 space-y-3.5">
        {courses.length === 0 && (
          <div className="text-center text-slate-500 py-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
            شما هنوز هیچ دوره‌ای ایجاد نکرده‌اید.
          </div>
        )}
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-3xl p-3.5 shadow-sm hover:shadow-md border border-slate-100 flex items-center relative transition-all"
          >
            {/* Course Thumbnail */}
            <div
              onClick={() => onCourseSelect(course.id)}
              className={`w-18 h-18 rounded-2xl flex-shrink-0 cursor-pointer bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner overflow-hidden`}
            >
              {course.cover_url ? (
                <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={26} />
              )}
            </div>

            {/* Course Info */}
            <div onClick={() => onCourseSelect(course.id)} className="mr-3 flex-grow cursor-pointer pr-1">
              <h3 className="font-bold text-slate-800 text-xs mb-1 leading-snug line-clamp-1">{course.title}</h3>
              <div className="flex items-center text-[10px] text-slate-500 gap-2 mb-1.5">
                <span className="flex items-center gap-1">
                  <Users size={11} className="text-indigo-500" /> -- دانش‌پژوه
                </span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-lg border ${
                  course.is_published ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                }`}
              >
                {course.is_published ? 'منتشر شده' : 'پیش‌نویس'}
              </span>
            </div>

            {/* 3-Dots Menu Button */}
            <button
              onClick={() => setActiveMenu(activeMenu === course.id ? null : course.id)}
              className="p-2 text-slate-400 hover:text-slate-700 active:bg-slate-100 rounded-xl transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {/* Context Menu (Dropdown) */}
            {activeMenu === course.id && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                <div className="absolute top-12 left-3 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setActiveMenu(null);
                      onCourseSelect(course.id);
                    }}
                    className="w-full px-3.5 py-2 text-right text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit3 size={14} className="text-amber-500" /> مدیریت محتوا
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="w-full px-3.5 py-2 text-right text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> حذف دوره
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
