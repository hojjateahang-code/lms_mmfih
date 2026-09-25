export interface UserProfile {
  id: string;
  eitaa_id: string;
  username: string;
  full_name: string;
  role: 'student' | 'executive_manager';
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
}

export interface Category {
  id: number;
  title: string;
  icon: string;
  bgColor: string;
  courses_count?: number;
}
