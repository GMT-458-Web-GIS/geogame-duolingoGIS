import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/geogame-duolingoGIS/',
  server: {
    port: 3000
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          openlayers: ['ol', 'ol/proj', 'ol/source'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
