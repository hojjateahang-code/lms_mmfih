const fs = require('fs');

let content = fs.readFileSync('src/services/courseService.ts', 'utf8');
const isMockCondition = "!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')";

const mockSnippets = {
  getCourseDetails: `    if (${isMockCondition}) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const course = localCourses.find((c) => c.id === courseId);
      return { success: true, data: course };
    }`,
  enrollCourse: `    if (${isMockCondition}) {
      const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const newE = { user_id: userId, course_id: courseId, enrolled_at: new Date().toISOString() };
      localStorage.setItem('mock_enrollments', JSON.stringify([...enrollments, newE]));
      return { success: true, data: newE };
    }`,
  getEnrollmentStatus: `    if (${isMockCondition}) {
      const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const isEnrolled = enrollments.some((e) => e.user_id === userId && e.course_id === courseId);
      return { success: true, isEnrolled, enrollment: isEnrolled ? {} : null };
    }`,
  markLessonCompleted: `    if (${isMockCondition}) {
      const progress = JSON.parse(localStorage.getItem('mock_progress') || '[]');
      localStorage.setItem('mock_progress', JSON.stringify([...progress, { user_id: userId, lesson_id: lessonId, is_completed: true }]));
      return { success: true };
    }`,
  getUserProgress: `    if (${isMockCondition}) {
      const progress = JSON.parse(localStorage.getItem('mock_progress') || '[]');
      return { success: true, data: progress.filter((p) => p.user_id === userId) };
    }`,
  getUserEnrollments: `    if (${isMockCondition}) {
      const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const userE = enrollments.filter((e) => e.user_id === userId).map((e) => {
        return { ...e, course: localCourses.find((c) => c.id === e.course_id) };
      });
      return { success: true, data: userE };
    }`,
  getCourseContent: `    if (${isMockCondition}) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]').filter((c) => c.course_id === courseId);
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      const chaptersWithLessons = chapters.map((chapter) => ({
        ...chapter,
        items: lessons.filter((l) => l.chapter_id === chapter.id)
      }));
      return { success: true, data: chaptersWithLessons };
    }`,
  createChapter: `    if (${isMockCondition}) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
      const newChapter = { id: Date.now(), course_id: courseId, title, order_num: orderNum };
      localStorage.setItem('mock_chapters', JSON.stringify([...chapters, newChapter]));
      return { success: true, data: newChapter };
    }`,
  updateChapter: `    if (${isMockCondition}) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
      const index = chapters.findIndex((c) => c.id === chapterId);
      if (index > -1) chapters[index].title = title;
      localStorage.setItem('mock_chapters', JSON.stringify(chapters));
      return { success: true, data: chapters[index] };
    }`,
  deleteChapter: `    if (${isMockCondition}) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
      localStorage.setItem('mock_chapters', JSON.stringify(chapters.filter((c) => c.id !== chapterId)));
      return { success: true };
    }`,
  createLesson: `    if (${isMockCondition}) {
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      const newLesson = { ...lesson, id: Date.now() };
      localStorage.setItem('mock_lessons', JSON.stringify([...lessons, newLesson]));
      return { success: true, data: newLesson };
    }`,
  updateLesson: `    if (${isMockCondition}) {
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      const index = lessons.findIndex((l) => l.id === lessonId);
      if (index > -1) lessons[index] = { ...lessons[index], ...updates };
      localStorage.setItem('mock_lessons', JSON.stringify(lessons));
      return { success: true, data: lessons[index] };
    }`,
  deleteLesson: `    if (${isMockCondition}) {
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      localStorage.setItem('mock_lessons', JSON.stringify(lessons.filter((l) => l.id !== lessonId)));
      return { success: true };
    }`,
  uploadFile: `    if (${isMockCondition}) {
      return { success: true, url: URL.createObjectURL(file) };
    }`
};

for (const [funcName, snippet] of Object.entries(mockSnippets)) {
  const regex = new RegExp("(export const " + funcName + " = async[^{]*\\{\\s*try \\{)", "g");
  content = content.replace(regex, "$1\n" + snippet);
}

fs.writeFileSync('src/services/courseService.ts', content);
