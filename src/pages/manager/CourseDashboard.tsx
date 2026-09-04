// src/pages/manager/CourseDashboard.tsx
import React, { useState } from 'react';
import {
  ChevronRight,
  Plus,
  FileText,
  Video,
  HelpCircle,
  Award,
  MoreVertical,
  LayoutGrid,
  Calendar,
  Settings,
  Clock,
  Trash2,
  Edit,
  Edit2,
  Edit3,
  CheckCircle2,
  Radio,
  Users,
  X
} from 'lucide-react';
import AddLessonForm from '../../components/manager/forms/AddLessonForm';
import AddQuizForm from '../../components/manager/forms/AddQuizForm';
import AddCertificateForm from '../../components/manager/forms/AddCertificateForm';

interface CourseDashboardProps {
  courseId?: number;
  onBack: () => void;
}

export default function CourseDashboard({ courseId = 1, onBack }: CourseDashboardProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'classes' | 'settings'>('sessions');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [modalType, setModalType] = useState<'lesson' | 'quiz' | 'certificate' | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // استیت‌های اتصال به دیتابیس
  const [sessions, setSessions] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);

  // استیت برای باز و بسته کردن منوی سه نقطه سرفصل‌ها
  const [openSessionMenu, setOpenSessionMenu] = useState<number | null>(null);

  // استیت برای باز کردن فرم ویرایش درس
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingLessonData, setEditingLessonData] = useState<any>(null);

  // استیت ویرایش و ایجاد سرفصل
  const [editingChapterModal, setEditingChapterModal] = useState<{ id: number; title: string } | null>(null);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Form states for modals
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [certificateTitle, setCertificateTitle] = useState('گواهی رسمی پایان دوره فقه و معارف قرآن');

  // Online Classes (هنوز آفلاین/Mock)
  const [onlineClasses, setOnlineClasses] = useState([
    {
      id: 1,
      title: 'جلسه رفع اشکال و مباحثه زنده (Live)',
      date: 'پنج‌شنبه ۱۲ اسفند - ساعت ۱۸:۳۰',
      instructor: 'استاد مکارم شیرازی',
      status: 'برنامه‌ریزی شده'
    }
  ]);

  // --- Supabase Data Fetching ---
  const fetchContent = async () => {
    setIsLoading(true);
    const { supabase } = await import('../../lib/supabase');
    const { getCourseContent, getCourseDetails } = await import('../../services/courseService');
    const courseRes = await getCourseDetails(courseId);
    if (courseRes.success) setCourse(courseRes.data);
    const res = await getCourseContent(courseId);
    if (res.success && res.data) {
      setSessions(res.data);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchContent();
  }, [courseId]);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // --- Handlers متصل به دیتابیس ---
  const handleSaveChapterEdit = async () => {
    if (editingChapterModal) {
      const { updateChapter } = await import('../../services/courseService');
      const res = await updateChapter(editingChapterModal.id, editingChapterModal.title);
      if (res.success) {
        triggerSuccess(`عنوان فصل با موفقیت به «${editingChapterModal.title}» ویرایش شد.`);
        setEditingChapterModal(null);
        fetchContent();
      }
    }
  };

  const handleCreateNewChapter = async () => {
    if (newChapterTitle.trim()) {
      const { createChapter } = await import('../../services/courseService');
      const res = await createChapter(courseId, newChapterTitle.trim(), sessions.length + 1);
      if (res.success) {
        triggerSuccess(`فصل جدید «${newChapterTitle.trim()}» ایجاد گردید.`);
        setNewChapterTitle('');
        setShowAddChapterModal(false);
        fetchContent();
      }
    }
  };

  const handleDeleteChapter = async (chapterId: number, title: string) => {
    const { deleteChapter } = await import('../../services/courseService');
    const res = await deleteChapter(chapterId);
    if (res.success) {
      triggerSuccess(`فصل «${title}» حذف گردید.`);
      setOpenSessionMenu(null);
      fetchContent();
    }
  };

  const handleDeleteLesson = async (lessonId: number, title: string) => {
    const { deleteLesson } = await import('../../services/courseService');
    const res = await deleteLesson(lessonId);
    if (res.success) {
      triggerSuccess(`درس «${title}» حذف شد.`);
      fetchContent();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm mb-4 sticky top-0 z-20 flex items-center border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-2 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl text-slate-700 ml-3 transition-all"
        >
          <ChevronRight size={20} />
        </button>
        <div className="flex-grow min-w-0">
          <h1 className="font-black text-slate-800 text-sm leading-snug line-clamp-1">
            دوره تخصصی انس با معارف قرآنی
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">داشبورد مدیریت محتوا و آزمون‌ها</p>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="mx-4 mb-4 bg-emerald-600 text-white p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Modern Tabs */}
      <div className="px-4 mb-5">
        <div className="flex bg-slate-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'sessions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            جلسات (آفلاین)
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'classes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            کلاس‌ها (آنلاین)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            تنظیمات دوره
          </button>
        </div>
      </div>

      {/* Sessions Tab Content (Offline) */}
      {activeTab === 'sessions' && (
        <div className="px-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <LayoutGrid size={15} className="text-indigo-600" /> سرفصل‌ها و محتوای ضبط‌شده
            </h2>
            <button
              onClick={() => setShowAddChapterModal(true)}
              className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> افزودن سرفصل
            </button>
          </div>

          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">{session.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{session.items.length} درس و آیتم فعال</p>
                </div>

                {/* دکمه سه نقطه و منوی کشویی سرفصل */}
                <div className="relative">
                  <button
                    onClick={() => setOpenSessionMenu(openSessionMenu === session.id ? null : session.id)}
                    className="p-1.5 text-slate-400 bg-slate-50 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* منوی پاپ‌آپ (Dropdown) */}
                  {openSessionMenu === session.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenSessionMenu(null)}
                      />
                      <div className="absolute top-9 left-0 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <button
                          onClick={() => {
                            setOpenSessionMenu(null);
                            setEditingChapterModal({ id: session.id, title: session.title });
                          }}
                          className="w-full text-right px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                        >
                          <Edit size={14} className="text-amber-500" /> ویرایش فصل
                        </button>
                        <div className="h-px bg-slate-100 my-1 mx-2"></div>
                        <button
                          onClick={() => handleDeleteChapter(session.id, session.title)}
                          className="w-full text-right px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                        >
                          <Trash2 size={14} /> حذف فصل
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Items List inside session */}
              <div className="space-y-2 pt-1">
                {session.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          item.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {item.type === 'video' ? <Video size={14} /> : <HelpCircle size={14} />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px] leading-tight">{item.title}</span>
                        <span className="text-[9px] text-slate-400">{item.duration_minutes} دقیقه</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      {/* دکمه ویرایش درس */}
                      <button
                        onClick={() => {
                          setEditingLessonId(item.id);
                          setEditingLessonData({
                            id: item.id,
                            title: item.title,
                            type: item.type,
                            duration: item.duration_minutes ? `${item.duration_minutes} دقیقه` : '۳۰ دقیقه',
                            isFree: item.is_free || false
                          });
                          setModalType('lesson');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg transition"
                        title="ویرایش درس"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* دکمه حذف درس */}
                      <button
                        onClick={() => handleDeleteLesson(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg transition"
                        title="حذف درس"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button for this session */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveChapterId(session.id);
                    setShowAddMenu(true);
                  }}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 active:scale-98 text-indigo-600 rounded-2xl text-xs font-bold flex items-center justify-center transition gap-1"
                >
                  <Plus size={14} /> افزودن محتوا (درس، آزمون، گواهی)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Online Classes Tab */}
      {activeTab === 'classes' && (
        <div className="px-4 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <Radio size={15} className="text-rose-500 animate-pulse" /> کلاس‌های برخط و وبینارها
            </h2>
            <button
              onClick={() => triggerSuccess('فرم ایجاد کلاس آنلاین باز شد.')}
              className="bg-indigo-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
            >
              <Plus size={12} /> کلاس جدید
            </button>
          </div>

          <div className="space-y-3">
            {onlineClasses.map((cls) => (
              <div key={cls.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">{cls.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                      <Calendar size={11} className="text-indigo-500" />
                      <span>{cls.date}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-lg border border-rose-100">
                    {cls.status}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-500">مدرس: {cls.instructor}</span>
                  <button className="bg-indigo-50 text-indigo-600 font-black text-[10px] px-3 py-1.5 rounded-xl hover:bg-indigo-100">
                    ورود به اتاق جلسه
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Settings Tab */}
      {activeTab === 'settings' && (
        <div className="px-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <h3 className="font-bold text-slate-800 text-xs">تنظیمات اصلی دوره</h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">عنوان دوره</label>
              <input
                type="text"
                defaultValue={course?.title || ''}
                className="w-full bg-slate-50 p-2.5 rounded-2xl text-xs border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">وضعیت انتشار</label>
              <select className="w-full bg-slate-50 p-2.5 rounded-2xl text-xs border border-slate-200 outline-none">
                <option value="active">فعال و در دسترس طلاب</option>
                <option value="registering">در حال پیش‌ثبت‌نام</option>
                <option value="draft">پیش‌نویس (مخفی)</option>
              </select>
            </div>

            <button
              onClick={() => triggerSuccess('تغییرات با موفقیت ذخیره شد.')}
              className="w-full bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md shadow-indigo-100 mt-2"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>
      )}

      {/* Modal: Edit Chapter Title */}
      {editingChapterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-800">ویرایش عنوان فصل</h3>
              <button
                onClick={() => setEditingChapterModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان فصل</label>
              <input
                type="text"
                value={editingChapterModal.title}
                onChange={(e) =>
                  setEditingChapterModal({ ...editingChapterModal, title: e.target.value })
                }
                className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveChapterEdit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md shadow-indigo-100"
              >
                ذخیره تغییرات
              </button>
              <button
                onClick={() => setEditingChapterModal(null)}
                className="px-4 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-2xl"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Chapter */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-800">افزودن فصل / سرفصل جدید</h3>
              <button
                onClick={() => setShowAddChapterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان سرفصل</label>
              <input
                type="text"
                placeholder="مثلاً: فصل سوم: بررسی تطبیقی احکام"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full bg-slate-50 text-xs p-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 font-bold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreateNewChapter}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-2xl shadow-md shadow-indigo-100"
              >
                افزودن فصل
              </button>
              <button
                onClick={() => setShowAddChapterModal(false)}
                className="px-4 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-2xl"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Menu for "Add Content" */}
      {showAddMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setShowAddMenu(false)}
          />

          {/* Menu */}
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[2.5rem] p-6 z-50 shadow-2xl border-t border-slate-100 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
            <h3 className="text-center font-black text-slate-800 mb-1 text-base">انتخاب نوع محتوا</h3>
            <p className="text-center text-xs text-slate-400 mb-6">محتوای جدیدی را به دوره اضافه کنید</p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  setEditingLessonId(null);
                  setEditingLessonData(null);
                  setModalType('lesson');
                }}
                className="flex flex-col items-center p-3.5 bg-blue-50/80 hover:bg-blue-100 active:scale-95 rounded-3xl transition-all border border-blue-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-2 shadow-inner">
                  <Video size={22} />
                </div>
                <span className="text-xs font-bold text-slate-700">افزودن درس</span>
              </button>

              <button
                onClick={() => {
                  setShowAddMenu(false);
                  setModalType('quiz');
                }}
                className="flex flex-col items-center p-3.5 bg-amber-50/80 hover:bg-amber-100 active:scale-95 rounded-3xl transition-all border border-amber-100"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-2 shadow-inner">
                  <HelpCircle size={22} />
                </div>
                <span className="text-xs font-bold text-slate-700">آزمون جامع</span>
              </button>

              <button
                onClick={() => {
                  setShowAddMenu(false);
                  setModalType('certificate');
                }}
                className="flex flex-col items-center p-3.5 bg-emerald-50/80 hover:bg-emerald-100 active:scale-95 rounded-3xl transition-all border border-emerald-100"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-2 shadow-inner">
                  <Award size={22} />
                </div>
                <span className="text-xs font-bold text-slate-700">صدور گواهی</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Advanced Form: Add/Edit Lesson */}
      {modalType === 'lesson' && (
        <AddLessonForm
          onClose={() => {
            setModalType(null);
            setEditingLessonId(null);
            setEditingLessonData(null);
          }}
          initialData={editingLessonData}
          onSave={async (lessonData) => {
            const { createLesson, updateLesson } = await import('../../services/courseService');
            
            if (editingLessonId) {
              const res = await updateLesson(editingLessonId, {
                title: lessonData.title,
                type: lessonData.type as any || 'video',
                duration_minutes: parseInt(lessonData.duration.split(' ')[0]) || 30
              });
              if (res.success) {
                triggerSuccess(`درس «${lessonData.title}» با موفقیت به‌روزرسانی شد.`);
              }
            } else if (activeChapterId) {
              const res = await createLesson({
                chapter_id: activeChapterId,
                title: lessonData.title,
                type: lessonData.type as any || 'video',
                duration_minutes: parseInt(lessonData.duration.split(' ')[0]) || 30,
                is_free: false,
                order_num: 0
              });
              if (res.success) {
                triggerSuccess(`درس «${lessonData.title}» با موفقیت اضافه شد.`);
              }
            }
            
            setModalType(null);
            setEditingLessonId(null);
            setEditingLessonData(null);
            fetchContent();
          }}
        />
      )}

      {/* Advanced Form: Add Quiz */}
      {modalType === 'quiz' && (
        <AddQuizForm
          onClose={() => setModalType(null)}
          onSave={async (quizData) => {
            if (activeChapterId) {
              const { createLesson } = await import('../../services/courseService');
              const res = await createLesson({
                chapter_id: activeChapterId,
                title: quizData.title,
                type: 'quiz',
                duration_minutes: parseInt(quizData.duration) || 30,
                is_free: false,
                order_num: 0
              });
              if (res.success) {
                triggerSuccess(`آزمون «${quizData.title}» با موفقیت ثبت شد.`);
                fetchContent();
              }
            }
            setModalType(null);
          }}
        />
      )}

      {/* Advanced Form: Add Certificate */}
      {modalType === 'certificate' && (
        <AddCertificateForm
          onClose={() => setModalType(null)}
          onSave={async (certData) => {
            if (activeChapterId) {
              const { createLesson } = await import('../../services/courseService');
              const res = await createLesson({
                chapter_id: activeChapterId,
                title: certData.certTitle,
                type: 'certificate',
                duration_minutes: 0,
                is_free: false,
                order_num: 0
              });
              if (res.success) {
                triggerSuccess(`تنظیمات «${certData.certTitle}» با موفقیت فعال شد.`);
                fetchContent();
              }
            }
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}
