import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  Award, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { Certificate } from '../../types';

interface CertificateViewerModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export default function CertificateViewerModal({
  certificate,
  onClose
}: CertificateViewerModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={18} />
            <h3 className="text-xs sm:text-sm font-black">گواهی‌نامه رسمی پایان دوره آموزشی</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-amber-300"
            >
              <Printer size={14} />
              <span>چاپ / ذخیره PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-100 print:bg-white print:p-0">
          
          <div className="w-full max-w-xl bg-gradient-to-br from-[#fefbf6] via-[#fffdf9] to-[#faf5ec] p-6 sm:p-8 rounded-3xl border-8 border-double border-[#d4af37] shadow-xl relative text-center space-y-4 print:shadow-none print:border-8 print:rounded-none">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600 rounded-tr-lg pointer-events-none" />
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600 rounded-tl-lg pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600 rounded-br-lg pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600 rounded-bl-lg pointer-events-none" />

            {/* Emblem & Header */}
            <div className="space-y-1">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#fefbf6] rounded-full flex items-center justify-center text-amber-700">
                  <Award size={30} />
                </div>
              </div>
              <h2 className="text-xs font-black text-amber-800 tracking-wider">جمهوری اسلامی ایران</h2>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                سامانه جامع مدیریت آموزش و یادگیری (LMS MFIH)
              </h1>
              <div className="inline-block bg-amber-100/80 text-amber-900 border border-amber-300/80 px-4 py-0.5 rounded-full text-[11px] font-black mt-1">
                گواهی‌نامه رسمی پایان دوره آموزشی
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="py-2 text-xs sm:text-sm text-slate-700 leading-loose space-y-3 font-medium">
              <p>
                بدین‌وسیله گواهی می‌شود که دانش‌پژوه ارجمند
              </p>
              
              <div className="my-2">
                <span className="text-base sm:text-xl font-black text-indigo-950 border-b-2 border-amber-500/60 pb-1 px-4 inline-block">
                  جناب آقای / سرکار خانم {certificate.student_name}
                </span>
              </div>

              <p className="text-xs sm:text-xs leading-relaxed max-w-lg mx-auto">
                با موفقیت دوره تخصصی و سرفصل‌های آموزشی <strong>«{certificate.course_title}»</strong> را به مدت <strong>{certificate.duration_hours || 45} ساعت</strong> آموزشی با موفقیت به پایان رسانده و در ارزیابی و آزمون جامع نهایی، نمره <strong>{certificate.final_score} از {certificate.max_score}</strong> با رتبه <strong>«{certificate.grade_text}»</strong> را کسب نموده است.
              </p>
            </div>

            {/* Verification & Signatures Bar */}
            <div className="pt-4 border-t-2 border-amber-200/80 grid grid-cols-3 gap-2 items-center text-center">
              
              {/* QR Verification Code */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white border border-amber-300 rounded-xl p-1 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-[8px] font-mono text-white p-0.5">
                    <QrCode size={36} className="text-amber-400" />
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1" dir="ltr">
                  {certificate.verification_code}
                </span>
              </div>

              {/* Gold Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600 bg-amber-50/70 flex flex-col items-center justify-center text-amber-800">
                  <ShieldCheck size={20} className="text-amber-600" />
                  <span className="text-[8px] font-black mt-0.5">مهر و تایید اصالت</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1">
                  تاریخ: {certificate.issue_date}
                </span>
              </div>

              {/* Signatures */}
              <div className="text-center space-y-1">
                <div className="text-[10px] font-bold text-slate-800">معاونت آموزش و سنجش</div>
                <div className="font-serif italic text-xs text-indigo-900 font-bold">LMS MFIH Academy</div>
                <div className="text-[9px] text-emerald-700 font-black flex items-center justify-center gap-1">
                  <CheckCircle size={10} />
                  <span>معتبر و تاییدشده</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 print:hidden flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-indigo-600" />
          <span>اصالت این مدرک با کد رهگیری {certificate.verification_code} در سامانه ملی LMS MFIH قابل استعلام آنلاین است.</span>
        </div>

      </div>
    </div>
  );
}
