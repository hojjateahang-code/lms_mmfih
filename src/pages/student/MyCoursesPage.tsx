import React, { useEffect, useState } from 'react';
import { BookOpen, PlayCircle, Clock, CheckCircle, Award, Loader2, Radio, ShieldAlert, Heart, Trash2 } from 'lucide-react';
import { Course, Certificate } from '../../types';
import { getUserEnrollments, getPublishedCourses } from '../../services/courseService';
import { getUserCertificates, isStudentDropped, getCourseAttendanceSummary, getUserFavorites, toggleCourseFavorite } from '../../services/lmsService';
import { useAuth } from '../../contexts/AuthContext';
import CertificateViewerModal from '../../components/lms/CertificateViewerModal';

interface MyCoursesPageProps {
  onSelectCourse: (course: Course) => void;
}

export default function MyCoursesPage({ onSelectCourse }: MyCoursesPageProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'enrolled' | 'favorites'>('enrolled');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [enrollRes, certs, favIds, allCoursesRes] = await Promise.all([
      getUserEnrollments(user.id),
      getUserCertificates(user.id),
      getUserFavorites(user.id),
      getPublishedCourses()
    ]);

    if (enrollRes.success && enrollRes.data) {
      setEnrollments(enrollRes.data);
    }
    setCertificates(certs);

    if (allCoursesRes.success && allCoursesRes.data) {
      const favs = allCoursesRes.data.filter((c: any) => favIds.includes(Number(c.id)));
      setFavoriteCourses(favs);
    }
    setLoading(false);
  };

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
        <p className="text-xs text-slate-500">کلاس‌های آنلاین، محتوای آفلاین و پیگیری حضور و غیاب</p>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold mb-4">
        <button
          onClick={() => setActiveSubTab('enrolled')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'enrolled' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={14} />
          دوره‌های ثبت‌نامی ({enrollments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'favorites' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-rose-600'
          }`}
        >
          <Heart size={14} className={favoriteCourses.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
          علاقه‌مندی‌های من ({favoriteCourses.length})
        </button>
      </div>

      {activeSubTab === 'favorites' ? (
        favoriteCourses.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <Heart size={36} className="mx-auto text-slate-300" />
            <p className="text-slate-700 font-bold text-sm">هیچ دوره‌ای در لیست علاقه‌مندی‌ها وجود ندارد.</p>
            <p className="text-xs text-slate-400">می‌توانید از صفحه اصلی با لمس علامت قلب، دوره‌ها را ذخیره کنید.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteCourses.map((c) => {
              const mappedCourse: Course = {
                id: String(c.id),
                title: c.title,
                instructor: c.instructor_name || 'استاد محترم',
                category_id: 1,
                category_name: c.category || 'عمومی',
                price: c.price,
                original_price: c.price,
                is_new: false,
                rating: 5.0,
                students_count: c.students_count || 0,
                episodes_count: 0,
                duration: c.duration || '۱۲ ساعت',
                level: 'عمومی',
                description: c.description || '',
                banner_url: c.cover_url || '',
                is_free: c.price === 0,
              };

              return (
                <div
                  key={c.id}
                  className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
                >
                  <div
                    onClick={() => onSelectCourse(mappedCourse)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <img
                      src={c.cover_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'}
                      alt={c.title}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-indigo-600 font-bold">{c.category || 'عمومی'}</span>
                      <h4 className="font-bold text-xs text-slate-800 truncate">{c.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.instructor_name || 'استاد محترم'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        if (!user?.id) return;
                        await toggleCourseFavorite(user.id, Number(c.id));
                        setFavoriteCourses(favoriteCourses.filter((fc) => fc.id !== c.id));
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      title="حذف از علاقه‌مندی‌ها"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => onSelectCourse(mappedCourse)}
                      className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      مشاهده
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : enrollments.length === 0 ? (
        <div className="text-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <p className="text-slate-500 font-bold text-sm">هنوز در دوره‌ای ثبت‌نام نکرده‌اید.</p>
          <p className="text-xs text-slate-400">از صفحه خانه دوره‌های مورد نظر خود را انتخاب و ثبت‌نام نمایید.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrol) => {
            const c = enrol.course;
            if (!c) return null;
            
            const isDropped = isStudentDropped(c.id, user.id);
            const courseCert = certificates.find(cert => Number(cert.course_id) === Number(c.id));

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

            const progress = courseCert ? 100 : 45;
            
            return (
              <div
                key={enrol.id}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm transition-all space-y-3"
              >
                <div 
                  onClick={() => onSelectCourse(mappedCourse)}
                  className="flex gap-3 cursor-pointer"
                >
                  <img src={mappedCourse.banner_url} alt={mappedCourse.title} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                        {mappedCourse.category_name}
                      </span>
                      {isDropped && (
                        <span className="text-[9px] text-rose-700 font-black bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldAlert size={10} />
                          محروم شده (بیش از ۳ غیبت)
                        </span>
                      )}
                      {courseCert && (
                        <span className="text-[9px] text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle size={10} />
                          تکمیل‌شده (گواهی صادر شد)
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs mb-1 truncate">{mappedCourse.title}</h3>
                    <div className="text-[10px] text-slate-500">{mappedCourse.instructor}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-slate-600">پیشرفت دوره و آزمون</span>
                    <span className="text-indigo-600">٪ {progress}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[10px]">
                    سقف غیبت مجاز: ۳ جلسه
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {courseCert && (
                      <button 
                        onClick={() => setViewingCertificate(courseCert)}
                        className="bg-amber-500 text-white font-black text-[11px] px-3 py-1.5 rounded-xl hover:bg-amber-600 flex items-center gap-1 shadow-sm"
                      >
                        <Award size={13} />
                        مشاهده گواهی
                      </button>
                    )}

                    <button 
                      onClick={() => onSelectCourse(mappedCourse)}
                      className="text-indigo-600 font-black text-xs flex items-center gap-1 hover:underline"
                    >
                      <PlayCircle size={14} /> ورود به دوره
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <CertificateViewerModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}

    </div>
  );
}
