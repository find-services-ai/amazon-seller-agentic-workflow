import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/amazon-seller-agentic-workflow/',
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/mcp': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
