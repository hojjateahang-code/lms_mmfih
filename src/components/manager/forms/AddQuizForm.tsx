// src/components/manager/forms/AddQuizForm.tsx
import React, { useState } from 'react';
import { X, HelpCircle, AlertCircle, CheckCircle2, Clock, Award, Plus, Trash2 } from 'lucide-react';

interface AddQuizFormProps {
  onClose: () => void;
  onSave?: (quizData: any) => void;
}

export default function AddQuizForm({ onClose, onSave }: AddQuizFormProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [passScore, setPassScore] = useState('70');
  const [instructions, setInstructions] = useState('');
  const [questionsCount, setQuestionsCount] = useState(5);

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: title || 'آزمون جامع پایان فصل',
        duration: `${duration} دقیقه`,
        passScore: `${passScore}%`,
        instructions,
        questionsCount,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <h2 className="font-black text-slate-800 text-base flex items-center">
          <HelpCircle size={18} className="ml-2 text-amber-500" /> افزودن آزمون جامع
        </h2>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Quiz Title */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">عنوان آزمون</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: آزمون ارزیابی فصل اول و مفاهیم بلاغی"
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition shadow-sm"
          />
        </div>

        {/* Time and Pass Score */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Clock size={13} className="text-amber-500" /> زمان (دقیقه)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="مثلاً: 30"
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none text-center focus:border-amber-400 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
              <Award size={13} className="text-emerald-500" /> حداقل نمره قبولی (%)
            </label>
            <input
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(e.target.value)}
              placeholder="مثلاً: 70"
              className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none text-center focus:border-amber-400 font-bold"
            />
          </div>
        </div>

        {/* Rules & Guidelines */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center">
            <AlertCircle size={14} className="ml-1 text-slate-400" /> قوانین و توضیحات آزمون
          </label>
          <textarea 
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="دانش‌پژوه گرامی، لطفاً قبل از شروع آزمون، از اتصال اینترنت خود اطمینان حاصل کرده و به زمان آزمون توجه نمایید..." 
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-3xl p-4 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none shadow-sm"
          ></textarea>
        </div>

        {/* Question Counter Preview */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-3xl p-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-amber-900">بانک سوالات چهارگزینه‌ای</h4>
            <p className="text-[10px] text-amber-700 mt-0.5">تعداد سوالات پیش‌فرض این آزمون: {questionsCount} سوال</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuestionsCount(Math.max(1, questionsCount - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-800 font-black text-sm flex items-center justify-center shadow-xs"
            >
              -
            </button>
            <span className="text-xs font-bold text-amber-900 w-5 text-center">{questionsCount}</span>
            <button
              onClick={() => setQuestionsCount(questionsCount + 1)}
              className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-800 font-black text-sm flex items-center justify-center shadow-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-white p-4 border-t border-slate-100 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-2xl transition"
        >
          انصراف
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg shadow-amber-200 flex justify-center items-center transition-all"
        >
          <CheckCircle2 size={16} className="ml-1.5" /> ذخیره و طراحی سوالات
        </button>
      </div>
    </div>
  );
}
