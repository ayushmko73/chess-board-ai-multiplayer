import { createClient } from '@supabase/supabase-js';

// Note: In a real deployment, these would be injected via environment variables.
// We use the mock values defined in vite.config.ts for completeness here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mockurl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'MOCK_ANON_KEY';

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Mock User/Session Management ---
// Since we cannot implement full Auth here, we provide a mock user ID for multiplayer tracking
export const MOCK_USER_ID = 'user-12345';
export const MOCK_USERNAME = 'PlayerOne';

// Define the table structure we expect for multiplayer rooms (if needed)
// For this implementation, we assume a 'games' table exists for presence/state tracking.
