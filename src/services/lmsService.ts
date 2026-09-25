import { 
  AcademicRecord, 
  AttendanceRecord, 
  CourseAttendanceSummary, 
  Exam, 
  ExamQuestion, 
  ExamSubmission, 
  Certificate, 
  LiveSession,
  AttendanceStatus 
} from '../types';

// Default initial seeds for realistic experience
const DEFAULT_ACADEMIC_RECORDS: AcademicRecord[] = [
  {
    id: 'rec_101',
    user_id: 'usr_current',
    course_title: 'مبانی فقه استدلالی و اجتهاد',
    term: 'نیم‌سال اول ۱۴۰۳-۱۴۰۴',
    instructor: 'استاد آیت‌الله مکارم شیرازی',
    grade: 19.5,
    max_grade: 20,
    status: 'passed',
    certificate_id: 'CERT-MFIH-1403-8821',
    certificate_code: 'MFIH-8821',
    absence_count: 1,
    max_allowed_absences: 3,
    year: '۱۴۰۳',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'rec_102',
    user_id: 'usr_current',
    course_title: 'منطق و اصول فقه تطبیقی',
    term: 'نیم‌سال دوم ۱۴۰۲-۱۴۰۳',
    instructor: 'استاد دکتر علوی',
    grade: 18.0,
    max_grade: 20,
    status: 'passed',
    certificate_id: 'CERT-MFIH-1403-5412',
    certificate_code: 'MFIH-5412',
    absence_count: 2,
    max_allowed_absences: 3,
    year: '۱۴۰۳',
    created_at: '2024-06-20T10:00:00Z'
  },
  {
    id: 'rec_103',
    user_id: 'usr_current',
    course_title: 'تفسیر ترتیبی آیات‌الاحکام',
    term: 'تابستان ۱۴۰۲',
    instructor: 'استاد حسینی نژاد',
    grade: 17.75,
    max_grade: 20,
    status: 'passed',
    certificate_id: 'CERT-MFIH-1402-3319',
    certificate_code: 'MFIH-3319',
    absence_count: 0,
    max_allowed_absences: 3,
    year: '۱۴۰۲',
    created_at: '2023-09-10T10:00:00Z'
  }
];

const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'exam_c1',
    course_id: 1,
    title: 'آزمون جامع پایان ترم: هوش مصنوعی و پایتون',
    description: 'این آزمون شامل ۴ سوال چهارگزینه‌ای تخصصی با زمان محدود است. نمره قبولی حداقل ۱۲ از ۲۰ می‌باشد.',
    duration_minutes: 20,
    passing_score: 12,
    total_score: 20,
    is_active: true,
    questions: [
      {
        id: 'q1',
        question: 'کدام کتابخانه پایتون بیشترین کاربرد را در آموزش مدل‌های یادگیری عمیق (Deep Learning) دارد؟',
        options: ['PyTorch / TensorFlow', 'Pandas', 'Flask', 'BeautifulSoup'],
        correct_index: 0,
        score: 5
      },
      {
        id: 'q2',
        question: 'تفاوت اصلی یادگیری با نظارت (Supervised) و بدون نظارت (Unsupervised) در چیست؟',
        options: [
          'وجود داده‌های برچسب‌دار (Labeled Data) در یادگیری با نظارت',
          'سرعت اجرای الگوریتم‌ها',
          'زبان برنامه‌نویسی مورد استفاده',
          'هیچ تفاوتی ندارند'
        ],
        correct_index: 0,
        score: 5
      },
      {
        id: 'q3',
        question: 'در معماری Transformer، مکانیزم اصلی درک روابط میان کلمات کدام است؟',
        options: ['Self-Attention (توجه به خود)', 'Convolution', 'Pooling', 'Recurrent Backprop'],
        correct_index: 0,
        score: 5
      },
      {
        id: 'q4',
        question: 'تابع هزینه (Loss Function) در یادگیری ماشین چه وظیفه‌ای دارد؟',
        options: [
          'سنجش میزان خطای پیش‌بینی مدل نسبت به مقدار واقعی',
          'ذخیره وزن‌ها در هارد دیسک',
          'رسم نمودارهای آماری',
          'تولید داده‌های مصنوعی'
        ],
        correct_index: 0,
        score: 5
      }
    ]
  },
  {
    id: 'exam_c2',
    course_id: 2,
    title: 'آزمون رسمی React و TypeScript',
    description: 'آزمون سنجش مهارت‌های مدرن React 19، هوک‌ها و تایپ‌اسکریپت.',
    duration_minutes: 15,
    passing_score: 12,
    total_score: 20,
    is_active: true,
    questions: [
      {
        id: 'q2_1',
        question: 'هوک useEffect برای مدیریت چه مواردی در React استفاده می‌شود؟',
        options: ['Side Effects (عوارض جانبی)', 'طراحی CSS', 'تعریف روت‌ها', 'تنظیم متغیر محلی'],
        correct_index: 0,
        score: 10
      },
      {
        id: 'q2_2',
        question: 'مزیت استفاده از TypeScript در کنار React چیست؟',
        options: ['Type Safety و شناسایی خطاها پیش از اجرا', 'افزایش حجم فایل', 'حذف HTML', 'اجرای بدون کامپایلر'],
        correct_index: 0,
        score: 10
      }
    ]
  }
];

const DEFAULT_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live_1',
    course_id: 1,
    title: 'کارگاه آنلاین زنده: کدنویسی شبکه عصبی با PyTorch',
    scheduled_time: 'امروز ساعت ۱۸:۳۰',
    status: 'live',
    room_url: 'https://meet.jit.si/LMS_MFIH_Python_AI_Room',
    room_type: 'internal',
    instructor_name: 'دکتر علیرضا رضایی'
  },
  {
    id: 'live_2',
    course_id: 2,
    title: 'جلسه وبینار آنلاین: اصول طراحی State و معماری کامپوننت‌ها',
    scheduled_time: 'چهارشنبه ساعت ۱۹:۰۰',
    status: 'upcoming',
    room_url: 'https://meet.jit.si/LMS_MFIH_React_TS_Room',
    room_type: 'internal',
    instructor_name: 'مهندس حسینی'
  }
];

// Helper to get local data safely
const getStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStorage = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('Storage set failed', err);
  }
};

// -------------------------------------------------------------
// 1. سوابق گذشته (Past Records: Grades, Transcripts & Certificates)
// -------------------------------------------------------------

export const getAcademicRecords = async (userId: string): Promise<AcademicRecord[]> => {
  const records = getStorage<AcademicRecord[]>('lms_academic_records', DEFAULT_ACADEMIC_RECORDS);
  return records.filter(r => r.user_id === userId || r.user_id === 'usr_current');
};

export const addAcademicRecord = async (record: Omit<AcademicRecord, 'id' | 'created_at'>): Promise<AcademicRecord> => {
  const records = getStorage<AcademicRecord[]>('lms_academic_records', DEFAULT_ACADEMIC_RECORDS);
  const newRec: AcademicRecord = {
    ...record,
    id: `rec_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  setStorage('lms_academic_records', [newRec, ...records]);
  return newRec;
};

// -------------------------------------------------------------
// 2. حضور و غیاب دستی و خودکار + جمع‌بندی غیبت‌ها و حذف خودکار
// -------------------------------------------------------------

export const getAttendanceRecords = async (courseId: number, userId?: string): Promise<AttendanceRecord[]> => {
  const all = getStorage<AttendanceRecord[]>('lms_attendance_records', [
    {
      id: 'att_1',
      course_id: 1,
      user_id: 'usr_current',
      user_name: 'دانش‌پژوه نمونه',
      session_title: 'جلسه ۱: آشنایی با مبانی هوش مصنوعی و محیط پایتون',
      session_date: '۱۴۰۴/۰۶/۰۱',
      status: 'present',
      is_auto: true,
      duration_minutes: 85
    },
    {
      id: 'att_2',
      course_id: 1,
      user_id: 'usr_current',
      user_name: 'دانش‌پژوه نمونه',
      session_title: 'جلسه ۲: آرایه‌ها در NumPy و ساختارهای داده',
      session_date: '۱۴۰۴/۰۶/۰۸',
      status: 'absent',
      is_auto: false
    }
  ]);
  return all.filter(a => Number(a.course_id) === Number(courseId) && (!userId || a.user_id === userId || a.user_id === 'usr_current'));
};

/**
 * Record manual or auto attendance
 */
export const recordAttendance = async (
  record: Omit<AttendanceRecord, 'id' | 'created_at'>
): Promise<{ success: boolean; record: AttendanceRecord; summary: CourseAttendanceSummary }> => {
  const all = getStorage<AttendanceRecord[]>('lms_attendance_records', []);
  
  // Check if session record already exists for this user
  const existingIdx = all.findIndex(
    a => Number(a.course_id) === Number(record.course_id) && 
         a.user_id === record.user_id && 
         a.session_title === record.session_title
  );

  const newRec: AttendanceRecord = {
    ...record,
    id: existingIdx >= 0 ? all[existingIdx].id : `att_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    all[existingIdx] = newRec;
  } else {
    all.push(newRec);
  }

  setStorage('lms_attendance_records', all);

  // Recalculate summary and auto-drop if exceeds limit
  const summary = await getCourseAttendanceSummary(Number(record.course_id), record.user_id, record.user_name || 'کاربر');
  return { success: true, record: newRec, summary };
};

/**
 * Calculate automated absences summary and check auto-drop threshold
 */
export const getCourseAttendanceSummary = async (
  courseId: number, 
  userId: string,
  userName = 'کاربر'
): Promise<CourseAttendanceSummary> => {
  const records = await getAttendanceRecords(courseId, userId);
  const maxAllowed = 3; // Max absences allowed per course rule

  let present = 0;
  let absent = 0;
  let justified = 0;
  let tardy = 0;

  records.forEach(r => {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'justified') justified++;
    else if (r.status === 'tardy') tardy++;
  });

  const total = records.length;
  const isDropped = absent > maxAllowed;
  const isWarning = absent === maxAllowed;

  // Persist drop status in enrollment record
  if (isDropped) {
    const droppedList = getStorage<string[]>('lms_dropped_students', []);
    const key = `${courseId}_${userId}`;
    if (!droppedList.includes(key)) {
      setStorage('lms_dropped_students', [...droppedList, key]);
    }
  }

  return {
    user_id: userId,
    user_name: userName,
    course_id: courseId,
    total_sessions: total,
    present_count: present,
    absent_count: absent,
    justified_count: justified,
    tardy_count: tardy,
    max_allowed_absences: maxAllowed,
    status: isDropped ? 'dropped_absence' : (isWarning ? 'warning' : 'active'),
    is_dropped: isDropped
  };
};

/**
 * Check if a student is dropped from a course due to excessive absences
 */
export const isStudentDropped = (courseId: number, userId: string): boolean => {
  const droppedList = getStorage<string[]>('lms_dropped_students', []);
  return droppedList.includes(`${courseId}_${userId}`) || droppedList.includes(`${courseId}_usr_current`);
};

// -------------------------------------------------------------
// 3. امتحانات، تصحیح خودکار و ثبت نمرات (Exams & Auto-Grading)
// -------------------------------------------------------------

export const getCourseExams = async (courseId: number): Promise<Exam[]> => {
  const exams = getStorage<Exam[]>('lms_exams', DEFAULT_EXAMS);
  return exams.filter(e => Number(e.course_id) === Number(courseId));
};

export const createExam = async (exam: Omit<Exam, 'id' | 'created_at'>): Promise<Exam> => {
  const exams = getStorage<Exam[]>('lms_exams', DEFAULT_EXAMS);
  const newExam: Exam = {
    ...exam,
    id: `exam_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  setStorage('lms_exams', [newExam, ...exams]);
  return newExam;
};

/**
 * Automated grading engine for exam submission:
 * Evaluates choices, calculates percentage, marks pass/fail, and if passed,
 * AUTOMATICALLY issues the completion certificate!
 */
export const submitAndAutoGradeExam = async (
  exam: Exam,
  userId: string,
  userName: string,
  userAnswers: Record<string, number>,
  courseTitle = 'دوره آموزشی'
): Promise<{ submission: ExamSubmission; certificate?: Certificate }> => {
  let earnedScore = 0;
  let totalScore = 0;

  exam.questions.forEach(q => {
    const qScore = q.score || 5;
    totalScore += qScore;
    const selected = userAnswers[q.id];
    if (selected !== undefined && selected === q.correct_index) {
      earnedScore += qScore;
    }
  });

  const percentage = Math.round((earnedScore / (totalScore || 1)) * 100);
  const isPassed = earnedScore >= exam.passing_score;

  const submission: ExamSubmission = {
    id: `sub_${Date.now()}`,
    exam_id: exam.id,
    course_id: exam.course_id,
    user_id: userId,
    user_name: userName,
    answers: userAnswers,
    score: earnedScore,
    total_score: totalScore,
    percentage: percentage,
    status: isPassed ? 'passed' : 'failed',
    submitted_at: new Date().toISOString()
  };

  // Save submission
  const submissions = getStorage<ExamSubmission[]>('lms_exam_submissions', []);
  setStorage('lms_exam_submissions', [submission, ...submissions]);

  // If passed, trigger AUTOMATIC CERTIFICATE ISSUANCE!
  let certificate: Certificate | undefined;
  if (isPassed) {
    certificate = await issueCertificate({
      user_id: userId,
      course_id: exam.course_id,
      student_name: userName || 'دانش‌پژوه گرامی',
      course_title: courseTitle,
      instructor_name: 'موسسه آموزش عالی MFIH',
      final_score: earnedScore,
      max_score: totalScore,
      grade_text: percentage >= 90 ? 'عالی' : (percentage >= 75 ? 'بسیار خوب' : 'خوب')
    });
  }

  return { submission, certificate };
};

export const getStudentSubmissions = async (userId: string, courseId?: number): Promise<ExamSubmission[]> => {
  const submissions = getStorage<ExamSubmission[]>('lms_exam_submissions', []);
  return submissions.filter(s => (s.user_id === userId || s.user_id === 'usr_current') && (!courseId || Number(s.course_id) === Number(courseId)));
};

// -------------------------------------------------------------
// 4. صدور خودکار گواهی (Automatic Certificate Generation & Storage)
// -------------------------------------------------------------

export const issueCertificate = async (data: {
  user_id: string;
  course_id: number;
  student_name: string;
  national_id?: string;
  course_title: string;
  instructor_name: string;
  final_score: number;
  max_score: number;
  grade_text: string;
  duration_hours?: number;
}): Promise<Certificate> => {
  const certs = getStorage<Certificate[]>('lms_certificates', []);
  
  // Check if certificate already exists
  const existing = certs.find(c => Number(c.course_id) === Number(data.course_id) && (c.user_id === data.user_id || c.user_id === 'usr_current'));
  if (existing) return existing;

  const serial = Math.floor(100000 + Math.random() * 900000);
  const code = `MFIH-CERT-${serial}`;

  const newCert: Certificate = {
    id: `cert_${Date.now()}`,
    user_id: data.user_id,
    course_id: data.course_id,
    student_name: data.student_name,
    national_id: data.national_id || '---',
    course_title: data.course_title,
    instructor_name: data.instructor_name,
    final_score: data.final_score,
    max_score: data.max_score,
    grade_text: data.grade_text,
    issue_date: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
    verification_code: code,
    duration_hours: data.duration_hours || 45,
    qr_data: `https://lms.mfih.ir/verify/${code}`
  };

  setStorage('lms_certificates', [newCert, ...certs]);

  // Also add to academic past records!
  await addAcademicRecord({
    user_id: data.user_id,
    course_title: data.course_title,
    term: 'دوره جاری ۱۴۰۴-۱۴۰۵',
    instructor: data.instructor_name,
    grade: data.final_score,
    max_grade: data.max_score,
    status: 'passed',
    certificate_id: newCert.id,
    certificate_code: code,
    absence_count: 0,
    max_allowed_absences: 3,
    year: '۱۴۰۴'
  });

  return newCert;
};

export const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
  const certs = getStorage<Certificate[]>('lms_certificates', [
    {
      id: 'cert_seed_1',
      user_id: 'usr_current',
      course_id: 101,
      student_name: 'حجت‌الله آهنگ',
      national_id: '۲۱۴۰۳۴۵۶۷۸',
      course_title: 'مبانی فقه استدلالی و اجتهاد',
      instructor_name: 'استاد آیت‌الله مکارم شیرازی',
      final_score: 19.5,
      max_score: 20,
      grade_text: 'عالی',
      issue_date: '۱۵ دی ۱۴۰۳',
      verification_code: 'MFIH-8821',
      duration_hours: 60,
      qr_data: 'https://lms.mfih.ir/verify/MFIH-8821'
    }
  ]);
  return certs.filter(c => c.user_id === userId || c.user_id === 'usr_current');
};

// -------------------------------------------------------------
// 5. کلاس‌های آنلاین زنده و ثبت خودکار حضور در هنگام ورود
// -------------------------------------------------------------

export const getCourseLiveSessions = async (courseId: number): Promise<LiveSession[]> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/live_sessions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err: any) {
    console.warn('API get live sessions failed:', err.message);
  }
  const sessions = getStorage<LiveSession[]>('lms_live_sessions', DEFAULT_LIVE_SESSIONS);
  return sessions.filter(s => Number(s.course_id) === Number(courseId));
};

export const createLiveSession = async (
  courseId: number,
  sessionData: {
    title: string;
    scheduled_time: string;
    status?: 'upcoming' | 'live' | 'completed';
    room_url?: string;
    room_type?: 'internal' | 'external';
    instructor_name?: string;
  }
): Promise<{ success: boolean; session?: LiveSession; error?: string }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/live_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    if (res.ok) {
      const data = await res.json();
      const sessions = getStorage<LiveSession[]>('lms_live_sessions', DEFAULT_LIVE_SESSIONS);
      setStorage('lms_live_sessions', [data, ...sessions]);
      return { success: true, session: data };
    }
  } catch (err: any) {
    console.warn('API create live session failed:', err.message);
  }

  const newSession: LiveSession = {
    id: `live_${Date.now()}`,
    course_id: courseId,
    title: sessionData.title,
    scheduled_time: sessionData.scheduled_time,
    status: sessionData.status || 'upcoming',
    room_url: sessionData.room_url || `https://meet.jit.si/LMS_MFIH_Course_${courseId}_${Date.now()}`,
    room_type: sessionData.room_type || 'internal',
    instructor_name: sessionData.instructor_name || 'مدرس دوره'
  };
  const sessions = getStorage<LiveSession[]>('lms_live_sessions', DEFAULT_LIVE_SESSIONS);
  setStorage('lms_live_sessions', [newSession, ...sessions]);
  return { success: true, session: newSession };
};

export const deleteLiveSession = async (sessionId: string | number): Promise<{ success: boolean }> => {
  try {
    await fetch(`/api/live_sessions/${sessionId}`, { method: 'DELETE' });
  } catch (err: any) {
    console.warn('API delete live session failed:', err.message);
  }
  const sessions = getStorage<LiveSession[]>('lms_live_sessions', DEFAULT_LIVE_SESSIONS);
  setStorage('lms_live_sessions', sessions.filter(s => String(s.id) !== String(sessionId)));
  return { success: true };
};

export const joinLiveClassAndCheckIn = async (
  session: LiveSession,
  userId: string,
  userName: string
): Promise<{ success: boolean; attendanceRecord: AttendanceRecord }> => {
  // Automatically register student presence when entering online room
  const result = await recordAttendance({
    course_id: session.course_id,
    user_id: userId,
    user_name: userName,
    session_title: session.title,
    session_date: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date()),
    status: 'present',
    is_auto: true,
    duration_minutes: 60
  });

  return { success: true, attendanceRecord: result.record };
};
