import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/kings-row-barbershop/',
  build: {
    outDir: '../../launchsite/templates/kings-row-barbershop',
    emptyOutDir: true,
  },
})