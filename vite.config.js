import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Observation Médicale 2026',
        short_name: 'ObsMed 2026',
        description: 'Application de rédaction d\'observations médicales',
        theme_color: '#D4C7B1',
        background_color: '#F0E8DA',
        display: 'standalone',
        icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}']
      }
    })
  ],
})
