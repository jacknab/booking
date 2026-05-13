import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/multi-location-nail-salon/',
  build: {
    outDir: '../../launchsite/templates/multi-location-nail-salon',
    emptyOutDir: true,
  },
})