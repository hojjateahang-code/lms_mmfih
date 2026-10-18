// src/services/authService.ts
import { UserProfile } from '../types';

declare global {
  interface Window {
    Eitaa?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            phone_number?: string;
            photo_url?: string;
          };
          auth_date?: number;
          hash?: string;
        };
        version?: string;
        platform?: string;
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
      };
    };
    Telegram?: {
      WebApp: any;
    };
  }
}

export interface EitaaAuthResult {
  success: boolean;
  user?: UserProfile;
  profile?: UserProfile;
  role?: string;
  token?: string;
  isEitaaEnvironment: boolean;
  message?: string;
}

/**
 * Detects if the app is currently running inside Eitaa Mini-App SDK
 */
export const getEitaaSdkInstance = () => {
  if (typeof window === 'undefined') return null;
  return window.Eitaa?.WebApp || window.Telegram?.WebApp || null;
};

/**
 * Handles real auto-login using Eitaa WebApp SDK.
 * Invokes ready(), expand(), and posts initData/user to /api/auth/eitaa.
 */
export const handleEitaaLogin = async (): Promise<EitaaAuthResult> => {
  if (typeof window === 'undefined') {
    return { success: false, isEitaaEnvironment: false, message: 'Server context' };
  }

  const eitaa = getEitaaSdkInstance();
  let eitaaUser = eitaa?.initDataUnsafe?.user;
  let initData = eitaa?.initData || '';

  // Also check URL parameters if Eitaa launched via web query params
  if (!eitaaUser) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlUser = urlParams.get('user');
      const urlEitaaId = urlParams.get('eitaa_id');
      const urlInitData = urlParams.get('initData');

      if (urlUser) {
        eitaaUser = JSON.parse(decodeURIComponent(urlUser));
      } else if (urlEitaaId) {
        eitaaUser = {
          id: parseInt(urlEitaaId, 10) || 1001,
          first_name: urlParams.get('first_name') || 'کاربر',
          last_name: urlParams.get('last_name') || 'ایتا',
          username: urlParams.get('username') || `eitaa_${urlEitaaId}`,
        };
      }
      if (urlInitData) {
        initData = decodeURIComponent(urlInitData);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  if (eitaa) {
    try {
      if (typeof eitaa.ready === 'function') eitaa.ready();
      if (typeof eitaa.expand === 'function') eitaa.expand();
      if (typeof eitaa.setHeaderColor === 'function') eitaa.setHeaderColor('#ffffff');
      if (typeof eitaa.setBackgroundColor === 'function') eitaa.setBackgroundColor('#f8fafc');
    } catch (e) {
      console.warn('Eitaa SDK UI methods notice:', e);
    }
  }

  if (!eitaaUser) {
    return {
      success: false,
      isEitaaEnvironment: false,
      message: 'برنامه در محیط مرورگر عادی اجرا شده است (نه داخل پیام‌رسان ایتا).',
    };
  }

  try {
    const res = await fetch('/api/auth/eitaa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData,
        initDataUnsafe: eitaa?.initDataUnsafe || { user: eitaaUser },
        user: eitaaUser,
        platform: eitaa?.platform || 'eitaa',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در احراز هویت با ایتا');
    }

    const data = await res.json();
    return {
      success: true,
      user: data.user,
      profile: data.profile,
      role: data.role,
      token: data.token,
      isEitaaEnvironment: true,
    };
  } catch (err: any) {
    console.error('Eitaa Login error:', err);
    return {
      success: false,
      isEitaaEnvironment: true,
      message: err.message,
    };
  }
};

/**
 * Login with credentials (e.g. for executive manager admin/admin123 or username)
 */
export const loginWithCredentials = async (username: string, password?: string, role?: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'خطا در ورود به سیستم');
  }

  return await res.json();
};

/**
 * Fetch current user profile from unified backend
 */
export const fetchCurrentProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
};
