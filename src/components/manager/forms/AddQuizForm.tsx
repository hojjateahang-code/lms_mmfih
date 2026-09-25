// src/components/manager/forms/AddQuizForm.tsx
import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Award, 
  Plus, 
  Trash2, 
  FileText, 
  ListChecks, 
  RotateCcw,
  Check,
  CheckCircle
} from 'lucide-react';
import { ExamQuestion } from '../../../types';

interface AddQuizFormProps {
  onClose: () => void;
  onSave?: (quizData: any) => void;
}

export default function AddQuizForm({ onClose, onSave }: AddQuizFormProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('20');
  const [passScore, setPassScore] = useState('12');
  const [maxAttempts, setMaxAttempts] = useState('2'); // تعداد دفعات مجاز شرکت در آزمون
  const [instructions, setInstructions] = useState('');
  
  // Real questions list (supporting both multiple_choice and descriptive)
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: 'q_1',
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      score: 5
    }
  ]);

  const handleAddQuestion = (type: 'multiple_choice' | 'descriptive' = 'multiple_choice') => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type,
        question: '',
        options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
        correct_index: type === 'multiple_choice' ? 0 : undefined,
        sample_answer: type === 'descriptive' ? '' : undefined,
        score: 5
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleToggleQuestionType = (idx: number, newType: 'multiple_choice' | 'descriptive') => {
    const updated = [...questions];
    updated[idx].type = newType;
    if (newType === 'multiple_choice') {
      updated[idx].options = updated[idx].options || ['', '', '', ''];
      updated[idx].correct_index = updated[idx].correct_index ?? 0;
      delete updated[idx].sample_answer;
    } else {
      updated[idx].sample_answer = updated[idx].sample_answer || '';
      delete updated[idx].options;
      delete updated[idx].correct_index;
    }
    setQuestions(updated);
  };

  const handleQuestionTextChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].question = val;
    setQuestions(updated);
  };

  const handleScoreChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].score = Math.max(1, parseInt(val) || 1);
    setQuestions(updated);
  };

  const handleSampleAnswerChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].sample_answer = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    if (updated[qIdx].options) {
      updated[qIdx].options![optIdx] = val;
      setQuestions(updated);
    }
  };

  const handleSelectCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correct_index = optIdx;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].options) {
      updated[qIdx].options!.push('');
      setQuestions(updated);
    }
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].options && updated[qIdx].options!.length > 2) {
      updated[qIdx].options = updated[qIdx].options!.filter((_, i) => i !== optIdx);
      if (updated[qIdx].correct_index === optIdx) {
        updated[qIdx].correct_index = 0;
      } else if ((updated[qIdx].correct_index ?? 0) > optIdx) {
        updated[qIdx].correct_index = (updated[qIdx].correct_index ?? 0) - 1;
      }
      setQuestions(updated);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      return alert('لطفاً عنوان آزمون را وارد کنید');
    }

    const filledQuestions = questions.filter(q => q.question.trim().length > 0);
    if (filledQuestions.length === 0) {
      return alert('لطفاً حداقل یک سوال معتبر با متن طراحی کنید.');
    }

    // Validate multiple choice questions have non-empty options
    for (let i = 0; i < filledQuestions.length; i++) {
      const q = filledQuestions[i];
      if (q.type === 'multiple_choice') {
        const nonEmptyOpts = (q.options || []).filter(o => o.trim().length > 0);
        if (nonEmptyOpts.length < 2) {
          return alert(`سوال شماره ${i + 1} باید حداقل دو گزینه معتبر داشته باشد.`);
        }
      }
    }

    const totalScore = filledQuestions.reduce((sum, q) => sum + (Number(q.score) || 5), 0);

    if (onSave) {
      onSave({
        title: title.trim(),
        duration: duration || '20',
        passScore: passScore || '12',
        totalScore,
        maxAttempts: parseInt(maxAttempts, 10) || 0, // 0 = unlimited
        instructions,
        questions: filledQuestions,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300 max-w-md mx-auto shadow-2xl" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        <div>
          <h2 className="font-black text-slate-800 text-base flex items-center">
            <HelpCircle size={18} className="ml-2 text-amber-500" /> طراحی آزمون جدید
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">طراحی سوالات تستی و تشریحی، تعیین پاسخ صحیح و سقف دفعات آزمون</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition active:scale-95 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-8">
        {/* Quiz Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان آزمون *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: آزمون جامع پایان فصل اول"
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition shadow-xs font-bold"
          />
        </div>

        {/* Exam Settings Grid: Duration, Pass Score, Max Attempts */}
        <div className="grid grid-cols-3 gap-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
              <Clock size={12} className="text-amber-600" /> زمان (دقیقه)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="20"
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none text-center focus:border-amber-400 font-black shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
              <Award size={12} className="text-emerald-600" /> قبولی (از ۲۰)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={passScore}
              onChange={(e) => setPassScore(e.target.value)}
              placeholder="12"
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none text-center focus:border-amber-400 font-black shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1 flex items-center gap-1">
              <RotateCcw size={12} className="text-indigo-600" /> دفعات مجاز
            </label>
            <select
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2 outline-none text-center focus:border-amber-400 font-black shadow-2xs cursor-pointer"
            >
              <option value="1">۱ بار (تک‌فرصت)</option>
              <option value="2">۲ بار آزمون</option>
              <option value="3">۳ بار آزمون</option>
              <option value="5">۵ بار آزمون</option>
              <option value="0">نامحدود</option>
            </select>
          </div>
        </div>

        {/* Questions Header & Add buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-amber-500" />
              <span>سوالات آزمون ({questions.length} سوال)</span>
            </h3>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddQuestion('multiple_choice')}
                className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus size={12} /> سوال تستی
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('descriptive')}
                className="text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus size={12} /> سوال تشریحی
              </button>
            </div>
          </div>

          {questions.map((q, qIdx) => {
            const isDescriptive = q.type === 'descriptive';

            return (
              <div key={q.id} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                {/* Question Header: Number, Type Toggle, Score & Delete */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
                      {qIdx + 1}
                    </span>
                    
                    {/* Toggle between Multiple Choice and Descriptive */}
                    <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => handleToggleQuestionType(qIdx, 'multiple_choice')}
                        className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          !isDescriptive ? 'bg-amber-500 text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <ListChecks size={11} /> تستی
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleQuestionType(qIdx, 'descriptive')}
                        className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                          isDescriptive ? 'bg-indigo-600 text-white shadow-2xs font-black' : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <FileText size={11} /> تشریحی
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>بارم:</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={q.score}
                        onChange={(e) => handleScoreChange(qIdx, e.target.value)}
                        className="w-10 bg-slate-50 border border-slate-200 rounded-lg p-1 text-center font-bold text-xs"
                      />
                      <span>نمره</span>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="حذف این سوال"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    متن سوال {isDescriptive ? 'تشریحی' : 'چهارگزینه‌ای'} *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="صورت سوال را به دقت وارد کنید..."
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold outline-none focus:border-amber-400 focus:bg-white transition"
                  />
                </div>

                {/* --- A. MULTIPLE CHOICE QUESTION: OPTIONS WITH EXPLICIT CORRECT DESIGNATION --- */}
                {!isDescriptive && q.options && (
                  <div className="space-y-2 pt-1 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-slate-700">
                        گزینه‌ها (برای تعیین پاسخ صحیح روی دکمه سبز کلیک کنید):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={11} /> افزودن گزینه
                      </button>
                    </div>

                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correct_index === optIdx;

                      return (
                        <div 
                          key={optIdx} 
                          className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                            isCorrect 
                              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-200' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Designated "Correct Answer" Pill Button */}
                          <button
                            type="button"
                            onClick={() => handleSelectCorrectOption(qIdx, optIdx)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'
                            }`}
                            title="انتخاب به عنوان پاسخ صحیح آزمون"
                          >
                            {isCorrect ? (
                              <>
                                <Check size={12} strokeWidth={3} />
                                <span>گزینه صحیح ✓</span>
                              </>
                            ) : (
                              <span>تعیین صحیح</span>
                            )}
                          </button>

                          {/* Option Input */}
                          <input
                            type="text"
                            placeholder={`متن گزینه ${optIdx + 1}...`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            className={`flex-1 bg-transparent px-2 py-1 text-xs outline-none font-bold ${
                              isCorrect ? 'text-emerald-950 placeholder:text-emerald-400' : 'text-slate-800'
                            }`}
                          />

                          {/* Delete option if > 2 */}
                          {q.options!.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, optIdx)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                              title="حذف این گزینه"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* --- B. DESCRIPTIVE QUESTION: MODEL ANSWER / GUIDANCE --- */}
                {isDescriptive && (
                  <div className="space-y-1.5 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
                    <label className="block text-[11px] font-black text-indigo-900 flex items-center gap-1">
                      <FileText size={12} className="text-indigo-600" />
                      پاسخ نمونه / راهنمای تصحیح سوال تشریحی
                    </label>
                    <textarea
                      rows={3}
                      placeholder="متن پاسخ استاندارد، کلیدواژه‌های اصلی یا راهنمای نمره‌دهی برای این سوال را بنویسید..."
                      value={q.sample_answer || ''}
                      onChange={(e) => handleSampleAnswerChange(qIdx, e.target.value)}
                      className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-indigo-500 font-medium">
                      دانش‌پژوه در زمان آزمون، پاسخ خود را به صورت متنی تایپ کرده و در کارنامه ثبت خواهد شد.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons Elevated at Bottom */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 pb-6 border-t border-slate-200 shadow-2xl z-30 mt-auto flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl transition cursor-pointer active:scale-98"
        >
          انصراف
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-amber-200 flex justify-center items-center gap-1.5 transition-all cursor-pointer"
        >
          <CheckCircle2 size={16} /> ذخیره آزمون و فعال‌سازی
        </button>
      </div>
    </div>
  );
}
