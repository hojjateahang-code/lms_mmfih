import React, { useEffect, useState } from 'react';
import { BookOpen, PlayCircle, Clock, CheckCircle, Award, Loader2 } from 'lucide-react';
import { Course } from '../../types';
import { getUserEnrollments } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';

interface MyCoursesPageProps {
  onSelectCourse: (course: Course) => void;
}

export default function MyCoursesPage({ onSelectCourse }: MyCoursesPageProps) {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await getUserEnrollments(user.id);
      if (res.success && res.data) {
        setEnrollments(res.data);
      }
      setLoading(false);
    };
    fetchEnrollments();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <p className="text-slate-500 font-bold">برای مشاهده دوره‌ها باید وارد شوید.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="mb-5">
        <h1 className="font-black text-indigo-950 text-lg mb-1">دوره‌های ثبت‌نام‌شده من</h1>
        <p className="text-xs text-slate-500">ادامه یادگیری و مشاهده ویدیوهای آموزشی</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-sm">
          <BookOpen size={20} className="mb-2 text-indigo-200" />
          <div className="text-xl font-black">{enrollments.length} دوره</div>
          <div className="text-[11px] text-indigo-100 font-medium">دوره‌های فعال</div>
        </div>
        <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-sm">
          <Award size={20} className="mb-2 text-emerald-200" />
          <div className="text-xl font-black">۰ گواهی</div>
          <div className="text-[11px] text-emerald-100 font-medium">پایان دوره</div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-sm">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrol) => {
            const c = enrol.course;
            if (!c) return null;
            
            // map for onSelectCourse
            const mappedCourse: Course = {
              id: c.id.toString(),
              title: c.title,
              instructor: c.instructor?.full_name || 'استاد محترم',
              category_id: 1, 
              category_name: c.category || 'عمومی',
              price: c.price,
              original_price: c.price,
              is_new: false,
              rating: 5.0,
              students_count: 0,
              episodes_count: 0,
              duration: 'نامشخص',
              level: 'عمومی',
              description: c.description,
              banner_url: c.cover_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop',
              is_free: c.price === 0
            };

            const progress = 0; // Mock until full progress calculation
            
            return (
              <div
                key={enrol.id}
                onClick={() => onSelectCourse(mappedCourse)}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex gap-3 mb-3">
                  <img src={mappedCourse.banner_url} alt={mappedCourse.title} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-indigo-600 font-bold">{mappedCourse.category_name}</span>
                    <h3 className="font-bold text-slate-800 text-xs mb-1 truncate">{mappedCourse.title}</h3>
                    <div className="text-[10px] text-slate-500">{mappedCourse.instructor}</div>
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
                    ثبت‌نام: {new Date(enrol.enrolled_at).toLocaleDateString('fa-IR')}
                  </span>
                  <button className="text-indigo-600 font-black text-xs flex items-center gap-1">
                    <PlayCircle size={14} /> مشاهده دروس
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
