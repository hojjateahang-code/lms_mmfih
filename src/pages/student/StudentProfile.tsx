// src/pages/student/StudentProfile.tsx
import React, { useState } from 'react';
import {
  ChevronLeft,
  Edit,
  Heart,
  Receipt,
  Settings,
  Smartphone,
  FileText,
  Headphones,
  PhoneCall,
  ShieldCheck,
  User,
  LogOut,
  RefreshCw,
  GraduationCap,
  Award,
  CalendarCheck,
  FileCheck,
  Trash2,
  BookOpen
} from 'lucide-react';
import WalletScreen from './WalletScreen';
import TicketChat from '../support/TicketChat';
import { UserProfile, Certificate, Course } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import PastRecordsModal from '../../components/lms/PastRecordsModal';
import CertificateViewerModal from '../../components/lms/CertificateViewerModal';
import { updateUserProfile } from '../../services/userService';
import { getUserFavorites, toggleCourseFavorite } from '../../services/lmsService';
import { getPublishedCourses } from '../../services/courseService';

interface StudentProfileProps {
  user?: any;
  onSelectCourse?: (course: Course) => void;
}

export default function StudentProfile({ user, onSelectCourse }: StudentProfileProps) {
  const { loginManager, logout, role, refreshUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [editFormData, setEditFormData] = useState({
    full_name: user?.user_metadata?.full_name || user?.full_name || '',
    national_id: user?.national_id || '',
    father_name: user?.father_name || '',
    phone: user?.phone || '',
    eitaa_id: user?.eitaa_id || '',
    birth_date: user?.birth_date || '',
    job: user?.job || '',
    education_level: user?.education_level || ''
  });
  const [showWallet, setShowWallet] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // LMS Modals
  const [showPastRecords, setShowPastRecords] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [favoriteCourses, setFavoriteCourses] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const loadFavoritesList = async () => {
    if (!user?.id) return;
    setLoadingFavorites(true);
    const [favIds, allCoursesRes] = await Promise.all([
      getUserFavorites(user.id),
      getPublishedCourses()
    ]);
    if (allCoursesRes.success && allCoursesRes.data) {
      const filtered = allCoursesRes.data.filter((c: any) => favIds.includes(Number(c.id)));
      setFavoriteCourses(filtered);
    }
    setLoadingFavorites(false);
  };

  if (showWallet) {
    return <WalletScreen onBack={() => setShowWallet(false)} />;
  }

  if (showTickets) {
    return <TicketChat onBack={() => setShowTickets(false)} />;
  }

  const handleTileClick = (id: string) => {
    if (id === 'wallet') {
      setShowWallet(true);
    } else if (id === 'support_msg') {
      setShowTickets(true);
    } else if (id === 'past_records' || id === 'certificates') {
      setShowPastRecords(true);
    } else if (id === 'favorites') {
      loadFavoritesList();
      setActiveModal('favorites');
    } else {
      setActiveModal(id);
    }
  };

  const studentName = user?.user_metadata?.full_name || user?.full_name || 'حجت‌الله آهنگ';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Top Header & Avatar Section */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-28 h-28 bg-[#8bc34a] rounded-[2.5rem] shadow-lg shadow-green-200 mb-3.5 flex items-center justify-center text-white text-3xl font-black border-4 border-white">
          {studentName.charAt(0)}
        </div>
        <h2 className="text-lg font-black text-slate-800">{studentName}</h2>
        <p className="text-xs font-bold text-slate-500 mt-1 font-mono" dir="ltr">
          @{user?.username || 'H_ahang'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5" dir="ltr">
          {user?.phone || '۰۹۳۶۰۳۵۴۸۳۷'}
        </p>
      </div>

      {/* Main Menu List */}
      <div className="bg-white rounded-t-[3rem] px-4 py-7 shadow-[0_-10px_40px_rgb(0,0,0,0.04)] border-t border-slate-100 min-h-[50vh]">
        
        {/* Section: Academic Records & Transcripts (سوابق و نمرات گذشته) */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-indigo-700 mb-3 px-2 flex items-center gap-1.5">
            <GraduationCap size={16} />
            پرونده آموزشی و سوابق تحصیلی
          </h3>
          <div className="space-y-2">
            <MenuTile
              onClick={() => handleTileClick('past_records')}
              icon={GraduationCap}
              title="سوابق گذشته، کارنامه و ریزنمرات"
              subtitle="مشاهده نمرات گذشته، معدل، غیبت‌ها و دوره‌های پیشین"
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <MenuTile
              onClick={() => handleTileClick('certificates')}
              icon={Award}
              title="گواهی‌نامه‌ها و مدارک رسمی من"
              subtitle="گواهی‌های صادره با قابلیت استعلام آنلاین و چاپ"
              color="text-amber-600"
              bg="bg-amber-50"
            />
          </div>
        </div>

        {/* Section: Account */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-slate-700 mb-3 px-2">حساب کاربری و مالی</h3>
          <div className="space-y-2">
            <MenuTile
              onClick={() => handleTileClick('edit')}
              icon={Edit}
              title="ویرایش اطلاعات کاربری"
              subtitle="نام، کد ملی و اطلاعات شناسنامه‌ای"
              color="text-blue-500"
              bg="bg-blue-50"
            />
            <MenuTile
              onClick={() => handleTileClick('wallet')}
              icon={Receipt}
              title="تراکنش‌ها و کیف پول"
              subtitle="تاریخچه پرداخت‌ها، شارژ و شهریه دوره‌ها"
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
            <MenuTile
              onClick={() => handleTileClick('favorites')}
              icon={Heart}
              title="علاقه‌مندی‌ها"
              subtitle="دوره‌های ذخیره‌شده شما"
              color="text-rose-500"
              bg="bg-rose-50"
            />
            <MenuTile
              onClick={() => handleTileClick('settings')}
              icon={Settings}
              title="تنظیمات سامانه"
              subtitle="اعلان‌های آزمون‌ها و یادآور کلاس آنلاین"
              color="text-slate-500"
              bg="bg-slate-100"
            />
          </div>
        </div>

        {/* Section: Support & Info */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-slate-700 mb-3 px-2">پشتیبانی و قوانین</h3>
          <div className="space-y-2">
            <MenuTile
              onClick={() => handleTileClick('support_msg')}
              icon={Headphones}
              title="ارسال پیام به پشتیبانی"
              subtitle="@amoozim_admin (پاسخگویی سریع)"
              color="text-indigo-500"
              bg="bg-indigo-50"
            />
            <MenuTile
              onClick={() => handleTileClick('support_call')}
              icon={PhoneCall}
              title="تماس با پشتیبانی آموزش"
              subtitle="۰۲۱۹۱۰۹۰۳۶۲"
              color="text-green-500"
              bg="bg-green-50"
            />
            <MenuTile
              onClick={() => handleTileClick('rules')}
              icon={FileText}
              title="آیین‌نامه انضباطی و سقف غیبت‌ها"
              subtitle="قوانین حضور و غیاب، حدنصاب قبولی آزمون‌ها"
              color="text-amber-500"
              bg="bg-amber-50"
            />
          </div>
        </div>

        {/* Login Switcher for Manager */}
        <div className="pt-2 border-t border-slate-100 mt-4">
          {role === 'executive_manager' ? (
            <button onClick={logout} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition">
              خروج از حساب مدیریت
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition border border-slate-200">
              ورود با نام کاربری (ویژه مدیران و اساتید)
            </button>
          )}
        </div>

      </div>

      {/* MODALS */}

      {/* 1. Past Records Modal */}
      {showPastRecords && (
        <PastRecordsModal
          userId={user?.id || 'usr_current'}
          userName={studentName}
          userRole={role || 'student'}
          onClose={() => setShowPastRecords(false)}
          onViewCertificate={(cert) => {
            setShowPastRecords(false);
            setSelectedCertificate(cert);
          }}
        />
      )}

      {/* 2. Certificate Viewer Modal */}
      {selectedCertificate && (
        <CertificateViewerModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* 3. Generic Info Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            {activeModal === 'edit' && (
              <div className="space-y-4">
                <h3 className="font-black text-sm text-slate-800">ویرایش اطلاعات کاربری</h3>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 py-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی</label>
                    <input type="text" value={editFormData.full_name} onChange={e => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی</label>
                    <input type="text" value={editFormData.national_id} onChange={e => setEditFormData({...editFormData, national_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">شماره تلفن همراه</label>
                    <input type="tel" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" dir="ltr" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!user?.id) return;
                      const res = await updateUserProfile(user.id, editFormData);
                      if (res.success) {
                        await refreshUser();
                        setActiveModal(null);
                        alert('اطلاعات کاربری با موفقیت در دیتابیس سامانه ثبت شد.');
                      } else {
                        alert(res.error || 'خطا در ثبت اطلاعات');
                      }
                    }}
                    className="flex-1 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-indigo-700 transition"
                  >
                    ذخیره در دیتابیس
                  </button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl">
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'favorites' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                    <Heart size={16} className="text-rose-500 fill-rose-500" />
                    <span>دوره‌های مورد علاقه من ({favoriteCourses.length})</span>
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                    ✕
                  </button>
                </div>

                {loadingFavorites ? (
                  <div className="py-8 text-center text-xs text-slate-400">در حال بارگذاری دوره‌های منتخب...</div>
                ) : favoriteCourses.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Heart size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs text-slate-500 font-bold">هنوز دوره‌ای را به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
                    <p className="text-[11px] text-slate-400">با زدن آیکون قلب روی هر دوره در صفحه اصلی، آن را به این بخش بیفزایید.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                    {favoriteCourses.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2.5"
                      >
                        <div
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            setActiveModal(null);
                            onSelectCourse?.({
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
                            });
                          }}
                        >
                          <img
                            src={c.cover_url || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'}
                            alt={c.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{c.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{c.instructor_name || 'استاد محترم'}</p>
                            <span className="text-[10px] text-indigo-600 font-bold">
                              {c.price === 0 ? 'رایگان' : `${(c.price || 0).toLocaleString('fa-IR')} تومان`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (!user?.id) return;
                            await toggleCourseFavorite(user.id, Number(c.id));
                            setFavoriteCourses(favoriteCourses.filter((fc) => fc.id !== c.id));
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0"
                          title="حذف از علاقه‌مندی‌ها"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
                >
                  بستن پنجره
                </button>
              </div>
            ) : activeModal !== 'edit' ? (
              <>
                <h3 className="font-black text-sm text-slate-800">
                  {activeModal === 'rules' && 'آیین‌نامه انضباطی و سقف غیبت'}
                  {activeModal === 'settings' && 'تنظیمات اعلان‌ها'}
                  {activeModal === 'support_call' && 'تماس با پشتیبانی آموزش'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {activeModal === 'rules' && 'سقف غیبت مجاز در دوره‌ها ۳ جلسه است. در صورت غیبت چهارم، دسترسی به دوره و آزمون به‌صورت خودکار سلب می‌گردد.'}
                  {activeModal === 'settings' && 'اعلان‌های آغاز کلاس آنلاین و آزمون‌ها به صورت پیش‌فرض فعال است.'}
                  {activeModal === 'support_call' && 'شماره تماس مستقیم سامانه: ۰۲۱۹۱۰۹۰۳۶۲ (پاسخگویی ۸ الی ۱۶)'}
                </p>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-2xl"
                >
                  متوجه شدم
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* 4. Manager Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-lg text-slate-800 mb-2">ورود به حساب کاربری</h3>
            <p className="text-xs text-slate-500 mb-6">این بخش ویژه مدیران و اساتید سامانه می‌باشد.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام کاربری</label>
                <input type="text" dir="ltr" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رمز عبور</label>
                <input type="password" dir="ltr" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={async () => {
                try {
                  await loginManager(loginUsername, loginPassword);
                  setShowLoginModal(false);
                } catch (err: any) {
                  alert(err.message);
                }
              }} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition">ورود به سامانه</button>
              <button onClick={() => setShowLoginModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm py-3 rounded-xl transition">انصراف</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MenuTile({ icon: Icon, title, subtitle, color, bg, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/90 active:scale-99 rounded-3xl transition duration-200 border border-transparent hover:border-slate-200"
    >
      <div className="flex items-center">
        <div className={`w-11 h-11 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-xs ml-3 flex-shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="text-right">
          <h4 className="text-xs font-bold text-slate-800 leading-tight">{title}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ChevronLeft size={18} className="text-slate-400 ml-1" />
    </button>
  );
}
