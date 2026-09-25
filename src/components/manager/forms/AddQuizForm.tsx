// src/components/manager/forms/AddQuizForm.tsx
import React, { useState } from 'react';
import { X, HelpCircle, AlertCircle, CheckCircle2, Clock, Award, Plus, Trash2 } from 'lucide-react';
import { ExamQuestion } from '../../../types';

interface AddQuizFormProps {
  onClose: () => void;
  onSave?: (quizData: any) => void;
}

export default function AddQuizForm({ onClose, onSave }: AddQuizFormProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('20');
  const [passScore, setPassScore] = useState('12');
  const [instructions, setInstructions] = useState('');
  
  // Real questions list
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: 'q_1',
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      score: 5
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        score: 5
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].question = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correct_index = optIdx;
    setQuestions(updated);
  };

  const handleSave = () => {
    if (!title.trim()) {
      return alert('لطفاً عنوان آزمون را وارد کنید');
    }

    const filledQuestions = questions.filter(q => q.question.trim().length > 0);
    if (filledQuestions.length === 0) {
      return alert('لطفاً حداقل یک سوال معتبر با متن و گزینه‌ها طراحی کنید.');
    }

    const totalScore = filledQuestions.reduce((sum, q) => sum + (q.score || 5), 0);

    if (onSave) {
      onSave({
        title: title.trim(),
        duration: duration || '20',
        passScore: passScore || '12',
        totalScore,
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
            <HelpCircle size={18} className="ml-2 text-amber-500" /> طراحی آزمون و تصحیح خودکار
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">ثبت سوالات و نمره‌دهی خودکار در کارنامه دانش‌پژوه</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-8">
        {/* Quiz Title */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">عنوان آزمون *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: آزمون جامع پایان فصل اول"
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition shadow-sm font-bold"
          />
        </div>

        {/* Time and Pass Score */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Clock size={13} className="text-amber-500" /> زمان آزمون (دقیقه)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="مثلاً: 20"
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3 outline-none text-center focus:border-amber-400 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Award size={13} className="text-emerald-500" /> حداقل نمره قبولی (از ۲۰)
            </label>
            <input
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(e.target.value)}
              placeholder="مثلاً: 12"
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3 outline-none text-center focus:border-amber-400 font-bold"
            />
          </div>
        </div>

        {/* Questions Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-950 flex items-center gap-1">
              <span>سوالات چهارگزینه‌ای ({questions.length} سوال)</span>
            </h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-xs font-bold text-amber-700 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-xl transition flex items-center gap-1"
            >
              <Plus size={13} /> افزودن سوال
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={q.id} className="p-3.5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">سوال شماره {qIdx + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded-lg"
                    title="حذف سوال"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="متن سوال را اینجا بنویسید..."
                value={q.question}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-500"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 block">پاسخ صحیح را تیک بزنید:</span>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct_q_${q.id}`}
                      checked={q.correct_index === optIdx}
                      onChange={() => handleCorrectChange(qIdx, optIdx)}
                      className="cursor-pointer text-amber-600"
                      title="پاسخ صحیح"
                    />
                    <input
                      type="text"
                      placeholder={`گزینه ${optIdx + 1} ${q.correct_index === optIdx ? '(پاسخ صحیح)' : ''}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                      className={`flex-1 bg-slate-50 border rounded-xl px-2.5 py-1 text-xs outline-none ${
                        q.correct_index === optIdx ? 'border-emerald-500 bg-emerald-50/50 font-bold' : 'border-slate-200'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons Elevated at Bottom (Sticky inside modal - 100% visible & clickable) */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 pb-6 border-t border-slate-200 shadow-2xl z-30 mt-auto flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl transition cursor-pointer"
        >
          انصراف
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg shadow-amber-200 flex justify-center items-center gap-1.5 transition-all cursor-pointer"
        >
          <CheckCircle2 size={16} /> ذخیره آزمون و فعال‌سازی تصحیح خودکار
        </button>
      </div>
    </div>
  );
}
