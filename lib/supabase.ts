import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwldonzgeruhrsfirfop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13bGRvbnpnZXJ1aHJzZmlyZm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTYwMzAsImV4cCI6MjA3ODQ5MjAzMH0.ZefZzLerTtke3rj3lD1DItLVbcBkUMBZ65p98Hk2H6w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
