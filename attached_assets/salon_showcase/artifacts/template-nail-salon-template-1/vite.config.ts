import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/nail-salon-template-1/',
  build: {
    outDir: '../../launchsite-php/templates/nail-salon-template-1',
    emptyOutDir: true,
  },
})