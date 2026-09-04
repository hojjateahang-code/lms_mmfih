import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { handleEitaaLogin } from '../services/authService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'student' | 'teacher' | 'executive_manager' | 'finance_admin' | null;
  loading: boolean;
  loginManager: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  loginManager: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  const loginManager = async (u: string, p: string) => {
    if (u === 'admin' && p === 'admin123') {
      localStorage.setItem('test_role', 'executive_manager');
      localStorage.setItem('test_user', JSON.stringify({
        id: 'admin-999',
        user_metadata: { full_name: 'مدیر کل سامانه' },
        eitaa_id: 'admin_eitaa'
      }));
      window.location.reload();
    } else {
      throw new Error('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  const logout = () => {
    localStorage.removeItem('test_role');
    localStorage.removeItem('test_user');
    window.location.reload();
  };

  useEffect(() => {

    // 1. Check for Eitaa Mini-App Context First
    const checkEitaa = async () => {
      if (window.Eitaa?.WebApp?.initDataUnsafe?.user) {
        const eitaaAuth = await handleEitaaLogin();
        if (eitaaAuth.success) {
          // If we had a real backend, we'd set the Supabase session here
          // supabase.auth.setSession({ access_token: eitaaAuth.token, refresh_token: ... })
          console.log("Eitaa Auto-Login triggered");
        }
      }
    };
    checkEitaa();

    // 2. Standard Supabase Session Management
    supabase.auth.getSession().then(async ({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error("Session error:", sessionError);
      }

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        // Invisible Auto-Login Simulation (Mimics Eitaa auto-login for testing)
        try {
          let email = 'student@test.com';
          const password = 'password123';
          
          let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          
          if (signInError) {
            if (signInError.message.toLowerCase().includes('email not confirmed') || signInError.message.toLowerCase().includes('invalid')) {
                email = `student_${Date.now()}@test.com`;
            }
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
            
            if (signUpError) {
              console.error("Auto signup failed:", signUpError);
            } else if (signUpData.user && signUpData.session) {
              await supabase.from('profiles').upsert({ 
                id: signUpData.user.id, 
                role: 'student', 
                full_name: 'دانشجوی آزمایشی' 
              });
            }
          }
        } catch (err) {
          console.error("Auto login process failed:", err);
        } finally {
          // Fallback: If user is still null, ensure we don't load forever
          // (onAuthStateChange should ideally handle this, but if API fails it won't)
          setLoading(false);
          
          // For completely mock/offline testing if Supabase is down
                    const localRole = localStorage.getItem('test_role') || 'student';
          if (!session?.user) { 
             setRole(localRole);
             const testUserStr = localStorage.getItem('test_user');
             if (testUserStr) {
               setUser(JSON.parse(testUserStr) as any);
             } else {
               setUser({
                 id: 'mock-user-123',
                 app_metadata: {},
                 user_metadata: { full_name: 'کاربر آزمایشی' },
                 aud: 'authenticated',
                 created_at: new Date().toISOString()
               } as any);
             }
             setLoading(false);
          }
        }
      }
    }).catch(err => {
      console.error("Get session failed:", err);
      setLoading(false);
                const localRole = localStorage.getItem('test_role') || 'student';
          if (!session?.user) { 
             setRole(localRole);
             const testUserStr = localStorage.getItem('test_user');
             if (testUserStr) {
               setUser(JSON.parse(testUserStr) as any);
             } else {
               setUser({
                 id: 'mock-user-123',
                 app_metadata: {},
                 user_metadata: { full_name: 'کاربر آزمایشی' },
                 aud: 'authenticated',
                 created_at: new Date().toISOString()
               } as any);
             }
             setLoading(false);
          }

    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchUserRole(session.user.id);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // First check if we have a locally forced role for testing
      const localRole = localStorage.getItem('test_role');
      if (localRole === 'student' || localRole === 'executive_manager' || localRole === 'teacher') {
        setRole(localRole);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        setRole(data.role);
      } else {
        // Fallback default
        setRole('student');
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      setRole('student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, loginManager, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
