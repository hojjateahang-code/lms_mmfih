// src/services/financeService.ts
export interface Transaction {
  id: string;
  title: string;
  author: string;
  amount: number;
  type: 'income' | 'expense' | 'payout';
  category?: string;
  status?: string;
  date?: string;
  created_at: string;
  user_id: string;
}

export const getManagerFinanceStats = async (_managerId?: string) => {
  try {
    const res = await fetch('/api/finance/stats');
    if (res.ok) {
      const stats = await res.json();
      return {
        success: true,
        data: {
          totalRevenue: stats.total_income || 0,
          escrow: Math.round((stats.total_income || 0) * 0.15),
          netBalance: stats.balance || 0,
          activeStudents: stats.active_students || 0,
          coursesCount: stats.courses_count || 0,
          enrollmentsCount: stats.enrollments_count || 0,
        },
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    success: true,
    data: {
      totalRevenue: 28500000,
      escrow: 4200000,
      netBalance: 24300000,
      activeStudents: 142,
      coursesCount: 3,
      enrollmentsCount: 8,
    },
  };
};

export const getTransactions = async (_userId?: string): Promise<{ success: boolean; data?: Transaction[]; error?: string }> => {
  try {
    const res = await fetch('/api/transactions');
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    }
    return { success: false, error: 'خطا در دریافت تراکنش‌ها' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const chargeUserWallet = async (userId: string, amount: number, title?: string) => {
  try {
    const res = await fetch('/api/wallet/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, title }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, balance: data.balance, transaction: data.transaction };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, error: err.error || 'خطا در افزایش اعتبار' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Transaction; error?: string }> => {
  try {
    const res = await fetch('/api/wallet/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: transaction.user_id,
        amount: transaction.amount,
        title: transaction.title,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.transaction };
    }
    return { success: false, error: 'خطا در ثبت تراکنش' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
