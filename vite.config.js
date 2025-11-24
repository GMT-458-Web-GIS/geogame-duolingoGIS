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
    },
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { runtime: `window.__prependBase(${JSON.stringify(filename)})` }
        } else {
          return base + filename
        }
      }
    }
  }
})
