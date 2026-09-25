import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

export interface Transaction {
  id: string;
  title: string;
  author: string;
  amount: number;
  type: 'income' | 'expense' | 'payout';
  created_at: string;
  user_id: string;
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'واریز شهریه دوره جامع هوش مصنوعی (درآمد)', author: 'سیستم - امروز', amount: 1850000, type: 'income', created_at: new Date().toISOString(), user_id: 'manager' },
  { id: '2', title: 'برگشت وجه التزام و نمره عالی دانش‌پژوه', author: 'سیستم خودکار - دیروز', amount: 750000, type: 'expense', created_at: new Date().toISOString(), user_id: 'manager' },
  { id: '3', title: 'خرید سرور پخش ویدئو و کلاس زنده (هزینه)', author: 'مسئول زیرساخت - ۳ روز پیش', amount: 850000, type: 'expense', created_at: new Date().toISOString(), user_id: 'manager' },
  { id: '4', title: 'ثبت‌نام دوره وب اپلیکیشن و React', author: 'کاربر ایتا - ۴ روز پیش', amount: 1400000, type: 'income', created_at: new Date().toISOString(), user_id: 'manager' }
];

export const getManagerFinanceStats = async (managerId: string) => {
  if (!isSupabaseConfigured) {
    const balance = 12500000;
    return { 
      success: true, 
      data: {
        totalRevenue: balance * 1.5,
        escrow: balance * 0.2,
        netBalance: balance
      } 
    };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', managerId)
      .single();

    if (error) throw error;
    const balance = profile?.wallet_balance || 12500000;
    
    return { 
      success: true, 
      data: {
        totalRevenue: balance * 1.5,
        escrow: balance * 0.2,
        netBalance: balance
      } 
    };
  } catch (error: any) {
    const balance = 12500000;
    return { 
      success: true, 
      data: {
        totalRevenue: balance * 1.5,
        escrow: balance * 0.2,
        netBalance: balance
      } 
    };
  }
};

export const getTransactions = async (managerId: string): Promise<{ success: boolean; data?: Transaction[]; error?: string }> => {
  if (!isSupabaseConfigured) {
    const stored = JSON.parse(localStorage.getItem('mock_transactions') || 'null');
    if (!stored || stored.length === 0) {
      localStorage.setItem('mock_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
      return { success: true, data: DEFAULT_TRANSACTIONS };
    }
    return { success: true, data: stored };
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', managerId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return { success: true, data: data as Transaction[] };
  } catch (error: any) {
    const stored = JSON.parse(localStorage.getItem('mock_transactions') || 'null') || DEFAULT_TRANSACTIONS;
    return { success: true, data: stored };
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Transaction; error?: string }> => {
  const newTx: Transaction = {
    ...transaction,
    id: `tx_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  const stored = JSON.parse(localStorage.getItem('mock_transactions') || 'null') || DEFAULT_TRANSACTIONS;
  localStorage.setItem('mock_transactions', JSON.stringify([newTx, ...stored]));

  if (!isSupabaseConfigured) {
    return { success: true, data: newTx };
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data: data as Transaction };
  } catch (error: any) {
    return { success: true, data: newTx };
  }
};
