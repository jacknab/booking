import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/barbershop-template-1/',
  build: {
    outDir: '../../launchsite/templates/barbershop-template-1',
    emptyOutDir: true,
  },
})