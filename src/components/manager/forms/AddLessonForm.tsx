// src/components/manager/forms/AddLessonForm.tsx
import React, { useState, useRef } from 'react';
import { X, Video, Image as ImageIcon, Music, FileText, Type, UploadCloud, CheckCircle2, Loader2, FileCheck } from 'lucide-react';
import { uploadFile } from '../../../services/uploadService';

interface AddLessonFormProps {
  onClose: () => void;
  onSave?: (lessonData: any) => void;
  initialData?: {
    id?: number;
    title?: string;
    type?: string;
    duration?: string;
    isFree?: boolean;
    videoUrl?: string;
    fileUrl?: string;
  } | null;
}

export default function AddLessonForm({ onClose, onSave, initialData }: AddLessonFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [isFree, setIsFree] = useState(initialData?.isFree || false);
  const [selectedMediaType, setSelectedMediaType] = useState(initialData?.type || 'video');
  const [duration, setDuration] = useState(initialData?.duration || '۳۰ دقیقه');
  
  // Real Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(initialData?.videoUrl || initialData?.fileUrl || '');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [fileSizeText, setFileSizeText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaTypes = [
    { id: 'video', icon: Video, label: 'ویدیو', color: 'text-blue-500', bg: 'bg-blue-50', activeBorder: 'border-blue-400 ring-2 ring-blue-100', accept: 'video/*' },
    { id: 'audio', icon: Music, label: 'صوت', color: 'text-amber-500', bg: 'bg-amber-50', activeBorder: 'border-amber-400 ring-2 ring-amber-100', accept: 'audio/*' },
    { id: 'pdf', icon: FileText, label: 'فایل (PDF)', color: 'text-rose-500', bg: 'bg-rose-50', activeBorder: 'border-rose-400 ring-2 ring-rose-100', accept: '.pdf,.doc,.docx' },
    { id: 'image', icon: ImageIcon, label: 'تصویر', color: 'text-emerald-500', bg: 'bg-emerald-50', activeBorder: 'border-emerald-400 ring-2 ring-emerald-100', accept: 'image/*' },
    { id: 'text', icon: Type, label: 'متن ساده', color: 'text-slate-600', bg: 'bg-slate-100', activeBorder: 'border-slate-400 ring-2 ring-slate-200', accept: '*' },
  ];

  const currentMedia = mediaTypes.find(m => m.id === selectedMediaType) || mediaTypes[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeText(`${sizeMb} مگابایت`);
    setIsUploading(true);
    setUploadProgress(10);

    const res = await uploadFile(file, 'lessons', (p) => setUploadProgress(p));
    setIsUploading(false);

    if (res.success && res.url) {
      setUploadedFileUrl(res.url);
      setUploadedFileName(res.fileName || file.name);
    } else {
      alert('خطا در بارگذاری فایل: ' + (res.error || 'ناشناخته'));
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      return alert('لطفاً عنوان درس را وارد کنید');
    }

    if (onSave) {
      onSave({
        title: title.trim(),
        type: selectedMediaType,
        isFree,
        duration: duration || '۳۰ دقیقه',
        video_url: selectedMediaType === 'video' ? uploadedFileUrl : '',
        file_url: uploadedFileUrl,
        content: contentText.trim(),
      });
    }
    onClose();
  };

  const [contentText, setContentText] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300 max-w-md mx-auto shadow-2xl" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        <div>
          <h2 className="font-black text-slate-800 text-base">افزودن و بارگذاری محتوای درس</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">ثبت قطعی در دیتابیس سامانه و سرور لینوکس</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-8">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">عنوان درس *</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: جلسه اول: آشنایی با مبانی و سرفصل‌ها" 
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-sm font-bold"
          />
        </div>

        {/* Duration Input */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">مدت زمان تقریبی</label>
          <input 
            type="text" 
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="مثلاً: ۳۵ دقیقه" 
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Free Content Toggle */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-800">پیش‌نمایش رایگان (بدون نیاز به ثبت‌نام)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">دانش‌پژوهان می‌توانند قبل از ثبت‌نام این درس را مشاهده کنند</p>
          </div>
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
          <label className="block text-xs font-bold text-slate-600 mb-2">نوع محتوای آموزشی</label>
          <div className="grid grid-cols-3 gap-2.5">
            {mediaTypes.map((media) => {
              const isSelected = selectedMediaType === media.id;
              const Icon = media.icon;
              return (
                <button
                  type="button"
                  key={media.id}
                  onClick={() => setSelectedMediaType(media.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${media.bg} ${
                    isSelected ? `${media.activeBorder} shadow-sm scale-102` : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <Icon size={20} className={`${media.color} mb-1.5`} />
                  <span className="text-[10px] font-bold text-slate-700">{media.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* REAL Upload Area */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">بارگذاری فایل واقعی از دستگاه (ویدیو، صوت، جزوه PDF)</label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={currentMedia.accept}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
              uploadedFileUrl
                ? 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                : 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            {isUploading ? (
              <div className="py-2 space-y-2">
                <Loader2 size={36} className="text-indigo-600 animate-spin mx-auto" />
                <div className="text-xs font-black text-indigo-900">در حال آپلود روی سرور... ({uploadProgress}٪)</div>
                <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden mx-auto">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : uploadedFileUrl ? (
              <>
                <CheckCircle2 size={32} className="text-emerald-500 mb-2 animate-bounce" />
                <h3 className="text-xs font-black text-emerald-950 mb-0.5">فایل واقعی با موفقیت آماده و متصل شد</h3>
                <p className="text-[10px] text-emerald-700 font-mono break-all line-clamp-2">{uploadedFileName || uploadedFileUrl} {fileSizeText ? `(${fileSizeText})` : ''}</p>
                <span className="text-[10px] text-slate-500 mt-2 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                  برای تعویض فایل کلیک کنید
                </span>
              </>
            ) : (
              <>
                <UploadCloud size={32} className="text-indigo-500 mb-1.5" />
                <h3 className="text-xs font-black text-indigo-950 mb-0.5">انتخاب و آپلود فایل از کامپیوتر یا گوشی</h3>
                <p className="text-[10px] text-slate-500">فایل در پوشه سرور ذخیره می‌شود</p>
                <span className="mt-2 inline-block bg-white text-indigo-700 font-bold text-[10px] px-3 py-1 rounded-xl shadow-xs border border-indigo-100">
                  انتخاب فایل ({currentMedia.label})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Or Direct Link / URL Input */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">یا وارد کردن آدرس / لینک مستقیم فایل (اختیاری)</label>
          <input
            type="url"
            value={uploadedFileUrl.startsWith('data:') ? '' : uploadedFileUrl}
            onChange={(e) => setUploadedFileUrl(e.target.value)}
            placeholder="مثلاً: https://example.com/video.mp4 یا لینک آپارات"
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-2xl p-3 outline-none focus:border-indigo-500 font-mono"
            dir="ltr"
          />
          <p className="text-[10px] text-slate-400 mt-1">می‌توانید به جای آپلود، لینک مستقیم ویدیو یا صوت را اینجا قرار دهید.</p>
        </div>

        {/* Lesson Text / Content */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">متن درس یا توضیحات تکمیلی (اختیاری)</label>
          <textarea
            rows={3}
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="متن خلاصه درس، تکالیف یا منابع مطالعاتی را اینجا یادداشت کنید..."
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-2xl p-3 outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
          />
        </div>
      </div>

      {/* Save Button Elevated at Bottom (Sticky inside modal - 100% visible & clickable) */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 pb-6 border-t border-slate-200 shadow-2xl z-30 mt-auto">
        <button
          onClick={handleSave}
          disabled={isUploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileCheck size={18} />
          {isUploading ? 'در حال آپلود...' : 'ذخیره و ثبت نهایی درس'}
        </button>
      </div>
    </div>
  );
}
