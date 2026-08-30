// src/pages/manager/ManagerFinance.tsx
import React, { useState } from 'react';
import { CreditCard, TrendingUp, ShieldCheck, FileOutput, Plus, CheckCircle2, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';

export default function ManagerFinance() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const [entries, setEntries] = useState([
    { id: 1, title: 'خرید سرور و پهنای باند ویدیویی (هزینه)', author: 'مسئول زیرساخت - امروز', amount: '۸۵۰,۰۰۰', type: 'expense' },
    { id: 2, title: 'واریز شهریه دوره معارف قرآنی (درآمد)', author: 'درگاه ایتا صنام - دیروز', amount: '۱,۴۵۰,۰۰۰', type: 'income' },
    { id: 3, title: 'تسویه حق‌التدریس استاد مکارم (تسویه)', author: 'امور مالی - ۳ روز پیش', amount: '۳,۰۰۰,۰۰۰', type: 'payout' },
    { id: 4, title: 'برگشت وجه التزام ۵ دانش‌پژوه برتر', author: 'سیستم خودکار - ۵ روز پیش', amount: '۷۵۰,۰۰۰', type: 'expense' },
  ]);

  const handleAddExpense = () => {
    if (expenseTitle && expenseAmount) {
      setEntries([
        {
          id: Date.now(),
          title: `${expenseTitle} (هزینه)`,
          author: 'توسط مدیر اجرایی - اکنون',
          amount: parseInt(expenseAmount, 10).toLocaleString('fa-IR'),
          type: 'expense'
        },
        ...entries
      ]);
      setShowExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount('');
      triggerNotice('هزینه اجرایی جدید با موفقیت در دفتر کل ثبت شد.');
    }
  };

  const handlePayout = () => {
    setShowPayoutModal(false);
    triggerNotice('لیست تسویه اساتید به سیستم بانکی ایتا ارسال گردید.');
  };

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-5 rounded-b-3xl shadow-sm mb-5 sticky top-0 z-20 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="font-black text-slate-800 text-base">دفتر کل مالی</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">نظارت بر درآمدها، وجه التزام و هزینه‌های اجرایی</p>
        </div>
        <button
          onClick={() => triggerNotice('گزارش اکسل دانلود شد.')}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1"
        >
          <Download size={15} />
        </button>
      </div>

      {/* Action Notification */}
      {notice && (
        <div className="mx-4 mb-4 bg-emerald-600 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      <div className="px-4 space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3.5 mb-1">
          {/* Total Revenue */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-1">درآمد ناخالص دوره‌ها</p>
            <h3 className="text-sm font-black text-slate-800">
              ۱۲,۴۵۰,۰۰۰ <span className="text-[10px] font-normal text-slate-400">تومان</span>
            </h3>
          </div>

          {/* Escrow (وجه التزام) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-3 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 mb-1">صندوق وجه التزام</p>
            <h3 className="text-sm font-black text-slate-800">
              ۳,۲۰۰,۰۰۰ <span className="text-[10px] font-normal text-slate-400">تومان</span>
            </h3>
          </div>
        </div>

        {/* Expenses & Payout Card */}
        <div className="bg-slate-900 rounded-[2rem] p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 opacity-20 blur-3xl rounded-full"></div>
          <div className="relative z-10 flex justify-between items-center mb-5">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">تراز خالص پلتفرم</p>
              <h2 className="text-xl font-black text-white">
                ۸,۱۰۰,۰۰۰ <span className="text-xs font-normal opacity-80">تومان</span>
              </h2>
            </div>
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <CreditCard size={22} className="text-indigo-300" />
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex-1 bg-white text-slate-900 hover:bg-slate-100 active:scale-98 font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition shadow-sm"
            >
              <Plus size={15} className="ml-1" /> ثبت هزینه اجرایی
            </button>
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center transition shadow-sm"
            >
              <FileOutput size={15} className="ml-1" /> تسویه اساتید
            </button>
          </div>
        </div>

        {/* Recent Ledger Entries */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-slate-700 text-xs">آخرین گردش‌های مالی و تراکنش‌ها</h2>
            <span className="text-[10px] text-slate-400">{entries.length} تراکنش ثبت‌شده</span>
          </div>

          <div className="space-y-2.5">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-3.5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      entry.type === 'income'
                        ? 'bg-emerald-100 text-emerald-600'
                        : entry.type === 'expense'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {entry.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{entry.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{entry.author}</p>
                  </div>
                </div>

                <div className="text-left font-black text-xs text-slate-800 pr-2">
                  <span className={entry.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}>
                    {entry.amount}
                  </span>{' '}
                  <span className="text-[9px] font-normal text-slate-400">تومان</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-sm text-slate-800">ثبت هزینه اجرایی جدید</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شرح هزینه</label>
              <input
                type="text"
                placeholder="مثلاً: اجاره استودیو ضبط صوت"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ (تومان)</label>
              <input
                type="number"
                placeholder="مثلاً: ۵۰۰۰۰۰"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 outline-none text-center font-bold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddExpense}
                className="flex-1 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md shadow-indigo-100"
              >
                ثبت سند هزینه
              </button>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="px-4 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-2xl"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Payout Teachers */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-sm text-slate-800">تسویه‌حساب با اساتید دوره</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تعداد ۳ استاد دارای کارکرد تاییدشده به مجموع مبلغ ۴,۵۰۰,۰۰۰ تومان در صف تسویه قرار دارند.
            </p>
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 font-medium">
              پرداخت از طریق حساب تجاری متصل به پلتفرم ایتا انجام خواهد شد.
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePayout}
                className="flex-1 bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md shadow-indigo-100"
              >
                تایید و ارسال دستور پرداخت
              </button>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-2xl"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
