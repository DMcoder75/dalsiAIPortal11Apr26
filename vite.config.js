import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
    proxy: {
      // Verto session endpoints
      '/proxy/vertosession': {
        target: 'https://api.neodalsi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/vertosession/, '/vertosession'),
      },
      // AI generation endpoints
      '/proxy/generate': {
        target: 'https://api.neodalsi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/generate/, '/generate'),
      },
      '/proxy/edu': {
        target: 'https://api.neodalsi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/edu/, '/edu'),
      },
      '/proxy/healthcare': {
        target: 'https://api.neodalsi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/healthcare/, '/healthcare'),
      },
      // Auth / guest key endpoint
      '/proxy/api': {
        target: 'https://api.neodalsi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/api/, '/api'),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
