import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Plus, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Award, 
  Users, 
  FileCheck,
  Edit2,
  Copy,
  Sparkles,
  Database,
  Filter,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  BookOpen,
  Shuffle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Exam, ExamQuestion, ExamSubmission, QuestionBankItem, QuestionDifficulty } from '../../types';
import { 
  getCourseExams, 
  createExam, 
  updateExam, 
  duplicateExam, 
  deleteExam, 
  getCourseSubmissions, 
  getQuestionBank, 
  addQuestionToBank, 
  deleteQuestionFromBank, 
  autoGenerateExamFromBank 
} from '../../services/lmsService';

interface ExamManagerModalProps {
  courseId: number;
  courseTitle: string;
  onClose: () => void;
}

export default function ExamManagerModal({
  courseId,
  courseTitle,
  onClose
}: ExamManagerModalProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'exams' | 'create_exam' | 'auto_generator' | 'question_bank' | 'results'>('exams');
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);
  const [bankQuestions, setBankQuestions] = useState<QuestionBankItem[]>([]);

  // Editing state
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Manual Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('20');
  const [passingScore, setPassingScore] = useState('12');
  const [maxAttempts, setMaxAttempts] = useState('2');
  const [saveToBank, setSaveToBank] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: 'q_new_1',
      type: 'multiple_choice',
      question: 'عنوان سوال نمونه',
      options: ['گزینه ۱ (پاسخ صحیح)', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'],
      correct_index: 0,
      difficulty: 'medium',
      tag: 'مفاهیم پایه',
      score: 5
    }
  ]);

  // Auto-Generator Form States
  const [autoTitle, setAutoTitle] = useState('');
  const [autoEasyCount, setAutoEasyCount] = useState('2');
  const [autoMediumCount, setAutoMediumCount] = useState('2');
  const [autoHardCount, setAutoHardCount] = useState('1');
  const [autoDuration, setAutoDuration] = useState('25');
  const [autoRandomPerStudent, setAutoRandomPerStudent] = useState(true);

  // Question Bank Filter & Add Form States
  const [bankSearch, setBankSearch] = useState('');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [bankTypeFilter, setBankTypeFilter] = useState<'all' | 'multiple_choice' | 'descriptive'>('all');
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankQ, setNewBankQ] = useState<Partial<QuestionBankItem>>({
    type: 'multiple_choice',
    difficulty: 'medium',
    question: '',
    options: ['', '', '', ''],
    correct_index: 0,
    sample_answer: '',
    score: 5,
    tag: 'مفاهیم'
  });

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    const [list, subs, bank] = await Promise.all([
      getCourseExams(courseId),
      getCourseSubmissions(courseId),
      getQuestionBank({ course_id: courseId })
    ]);
    setExams(list);
    setSubmissions(subs);
    setBankQuestions(bank);
  };

  // Switch to Edit Mode
  const handleStartEditExam = (exam: Exam) => {
    setEditingExamId(exam.id);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setDuration(String(exam.duration_minutes || 20));
    setPassingScore(String(exam.passing_score || 12));
    setMaxAttempts(String(exam.max_attempts ?? 2));
    setRandomizeOptions(exam.randomize_options ?? true);
    setQuestions(
      (exam.questions || []).map((q, idx) => ({
        ...q,
        id: q.id || `q_edit_${idx}`,
        difficulty: q.difficulty || 'medium',
        tag: q.tag || 'عمومی',
      }))
    );
    setActiveTab('create_exam');
  };

  // Reset Manual Form
  const resetManualForm = () => {
    setEditingExamId(null);
    setTitle('');
    setDescription('');
    setDuration('20');
    setPassingScore('12');
    setMaxAttempts('2');
    setSaveToBank(true);
    setRandomizeOptions(true);
    setQuestions([
      {
        id: `q_new_${Date.now()}`,
        type: 'multiple_choice',
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        difficulty: 'medium',
        tag: 'عمومی',
        score: 5
      }
    ]);
  };

  // Duplicate Exam
  const handleDuplicate = async (examId: string) => {
    const res = await duplicateExam(examId);
    if (res.success && res.data) {
      setExams([res.data, ...exams]);
      alert('آزمون با موفقیت تکثیر و در لیست افزوده شد.');
    } else {
      alert(res.error || 'خطا در تکثیر آزمون');
    }
  };

  // Delete Exam
  const handleDelete = async (examId: string) => {
    if (!window.confirm('آیا از حذف این آزمون اطمینان دارید؟')) return;
    const res = await deleteExam(examId);
    if (res.success) {
      setExams(exams.filter(e => e.id !== examId));
    } else {
      alert(res.error || 'خطا در حذف آزمون');
    }
  };

  // Add Question in Manual Form
  const handleAddQuestion = (type: 'multiple_choice' | 'descriptive' = 'multiple_choice') => {
    setQuestions([
      ...questions,
      {
        id: `q_new_${Date.now()}`,
        type,
        question: '',
        options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
        correct_index: type === 'multiple_choice' ? 0 : undefined,
        sample_answer: type === 'descriptive' ? '' : undefined,
        difficulty: 'medium',
        tag: 'مفاهیم',
        score: 5
      }
    ]);
  };

  // Manual Form Submission
  const handleSaveExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('لطفاً عنوان آزمون را وارد کنید');

    const totalScore = questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);

    const examData = {
      course_id: courseId,
      title,
      description,
      duration_minutes: parseInt(duration, 10) || 20,
      passing_score: parseFloat(passingScore) || 12,
      total_score: totalScore || 20,
      max_attempts: parseInt(maxAttempts, 10) || 0,
      questions,
      randomize_options: randomizeOptions,
      is_active: true,
      save_to_question_bank: saveToBank
    };

    if (editingExamId) {
      // Update existing
      const res = await updateExam(editingExamId, examData);
      if (res.success && res.data) {
        setExams(exams.map(ex => ex.id === editingExamId ? res.data! : ex));
        alert('آزمون با موفقیت ویرایش و بروزرسانی شد.');
        resetManualForm();
        setActiveTab('exams');
        // Refresh question bank in background
        getQuestionBank({ course_id: courseId }).then(setBankQuestions);
      } else {
        alert(res.error || 'خطا در بروزرسانی آزمون');
      }
    } else {
      // Create new
      const res = await createExam(examData);
      if (res.success && res.data) {
        setExams([res.data, ...exams]);
        alert('آزمون جدید با موفقیت ایجاد شد و سوالات آن به بانک سوالات افزوده گردید.');
        resetManualForm();
        setActiveTab('exams');
        // Refresh question bank in background
        getQuestionBank({ course_id: courseId }).then(setBankQuestions);
      } else {
        alert(res.error || 'خطا در ایجاد آزمون');
      }
    }
  };

  // Auto-Generate Exam from Bank
  const handleAutoGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const easy = parseInt(autoEasyCount, 10) || 0;
    const med = parseInt(autoMediumCount, 10) || 0;
    const hard = parseInt(autoHardCount, 10) || 0;

    if (easy + med + hard === 0) {
      return alert('لطفاً حداقل تعداد یک سوال برای آزمون تعیین نمایید.');
    }

    const res = await autoGenerateExamFromBank({
      course_id: courseId,
      title: autoTitle.trim() || `آزمون هوشمند (${courseTitle})`,
      duration_minutes: parseInt(autoDuration, 10) || 25,
      easy_count: easy,
      medium_count: med,
      hard_count: hard,
      random_per_student: autoRandomPerStudent
    });

    if (res.success && res.data) {
      setExams([res.data, ...exams]);
      setActiveTab('exams');
      alert('آزمون هوشمند با موفقیت از بانک سوالات استخراج و آماده برگزاری شد!');
    } else {
      alert(res.error || 'خطا در تولید خودکار آزمون');
    }
  };

  // Add Question to Bank Directly
  const handleSaveBankQuestion = async () => {
    if (!newBankQ.question?.trim()) return alert('متن سوال الزامی است');
    const res = await addQuestionToBank({
      ...newBankQ,
      course_id: courseId,
      course_title: courseTitle,
    });

    if (res.success && res.data) {
      setBankQuestions([res.data, ...bankQuestions]);
      setShowAddBankModal(false);
      setNewBankQ({
        type: 'multiple_choice',
        difficulty: 'medium',
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        sample_answer: '',
        score: 5,
        tag: 'مفاهیم'
      });
      alert('سوال جدید به بانک سوالات اضافه شد.');
    } else {
      alert(res.error || 'خطا در افزودن به بانک سوالات');
    }
  };

  const handleDeleteBankQ = async (id: string) => {
    if (!window.confirm('آیا این سوال از بانک سوالات حذف شود؟')) return;
    const res = await deleteQuestionFromBank(id);
    if (res.success) {
      setBankQuestions(bankQuestions.filter(q => q.id !== id));
    }
  };

  // Filtered bank questions
  const filteredBank = bankQuestions.filter(q => {
    if (bankDifficultyFilter !== 'all' && q.difficulty !== bankDifficultyFilter) return false;
    if (bankTypeFilter !== 'all' && q.type !== bankTypeFilter) return false;
    if (bankSearch) {
      const s = bankSearch.toLowerCase();
      return q.question?.toLowerCase().includes(s) || q.tag?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <HelpCircle className="text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">سامانه جامع آزمون، بانک سوالات و کارنامه‌ها</h3>
              <p className="text-[11px] text-indigo-200">{courseTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-2 sm:px-4 bg-slate-50/70 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => { setActiveTab('exams'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'exams' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            آزمون‌های دوره ({exams.length})
          </button>
          
          <button
            onClick={() => { setActiveTab('auto_generator'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'auto_generator' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={14} className="text-amber-500" />
            آزمون‌ساز خودکار
          </button>

          <button
            onClick={() => { setActiveTab('question_bank'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'question_bank' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database size={14} />
            بانک سوالات ({bankQuestions.length})
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'create_exam') resetManualForm();
              setActiveTab('create_exam');
              setSelectedSubmission(null);
            }}
            className={`py-3 px-3 text-xs font-black transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'create_exam' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus size={14} />
            {editingExamId ? 'ویرایش آزمون' : 'طراحی دستی'}
          </button>

          <button
            onClick={() => { setActiveTab('results'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            کارنامه‌ها ({submissions.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: EXAMS LIST */}
          {activeTab === 'exams' && (
            <div className="space-y-3">
              {exams.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle size={36} className="mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="text-xs font-bold text-slate-600">هنوز آزمونی برای این دوره تعریف نشده است.</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() => setActiveTab('auto_generator')}
                      className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles size={14} /> طراحی خودکار از بانک سوالات
                    </button>
                    <button
                      onClick={() => { resetManualForm(); setActiveTab('create_exam'); }}
                      className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1"
                    >
                      <Plus size={14} /> طراحی دستی
                    </button>
                  </div>
                </div>
              ) : (
                exams.map((ex) => {
                  const descCount = (ex.questions || []).filter(q => q.type === 'descriptive').length;
                  const mcCount = (ex.questions || []).filter(q => q.type !== 'descriptive').length;

                  return (
                    <div key={ex.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 hover:border-indigo-200 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-800">{ex.title}</h4>
                            <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full">
                              فعال
                            </span>
                            {ex.randomize_options !== false && (
                              <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Shuffle size={10} /> گزینه‌های رندوم
                              </span>
                            )}
                          </div>
                          {ex.description && (
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ex.description}</p>
                          )}
                        </div>

                        {/* Actions: Edit, Duplicate, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditExam(ex)}
                            className="bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                            title="ویرایش آزمون"
                          >
                            <Edit2 size={13} />
                            <span className="hidden sm:inline">ویرایش</span>
                          </button>

                          <button
                            onClick={() => handleDuplicate(ex.id)}
                            className="bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                            title="داپلیکیت / کپی آزمون"
                          >
                            <Copy size={13} />
                            <span className="hidden sm:inline">کپی</span>
                          </button>

                          <button
                            onClick={() => handleDelete(ex.id)}
                            className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 p-2 rounded-xl text-xs font-bold transition shadow-2xs"
                            title="حذف آزمون"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-medium gap-2">
                        <span>مدت: <strong>{ex.duration_minutes} دقیقه</strong></span>
                        <span>تعداد: <strong>{mcCount} تستی | {descCount} تشریحی</strong></span>
                        <span>حدنصاب قبولی: <strong>{ex.passing_score} از {ex.total_score}</strong></span>
                        <span>دفعات مجاز: <strong>{ex.max_attempts ? `${ex.max_attempts} بار` : 'نامحدود'}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: AUTO-GENERATOR FROM QUESTION BANK */}
          {activeTab === 'auto_generator' && (
            <form onSubmit={handleAutoGenerateSubmit} className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Sparkles className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                <div className="text-xs text-indigo-950 leading-relaxed">
                  <strong>آزمون‌ساز خودکار از بانک سوالات:</strong> سامانه با تعیین تعداد سوالات بر اساس درجه سختی (آسان، متوسط، سخت)، به طور هوشمند از بانک سوالات دوره آزمون را طراحی و کلید را آماده می‌نماید.
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان آزمون خودکار</label>
                  <input
                    type="text"
                    value={autoTitle}
                    onChange={(e) => setAutoTitle(e.target.value)}
                    placeholder={`مثال: آزمون جامع پایان ترم (${courseTitle})`}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 mb-1">تعداد سوال آسان</label>
                    <input
                      type="number"
                      min="0"
                      value={autoEasyCount}
                      onChange={(e) => setAutoEasyCount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-700 mb-1">تعداد سوال متوسط</label>
                    <input
                      type="number"
                      min="0"
                      value={autoMediumCount}
                      onChange={(e) => setAutoMediumCount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-700 mb-1">تعداد سوال سخت</label>
                    <input
                      type="number"
                      min="0"
                      value={autoHardCount}
                      onChange={(e) => setAutoHardCount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">مدت زمان آزمون (دقیقه)</label>
                    <input
                      type="number"
                      min="5"
                      value={autoDuration}
                      onChange={(e) => setAutoDuration(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={autoRandomPerStudent}
                        onChange={(e) => setAutoRandomPerStudent(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] font-bold text-slate-700">سوالات متفاوت برای هر کاربر (سختی یکسان)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  موجودی بانک سوالات: <strong>{bankQuestions.length} سوال</strong>
                </span>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Sparkles size={16} />
                  تولید خودکار آزمون از بانک سوالات
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: QUESTION BANK */}
          {activeTab === 'question_bank' && (
            <div className="space-y-4">
              {/* Top Bar & Filters */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="جستجو در متن یا تگ‌های بانک سوالات..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-8 pl-3 text-xs outline-none focus:border-indigo-500"
                  />
                  <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={bankDifficultyFilter}
                    onChange={(e: any) => setBankDifficultyFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold text-slate-700 outline-none"
                  >
                    <option value="all">تمام سطوح سختی</option>
                    <option value="easy">آسان</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">سخت</option>
                  </select>

                  <select
                    value={bankTypeFilter}
                    onChange={(e: any) => setBankTypeFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold text-slate-700 outline-none"
                  >
                    <option value="all">تمام انواع</option>
                    <option value="multiple_choice">تستی</option>
                    <option value="descriptive">تشریحی</option>
                  </select>

                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="bg-indigo-600 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shrink-0"
                  >
                    <Plus size={14} /> ثبت سوال جدید
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-2.5">
                {filteredBank.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                    سوالی با این مشخصات در بانک یافت نشد.
                  </div>
                ) : (
                  filteredBank.map((q) => (
                    <div key={q.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                            q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {q.difficulty === 'easy' ? 'آسان' : q.difficulty === 'medium' ? 'متوسط' : 'سخت'}
                          </span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                            {q.type === 'descriptive' ? 'تشریحی' : 'تستی'}
                          </span>
                          {q.tag && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Tag size={10} /> {q.tag}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">نمره: {q.score}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteBankQ(q.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="حذف از بانک سوالات"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.question}</p>

                      {q.type === 'multiple_choice' && q.options && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                          {q.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`p-1.5 rounded-lg border ${
                                oIdx === q.correct_index ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'
                              }`}
                            >
                              {oIdx + 1}. {opt} {oIdx === q.correct_index && '✓ (کلید)'}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'descriptive' && q.sample_answer && (
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                          <strong>پاسخ نمونه / راهنمای تصحیح:</strong> {q.sample_answer}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Modal for adding question to bank directly */}
              {showAddBankModal && (
                <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3">
                  <div className="bg-white rounded-3xl p-5 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-black text-sm text-slate-800">افزودن سوال به بانک سوالات</h4>
                      <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-slate-700">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع سوال</label>
                        <select
                          value={newBankQ.type}
                          onChange={(e: any) => setNewBankQ({ ...newBankQ, type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                        >
                          <option value="multiple_choice">تستی (۴ گزینه)</option>
                          <option value="descriptive">تشریحی</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">درجه سختی</label>
                        <select
                          value={newBankQ.difficulty}
                          onChange={(e: any) => setNewBankQ({ ...newBankQ, difficulty: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                        >
                          <option value="easy">آسان</option>
                          <option value="medium">متوسط</option>
                          <option value="hard">سخت</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">نمره سوال</label>
                        <input
                          type="number"
                          value={newBankQ.score}
                          onChange={(e) => setNewBankQ({ ...newBankQ, score: Number(e.target.value) || 5 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تگ / سرفصل موضوعی</label>
                      <input
                        type="text"
                        value={newBankQ.tag}
                        onChange={(e) => setNewBankQ({ ...newBankQ, tag: e.target.value })}
                        placeholder="مثال: احکام بیع، مفاهیم پایتون..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">متن صورت سوال</label>
                      <textarea
                        rows={3}
                        value={newBankQ.question}
                        onChange={(e) => setNewBankQ({ ...newBankQ, question: e.target.value })}
                        placeholder="صورت کامل سوال را وارد کنید..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    {newBankQ.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">گزینه‌ها و انتخاب کلید صحیح:</label>
                        {(newBankQ.options || ['', '', '', '']).map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="bank_correct"
                              checked={newBankQ.correct_index === idx}
                              onChange={() => setNewBankQ({ ...newBankQ, correct_index: idx })}
                              className="text-indigo-600"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...(newBankQ.options || ['', '', '', ''])];
                                updated[idx] = e.target.value;
                                setNewBankQ({ ...newBankQ, options: updated });
                              }}
                              placeholder={`گزینه ${idx + 1}`}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {newBankQ.type === 'descriptive' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">پاسخ نمونه / الگوی تصحیح</label>
                        <textarea
                          rows={3}
                          value={newBankQ.sample_answer}
                          onChange={(e) => setNewBankQ({ ...newBankQ, sample_answer: e.target.value })}
                          placeholder="پاسخ نمونه یا راهنمای نمره‌دهی..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setShowAddBankModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={handleSaveBankQuestion}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md"
                      >
                        ذخیره در بانک سوالات
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANUAL DESIGNER / EDIT EXAM */}
          {activeTab === 'create_exam' && (
            <form onSubmit={handleSaveExamSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-800">
                  {editingExamId ? 'ویرایش مشخصات و سوالات آزمون' : 'طراحی دستی آزمون جدید'}
                </h4>
                {editingExamId && (
                  <button
                    type="button"
                    onClick={resetManualForm}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    انصراف از ویرایش
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان آزمون</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: آزمون میان‌ترم فقه و اصول"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات و راهنمای شرکت در آزمون</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="دستورالعمل آزمون برای دانش‌پژوهان..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مدت زمان (دقیقه)</label>
                  <input
                    type="number"
                    min="5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حدنصاب نمره قبولی</label>
                  <input
                    type="number"
                    min="1"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حداکثر دفعات مجاز شرکت</label>
                  <select
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  >
                    <option value="1">فقط ۱ بار</option>
                    <option value="2">۲ بار</option>
                    <option value="3">۳ بار</option>
                    <option value="5">۵ بار</option>
                    <option value="0">نامحدود</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={randomizeOptions}
                      onChange={(e) => setRandomizeOptions(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>رندوم‌سازی ترتیب گزینه‌ها برای هر دانش‌پژوه</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-700">
                    <input
                      type="checkbox"
                      checked={saveToBank}
                      onChange={(e) => setSaveToBank(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>ذخیره خودکار سوالات در بانک سوالات برای آینده</span>
                  </label>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-black text-xs text-slate-800">
                    سوالات آزمون ({questions.length} سوال - مجموع نمرات: {questions.reduce((s, q) => s + (Number(q.score) || 0), 0)})
                  </h5>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                    >
                      <Plus size={13} /> افزودن تستی
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('descriptive')}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                    >
                      <Plus size={13} /> افزودن تشریحی
                    </button>
                  </div>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={q.id || qIndex} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                          {qIndex + 1}
                        </span>
                        <select
                          value={q.type || 'multiple_choice'}
                          onChange={(e: any) => {
                            const updated = [...questions];
                            updated[qIndex].type = e.target.value;
                            if (e.target.value === 'multiple_choice') {
                              updated[qIndex].options = updated[qIndex].options || ['', '', '', ''];
                              updated[qIndex].correct_index = updated[qIndex].correct_index ?? 0;
                            }
                            setQuestions(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-2 py-1 text-slate-700"
                        >
                          <option value="multiple_choice">چهار گزینه‌ای</option>
                          <option value="descriptive">تشریحی</option>
                        </select>

                        {/* Difficulty Selector */}
                        <select
                          value={q.difficulty || 'medium'}
                          onChange={(e: any) => {
                            const updated = [...questions];
                            updated[qIndex].difficulty = e.target.value;
                            setQuestions(updated);
                          }}
                          className={`rounded-lg text-xs font-bold px-2 py-1 border ${
                            q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            q.difficulty === 'hard' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="easy">سطح: آسان</option>
                          <option value="medium">سطح: متوسط</option>
                          <option value="hard">سطح: سخت</option>
                        </select>

                        {/* Tag */}
                        <input
                          type="text"
                          value={q.tag || ''}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].tag = e.target.value;
                            setQuestions(updated);
                          }}
                          placeholder="تگ سرفصل"
                          className="bg-white border border-slate-200 rounded-lg text-[11px] px-2 py-1 w-24 text-slate-700"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500 font-bold">نمره:</span>
                          <input
                            type="number"
                            min="1"
                            value={q.score}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIndex].score = Math.max(1, parseInt(e.target.value, 10) || 1);
                              setQuestions(updated);
                            }}
                            className="w-12 bg-white border border-slate-200 rounded-lg p-1 text-center font-black text-xs"
                          />
                        </div>

                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <div>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].question = e.target.value;
                          setQuestions(updated);
                        }}
                        placeholder="متن سوال را بنویسید..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {q.type !== 'descriptive' && (
                      <div className="space-y-2">
                        <span className="text-[11px] text-slate-500 font-bold block">
                          گزینه‌ها (گزینه صحیح را با علامت دایره انتخاب فرمایید):
                        </span>
                        {(q.options || ['', '', '', '']).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${qIndex}`}
                              checked={q.correct_index === optIndex}
                              onChange={() => {
                                const updated = [...questions];
                                updated[qIndex].correct_index = optIndex;
                                setQuestions(updated);
                              }}
                              className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...questions];
                                if (!updated[qIndex].options) updated[qIndex].options = ['', '', '', ''];
                                updated[qIndex].options![optIndex] = e.target.value;
                                setQuestions(updated);
                              }}
                              placeholder={`گزینه ${optIndex + 1}`}
                              className={`flex-1 bg-white border rounded-xl p-2 text-xs transition ${
                                q.correct_index === optIndex ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Descriptive Sample Answer */}
                    {q.type === 'descriptive' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          پاسخ نمونه یا راهنمای تصحیح برای استاد / سامانه:
                        </label>
                        <textarea
                          rows={2}
                          value={q.sample_answer || ''}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].sample_answer = e.target.value;
                            setQuestions(updated);
                          }}
                          placeholder="کلیدواژه‌های اصلی و ملاک‌های نمره‌دهی..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { resetManualForm(); setActiveTab('exams'); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition active:scale-95"
                >
                  {editingExamId ? 'ذخیره تغییرات آزمون' : 'ثبت و انتشار آزمون'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: RESULTS & SUBMISSIONS */}
          {activeTab === 'results' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/80 rounded-2xl text-[11px] text-indigo-900 font-medium flex items-center justify-between">
                <span>تمام پاسخ‌نامه‌ها مستقیماً به بانک اطلاعاتی متصل بوده و کارنامه‌ها لحظه‌ای ثبت می‌گردند.</span>
                <span className="font-bold text-xs bg-indigo-200/80 text-indigo-950 px-2 py-0.5 rounded-lg">
                  {submissions.length} کارنامه
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <FileCheck size={36} className="mx-auto mb-2 opacity-40 text-indigo-500" />
                  <p className="text-xs font-bold text-slate-600">هنوز پاسخی برای آزمون‌های این دوره ثبت نشده است.</p>
                </div>
              ) : (
                submissions.map((sub) => {
                  const isExpanded = selectedSubmission?.id === sub.id;

                  return (
                    <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                      <div 
                        onClick={() => setSelectedSubmission(isExpanded ? null : sub)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                            sub.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.user_name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-black text-xs text-slate-800">{sub.user_name}</h5>
                              {sub.attempt_number && (
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  نوبت {sub.attempt_number}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              ارسال: {new Date(sub.submitted_at).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <span className="text-xs font-black text-indigo-700 block">نمره: {sub.score} / {sub.total_score}</span>
                            <span className="text-[10px] text-slate-500 font-bold">درصد: {sub.percentage}٪</span>
                          </div>

                          <span className={`px-2 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                            sub.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.status === 'passed' ? 'قبول' : 'مردود'}
                          </span>

                          <button className="text-slate-400 hover:text-slate-600 p-1">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
                          <span className="font-bold text-slate-700 block mb-2">جزئیات پاسخ‌های دانش‌پژوه:</span>
                          {Object.entries(sub.answers || {}).map(([qKey, aVal], idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                              <span className="text-slate-500 font-medium">سوال {idx + 1}:</span>
                              <span className="font-bold text-slate-800 text-left dir-ltr">
                                {typeof aVal === 'number' ? `گزینه انتخابی: ${Number(aVal) + 1}` : String(aVal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
