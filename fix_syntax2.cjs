const fs = require('fs');
let content = fs.readFileSync('src/pages/student/CourseDetailPage.tsx', 'utf8');

const regex = /\) : studyModeLesson\.type === 'video' \|\| studyModeLesson\.type === 'audio' \? \([\s\S]*?\n          \)}/;

const replacementStr = `) : studyModeLesson.type === 'video' || studyModeLesson.type === 'audio' ? (
            <div className="w-full max-w-4xl mx-auto aspect-video bg-black flex items-center justify-center relative shadow-2xl rounded-3xl overflow-hidden mt-6 border border-slate-800">
              <video src={studyModeLesson.media_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'} controls className="w-full h-full object-cover" autoPlay />
            </div>
          ) : (
            <div className="flex-1 bg-slate-900 flex items-center justify-center p-6">
              <div className="bg-slate-800 p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-slate-700">
                <BookOpen size={48} className="mx-auto mb-4 text-indigo-400" />
                <h3 className="text-lg font-bold mb-2">{studyModeLesson.title}</h3>
                <p className="text-sm text-slate-400 mb-6">این محتوا به صورت متن/پی‌دی‌اف ارائه شده است.</p>
                <button className="w-full py-3 bg-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition">
                  دانلود محتوا
                </button>
              </div>
            </div>
          )}`;

content = content.replace(regex, replacementStr);
fs.writeFileSync('src/pages/student/CourseDetailPage.tsx', content);
