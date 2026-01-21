import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Mock environment variables setup for local development/testing context
  define: {
    'process.env.VITE_SUPABASE_ANON_KEY': '"MOCK_ANON_KEY"',
    'process.env.VITE_SUPABASE_URL': '"https://mockurl.supabase.co"'
  }
});