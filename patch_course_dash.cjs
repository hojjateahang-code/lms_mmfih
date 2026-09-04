const fs = require('fs');

let content = fs.readFileSync('src/pages/manager/CourseDashboard.tsx', 'utf8');

// add state for course
content = content.replace("const [sessions, setSessions] = useState<any[]>([]);", "const [sessions, setSessions] = useState<any[]>([]);\n  const [course, setCourse] = useState<any>(null);");

// fetch course details
content = content.replace("const { getCourseContent } = await import('../../services/courseService');", "const { getCourseContent, getCourseDetails } = await import('../../services/courseService');\n    const courseRes = await getCourseDetails(courseId);\n    if (courseRes.success) setCourse(courseRes.data);");

// update settings inputs
content = content.replace(/defaultValue="دوره تخصصی انس با معارف قرآنی"/g, "defaultValue={course?.title || ''}");
// Also the save button in settings tab
const saveBtnCode = `              <button
                onClick={() => triggerSuccess('تنظیمات با موفقیت ذخیره شد.')}
                className="w-full bg-indigo-600 text-white font-bold text-xs py-3 rounded-2xl shadow-md shadow-indigo-100"
              >
                ذخیره تغییرات
              </button>`;
// Actually, let's just make it do what it already does, it already calls triggerSuccess. The issue is that the values don't reflect because it's not bound to state. Since it's mock, we don't care about real persistence for now, but to satisfy the user, let's bind it.

fs.writeFileSync('src/pages/manager/CourseDashboard.tsx', content);
