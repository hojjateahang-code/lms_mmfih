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
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    const localPublished = localCourses.filter((c: any) => c.is_published);

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true, data: localPublished };
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: true, data: localPublished };
    }

    const combined = [...(data || [])];
    for (const lc of localPublished) {
      if (!combined.some(c => Number(c.id) === Number(lc.id))) {
        combined.push(lc);
      }
    }

    return { success: true, data: combined };
  } catch (error: any) {
    console.error('Error fetching courses:', error.message);
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    return { success: true, data: localCourses.filter((c: any) => c.is_published) };
  }
};

export const getManagerCourses = async (managerId: string): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  try {
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    const isExec = localStorage.getItem('test_role') === 'executive_manager';
    const managerLocalCourses = isExec ? localCourses : localCourses.filter((c: any) => c.instructor_id === managerId);

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true, data: managerLocalCourses };
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: true, data: managerLocalCourses };
    }

    const combined = [...(data || [])];
    for (const lc of managerLocalCourses) {
      if (!combined.some(c => Number(c.id) === Number(lc.id))) {
        combined.push(lc);
      }
    }

    return { success: true, data: combined };
  } catch (error: any) {
    console.error('Error fetching manager courses:', error.message);
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    return { success: true, data: localCourses };
  }
};

export const createCourse = async (courseData: any): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  try {
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    const newCourse = { ...courseData, id: Date.now(), created_at: new Date().toISOString(), instructor: { full_name: 'استاد محترم', avatar_url: '' } };

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      localStorage.setItem('mock_courses', JSON.stringify([newCourse, ...localCourses]));
      return { success: true, data: newCourse };
    }
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      console.warn('Supabase createCourse error, using local fallback:', error.message);
      localStorage.setItem('mock_courses', JSON.stringify([newCourse, ...localCourses]));
      return { success: true, data: newCourse };
    }

    const created = data || newCourse;
    localStorage.setItem('mock_courses', JSON.stringify([created, ...localCourses]));
    return { success: true, data: created as any };
  } catch (error: any) {
    console.error('Error creating course:', error.message);
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    const newCourse = { ...courseData, id: Date.now(), created_at: new Date().toISOString(), instructor: { full_name: 'استاد محترم', avatar_url: '' } };
    localStorage.setItem('mock_courses', JSON.stringify([newCourse, ...localCourses]));
    return { success: true, data: newCourse };
  }
};

export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    localStorage.setItem('mock_courses', JSON.stringify(localCourses.filter((c: any) => Number(c.id) !== Number(courseId))));

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true };
    }
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.warn('Supabase deleteCourse error:', error.message);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting course:', error.message);
    return { success: false, error: error.message };
  }
};

export const getCourseDetails = async (courseId: number): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  try {
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    const localFound = localCourses.find((c: any) => Number(c.id) === Number(courseId));

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true, data: localFound };
    }
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .eq('id', courseId)
      .single();

    if (error || !data) {
      if (localFound) return { success: true, data: localFound };
      return { success: true, data: { id: courseId, title: 'عنوان دوره', description: '', category: 'عمومی', price: 0, cover_url: '', is_published: true, instructor_id: '' } };
    }
    return { success: true, data: data as any };
  } catch (error: any) {
    console.error('Error fetching course:', error.message);
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
    const localFound = localCourses.find((c: any) => Number(c.id) === Number(courseId));
    if (localFound) return { success: true, data: localFound };
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
      const isEnrolled = enrollments.some((e: any) => e.user_id === userId && Number(e.course_id) === Number(courseId));
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
    const localChapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
    const localLessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const courseLocalChapters = localChapters.filter((c: any) => Number(c.course_id) === Number(courseId));

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      const result = courseLocalChapters.map((ch: any) => ({
        ...ch,
        items: localLessons.filter((l: any) => Number(l.chapter_id) === Number(ch.id))
      }));
      return { success: true, data: result };
    }

    const { data: chapters, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('order_num', { ascending: true });

    let combinedChapters: Chapter[] = chapters ? (chapters as any[]) : [];

    if (chapterError || combinedChapters.length === 0) {
      combinedChapters = courseLocalChapters;
    } else {
      for (const lc of courseLocalChapters) {
        if (!combinedChapters.some(c => Number(c.id) === Number(lc.id))) {
          combinedChapters.push(lc);
        }
      }
    }

    if (combinedChapters.length === 0) {
      return { success: true, data: [] };
    }

    const chapterIds = combinedChapters.map(c => c.id);

    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('order_num', { ascending: true });

    const allLessons: Lesson[] = lessons ? (lessons as any[]) : [];
    for (const ll of localLessons) {
      if (!allLessons.some(l => Number(l.id) === Number(ll.id))) {
        allLessons.push(ll);
      }
    }

    // Group lessons into chapters
    const chaptersWithLessons = combinedChapters.map(chapter => ({
      ...chapter,
      items: allLessons.filter(l => Number(l.chapter_id) === Number(chapter.id))
    }));

    return { success: true, data: chaptersWithLessons };
  } catch (error: any) {
    console.error('Error fetching course content:', error.message);
    const localChapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
    const localLessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const courseLocalChapters = localChapters.filter((c: any) => Number(c.course_id) === Number(courseId));
    const result = courseLocalChapters.map((ch: any) => ({
      ...ch,
      items: localLessons.filter((l: any) => Number(l.chapter_id) === Number(ch.id))
    }));
    return { success: true, data: result };
  }
};

/**
 * Add a new chapter
 */
export const createChapter = async (courseId: number, title: string, orderNum: number = 0) => {
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
    const tempId = Date.now();
    const newChapter = { id: tempId, course_id: Number(courseId), title, order_num: orderNum };

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      localStorage.setItem('mock_chapters', JSON.stringify([...chapters, newChapter]));
      return { success: true, data: newChapter };
    }

    const { data, error } = await supabase
      .from('chapters')
      .insert([{ course_id: courseId, title, order_num: orderNum }])
      .select()
      .single();

    if (error || !data) {
      console.warn('Supabase createChapter error, using local fallback:', error?.message);
      localStorage.setItem('mock_chapters', JSON.stringify([...chapters, newChapter]));
      return { success: true, data: newChapter };
    }

    const savedChapter = { ...data, course_id: Number(courseId) };
    localStorage.setItem('mock_chapters', JSON.stringify([...chapters, savedChapter]));
    return { success: true, data: savedChapter };
  } catch (error: any) {
    console.error('Error creating chapter:', error.message);
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
    const newChapter = { id: Date.now(), course_id: Number(courseId), title, order_num: orderNum };
    localStorage.setItem('mock_chapters', JSON.stringify([...chapters, newChapter]));
    return { success: true, data: newChapter };
  }
};

/**
 * Update a chapter
 */
export const updateChapter = async (chapterId: number, title: string) => {
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
    const index = chapters.findIndex((c: any) => Number(c.id) === Number(chapterId));
    if (index > -1) {
      chapters[index].title = title;
      localStorage.setItem('mock_chapters', JSON.stringify(chapters));
    }

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true, data: index > -1 ? chapters[index] : { id: chapterId, title } };
    }

    const { data, error } = await supabase
      .from('chapters')
      .update({ title })
      .eq('id', chapterId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase updateChapter error:', error.message);
      return { success: true };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating chapter:', error.message);
    return { success: true };
  }
};

/**
 * Delete a chapter
 */
export const deleteChapter = async (chapterId: number) => {
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || '[]');
    localStorage.setItem('mock_chapters', JSON.stringify(chapters.filter((c: any) => Number(c.id) !== Number(chapterId))));

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true };
    }

    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) {
      console.warn('Supabase deleteChapter error:', error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting chapter:', error.message);
    return { success: true };
  }
};

/**
 * Add a new lesson
 */
export const createLesson = async (lesson: Omit<Lesson, 'id'>) => {
  try {
    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const tempId = Date.now();
    const newLesson = { ...lesson, id: tempId };

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      localStorage.setItem('mock_lessons', JSON.stringify([...lessons, newLesson]));
      return { success: true, data: newLesson };
    }

    const { data, error } = await supabase
      .from('lessons')
      .insert([lesson])
      .select()
      .single();

    if (error || !data) {
      console.warn('Supabase createLesson error, using local fallback:', error?.message);
      localStorage.setItem('mock_lessons', JSON.stringify([...lessons, newLesson]));
      return { success: true, data: newLesson };
    }

    const savedLesson = { ...data, chapter_id: Number(lesson.chapter_id) };
    localStorage.setItem('mock_lessons', JSON.stringify([...lessons, savedLesson]));
    return { success: true, data: savedLesson };
  } catch (error: any) {
    console.error('Error creating lesson:', error.message);
    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const newLesson = { ...lesson, id: Date.now() };
    localStorage.setItem('mock_lessons', JSON.stringify([...lessons, newLesson]));
    return { success: true, data: newLesson };
  }
};

/**
 * Update a lesson
 */
export const updateLesson = async (lessonId: number, updates: Partial<Lesson>) => {
  try {
    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const index = lessons.findIndex((l: any) => Number(l.id) === Number(lessonId));
    if (index > -1) {
      lessons[index] = { ...lessons[index], ...updates };
      localStorage.setItem('mock_lessons', JSON.stringify(lessons));
    }

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true, data: index > -1 ? lessons[index] : updates };
    }

    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase updateLesson error:', error.message);
      return { success: true };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating lesson:', error.message);
    return { success: true };
  }
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (lessonId: number) => {
  try {
    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    localStorage.setItem('mock_lessons', JSON.stringify(lessons.filter((l: any) => Number(l.id) !== Number(lessonId))));

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      return { success: true };
    }

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      console.warn('Supabase deleteLesson error:', error.message);
    }

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

