import { createContext, useContext, type ReactNode } from 'react'

type Ctx = { openSheet: (node: ReactNode) => void; closeSheet: () => void; toast: (msg: string) => void }
export const FeedbackCtx = createContext<Ctx | null>(null)

export function useFeedback() {
  const c = useContext(FeedbackCtx)
  if (!c) throw new Error('FeedbackProvider 밖에서 사용됨')
  return c
}
