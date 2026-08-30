// src/components/manager/forms/CreateCourseForm.tsx
import React, { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Video, Plus, Trash2, CheckCircle2, Sparkles, Check } from 'lucide-react';

interface CreateCourseFormProps {
  onBack: () => void;
  onSave?: (courseData: any) => void;
}

export default function CreateCourseForm({ onBack, onSave }: CreateCourseFormProps) {
  // مدیریت تب‌های فعال
  const [activeTab, setActiveTab] = useState<'info' | 'showcase'>('info');

  // استیت‌های تب اول (اطلاعات دوره)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('fiqh');
  const [price, setPrice] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [status, setStatus] = useState<'draft' | 'publish'>('draft');
  const [supportId, setSupportId] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [purchasable, setPurchasable] = useState('true');
  const [coverFile, setCoverFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);

  // سوییچ‌های اختصاصی
  const [requireProfile, setRequireProfile] = useState(false);
  const [contentProtection, setContentProtection] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [limitDevices, setLimitDevices] = useState(false);

  // استیت‌های تب دوم (تنظیمات ویترین - لیست‌های پویا)
  const [squareCover, setSquareCover] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<string[]>(['']);
  const [targetAudience, setTargetAudience] = useState('');
  const [instructor, setInstructor] = useState('');
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [level, setLevel] = useState('مقدماتی');
  const [language, setLanguage] = useState('فارسی');
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);

  const [isSaved, setIsSaved] = useState(false);

  // توابع مدیریت لیست‌های پویا
  const addOutcome = () => setOutcomes([...outcomes, '']);
  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };
  const removeOutcome = (index: number) => setOutcomes(outcomes.filter((_, i) => i !== index));

  const addPrerequisite = () => setPrerequisites([...prerequisites, '']);
  const updatePrerequisite = (index: number, value: string) => {
    const newPrereq = [...prerequisites];
    newPrereq[index] = value;
    setPrerequisites(newPrereq);
  };
  const removePrerequisite = (index: number) => setPrerequisites(prerequisites.filter((_, i) => i !== index));

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleFormSubmit = () => {
    const coursePayload = {
      title: title || 'دوره آموزشی جدید',
      description,
      category,
      price,
      specialPrice,
      status,
      supportId,
      visibility,
      purchasable,
      requireProfile,
      contentProtection,
      showParticipants,
      limitDevices,
      outcomes: outcomes.filter(Boolean),
      targetAudience,
      instructor: instructor || 'استاد مدرسه عالی',
      prerequisites: prerequisites.filter(Boolean),
      level,
      language,
      faqs: faqs.filter((f) => f.question && f.answer)
    };

    setIsSaved(true);
    if (onSave) {
      onSave(coursePayload);
    }
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  // --- کامپوننت سوییچ سفارشی (Toggle) ---
  const CustomToggle = ({
    label,
    description,
    state,
    setState
  }: {
    label: string;
    description?: string;
    state: boolean;
    setState: (v: boolean) => void;
  }) => (
    <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 pl-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{label}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              state ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            ({state ? 'فعال' : 'غیرفعال'})
          </span>
        </div>
        {description && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setState(!state)}
        className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 px-1 flex-shrink-0 cursor-pointer ${
          state ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            state ? '-translate-x-6' : 'translate-x-0'
          }`}
        ></div>
      </button>
    </div>
  );

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
        <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-xl">
          نسخه پیشرفته
        </span>
      </div>

      {/* Save Notification */}
      {isSaved && (
        <div className="mx-4 mt-4 bg-emerald-600 text-white p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={18} />
          <span>دوره با تمامی مشخصات و تنظیمات ویترین با موفقیت ذخیره شد!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 py-4 bg-white border-b border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'info' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            اطلاعات دوره
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'showcase' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            تنظیمات ویترین
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 space-y-4">
        {/* ================= تب اول: اطلاعات دوره ================= */}
        {activeTab === 'info' && (
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
                  <option value="quran">انس با قرآن و نهج‌البلاغه</option>
                  <option value="fiqh">علوم حوزوی و فقه و اصول</option>
                  <option value="ethics">اخلاق و معارف اسلامی</option>
                  <option value="history">تاریخ و سیره اهل‌بیت (ع)</option>
                </select>
                <button
                  type="button"
                  className="absolute left-3 top-3 bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-xl font-bold"
                >
                  انتخاب
                </button>
              </div>
            </div>

            {/* Upload Cover */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">کاور دوره (تصویر عریض)</label>
              <div
                onClick={() => setCoverFile(coverFile ? null : 'cover_sample.jpg')}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition h-40 ${
                  coverFile
                    ? 'border-emerald-400 bg-emerald-50/60 text-emerald-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                }`}
              >
                {coverFile ? (
                  <>
                    <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                    <span className="text-xs font-bold">کاور با موفقیت پیوست شد (تغییر)</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={32} className="text-slate-300 mb-2" />
                    <span className="text-xs">کلیک کنید یا فایل تصویر را بکشید و رها کنید</span>
                  </>
                )}
              </div>
            </div>

            {/* Upload Video Preview */}
            <div
              onClick={() => setVideoFile(videoFile ? null : 'preview_sample.mp4')}
              className={`border border-slate-200 bg-white rounded-2xl p-4 flex items-center cursor-pointer hover:bg-slate-50 transition shadow-xs ${
                videoFile ? 'border-indigo-300 bg-indigo-50/50' : ''
              }`}
            >
              <Video size={20} className={videoFile ? 'text-indigo-600 ml-3' : 'text-slate-400 ml-3'} />
              <span className="text-xs text-slate-600 flex-1 font-bold">
                {videoFile ? 'ویدیو پیش‌نمایش متصل شد: preview.mp4' : 'ویدیو پیش‌نمایش دوره (اختیاری)'}
              </span>
              <ImageIcon size={18} className="text-slate-300" />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">قیمت دوره</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 shadow-xs">
                  <input
                    type="number"
                    placeholder="مثلاً: ۳۵۰۰۰۰"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1 py-3.5 text-sm outline-none text-slate-800"
                  />
                  <span className="text-xs text-slate-400">تومان</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">قیمت ویژه / تخفیف (اختیاری)</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 shadow-xs">
                  <input
                    type="number"
                    placeholder="مثلاً: ۲۸۰۰۰۰"
                    value={specialPrice}
                    onChange={(e) => setSpecialPrice(e.target.value)}
                    className="flex-1 py-3.5 text-sm outline-none text-slate-800"
                  />
                  <span className="text-xs text-slate-400">تومان</span>
                </div>
              </div>
            </div>

            {/* Publish Status */}
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
                    <div
                      className={`w-3 h-3 rounded-full ml-2 border-2 ${
                        status === 'publish' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}
                    ></div>{' '}
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
                    <div
                      className={`w-3 h-3 rounded-full ml-2 border-2 ${
                        status === 'draft' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}
                    ></div>{' '}
                    پیش‌نویس
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شناسه پشتیبان دوره در ایتا</label>
              <input
                type="text"
                placeholder="@username"
                value={supportId}
                onChange={(e) => setSupportId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none focus:border-indigo-400 transition shadow-xs text-left"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سطح دسترسی</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-2xl p-3.5 outline-none focus:border-indigo-400 transition shadow-xs"
                >
                  <option value="public">عمومی</option>
                  <option value="private">خصوصی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">امکان خرید</label>
                <select
                  value={purchasable}
                  onChange={(e) => setPurchasable(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-2xl p-3.5 outline-none focus:border-indigo-400 transition shadow-xs"
                >
                  <option value="true">قابل خرید</option>
                  <option value="false">غیرقابل خرید</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100 mt-2">
              <CustomToggle
                label="نیاز به تکمیل پروفایل برای خرید"
                state={requireProfile}
                setState={setRequireProfile}
              />
              <CustomToggle
                label="حفاظت از محتوا"
                description="با فعال کردن این مورد امکان رکورد ویدیو و تصویر از محتوای شما غیرفعال می‌شود."
                state={contentProtection}
                setState={setContentProtection}
              />
              <CustomToggle
                label="نمایش تعداد شرکت کنندگان"
                state={showParticipants}
                setState={setShowParticipants}
              />
              <CustomToggle
                label="محدود کردن تعداد دستگاه‌های قابل استفاده"
                state={limitDevices}
                setState={setLimitDevices}
              />
            </div>
          </div>
        )}

        {/* ================= تب دوم: تنظیمات ویترین ================= */}
        {activeTab === 'showcase' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <p className="text-[11px] text-slate-500 text-center bg-indigo-50/70 p-2.5 rounded-2xl border border-indigo-100/60">
              اطلاعاتی که خریدار پیش از پرداخت در ویترین و صفحه معرفی دوره می‌بیند.
            </p>

            {/* Square Cover */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">کاور مربعی ویترین</h3>
              <p className="text-[10px] text-slate-500 mb-3">
                تصویر مربعی (1:1) که روی کارت دوره در ویترین نمایش داده می‌شود. تصویر انتخابی همینجا برش می‌خورد.
              </p>
              <div
                onClick={() => setSquareCover(squareCover ? null : 'square_cover.jpg')}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition h-44 w-44 mx-auto ${
                  squareCover
                    ? 'border-indigo-400 bg-indigo-50/60 text-indigo-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-400'
                }`}
              >
                {squareCover ? (
                  <>
                    <CheckCircle2 size={28} className="text-indigo-600 mb-1.5" />
                    <span className="text-[11px] font-bold">کاور مربعی متصل شد</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={30} className="text-slate-300 mb-2" />
                    <span className="text-xs">کاور مربعی ویترین</span>
                  </>
                )}
              </div>
            </div>

            {/* Dynamic List: Learning Outcomes */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-1">چه چیزهایی در این دوره یاد می‌گیرید</h3>
              <p className="text-[10px] text-slate-500 mb-3.5 leading-relaxed">
                مهم‌ترین بخشی که خریدار می‌خواند. هر دستاورد را در یک جمله ساده بنویسید؛ ترتیبی که وارد می‌کنید همان ترتیب
                نمایش است.
              </p>

              <div className="space-y-2.5">
                {outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => updateOutcome(index, e.target.value)}
                      placeholder="مثلاً: تسلط بر قواعد روخوانی و روان‌خوانی..."
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-indigo-400"
                    />
                    {outcomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOutcome}
                  className="w-full py-2.5 border border-dashed border-indigo-300 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-indigo-50 transition mt-1 gap-1"
                >
                  <Plus size={15} /> افزودن دستاورد
                </button>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                این دوره مناسب چه کسانی است <span className="text-[10px] font-normal text-slate-400">(اختیاری)</span>
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثلاً: طلاب پایه‌های ۱ تا ۳ و دانشجویان الهیات"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-2xl p-4 outline-none focus:border-indigo-400 shadow-xs"
                />
                <button
                  type="button"
                  className="absolute left-3 top-3 bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-xl font-bold"
                >
                  انتخاب
                </button>
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">مدرس دوره</h3>
              <p className="text-[10px] text-slate-500 mb-2">برای انتشار در ویترین دست‌کم یک مدرس لازم است.</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="نام و عنوان علمی استاد مدرس"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs rounded-2xl p-4 outline-none focus:border-indigo-400 shadow-xs"
                />
                <button
                  type="button"
                  className="absolute left-3 top-3 bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-xl font-bold"
                >
                  انتخاب
                </button>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                پیش‌نیازهای دوره <span className="text-[10px] font-normal text-slate-400">(اختیاری)</span>
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">اگر دوره پیش‌نیازی ندارد، این بخش را خالی بگذارید.</p>
              <div className="space-y-2.5">
                {prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prereq}
                      onChange={(e) => updatePrerequisite(index, e.target.value)}
                      placeholder="مثلاً: گذراندن دوره نحو مقدماتی..."
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-indigo-400"
                    />
                    {prerequisites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        className="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="w-full py-2.5 border border-dashed border-indigo-300 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-indigo-50 transition mt-1 gap-1"
                >
                  <Plus size={15} /> افزودن پیش‌نیاز
                </button>
              </div>
            </div>

            {/* Level and Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-1.5">سطح دوره</h3>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-2xl p-3.5 outline-none shadow-xs"
                >
                  <option value="مقدماتی">مقدماتی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-1.5">زبان دوره</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-2xl p-3.5 outline-none shadow-xs"
                >
                  <option value="فارسی">فارسی</option>
                  <option value="عربی">عربی</option>
                </select>
              </div>
            </div>

            {/* Dynamic List: FAQs */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                پرسش‌های پرتکرار <span className="text-[10px] font-normal text-slate-400">(اختیاری)</span>
              </h3>
              <p className="text-[10px] text-slate-500 mb-3.5">سوال‌هایی که خریداران معمولاً می‌پرسند را همینجا پاسخ دهید.</p>

              <div className="space-y-3 mb-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 relative">
                    <input
                      type="text"
                      placeholder="سوال (مثلاً: آیا این دوره گواهینامه معتبر دارد؟)"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      className="w-full bg-transparent text-xs mb-2 outline-none font-bold text-slate-800 pr-1"
                    />
                    <div className="h-px w-full bg-slate-200 mb-2"></div>
                    <textarea
                      placeholder="پاسخ کوتاه و شفاف..."
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      rows={2}
                      className="w-full bg-transparent text-xs outline-none text-slate-600 resize-none pr-1"
                    />
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="absolute left-2 top-2 p-1.5 text-rose-400 hover:bg-rose-100 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="w-full py-2.5 border border-dashed border-indigo-300 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-indigo-50 transition gap-1"
              >
                <Plus size={15} /> افزودن پرسش
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-100 z-30 max-w-md mx-auto">
        <button
          type="button"
          onClick={handleFormSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          <Check size={18} />
          <span>تایید و ذخیره دوره</span>
        </button>
      </div>
    </div>
  );
}
