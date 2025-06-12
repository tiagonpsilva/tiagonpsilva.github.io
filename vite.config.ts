import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/', // Para GitHub Pages no repositório username.github.io
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})