import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/project-sb1-z2z8uasz/',
  build: {
    outDir: '../../launchsite-php/templates/project-sb1-z2z8uasz',
    emptyOutDir: true,
  },
})