import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spa-fallback-preview',
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (
            req.method === 'GET' &&
            req.url &&
            !req.url.startsWith('/assets/') &&
            !req.url.includes('.') &&
            req.headers.accept?.includes('text/html')
          ) {
            req.url = '/'
          }
          next()
        })
      },
    },
  ],
  appType: 'spa',
})
