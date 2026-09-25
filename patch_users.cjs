const fs = require('fs');

// 1. Update userService.ts
let userContent = fs.readFileSync('src/services/userService.ts', 'utf8');

const userMock = `    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
      let mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (mockUsers.length === 0) {
        mockUsers = [
          { id: '1', eitaa_id: '1001', username: 'student_1', full_name: 'کاربر تستی ۱', role: 'student', wallet_balance: 50000, education_level: 'سطح ۲' },
          { id: '2', eitaa_id: '1002', username: 'student_2', full_name: 'کاربر تستی ۲', role: 'student', wallet_balance: 0, education_level: 'سطح ۱' },
          { id: '3', eitaa_id: '1003', username: 'admin', full_name: 'مدیر اصلی', role: 'executive_manager', wallet_balance: 12500000, education_level: 'سطح ۴' }
        ];
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
      return { success: true, data: mockUsers };
    }`;
    
userContent = userContent.replace(/if \(!import\.meta\.env\.VITE_SUPABASE_URL \|\| import\.meta\.env\.VITE_SUPABASE_URL\.includes\('placeholder'\)\) \{[\s\S]*?return \{ success: true, data: mockUsers \};\n    \}/, userMock);

// add updateRole
const updateRole = `
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
`;

userContent += updateRole;
fs.writeFileSync('src/services/userService.ts', userContent);

// 2. Update ManagerUsersPage.tsx
let pageContent = fs.readFileSync('src/pages/manager/ManagerUsersPage.tsx', 'utf8');

// import updateUserRole
pageContent = pageContent.replace("import { getAllUsers } from '../../services/userService';", "import { getAllUsers, updateUserRole } from '../../services/userService';");

const roleSelect = `
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-400 block">تغییر نقش</span>
                  <select 
                    value={user.role} 
                    onChange={async (e) => {
                      const newRole = e.target.value;
                      const res = await updateUserRole(user.id, newRole);
                      if(res.success) {
                        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                        alert('نقش کاربر با موفقیت تغییر کرد.');
                      } else {
                        alert('خطا در تغییر نقش');
                      }
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2 py-1 outline-none text-slate-700 font-bold"
                  >
                    <option value="student">دانش‌پژوه</option>
                    <option value="teacher">استاد</option>
                    <option value="executive_manager">مدیر</option>
                  </select>
                </div>
`;

pageContent = pageContent.replace(/<div className="text-left">\s*<span className="text-\[10px\] text-slate-400 block">کیف پول<\/span>[\s\S]*?<\/div>/, roleSelect);
fs.writeFileSync('src/pages/manager/ManagerUsersPage.tsx', pageContent);

