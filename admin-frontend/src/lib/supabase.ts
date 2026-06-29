import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Uses existing hardcoded keys for simplicity, but preferably should use import.meta.env
const supabaseUrl = 'https://oisztvvklksoxbvmuqii.supabase.co';
const supabaseAnonKey = 'sb_publishable_Epbu47rmE8Iexf61YEVGFQ_fo7Pz8xS';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
