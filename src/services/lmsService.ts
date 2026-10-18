// src/services/lmsService.ts
import { 
  AcademicRecord, 
  AttendanceRecord, 
  CourseAttendanceSummary, 
  Exam, 
  ExamSubmission, 
  Certificate, 
  LiveSession,
  AttendanceStatus,
  QuestionBankItem,
  Category
} from '../types';

/**
 * Get all exams for a specific course from unified backend
 */
export const getCourseExams = async (courseId: number): Promise<Exam[]> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/exams`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Create an exam in unified backend (with option to persist questions in Question Bank)
 */
export const createExam = async (exam: Partial<Exam> & { save_to_question_bank?: boolean }): Promise<{ success: boolean; data?: Exam; error?: string }> => {
  try {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در ثبت آزمون' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Update an existing exam
 */
export const updateExam = async (examId: string, exam: Partial<Exam>): Promise<{ success: boolean; data?: Exam; error?: string }> => {
  try {
    const res = await fetch(`/api/exams/${examId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در ویرایش آزمون' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Duplicate an existing exam
 */
export const duplicateExam = async (examId: string): Promise<{ success: boolean; data?: Exam; error?: string }> => {
  try {
    const res = await fetch(`/api/exams/${examId}/duplicate`, {
      method: 'POST',
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در تکثیر آزمون' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Delete an exam
 */
export const deleteExam = async (examId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
    if (res.ok) return { success: true };
    return { success: false, error: 'خطا در حذف آزمون' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Question Bank APIs
 */
export const getQuestionBank = async (params?: { course_id?: number; difficulty?: string; type?: string; search?: string }): Promise<QuestionBankItem[]> => {
  try {
    const q = new URLSearchParams();
    if (params?.course_id) q.set('course_id', String(params.course_id));
    if (params?.difficulty && params.difficulty !== 'all') q.set('difficulty', params.difficulty);
    if (params?.type && params.type !== 'all') q.set('type', params.type);
    if (params?.search) q.set('search', params.search);

    const res = await fetch(`/api/question-bank?${q.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const addQuestionToBank = async (question: Partial<QuestionBankItem>): Promise<{ success: boolean; data?: QuestionBankItem; error?: string }> => {
  try {
    const res = await fetch('/api/question-bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در افزودن سوال به بانک' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteQuestionFromBank = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/question-bank/${id}`, { method: 'DELETE' });
    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const autoGenerateExamFromBank = async (config: {
  course_id: number;
  title: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  easy_count?: number;
  medium_count?: number;
  hard_count?: number;
  mc_count?: number;
  desc_count?: number;
  random_per_student?: boolean;
}): Promise<{ success: boolean; data?: Exam; error?: string }> => {
  try {
    const res = await fetch('/api/question-bank/auto-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.error || 'خطا در طراحی خودکار آزمون' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Submit exam, evaluate score, and record into unified database
 */
export const submitAndAutoGradeExam = async (
  exam: Exam,
  userId: string,
  userName: string,
  answers: Record<string, number | string>,
  courseTitle?: string
): Promise<{
  success: boolean;
  submission?: ExamSubmission;
  isPassed: boolean;
  score: number;
  totalScore: number;
  percentage: number;
  error?: string;
}> => {
  try {
    const res = await fetch(`/api/exams/${exam.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userName,
        answers,
        courseId: exam.course_id,
        courseTitle,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        isPassed: false,
        score: 0,
        totalScore: exam.total_score || 20,
        percentage: 0,
        error: data.error || 'خطا در ثبت و تصحیح آزمون',
      };
    }

    return {
      success: true,
      submission: data.submission,
      isPassed: data.isPassed,
      score: data.submission?.score || 0,
      totalScore: data.submission?.total_score || exam.total_score,
      percentage: data.submission?.percentage || 0,
    };
  } catch (err: any) {
    return {
      success: false,
      isPassed: false,
      score: 0,
      totalScore: exam.total_score || 20,
      percentage: 0,
      error: err.message,
    };
  }
};

/**
 * Get all exam submissions of a user
 */
export const getStudentSubmissions = async (userId: string, courseId?: number): Promise<ExamSubmission[]> => {
  try {
    const res = await fetch(`/api/submissions/user/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      let list: ExamSubmission[] = Array.isArray(data) ? data : [];
      if (courseId) {
        list = list.filter((s) => Number(s.course_id) === Number(courseId));
      }
      return list;
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Get all exam submissions of a course
 */
export const getCourseSubmissions = async (courseId: number): Promise<ExamSubmission[]> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/submissions`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Get student's academic transcripts and past records
 */
export const getStudentPastRecords = async (userId: string): Promise<AcademicRecord[]> => {
  try {
    const res = await fetch(`/api/academic-records/user/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Get certificates earned by student
 */
export const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
  try {
    const res = await fetch(`/api/certificates/user/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

/**
 * Public certificate verification
 */
export const verifyCertificate = async (code: string): Promise<{ valid: boolean; certificate?: Certificate }> => {
  try {
    const res = await fetch(`/api/certificates/verify/${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      return { valid: true, certificate: data };
    }
    return { valid: false };
  } catch (e) {
    return { valid: false };
  }
};

/**
 * Connected real attendance for course
 */
export interface CourseAttendanceDetails {
  records: AttendanceRecord[];
  sessions: LiveSession[];
  enrolledStudents: { userId: string; userName: string; avatarUrl?: string; enrolledAt?: string }[];
  summary: CourseAttendanceSummary[];
}

export const getCourseAttendanceDetails = async (courseId: number, userId?: string): Promise<CourseAttendanceDetails> => {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/courses/${courseId}/attendance${query}`);
    if (res.ok) {
      const data = await res.json();
      return {
        records: Array.isArray(data.records) ? data.records : (Array.isArray(data) ? data : []),
        sessions: Array.isArray(data.sessions) ? data.sessions : [],
        enrolledStudents: Array.isArray(data.enrolledStudents) ? data.enrolledStudents : [],
        summary: Array.isArray(data.summary) ? data.summary : [],
      };
    }
    return { records: [], sessions: [], enrolledStudents: [], summary: [] };
  } catch (e) {
    return { records: [], sessions: [], enrolledStudents: [], summary: [] };
  }
};

export const getCourseAttendance = async (courseId: number, userId?: string): Promise<AttendanceRecord[]> => {
  const details = await getCourseAttendanceDetails(courseId, userId);
  return details.records;
};

export const getCourseAttendanceSummary = async (
  courseId: number,
  userId: string,
  userName: string
): Promise<CourseAttendanceSummary> => {
  const details = await getCourseAttendanceDetails(courseId, userId);
  const found = details.summary.find((s) => String(s.user_id) === String(userId));
  if (found) return found;

  return {
    user_id: userId,
    user_name: userName,
    course_id: courseId,
    total_sessions: details.sessions.length || 1,
    present_count: details.records.filter((r) => String(r.user_id) === String(userId) && r.status === 'present').length,
    absent_count: details.records.filter((r) => String(r.user_id) === String(userId) && r.status === 'absent').length,
    justified_count: details.records.filter((r) => String(r.user_id) === String(userId) && r.status === 'justified').length,
    tardy_count: details.records.filter((r) => String(r.user_id) === String(userId) && r.status === 'tardy').length,
    max_allowed_absences: 3,
    status: 'active',
    is_dropped: false,
  };
};

/**
 * Record attendance session
 */
export const recordAttendance = async (
  courseId: number,
  userId: string,
  userName: string,
  sessionTitle: string,
  sessionDate: string,
  status: AttendanceStatus,
  isAuto: boolean = false,
  durationMinutes: number = 0,
  sessionId?: number | string
): Promise<{ success: boolean; record?: AttendanceRecord }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userName,
        sessionTitle,
        sessionDate,
        status,
        isAuto,
        durationMinutes,
        sessionId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, record: data.record };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
};

export const isStudentDropped = (_courseId: number, _userId: string): boolean => {
  return false;
};

/**
 * Live Sessions & Online Classes
 */
export const getCourseLiveSessions = async (courseId: number): Promise<LiveSession[]> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/live_sessions`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const createCourseLiveSession = async (
  courseId: number, 
  session: Partial<LiveSession>
): Promise<{ success: boolean; data?: LiveSession; error?: string }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/live_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در ایجاد کلاس آنلاین' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteCourseLiveSession = async (sessionId: number | string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/live_sessions/${sessionId}`, { method: 'DELETE' });
    if (res.ok) return { success: true };
    return { success: false, error: 'خطا در حذف کلاس زنده' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
export const deleteLiveSession = deleteCourseLiveSession;

export const startLiveSession = async (sessionId: number | string): Promise<{ success: boolean; session?: LiveSession; error?: string }> => {
  try {
    const res = await fetch(`/api/live_sessions/${sessionId}/start`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) return { success: true, session: data.session };
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const endLiveSession = async (sessionId: number | string): Promise<{ success: boolean; session?: LiveSession; error?: string }> => {
  try {
    const res = await fetch(`/api/live_sessions/${sessionId}/end`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) return { success: true, session: data.session };
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const joinLiveClassAndCheckIn = async (session: LiveSession, userId: string, userName: string) => {
  try {
    const res = await fetch(`/api/live_sessions/${session.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  return await recordAttendance(
    Number(session.course_id),
    userId,
    userName,
    session.title,
    new Date().toLocaleDateString('fa-IR'),
    'present',
    true,
    60,
    session.id
  );
};

/**
 * Favorites
 */
export const getUserFavorites = async (userId: string): Promise<number[]> => {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/favorites`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const toggleCourseFavorite = async (userId: string, courseId: number | string): Promise<{ success: boolean; isFavorite?: boolean }> => {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/favorites/${courseId}`, {
      method: 'POST',
    });
    if (res.ok) {
      return await res.json();
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
};

/**
 * Course Categories
 */
export const getCourseCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch('/api/courses/categories');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (e) {
    return [];
  }
};

// Aliases for compatibility
export const getAcademicRecords = getStudentPastRecords;
export const getAttendanceRecords = getCourseAttendance;
export const createLiveSession = createCourseLiveSession;

export const addAcademicRecord = async (record: Partial<AcademicRecord>): Promise<{ success: boolean; data?: AcademicRecord; error?: string }> => {
  try {
    const res = await fetch('/api/academic-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ثبت سابقه' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
