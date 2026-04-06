/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://elitzchthcyjdbhgxpxk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaXR6Y2h0aGN5amRiaGd4cHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzAyNDYsImV4cCI6MjA5MDUwNjI0Nn0.FNi1D49hIPC_2qu2KC8v0QZIERvmXlsbzMipxYGwhTE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
