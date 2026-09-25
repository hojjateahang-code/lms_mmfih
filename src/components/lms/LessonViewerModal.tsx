// src/components/lms/LessonViewerModal.tsx
import React from 'react';
import { 
  X, 
  Video, 
  Music, 
  FileText, 
  CheckCircle, 
  Download, 
  ExternalLink, 
  HelpCircle, 
  Award, 
  Clock, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { Lesson } from '../../services/courseService';

interface LessonViewerModalProps {
  lesson: Lesson;
  isCompleted: boolean;
  onClose: () => void;
  onMarkComplete: () => void;
  onStartQuiz?: () => void;
  onViewCertificate?: () => void;
}

export default function LessonViewerModal({
  lesson,
  isCompleted,
  onClose,
  onMarkComplete,
  onStartQuiz,
  onViewCertificate
}: LessonViewerModalProps) {
  const mediaUrl = lesson.video_url || lesson.file_url || lesson.media_url || '';
  const isVideo = lesson.type === 'video' || (mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('.webm')));
  const isAudio = lesson.type === 'audio' || (mediaUrl && (mediaUrl.includes('.mp3') || mediaUrl.includes('.wav') || mediaUrl.includes('.ogg')));
  const isPdf = lesson.type === 'pdf' || (mediaUrl && mediaUrl.includes('.pdf'));

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              {lesson.type === 'video' && <Video className="text-blue-400" size={20} />}
              {lesson.type === 'audio' && <Music className="text-amber-400" size={20} />}
              {lesson.type === 'pdf' && <FileText className="text-rose-400" size={20} />}
              {lesson.type === 'quiz' && <HelpCircle className="text-amber-400" size={20} />}
              {lesson.type === 'certificate' && <Award className="text-emerald-400" size={20} />}
              {!['video', 'audio', 'pdf', 'quiz', 'certificate'].includes(lesson.type) && (
                <BookOpen className="text-indigo-400" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base truncate">{lesson.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-indigo-200 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={11} /> {lesson.duration || (lesson.duration_minutes ? `${lesson.duration_minutes} دقیقه` : 'جلسه آموزشی')}
                </span>
                {lesson.is_free && (
                  <span className="bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-bold">رایگان</span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-slate-300 hover:text-white shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* 1. Video Player Area */}
          {isVideo && (
            <div className="space-y-2">
              <div className="rounded-2xl overflow-hidden bg-black shadow-lg aspect-video flex items-center justify-center relative border border-slate-800">
                {mediaUrl ? (
                  <video 
                    controls 
                    playsInline 
                    className="w-full h-full object-contain"
                    src={mediaUrl}
                  >
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <Video size={40} className="mx-auto text-slate-600" />
                    <p className="text-xs font-bold text-slate-300">ویدیوی این جلسه در حال بارگذاری یا پردازش است</p>
                    <p className="text-[10px] text-slate-500">محتوای متنی و سرفصل‌ها را در زیر مطالعه فرمایید.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Audio Player Area */}
          {isAudio && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Music size={18} className="text-amber-600" />
                <h4 className="font-bold text-xs text-amber-900">فایل صوتی جلسه آموزشی</h4>
              </div>
              {mediaUrl ? (
                <audio controls className="w-full" src={mediaUrl}>
                  مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                </audio>
              ) : (
                <p className="text-xs text-slate-500">فایل صوتی بارگذاری شده در دسترس است.</p>
              )}
            </div>
          )}

          {/* 3. PDF / Downloadable File Area */}
          {mediaUrl && (isPdf || (!isVideo && !isAudio)) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-800 truncate">فایل ضمیمه / جزوه آموزشی</h4>
                  <p className="text-[10px] text-slate-400 truncate">جهت مطالعه و دریافت نسخه کامل درس</p>
                </div>
              </div>

              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs"
              >
                <Download size={13} />
                <span>دانلود / نمایش</span>
              </a>
            </div>
          )}

          {/* 4. Lesson Content Text */}
          {lesson.content && (
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-2">
              <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-600" />
                متن و شرح درس
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {lesson.content}
              </p>
            </div>
          )}

          {/* 5. Special Type: Quiz */}
          {lesson.type === 'quiz' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 text-center">
              <HelpCircle size={32} className="text-amber-500 mx-auto" />
              <div>
                <h4 className="font-black text-sm text-amber-950">آزمون جامع این فصل</h4>
                <p className="text-xs text-amber-800 mt-1">
                  شامل سوالات چندگزینه‌ای با تصحیح خودکار آنی و ثبت نمره در پرونده تحصیلی.
                </p>
              </div>
              {onStartQuiz && (
                <button
                  onClick={() => {
                    onClose();
                    onStartQuiz();
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  ورود به اتاق آزمون
                </button>
              )}
            </div>
          )}

          {/* 6. Special Type: Certificate */}
          {lesson.type === 'certificate' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3 text-center">
              <Award size={36} className="text-emerald-500 mx-auto" />
              <div>
                <h4 className="font-black text-sm text-emerald-950">صدور رسمی گواهینامه پایان دوره</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  پس از قبولی در آزمون، گواهینامه رسمی با کد استعلام آنلاین و QR Code صادر می‌گردد.
                </p>
              </div>
              {onViewCertificate && (
                <button
                  onClick={() => {
                    onClose();
                    onViewCertificate();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  مشاهده گواهینامه
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer / Complete Lesson Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="flex items-center gap-1.5 text-xs">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 size={16} />
                تکمیل شده
              </span>
            ) : (
              <span className="text-slate-500 font-medium">وضعیت: در حال مطالعه</span>
            )}
          </div>

          <div className="flex gap-2">
            {!isCompleted && (
              <button
                onClick={() => {
                  onMarkComplete();
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle size={14} />
                <span>علامت‌گذاری به عنوان تکمیل‌شده</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
