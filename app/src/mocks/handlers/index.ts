// MSW 핸들러 = 백엔드 API 명세 초안 (DESIGN.md §6.4)
import { delay, http } from 'msw'
import { adminHandlers } from './admin'
import { devHandlers } from './dev'
import { orderHandlers } from './orders'
import { supportHandlers } from './support'
import { userHandlers } from './users'
import { workHandlers } from './works'

export const handlers = [
  http.all('*/api/*', async () => { await delay(120) }), // 네트워크 지연 흉내 (다음 핸들러로 넘어감)
  ...userHandlers,
  ...workHandlers,
  ...orderHandlers,
  ...supportHandlers,
  ...adminHandlers,
  ...devHandlers,
]
