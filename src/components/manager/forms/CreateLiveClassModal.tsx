// src/components/manager/forms/CreateLiveClassModal.tsx
import React, { useState } from 'react';
import { X, Radio, Video, Calendar, User, Link as LinkIcon, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { createLiveSession } from '../../../services/lmsService';

interface CreateLiveClassModalProps {
  courseId: number;
  onClose: () => void;
  onSuccess: (sessionTitle: string) => void;
}

export default function CreateLiveClassModal({
  courseId,
  onClose,
  onSuccess
}: CreateLiveClassModalProps) {
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('امروز - ساعت ۱۸:۳۰');
  const [platformType, setPlatformType] = useState<'internal' | 'external'>('internal');
  const [customRoomUrl, setCustomRoomUrl] = useState('');
  const [instructorName, setInstructorName] = useState('استاد محترم دوره');
  const [status, setStatus] = useState<'upcoming' | 'live'>('upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return alert('لطفاً عنوان جلسه آنلاین را وارد کنید.');
    }

    setIsSubmitting(true);

    const generatedRoomUrl = platformType === 'internal'
      ? `https://meet.jit.si/LMS_MFIH_Course_${courseId}_${Date.now()}`
      : (customRoomUrl.trim() || `https://meet.jit.si/LMS_MFIH_Course_${courseId}_${Date.now()}`);

    const res = await createLiveSession(courseId, {
      title: title.trim(),
      scheduled_time: scheduledTime.trim() || 'به زودی',
      status,
      room_url: generatedRoomUrl,
      room_type: platformType,
      instructor_name: instructorName.trim() || 'مدرس دوره'
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess(title.trim());
      onClose();
    } else {
      alert('خطا در ایجاد جلسه آنلاین: ' + (res.error || 'ناشناخته'));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">ایجاد و زمان‌بندی کلاس آنلاین زنده</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">اتصال مستقیم به سرور و سامانه حضور و غیاب هوشمند</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">عنوان جلسه آنلاین یا کارگاه *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: جلسه دوم: حل تمرین و کارگاه رفع اشکال"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar size={13} className="text-indigo-600" />
              <span>تاریخ و ساعت برگزاری</span>
            </label>
            <input
              type="text"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="مثلاً: چهارشنبه ۵ مهر - ساعت ۱۸:۳۰"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Platform Choice */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">انتخاب بستر برگزاری جلسه آنلاین</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPlatformType('internal')}
                className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                  platformType === 'internal'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-100'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Video size={15} className="text-indigo-600" />
                  <span className="font-black text-slate-800 text-[11px]">وبینار LMS MFIH</span>
                </div>
                <p className="text-[9.5px] text-slate-500 leading-tight">
                  وب‌آرتی‌سی رایگان، بدون فیلتر، با تصویر، صوت و اشتراک صفحه
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPlatformType('external')}
                className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                  platformType === 'external'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-100'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe size={15} className="text-emerald-600" />
                  <span className="font-black text-slate-800 text-[11px]">لینک اختصاصی دیگر</span>
                </div>
                <p className="text-[9.5px] text-slate-500 leading-tight">
                  اسکای‌روم، ادوبی‌کانکت، بیگ‌بلوباتن، گوگل‌میت و...
                </p>
              </button>
            </div>
          </div>

          {/* Custom Link if external */}
          {platformType === 'external' && (
            <div className="animate-in fade-in duration-200">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <LinkIcon size={12} className="text-slate-500" />
                <span>پیوند (URL) کلاس آنلاین</span>
              </label>
              <input
                type="url"
                value={customRoomUrl}
                onChange={(e) => setCustomRoomUrl(e.target.value)}
                placeholder="https://skyroom.online/ch/mfih/class1"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 font-mono"
                dir="ltr"
              />
            </div>
          )}

          {/* Instructor Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User size={13} className="text-slate-500" />
              <span>نام مدرس / ارائه‌دهنده</span>
            </label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              placeholder="مثلاً: استاد آیت‌الله حسینی"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">وضعیت کلاس</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('upcoming')}
                className={`flex-1 py-2 rounded-xl font-bold transition text-xs ${
                  status === 'upcoming'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                برنامه‌ریزی شده (آینده)
              </button>
              <button
                type="button"
                onClick={() => setStatus('live')}
                className={`flex-1 py-2 rounded-xl font-bold transition text-xs flex items-center justify-center gap-1.5 ${
                  status === 'live'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                درحال برگزاری (LIVE)
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-[11px] text-indigo-900 flex items-start gap-2 leading-relaxed">
            <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span>
              به محض ورود هر دانش‌پژوه به این کلاس آنلاین، حضور او با تاریخ و ساعت دقیق در سامانه حضور و غیاب خودکار ثبت شده و غیبت‌های او کسر خواهد شد.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-black py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? 'در حال ثبت...' : 'ثبت و افتتاح کلاس آنلاین'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
