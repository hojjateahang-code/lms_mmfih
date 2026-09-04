const fs = require('fs');
let content = fs.readFileSync('src/pages/student/CourseDetailPage.tsx', 'utf8');

// 1. Fix handleCompleteLesson (remove setStudyModeLesson(null))
content = content.replace(
  /const handleCompleteLesson = async \(\) => \{[\s\S]*?setStudyModeLesson\(null\);\n  \};/m,
`  const handleCompleteLesson = async () => {
    if (user && studyModeLesson && !progress[studyModeLesson.id]) {
      const res = await markLessonCompleted(user.id, studyModeLesson.id);
      if (res.success) {
        setProgress(prev => ({ ...prev, [studyModeLesson.id]: true }));
      }
    }
    // We do NOT close the view here, let the user stay on the page.
  };`
);

// 2. Add 'Printer, Download' to lucide-react imports
content = content.replace(
  "CreditCard, X } from 'lucide-react'", 
  "CreditCard, X, Printer, Download } from 'lucide-react'"
);

// 3. Enhance Video Player (add a fallback dummy video)
const videoPlayerNew = `            <div className="w-full max-w-4xl mx-auto aspect-video bg-black flex items-center justify-center relative shadow-2xl rounded-3xl overflow-hidden mt-6 border border-slate-800">
              <video src={studyModeLesson.media_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'} controls className="w-full h-full object-cover" autoPlay />
            </div>`;
content = content.replace(
  /<div className="w-full aspect-video bg-black flex items-center justify-center relative shadow-2xl">[\s\S]*?<\/div>\s*<\/div>/,
  videoPlayerNew + "\n          "
);

// 4. Enhance Certificate UI
const certificateNew = `            <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
              <div className="print:hidden mb-6 text-center">
                <h3 className="text-2xl font-black mb-2 text-white">صدور گواهینامه</h3>
                <p className="text-sm text-slate-400">گواهینامه پایان دوره با موفقیت صادر شد.</p>
              </div>
              <div id="certificate-preview" className="bg-white text-slate-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-3xl w-full aspect-[1.414/1] flex flex-col items-center justify-center relative overflow-hidden mb-6 border-8 border-double border-amber-200 print:shadow-none print:border-none print:aspect-auto">
                <div className="absolute inset-0 bg-slate-50 opacity-50"></div>
                
                <Award size={64} className="text-amber-500 mb-4 relative z-10" />
                <h2 className="text-3xl font-black text-slate-900 mb-2 relative z-10">گواهینامه پایان دوره</h2>
                <h3 className="text-xl font-bold text-slate-600 mb-10 relative z-10">{course.title}</h3>
                
                <p className="text-sm text-slate-500 mb-3 relative z-10">این گواهی به پاس قدردانی از تلاش و پشتکار به:</p>
                <p className="text-3xl font-black text-indigo-900 mb-8 relative z-10 border-b-2 border-indigo-200 pb-3 px-12">{user?.full_name || 'دانش‌پژوه محترم'}</p>
                
                <p className="text-sm text-slate-500 relative z-10 max-w-lg text-center leading-relaxed">
                  اعطا می‌گردد که با موفقیت دوره آموزشی و آزمون‌های مربوطه را تحت نظارت مرکز آموزش و ارزیابی به پایان رسانده است.
                </p>
                
                <div className="flex justify-between w-full mt-16 px-8 md:px-16 relative z-10">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 border-b border-slate-300 pb-1 mb-1 w-24 mx-auto">مدرس دوره</div>
                    <div className="text-sm font-black text-slate-800">{course.instructor}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-300 flex items-center justify-center text-red-500/50 transform -rotate-12 font-bold text-xs">مهر رسمی</div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 border-b border-slate-300 pb-1 mb-1 w-24 mx-auto">تاریخ صدور</div>
                    <div className="text-sm font-black text-slate-800">{new Date().toLocaleDateString('fa-IR')}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 w-full max-w-3xl print:hidden">
                <button onClick={() => window.print()} className="flex-[2] py-4 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-2xl font-black text-sm transition shadow-lg flex justify-center gap-2 items-center">
                  <Download size={20} /> دانلود و چاپ گواهینامه (PDF)
                </button>
                <button onClick={() => setStudyModeLesson(null)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition border border-slate-700">
                  بازگشت به دوره
                </button>
              </div>
            </div>`;
            
content = content.replace(
  /<div className="flex-1 bg-slate-900 flex items-center justify-center p-6">\s*<div className="bg-slate-800 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl border border-slate-700 relative overflow-hidden">[\s\S]*?بازگشت به دوره\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/,
  certificateNew
);

fs.writeFileSync('src/pages/student/CourseDetailPage.tsx', content);
