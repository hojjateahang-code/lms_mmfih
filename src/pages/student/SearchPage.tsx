import React, { useState } from 'react';
import { Search, Filter, BookOpen, User, Star } from 'lucide-react';
import { Course } from '../../types';

interface SearchPageProps {
  onSelectCourse: (course: Course) => void;
}

export default function SearchPage({ onSelectCourse }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('همه');

  const categories = ['همه', 'علوم حوزوی', 'انس با قرآن', 'نهج‌البلاغه', 'سبک زندگی', 'اعتقادی', 'فقه و اصول'];

  const sampleCourses: Course[] = [
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
      duration: '۲۴ ساعت',
      level: 'متوسط تا پیشرفته',
      description: 'آموزش مفاهیم و تفسیر ترتیبی آیات منتخب قرآن کریم.',
      banner_url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'c2',
      title: 'مقدمات منطق و فلسفه اسلامی (سطح ۱)',
      instructor: 'حجت‌الاسلام سید محمد حسینی',
      category_id: 1,
      category_name: 'علوم حوزوی',
      price: 280000,
      rating: 4.8,
      students_count: 890,
      episodes_count: 24,
      duration: '۱۸ ساعت',
      level: 'مقدماتی',
      description: 'بررسی اصول تفکر صحیح و مدخل قواعد منطق مظفر.',
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
      rating: 5.0,
      students_count: 2300,
      episodes_count: 15,
      duration: '۱۰ ساعت',
      level: 'عمومی',
      description: 'واکاوی کلمات قصار حضرت امیرالمؤمنین (ع) در مدیریت زندگی.',
      banner_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const filtered = sampleCourses.filter(c => {
    const matchesCat = selectedCat === 'همه' || c.category_name === selectedCat;
    const matchesQuery = !query || c.title.includes(query) || c.instructor.includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="mb-4">
        <h1 className="font-black text-indigo-950 text-lg mb-1">جستجو در دروس و دوره‌ها</h1>
        <p className="text-xs text-slate-500">یافتن سریع محتوای حوزوی و معارفی</p>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="عنوان دوره، نام استاد یا کلیدواژه..."
          className="w-full bg-white text-sm text-slate-800 rounded-2xl py-3 pr-10 pl-4 border border-slate-200 shadow-sm outline-none focus:border-indigo-500"
        />
        <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCat === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(course => (
          <div
            key={course.id}
            onClick={() => onSelectCourse(course)}
            className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm flex gap-3 items-center cursor-pointer hover:shadow-md transition-all"
          >
            <img src={course.banner_url} alt={course.title} className="w-20 h-20 rounded-2xl object-cover" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-indigo-600 font-bold">{course.category_name}</span>
              <h3 className="font-bold text-slate-800 text-xs truncate mb-1">{course.title}</h3>
              <p className="text-[10px] text-slate-500 mb-2">{course.instructor}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1">
                  <Star size={12} className="fill-amber-400" /> {course.rating}
                </span>
                <span className="text-indigo-600 font-black">
                  {course.is_free ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
