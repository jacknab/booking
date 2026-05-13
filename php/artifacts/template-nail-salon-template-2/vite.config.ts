import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/nail-salon-template-2/',
  build: {
    outDir: '../../launchsite/templates/nail-salon-template-2',
    emptyOutDir: true,
  },
})