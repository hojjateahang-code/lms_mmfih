import React, { useEffect, useState } from 'react';
import { BookOpen, PlayCircle, Clock, CheckCircle, Award, Loader2, Radio, ShieldAlert } from 'lucide-react';
import { Course, Certificate } from '../../types';
import { getUserEnrollments } from '../../services/courseService';
import { getUserCertificates, isStudentDropped, getCourseAttendanceSummary } from '../../services/lmsService';
import { useAuth } from '../../contexts/AuthContext';
import CertificateViewerModal from '../../components/lms/CertificateViewerModal';

interface MyCoursesPageProps {
  onSelectCourse: (course: Course) => void;
}

export default function MyCoursesPage({ onSelectCourse }: MyCoursesPageProps) {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [enrollRes, certs] = await Promise.all([
        getUserEnrollments(user.id),
        getUserCertificates(user.id)
      ]);

      if (enrollRes.success && enrollRes.data) {
        setEnrollments(enrollRes.data);
      }
      setCertificates(certs);
      setLoading(false);
    };
    fetchData();
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
        <p className="text-xs text-slate-500">کلاس‌های آنلاین، محتوای آفلاین و پیگیری حضور و غیاب</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-sm">
          <BookOpen size={20} className="mb-2 text-indigo-200" />
          <div className="text-xl font-black">{enrollments.length} دوره</div>
          <div className="text-[11px] text-indigo-100 font-medium">دوره‌های ثبت‌نامی فعال</div>
        </div>
        <div className="bg-amber-600 text-white p-4 rounded-3xl shadow-sm">
          <Award size={20} className="mb-2 text-amber-200" />
          <div className="text-xl font-black">{certificates.length} گواهی</div>
          <div className="text-[11px] text-amber-100 font-medium">مدارک صادره رسمی</div>
        </div>
      </div>

      {enrollments.length === 0 ? (
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
