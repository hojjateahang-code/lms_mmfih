export interface UserProfile {
  id: string;
  eitaa_id: string;
  username: string;
  full_name: string;
  role: 'student' | 'executive_manager' | 'teacher';
  wallet_balance: number;
  avatar_url?: string;
  national_id?: string;
  phone?: string;
  city?: string;
  education_level?: string;
  father_name?: string;
  birth_date?: string;
  job?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category_id: number;
  category_name: string;
  price: number;
  original_price?: number;
  is_free?: boolean;
  is_new?: boolean;
  rating: number;
  students_count: number;
  episodes_count: number;
  duration: string;
  description: string;
  banner_url?: string;
  level: string;
  course_type?: 'online' | 'offline' | 'blended';
  max_absences?: number;
  passing_grade?: number;
  live_schedule?: string;
  live_room_url?: string;
}

export interface Category {
  id: number;
  title: string;
  icon: string;
  bgColor: string;
  courses_count?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'justified' | 'tardy';

export interface AttendanceRecord {
  id: string;
  course_id: number;
  user_id: string;
  user_name?: string;
  session_title: string;
  session_date: string;
  status: AttendanceStatus;
  is_auto: boolean;
  duration_minutes?: number;
  created_at?: string;
}

export interface CourseAttendanceSummary {
  user_id: string;
  user_name: string;
  course_id: number;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  justified_count: number;
  tardy_count: number;
  max_allowed_absences: number;
  status: 'active' | 'warning' | 'dropped_absence';
  is_dropped: boolean;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  score: number;
}

export interface Exam {
  id: string;
  course_id: number;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  total_score: number;
  questions: ExamQuestion[];
  is_active: boolean;
  created_at?: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  course_id: number;
  user_id: string;
  user_name: string;
  answers: Record<string, number>;
  score: number;
  total_score: number;
  percentage: number;
  status: 'passed' | 'failed';
  submitted_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: number;
  student_name: string;
  national_id?: string;
  course_title: string;
  instructor_name: string;
  final_score: number;
  max_score: number;
  grade_text: string;
  issue_date: string;
  verification_code: string;
  duration_hours?: number;
  qr_data: string;
}

export interface AcademicRecord {
  id: string;
  user_id: string;
  course_title: string;
  term: string;
  instructor: string;
  grade: number;
  max_grade: number;
  status: 'passed' | 'failed';
  certificate_id?: string;
  certificate_code?: string;
  absence_count: number;
  max_allowed_absences: number;
  year: string;
  created_at: string;
}

export interface LiveSession {
  id: string;
  course_id: number;
  title: string;
  scheduled_time: string;
  status: 'upcoming' | 'live' | 'ended';
  room_url: string;
  room_type: 'internal' | 'skyroom' | 'jitsi' | 'meet';
  instructor_name: string;
}
