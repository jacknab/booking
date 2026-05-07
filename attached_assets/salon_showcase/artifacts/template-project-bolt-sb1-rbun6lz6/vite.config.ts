import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/launchsite/templates/project-bolt-sb1-rbun6lz6/',
  build: {
    outDir: '../../launchsite-php/templates/project-bolt-sb1-rbun6lz6',
    emptyOutDir: true,
  },
})