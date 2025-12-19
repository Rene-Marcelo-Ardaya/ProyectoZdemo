import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo_192x192.jpg', 'logo_512x512.jpg', 'vite.svg'],
      manifest: {
        name: 'Chat App',
        short_name: 'Chat',
        description: 'App de chat en tiempo real',
        theme_color: '#6366f1',
        icons: [
          {
            src: 'logo_192x192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable'
          },
          {
            src: 'logo_512x512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ],
        display: 'standalone',
        start_url: '.',
        background_color: '#ffffff'
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:8000\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'documents-cache'
            }
          },
          {
            urlPattern: ({ request }) => ['script', 'style'].includes(request.destination),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-cache'
            }
          }
        ]
      }
    })
  ],
  // Base path para producción
  base: '/',
  server: {
    port: 5173,
    host: '0.0.0.0', // Necesario para Docker
    // CORS permitido para desarrollo
    cors: true,
    // Configuración para HMR en Docker
    watch: {
      usePolling: true
    }
  },
})
