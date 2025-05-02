import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname), // בסיס כללי
      '@entities': path.resolve(__dirname, 'Entities'),
      '@integrations': path.resolve(__dirname, 'integrations'),
      '@components': path.resolve(__dirname, 'Components'),
      '@pages': path.resolve(__dirname, 'Pages')
    }
  }
})