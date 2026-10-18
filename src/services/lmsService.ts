// src/services/lmsService.ts
import { 
  AcademicRecord, 
  AttendanceRecord, 
  CourseAttendanceSummary, 
  Exam, 
  ExamSubmission, 
  Certificate, 
  LiveSession,
  AttendanceStatus 
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
 * Create or update an exam in unified backend
 */
export const createExam = async (exam: Partial<Exam>): Promise<{ success: boolean; data?: Exam; error?: string }> => {
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
 * Submit exam, evaluate score, and record into unified database
 */
export const submitAndAutoGradeExam = async (
  exam: Exam,
  userId: string,
  userName: string,
  answers: Record<string, number | string>
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
export const getStudentSubmissions = async (userId: string): Promise<ExamSubmission[]> => {
  try {
    const res = await fetch(`/api/submissions/user/${encodeURIComponent(userId)}`);
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
 * Attendance records for a course
 */
export const getCourseAttendance = async (courseId: number, userId?: string): Promise<AttendanceRecord[]> => {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`/api/courses/${courseId}/attendance${query}`);
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
 * Get attendance summary
 */
export const getCourseAttendanceSummary = async (
  courseId: number,
  userId: string,
  userName: string
): Promise<CourseAttendanceSummary> => {
  const records = await getCourseAttendance(courseId, userId);
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const justifiedCount = records.filter(r => r.status === 'justified').length;
  const tardyCount = records.filter(r => r.status === 'tardy').length;
  const totalSessions = Math.max(records.length, 1);
  const maxAllowedAbsences = 3;

  const isDropped = absentCount >= maxAllowedAbsences;
  const status: CourseAttendanceSummary['status'] = isDropped 
    ? 'dropped_absence' 
    : absentCount >= maxAllowedAbsences - 1 
      ? 'warning' 
      : 'active';

  return {
    user_id: userId,
    user_name: userName,
    course_id: courseId,
    total_sessions: totalSessions,
    present_count: presentCount,
    absent_count: absentCount,
    justified_count: justifiedCount,
    tardy_count: tardyCount,
    max_allowed_absences: maxAllowedAbsences,
    status,
    is_dropped: isDropped
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
  durationMinutes: number = 0
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
 * Live sessions
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

export const deleteCourseLiveSession = async (sessionId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/live_sessions/${sessionId}`, { method: 'DELETE' });
    if (res.ok) return { success: true };
    return { success: false, error: 'خطا در حذف کلاس زنده' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Aliases for component compatibility
export const getAcademicRecords = getStudentPastRecords;
export const getAttendanceRecords = getCourseAttendance;
export const createLiveSession = createCourseLiveSession;

export const addAcademicRecord = async (record: Partial<AcademicRecord>): Promise<{ success: boolean; data?: AcademicRecord }> => {
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
  } catch (e) {}
  return { success: true };
};

export const joinLiveClassAndCheckIn = async (session: LiveSession, userId: string, userName: string) => {
  return await recordAttendance(session.course_id, userId, userName, session.title, new Date().toLocaleDateString('fa-IR'), 'present', true, 60);
};

