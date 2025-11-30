import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/places': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/polygons': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/clients': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/deliveries': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/drivers': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/logs': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
