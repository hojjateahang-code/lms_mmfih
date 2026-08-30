import React from 'react';
import { CreditCard, TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';

export default function FinancialPage() {
  const transactions = [
    { id: 1, user: 'محمد مهدی حسینی', course: 'تفسیر روان قرآن کریم', amount: 350000, date: 'امروز، ۱۴:۲۰', type: 'charge' },
    { id: 2, user: 'علیرضا کریمی', course: 'مقدمات منطق و فلسفه', amount: 280000, date: 'دیروز، ۱۰:۱۵', type: 'charge' },
    { id: 3, user: 'پشتیبانی حوزه', course: 'واریز شهریه تشویقی', amount: 500000, date: '۲ روز پیش', type: 'payout' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 p-4 font-sans" dir="rtl">
      <div className="mb-4">
        <h1 className="font-black text-indigo-950 text-lg mb-0.5">گزارش‌های مالی و کیف‌پول‌ها</h1>
        <p className="text-xs text-slate-500">مدیریت تراکنش‌های ایتا و شهریه‌ها</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 shadow-xl mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs text-indigo-200">کل درآمد مدرسه مجازی</span>
            <div className="text-2xl font-black mt-1">
              ۴۵,۲۰۰,۰۰۰ <span className="text-xs font-normal text-amber-300">تومان</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-indigo-200 block">ثبت‌نام‌های این ماه:</span>
            <span className="font-bold text-amber-200">۱۲۴ دوره</span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-200 block">تسویه‌حساب با اساتید:</span>
            <span className="font-bold text-emerald-300">منظم و به‌روز</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-slate-800 text-xs">تراکنش‌های اخیر کیف‌پول ایتا</h2>
          <button className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
            <Download size={12} /> دریافت اکسل
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-none text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  t.type === 'charge' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {t.type === 'charge' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{t.user}</div>
                  <div className="text-[10px] text-slate-400">{t.course} • {t.date}</div>
                </div>
              </div>

              <div className="text-left font-black text-indigo-600">
                +{t.amount.toLocaleString('fa-IR')} <span className="text-[9px] font-normal text-slate-500">تومان</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
