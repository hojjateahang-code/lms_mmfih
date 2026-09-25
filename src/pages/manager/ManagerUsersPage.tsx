import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserPlus, Filter, MoreVertical, CheckCircle, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { getAllUsers, updateUserRole } from '../../services/userService';

export default function ManagerUsersPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    (u.full_name && u.full_name.includes(query)) ||
    (u.username && u.username.includes(query)) ||
    (u.eitaa_id && u.eitaa_id.includes(query))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-black text-indigo-950 text-lg mb-0.5">مدیریت طلاب و کاربران</h1>
          <p className="text-xs text-slate-500">مشاهده و احراز کاربران متصل به ایتا</p>
        </div>
        <button onClick={() => alert('امکان افزودن کاربر دستی وجود ندارد. کاربران به صورت خودکار از طریق ورود با ایتا (OAuth) به سیستم اضافه می‌شوند.')} className="bg-indigo-600 text-white font-bold text-xs px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-100">
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

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
              کاربری یافت نشد.
            </div>
          )}
          {filtered.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm overflow-hidden">
                  {user.avatar_url ? (
                     <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user.full_name ? user.full_name.slice(0, 1) : 'ک'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-slate-800">{user.full_name || 'کاربر ناشناس'}</h3>
                    {user.role === 'executive_manager' && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">مدیر</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono dir-ltr text-right">@{user.username || user.eitaa_id || 'unknown'}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    آیدی ایتا: {user.eitaa_id || 'ندارد'} | {user.education_level || 'ثبت نشده'}
                  </div>
                </div>
              </div>

              
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400 block">تغییر نقش</span>
                  <select 
                    value={user.role} 
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      const res = await updateUserRole(user.id, newRole);
                      if(res.success) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                        alert('نقش کاربر با موفقیت تغییر کرد.');
                      } else {
                        alert('خطا در تغییر نقش');
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2 py-1 outline-none text-slate-700 font-bold"
                  >
                    <option value="student">دانش‌پژوه</option>
                    <option value="teacher">استاد</option>
                    <option value="executive_manager">مدیر</option>
                  </select>
                </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
