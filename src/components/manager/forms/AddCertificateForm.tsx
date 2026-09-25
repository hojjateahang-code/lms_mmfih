// src/components/manager/forms/AddCertificateForm.tsx
import React, { useState } from 'react';
import { X, Award, ShieldCheck, CheckCircle2, FileCheck } from 'lucide-react';

interface AddCertificateFormProps {
  onClose: () => void;
  onSave?: (certData: any) => void;
}

export default function AddCertificateForm({ onClose, onSave }: AddCertificateFormProps) {
  const [autoIssue, setAutoIssue] = useState(true);
  const [certTitle, setCertTitle] = useState('گواهی پایان‌دوره تخصصی انس با معارف قرآنی');
  const [legalText, setLegalText] = useState(
    'بدینوسیله گواهی می‌شود که دانش‌پژوه گرامی دوره مذکور را با موفقیت و کسب نمره قبولی در آزمون جامع به پایان رسانده است.'
  );
  const [signatory, setSignatory] = useState('مدیریت آموزش و سنجش مدرسه عالی');

  const handleSave = () => {
    if (onSave) {
      onSave({
        certTitle,
        autoIssue,
        legalText,
        signatory,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white px-4 py-4 rounded-b-3xl shadow-sm flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
        <h2 className="font-black text-slate-800 text-base flex items-center">
          <Award size={18} className="ml-2 text-emerald-500" /> صدور گواهی دوره
        </h2>
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 transition active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* Notice Info Box */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 text-emerald-900 text-xs leading-relaxed font-medium flex items-start gap-2.5">
          <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            با فعال‌سازی این بخش، سیستم به طور خودکار پس از اتمام تمامی جلسات و قبولی در آزمون، یک گواهینامه معتبر رسمی همراه با QR Code استعلام اصالت با نام دانش‌پژوه صادر می‌کند.
          </span>
        </div>

        {/* Certificate Title */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">عنوان گواهی صادرشده</label>
          <input
            type="text"
            value={certTitle}
            onChange={(e) => setCertTitle(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-4 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition shadow-sm"
          />
        </div>

        {/* Auto-Issue Toggle */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">صدور خودکار مدرک</h3>
            <p className="text-[10px] text-slate-400 mt-1">بلافاصله پس از کسب حدنصاب آزمون، بدون نیاز به تایید دستی</p>
          </div>
          {/* iOS Toggle */}
          <button 
            type="button"
            onClick={() => setAutoIssue(!autoIssue)}
            className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 px-1 ${autoIssue ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${autoIssue ? '-translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Signatory Field */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">مرجع یا امضاکننده گواهی</label>
          <input
            type="text"
            value={signatory}
            onChange={(e) => setSignatory(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 outline-none focus:border-emerald-400 transition"
          />
        </div>

        {/* Legal Text / Certificate Body */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">متن پیش‌فرض گواهینامه</label>
          <textarea 
            rows={4}
            value={legalText}
            onChange={(e) => setLegalText(e.target.value)}
            placeholder="بدینوسیله گواهی می‌شود که..." 
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-3xl p-4 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none shadow-sm"
          ></textarea>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white p-4 border-t border-slate-100">
        <button
          onClick={handleSave}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-1.5 transition-all"
        >
          <FileCheck size={18} /> تایید و فعال‌سازی گواهی
        </button>
      </div>
    </div>
  );
}
