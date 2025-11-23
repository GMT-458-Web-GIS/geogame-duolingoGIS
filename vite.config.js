import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Assetlerin yüklenmeme sorununu çözer
  server: {
    port: 3000
  },
  root: './',
  publicDir: 'assets',
  build: {
    outDir: 'dist'
  }
})
