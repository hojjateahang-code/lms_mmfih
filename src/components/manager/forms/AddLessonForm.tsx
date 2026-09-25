// src/components/manager/forms/AddLessonForm.tsx
import React, { useState } from 'react';
import { X, Video, Image as ImageIcon, Music, FileText, Type, UploadCloud, CheckCircle2 } from 'lucide-react';

interface AddLessonFormProps {
  onClose: () => void;
  onSave?: (lessonData: any) => void;
  initialData?: {
    id?: number;
    title?: string;
    type?: string;
    duration?: string;
    isFree?: boolean;
  } | null;
}

export default function AddLessonForm({ onClose, onSave, initialData }: AddLessonFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [selectedMediaType, setSelectedMediaType] = useState(initialData?.type || 'video');
  const [fileUploaded, setFileUploaded] = useState(false);

  const mediaTypes = [
    { id: 'video', icon: Video, label: 'ویدیو', color: 'text-blue-500', bg: 'bg-blue-50', activeBorder: 'border-blue-400 ring-2 ring-blue-100' },
    { id: 'audio', icon: Music, label: 'صوت', color: 'text-amber-500', bg: 'bg-amber-50', activeBorder: 'border-amber-400 ring-2 ring-amber-100' },
    { id: 'pdf', icon: FileText, label: 'فایل (PDF)', color: 'text-rose-500', bg: 'bg-rose-50', activeBorder: 'border-rose-400 ring-2 ring-rose-100' },
    { id: 'image', icon: ImageIcon, label: 'تصویر', color: 'text-emerald-500', bg: 'bg-emerald-50', activeBorder: 'border-emerald-400 ring-2 ring-emerald-100' },
    { id: 'text', icon: Type, label: 'متن ساده', color: 'text-slate-600', bg: 'bg-slate-100', activeBorder: 'border-slate-400 ring-2 ring-slate-200' },
  ];

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: title || 'درس جدید',
        type: selectedMediaType,
        isFree,
        duration: selectedMediaType === 'video' ? '۳۰ دقیقه' : selectedMediaType === 'audio' ? '۲۰ دقیقه' : 'فایل متنی',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <h2 className="font-black text-slate-800 text-base">افزودن درس جدید</h2>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">عنوان درس</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: مفهوم تدبر در قرآن و اصول استنباط" 
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition shadow-sm"
          />
        </div>

        {/* Free Content Toggle */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">پیش‌نمایش رایگان</h3>
            <p className="text-[10px] text-slate-400 mt-1">کاربران بدون ثبت‌نام هم می‌توانند این درس را ببینند</p>
          </div>
          {/* iOS Style Toggle */}
          <button 
            type="button"
            onClick={() => setIsFree(!isFree)}
            className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 px-1 ${isFree ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isFree ? '-translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Select Media Type (Grid) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-3">نوع محتوای درس را انتخاب کنید</label>
          <div className="grid grid-cols-3 gap-3">
            {mediaTypes.map((media) => {
              const isSelected = selectedMediaType === media.id;
              const Icon = media.icon;
              return (
                <button
                  type="button"
                  key={media.id}
                  onClick={() => setSelectedMediaType(media.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${media.bg} ${
                    isSelected ? `${media.activeBorder} shadow-sm scale-105` : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <Icon size={22} className={`${media.color} mb-2`} />
                  <span className="text-[10px] font-bold text-slate-700">{media.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Area (Simulated) */}
        <div
          onClick={() => setFileUploaded(!fileUploaded)}
          className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            fileUploaded
              ? 'border-emerald-400 bg-emerald-50/60'
              : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'
          }`}
        >
          {fileUploaded ? (
            <>
              <CheckCircle2 size={40} className="text-emerald-500 mb-3 animate-bounce" />
              <h3 className="text-sm font-bold text-emerald-900 mb-1">فایل با موفقیت انتخاب شد</h3>
              <p className="text-[11px] text-emerald-600 font-mono">darse_tadabbor_01.mp4 (45.2 MB)</p>
            </>
          ) : (
            <>
              <UploadCloud size={40} className="text-indigo-400 mb-3" />
              <h3 className="text-sm font-bold text-indigo-900 mb-1">فایل خود را اینجا آپلود کنید</h3>
              <p className="text-[11px] text-indigo-400">کلیک کنید یا فایل را بکشید و رها کنید (حداکثر ۵۰۰ مگابایت)</p>
            </>
          )}
        </div>
      </div>

      {/* Save Button Fixed at Bottom */}
      <div className="bg-white p-4 border-t border-slate-100">
        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all"
        >
          ذخیره و ثبت درس
        </button>
      </div>
    </div>
  );
}
