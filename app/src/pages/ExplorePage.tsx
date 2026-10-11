// 01-2 탐색 · 검색
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router'
import type { WorkCategory } from '../entities/types'
import { WorkGrid, WorkGridSkeleton } from '../entities/work/WorkGrid'
import { endpoints } from '../shared/api/endpoints'
import { qk } from '../shared/api/queries'
import { CATEGORY } from '../shared/lib/labels'
import { Icon } from '../shared/ui/Icon'
import { AppBar, Button, Chip, Empty } from '../shared/ui/primitives'
import s from './pages.module.css'

const CATS: ('all' | WorkCategory)[] = ['all', 'painting', 'drawing', 'print', 'photo', 'sculpture', 'ceramic', 'digital']

export function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? 'all'
  const deferredQ = useDeferredValue(q)
  const works = useQuery({
    queryKey: qk.works(deferredQ, category),
    queryFn: () => endpoints.works(deferredQ, category),
    placeholderData: keepPreviousData,
  })

  const update = (next: { q?: string; category?: string }) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === 'all') p.delete(k); else p.set(k, v)
    }
    setParams(p, { replace: true })
  }

  return (
    <>
      <AppBar title="탐색" align="left" />
      <label className={s.search}>
        <Icon name="search" size={16} />
        <input type="search" placeholder="작품, 작가, 재료" value={q} onChange={e => update({ q: e.target.value })} aria-label="검색" />
      </label>
      <div className={s.chips} role="radiogroup" aria-label="작품 유형">
        {CATS.map(c => (
          <button key={c} role="radio" aria-checked={category === c} onClick={() => update({ category: c })}>
            <Chip tone={category === c ? 'sale' : 'line'}>{c === 'all' ? '전체' : CATEGORY[c]}</Chip>
          </button>
        ))}
      </div>
      {works.isPending ? <WorkGridSkeleton /> : works.isError ? (
        <Empty title="불러오지 못했어요" action={<Button size="sm" variant="ghost" onClick={() => works.refetch()}>다시 시도</Button>} />
      ) : works.data.length ? (
        <WorkGrid works={works.data} />
      ) : (
        <Empty title="조건에 맞는 작품이 없어요" action={<Button size="sm" variant="ghost" onClick={() => setParams({}, { replace: true })}>필터 초기화</Button>} />
      )}
    </>
  )
}
