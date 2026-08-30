// src/pages/student/StudentHome.tsx
import React, { useState } from 'react';
import { Search, ChevronLeft, User, Star, BookOpen, Clock, Flame, Award } from 'lucide-react';
import { Course } from '../../types';

interface StudentHomeProps {
  onSelectCourse?: (course: Course) => void;
  user?: any;
}

export default function StudentHome({ onSelectCourse, user }: StudentHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // دیتای تستی برای دسته‌بندی‌ها
  const categories = [
    { id: 1, title: 'علوم حوزوی', icon: '🕌', bgColor: 'bg-emerald-100 text-emerald-800' },
    { id: 2, title: 'انس با قرآن', icon: '📖', bgColor: 'bg-amber-100 text-amber-800' },
    { id: 3, title: 'نهج‌البلاغه', icon: '📜', bgColor: 'bg-blue-100 text-blue-800' },
    { id: 4, title: 'سبک زندگی', icon: '🌱', bgColor: 'bg-rose-100 text-rose-800' },
    { id: 5, title: 'اعتقادی', icon: '✨', bgColor: 'bg-purple-100 text-purple-800' },
    { id: 6, title: 'فقه و اصول', icon: '⚖️', bgColor: 'bg-teal-100 text-teal-800' },
  ];

  // دیتای تستی دوره‌ها
  const coursesList: Course[] = [
    {
      id: 'c1',
      title: 'دوره تخصصی تفسیر روان قرآن کریم',
      instructor: 'استاد مکارم شیرازی',
      category_id: 2,
      category_name: 'انس با قرآن',
      price: 350000,
      original_price: 500000,
      is_new: true,
      rating: 4.9,
      students_count: 1420,
      episodes_count: 36,
      duration: '۲۴ ساعت',
      level: 'متوسط تا پیشرفته',
      description: 'آموزش مفاهیم و تفسیر ترتیبی آیات منتخب قرآن کریم با رویکرد تربیتی و کاربردی برای زندگی امروز.',
      banner_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'c2',
      title: 'مقدمات منطق و فلسفه اسلامی (سطح ۱)',
      instructor: 'حجت‌الاسلام سید محمد حسینی',
      category_id: 1,
      category_name: 'علوم حوزوی',
      price: 280000,
      original_price: 350000,
      is_new: true,
      rating: 4.8,
      students_count: 890,
      episodes_count: 24,
      duration: '۱۸ ساعت',
      level: 'مقدماتی',
      description: 'بررسی اصول تفکر صحیح، مغالطات و مدخل قواعد منطق مظفر ویژه طلاب و علاقه‌مندان حوزه.',
      banner_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'c3',
      title: 'شرح حکمت‌های منتخب نهج‌البلاغه',
      instructor: 'دکتر محسن عباسی',
      category_id: 3,
      category_name: 'نهج‌البلاغه',
      price: 0,
      is_free: true,
      is_new: false,
      rating: 5.0,
      students_count: 2300,
      episodes_count: 15,
      duration: '۱۰ ساعت',
      level: 'عمومی',
      description: 'واکاوی عمیق کلمات قصار حضرت امیرالمؤمنین علی (ع) در مدیریت زندگی شخصی و اجتماعی.',
      banner_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'c4',
      title: 'اصول فقه کاربردی - الحلقه اولی',
      instructor: 'استاد حیدری',
      category_id: 6,
      category_name: 'فقه و اصول',
      price: 420000,
      original_price: 600000,
      is_new: true,
      rating: 4.7,
      students_count: 610,
      episodes_count: 40,
      duration: '۳۰ ساعت',
      level: 'پیشرفته',
      description: 'تدریس مبانی استنباط احکام شرعی و مباحث الفاظ و ادله عقلی بر اساس مبانی شهید صدر.',
      banner_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'c5',
      title: 'مهارت‌های تربیت فرزند در کلام معصومین',
      instructor: 'دکتر استاد رضایی',
      category_id: 4,
      category_name: 'سبک زندگی',
      price: 190000,
      original_price: 250000,
      is_new: false,
      rating: 4.9,
      students_count: 1750,
      episodes_count: 18,
      duration: '۱۲ ساعت',
      level: 'عمومی',
      description: 'راهکارهای علمی و روایی برای تربیت نسل صالح در عصر تکنولوژی و شبکه‌های اجتماعی.',
      banner_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const filteredCourses = coursesList.filter(c => {
    const matchesCategory = selectedCategory === null || c.category_id === selectedCategory;
    const matchesSearch = !searchQuery || c.title.includes(searchQuery) || c.instructor.includes(searchQuery) || c.category_name.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans dir-rtl" dir="rtl">
      {/* Header & Search */}
      <div className="bg-white px-4 pt-5 pb-5 rounded-b-3xl shadow-sm mb-4 border-b border-slate-100 sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-indigo-200">
              ح
            </div>
            <div>
              <h1 className="font-black text-indigo-950 text-base leading-snug">مدرسه مجازی امام حسین (ع)</h1>
              <p className="text-[10px] text-slate-500 font-semibold">تحت اشراف مدرسه عالی فقه و اصول</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700">
              <span>{user.full_name || 'دانش‌پژوه'}</span>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در دوره‌ها، اساتید و دروس..."
            className="w-full bg-slate-100 text-sm text-slate-800 placeholder-slate-400 rounded-2xl py-3 pr-10 pl-4 outline-none border border-transparent focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
          />
          <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="px-4 space-y-7">
        {/* Hero Banner */}
        <div className="w-full h-44 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-100 text-white p-5 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-200 mb-2 border border-white/20">
              <Flame size={12} className="text-amber-300 animate-pulse" /> ثبت‌نام ترم جدید علوم حوزوی
            </div>
            <h2 className="font-black text-xl leading-snug drop-shadow-sm">دوره جامع علوم حوزوی و معارف اهل‌بیت (ع)</h2>
            <p className="text-xs text-indigo-100 font-medium mt-1">با اعطای مدرک معتبر از مدرسه عالی فقه و اصول</p>
          </div>

          <div className="relative z-10 flex justify-between items-center mt-2">
            <button
              onClick={() => {
                const target = coursesList[0];
                if (onSelectCourse) onSelectCourse(target);
              }}
              className="bg-white text-indigo-950 font-black text-xs px-4 py-2 rounded-2xl shadow-md hover:bg-amber-300 hover:text-indigo-950 transition-all flex items-center gap-1 active:scale-95"
            >
              مشاهده جزئیات <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] text-indigo-200 font-medium bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-xl">
              ثبت نام آسان با ایتا
            </span>
          </div>
        </div>

        {/* Dynamic Categories */}
        <section>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span>برترین دسته‌بندی‌ها</span>
            </h2>
            {selectedCategory !== null && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                نمایش همه
              </button>
            )}
          </div>
          <div className="flex overflow-x-auto hide-scrollbar space-x-3 space-x-reverse pb-2 pt-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center flex-shrink-0 w-20 transition-transform active:scale-95 ${
                selectedCategory === null ? 'scale-105' : ''
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-1.5 transition-all ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}>
                🌐
              </div>
              <span className={`text-[11px] font-bold text-center ${selectedCategory === null ? 'text-indigo-600' : 'text-slate-600'}`}>
                همه
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`flex flex-col items-center flex-shrink-0 w-20 transition-transform active:scale-95 ${
                    isSelected ? 'scale-105' : ''
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-1.5 transition-all ${cat.bgColor} ${
                    isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 font-bold shadow-md' : 'border border-slate-100'
                  }`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[11px] font-bold text-center ${isSelected ? 'text-indigo-600 font-black' : 'text-slate-600'}`}>
                    {cat.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Horizontal Course List 1 - Newest Courses */}
        <section>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <SparklesIcon />
              <span>جدیدترین دوره‌ها</span>
            </h2>
            <button className="text-xs text-indigo-600 flex items-center font-bold hover:text-indigo-800">
              همه <ChevronLeft size={14} />
            </button>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar space-x-4 space-x-reverse pb-3 pt-1">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse?.(course)}
                className="flex-shrink-0 w-52 bg-white rounded-3xl p-3 shadow-sm hover:shadow-md border border-slate-100 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="w-full h-32 bg-slate-200 rounded-2xl mb-3 relative overflow-hidden">
                  <img
                    src={course.banner_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.is_new && (
                    <div className="absolute top-2.5 right-2.5 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                      جدید
                    </div>
                  )}
                  {course.is_free && (
                    <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                      رایگان
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-indigo-600 font-bold mb-1">
                  {course.category_name}
                </div>
                <h3 className="font-bold text-slate-800 text-xs mb-2 line-clamp-2 leading-relaxed h-8">
                  {course.title}
                </h3>

                <div className="flex items-center text-[10px] text-slate-500 mb-3">
                  <User size={12} className="ml-1 text-indigo-500" />
                  <span className="truncate">{course.instructor}</span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                    <Star size={12} className="fill-amber-400 stroke-amber-400" />
                    <span>{course.rating}</span>
                  </div>
                  <div>
                    {course.is_free ? (
                      <span className="text-emerald-600 font-black text-xs">رایگان</span>
                    ) : (
                      <span className="text-indigo-600 font-black text-xs">
                        {course.price.toLocaleString('fa-IR')} <span className="text-[9px] font-normal text-slate-500">تومان</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Popular Section */}
        <section>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <span>دوره‌های محبوب حوزه و قرآن</span>
            </h2>
          </div>

          <div className="space-y-3">
            {coursesList.slice(0, 3).map((course) => (
              <div
                key={'popular-' + course.id}
                onClick={() => onSelectCourse?.(course)}
                className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-3.5 items-center cursor-pointer group"
              >
                <img
                  src={course.banner_url}
                  alt={course.title}
                  className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="text-indigo-600 font-bold">{course.category_name}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-xs truncate mb-1.5">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate mb-2">{course.instructor}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {course.students_count.toLocaleString('fa-IR')} دانش‌پژوه
                    </span>
                    <span className="text-indigo-600 font-black text-xs">
                      {course.is_free ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );
}
