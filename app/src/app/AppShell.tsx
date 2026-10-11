import { Suspense, useEffect } from 'react'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import { DevPanel } from './DevPanel'
import type { ScreenMeta } from './screens'
import { TabBar } from './TabBar'
import s from './shell.module.css'

export function AppShell() {
  const matches = useMatches()
  const meta = matches.at(-1)?.handle as ScreenMeta | undefined
  const tab = meta?.tab ?? null
  useEffect(() => { document.title = meta && meta.code !== '01' ? `${meta.title} · atelier` : 'atelier' }, [meta])
  return (
    <div className={s.shell}>
      <main className={s.main} data-screen={meta?.code}>
        <Suspense fallback={<div className={s.loading} aria-busy="true" aria-label="불러오는 중" />}>
          <Outlet />
        </Suspense>
      </main>
      {tab && <TabBar active={tab} />}
      {import.meta.env.VITE_USE_MOCK !== 'false' && <DevPanel />}
      <ScrollRestoration />
    </div>
  )
}
