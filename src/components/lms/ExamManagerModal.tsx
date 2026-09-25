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
  FileText,
  ListChecks,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { Exam, ExamQuestion, ExamSubmission } from '../../types';
import { getCourseExams, createExam, getCourseSubmissions } from '../../services/lmsService';

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
  const [activeTab, setActiveTab] = useState<'exams' | 'create_exam' | 'results'>('exams');
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

  // Form states for creating a new exam
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('20');
  const [passingScore, setPassingScore] = useState('12');
  const [maxAttempts, setMaxAttempts] = useState('2');
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: 'q_new_1',
      type: 'multiple_choice',
      question: 'عنوان سوال تستی نمونه',
      options: ['گزینه ۱ (پاسخ صحیح)', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'],
      correct_index: 0,
      score: 5
    }
  ]);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    const [list, subs] = await Promise.all([
      getCourseExams(courseId),
      getCourseSubmissions(courseId)
    ]);
    setExams(list);
    setSubmissions(subs);
  };

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
        score: 5
      }
    ]);
  };

  const handleToggleType = (index: number, newType: 'multiple_choice' | 'descriptive') => {
    const updated = [...questions];
    updated[index].type = newType;
    if (newType === 'multiple_choice') {
      updated[index].options = updated[index].options || ['', '', '', ''];
      updated[index].correct_index = updated[index].correct_index ?? 0;
      delete updated[index].sample_answer;
    } else {
      updated[index].sample_answer = updated[index].sample_answer || '';
      delete updated[index].options;
      delete updated[index].correct_index;
    }
    setQuestions(updated);
  };

  const handleQuestionChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  const handleScoreChange = (index: number, scoreVal: string) => {
    const updated = [...questions];
    updated[index].score = Math.max(1, parseInt(scoreVal) || 1);
    setQuestions(updated);
  };

  const handleSampleAnswerChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].sample_answer = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options![optIndex] = text;
      setQuestions(updated);
    }
  };

  const handleCorrectOptionChange = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correct_index = optIndex;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options!.push('');
      setQuestions(updated);
    }
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options && updated[qIndex].options!.length > 2) {
      updated[qIndex].options = updated[qIndex].options!.filter((_, i) => i !== optIndex);
      if (updated[qIndex].correct_index === optIndex) {
        updated[qIndex].correct_index = 0;
      } else if ((updated[qIndex].correct_index ?? 0) > optIndex) {
        updated[qIndex].correct_index = (updated[qIndex].correct_index ?? 0) - 1;
      }
      setQuestions(updated);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('لطفاً عنوان آزمون را وارد کنید');

    const totalScore = questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
    const newExam = await createExam({
      course_id: courseId,
      title,
      description,
      duration_minutes: parseInt(duration) || 20,
      passing_score: parseFloat(passingScore) || 12,
      total_score: totalScore || 20,
      max_attempts: parseInt(maxAttempts, 10) || 0,
      questions,
      is_active: true
    });

    setExams([newExam, ...exams]);
    setActiveTab('exams');
    alert('آزمون جدید با موفقیت ایجاد شد و سیستم تصحیح خودکار برای آن فعال گردید!');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <HelpCircle className="text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">مدیریت امتحانات، سوالات و کارنامه‌ها</h3>
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
        <div className="flex border-b border-slate-200 px-4 bg-slate-50/50 shrink-0">
          <button
            onClick={() => { setActiveTab('exams'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition cursor-pointer ${
              activeTab === 'exams' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            آزمون‌های تعریف شده ({exams.length})
          </button>
          <button
            onClick={() => { setActiveTab('results'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition cursor-pointer ${
              activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            کارنامه و نمرات دانش‌پژوهان ({submissions.length})
          </button>
          <button
            onClick={() => { setActiveTab('create_exam'); setSelectedSubmission(null); }}
            className={`py-3 px-3 text-xs font-black transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'create_exam' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus size={14} />
            طراحی آزمون جدید
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* 1. EXAMS LIST */}
          {activeTab === 'exams' && (
            <div className="space-y-3">
              {exams.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle size={36} className="mx-auto mb-2 opacity-40 text-amber-500" />
                  <p className="text-xs font-bold text-slate-600">هنوز آزمونی برای این دوره تعریف نشده است.</p>
                  <button
                    onClick={() => setActiveTab('create_exam')}
                    className="mt-3 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1"
                  >
                    <Plus size={14} /> طراحی اولین آزمون
                  </button>
                </div>
              ) : (
                exams.map((ex) => {
                  const descCount = ex.questions.filter(q => q.type === 'descriptive').length;
                  const mcCount = ex.questions.filter(q => q.type !== 'descriptive').length;

                  return (
                    <div key={ex.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-xs text-slate-800">{ex.title}</h4>
                        <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full">
                          فعال با تصحیح خودکار
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{ex.description}</p>
                      
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-medium gap-2">
                        <span>مدت: <strong>{ex.duration_minutes} دقیقه</strong></span>
                        <span>سوالات: <strong>{mcCount} تستی | {descCount} تشریحی</strong></span>
                        <span>قبولی: <strong>{ex.passing_score} از {ex.total_score}</strong></span>
                        <span>دفعات مجاز: <strong>{ex.max_attempts ? `${ex.max_attempts} بار` : 'نامحدود'}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. RESULTS & STUDENT REPORT CARDS */}
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
                  <p className="text-xs font-bold text-slate-600">هنوز پاسخی برای این دوره ثبت نشده است.</p>
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
                            <span className="text-[10px] text-slate-400 mt-0.5 block">ارسال: {sub.submitted_at}</span>
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
                            {sub.status === 'passed' ? 'قبول (گواهی صادر شد)' : 'مردود'}
                          </span>

                          <button className="text-slate-400 hover:text-slate-600 p-1">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View: Question-by-question breakdown */}
                      {isExpanded && (
                        <div className="bg-slate-50/90 p-3.5 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in">
                          <h6 className="font-black text-[11px] text-slate-700 flex items-center gap-1">
                            <Eye size={13} className="text-indigo-600" />
                            جزئیات پاسخ‌نامه و پاسخ‌های ارسالی دانش‌پژوه:
                          </h6>

                          {Object.entries(sub.answers).map(([qKey, ansVal], aIdx) => (
                            <div key={qKey} className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block">سوال {aIdx + 1} ({qKey}):</span>
                              <div className="font-bold text-slate-800 text-xs leading-relaxed">
                                {typeof ansVal === 'string' ? (
                                  <div className="p-2 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                                    <span className="text-[10px] text-indigo-600 block mb-0.5">پاسخ تشریحی ارسالی دانش‌پژوه:</span>
                                    {ansVal || '(پاسخی نوشته نشده است)'}
                                  </div>
                                ) : (
                                  <span className="text-indigo-700">گزینه انتخابی: گزینه {Number(ansVal) + 1}</span>
                                )}
                              </div>
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

          {/* 3. CREATE EXAM FORM */}
          {activeTab === 'create_exam' && (
            <form onSubmit={handleCreateExamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان آزمون *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آزمون جامع میان‌ترم و سنجش نهایی"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات و راهنمای آزمون</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحاتی برای داوطلبان پیش از شروع آزمون..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-amber-600" /> زمان (دقیقه)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Award size={12} className="text-emerald-600" /> قبولی (از ۲۰)
                  </label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <RotateCcw size={12} className="text-indigo-600" /> دفعات مجاز
                  </label>
                  <select
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:border-indigo-500 text-center cursor-pointer"
                  >
                    <option value="1">۱ بار (تک‌فرصت)</option>
                    <option value="2">۲ بار</option>
                    <option value="3">۳ بار</option>
                    <option value="5">۵ بار</option>
                    <option value="0">نامحدود</option>
                  </select>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-700">طراحی سوالات آزمون ({questions.length})</h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> سوال تستی
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('descriptive')}
                      className="text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> سوال تشریحی
                    </button>
                  </div>
                </div>

                {questions.map((q, qIdx) => {
                  const isDescriptive = q.type === 'descriptive';

                  return (
                    <div key={q.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-700">سوال شماره {qIdx + 1}</span>
                          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => handleToggleType(qIdx, 'multiple_choice')}
                              className={`px-1.5 py-0.5 rounded transition ${!isDescriptive ? 'bg-amber-500 text-white' : 'text-slate-600'}`}
                            >
                              تستی
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleType(qIdx, 'descriptive')}
                              className={`px-1.5 py-0.5 rounded transition ${isDescriptive ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                            >
                              تشریحی
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span>بارم:</span>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={q.score}
                              onChange={(e) => handleScoreChange(qIdx, e.target.value)}
                              className="w-9 bg-white border border-slate-200 rounded p-1 text-center font-bold text-xs"
                            />
                            <span>نمره</span>
                          </div>

                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="حذف سوال"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="متن سوال را بنویسید..."
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-500"
                      />

                      {/* Options for Multiple Choice with clear correct designation */}
                      {!isDescriptive && q.options && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>تعیین گزینه صحیح (روی دکمه سبز کلیک کنید):</span>
                            <button 
                              type="button" 
                              onClick={() => handleAddOption(qIdx)}
                              className="text-indigo-600 font-bold hover:underline"
                            >
                              + گزینه جدید
                            </button>
                          </div>

                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correct_index === optIdx;

                            return (
                              <div key={optIdx} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCorrectOptionChange(qIdx, optIdx)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shrink-0 transition cursor-pointer ${
                                    isCorrect 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'bg-slate-200 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                  title="تعیین به عنوان پاسخ صحیح"
                                >
                                  {isCorrect ? <Check size={11} strokeWidth={3} /> : null}
                                  <span>{isCorrect ? 'پاسخ صحیح ✓' : 'تعیین صحیح'}</span>
                                </button>

                                <input
                                  type="text"
                                  placeholder={`متن گزینه ${optIdx + 1}${isCorrect ? ' (پاسخ صحیح)' : ''}`}
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                  className={`flex-1 bg-white border rounded-xl px-2.5 py-1 text-xs outline-none ${
                                    isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500/20 font-bold' : 'border-slate-200'
                                  }`}
                                />

                                {q.options!.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    className="text-slate-400 hover:text-rose-500 p-1"
                                    title="حذف گزینه"
                                  >
                                    <X size={13} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Descriptive Guide */}
                      {isDescriptive && (
                        <div className="space-y-1 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                          <label className="block text-[10px] font-black text-indigo-900">
                            پاسخ نمونه / راهنمای تصحیح سوال تشریحی:
                          </label>
                          <textarea
                            rows={2}
                            placeholder="متن پاسخ استاندارد، کلیدواژه‌ها یا راهنمای نمره‌دهی..."
                            value={q.sample_answer || ''}
                            onChange={(e) => handleSampleAnswerChange(qIdx, e.target.value)}
                            className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 cursor-pointer"
              >
                <CheckCircle size={15} />
                ذخیره آزمون و فعال‌سازی تصحیح خودکار
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
}
