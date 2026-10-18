// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { handleEitaaLogin, loginWithCredentials, fetchCurrentProfile } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: 'student' | 'teacher' | 'executive_manager' | 'finance_admin' | null;
  loading: boolean;
  isEitaa: boolean;
  loginManager: (u: string, p: string) => Promise<void>;
  loginAsUser: (profile: UserProfile) => void;
  switchRole: (newRole: 'student' | 'teacher' | 'executive_manager') => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  isEitaa: false,
  loginManager: async () => {},
  loginAsUser: () => {},
  switchRole: async () => {},
  refreshUser: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'student' | 'teacher' | 'executive_manager' | 'finance_admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEitaa, setIsEitaa] = useState(false);

  const refreshUser = async () => {
    if (!user?.id) return;
    const fresh = await fetchCurrentProfile(user.id);
    if (fresh) {
      setUser(fresh);
      setRole(fresh.role as any);
    }
  };

  const loginManager = async (u: string, p: string) => {
    try {
      const res = await loginWithCredentials(u, p, 'executive_manager');
      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.user.role);
        localStorage.setItem('auth_user_id', res.user.id);
      } else {
        throw new Error('نام کاربری یا رمز عبور اشتباه است.');
      }
    } catch (err: any) {
      throw new Error(err.message || 'نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  const loginAsUser = (profile: UserProfile) => {
    setUser(profile);
    setRole(profile.role as any);
    localStorage.setItem('auth_user_id', profile.id);
  };

  const switchRole = async (newRole: 'student' | 'teacher' | 'executive_manager') => {
    if (!user) return;
    try {
      // Find a user with this role in unified database or update current user
      const res = await fetch('/api/users');
      if (res.ok) {
        const allUsers: UserProfile[] = await res.json();
        const roleUser = allUsers.find((u) => u.role === newRole);
        if (roleUser) {
          loginAsUser(roleUser);
          return;
        }
      }

      // Update current user role
      const updateRes = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (updateRes.ok) {
        const updated = await updateRes.json();
        setUser(updated);
        setRole(newRole);
      }
    } catch (e) {
      setRole(newRole);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user_id');
    // Default to main student user
    fetchCurrentProfile('usr_current').then((p) => {
      if (p) {
        setUser(p);
        setRole(p.role as any);
      } else {
        setUser(null);
        setRole(null);
      }
    });
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // 1. Try real Eitaa SDK auto-login first
        const eitaaRes = await handleEitaaLogin();
        if (eitaaRes.success && eitaaRes.user) {
          if (isMounted) {
            setUser(eitaaRes.user);
            setRole((eitaaRes.role || eitaaRes.user.role || 'student') as any);
            setIsEitaa(true);
            localStorage.setItem('auth_user_id', eitaaRes.user.id);
            setLoading(false);
          }
          return;
        }

        // 2. Browser Environment Fallback (from unified server database)
        if (isMounted) {
          setIsEitaa(false);
        }

        const savedUserId = localStorage.getItem('auth_user_id') || 'usr_current';
        const profile = await fetchCurrentProfile(savedUserId);

        if (isMounted) {
          if (profile) {
            setUser(profile);
            setRole(profile.role as any);
          } else {
            // Fetch any first user from /api/users
            try {
              const usersRes = await fetch('/api/users');
              if (usersRes.ok) {
                const users = await usersRes.json();
                if (users.length > 0) {
                  setUser(users[0]);
                  setRole(users[0].role);
                }
              }
            } catch (err) {
              console.warn('Could not fetch fallback user:', err);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isEitaa,
        loginManager,
        loginAsUser,
        switchRole,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
