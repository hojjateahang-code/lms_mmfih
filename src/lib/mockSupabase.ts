// Simple lightweight local store shim for Supabase queries when offline/demo
import { UserProfile } from '../types';

const USERS_STORAGE_KEY = 'eitaa_virtual_school_users';

const getStoredUsers = (): UserProfile[] => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    if (!data) {
      const defaultUsers: UserProfile[] = [
        {
          id: '1',
          eitaa_id: '1001',
          username: 'student_demo',
          full_name: 'محمد‌مهدی حسینی',
          role: 'student',
          wallet_balance: 450000,
          national_id: '0012345678',
          phone: '09121112233',
          city: 'قم',
          education_level: 'سطح دو حوزه',
        },
        {
          id: '2',
          eitaa_id: '1002',
          username: 'manager_demo',
          full_name: 'حجت‌الاسلام موسوی (مدیر اجرایی)',
          role: 'executive_manager',
          wallet_balance: 12000000,
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveStoredUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error(e);
  }
};

export const createLocalSupabaseClient = () => {
  return {
    from: (table: string) => {
      return {
        select: (columns: string = '*') => {
          let fieldName = '';
          let fieldValue = '';
          const selectObj = {
            eq: (field: string, val: any) => {
              fieldName = field;
              fieldValue = val;
              return selectObj;
            },
            single: async () => {
              const users = getStoredUsers();
              const found = users.find(u => (u as any)[fieldName] === fieldValue);
              return { data: found || null, error: null };
            }
          };
          return selectObj;
        },
        insert: (records: any[]) => {
          return {
            select: () => {
              return {
                single: async () => {
                  const users = getStoredUsers();
                  const newRecord = {
                    id: String(Date.now()),
                    ...records[0]
                  };
                  users.push(newRecord);
                  saveStoredUsers(users);
                  return { data: newRecord, error: null };
                }
              };
            }
          };
        }
      };
    }
  };
};
