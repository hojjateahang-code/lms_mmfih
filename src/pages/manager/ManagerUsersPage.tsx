import React, { useState } from 'react';
import { Users, Search, ShieldCheck, UserPlus, Filter, MoreVertical, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../types';

export default function ManagerUsersPage() {
  const [query, setQuery] = useState('');

  const sampleUsers: UserProfile[] = [
    {
      id: '1',
      eitaa_id: '88921',
      username: 'm_hoseini',
      full_name: 'محمد مهدی حسینی',
      role: 'student',
      wallet_balance: 450000,
      city: 'قم',
      education_level: 'سطح ۲ حوزه'
    },
    {
      id: '2',
      eitaa_id: '77410',
      username: 'a_karimi',
      full_name: 'علیرضا کریمی',
      role: 'student',
      wallet_balance: 150000,
      city: 'مشهد',
      education_level: 'سطح ۱ حوزه'
    },
    {
      id: '3',
      eitaa_id: '99120',
      username: 'h_mousavi',
      full_name: 'حجت‌الاسلام سید علی موسوی',
      role: 'executive_manager',
      wallet_balance: 12000000,
      city: 'قم',
      education_level: 'خارج فقه'
    }
  ];

  const filtered = sampleUsers.filter(u =>
    u.full_name.includes(query) || u.username.includes(query) || u.eitaa_id.includes(query)
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-black text-indigo-950 text-lg mb-0.5">مدیریت طلاب و کاربران</h1>
          <p className="text-xs text-slate-500">مشاهده و احراز کاربران متصل به ایتا</p>
        </div>
        <button className="bg-indigo-600 text-white font-bold text-xs px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-100">
          <UserPlus size={14} /> کاربر جدید
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو با نام، آیدی ایتا یا کد ملی..."
          className="w-full bg-white text-sm rounded-2xl py-3 pr-10 pl-4 border border-slate-200 outline-none focus:border-indigo-500 shadow-sm"
        />
        <Search className="absolute right-3 top-3.5 text-slate-400" size={18} />
      </div>

      <div className="space-y-3">
        {filtered.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {user.full_name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-slate-800">{user.full_name}</h3>
                  {user.role === 'executive_manager' && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">مدیر</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono dir-ltr text-right">@{user.username}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  آیدی ایتا: {user.eitaa_id} | {user.education_level}
                </div>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">کیف پول</span>
              <span className="font-black text-xs text-indigo-600">
                {user.wallet_balance.toLocaleString('fa-IR')} <span className="text-[9px] font-normal">تومان</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
