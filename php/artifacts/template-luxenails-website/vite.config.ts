import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/luxenails-website/',
  build: {
    outDir: '../../launchsite/templates/luxenails-website',
    emptyOutDir: true,
  },
})