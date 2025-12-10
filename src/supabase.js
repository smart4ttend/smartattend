import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zthqsnwetedccxqbkide.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aHFzbndldGVkY2N4cWJraWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDE0NzMsImV4cCI6MjA4MDcxNzQ3M30.fMqz0Do_xMJWxC3AdWrpzd9lUfdWdSMTVvTsjKUDnlI';
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
