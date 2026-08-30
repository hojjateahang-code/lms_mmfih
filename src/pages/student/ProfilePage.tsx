import React from 'react';
import { User, Wallet, ShieldCheck, Phone, MapPin, Award, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfilePageProps {
  user: UserProfile | null;
  onSwitchRole?: (role: 'student' | 'executive_manager') => void;
  onSimulateNewUser?: () => void;
}

export default function ProfilePage({ user, onSwitchRole, onSimulateNewUser }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      {/* User Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="relative z-10 flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-amber-300 border border-white/30">
            {user?.full_name?.slice(0, 1) || 'ع'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className="font-black text-lg">{user?.full_name || 'دانش‌پژوه گرامی'}</h2>
              <ShieldCheck size={18} className="text-amber-400" />
            </div>
            <p className="text-xs text-indigo-200 font-medium dir-ltr text-right">
              @{user?.username || 'user_eitaa'}
            </p>
            <div className="inline-block bg-white/15 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-amber-200 mt-1">
              آیدی ایتا: {user?.eitaa_id || 'احراز نامرئی'}
            </div>
          </div>
        </div>

        {/* Wallet info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex justify-between items-center border border-white/10">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-amber-300" />
            <div>
              <div className="text-[10px] text-indigo-200">موجودی کیف پول</div>
              <div className="font-black text-sm text-white">
                {(user?.wallet_balance || 0).toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان</span>
              </div>
            </div>
          </div>
          <button className="bg-amber-400 hover:bg-amber-300 text-indigo-950 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm">
            افزایش اعتبار
          </button>
        </div>
      </div>

      {/* Profile Info List */}
      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-3">اطلاعات پرونده حوزوی / پژوهشی</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><User size={14} /> کد ملی:</span>
              <span className="font-bold text-slate-800">{user?.national_id || '۰۰۱۲۳۴۵۶۷۸'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Phone size={14} /> شماره همراه ایتا:</span>
              <span className="font-bold text-slate-800 dir-ltr">{user?.phone || '۰۹۱۲۱۱۱۲۲۳۳'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><MapPin size={14} /> شهر محل سکونت:</span>
              <span className="font-bold text-slate-800">{user?.city || 'قم المقدسه'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 flex items-center gap-2"><Award size={14} /> مقطع تحصیلی:</span>
              <span className="font-bold text-slate-800">{user?.education_level || 'سطح ۲ حوزه علمیه'}</span>
            </div>
          </div>
        </div>

        {/* Eitaa Integration Status */}
        <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-xs">احراز هویت خودکار ایتا فعال است</h4>
            <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
              ورود شما بدون نیاز به کلمه عبور و مستقیماً از پیام‌رسان ایتا تایید شده است.
            </p>
          </div>
        </div>
      </div>

      {/* Role Switcher & Dev Options */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-xs mb-3 text-slate-500 uppercase tracking-wider">
          تنظیمات نمایش و تست نقش‌ها
        </h3>
        
        <div className="space-y-2">
          <button
            onClick={() => onSwitchRole?.(user?.role === 'executive_manager' ? 'student' : 'executive_manager')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-indigo-950 font-bold text-xs py-3 px-4 rounded-2xl flex justify-between items-center transition-all"
          >
            <span>تغییر نقش فعلی (فعلی: {user?.role === 'executive_manager' ? 'مدیر اجرایی' : 'دانش‌پژوه'})</span>
            <RefreshCw size={14} className="text-indigo-600" />
          </button>

          {onSimulateNewUser && (
            <button
              onClick={onSimulateNewUser}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-3 px-4 rounded-2xl flex justify-between items-center transition-all"
            >
              <span>تست ورود کاربر جدید ایتا (Auto-Profile)</span>
              <User size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
