import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `chalo.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'zustand',
        'framer-motion'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'zustand': 'zustand',
          'framer-motion': 'framerMotion'
        }
      }
    },
    emptyOutDir: false
  }
})
