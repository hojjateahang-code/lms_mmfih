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
  Edit2
} from 'lucide-react';
import { Exam, ExamQuestion, ExamSubmission } from '../../types';
import { getCourseExams, createExam } from '../../services/lmsService';

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
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([
    {
      id: 'sub_1',
      exam_id: 'exam_c1',
      course_id: courseId,
      user_id: 'usr_current',
      user_name: 'حجت‌الله آهنگ',
      answers: { q1: 0, q2: 0, q3: 0, q4: 0 },
      score: 20,
      total_score: 20,
      percentage: 100,
      status: 'passed',
      submitted_at: '۱۴۰۴/۰۶/۱۰'
    },
    {
      id: 'sub_2',
      exam_id: 'exam_c1',
      course_id: courseId,
      user_id: 'usr_3',
      user_name: 'فاطمه حسینی',
      answers: { q1: 0, q2: 0, q3: 1, q4: 0 },
      score: 15,
      total_score: 20,
      percentage: 75,
      status: 'passed',
      submitted_at: '۱۴۰۴/۰۶/۱۱'
    },
    {
      id: 'sub_3',
      exam_id: 'exam_c1',
      course_id: courseId,
      user_id: 'usr_2',
      user_name: 'محمدامین شمس',
      answers: { q1: 1, q2: 0, q3: 2, q4: 1 },
      score: 5,
      total_score: 20,
      percentage: 25,
      status: 'failed',
      submitted_at: '۱۴۰۴/۰۶/۱۲'
    }
  ]);

  // Form states for creating a new exam
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('20');
  const [passingScore, setPassingScore] = useState('12');
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: 'q_new_1',
      question: 'عنوان سوال نمونه',
      options: ['گزینه ۱ (صحیح)', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴'],
      correct_index: 0,
      score: 5
    }
  ]);

  useEffect(() => {
    loadExams();
  }, [courseId]);

  const loadExams = async () => {
    const list = await getCourseExams(courseId);
    setExams(list);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_new_${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        score: 5
      }
    ]);
  };

  const handleQuestionChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correct_index = optIndex;
    setQuestions(updated);
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
      questions,
      is_active: true
    });

    setExams([newExam, ...exams]);
    setActiveTab('exams');
    alert('آزمون با موفقیت ایجاد شد و سیستم تصحیح خودکار برای آن فعال گردید!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <HelpCircle className="text-amber-400" size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">مدیریت امتحانات و تصحیح خودکار</h3>
              <p className="text-[11px] text-indigo-200">{courseTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('exams')}
            className={`py-3 px-3 text-xs font-black transition ${activeTab === 'exams' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            آزمون‌های تعریف شده ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-3 px-3 text-xs font-black transition ${activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            کارنامه و نمرات تصحیح خودکار ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('create_exam')}
            className={`py-3 px-3 text-xs font-black transition flex items-center gap-1 ${activeTab === 'create_exam' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            <Plus size={14} />
            طراحی آزمون جدید
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* EXAMS LIST */}
          {activeTab === 'exams' && (
            <div className="space-y-3">
              {exams.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold">هنوز آزمونی برای این دوره تعریف نشده است.</p>
                </div>
              ) : (
                exams.map((ex) => (
                  <div key={ex.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs text-slate-800">{ex.title}</h4>
                      <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full">
                        فعال با تصحیح آنی
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{ex.description}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>مدت: {ex.duration_minutes} دقیقه</span>
                      <span>تعداد سوالات: {ex.questions.length} سوال</span>
                      <span>حدنصاب قبولی: {ex.passing_score} از {ex.total_score}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* RESULTS (SUBMISSIONS & AUTO-GRADING LOG) */}
          {activeTab === 'results' && (
            <div className="space-y-2.5">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-[11px] text-indigo-800 font-medium">
                تمامی پاسخ‌نامه‌ها بلافاصله پس از ارسال توسط موتور ارزیابی خودکار تصحیح شده و برای افراد واجد شرایط گواهی صادر گردیده است.
              </div>

              {submissions.map((sub) => (
                <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="font-black text-xs text-slate-800">{sub.user_name}</h5>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">تاریخ ارسال: {sub.submitted_at}</span>
                  </div>

                  <div className="text-left flex items-center gap-3">
                    <div>
                      <span className="text-xs font-black text-indigo-700 block">نمره: {sub.score} / {sub.total_score}</span>
                      <span className="text-[10px] text-slate-500 font-bold">درصد: {sub.percentage}٪</span>
                    </div>

                    <span className={`px-2 py-1 rounded-xl text-[10px] font-black ${
                      sub.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sub.status === 'passed' ? 'قبول (گواهی صادر شد)' : 'مردود'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CREATE EXAM FORM */}
          {activeTab === 'create_exam' && (
            <form onSubmit={handleCreateExamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان آزمون *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آزمون میان‌ترم فقه کاربردی"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات و راهنمای آزمون</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحاتی برای داوطلبان پیش از شروع آزمون..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">زمان پاسخگویی (دقیقه)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حداقل نمره قبولی (از ۲۰)</label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-700">طراحی سوالات چهارگزینه‌ای ({questions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    افزودن سوال جدید
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">سوال شماره {qIdx + 1}:</span>
                      <span className="text-[10px] text-slate-500 font-bold">بارم: {q.score} نمره</span>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="متن سوال را بنویسید..."
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-500"
                    />

                    {/* Options */}
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_for_${q.id}`}
                            checked={q.correct_index === optIdx}
                            onChange={() => handleCorrectOptionChange(qIdx, optIdx)}
                            className="text-indigo-600 cursor-pointer"
                            title="علامت زدن به عنوان پاسخ صحیح جهت تصحیح خودکار"
                          />
                          <input
                            type="text"
                            placeholder={`متن گزینه ${optIdx + 1}${optIdx === q.correct_index ? ' (پاسخ صحیح)' : ''}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            className={`flex-1 bg-white border rounded-xl px-2.5 py-1 text-xs outline-none ${
                              optIdx === q.correct_index ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
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
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
}
