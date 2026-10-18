// src/services/supportService.ts
import { SupportTicket, SupportMessage } from '../types';

export type { SupportTicket, SupportMessage };
export type TicketMessage = SupportMessage;

export const getAllTickets = async (): Promise<{ success: boolean; data?: SupportTicket[]; error?: string }> => {
  try {
    const res = await fetch('/api/support/tickets');
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در دریافت لیست تیکت‌ها' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getUserTickets = async (userId: string): Promise<{ success: boolean; data?: SupportTicket[]; error?: string }> => {
  try {
    const res = await fetch(`/api/support/tickets?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در دریافت تیکت‌های کاربر' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const createSupportTicket = async (
  userId: string,
  userName: string,
  subject: string,
  category: string,
  message: string
): Promise<{ success: boolean; data?: SupportTicket; error?: string }> => {
  try {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, user_name: userName, subject, category, message }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: 'خطا در ثبت تیکت جدید' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const sendTicketReply = async (
  ticketId: string,
  senderId: string,
  senderName: string,
  text: string,
  isAdmin = false
): Promise<{ success: boolean; data?: SupportMessage; error?: string }> => {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, sender_name: senderName, text, is_admin: isAdmin }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.message };
    }
    return { success: false, error: 'خطا در ارسال پیام' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const updateTicketStatus = async (
  ticketId: string,
  status: 'open' | 'answered' | 'closed'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`/api/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Legacy helper function adapted to real backend
export const getTicketMessages = async (userId: string) => {
  const res = await getUserTickets(userId);
  if (res.success && res.data && res.data.length > 0) {
    // Return all messages from the latest active ticket or all tickets combined
    const allMsgs = res.data.flatMap((t) => t.messages || []);
    return { success: true, data: allMsgs };
  }
  return { success: true, data: [] };
};

export const sendTicketMessage = async (userId: string, userName: string, text: string, isAdmin = false) => {
  // If user has open ticket, reply to it; otherwise create ticket
  const userTicketsRes = await getUserTickets(userId);
  const openTicket = userTicketsRes.data?.find((t) => t.status !== 'closed') || userTicketsRes.data?.[0];

  if (openTicket) {
    return sendTicketReply(openTicket.id, userId, userName, text, isAdmin);
  } else {
    const created = await createSupportTicket(userId, userName, 'گفتگو با پشتیبانی', 'عمومی', text);
    if (created.success && created.data) {
      return { success: true, data: created.data.messages[0] };
    }
    return { success: false, error: 'خطا در ارسال پیام' };
  }
};
