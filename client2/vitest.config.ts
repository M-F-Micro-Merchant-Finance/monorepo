import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    target: 'node14'
  },
  define: {
    global: 'globalThis',
  },
  assetsInclude: ['**/*.json'],
  optimizeDeps: {
    include: ['@selfxyz/qrcode', '@selfxyz/core']
  },
})
