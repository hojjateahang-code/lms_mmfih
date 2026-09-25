import { supabase } from '../lib/supabase';

export interface TicketMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
  is_admin: boolean;
}

// In a real database, we would have a 'tickets' and 'ticket_messages' table.
// For now, we simulate a persistent local or mocked stream for the UI demonstration.
let mockMessages: TicketMessage[] = [
  {
    id: '1',
    sender_id: 'admin_1',
    sender_name: 'پشتیبانی پلتفرم',
    text: 'سلام! چطور می‌تونم کمکتون کنم؟',
    created_at: new Date(Date.now() - 100000).toISOString(),
    is_admin: true
  }
];

export const getTicketMessages = async (userId: string) => {
  // Simulating network fetch
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, data: [...mockMessages] };
};

export const sendTicketMessage = async (userId: string, userName: string, text: string, isAdmin = false) => {
  // Simulating network send
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newMessage: TicketMessage = {
    id: Math.random().toString(),
    sender_id: userId,
    sender_name: userName,
    text,
    created_at: new Date().toISOString(),
    is_admin: isAdmin
  };
  
  mockMessages.push(newMessage);
  return { success: true, data: newMessage };
};
