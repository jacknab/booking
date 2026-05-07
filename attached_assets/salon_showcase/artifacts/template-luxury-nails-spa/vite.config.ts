import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/luxury-nails-spa/',
  build: {
    outDir: resolve(__dirname, '../../launchsite-php/templates/luxury-nails-spa'),
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
