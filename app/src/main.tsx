import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './app/router'
import { FeedbackProvider } from './shared/ui/feedback'
import './shared/styles/base.css'

// 백엔드 전까지 기본은 mock 모드. VITE_USE_MOCK=false 로 실제 API 사용
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

async function boot() {
  if (USE_MOCK) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
  } else if (import.meta.env.PROD) {
    // PWA 서비스 워커는 MSW와 scope가 겹치므로 실제 API 모드에서만 등록
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  }

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <FeedbackProvider>
          <RouterProvider router={router} />
        </FeedbackProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

boot()
