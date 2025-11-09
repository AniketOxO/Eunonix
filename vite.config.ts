import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ REQUIRED FOR GITHUB PAGES (docs/ or subpath)
  base: "./",

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
