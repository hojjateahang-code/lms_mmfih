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
  Printer,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Exam, Certificate, ExamSubmission } from '../../types';
import { submitAndAutoGradeExam, getStudentSubmissions } from '../../services/lmsService';

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
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(exam.duration_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<{ submission: ExamSubmission; certificate?: Certificate } | null>(null);
  const [previousAttemptsCount, setPreviousAttemptsCount] = useState(0);
  const [attemptsExceeded, setAttemptsExceeded] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<ExamSubmission | null>(null);

  // Check previous attempts on mount
  useEffect(() => {
    const checkAttempts = async () => {
      const subs = await getStudentSubmissions(userId, exam.course_id);
      const examSubs = subs.filter(s => s.exam_id === exam.id);
      setPreviousAttemptsCount(examSubs.length);

      const maxAllowed = exam.max_attempts ?? 0;
      if (maxAllowed > 0 && examSubs.length >= maxAllowed) {
        setAttemptsExceeded(true);
        if (examSubs.length > 0) {
          setLastSubmission(examSubs[0]);
        }
      }
    };
    checkAttempts();
  }, [exam.id, userId]);

  // Timer countdown
  useEffect(() => {
    if (examResult || attemptsExceeded || timeLeftSeconds <= 0) return;

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
  }, [timeLeftSeconds, examResult, attemptsExceeded]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (examResult || attemptsExceeded) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleDescriptiveChange = (questionId: string, text: string) => {
    if (examResult || attemptsExceeded) return;
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting || examResult || attemptsExceeded) return;
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
  const isDescriptive = currentQ?.type === 'descriptive';

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="text-amber-400" size={18} />
              <span>{exam.title}</span>
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-indigo-200 mt-0.5">
              <span>{courseTitle}</span>
              {exam.max_attempts ? (
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
                  دفعات مجاز: {exam.max_attempts} بار (نوبت {previousAttemptsCount + 1})
                </span>
              ) : null}
            </div>
          </div>

          {!examResult && !attemptsExceeded && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-black ${
              timeLeftSeconds < 180 ? 'bg-rose-500/80 text-white animate-pulse' : 'bg-white/10 text-white'
            }`}>
              <Clock size={14} />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>
          )}

          {(examResult || attemptsExceeded) && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* A. ATTEMPTS EXCEEDED SCREEN */}
          {attemptsExceeded && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <RotateCcw size={32} />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-800">سقف دفعات مجاز آزمون تکمیل شده است</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  شما حداکثر تعداد دفعات مجاز جهت شرکت در این آزمون ({exam.max_attempts} بار) را استفاده نموده‌اید.
                </p>
              </div>

              {lastSubmission && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-right">
                  <span className="text-xs font-black text-slate-700 block">آخرین کارنامه ثبت شده شما:</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">نمره کسب شده:</span>
                    <strong className="text-indigo-700 font-black">{lastSubmission.score} از {lastSubmission.total_score} ({lastSubmission.percentage}٪)</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">وضعیت:</span>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                      lastSubmission.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {lastSubmission.status === 'passed' ? 'قبول شده' : 'مردود'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. EXAM IN PROGRESS */}
          {!examResult && !attemptsExceeded && currentQ && (
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
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {isDescriptive ? 'سوال تشریحی' : 'سوال چهارگزینه‌ای'}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 leading-relaxed pt-1">
                      {currentQ.question}
                    </h4>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-md shrink-0 mr-2">
                    {currentQ.score} نمره
                  </span>
                </div>
              </div>

              {/* 1. Multiple Choice Options */}
              {!isDescriptive && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`w-full p-3.5 rounded-2xl text-right transition border text-xs font-bold flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs ring-1 ring-indigo-500/20' 
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
              )}

              {/* 2. Descriptive Question Textarea */}
              {isDescriptive && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    پاسخ تشریحی خود را در کادر زیر بنویسید:
                  </label>
                  <textarea
                    rows={6}
                    placeholder="پاسخ کامل، مستدل و دقیق خود را اینجا تایپ نمایید..."
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={(e) => handleDescriptiveChange(currentQ.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 leading-relaxed font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-xs"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>پاسخ شما به صورت خودکار ثبت و در کارنامه ارزیابی می‌گردد.</span>
                    <span>{((answers[currentQ.id] as string) || '').length} کاراکتر</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* C. EXAM RESULT (INSTANT AUTO-GRADING & REPORT CARD) */}
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
                  سامانه کارنامه نهایی شما را به صورت خودکار تصحیح و ثبت کرد.
                </p>
              </div>

              {/* Score summary cards */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block">نمره نهایی</span>
                  <span className="text-lg font-black text-indigo-700">{examResult.submission.score}</span>
                  <span className="text-[10px] text-slate-400 mr-0.5">از {examResult.submission.total_score}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block">درصد کسب شده</span>
                  <span className="text-lg font-black text-emerald-600">{examResult.submission.percentage}٪</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block">حدنصاب قبولی</span>
                  <span className="text-lg font-black text-slate-700">{exam.passing_score}</span>
                  <span className="text-[10px] text-slate-400 mr-0.5">از {examResult.submission.total_score}</span>
                </div>
              </div>

              {/* Breakdown of descriptive questions if any */}
              {exam.questions.some(q => q.type === 'descriptive') && (
                <div className="space-y-2 text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <h5 className="font-black text-xs text-slate-800 flex items-center gap-1">
                    <FileText size={14} className="text-indigo-600" />
                    پاسخ‌های تشریحی و راهنمای استاد:
                  </h5>
                  {exam.questions.filter(q => q.type === 'descriptive').map((dq) => (
                    <div key={dq.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <p className="font-bold text-slate-800">{dq.question}</p>
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                        <span className="text-[10px] font-bold text-indigo-700 block mb-0.5">پاسخ ثبت شده شما:</span>
                        {answers[dq.id] ? String(answers[dq.id]) : '(بدون پاسخ)'}
                      </div>
                      {dq.sample_answer && (
                        <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg text-emerald-900">
                          <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">پاسخ نمونه استاد:</span>
                          {dq.sample_answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Automatic Certificate Issued Notification */}
              {examResult.certificate && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/60 rounded-2xl border border-amber-300/80 text-right space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Sparkles size={16} className="text-amber-600" />
                    <span>صدور خودکار گواهی رسمی پایان دوره!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    گواهی رسمی پایان دوره با شماره سریال معتبر <strong>{examResult.certificate.verification_code}</strong> به نام شما صادر گردید و در پرونده آموزشی‌تان ذخیره شد.
                  </p>
                  
                  <button
                    onClick={() => onViewCertificate && onViewCertificate(examResult.certificate!)}
                    className="w-full mt-2 bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-black text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 cursor-pointer"
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
          {!examResult && !attemptsExceeded ? (
            <>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight size={14} />
                سوال قبلی
              </button>

              {!isLastQuestion ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  سوال بعدی
                  <ArrowLeft size={14} />
                </button>
              ) : (
                <button
                  onClick={handleAutoSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-200 animate-pulse cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  {isSubmitting ? 'در حال تصحیح خودکار...' : 'ثبت و تصحیح نهایی آزمون'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-900 text-white transition cursor-pointer"
            >
              بازگشت به دوره
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
