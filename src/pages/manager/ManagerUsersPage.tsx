import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserPlus, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/userService';

export default function ManagerUsersPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getAllUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`آیا از حذف کامل کاربر «${userName || 'کاربر'}» و تمام سوابق، ثبت‌نام‌ها و نمرات او از سامانه اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
      return;
    }

    setDeletingId(userId);
    const res = await deleteUser(userId);
    if (res.success) {
      setUsers(users.filter(u => u.id !== userId));
      alert('کاربر با موفقیت از سامانه حذف گردید.');
    } else {
      alert(res.error || 'خطا در حذف کاربر');
    }
    setDeletingId(null);
  };

  const filtered = users.filter(u =>
    (u.full_name && u.full_name.includes(query)) ||
    (u.username && u.username.includes(query)) ||
    (u.eitaa_id && u.eitaa_id.includes(query)) ||
    (u.national_id && u.national_id.includes(query))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-black text-indigo-950 text-lg mb-0.5">مدیریت کاربران و نقش‌ها</h1>
          <p className="text-xs text-slate-500">مشاهده، تغییر سطح دسترسی و حذف کاربران</p>
        </div>
        <div className="bg-indigo-100/80 text-indigo-900 text-xs font-black px-3 py-1.5 rounded-2xl">
          {users.length} کاربر ثبت‌شده
        </div>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو با نام، نام کاربری، شناسه ایتا یا کدملی..."
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
              کاربری با این مشخصات یافت نشد.
            </div>
          )}
          {filtered.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm overflow-hidden shrink-0">
                  {user.avatar_url ? (
                     <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user.full_name ? user.full_name.slice(0, 1) : 'ک'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs text-slate-800">{user.full_name || 'کاربر بدون نام'}</h3>
                    {user.role === 'executive_manager' && (
                      <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-md">مدیر کل</span>
                    )}
                    {user.role === 'course_manager' && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md">مسئول دوره</span>
                    )}
                    {user.role === 'teacher' && (
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded-md">استاد</span>
                    )}
                    {user.role === 'student' && (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md">دانش‌پژوه</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono dir-ltr text-right mt-0.5">
                    @{user.username || user.eitaa_id || 'unknown'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    شناسه ایتا: <strong>{user.eitaa_id || 'ندارد'}</strong> | موجودی کیف: <strong>{(user.wallet_balance || 0).toLocaleString('fa-IR')} تومان</strong>
                  </div>
                </div>
              </div>

              {/* Controls: Change Role & Delete User */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] text-slate-400">تغییر سطح دسترسی:</span>
                  <select 
                    value={user.role} 
                    onChange={async (e) => {
                      const newRole = e.target.value as UserRole;
                      const res = await updateUserRole(user.id, newRole);
                      if(res.success) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                        alert(`سطح دسترسی با موفقیت تغییر کرد.`);
                      } else {
                        alert(res.error || 'خطا در تغییر نقش');
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none text-slate-700 font-bold"
                  >
                    <option value="student">دانش‌پژوه</option>
                    <option value="teacher">استاد</option>
                    <option value="course_manager">مسئول دوره</option>
                    <option value="executive_manager">مدیر کل</option>
                  </select>
                </div>

                <button
                  onClick={() => handleDeleteUser(user.id, user.full_name)}
                  disabled={deletingId === user.id}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-2.5 rounded-xl transition shadow-2xs mt-4 sm:mt-0"
                  title="حذف کامل کاربر"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
