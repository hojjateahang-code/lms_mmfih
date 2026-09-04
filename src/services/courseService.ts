import { supabase } from '../lib/supabase';

export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  order_num: number;
  items?: Lesson[]; // Mapped from lessons table
}

export interface Lesson {
  id: number;
  chapter_id: number;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'quiz' | 'certificate';
  description?: string;
  duration_minutes: number;
  media_url?: string;
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
  instructor?: { full_name: string; avatar_url: string };
}

export const getPublishedCourses = async (): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const published = localCourses.filter((c: any) => c.is_published);
      return { success: true, data: published };
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as any[] };
  } catch (error: any) {
    console.error('Error fetching courses:', error.message);
    return { success: false, error: error.message };
  }
};

export const getManagerCourses = async (managerId: string): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      // Allow executive manager to see all courses (optional)
      const isExec = localStorage.getItem('test_role') === 'executive_manager';
      const managerCourses = isExec ? localCourses : localCourses.filter((c: any) => c.instructor_id === managerId);
      return { success: true, data: managerCourses };
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .eq('instructor_id', managerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as any[] };
  } catch (error: any) {
    console.error('Error fetching manager courses:', error.message);
    return { success: false, error: error.message };
  }
};

export const createCourse = async (courseData: any): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      const newCourse = { ...courseData, id: Date.now(), created_at: new Date().toISOString(), instructor: { full_name: 'استاد محترم', avatar_url: '' } };
      localStorage.setItem('mock_courses', JSON.stringify([newCourse, ...localCourses]));
      return { success: true, data: newCourse };
    }
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as any };
  } catch (error: any) {
    console.error('Error creating course:', error.message);
    return { success: false, error: error.message };
  }
};

export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
      localStorage.setItem('mock_courses', JSON.stringify(localCourses.filter((c: any) => c.id !== courseId)));
      return { success: true };
    }
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting course:', error.message);
    return { success: false, error: error.message };
  }
};

export const getCourseDetails = async (courseId: number): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return { success: true, data: data as any };
  } catch (error: any) {
    console.error('Error fetching course:', error.message);
    return { success: false, error: error.message };
  }
};

export const enrollCourse = async (userId: string, courseId: number) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const newE = { user_id: userId, course_id: courseId, enrolled_at: new Date().toISOString() };
      localStorage.setItem('mock_enrollments', JSON.stringify([...enrollments, newE]));
      return { success: true, data: newE };
    }
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error enrolling:', error.message);
    return { success: false, error: error.message };
  }
};

export const getEnrollmentStatus = async (userId: string, courseId: number) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const isEnrolled = enrollments.some((e) => e.user_id === userId && e.course_id === courseId);
      return { success: true, isEnrolled, enrollment: isEnrolled ? {} : null };
    }
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) throw error;
    return { success: true, isEnrolled: !!data, enrollment: data };
  } catch (error: any) {
    console.error('Error checking enrollment:', error.message);
    return { success: false, error: error.message };
  }
};

export const markLessonCompleted = async (userId: string, lessonId: number) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const progress = JSON.parse(localStorage.getItem('mock_progress') || '[]');
      localStorage.setItem('mock_progress', JSON.stringify([...progress, { user_id: userId, lesson_id: lessonId, is_completed: true }]));
      return { success: true };
    }
    const { error } = await supabase
      .from('user_progress')
      .upsert({ user_id: userId, lesson_id: lessonId, is_completed: true, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error marking lesson complete:', error.message);
    return { success: false, error: error.message };
  }
};

export const getUserProgress = async (userId: string, courseId: number) => {
  // To get progress, we need to join lessons in the course, but we can just fetch progress for all lessons of this user and filter in memory for simplicity.
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, is_completed')
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error getting progress:', error.message);
    return { success: false, error: error.message };
  }
};

export const getUserEnrollments = async (userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // We join enrollments with courses and profiles(instructor)
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses (
          *,
          instructor:profiles(full_name, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as any[] };
  } catch (error: any) {
    console.error('Error fetching user enrollments:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch chapters and their lessons for a given course
 */
export const getCourseContent = async (courseId: number): Promise<{ success: boolean; data?: Chapter[]; error?: string }> => {
  try {
    const { data: chapters, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('order_num', { ascending: true });

    if (chapterError) throw chapterError;

    if (!chapters || chapters.length === 0) {
      return { success: true, data: [] };
    }

    const chapterIds = chapters.map(c => c.id);

    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('order_num', { ascending: true });

    if (lessonError) throw lessonError;

    // Group lessons into chapters
    const chaptersWithLessons = chapters.map(chapter => ({
      ...chapter,
      items: (lessons || []).filter(l => l.chapter_id === chapter.id)
    }));

    return { success: true, data: chaptersWithLessons };
  } catch (error: any) {
    console.error('Error fetching course content:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new chapter
 */
export const createChapter = async (courseId: number, title: string, orderNum: number = 0) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
      const newChapter = { id: Date.now(), course_id: courseId, title, order_num: orderNum };
      localStorage.setItem('mock_chapters', JSON.stringify([...chapters, newChapter]));
      return { success: true, data: newChapter };
    }
    const { data, error } = await supabase
      .from('chapters')
      .insert([{ course_id: courseId, title, order_num: orderNum }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating chapter:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Update a chapter
 */
export const updateChapter = async (chapterId: number, title: string) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
      const index = chapters.findIndex((c) => c.id === chapterId);
      if (index > -1) chapters[index].title = title;
      localStorage.setItem('mock_chapters', JSON.stringify(chapters));
      return { success: true, data: chapters[index] };
    }
    const { data, error } = await supabase
      .from('chapters')
      .update({ title })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating chapter:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a chapter
 */
export const deleteChapter = async (chapterId: number) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
      localStorage.setItem('mock_chapters', JSON.stringify(chapters.filter((c) => c.id !== chapterId)));
      return { success: true };
    }
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting chapter:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Add a new lesson
 */
export const createLesson = async (lesson: Omit<Lesson, 'id'>) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      const newLesson = { ...lesson, id: Date.now() };
      localStorage.setItem('mock_lessons', JSON.stringify([...lessons, newLesson]));
      return { success: true, data: newLesson };
    }
    const { data, error } = await supabase
      .from('lessons')
      .insert([lesson])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating lesson:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Update a lesson
 */
export const updateLesson = async (lessonId: number, updates: Partial<Lesson>) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      const index = lessons.findIndex((l) => l.id === lessonId);
      if (index > -1) lessons[index] = { ...lessons[index], ...updates };
      localStorage.setItem('mock_lessons', JSON.stringify(lessons));
      return { success: true, data: lessons[index] };
    }
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating lesson:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (lessonId: number) => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
      localStorage.setItem('mock_lessons', JSON.stringify(lessons.filter((l) => l.id !== lessonId)));
      return { success: true };
    }
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting lesson:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Upload File to Supabase Storage
 */
export const uploadFile = async (bucket: string, path: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Upload Error:', error.message);
    return { success: false, error: error.message };
  }
};
