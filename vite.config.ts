import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Required for Vercel deployment compatibility if using specific paths, though generally not needed for basic setup
  base: '/', 
});