// src/services/courseService.ts
export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  order_num: number;
  items?: Lesson[];
}

export interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'quiz' | 'certificate' | 'text' | 'image';
  description?: string;
  duration_minutes?: number;
  duration?: string;
  media_url?: string;
  video_url?: string;
  file_url?: string;
  content?: string;
  is_free: boolean;
  order_num: number;
}

export interface CourseData {
  id: number;
  instructor_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  cover_url: string;
  is_published: boolean;
  level?: string;
  rating?: number;
  students_count?: number;
  duration?: string;
  episodes_count?: number;
  instructor?: { full_name: string; avatar_url: string };
}

/**
 * Get all published courses from unified backend
 */
export const getPublishedCourses = async (): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  try {
    const res = await fetch('/api/courses');
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    }
    return { success: false, error: 'خطا در دریافت لیست دوره‌ها' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getManagerCourses = async (_managerId?: string): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  return await getPublishedCourses();
};

/**
 * Create a new course in unified backend
 */
export const createCourse = async (courseData: any): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در ساخت دوره' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete a course from unified backend
 */
export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    if (res.ok) return { success: true };
    return { success: false, error: 'خطا در حذف دوره' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Get single course details from unified backend
 */
export const getCourseDetails = async (courseId: number): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'دوره یافت نشد' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Enroll student in a course (with real unified wallet deduction and database enrollment)
 */
export const enrollCourse = async (userId: string, courseId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'خطا در ثبت‌نام دوره' };
    }

    return { success: true, data: data.enrollment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Check if a user is enrolled in a course
 */
export const getEnrollmentStatus = async (userId: string, courseId: number) => {
  try {
    const res = await fetch(`/api/enrollments/check?userId=${encodeURIComponent(userId)}&courseId=${courseId}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, isEnrolled: Boolean(data.isEnrolled) };
    }
    return { success: true, isEnrolled: false };
  } catch (e) {
    return { success: true, isEnrolled: false };
  }
};

/**
 * Mark a lesson as completed
 */
export const markLessonCompleted = async (userId: string, lessonId: number, courseId: number = 1) => {
  try {
    await fetch(`/api/courses/${courseId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, isCompleted: true }),
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

/**
 * Get user progress for a course
 */
export const getUserProgress = async (userId: string, courseId: number) => {
  try {
    const res = await fetch(`/api/courses/${courseId}/progress?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: true, data: [] };
  } catch (e) {
    return { success: true, data: [] };
  }
};

/**
 * Get all courses a student has enrolled in (with full course details from unified backend)
 */
export const getUserEnrollments = async (userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const res = await fetch(`/api/enrollments/user/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    }
    return { success: false, error: 'خطا در دریافت لیست ثبت‌نام‌ها' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Get all chapters and their lessons for a course
 */
export const getCourseContent = async (courseId: number): Promise<{ success: boolean; data?: Chapter[]; error?: string }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/chapters`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    }
    return { success: false, error: 'خطا در دریافت سرفصل‌ها' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Add a new chapter
 */
export const createChapter = async (courseId: number, title: string, orderNum: number = 0) => {
  try {
    const res = await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, title, order_num: orderNum }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ساخت فصل' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Update chapter title
 */
export const updateChapter = async (chapterId: number, title: string) => {
  try {
    const res = await fetch(`/api/chapters/${chapterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ویرایش فصل' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Delete a chapter
 */
export const deleteChapter = async (chapterId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' });
    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: 'خطا در حذف فصل' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Add a new lesson
 */
export const createLesson = async (lessonData: any) => {
  try {
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ایجاد درس' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Update an existing lesson
 */
export const updateLesson = async (lessonId: number, lessonData: any) => {
  try {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lessonData),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ویرایش درس' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (lessonId: number) => {
  try {
    const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: 'خطا در حذف درس' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
