// src/services/userService.ts
import { UserProfile, UserRole } from '../types';

export const getAllUsers = async (): Promise<{ success: boolean; data?: UserProfile[]; error?: string }> => {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    }
    return { success: false, error: 'خطا در دریافت کاربران' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (res.ok) return await res.json();
    return null;
  } catch (e) {
    return null;
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole | string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) return { success: true };
    return { success: false, error: 'خطا در بروزرسانی نقش کاربر' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ذخیره اطلاعات کاربری' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteUser = async (userId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'خطا در حذف کاربر' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
