import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    host: '0.0.0.0',
    port: 5041,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      // The backend serves /preview; production maps /api/preview to it, so do the same in dev
      '/api/preview': {
        target: 'http://localhost:5042',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      protocol: 'wss',
      host: 'gallery.tapmind.io',
      clientPort: 443,
    },
  },
})