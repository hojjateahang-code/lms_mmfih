export type UserRole = 'student' | 'executive_manager' | 'teacher' | 'course_manager';

export interface UserProfile {
  id: string;
  eitaa_id: string;
  username: string;
  full_name: string;
  role: UserRole;
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
  is_favorite?: boolean;
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
  session_id?: number | string;
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

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface ExamQuestion {
  id: string;
  type?: 'multiple_choice' | 'descriptive';
  question: string;
  options?: string[]; // for multiple choice
  correct_index?: number; // for multiple choice
  sample_answer?: string; // for descriptive question guide / model answer
  score: number;
  difficulty?: QuestionDifficulty;
  tag?: string;
}

export interface Exam {
  id: string;
  course_id: number;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  total_score: number;
  max_attempts?: number; // 1, 2, 3, 5, or 0 (unlimited)
  questions: ExamQuestion[];
  is_active: boolean;
  randomize_options?: boolean;
  random_from_pool?: boolean;
  created_at?: string;
}

export interface QuestionBankItem {
  id: string;
  course_id?: number;
  course_title?: string;
  type: 'multiple_choice' | 'descriptive';
  question: string;
  options?: string[];
  correct_index?: number;
  sample_answer?: string;
  difficulty: QuestionDifficulty;
  tag?: string;
  score: number;
  created_at?: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  course_id: number;
  user_id: string;
  user_name: string;
  answers: Record<string, number | string>; // option index for multiple choice or text for descriptive
  score: number;
  total_score: number;
  percentage: number;
  status: 'passed' | 'failed' | 'pending_review';
  submitted_at: string;
  attempt_number?: number;
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
  id: number | string;
  course_id: number;
  title: string;
  scheduled_time: string;
  day_of_week?: string;
  start_time?: string;
  status: 'upcoming' | 'live' | 'ended' | 'completed';
  room_url: string;
  room_type: 'internal' | 'external' | 'skyroom' | 'jitsi' | 'meet';
  instructor_name: string;
  started_at?: string;
  ended_at?: string;
  created_at?: string;
}

export interface SupportMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  is_admin: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  subject: string;
  category: string;
  status: 'open' | 'answered' | 'closed';
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
}
