import type { ReactNode } from 'react'
import { useMe } from '../shared/api/queries'
import { AppBar, BackButton, Empty } from '../shared/ui/primitives'

/** 관리자 전용 화면 보호 (서버에서도 403으로 막는다) */
export function AdminGate({ title, children }: { title: string; children: ReactNode }) {
  const { data: me, isPending } = useMe()
  if (isPending) return <AppBar title={title} left={<BackButton />} />
  if (me?.role !== 'admin') return <><AppBar title={title} left={<BackButton />} /><Empty title="관리자만 볼 수 있는 화면이에요">왼쪽 아래 DEV에서 관리자 계정으로 바꿔 보세요.</Empty></>
  return <>{children}</>
}
