const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Update AuthContextType
content = content.replace(
  'loading: boolean;', 
  'loading: boolean;\n  loginManager: (u: string, p: string) => Promise<void>;\n  logout: () => void;'
);

content = content.replace(
  'loading: true,',
  'loading: true,\n  loginManager: async () => {},\n  logout: () => {},'
);

// Add loginManager and logout functions inside Provider
const functionsStr = `
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
`;

content = content.replace('  useEffect(() => {', functionsStr);

// In the mock block inside useEffect, handle custom test_user parsing safely
const mockBlockStr = `          const localRole = localStorage.getItem('test_role') || 'student';
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
          }`;

// Find the exact line in AuthContext and replace the mock user assignment
content = content.replace(/const localRole = localStorage\.getItem\('test_role'\) \|\| 'student';[\s\S]*?setUser\(\{[\s\S]*?\} as any\);/g, mockBlockStr);

// update return value
content = content.replace(
  '<AuthContext.Provider value={{ session, user, role, loading }}>',
  '<AuthContext.Provider value={{ session, user, role, loading, loginManager, logout }}>'
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
