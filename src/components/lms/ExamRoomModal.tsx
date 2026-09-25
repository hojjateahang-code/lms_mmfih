import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle,
  FileCheck,
  Sparkles,
  Printer
} from 'lucide-react';
import { Exam, Certificate, ExamSubmission } from '../../types';
import { submitAndAutoGradeExam } from '../../services/lmsService';

interface ExamRoomModalProps {
  exam: Exam;
  courseTitle: string;
  userId: string;
  userName: string;
  onClose: () => void;
  onViewCertificate?: (cert: Certificate) => void;
}

export default function ExamRoomModal({
  exam,
  courseTitle,
  userId,
  userName,
  onClose,
  onViewCertificate
}: ExamRoomModalProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.duration_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<{ submission: ExamSubmission; certificate?: Certificate } | null>(null);

  // Timer countdown
  useEffect(() => {
    if (examResult || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, examResult]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (examResult) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting || examResult) return;
    setIsSubmitting(true);
    const result = await submitAndAutoGradeExam(exam, userId, userName, answers, courseTitle);
    setExamResult(result);
    setIsSubmitting(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = exam.questions[currentQuestionIdx];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIdx === exam.questions.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-sans">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="text-amber-400" size={18} />
              <span>{exam.title}</span>
            </h3>
            <p className="text-[11px] text-indigo-200 mt-0.5">{courseTitle}</p>
          </div>

          {!examResult && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-black ${
              timeLeftSeconds < 180 ? 'bg-rose-500/80 text-white animate-pulse' : 'bg-white/10 text-white'
            }`}>
              <Clock size={14} />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>
          )}

          {examResult && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* EXAM IN PROGRESS */}
          {!examResult && currentQ && (
            <div className="space-y-4">
              
              {/* Progress Bar & Counter */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>سوال {currentQuestionIdx + 1} از {exam.questions.length}</span>
                <span>پاسخ داده شده: {answeredCount} از {exam.questions.length}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / exam.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-black text-sm text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h4>
                  <span className="bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-md shrink-0 mr-2">
                    {currentQ.score} نمره
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-3.5 rounded-2xl text-right transition border text-xs font-bold flex items-center justify-between ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm ring-1 ring-indigo-500/20' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="leading-relaxed">{opt}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mr-2 ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* EXAM RESULT (INSTANT AUTO-GRADING) */}
          {examResult && (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg border-4 border-white relative">
                {examResult.submission.status === 'passed' ? (
                  <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={44} />
                  </div>
                ) : (
                  <div className="w-full h-full bg-rose-500 rounded-full flex items-center justify-center text-white">
                    <XCircle size={44} />
                  </div>
                )}
              </div>

              <div>
                <h3 className={`font-black text-lg ${examResult.submission.status === 'passed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {examResult.submission.status === 'passed' ? 'تبریک! آزمون با موفقیت پاس شد' : 'متاسفانه حدنصاب قبولی کسب نشد'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  سامانه نمره شما را به صورت خودکار تصحیح و ثبت کرد.
                </p>
              </div>

              {/* Score summary cards */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold block">نمره نهایی</span>
                  <span className="text-lg font-black text-indigo-700">{examResult.submission.score}</span>
                  <span className="text-[10px] text-slate-400 mr-0.5">از {examResult.submission.total_score}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold block">درصد کسب شده</span>
                  <span className="text-lg font-black text-emerald-600">{examResult.submission.percentage}٪</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 font-bold block">حدنصاب قبولی</span>
                  <span className="text-lg font-black text-slate-700">{exam.passing_score}</span>
                  <span className="text-[10px] text-slate-400 mr-0.5">از {examResult.submission.total_score}</span>
                </div>
              </div>

              {/* Automatic Certificate Issued Notification */}
              {examResult.certificate && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl border border-amber-300/80 text-right space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Sparkles size={16} className="text-amber-600" />
                    <span>صدور خودکار گواهی رسمی پایان دوره!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    گواهی رسمی پایان دوره با شماره سریال معتبر <strong>{examResult.certificate.verification_code}</strong> به نام شما صادر گردید و در پرونده آموزشی‌تان ذخیره شد.
                  </p>
                  
                  <button
                    onClick={() => onViewCertificate && onViewCertificate(examResult.certificate!)}
                    className="w-full mt-2 bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-200"
                  >
                    <Award size={15} />
                    مشاهده و چاپ گواهی‌نامه رسمی
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {!examResult ? (
            <>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition flex items-center gap-1"
              >
                <ArrowRight size={14} />
                سوال قبلی
              </button>

              {!isLastQuestion ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-sm"
                >
                  سوال بعدی
                  <ArrowLeft size={14} />
                </button>
              ) : (
                <button
                  onClick={handleAutoSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-200 animate-pulse"
                >
                  <CheckCircle2 size={15} />
                  {isSubmitting ? 'در حال تصحیح خودکار...' : 'ثبت و تصحیح نهایی آزمون'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-900 text-white transition"
            >
              بازگشت به دوره
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
