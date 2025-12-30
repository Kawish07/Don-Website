import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests during development to the production admin API
      // This avoids CORS when developing locally (browser -> Vite -> remote API)
      '/api': {
        // Proxy target is driven by env: VITE_API_PROXY (dev) or VITE_API_URL (prod).
        // Default to the local backend during development so Vite forwards /api to localhost:5000.
        target: process.env.VITE_API_PROXY || 'http://localhost:5000',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
