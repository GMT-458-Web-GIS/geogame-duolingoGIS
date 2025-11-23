import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : '/geogame-duolingoGIS/'
  
  return {
    plugins: [react()],
    base: base,
    server: {
      port: 3000
    },
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    }
  }
})
