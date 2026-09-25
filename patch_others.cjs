const fs = require('fs');
const isMockCondition = `!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')`;

// Patch financeService.ts
let financeContent = fs.readFileSync('src/services/financeService.ts', 'utf8');

const financeMock = `    if (${isMockCondition}) {
      const balance = 12500000;
      return { 
        success: true, 
        data: {
          totalRevenue: balance * 1.5,
          escrow: balance * 0.2,
          netBalance: balance
        } 
      };
    }`;

financeContent = financeContent.replace(/(export const getManagerFinanceStats = async[^\{]*\{\s*try \{)/g, "$1\n" + financeMock);
fs.writeFileSync('src/services/financeService.ts', financeContent);


// Patch userService.ts
let userContent = fs.readFileSync('src/services/userService.ts', 'utf8');

const userMock = `    if (${isMockCondition}) {
      const mockUsers = [
        { id: '1', eitaa_id: '1001', username: 'student_1', full_name: 'کاربر تستی ۱', role: 'student', wallet_balance: 50000 },
        { id: '2', eitaa_id: '1002', username: 'student_2', full_name: 'کاربر تستی ۲', role: 'student', wallet_balance: 0 },
        { id: '3', eitaa_id: '1003', username: 'manager_1', full_name: 'مدیر اصلی', role: 'executive_manager', wallet_balance: 12500000 }
      ];
      return { success: true, data: mockUsers };
    }`;

userContent = userContent.replace(/(export const getAllUsers = async[^\{]*\{\s*try \{)/g, "$1\n" + userMock);
fs.writeFileSync('src/services/userService.ts', userContent);

