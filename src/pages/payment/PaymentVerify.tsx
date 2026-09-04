import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentVerify() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('در حال بررسی وضعیت تراکنش...');
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authority = params.get('Authority');
    const amount = params.get('amount') || params.get('Amount');
    const user_id = params.get('user_id');
    const gatewayStatus = params.get('Status');

    if (!authority || !user_id || !amount) {
      setStatus('error');
      setMessage('اطلاعات تراکنش نامعتبر است.');
      return;
    }

    if (gatewayStatus !== 'OK') {
      setStatus('error');
      setMessage('تراکنش توسط کاربر لغو شد یا ناموفق بود.');
      return;
    }

    // Verify payment on our backend
    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authority,
            amount,
            user_id,
            status: gatewayStatus
          }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage('موجودی کیف پول شما با موفقیت افزایش یافت.');
          setRefId(data.ref_id);
        } else {
          setStatus('error');
          setMessage(data.message || 'تایید تراکنش با خطا مواجه شد.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('خطا در ارتباط با سرور.');
      }
    };

    verifyPayment();
  }, []);

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-lg font-bold text-slate-800">صبر کنید...</h2>
            <p className="text-slate-500 text-sm mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">پرداخت موفق</h2>
            <p className="text-slate-600 text-sm">{message}</p>
            {refId && (
              <div className="mt-4 bg-slate-50 p-3 rounded-xl w-full border border-slate-100">
                <span className="text-xs text-slate-500 block mb-1">کد پیگیری:</span>
                <span className="font-mono text-sm font-bold text-slate-700">{refId}</span>
              </div>
            )}
            <button
              onClick={goHome}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"
            >
              بازگشت به برنامه
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">خطا در پرداخت</h2>
            <p className="text-slate-600 text-sm">{message}</p>
            <button
              onClick={goHome}
              className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"
            >
              بازگشت به برنامه
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
