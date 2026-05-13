import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/high-end-nail-salon-website/',
  build: {
    outDir: '../../launchsite/templates/high-end-nail-salon-website',
    emptyOutDir: true,
  },
})