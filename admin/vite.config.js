import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Admin panel: separate SPA on :5174. In dev the API lives on :8000, so we
// proxy /api there. In production the build is served same-origin and VITE_API_URL
// should be set to the API base (e.g. /api).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
