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
  RefreshCw
} from 'lucide-react';
import WalletScreen from './WalletScreen';
import TicketChat from '../support/TicketChat';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface StudentProfileProps {
  user?: any;
}

export default function StudentProfile({ user }: StudentProfileProps) {
  const { loginManager, logout, role } = useAuth();
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
    } else {
      setActiveModal(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Top Header & Avatar Section */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-28 h-28 bg-[#8bc34a] rounded-[2.5rem] shadow-lg shadow-green-200 mb-3.5 flex items-center justify-center text-white text-3xl font-black border-4 border-white">
          {user?.full_name ? user.full_name.charAt(0) : 'ح'}
        </div>
        <h2 className="text-lg font-black text-slate-800">{user?.full_name || 'حجت‌الله آهنگ'}</h2>
        <p className="text-xs font-bold text-slate-500 mt-1 font-mono" dir="ltr">
          @{user?.username || 'H_ahang'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5" dir="ltr">
          {user?.phone || '۰۹۳۶۰۳۵۴۸۳۷'}
        </p>
      </div>

      {/* Main Menu List */}
      <div className="bg-white rounded-t-[3rem] px-4 py-7 shadow-[0_-10px_40px_rgb(0,0,0,0.04)] border-t border-slate-100 min-h-[50vh]">
        {/* Section: Account */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-indigo-600 mb-3 px-2">حساب کاربری</h3>
          <div className="space-y-2">
            <MenuTile
              onClick={() => handleTileClick('edit')}
              icon={Edit}
              title="ویرایش اطلاعات"
              subtitle="نام، نام خانوادگی و اطلاعات شناسنامه‌ای"
              color="text-blue-500"
              bg="bg-blue-50"
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
              onClick={() => handleTileClick('wallet')}
              icon={Receipt}
              title="تراکنش‌ها و کیف پول"
              subtitle="تاریخچه پرداخت‌ها و شارژ حساب"
              color="text-emerald-500"
              bg="bg-emerald-50"
            />
            <MenuTile
              onClick={() => handleTileClick('settings')}
              icon={Settings}
              title="تنظیمات"
              subtitle="اعلان‌ها و تنظیمات برنامه"
              color="text-slate-500"
              bg="bg-slate-100"
            />
          </div>
        </div>

        {/* Section: More */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-indigo-600 mb-3 px-2">بیشتر</h3>
          <div className="space-y-2">
            <MenuTile
              onClick={() => handleTileClick('device')}
              icon={Smartphone}
              title="اطلاعات دستگاه"
              subtitle="مشخصات مرورگر و دستگاه شما"
              color="text-cyan-500"
              bg="bg-cyan-50"
            />
            <MenuTile
              onClick={() => handleTileClick('rules')}
              icon={FileText}
              title="قوانین و مقررات"
              subtitle="شرایط استفاده از خدمات آموزشی"
              color="text-amber-500"
              bg="bg-amber-50"
            />
            <MenuTile
              onClick={() => handleTileClick('support_msg')}
              icon={Headphones}
              title="ارسال پیام به پشتیبانی"
              subtitle="@amoozim_admin"
              color="text-indigo-500"
              bg="bg-indigo-50"
            />
            <MenuTile
              onClick={() => handleTileClick('support_call')}
              icon={PhoneCall}
              title="تماس با پشتیبانی"
              subtitle="۰۲۱۹۱۰۹۰۳۶۲"
              color="text-green-500"
              bg="bg-green-50"
            />
          </div>
        </div>

        {/* Role Switcher Button for Testing */}
        
      
        <div className="pt-2 border-t border-slate-100 mt-4">
          {role === 'executive_manager' ? (
            <button onClick={logout} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition">
              خروج از حساب مدیریت
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="w-full bg-slate-50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition border border-slate-200">
              ورود با نام کاربری (ویژه مدیران)
            </button>
          )}
        </div>

      </div>
      {/* Generic Info Modal for other tiles */}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام پدر</label>
                  <input type="text" value={editFormData.father_name} onChange={e => setEditFormData({...editFormData, father_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره تلفن همراه</label>
                  <input type="tel" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره مجازی ایتا</label>
                  <input type="text" value={editFormData.eitaa_id} onChange={e => setEditFormData({...editFormData, eitaa_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ تولد</label>
                  <input type="text" placeholder="مثال: ۱۳۷۵/۰۴/۱۲" value={editFormData.birth_date} onChange={e => setEditFormData({...editFormData, birth_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شغل</label>
                  <input type="text" value={editFormData.job} onChange={e => setEditFormData({...editFormData, job: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تحصیلات</label>
                  <input type="text" value={editFormData.education_level} onChange={e => setEditFormData({...editFormData, education_level: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                   // Mock save
                   const mockUser = JSON.parse(localStorage.getItem('test_user') || '{}');
                   localStorage.setItem('test_user', JSON.stringify({ ...mockUser, ...editFormData, user_metadata: { full_name: editFormData.full_name } }));
                   alert('اطلاعات با موفقیت ذخیره شد.');
                   setActiveModal(null);
                   window.location.reload();
                }} className="flex-1 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl">ذخیره اطلاعات</button>
                <button onClick={() => setActiveModal(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl">انصراف</button>
              </div>
            </div>
          )}
          {activeModal !== 'edit' && (
            <>
              <h3 className="font-black text-sm text-slate-800">
              {activeModal === 'edit' && 'ویرایش اطلاعات کاربری'}
              {activeModal === 'favorites' && 'دوره‌های موردعلاقه'}
              {activeModal === 'settings' && 'تنظیمات برنامه'}
              {activeModal === 'device' && 'مشخصات دستگاه'}
              {activeModal === 'rules' && 'قوانین و مقررات آموزشی'}
              {activeModal === 'support_msg' && 'پشتیبانی برخط ایتا'}
              {activeModal === 'support_call' && 'تماس با پشتیبانی'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeModal === 'support_msg' && 'شناسه پشتیبانی ایتا @amoozim_admin در دسترس می‌باشد.'}
              {activeModal === 'support_call' && 'شماره تماس مستقیم سامانه: ۰۲۱۹۱۰۹۰۳۶۲ (پاسخگویی ۸ الی ۱۶)'}
              {activeModal === 'device' && 'دستگاه متصل: مینی‌اپ استاندارد ایتا (Eitaa WebApp Container)'}
              {activeModal === 'rules' && 'تمامی حقوق دوره‌ها و آزمون‌ها متعلق به مدرسه عالی فقه و اصول می‌باشد.'}
              {activeModal === 'favorites' && 'هنوز دوره‌ای به لیست علاقه‌مندی‌ها اضافه نشده است.'}
              {activeModal === 'edit' && 'اطلاعات سجلی شما از طریق پیام‌رسان ایتا تایید و قفل گردیده است.'}
              {activeModal === 'settings' && 'اعلان‌های دوره و یادآور آزمون‌ها به صورت پیش‌فرض فعال است.'}
            </p>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-2xl"
            >
              متوجه شدم
            </button>
            </>
          )}
          </div>
        </div>
      )}
    
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

// کامپوننت داخلی برای ردیف‌های منو (List Tile)
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
