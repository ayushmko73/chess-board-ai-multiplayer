import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real application, these would be injected via Vercel environment variables.
// We use placeholders here as per instructions, assuming VITE_ prefix works during dev build.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For multiplayer functionality, we would typically use supabase.from('games').on('...') for real-time updates.
// Since this is a complex engine implementation, the real-time listening setup is omitted but the client is initialized.
