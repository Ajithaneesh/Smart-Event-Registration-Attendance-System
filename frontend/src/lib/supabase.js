import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oisztvvklksoxbvmuqii.supabase.co';
const supabaseAnonKey = 'sb_publishable_Epbu47rmE8Iexf61YEVGFQ_fo7Pz8xS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
