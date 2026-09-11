import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    // Vercel auto-detects Vite and serves dist/. Named here anyway so the
    // build output does not depend on the platform guessing correctly.
    outDir: 'dist',
  },
  server: {
    port: 4173,
  },
  preview: {
    port: 4173,
  },
});
