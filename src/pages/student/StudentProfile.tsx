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
import { UserProfile } from '../../types';

interface StudentProfileProps {
  user?: UserProfile | null;
  onSwitchRole?: (role: 'student' | 'executive_manager') => void;
  onSimulateNewUser?: () => void;
}

export default function StudentProfile({ user, onSwitchRole, onSimulateNewUser }: StudentProfileProps) {
  const [showWallet, setShowWallet] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  if (showWallet) {
    return <WalletScreen onBack={() => setShowWallet(false)} />;
  }

  const handleTileClick = (id: string) => {
    if (id === 'wallet') {
      setShowWallet(true);
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
        {onSwitchRole && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onSwitchRole('executive_manager')}
              className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-indigo-900 font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={14} className="text-indigo-600" />
              <span>سوییچ به پنل مدیر اجرایی</span>
            </button>
          </div>
        )}
      </div>

      {/* Generic Info Modal for other tiles */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
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
