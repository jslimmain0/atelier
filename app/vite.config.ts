/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // MSW 서비스 워커와 scope가 겹치므로 등록은 main.tsx에서 mock 모드가 아닐 때만 한다
      injectRegister: false,
      registerType: 'autoUpdate',
      manifest: {
        name: 'atelier',
        short_name: 'atelier',
        description: '작가의 작품과 제작 이야기, 소장과 후원이 이어지는 곳',
        lang: 'ko',
        theme_color: '#FAF8F4',
        background_color: '#FAF8F4',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: { globIgnores: ['**/mockServiceWorker.js'] },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
