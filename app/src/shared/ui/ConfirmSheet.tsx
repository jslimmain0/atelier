import type { ReactNode } from 'react'
import { SheetDesc } from './blocks'
import { Button } from './primitives'
import { useFeedback } from './useFeedback'

export function ConfirmSheet({ title, children, confirm, onConfirm, danger }: { title: string; children: ReactNode; confirm: string; onConfirm: () => void; danger?: boolean }) {
  const { closeSheet } = useFeedback()
  return (
    <>
      <h2>{title}</h2>
      <SheetDesc>{children}</SheetDesc>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Button variant="ghost" onClick={closeSheet}>취소</Button>
        <Button variant={danger ? 'danger' : 'dark'} onClick={() => { onConfirm(); closeSheet() }}>{confirm}</Button>
      </div>
    </>
  )
}
