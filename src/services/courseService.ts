import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  instructor?: { full_name: string; avatar_url: string };
}

export const DEFAULT_COURSES: CourseData[] = [
  {
    id: 1,
    title: 'دوره جامع هوش مصنوعی و پایتون',
    description: 'آموزش برنامه‌نویسی پایتون از صفر تا صد همراه با یادگیری ماشین و شبکه‌های عصبی عمیق.',
    category: 'هوش مصنوعی',
    price: 1850000,
    cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    level: 'پیشرفته',
    is_published: true,
    instructor_id: 'usr_current',
    instructor: { full_name: 'دکتر محمدرضا حسینی', avatar_url: '' }
  },
  {
    id: 2,
    title: 'طراحی وب اپلیکیشن با React و TypeScript',
    description: 'یادگیری کامل فرانت‌اند مدرن، ریکت، تایپ‌اسکریپت و ساخت پروژه‌های واقعی.',
    category: 'برنامه‌نویسی',
    price: 1400000,
    cover_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
    level: 'متوسط',
    is_published: true,
    instructor_id: 'usr_2',
    instructor: { full_name: 'مهندس احمد رضایی', avatar_url: '' }
  },
  {
    id: 3,
    title: 'مدیریت استراتژیک کسب‌وکار و بازاریابی دیجیتال',
    description: 'راهکارهای رشد سریع کسب‌وکار، تحلیل بازار و کمپین‌های دیجیتال مارکتینگ موفق.',
    category: 'مدیریت',
    price: 2100000,
    cover_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    level: 'مقدماتی',
    is_published: true,
    instructor_id: 'usr_3',
    instructor: { full_name: 'دکتر علیرضا کاظمی', avatar_url: '' }
  }
];

export const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: 101,
    course_id: 1,
    title: 'فصل اول: آشنایی با مبانی و سرفصل‌ها',
    order_num: 1,
    items: [
      {
        id: 201,
        chapter_id: 101,
        title: 'جلسه ۱: معارفه و سرفصل‌های دوره',
        type: 'video',
        duration: '۳۰ دقیقه',
        duration_minutes: 30,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: 'در این جلسه با نقشه راه دوره، ابزارهای کدنویسی و اصول اولیه هوش مصنوعی آشنا می‌شویم.',
        is_free: true,
        order_num: 1
      },
      {
        id: 202,
        chapter_id: 101,
        title: 'جزوه آموزشی و اسلایدهای فصل اول',
        type: 'pdf',
        duration: 'فایل PDF',
        duration_minutes: 15,
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        content: 'فایل جامع اسلایدهای درس جهت مطالعه تکمیلی.',
        is_free: true,
        order_num: 2
      }
    ]
  },
  {
    id: 102,
    course_id: 1,
    title: 'فصل دوم: پایتون مقدماتی و ساختارهای داده',
    order_num: 2,
    items: [
      {
        id: 203,
        chapter_id: 102,
        title: 'جلسه ۲: متغیرها، لیست‌ها و دیکشنری‌ها در پایتون',
        type: 'video',
        duration: '۴۵ دقیقه',
        duration_minutes: 45,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        content: 'آموزش عملی کار با انواع ساختارهای داده در پایتون و نوشتن نخستین برنامه‌ها.',
        is_free: false,
        order_num: 1
      }
    ]
  }
];

export const getPublishedCourses = async (): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null');
  if (!localCourses || localCourses.length === 0) {
    localStorage.setItem('mock_courses', JSON.stringify(DEFAULT_COURSES));
  }
  const coursesToUse = localCourses && localCourses.length > 0 ? localCourses : DEFAULT_COURSES;
  const localPublished = coursesToUse.filter((c: any) => c.is_published);

  if (!isSupabaseConfigured) {
    return { success: true, data: localPublished };
  }

  try {
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
    return { success: true, data: localPublished };
  }
};

export const getManagerCourses = async (managerId: string): Promise<{ success: boolean; data?: CourseData[]; error?: string }> => {
  const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null') || DEFAULT_COURSES;
  const isExec = localStorage.getItem('test_role') === 'executive_manager';
  const managerLocalCourses = isExec ? localCourses : localCourses.filter((c: any) => c.instructor_id === managerId || c.instructor_id === 'usr_current' || c.instructor_id === 'demo-inst-1');

  if (!isSupabaseConfigured) {
    return { success: true, data: managerLocalCourses };
  }

  try {
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
    return { success: true, data: managerLocalCourses };
  }
};

export const createCourse = async (courseData: any): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null') || DEFAULT_COURSES;
  const newCourse = { 
    ...courseData, 
    id: Date.now(), 
    created_at: new Date().toISOString(), 
    instructor: { full_name: 'استاد محترم', avatar_url: '' } 
  };
  localStorage.setItem('mock_courses', JSON.stringify([newCourse, ...localCourses]));

  if (!isSupabaseConfigured) {
    return { success: true, data: newCourse };
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      return { success: true, data: newCourse };
    }

    return { success: true, data: data || newCourse };
  } catch (error: any) {
    return { success: true, data: newCourse };
  }
};

export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: string }> => {
  const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null') || DEFAULT_COURSES;
  localStorage.setItem('mock_courses', JSON.stringify(localCourses.filter((c: any) => Number(c.id) !== Number(courseId))));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('courses').delete().eq('id', courseId);
    } catch (e) {
      // Ignored
    }
  }

  return { success: true };
};

export const getCourseDetails = async (courseId: number): Promise<{ success: boolean; data?: CourseData; error?: string }> => {
  const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null') || DEFAULT_COURSES;
  const localFound = localCourses.find((c: any) => Number(c.id) === Number(courseId));

  if (!isSupabaseConfigured) {
    return { success: true, data: localFound || DEFAULT_COURSES[0] };
  }

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .eq('id', courseId)
      .single();

    if (error || !data) {
      return { success: true, data: localFound || DEFAULT_COURSES[0] };
    }
    return { success: true, data: data as any };
  } catch (error: any) {
    return { success: true, data: localFound || DEFAULT_COURSES[0] };
  }
};

/**
 * Enroll student in a course
 */
export const enrollCourse = async (userId: string, courseId: number): Promise<{ success: boolean; data?: any; error?: string }> => {
  const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
  const existing = enrollments.find(
    (e: any) => (e.user_id === userId || (userId === 'usr_current' && e.user_id === 'usr_current')) && Number(e.course_id) === Number(courseId)
  );

  let newE = existing;
  if (!existing) {
    newE = { 
      id: `enr_${Date.now()}`,
      user_id: userId, 
      course_id: Number(courseId), 
      enrolled_at: new Date().toISOString() 
    };
    localStorage.setItem('mock_enrollments', JSON.stringify([...enrollments, newE]));
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('enrollments').insert({ user_id: userId, course_id: courseId });
    } catch (e) {
      // Ignored
    }
  }

  return { success: true, data: newE };
};

export const getEnrollmentStatus = async (userId: string, courseId: number) => {
  const enrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
  const isEnrolled = enrollments.some(
    (e: any) => (e.user_id === userId || e.user_id === 'usr_current' || userId === 'usr_current') && Number(e.course_id) === Number(courseId)
  );

  return { success: true, isEnrolled, enrollment: isEnrolled ? { user_id: userId, course_id: courseId } : null };
};

export const markLessonCompleted = async (userId: string, lessonId: number) => {
  const progress = JSON.parse(localStorage.getItem('mock_progress') || '[]');
  localStorage.setItem('mock_progress', JSON.stringify([...progress, { user_id: userId, lesson_id: lessonId, is_completed: true }]));

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('user_progress')
        .upsert({ user_id: userId, lesson_id: lessonId, is_completed: true, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' });
    } catch (e) {
      // Ignored
    }
  }

  return { success: true };
};

export const getUserProgress = async (userId: string, courseId: number) => {
  const progress = JSON.parse(localStorage.getItem('mock_progress') || '[]');
  const userProg = progress.filter((p: any) => p.user_id === userId || p.user_id === 'usr_current');
  return { success: true, data: userProg };
};

/**
 * Get all courses a student has enrolled in (with full course details)
 */
export const getUserEnrollments = async (userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const rawLocalEnrollments = JSON.parse(localStorage.getItem('mock_enrollments') || 'null');
    
    // If no enrollments exist at all, give an initial enrollment for course 1
    let enrollmentsToUse = rawLocalEnrollments;
    if (!enrollmentsToUse) {
      const defaultEnrollments = [
        { id: 'enr_init_1', user_id: userId, course_id: 1, enrolled_at: '2024-03-01T10:00:00Z' }
      ];
      localStorage.setItem('mock_enrollments', JSON.stringify(defaultEnrollments));
      enrollmentsToUse = defaultEnrollments;
    }

    const userEnrollments = enrollmentsToUse.filter(
      (e: any) => e.user_id === userId || (userId === 'usr_current' || e.user_id === 'usr_current')
    );

    // Get all courses from local/default
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null') || DEFAULT_COURSES;
    
    // Map enrollments to include full course object
    const populatedEnrollments = userEnrollments.map((enr: any) => {
      const course = localCourses.find((c: any) => Number(c.id) === Number(enr.course_id)) || DEFAULT_COURSES.find(c => Number(c.id) === Number(enr.course_id)) || {
        id: Number(enr.course_id),
        title: enr.course_title || `دوره آموزشی شماره ${enr.course_id}`,
        cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        instructor: { full_name: 'استاد محترم', avatar_url: '' },
        price: 0,
        category: 'عمومی'
      };
      return {
        ...enr,
        course
      };
    });

    if (!isSupabaseConfigured) {
      return { success: true, data: populatedEnrollments };
    }

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

    if (error) {
      return { success: true, data: populatedEnrollments };
    }

    const combined = [...(data || [])];
    for (const pe of populatedEnrollments) {
      if (!combined.some(c => Number(c.course_id) === Number(pe.course_id))) {
        combined.push(pe);
      }
    }
    return { success: true, data: combined };
  } catch (error: any) {
    const rawLocalEnrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]') || [];
    const localCourses = JSON.parse(localStorage.getItem('mock_courses') || 'null') || DEFAULT_COURSES;
    const populated = rawLocalEnrollments.map((enr: any) => ({
      ...enr,
      course: localCourses.find((c: any) => Number(c.id) === Number(enr.course_id)) || DEFAULT_COURSES[0]
    }));
    return { success: true, data: populated };
  }
};

/**
 * Get all chapters and their lessons for a course
 */
export const getCourseContent = async (courseId: number): Promise<{ success: boolean; data?: Chapter[]; error?: string }> => {
  // Check if mock_chapters has been initialized in localStorage
  let localChapters = JSON.parse(localStorage.getItem('mock_chapters') || 'null');
  if (localChapters === null) {
    localStorage.setItem('mock_chapters', JSON.stringify(DEFAULT_CHAPTERS));
    localChapters = DEFAULT_CHAPTERS;
  }
  const localLessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
  const courseLocalChapters = localChapters.filter((c: any) => Number(c.course_id) === Number(courseId));

  const localResult: Chapter[] = courseLocalChapters.map((ch: any) => {
    const chLessons = [...(ch.items || [])];
    for (const l of localLessons) {
      if (Number(l.chapter_id) === Number(ch.id) && !chLessons.some(existing => Number(existing.id) === Number(l.id))) {
        chLessons.push(l);
      }
    }
    return {
      ...ch,
      items: chLessons
    };
  });

  // Try real PostgreSQL Backend API if available
  try {
    const res = await fetch(`/api/courses/${courseId}/chapters`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { success: true, data };
      }
    }
  } catch (e: any) {
    // API not reachable
  }

  return { success: true, data: localResult };
};

/**
 * Add a new chapter
 */
export const createChapter = async (courseId: number, title: string, orderNum: number = 0) => {
  // 1. Always save locally immediately
  const chapters = JSON.parse(localStorage.getItem('mock_chapters') || 'null') || DEFAULT_CHAPTERS;
  const tempId = Date.now();
  const newChapter: Chapter = { 
    id: tempId, 
    course_id: Number(courseId), 
    title, 
    order_num: orderNum,
    items: []
  };
  localStorage.setItem('mock_chapters', JSON.stringify([...chapters, newChapter]));

  // 2. Try PostgreSQL backend
  try {
    const res = await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId, title, order_num: orderNum })
    });
    if (res.ok) {
      const saved = await res.json();
      return { success: true, data: saved };
    }
  } catch (err: any) {
    // Local fallback is already active
  }

  return { success: true, data: newChapter };
};

/**
 * Update chapter title
 */
export const updateChapter = async (chapterId: number, title: string) => {
  // Update local storage
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || 'null') || DEFAULT_CHAPTERS;
    const index = chapters.findIndex((c: any) => Number(c.id) === Number(chapterId));
    if (index > -1) {
      chapters[index].title = title;
      localStorage.setItem('mock_chapters', JSON.stringify(chapters));
    }
  } catch (e) {
    // Ignored
  }

  try {
    const res = await fetch(`/api/chapters/${chapterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (res.ok) {
      const updated = await res.json();
      return { success: true, data: updated };
    }
  } catch (err: any) {
    // Ignored
  }

  return { success: true, data: { id: chapterId, title } };
};

/**
 * Delete a chapter permanently (both from DB and local storage)
 */
export const deleteChapter = async (chapterId: number) => {
  // 1. Delete from localStorage (both chapter and its lessons)
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || 'null') || DEFAULT_CHAPTERS;
    const updated = chapters.filter((c: any) => Number(c.id) !== Number(chapterId));
    localStorage.setItem('mock_chapters', JSON.stringify(updated));

    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const updatedLessons = lessons.filter((l: any) => Number(l.chapter_id) !== Number(chapterId));
    localStorage.setItem('mock_lessons', JSON.stringify(updatedLessons));
  } catch (err) {
    console.warn('Local chapter delete error:', err);
  }

  // 2. Also try API if backend is running
  try {
    await fetch(`/api/chapters/${chapterId}`, { method: 'DELETE' });
  } catch (err: any) {
    // Ignored
  }

  return { success: true };
};

/**
 * Add a new lesson
 */
export const createLesson = async (lesson: any) => {
  // 1. Save locally first
  const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
  const tempLesson: Lesson = {
    id: Date.now(),
    chapter_id: Number(lesson.chapter_id),
    title: lesson.title,
    type: lesson.type || 'video',
    duration: lesson.duration || `${lesson.duration_minutes || 30} دقیقه`,
    duration_minutes: lesson.duration_minutes || 30,
    video_url: lesson.video_url || '',
    file_url: lesson.file_url || '',
    content: lesson.content || '',
    is_free: !!lesson.is_free,
    order_num: lesson.order_num || 0
  };
  localStorage.setItem('mock_lessons', JSON.stringify([...lessons, tempLesson]));

  // Also attach to chapter in mock_chapters
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || 'null') || DEFAULT_CHAPTERS;
    const chIdx = chapters.findIndex((c: any) => Number(c.id) === Number(lesson.chapter_id));
    if (chIdx > -1) {
      if (!chapters[chIdx].items) chapters[chIdx].items = [];
      chapters[chIdx].items.push(tempLesson);
      localStorage.setItem('mock_chapters', JSON.stringify(chapters));
    }
  } catch (e) {
    // Ignored
  }

  // 2. Try PostgreSQL API
  try {
    const res = await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapter_id: lesson.chapter_id,
        title: lesson.title,
        type: lesson.type || 'video',
        duration: lesson.duration || `${lesson.duration_minutes || 30} دقیقه`,
        is_free: !!lesson.is_free,
        video_url: lesson.video_url || '',
        file_url: lesson.file_url || '',
        content: lesson.content || '',
        order_num: lesson.order_num || 0
      })
    });
    if (res.ok) {
      const saved = await res.json();
      return { success: true, data: saved };
    }
  } catch (err: any) {
    // Local fallback is active
  }

  return { success: true, data: tempLesson };
};

/**
 * Update an existing lesson
 */
export const updateLesson = async (lessonId: number, updates: any) => {
  try {
    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    const idx = lessons.findIndex((l: any) => Number(l.id) === Number(lessonId));
    if (idx > -1) {
      lessons[idx] = { ...lessons[idx], ...updates };
      localStorage.setItem('mock_lessons', JSON.stringify(lessons));
    }
  } catch (e) {
    // Ignored
  }

  try {
    const res = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updated = await res.json();
      return { success: true, data: updated };
    }
  } catch (err: any) {
    // Ignored
  }

  return { success: true, data: { id: lessonId, ...updates } };
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (lessonId: number) => {
  try {
    const lessons = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
    localStorage.setItem('mock_lessons', JSON.stringify(lessons.filter((l: any) => Number(l.id) !== Number(lessonId))));
  } catch (err) {
    // Ignored
  }

  // Also remove from mock_chapters items
  try {
    const chapters = JSON.parse(localStorage.getItem('mock_chapters') || 'null');
    if (chapters) {
      chapters.forEach((c: any) => {
        if (c.items) {
          c.items = c.items.filter((i: any) => Number(i.id) !== Number(lessonId));
        }
      });
      localStorage.setItem('mock_chapters', JSON.stringify(chapters));
    }
  } catch (e) {
    // Ignored
  }

  try {
    await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
  } catch (err: any) {
    // Ignored
  }

  return { success: true };
};
