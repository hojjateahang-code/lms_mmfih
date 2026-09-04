import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const getAllUsers = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching users:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateUserRole = async (userId: string, newRole: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      let mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const idx = mockUsers.findIndex((u: any) => u.id === userId);
      if (idx > -1) {
        mockUsers[idx].role = newRole;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      return { success: true };
    }
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
