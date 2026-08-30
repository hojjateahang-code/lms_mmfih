import React, { useState } from 'react';
import { ChevronRight, Star, Clock, User, BookOpen, CheckCircle, Play, Shield, Share2, Award } from 'lucide-react';
import { Course } from '../../types';

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
  onEnroll: (course: Course) => void;
  isEnrolled?: boolean;
}

export default function CourseDetailPage({ course, onBack, onEnroll, isEnrolled }: CourseDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'episodes' | 'instructor'>('about');
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

  const episodes = Array.from({ length: course.episodes_count || 12 }, (_, i) => ({
    number: i + 1,
    title: `جلسه ${i + 1}: ${i === 0 ? 'مقدمه و تعاریف پایه' : i === 1 ? 'مبانی و سرآغاز بحث' : i === 2 ? 'اصول کلی و ادله اولیه' : `درسنامه تخصصی بخش ${i + 1}`}`,
    duration: '۴۵ دقیقه',
    isFree: i < 2 || course.is_free,
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="relative bg-indigo-950 text-white pb-6 pt-4 px-4 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white"
          >
            <ChevronRight size={20} />
          </button>
          <span className="text-xs font-bold text-indigo-200">{course.category_name}</span>
          <button className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
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
          <div className="flex items-center gap-1">
            <Clock size={14} /> {course.duration}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'about' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            درباره دوره
          </button>
          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'episodes' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            فهرست جلسات ({course.episodes_count})
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              activeTab === 'instructor' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            استاد دوره
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-700">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">توضیحات جامع دوره</h3>
              <p>{course.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">سطح آموزشی:</span>
                  <span className="font-bold text-slate-800">{course.level}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">تعداد شرکت‌کنندگان:</span>
                  <span className="font-bold text-slate-800">{course.students_count.toLocaleString('fa-IR')} نفر</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-3xl border border-amber-200 text-amber-950 flex items-start gap-3">
              <Award size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">گواهی‌پایان دوره معتبر</h4>
                <p className="text-[11px] text-amber-800 mt-1">
                  پس از مشاهده جلسات و شرکت در آزمون نهایی، گواهی رسمی از سوی مدرسه عالی فقه و اصول صادر می‌گردد.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="space-y-2.5">
            {episodes.map((ep) => (
              <div
                key={ep.number}
                onClick={() => setSelectedEpisode(ep.number)}
                className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                  selectedEpisode === ep.number
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    ep.isFree ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ep.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 mb-0.5">{ep.title}</h4>
                    <span className="text-[10px] text-slate-400">{ep.duration}</span>
                  </div>
                </div>

                <div>
                  {ep.isFree || isEnrolled ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Play size={10} className="fill-emerald-600" /> مشاهده
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                      قفل
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'instructor' && (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center">
                {course.instructor.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{course.instructor}</h3>
                <p className="text-[11px] text-slate-500">مدرس برجسته مدرسه عالی فقه و اصول</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              دارای سابقه تدریس بیش از ۱۵ سال در حوزه علمیه قم، نویسنده کتب متعدد تخصصی در زمینه فقه، اصول و تفسیر قرآن کریم.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl flex justify-between items-center z-50">
        <div>
          <span className="text-[10px] text-slate-400 block">شهریه دوره:</span>
          {course.is_free ? (
            <span className="text-emerald-600 font-black text-base">رایگان</span>
          ) : (
            <span className="text-indigo-950 font-black text-base">
              {course.price.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </span>
          )}
        </div>

        {isEnrolled ? (
          <button
            onClick={() => setActiveTab('episodes')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-2"
          >
            <CheckCircle size={16} /> ورود به جلسات
          </button>
        ) : (
          <button
            onClick={() => onEnroll(course)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95 transition-transform"
          >
            ثبت‌نام مستقیم با کیف‌پول ایتا
          </button>
        )}
      </div>
    </div>
  );
}
