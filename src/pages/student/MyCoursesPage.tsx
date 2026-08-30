import React from 'react';
import { BookOpen, PlayCircle, Clock, CheckCircle, Award } from 'lucide-react';
import { Course } from '../../types';

interface MyCoursesPageProps {
  onSelectCourse: (course: Course) => void;
}

export default function MyCoursesPage({ onSelectCourse }: MyCoursesPageProps) {
  const enrolledCourses = [
    {
      id: 'c1',
      title: 'دوره تخصصی تفسیر روان قرآن کریم',
      instructor: 'استاد مکارم شیرازی',
      category_id: 2,
      category_name: 'انس با قرآن',
      price: 350000,
      rating: 4.9,
      students_count: 1420,
      episodes_count: 36,
      completed_episodes: 14,
      duration: '۲۴ ساعت',
      level: 'متوسط',
      description: 'آموزش مفاهیم و تفسیر ترتیبی آیات منتخب قرآن کریم.',
      banner_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'c3',
      title: 'شرح حکمت‌های منتخب نهج‌البلاغه',
      instructor: 'دکتر محسن عباسی',
      category_id: 3,
      category_name: 'نهج‌البلاغه',
      price: 0,
      is_free: true,
      rating: 5.0,
      students_count: 2300,
      episodes_count: 15,
      completed_episodes: 15,
      duration: '۱۰ ساعت',
      level: 'عمومی',
      description: 'واکاوی کلمات قصار حضرت امیرالمؤمنین (ع) در مدیریت زندگی.',
      banner_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="mb-5">
        <h1 className="font-black text-indigo-950 text-lg mb-1">دوره‌های ثبت‌نام‌شده من</h1>
        <p className="text-xs text-slate-500">ادامه یادگیری و مشاهده ویدیوهای آموزشی</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-sm">
          <BookOpen size={20} className="mb-2 text-indigo-200" />
          <div className="text-xl font-black">۲ دوره</div>
          <div className="text-[11px] text-indigo-100 font-medium">دوره‌های فعال</div>
        </div>
        <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-sm">
          <Award size={20} className="mb-2 text-emerald-200" />
          <div className="text-xl font-black">۱ گواهی</div>
          <div className="text-[11px] text-emerald-100 font-medium">پایان دوره</div>
        </div>
      </div>

      <div className="space-y-4">
        {enrolledCourses.map((c) => {
          const progress = Math.round((c.completed_episodes / c.episodes_count) * 100);
          return (
            <div
              key={c.id}
              onClick={() => onSelectCourse(c)}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex gap-3 mb-3">
                <img src={c.banner_url} alt={c.title} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-indigo-600 font-bold">{c.category_name}</span>
                  <h3 className="font-bold text-slate-800 text-xs mb-1 truncate">{c.title}</h3>
                  <div className="text-[10px] text-slate-500">{c.instructor}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-600">پیشرفت دوره</span>
                  <span className="text-indigo-600">% {progress}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Clock size={12} /> {c.completed_episodes} از {c.episodes_count} جلسه
                </span>
                <button className="text-indigo-600 font-black text-xs flex items-center gap-1">
                  <PlayCircle size={14} /> مشاهده دروس
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
