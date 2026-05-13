import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/blade-barbershop/',
  build: {
    outDir: '../../launchsite/templates/blade-barbershop',
    emptyOutDir: true,
  },
})