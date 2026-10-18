import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        p1: 'proposta-1/index.html',
        p2: 'proposta-2/index.html',
      },
    },
  },
})
