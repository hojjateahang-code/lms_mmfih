import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

export const DEFAULT_USERS: any[] = [
  {
    id: 'usr_current',
    full_name: 'حجت‌الله آهنگ',
    username: 'H_ahang',
    phone: '۰۹۳۶۰۳۵۴۸۳۷',
    eitaa_id: 'H_ahang_ir',
    role: 'student',
    education_level: 'سطح ۲ حوزه علمیه',
    avatar_url: '',
    created_at: '2024-01-10T08:00:00Z'
  },
  {
    id: 'usr_2',
    full_name: 'محمدامین شمس',
    username: 'm_shams',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    eitaa_id: 'shams_qom',
    role: 'student',
    education_level: 'کارشناسی ارشد معارف',
    avatar_url: '',
    created_at: '2024-02-15T09:30:00Z'
  },
  {
    id: 'usr_3',
    full_name: 'فاطمه حسینی',
    username: 'f_hoseini',
    phone: '۰۹۳۵۹۸۷۶۵۴۳',
    eitaa_id: 'hoseini_edu',
    role: 'student',
    education_level: 'سطح ۳ فقه و اصول',
    avatar_url: '',
    created_at: '2024-03-01T11:20:00Z'
  },
  {
    id: 'usr_4',
    full_name: 'علیرضا رضایی',
    username: 'a_rezaei',
    phone: '۰۹۱۹۱۱۲۲۳۳۴',
    eitaa_id: 'rezaei_qur',
    role: 'student',
    education_level: 'دانشجوی دکتری علوم قرآن',
    avatar_url: '',
    created_at: '2024-04-12T14:10:00Z'
  },
  {
    id: 'usr_5',
    full_name: 'سمیه کریمی',
    username: 's_karimi',
    phone: '۰۹۳۰۴۴۵۵۶۶۷',
    eitaa_id: 'karimi_s',
    role: 'student',
    education_level: 'کارشناسی ادبیات عرب',
    avatar_url: '',
    created_at: '2024-05-20T16:00:00Z'
  },
  {
    id: 'demo_manager',
    full_name: 'مدیریت ارشد آموزشی',
    username: 'lms_admin',
    phone: '۰۹۱۲۰۰۰۰۰۰۰',
    eitaa_id: 'mfih_admin',
    role: 'executive_manager',
    education_level: 'سطح ۴ حوزه',
    avatar_url: '',
    created_at: '2023-12-01T10:00:00Z'
  }
];

export const getAllUsers = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  // If Supabase is not configured, immediately return local users without network delay
  if (!isSupabaseConfigured) {
    const localUsers = JSON.parse(localStorage.getItem('mock_users') || 'null');
    if (!localUsers || localUsers.length === 0) {
      localStorage.setItem('mock_users', JSON.stringify(DEFAULT_USERS));
      return { success: true, data: DEFAULT_USERS };
    }
    return { success: true, data: localUsers };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.warn('Error fetching users from Supabase, using local fallback:', error.message);
    const localUsers = JSON.parse(localStorage.getItem('mock_users') || 'null') || DEFAULT_USERS;
    return { success: true, data: localUsers };
  }
};

export const updateUserRole = async (userId: string, newRole: string): Promise<{ success: boolean; error?: string }> => {
  // Update in localStorage first
  let mockUsers = JSON.parse(localStorage.getItem('mock_users') || 'null') || DEFAULT_USERS;
  const idx = mockUsers.findIndex((u: any) => u.id === userId);
  if (idx > -1) {
    mockUsers[idx].role = newRole;
  } else {
    mockUsers.push({ id: userId, role: newRole });
  }
  localStorage.setItem('mock_users', JSON.stringify(mockUsers));

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: true }; // Local was already updated successfully
  }
};
