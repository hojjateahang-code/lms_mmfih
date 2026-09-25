// src/components/manager/forms/CreateCourseForm.tsx
import React, { useState, useRef } from 'react';
import { ArrowRight, Image as ImageIcon, Video, Plus, Trash2, CheckCircle2, Check, Loader2 } from 'lucide-react';
import { createCourse } from '../../../services/courseService';
import { uploadFile } from '../../../services/uploadService';
import { useAuth } from '../../../contexts/AuthContext';

interface CreateCourseFormProps {
  onBack: () => void;
  onSave?: (courseData: any) => void;
}

export default function CreateCourseForm({ onBack, onSave }: CreateCourseFormProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'showcase'>('info');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('انس با قرآن');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'draft' | 'publish'>('draft');
  
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const res = await uploadFile(file, 'course_covers', (progress) => {
      setUploadProgress(progress);
    });

    setUploading(false);
    if (res.success && res.url) {
      setCoverUrl(res.url);
    } else {
      alert('خطا در آپلود فایل');
    }
  };

  const handleFormSubmit = async () => {
    if (!user) return alert('شما وارد نشده‌اید.');
    if (!title) return alert('لطفاً عنوان دوره را وارد کنید.');

    setLoading(true);
    const coursePayload = {
      instructor_id: user.id,
      title,
      description,
      category,
      price: price ? parseInt(price) : 0,
      is_published: status === 'publish',
      cover_url: coverUrl || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop'
    };

    const res = await createCourse(coursePayload);
    setLoading(false);

    if (res.success) {
      setIsSaved(true);
      if (onSave) {
        onSave(res.data);
      }
      setTimeout(() => {
        onBack();
      }, 1200);
    } else {
      alert('خطا در ذخیره دوره: ' + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition ml-2 text-slate-800"
          >
            <ArrowRight size={22} />
          </button>
          <h1 className="font-black text-slate-800 text-base">ایجاد دوره جدید</h1>
        </div>
      </div>

      {/* Save Notification */}
      {isSaved && (
        <div className="mx-4 mt-4 bg-emerald-600 text-white p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={18} />
          <span>دوره با موفقیت ذخیره شد!</span>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-4">
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان دوره</label>
            <input
              type="text"
              placeholder="عنوان دوره را وارد کنید..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none focus:border-indigo-400 transition shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات دوره</label>
            <textarea
              rows={4}
              placeholder="شرح و اهداف آموزشی دوره..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none focus:border-indigo-400 transition resize-none shadow-xs"
            ></textarea>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1">دسته‌بندی موضوعی</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-2xl p-4 outline-none appearance-none focus:border-indigo-400 transition shadow-xs"
              >
                <option value="انس با قرآن">انس با قرآن و نهج‌البلاغه</option>
                <option value="فقه و اصول">علوم حوزوی و فقه و اصول</option>
                <option value="اخلاق">اخلاق و معارف اسلامی</option>
                <option value="تاریخ">تاریخ و سیره اهل‌بیت (ع)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">کاور دوره</label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition h-40 overflow-hidden relative ${
                coverUrl
                  ? 'border-indigo-400 bg-indigo-50/60'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-indigo-500 mb-2" size={32} />
                  <span className="text-xs font-bold text-slate-600">در حال آپلود ({uploadProgress}%)</span>
                </div>
              ) : coverUrl ? (
                <>
                  <img src={coverUrl} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <CheckCircle2 size={32} className="text-indigo-600 mb-2 relative z-10" />
                  <span className="text-xs font-bold text-indigo-900 relative z-10 bg-white/80 px-2 py-1 rounded-md">تغییر کاور</span>
                </>
              ) : (
                <>
                  <ImageIcon size={32} className="text-slate-300 mb-2" />
                  <span className="text-xs">کلیک کنید یا تصویر را انتخاب کنید</span>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">قیمت دوره</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 shadow-xs">
              <input
                type="number"
                placeholder="مثلاً: ۳۵۰۰۰۰ (۰ برای رایگان)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 py-3.5 text-sm outline-none text-slate-800"
              />
              <span className="text-xs text-slate-400">تومان</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وضعیت انتشار</label>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
              <div className="flex flex-1 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('publish')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center border transition ${
                    status === 'publish'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  انتشار عمومی
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center border transition ${
                    status === 'draft'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'border-transparent text-slate-500'
                  }`}
                >
                  پیش‌نویس
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Submit Button */}
      <div className="relative pb-24 pt-4 px-4 bg-white z-30">
        <button
          type="button"
          disabled={loading}
          onClick={handleFormSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          <span>{loading ? 'در حال ذخیره...' : 'تایید و ذخیره دوره'}</span>
        </button>
      </div>
    </div>
  );
}
