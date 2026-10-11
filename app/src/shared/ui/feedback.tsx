// 바텀 시트 · 토스트 (앱 전역)
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { FeedbackCtx } from './useFeedback'
import s from './ui.module.css'

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<ReactNode>(null)
  const [msg, setMsg] = useState<{ text: string; key: number } | null>(null)
  const lastFocus = useRef<Element | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  const openSheet = useCallback((node: ReactNode) => { lastFocus.current = document.activeElement; setSheet(node) }, [])
  const closeSheet = useCallback(() => { setSheet(null); (lastFocus.current as HTMLElement | null)?.focus?.() }, [])
  const toast = useCallback((text: string) => setMsg({ text, key: Date.now() }), [])

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2300)
    return () => clearTimeout(t)
  }, [msg])

  useEffect(() => {
    if (!sheet) return
    sheetRef.current?.querySelector<HTMLElement>('input,textarea,select,button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeSheet()
      if (e.key !== 'Tab' || !sheetRef.current) return
      // 시트 안에서만 포커스 순환
      const f = [...sheetRef.current.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea')].filter(el => !(el as HTMLButtonElement).disabled)
      if (!f.length) return
      const [first, last] = [f[0], f[f.length - 1]]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheet, closeSheet])

  return (
    <FeedbackCtx.Provider value={{ openSheet, closeSheet, toast }}>
      {children}
      {sheet && (
        <div className={s['sheet-back']} onClick={e => e.target === e.currentTarget && closeSheet()}>
          <div className={s.sheet} role="dialog" aria-modal="true" ref={sheetRef}>{sheet}</div>
        </div>
      )}
      {msg && <div key={msg.key} className={s.toast} role="status" aria-live="polite">{msg.text}</div>}
    </FeedbackCtx.Provider>
  )
}
