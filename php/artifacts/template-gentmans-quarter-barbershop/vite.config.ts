import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/gentmans-quarter-barbershop/',
  build: {
    outDir: '../../launchsite/templates/gentmans-quarter-barbershop',
    emptyOutDir: true,
  },
})