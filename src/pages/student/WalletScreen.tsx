// src/pages/student/WalletScreen.tsx
import React, { useState } from 'react';
import { ChevronRight, Plus, ArrowDownLeft, ArrowUpRight, CheckCircle2, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WalletScreenProps {
  onBack: () => void;
}

export default function WalletScreen({ onBack }: WalletScreenProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(1500000);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('200000');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isCharging, setIsCharging] = useState(false);

    const handleAddFunds = async () => {
    const num = parseInt(chargeAmount);
    if (!isNaN(num) && num > 0) {
      setIsCharging(true);
      // Simulate API call
      setTimeout(() => {
        const newBalance = balance + num;
        setBalance(newBalance);
        localStorage.setItem('mock_wallet_balance', newBalance.toString());
        setIsCharging(false);
        setShowChargeModal(false);
        setChargeAmount('');
        triggerNotice(`کیف پول شما با موفقیت ${num.toLocaleString('fa-IR')} تومان شارژ شد.`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm mb-6 flex items-center sticky top-0 z-20 border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-2 bg-slate-100 rounded-2xl text-slate-600 ml-3 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <ChevronRight size={20} />
        </button>
        <h1 className="font-black text-slate-800 text-base">کیف پول من</h1>
      </div>

      {successNotice && (
        <div className="mx-4 mb-4 bg-emerald-600 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="px-4">
        {/* Virtual Credit Card */}
        <div className="w-full h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-10 translate-y-10"></div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-indigo-100">موجودی فعلی</span>
              <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-xl backdrop-blur-md font-bold tracking-wider">
                صنام پی
              </span>
            </div>
            <div>
              <div className="text-3xl font-black mb-1">
                {balance.toLocaleString('fa-IR')} <span className="text-sm font-normal opacity-80">تومان</span>
              </div>
              <p className="text-[11px] text-indigo-200 font-mono tracking-wide" dir="ltr">
                Hojjatollah Ahang
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowChargeModal(true)}
            className="flex-1 bg-white border border-indigo-100 text-indigo-600 font-bold text-sm py-3.5 rounded-3xl shadow-sm flex items-center justify-center hover:bg-indigo-50 active:scale-98 transition-all gap-1.5"
          >
            <Plus size={18} /> افزایش موجودی
          </button>
        </div>

        {/* Transactions List */}
        <div>
          <h2 className="font-bold text-slate-700 text-sm mb-4">تاریخچه تراکنش‌ها</h2>
          <div className="space-y-3">
            {/* Incoming (Deposit / Refund) */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 ml-3 flex-shrink-0">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">عودت وجه التزام</h4>
                  <p className="text-[10px] text-slate-400 mt-1">۱۴ شهریور ۱۴۰۵</p>
                </div>
              </div>
              <span className="text-emerald-600 font-bold text-xs" dir="ltr">
                + ۱۵۰,۰۰۰ <span className="text-[10px]">تومان</span>
              </span>
            </div>

            {/* Outgoing (Purchase) */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 ml-3 flex-shrink-0">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">خرید دوره علوم حوزوی</h4>
                  <p className="text-[10px] text-slate-400 mt-1">۱۲ شهریور ۱۴۰۵</p>
                </div>
              </div>
              <span className="text-rose-600 font-bold text-xs" dir="ltr">
                - ۳۵۰,۰۰۰ <span className="text-[10px]">تومان</span>
              </span>
            </div>

            {/* Another Incoming */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 ml-3 flex-shrink-0">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">شارژ آنلاین از درگاه ایتا</h4>
                  <p className="text-[10px] text-slate-400 mt-1">۱۰ شهریور ۱۴۰۵</p>
                </div>
              </div>
              <span className="text-emerald-600 font-bold text-xs" dir="ltr">
                + ۱,۷۰۰,۰۰۰ <span className="text-[10px]">تومان</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charge Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-indigo-600">
              <CreditCard size={20} />
              <h3 className="font-black text-sm text-slate-800">شارژ کیف پول ایتا</h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ شارژ (تومان)</label>
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="w-full bg-slate-50 text-sm p-3 rounded-2xl border border-slate-200 outline-none text-center font-bold text-slate-800"
              />
            </div>
            <div className="flex gap-2">
              {['100000', '200000', '500000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setChargeAmount(amt)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-bold text-slate-700"
                >
                  {(parseInt(amt) / 1000).toLocaleString('fa-IR')} هزار
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddFunds}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md shadow-indigo-100"
              >
                پرداخت و شارژ
              </button>
              <button
                onClick={() => setShowChargeModal(false)}
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
